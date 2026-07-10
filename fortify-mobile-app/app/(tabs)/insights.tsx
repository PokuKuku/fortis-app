import { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { addDays, format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AppHeaderBrand } from '@/src/components/navigation/AppHeaderBrand';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { useExercises } from '@/src/hooks/useExercises';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAIStore } from '@/src/store/aiStore';
import { StartedInsightCard } from '@/src/components/insights/StartedInsightCard';
import { EvidenceItem, TrainingInsight, InsightType } from '@/src/types/insights';
import type { InsightChartSeries } from '@/src/types/insightCharts';
import { formatEvidenceDelta, formatEvidenceValue } from '@/src/utils/insightsFormat';
import { isDateOnly, parseDateInput } from '@/src/utils/dateParsing';
import { InsightSparkline } from '@/src/components/insights/InsightSparkline';
import { InsightRadarChart } from '@/src/components/insights/InsightRadarChart';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';
import { getInsightChartMapping, getInsightEvidenceOrder } from '@/src/utils/insightChartMapping';
import { getMuscleDisplayName, normalizeMuscle } from '@/src/utils/muscleTaxonomy';
import { requestAIDataSharingConsent } from '@/src/services/aiConsentService';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { AccentShadowCard } from '@/src/components/ui/AccentShadowCard';
import { posthog } from '@/src/config/posthog';
import { completeNewUserChecklistTask } from '@/src/utils/newUserChecklist';
import { useAuth } from '@/src/contexts/AuthContext';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.md);
const TITLE_PADDING_BOTTOM = scale(Spacing.md);
const SECTION_TITLE_SIZE = moderateScale(26);
const SECTION_GAP = scale(Spacing.lg);
const CARD_PADDING = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const INSIGHT_GAP = scale(Spacing.md);
const EVIDENCE_GAP = scale(Spacing.xs);
const EVIDENCE_TEXT_SIZE = moderateScale(14);
const EVIDENCE_META_SIZE = moderateScale(12);
const SUMMARY_TEXT_SIZE = moderateScale(15);
const SUMMARY_LINE_HEIGHT = moderateScale(22);
const ACTION_BUTTON_HEIGHT = scale(32);
const ACTION_TEXT_SIZE = moderateScale(13);
const LIST_PADDING_BOTTOM = scale(120);
const EMPTY_PADDING_Y = scale(Spacing['3xl']);

type SparklineData = {
  values: number[];
  highlightIndices: number[];
};

type ChartTab = 'progress' | 'volume' | 'frequency';

const isShareableInsight = (_type?: InsightType): boolean => true;

const POSITIVE_INSIGHT_TYPES: InsightType[] = ['CONSISTENCY_STREAK_V1', 'WEEKLY_VOLUME_PR_V1'];
const RISK_INSIGHT_TYPES: InsightType[] = ['FATIGUE_RISK_V1', 'IMBALANCE_FLAG_V1'];
const isWorkoutRecapType = (type: InsightType): boolean => type === 'WORKOUT_RECAP_V1';
const CHART_TABS: ChartTab[] = ['progress', 'volume', 'frequency'];

const formatWeekRange = (anchorDate: string): string => {
  const start = new Date(`${anchorDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    return 'This week';
  }
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = format(start, 'MMM d');
  const endLabel = format(end, sameMonth ? 'd' : 'MMM d');
  return `Week of ${startLabel}–${endLabel}`;
};

const formatChartValue = (value: number, unit?: string): string => {
  const item: EvidenceItem = {
    key: 'chart_value',
    label: 'Chart value',
    value,
    unit: unit ?? '',
  };
  return formatEvidenceValue(item);
};

const formatChartDate = (date: string): string | null => {
  const parsed = parseDateInput(date);
  if (!parsed) {
    return null;
  }
  if (isDateOnly(date)) {
    const start = parsed;
    const end = addDays(parsed, 6);
    return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`;
  }
  return format(parsed, 'MMM d');
};

const resolveUnitLabel = (unit?: string): string | null => {
  if (!unit) return null;
  const normalized = unit.toLowerCase();
  if (normalized === 'e1rm') return 'e1RM';
  if (normalized === 'prs') return 'PRs';
  if (normalized === 'workouts') return 'Workouts';
  if (normalized === 'sessions') return 'Sessions';
  if (normalized === 'sets') return 'Sets';
  return unit;
};

const getReadableTextColors = (isDark: boolean) => ({
  secondary: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.72)',
  tertiary: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.58)',
});

const hasWeekToDateEvidence = (insight: TrainingInsight): boolean => {
  return insight.evidence.some((item) => item.period === 'week_to_date');
};

const resolveImbalanceLabels = (insight: TrainingInsight): Record<ChartTab, string> => {
  const hasPushPull = insight.evidence.some((item) =>
    item.key === 'push_sets' || item.key === 'pull_sets' || item.key === 'push_pull_ratio'
  );
  if (hasPushPull) {
    return {
      volume: 'Push sets',
      frequency: 'Pull sets',
      progress: 'Push/Pull ratio',
    };
  }
  const muscleKey = insight.muscleGroup ? normalizeMuscle(insight.muscleGroup) : null;
  const muscleLabel = muscleKey ? getMuscleDisplayName(muscleKey) : 'Target';
  return {
    volume: `${muscleLabel} sets`,
    frequency: 'Total sets',
    progress: 'Share %',
  };
};

const resolveTabPillLabel = (tab: ChartTab, unit?: string, insight?: TrainingInsight): string => {
  if (insight?.type === 'IMBALANCE_FLAG_V1') {
    return resolveImbalanceLabels(insight)[tab];
  }
  const unitLabel = resolveUnitLabel(unit);
  if (tab === 'progress') {
    if (unitLabel === 'e1RM') return 'e1RM';
    if (unitLabel === 'PRs') return 'PRs';
    return 'Progress';
  }
  if (tab === 'frequency') {
    if (unitLabel === 'Workouts') return 'Workouts';
    if (unitLabel === 'Sessions') return 'Sessions';
    return 'Frequency';
  }
  return 'Volume';
};

const resolveSparklineLabel = (
  tab: ChartTab,
  mapping: ReturnType<typeof getInsightChartMapping>,
  unit: string | undefined,
  insight: TrainingInsight
): string => {
  if (insight.type === 'IMBALANCE_FLAG_V1') {
    return resolveImbalanceLabels(insight)[tab];
  }
  if (insight.type === 'WEEKLY_VERDICT_V1' && hasWeekToDateEvidence(insight)) {
    if (tab === 'progress' && unit?.toLowerCase() === 'prs') return 'PRs (WTD)';
    if (tab === 'volume') return 'Week-to-date volume';
    if (tab === 'frequency') return 'Workouts (WTD)';
  }
  if (tab === mapping.sparklineMetric) {
    return mapping.sparklineLabel;
  }
  const unitLabel = resolveUnitLabel(unit);
  if (tab === 'progress') {
    return unitLabel ? `Progress (${unitLabel})` : 'Progress';
  }
  if (tab === 'frequency') {
    return unitLabel ? `Frequency (${unitLabel})` : 'Frequency';
  }
  return unitLabel ? `Total volume (${unitLabel})` : 'Total volume';
};

const resolveSparkline = (
  insight: TrainingInsight,
  series: InsightChartSeries | null,
  tabOverride?: ChartTab
): SparklineData | null => {
  if (!series) {
    return null;
  }
  if (isWorkoutRecapType(insight.type)) {
    return null;
  }

  const seriesMap: Record<ChartTab, InsightChartSeries['volume']> = {
    progress: series.progress,
    volume: series.volume,
    frequency: series.frequency,
  };
  const preferredSeries = tabOverride && seriesMap[tabOverride].length > 0
    ? seriesMap[tabOverride]
    : null;

  if (insight.type === 'LIFT_STALL_RISK_V1') {
    const values = (preferredSeries ?? (series.progress.length > 0 ? series.progress : series.volume))
      .map((point) => point.value);
    if (values.length === 0) return null;
    const startIndex = Math.max(values.length - 3, 0);
    const highlightIndices = values.slice(startIndex).map((_, index) => startIndex + index);
    return { values, highlightIndices };
  }

  const mapping = getInsightChartMapping(insight.type);
  const resolvedSeries = preferredSeries
    ?? (seriesMap[mapping.sparklineMetric].length > 0
      ? seriesMap[mapping.sparklineMetric]
      : series.volume.length > 0
      ? series.volume
      : series.frequency);
  const values = resolvedSeries.map((point) => point.value);
  if (values.length === 0) return null;
  const anchorIndex = resolvedSeries.findIndex((point) => point.date === insight.anchorDate);
  return {
    values,
    highlightIndices: anchorIndex >= 0 ? [anchorIndex] : [],
  };
};

const resolveEvidence = (insight: TrainingInsight) => {
  const itemsByKey = new Map(insight.evidence.map((item) => [item.key, item]));
  const order = getInsightEvidenceOrder(insight.type);
  if (order.length === 0) {
    return insight.evidence;
  }
  const ordered = order.map((key) => itemsByKey.get(key)).filter(Boolean) as TrainingInsight['evidence'];
  const shouldHideVolume = insight.type === 'WEEKLY_VERDICT_V1';
  const filtered = ordered.filter((item) => {
    if (
      shouldHideVolume &&
      item.key === 'volume_load' &&
      item.unit !== '%' &&
      item.compareValue === undefined &&
      item.deltaValue === undefined
    ) {
      return false;
    }
    return true;
  });
  return filtered.length > 0 ? filtered : insight.evidence;
};

function InsightCard({
  insight,
  onWhyPress,
  onDismiss,
  onOpenChart,
  onShare,
}: {
  insight: TrainingInsight;
  onWhyPress: (insight: TrainingInsight) => void;
  onDismiss: (insight: TrainingInsight) => void;
  onOpenChart: (insight: TrainingInsight) => void;
  onShare: (insight: TrainingInsight) => void;
}) {
  const { colors, isDark } = useTheme();
  const readableText = getReadableTextColors(isDark);
  const { series } = useInsightChartSeries(insight);
  const seriesMap = useMemo(() => {
    if (!series) return null;
    return {
      progress: series.progress,
      volume: series.volume,
      frequency: series.frequency,
    } as const;
  }, [series]);
  const mapping = useMemo(() => getInsightChartMapping(insight.type), [insight.type]);
  const defaultTab = useMemo(() => {
    const preferred = mapping.sparklineMetric;
    if (seriesMap?.[preferred]?.length) return preferred;
    const fallback = CHART_TABS.find((tab) => (seriesMap?.[tab]?.length ?? 0) > 0);
    return fallback ?? preferred;
  }, [mapping.sparklineMetric, seriesMap]);
  const [activeTab, setActiveTab] = useState<ChartTab>(defaultTab);

  useEffect(() => {
    if (!seriesMap) {
      if (activeTab !== defaultTab) {
        setActiveTab(defaultTab);
      }
      return;
    }
    if (seriesMap[activeTab]?.length) return;
    if (activeTab !== defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [activeTab, defaultTab, seriesMap]);

  const sparkline = useMemo(
    () => resolveSparkline(insight, series, activeTab),
    [activeTab, insight, series]
  );
  const isWorkoutRecap = isWorkoutRecapType(insight.type);
  const recapBreakdown = series?.breakdown ?? [];
  const activeUnit = series?.units?.[activeTab];
  const sparklineLabel = resolveSparklineLabel(activeTab, mapping, activeUnit, insight);
  const evidenceItems = useMemo(() => resolveEvidence(insight).slice(0, 4), [insight]);
  const isWeeklyVerdict = insight.type === 'WEEKLY_VERDICT_V1';
  const isImbalance = insight.type === 'IMBALANCE_FLAG_V1';
  const rangeLabel = formatWeekRange(insight.anchorDate);
  const activeSeries = seriesMap?.[activeTab] ?? [];
  const latestPoint = activeSeries.length > 0 ? activeSeries[activeSeries.length - 1] : null;
  const latestValue = latestPoint
    ? formatChartValue(latestPoint.value, activeUnit)
    : null;
  const latestMeta = latestPoint ? formatChartDate(latestPoint.date) : null;
  const showTabs = (CHART_TABS.filter((tab) => (seriesMap?.[tab]?.length ?? 0) > 0).length) > 1;
  const sparklineStroke = colors.accent;
  const sparklineVariant = isImbalance
    ? (activeTab === 'progress' ? 'line' : 'bars')
    : activeTab === 'frequency'
    ? 'bars'
    : activeTab === 'volume'
    ? 'area'
    : 'line';
  const sparklineFill = sparklineVariant === 'area'
    ? (activeTab === 'volume' ? colors.successOverlay : colors.accentOverlay)
    : undefined;
  const sparklineFillOpacity = sparklineVariant === 'area' ? 1 : undefined;

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };
  const summaryTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };
  const sparklineTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };
  const pillTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <View style={[styles.cardBase, styles.insightCard, cardTheme]}>
      <View style={styles.insightHeader}>
        <View style={styles.insightHeaderRow}>
          <Text style={[styles.insightRange, { color: readableText.tertiary }]}>
            {rangeLabel}
          </Text>
          <TouchableOpacity
            onPress={() => onDismiss(insight)}
            hitSlop={8}
            style={styles.dismissButton}
          >
            <Text style={[styles.dismissButtonText, { color: readableText.tertiary }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
        {isWeeklyVerdict && (
          <Text style={[styles.weeklyInsightLabel, { color: colors.accent }]}>
            Weekly update
          </Text>
        )}
        <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>{insight.title}</Text>
      </View>

      {!isWorkoutRecap && (
        <View style={[styles.summaryPanel, summaryTheme]}>
          <Text style={[styles.insightSummary, { color: readableText.secondary }]}>
            {insight.summary}
          </Text>
        </View>
      )}

      {isWorkoutRecap ? (
        <View style={[styles.sparklineShell, sparklineTheme]}>
          <View style={styles.sparklineHeaderRow}>
            <Text
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
              style={[styles.sparklineLabel, { color: readableText.tertiary }]}
            >
              Muscle set profile
            </Text>
          </View>
          <View style={styles.recapRadarShell}>
            <InsightRadarChart data={recapBreakdown} compact />
          </View>
        </View>
      ) : sparkline ? (
        <View style={[styles.sparklineShell, sparklineTheme]}>
          <View style={styles.sparklineHeaderRow}>
            <Text
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
              style={[styles.sparklineLabel, { color: readableText.tertiary }]}
            >
              {sparklineLabel}
            </Text>
            {latestValue && (
              <View style={[styles.sparklineValuePill, pillTheme]}>
                <Text
                  allowFontScaling={false}
                  maxFontSizeMultiplier={1}
                  style={[styles.sparklineValueText, { color: colors.textPrimary }]}
                >
                  {latestValue}
                </Text>
                {latestMeta && (
                  <Text
                    allowFontScaling={false}
                    maxFontSizeMultiplier={1}
                    style={[styles.sparklineValueMeta, { color: readableText.tertiary }]}
                  >
                    {latestMeta}
                  </Text>
                )}
              </View>
            )}
          </View>

          {showTabs && (
            isImbalance ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.sparklineTabs, styles.sparklineTabsScrollable]}
              >
                {CHART_TABS.map((tab) => {
                  const hasData = (seriesMap?.[tab]?.length ?? 0) > 0;
                  const isActive = tab === activeTab;
                  const tabLabel = resolveTabPillLabel(tab, series?.units?.[tab], insight);
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      disabled={!hasData}
                      style={[
                        styles.sparklineTab,
                        styles.sparklineTabScrollable,
                        pillTheme,
                        isActive && {
                          backgroundColor: colors.accentOverlay,
                          borderColor: colors.accent,
                        },
                        !hasData && styles.sparklineTabDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        allowFontScaling={false}
                        maxFontSizeMultiplier={1}
                        style={[
                          styles.sparklineTabText,
                          { color: isActive ? colors.accent : readableText.secondary },
                        ]}
                      >
                        {tabLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.sparklineTabs}>
                {CHART_TABS.map((tab) => {
                  const hasData = (seriesMap?.[tab]?.length ?? 0) > 0;
                  const isActive = tab === activeTab;
                  const tabLabel = resolveTabPillLabel(tab, series?.units?.[tab], insight);
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      disabled={!hasData}
                      style={[
                        styles.sparklineTab,
                        pillTheme,
                        isActive && {
                          backgroundColor: colors.accentOverlay,
                          borderColor: colors.accent,
                        },
                        !hasData && styles.sparklineTabDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        allowFontScaling={false}
                        maxFontSizeMultiplier={1}
                        style={[
                          styles.sparklineTabText,
                          { color: isActive ? colors.accent : readableText.secondary },
                        ]}
                      >
                        {tabLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}

          <View style={styles.sparklineChart}>
            <InsightSparkline
              values={sparkline.values}
              highlightIndices={sparkline.highlightIndices}
              stroke={sparklineStroke}
              variant={sparklineVariant}
              fill={sparklineFill}
              fillOpacity={sparklineFillOpacity}
              height={44}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.evidenceList}>
        {evidenceItems.map((item) => {
          const delta = formatEvidenceDelta(item);
          const deltaColor = delta?.trend === 'up'
            ? Colors.success
            : delta?.trend === 'down'
            ? Colors.error
            : readableText.tertiary;

          return (
            <View key={item.key} style={styles.evidenceRow}>
              <Text style={[styles.evidenceLabel, { color: readableText.secondary }]}>
                {item.label}
              </Text>
              <View style={styles.evidenceValue}>
                <Text style={[styles.evidenceValueText, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(item)}
                </Text>
                {delta && (
                  <Text style={[styles.evidenceDelta, { color: deltaColor }]}>
                    ({delta.text})
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.insightActions}>
        <TouchableOpacity
          style={[
            styles.whyButton,
            {
              backgroundColor: colors.accentOverlay,
              borderColor: colors.accent,
            },
          ]}
          onPress={() => onWhyPress(insight)}
          activeOpacity={0.8}
        >
          <Text style={[styles.whyButtonText, { color: colors.accent }]}>Ask Fortify</Text>
        </TouchableOpacity>
        {isShareableInsight(insight.type) && (
          <TouchableOpacity
            style={[
              styles.shareButton,
              { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
            ]}
            onPress={() => onShare(insight)}
            activeOpacity={0.8}
          >
            <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.viewChartButton, { borderColor: colors.border }, styles.viewChartRight]}
          onPress={() => onOpenChart(insight)}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewChartText, { color: readableText.secondary }]}>View chart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WatchlistRow({
  insight,
  exerciseName,
  onWhyPress,
  onDismiss,
  onOpenChart,
  onShare,
}: {
  insight: TrainingInsight;
  exerciseName: string;
  onWhyPress: (insight: TrainingInsight) => void;
  onDismiss: (insight: TrainingInsight) => void;
  onOpenChart: (insight: TrainingInsight) => void;
  onShare: (insight: TrainingInsight) => void;
}) {
  const { colors, isDark } = useTheme();
  const readableText = getReadableTextColors(isDark);
  const { series } = useInsightChartSeries(insight);
  const sparkline = useMemo(() => resolveSparkline(insight, series), [insight, series]);
  const sparklineLabel = useMemo(() => getInsightChartMapping(insight.type).sparklineLabel, [insight.type]);
  const sparklineTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const statusColor = insight.severity === 'high' ? Colors.error : Colors.warning;
  const e1rmItem = insight.evidence.find((item) => item.key === 'best_e1rm');
  const volumeItem = insight.evidence.find((item) => item.key === 'volume_load');
  const exposuresItem = insight.evidence.find((item) => item.key === 'exposures');
  const e1rmDelta = e1rmItem
    ? (e1rmItem.deltaValue ?? (e1rmItem.compareValue !== undefined ? e1rmItem.value - e1rmItem.compareValue : 0))
    : 0;
  const e1rmDescriptor =
    Math.abs(e1rmDelta) <= 1 ? 'e1RM flat' : e1rmDelta < 0 ? 'e1RM down' : 'e1RM up';
  const exposuresText = exposuresItem ? `${Math.round(exposuresItem.value)} sessions` : 'recent sessions';
  const volumeDelta = volumeItem ? formatEvidenceDelta(volumeItem) : null;
  const volumeDeltaText = volumeDelta?.text.replace(/^[-+]/, '');
  const volumeDescriptor = volumeDelta
    ? `volume ${volumeDelta.trend === 'up' ? 'up' : volumeDelta.trend === 'down' ? 'down' : 'flat'} ${volumeDeltaText}`
    : 'volume steady';
  const suggestionPayload = insight.recommendation?.[0]?.payload as { text?: string } | undefined;
  const suggestionText = typeof suggestionPayload?.text === 'string' ? suggestionPayload.text : null;

  return (
    <View style={styles.watchlistRow}>
      <View style={styles.watchlistHeaderRow}>
        <View style={styles.watchlistTitleBlock}>
          <Text
            style={[styles.watchlistName, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {exerciseName}
          </Text>
          <Text style={[styles.watchlistStatus, { color: statusColor }]}>
            Plateau risk
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDismiss(insight)}
          style={styles.watchlistDismissButton}
          activeOpacity={0.8}
          hitSlop={8}
        >
          <Text style={[styles.watchlistDismiss, { color: readableText.tertiary }]}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
      {sparkline && (
        <View style={[styles.watchlistSparklineCard, sparklineTheme]}>
          <Text
            allowFontScaling={false}
            maxFontSizeMultiplier={1}
            style={[styles.sparklineLabel, { color: readableText.tertiary }]}
          >
            {sparklineLabel}
          </Text>
          <InsightSparkline
            values={sparkline.values}
            highlightIndices={sparkline.highlightIndices}
            stroke={colors.accent}
            height={42}
          />
        </View>
      )}
      <View style={styles.watchlistInfo}>
        <Text style={[styles.watchlistReason, { color: readableText.secondary }]}>
          {e1rmDescriptor} ({exposuresText}); {volumeDescriptor}
        </Text>
        {suggestionText && (
          <Text style={[styles.watchlistSuggestion, { color: readableText.secondary }]}>
            Suggested: {suggestionText}
          </Text>
        )}
        <View style={styles.watchlistEvidence}>
          {e1rmItem && (() => {
            const e1rmDelta = formatEvidenceDelta(e1rmItem);
            const e1rmDeltaColor = e1rmDelta?.trend === 'up'
              ? Colors.success
              : e1rmDelta?.trend === 'down'
              ? Colors.error
              : readableText.secondary;
            return (
              <View style={styles.watchlistEvidenceRow}>
                <Text style={[styles.watchlistEvidenceLabel, { color: readableText.tertiary }]}>
                  {e1rmItem.label}
                </Text>
                <Text style={[styles.watchlistEvidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(e1rmItem)}
                  {e1rmDelta?.text && (
                    <Text style={{ color: e1rmDeltaColor }}>{` (${e1rmDelta.text})`}</Text>
                  )}
                </Text>
              </View>
            );
          })()}
          {volumeItem && (() => {
            const volumeDelta = formatEvidenceDelta(volumeItem);
            const volumeDeltaColor = volumeDelta?.trend === 'up'
              ? Colors.success
              : volumeDelta?.trend === 'down'
              ? Colors.error
              : readableText.secondary;
            return (
              <View style={styles.watchlistEvidenceRow}>
                <Text style={[styles.watchlistEvidenceLabel, { color: readableText.tertiary }]}>
                  {volumeItem.label}
                </Text>
                <Text style={[styles.watchlistEvidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(volumeItem)}
                  {volumeDelta?.text && (
                    <Text style={{ color: volumeDeltaColor }}>{` (${volumeDelta.text})`}</Text>
                  )}
                </Text>
              </View>
            );
          })()}
        </View>
        <View style={styles.watchlistActionsRow}>
          <TouchableOpacity
            style={[
              styles.whyButton,
              {
                backgroundColor: colors.accentOverlay,
                borderColor: colors.accent,
              },
            ]}
            onPress={() => onWhyPress(insight)}
            activeOpacity={0.8}
          >
            <Text style={[styles.whyButtonText, { color: colors.accent }]}>Ask Fortify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.shareButton,
              { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
            ]}
            onPress={() => onShare(insight)}
            activeOpacity={0.8}
          >
            <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewChartButton, { borderColor: colors.border }, styles.watchlistChartButton]}
            onPress={() => onOpenChart(insight)}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewChartText, { color: readableText.secondary }]}>View chart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const readableText = getReadableTextColors(isDark);
  const { insights, isLoading, isRefreshing, refresh, dismissInsight, snoozeInsightType } = useTrainingInsights();
  const { exercises } = useExercises();
  const sendMessage = useAIStore((state) => state.sendMessage);
  const { runProFeature } = useProFeatureGate();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const askFortifyInFlightRef = useRef(false);

  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach((exercise) => {
      map.set(exercise.id, exercise.name);
      if (exercise.slug) {
        map.set(exercise.slug, exercise.name);
      }
      if (exercise.remoteId) {
        map.set(exercise.remoteId, exercise.name);
      }
    });
    return map;
  }, [exercises]);

  const weeklyVerdict = useMemo(
    () => insights.find((insight) => insight.type === 'WEEKLY_VERDICT_V1'),
    [insights]
  );

  const workoutRecap = useMemo(() => {
    const recaps = insights.filter((insight) => isWorkoutRecapType(insight.type));
    return recaps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  }, [insights]);

  const stallRisks = useMemo(
    () => insights.filter((insight) => insight.type === 'LIFT_STALL_RISK_V1'),
    [insights]
  );

  const riskInsights = useMemo(() => {
    const typePriority: Record<string, number> = {
      FATIGUE_RISK_V1: 0,
      IMBALANCE_FLAG_V1: 1,
    };
    const severityRank: Record<TrainingInsight['severity'], number> = {
      high: 2,
      medium: 1,
      low: 0,
    };
    return insights
      .filter((insight) => RISK_INSIGHT_TYPES.includes(insight.type))
      .sort((a, b) => {
        const bySeverity = severityRank[b.severity] - severityRank[a.severity];
        if (bySeverity !== 0) return bySeverity;
        const byType = (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
        if (byType !== 0) return byType;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [insights]);

  const positiveInsights = useMemo(() => {
    return insights
      .filter((insight) => POSITIVE_INSIGHT_TYPES.includes(insight.type))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [insights]);

  const watchlistItems = useMemo(() => {
    const severityRank: Record<TrainingInsight['severity'], number> = {
      high: 2,
      medium: 1,
      low: 0,
    };
    const getExposureCount = (insight: TrainingInsight) => {
      const evidence = insight.evidence.find((item) => item.key === 'exposures');
      return evidence ? Number(evidence.value) : 0;
    };
    return [...stallRisks]
      .filter((insight) => Boolean(insight.exerciseId))
      .sort((a, b) => {
        const bySeverity = severityRank[b.severity] - severityRank[a.severity];
        if (bySeverity !== 0) return bySeverity;
        const byExposure = getExposureCount(b) - getExposureCount(a);
        if (byExposure !== 0) return byExposure;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 5);
  }, [stallRisks]);

  const watchlistExerciseIds = useMemo(
    () => watchlistItems.map((insight) => insight.exerciseId).filter(Boolean) as string[],
    [watchlistItems]
  );
  const watchlistExercises = useExercisesWithMuscles(watchlistExerciseIds);
  const watchlistNameById = useMemo(() => {
    const map = new Map<string, string>();
    watchlistExercises.forEach((exercise) => {
      map.set(exercise.id, exercise.name);
      if (exercise.slug) {
        map.set(exercise.slug, exercise.name);
      }
      if (exercise.remoteId) {
        map.set(exercise.remoteId, exercise.name);
      }
    });
    return map;
  }, [watchlistExercises]);

  const watchlistSummary = useMemo(
    () => stallRisks.find((insight) => insight.subjectKey === 'global'),
    [stallRisks]
  );

  const eligibleCount = useMemo(() => {
    const item = watchlistSummary?.evidence.find((evidence) => evidence.key === 'eligible_exercises');
    return item ? Number(item.value) : 0;
  }, [watchlistSummary]);

  const hasPositiveInsight = positiveInsights.length > 0;
  const watchlistVisible = !(
    hasPositiveInsight &&
    watchlistItems.length === 0 &&
    Boolean(watchlistSummary)
  ) && (watchlistItems.length > 0 || Boolean(watchlistSummary));
  const baseCount = (weeklyVerdict ? 1 : 0) + (workoutRecap ? 1 : 0);
  const availableSlots = Math.max(0, 3 - baseCount - (watchlistVisible ? 1 : 0));
  const riskCandidates = workoutRecap
    ? riskInsights.filter((insight) => insight.severity === 'high')
    : riskInsights;
  const visibleRisks = riskCandidates.slice(0, availableSlots);
  const remainingSlots = Math.max(0, availableSlots - visibleRisks.length);
  const visiblePositives = remainingSlots > 0 ? positiveInsights.slice(0, 1) : [];

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const openInsightChat = async (insight: TrainingInsight, prompt: string) => {
    if (askFortifyInFlightRef.current) return;
    askFortifyInFlightRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    try {
      await runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.insightAskFortify,
          params: {
            source: 'insights',
            action: 'ask_fortify',
            insightId: insight.id,
            insightType: insight.type,
          },
        },
        async () => {
          const allowed = await requestAIDataSharingConsent();
          if (!allowed) {
            askFortifyInFlightRef.current = false;
            return false;
          }
          posthog.capture('ask_fortify_used');
          await completeNewUserChecklistTask('ask_fortify_insight', user?.id ?? null);
          void sendMessage('FORTIS_ANALYST', prompt, { insightId: insight.id });
          router.push({ pathname: '/ai/chat', params: { mode: 'chat' } });
        },
      );
    } catch (error) {
      askFortifyInFlightRef.current = false;
      throw error;
    }
  };

  const handleInsightWhyPress = (insight: TrainingInsight) => {
    const prompt =
      insight.type === 'FATIGUE_RISK_V1'
        ? 'Explain this fatigue risk and suggest what I should adjust next week.'
        : insight.type === 'IMBALANCE_FLAG_V1'
        ? 'Explain this imbalance flag and suggest what I should adjust next week.'
        : 'Explain this insight and suggest what I should do next week.';
    void openInsightChat(insight, prompt);
  };

  const handleOpenChart = (insight: TrainingInsight, tabOverride?: ChartTab) => {
    if (tabOverride) {
      router.push({
        pathname: '/insights/[id]',
        params: { id: insight.id, tab: tabOverride },
      });
      return;
    }
    router.push({ pathname: '/insights/[id]', params: { id: insight.id } });
  };

  const handleWatchlistPress = (insight: TrainingInsight) => {
    const exerciseName = insight.exerciseId
      ? exerciseNameById.get(insight.exerciseId) ?? 'this lift'
      : 'this lift';
    openInsightChat(
      insight,
      `Explain why ${exerciseName} is at stall risk and suggest adjustments for the next two weeks.`
    );
  };

  const handleShareInsight = (insight: TrainingInsight) => {
    router.push({ pathname: '/insights/share', params: { id: insight.id } });
  };

  const handleDismissInsight = async (insight: TrainingInsight) => {
    await dismissInsight(insight.id);
  };

  const handleSnoozeWatchlist = async () => {
    await snoozeInsightType('LIFT_STALL_RISK_V1', 14);
  };

  const handleOpenLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/exercises');
  };

  const completedSessions = useWorkoutStore((s) => s.completedSessions);
  const lastCompletedKeyRef = useRef<string | null>(null);
  const pendingRefreshRef = useRef(false);
  const latestCompletedKey = useMemo(() => {
    if (completedSessions.length === 0) return null;
    const latest = completedSessions[0];
    const timestamp = latest.completedAt ?? latest.startedAt;
    const millis = timestamp ? timestamp.getTime() : 0;
    return `${latest.localId}:${millis}`;
  }, [completedSessions]);
  const showStartedCard = completedSessions.length === 0;

  useEffect(() => {
    if (!latestCompletedKey) return;
    if (latestCompletedKey === lastCompletedKeyRef.current) return;
    lastCompletedKeyRef.current = latestCompletedKey;
    if (isFocused) {
      refresh();
    } else {
      pendingRefreshRef.current = true;
    }
  }, [isFocused, latestCompletedKey, refresh]);

  useEffect(() => {
    if (!isFocused) return;
    if (!pendingRefreshRef.current) return;
    pendingRefreshRef.current = false;
    refresh();
  }, [isFocused, refresh]);

  const hasInsights =
    showStartedCard ||
    Boolean(weeklyVerdict) ||
    Boolean(workoutRecap) ||
    watchlistVisible ||
    visibleRisks.length > 0 ||
    visiblePositives.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={readableText.secondary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <AppHeaderBrand style={styles.header} />

          <View style={styles.titleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Insights</Text>
          </View>

          <AccentShadowCard radius={CARD_RADIUS}>
            <TouchableOpacity
              style={[styles.cardBase, styles.libraryCard, cardTheme]}
              onPress={handleOpenLibrary}
              activeOpacity={0.8}
            >
              <View style={styles.libraryRow}>
                <View
                  style={[
                    styles.libraryIcon,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
                  ]}
                >
                  <MagnifyingGlassIcon color={readableText.secondary} size={18} strokeWidth={2} />
                </View>
                <View style={styles.libraryText}>
                  <Text style={[styles.libraryTitle, { color: colors.textPrimary }]}>
                    Exercise Library
                  </Text>
                  <Text style={[styles.librarySubtitle, { color: readableText.secondary }]}>
                    Search and browse exercises
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </AccentShadowCard>

          {isLoading && !hasInsights ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={readableText.secondary} />
              <Text style={[styles.loadingText, { color: readableText.secondary }]}>
                Loading insights...
              </Text>
            </View>
          ) : !hasInsights ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: readableText.secondary }]}>
                No insights yet. Log a completed workout to generate your weekly insight.
              </Text>
              <GlassButton style={styles.refreshButton} onPress={refresh}>
                <Text style={[styles.whyButtonText, { color: colors.accent }]}>Refresh</Text>
              </GlassButton>
            </View>
          ) : (
            <View style={styles.insightsList}>
              {showStartedCard && <StartedInsightCard />}

              {workoutRecap && (
                <InsightCard
                  insight={workoutRecap}
                  onWhyPress={handleInsightWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                  onShare={handleShareInsight}
                />
              )}

              {weeklyVerdict && (
                <InsightCard
                  insight={weeklyVerdict}
                  onWhyPress={handleInsightWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                  onShare={handleShareInsight}
                />
              )}

              {watchlistVisible && (
                <View style={[styles.cardBase, styles.watchlistCard, cardTheme]}>
                  <View style={styles.watchlistHeader}>
                    <View>
                      <Text style={[styles.watchlistTitle, { color: colors.textPrimary }]}>
                        Watchlist
                      </Text>
                      <Text style={[styles.watchlistSubtitle, { color: readableText.tertiary }]}>
                        Lifts to keep an eye on
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleSnoozeWatchlist}
                      style={[styles.snoozeButton, { borderColor: colors.border }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.snoozeButtonText, { color: readableText.secondary }]}>
                        Snooze 14d
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {watchlistItems.length === 0 ? (
                    <Text style={[styles.watchlistEmpty, { color: readableText.secondary }]}>
                      {eligibleCount > 0
                        ? 'All clear this week. Your top lifts are steady.'
                        : 'Not enough data yet. Repeat a lift 3 times to unlock stall alerts.'}
                    </Text>
                  ) : (
                    <View style={styles.watchlistList}>
                      {watchlistItems.map((insight) => {
                        const exerciseName = insight.exerciseId
                          ? watchlistNameById.get(insight.exerciseId) ??
                            exerciseNameById.get(insight.exerciseId) ??
                            'Unknown exercise'
                          : 'Unknown exercise';

                        return (
                          <WatchlistRow
                            key={insight.id}
                            insight={insight}
                            exerciseName={exerciseName}
                            onWhyPress={handleWatchlistPress}
                            onDismiss={handleDismissInsight}
                            onOpenChart={(selected) => handleOpenChart(selected, 'progress')}
                            onShare={handleShareInsight}
                          />
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {visibleRisks.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onWhyPress={handleInsightWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                  onShare={handleShareInsight}
                />
              ))}

              {visiblePositives.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onWhyPress={handleInsightWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                  onShare={handleShareInsight}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingBottom: TITLE_PADDING_BOTTOM,
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_SIZE,
    fontFamily: 'BankGothicBT-Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: LIST_PADDING_BOTTOM,
    gap: SECTION_GAP,
  },
  cardBase: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: CARD_PADDING,
  },
  libraryCard: {
    borderRadius: CARD_RADIUS,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.md),
  },
  libraryIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryText: {
    flex: 1,
  },
  libraryTitle: {
    ...Typography.body,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
  },
  librarySubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  insightsList: {
    gap: INSIGHT_GAP,
  },
  watchlistCard: {
    borderRadius: CARD_RADIUS,
  },
  watchlistHeader: {
    marginBottom: scale(Spacing.sm),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchlistTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
    letterSpacing: 0.4,
  },
  watchlistSubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    marginTop: scale(Spacing.xs),
  },
  watchlistEmpty: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  snoozeButton: {
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
  },
  snoozeButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  watchlistList: {
    gap: scale(Spacing.sm),
  },
  watchlistRow: {
    paddingVertical: scale(Spacing.sm),
    gap: scale(Spacing.sm),
  },
  watchlistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  watchlistTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: scale(Spacing.sm),
  },
  watchlistInfo: {
    gap: scale(Spacing.xs),
  },
  watchlistName: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(20),
    flexShrink: 1,
  },
  watchlistStatus: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  watchlistReason: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  watchlistSuggestion: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  watchlistEvidence: {
    gap: scale(2),
    marginTop: scale(Spacing.xs),
  },
  watchlistEvidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(Spacing.xs),
  },
  watchlistEvidenceLabel: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    flex: 1,
  },
  watchlistEvidenceValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  watchlistSparklineCard: {
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.sm),
    gap: scale(Spacing.xs),
  },
  watchlistActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
    marginTop: scale(Spacing.sm),
  },
  watchlistChartButton: {
    marginLeft: 'auto',
  },
  watchlistDismissButton: {
    flexShrink: 0,
    paddingHorizontal: scale(Spacing.xs),
    paddingVertical: scale(2),
  },
  watchlistDismiss: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  insightCard: {
    borderRadius: CARD_RADIUS,
  },
  insightHeader: {
    marginBottom: scale(Spacing.xs),
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(Spacing.xs),
  },
  insightRange: {
    ...Typography.caption,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
  dismissButton: {
    paddingHorizontal: scale(Spacing.xs),
    paddingVertical: scale(2),
  },
  dismissButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  insightTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
    letterSpacing: 0.4,
  },
  weeklyInsightLabel: {
    fontSize: moderateScale(12),
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: scale(Spacing.xs),
  },
  summaryPanel: {
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.sm),
    marginBottom: scale(Spacing.md),
  },
  insightSummary: {
    fontSize: SUMMARY_TEXT_SIZE,
    lineHeight: SUMMARY_LINE_HEIGHT,
  },
  sparklineShell: {
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(Spacing.sm),
    marginBottom: scale(Spacing.md),
    gap: scale(Spacing.sm),
  },
  sparklineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(Spacing.sm),
  },
  sparklineLabel: {
    fontSize: moderateScale(11),
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sparklineValuePill: {
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
    alignItems: 'center',
  },
  sparklineValueText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    textAlign: 'center',
  },
  sparklineValueMeta: {
    fontSize: moderateScale(11),
    marginTop: scale(2),
    textAlign: 'center',
  },
  sparklineTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  sparklineTabsScrollable: {
    gap: scale(Spacing.xs),
  },
  sparklineTab: {
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklineTabScrollable: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  sparklineTabDisabled: {
    opacity: 0.4,
  },
  sparklineTabText: {
    fontSize: moderateScale(11),
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sparklineChart: {
    paddingHorizontal: scale(Spacing.xs),
    paddingBottom: scale(Spacing.xs),
  },
  recapRadarShell: {
    paddingHorizontal: scale(Spacing.xs),
    paddingBottom: scale(Spacing.xs),
  },
  evidenceList: {
    gap: EVIDENCE_GAP,
    marginBottom: scale(Spacing.md),
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  evidenceLabel: {
    fontSize: EVIDENCE_TEXT_SIZE,
    lineHeight: moderateScale(20),
    flex: 1,
  },
  evidenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  evidenceValueText: {
    fontSize: EVIDENCE_TEXT_SIZE,
    lineHeight: moderateScale(20),
  },
  evidenceDelta: {
    fontSize: EVIDENCE_META_SIZE,
    lineHeight: moderateScale(16),
  },
  whyButton: {
    alignSelf: 'flex-start',
    height: ACTION_BUTTON_HEIGHT,
    minWidth: scale(72),
    paddingHorizontal: scale(Spacing.md),
    borderWidth: 1,
    borderRadius: ACTION_BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyButtonText: {
    fontSize: ACTION_TEXT_SIZE,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  viewChartButton: {
    height: ACTION_BUTTON_HEIGHT,
    paddingHorizontal: scale(Spacing.md),
    borderWidth: 1,
    borderRadius: ACTION_BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewChartRight: {
    marginLeft: 'auto',
  },
  viewChartText: {
    fontSize: ACTION_TEXT_SIZE,
    fontWeight: '600',
  },
  shareButton: {
    height: ACTION_BUTTON_HEIGHT,
    paddingHorizontal: scale(Spacing.md),
    borderWidth: 1,
    borderRadius: ACTION_BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: ACTION_TEXT_SIZE,
    fontWeight: '600',
  },
  loadingState: {
    paddingVertical: scale(Spacing.xl),
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  loadingText: {
    fontSize: moderateScale(14),
  },
  emptyState: {
    paddingVertical: EMPTY_PADDING_Y,
    alignItems: 'center',
    gap: scale(Spacing.md),
  },
  emptyText: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    maxWidth: scale(260),
  },
  refreshButton: {
    alignSelf: 'center',
    height: ACTION_BUTTON_HEIGHT,
    paddingHorizontal: scale(Spacing.lg),
  },
});
