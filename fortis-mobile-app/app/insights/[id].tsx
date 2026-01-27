import { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { addDays, format } from 'date-fns';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { useAIStore } from '@/src/store/aiStore';
import { submitInsightFeedback } from '@/src/services/insightsService';
import { useAnalytics } from '@/src/services/analyticsService';
import { InsightLineChart } from '@/src/components/insights/InsightLineChart';
import { InsightBarChart } from '@/src/components/insights/InsightBarChart';
import { SegmentedControl } from '@/src/components/insights/SegmentedControl';
import type { EvidenceItem, TrainingInsight, InsightFeedbackRating } from '@/src/types/insights';
import type { InsightChartTab } from '@/src/types/insightCharts';
import { formatEvidenceDelta, formatEvidenceValue } from '@/src/utils/insightsFormat';
import { isDateOnly, parseDateInput } from '@/src/utils/dateParsing';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';
import { getInsightChartMapping, getInsightEvidenceOrder } from '@/src/utils/insightChartMapping';
import { getMuscleDisplayName, normalizeMuscle } from '@/src/utils/muscleTaxonomy';

const HEADER_PADDING = scale(Spacing.lg);
const SECTION_GAP = scale(Spacing.lg);
const CARD_PADDING = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);

const getDefaultTab = (insight: TrainingInsight): InsightChartTab => {
  return getInsightChartMapping(insight.type).defaultTab;
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

const resolveImbalanceLabels = (insight: TrainingInsight): Record<InsightChartTab, string> => {
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

const resolveTabLabel = (
  tab: InsightChartTab,
  unit?: string,
  insight?: TrainingInsight
): string => {
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

const resolveChartTitle = (
  tab: InsightChartTab,
  mapping: ReturnType<typeof getInsightChartMapping>,
  unit: string | undefined,
  insight: TrainingInsight
): string => {
  if (insight.type === 'IMBALANCE_FLAG_V1') {
    return resolveImbalanceLabels(insight)[tab];
  }
  if (tab === 'progress' && unit?.toLowerCase() === 'prs') {
    return 'PRs per week';
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

const formatChartValue = (value: number, unit?: string): string => {
  const item: EvidenceItem = {
    key: 'chart_value',
    label: 'Chart value',
    value,
    unit: unit ?? '',
  };
  return formatEvidenceValue(item);
};

const formatDateLabel = (value: string): string => {
  const date = parseDateInput(value);
  if (!date) {
    return value;
  }
  const displayDate = isDateOnly(value) ? addDays(date, 6) : date;
  return format(displayDate, 'MMM d');
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

export default function InsightDetailScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { id, tab } = useLocalSearchParams<{ id?: string; tab?: string }>();
  const { insights } = useTrainingInsights();
  const { trackInsightFeedbackSubmitted, trackChatOpenedFromInsight } = useAnalytics();
  const sendMessage = useAIStore((state) => state.sendMessage);

  const insight = useMemo(
    () => insights.find((item) => item.id === id),
    [id, insights]
  );

  const { series, isLoading } = useInsightChartSeries(insight ?? null);
  const initialTab = tab === 'progress' || tab === 'volume' || tab === 'frequency' ? tab : null;
  const [selectedTab, setSelectedTab] = useState<InsightChartTab>(
    (initialTab as InsightChartTab | null) ?? (insight ? getDefaultTab(insight) : 'volume')
  );
  const [feedbackStatus, setFeedbackStatus] = useState<InsightFeedbackRating | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!insight) return;
    setSelectedTab((initialTab as InsightChartTab | null) ?? getDefaultTab(insight));
  }, [initialTab, insight]);

  useEffect(() => {
    if (!series || !insight) return;
    const preferred = (initialTab as InsightChartTab | null) ?? getDefaultTab(insight);
    const hasPreferred = series[preferred].length > 1;
    if (hasPreferred) {
      setSelectedTab(preferred);
      return;
    }
    if (series.volume.length > 1) {
      setSelectedTab('volume');
    } else if (series.progress.length > 1) {
      setSelectedTab('progress');
    } else if (series.frequency.length > 1) {
      setSelectedTab('frequency');
    }
  }, [initialTab, insight, series]);

  const tabOptions = [
    { key: 'progress', label: resolveTabLabel('progress', series?.units?.progress, insight), disabled: (series?.progress?.length ?? 0) < 2 },
    { key: 'volume', label: resolveTabLabel('volume', series?.units?.volume, insight), disabled: (series?.volume?.length ?? 0) < 2 },
    { key: 'frequency', label: resolveTabLabel('frequency', series?.units?.frequency, insight), disabled: (series?.frequency?.length ?? 0) < 2 },
  ];

  if (!insight) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
              <ChevronLeftIcon color={colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              Insight not found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              Return to Insights to select another card.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const isWorkoutRecap = insight.type === 'WORKOUT_RECAP_V1';
  const isShareableInsight = true;
  const activeSeries = series?.[selectedTab] ?? [];
  const mapping = getInsightChartMapping(insight.type);
  const isExposureProgress = insight.type === 'LIFT_STALL_RISK_V1';
  const highlightRange =
    selectedTab === 'progress' ? (isExposureProgress ? undefined : series?.highlight?.range) : series?.highlight?.range;
  const highlightPoints =
    selectedTab === 'progress' && isExposureProgress ? series?.highlight?.points : undefined;
  const unit = series?.units?.[selectedTab];
  const chartTitle = resolveChartTitle(selectedTab, mapping, unit, insight);
  const latestPoint = activeSeries.length > 0 ? activeSeries[activeSeries.length - 1] : null;
  const latestValue = latestPoint ? formatChartValue(latestPoint.value, unit) : null;
  const latestMeta = latestPoint ? formatDateLabel(latestPoint.date) : null;
  const unitLabel = isWorkoutRecap
    ? series?.breakdownUnit ?? unit
    : unit === 'ratio'
    ? 'x'
    : unit;
  const xLabel =
    selectedTab === 'progress' && isExposureProgress
      ? 'Exposures'
      : 'Week';
  const yLabel = (() => {
    if (insight.type === 'IMBALANCE_FLAG_V1') {
      if (selectedTab === 'progress') {
        return unit === '%' ? 'Share (%)' : 'Push/Pull ratio';
      }
      return 'Sets';
    }
    if (selectedTab === 'frequency') {
      return 'Sessions';
    }
    if (selectedTab === 'progress') {
      if (unit?.toLowerCase() === 'prs') {
        return 'PRs';
      }
      return `e1RM${unit ? ` (${unit})` : ''}`;
    }
    return `Volume${unit ? ` (${unit})` : ''}`;
  })();
  const formatYAxisValue =
    unit === '%'
      ? (value: number) => `${value.toFixed(0)}%`
      : unit === 'ratio'
      ? (value: number) => value.toFixed(2)
      : undefined;
  const suggestionPayload = insight.recommendation?.[0]?.payload as { text?: string } | undefined;
  const suggestionText = typeof suggestionPayload?.text === 'string' ? suggestionPayload.text : null;

  const handleFeedback = async (rating: InsightFeedbackRating) => {
    if (feedbackStatus || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    const result = await submitInsightFeedback({
      insightId: insight.id,
      type: insight.type,
      rating,
      anchorDate: insight.anchorDate,
    });
    if (result.success) {
      setFeedbackStatus(rating);
      trackInsightFeedbackSubmitted({
        insight_id: insight.id,
        insight_type: insight.type,
        rating,
      });
    } else {
      setFeedbackError(result.error ?? 'Failed to save feedback');
    }
    setIsSubmittingFeedback(false);
  };

  const handleNextSteps = () => {
    if (!insight) return;
    const prompt =
      insight.type === 'FATIGUE_RISK_V1'
        ? 'Explain this fatigue risk and suggest what I should adjust next week.'
        : insight.type === 'IMBALANCE_FLAG_V1'
        ? 'Explain this imbalance flag and suggest what I should adjust next week.'
        : insight.type === 'LIFT_STALL_RISK_V1'
        ? 'Explain this stall risk and suggest what I should adjust next week.'
        : 'Explain this weekly insight and suggest what I should do next week.';
    void sendMessage('FORTIS_ANALYST', prompt, { insightId: insight.id });
    trackChatOpenedFromInsight({ insight_id: insight.id, insight_type: insight.type });
    router.push('/ai/chat');
  };

  const handleShare = () => {
    router.push({ pathname: '/insights/share', params: { id: insight.id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <ChevronLeftIcon color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{insight.title}</Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>{insight.summary}</Text>

            <View style={styles.evidenceList}>
              {resolveEvidence(insight).map((item) => {
                const delta = formatEvidenceDelta(item);
                const deltaColor = delta?.trend === 'up'
                  ? Colors.success
                  : delta?.trend === 'down'
                  ? Colors.error
                  : colors.textTertiary;
                return (
                  <View key={item.key} style={styles.evidenceRow}>
                    <Text style={[styles.evidenceLabel, { color: colors.textSecondary }]}>
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

          </View>

          <View style={styles.chartSection}>
            {!isWorkoutRecap && (
              <SegmentedControl
                options={tabOptions}
                value={selectedTab}
                onChange={(value) => setSelectedTab(value as InsightChartTab)}
                scrollable={insight.type === 'IMBALANCE_FLAG_V1'}
              />
            )}

            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>
                {isWorkoutRecap ? 'Workout volume by exercise' : chartTitle}
              </Text>
              {!isWorkoutRecap && latestValue && (
                <View
                  style={[
                    styles.chartValuePill,
                    {
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    },
                  ]}
                >
                  <Text style={[styles.chartValueText, { color: colors.textPrimary }]}>
                    {latestValue}
                  </Text>
                  {latestMeta && (
                    <Text style={[styles.chartValueMeta, { color: colors.textTertiary }]}>
                      {latestMeta}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {isLoading && !series ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading chart...
                </Text>
              </View>
            ) : isWorkoutRecap ? (
              <InsightBarChart
                data={series?.breakdown ?? []}
                unit={series?.breakdownUnit ?? unitLabel}
              />
            ) : (
              <View
                style={[
                  styles.chartCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <InsightLineChart
                  points={activeSeries}
                  stroke={colors.accent}
                  highlightRange={highlightRange}
                  highlightPoints={highlightPoints}
                  xLabel={xLabel}
                  yLabel={yLabel}
                  formatXValue={formatDateLabel}
                  formatYValue={formatYAxisValue}
                  variant={
                    insight.type === 'IMBALANCE_FLAG_V1'
                      ? selectedTab === 'progress'
                        ? 'line'
                        : 'bars'
                      : selectedTab === 'frequency'
                      ? 'bars'
                      : selectedTab === 'volume'
                      ? 'area'
                      : 'line'
                  }
                  fill={
                    insight.type === 'IMBALANCE_FLAG_V1'
                      ? undefined
                      : selectedTab === 'volume'
                      ? colors.accentOverlay
                      : undefined
                  }
                  fillOpacity={
                    insight.type === 'IMBALANCE_FLAG_V1'
                      ? undefined
                      : selectedTab === 'volume'
                      ? 1
                      : undefined
                  }
                />
              </View>
            )}

            <View style={styles.nextStepsRow}>
              <TouchableOpacity
                style={[
                  styles.nextStepsButton,
                  { backgroundColor: colors.accentOverlay, borderColor: colors.accent },
                ]}
                onPress={handleNextSteps}
                activeOpacity={0.8}
              >
                <Text style={[styles.nextStepsText, { color: colors.accent }]}>
                  Ask Fortis
                </Text>
              </TouchableOpacity>
              {isShareableInsight && (
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
                  ]}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.shareText, { color: colors.accent }]}>
                    Share
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {suggestionText && (
              <View
                style={[
                  styles.suggestionCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                  Suggested: {suggestionText}
                </Text>
              </View>
            )}

            <View style={styles.feedbackCard}>
              <Text style={[styles.feedbackTitle, { color: colors.textSecondary }]}>
                Was this helpful?
              </Text>
              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  onPress={() => handleFeedback('helpful')}
                  disabled={Boolean(feedbackStatus) || isSubmittingFeedback}
                  style={[
                    styles.feedbackButton,
                    {
                      borderColor: colors.accent,
                      backgroundColor:
                        feedbackStatus === 'helpful' ? colors.accentOverlay : 'transparent',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.feedbackText, { color: colors.accent }]}>Helpful</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFeedback('not_helpful')}
                  disabled={Boolean(feedbackStatus) || isSubmittingFeedback}
                  style={[
                    styles.feedbackButton,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        feedbackStatus === 'not_helpful' ? colors.accentOverlay : 'transparent',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                    Not helpful
                  </Text>
                </TouchableOpacity>
              </View>
              {feedbackStatus && (
                <Text style={[styles.feedbackThanks, { color: colors.textTertiary }]}>
                  Thanks for the feedback.
                </Text>
              )}
              {feedbackError && (
                <Text style={[styles.feedbackError, { color: Colors.error }]}>
                  {feedbackError}
                </Text>
              )}
            </View>
          </View>
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
    paddingHorizontal: HEADER_PADDING,
    paddingTop: scale(Spacing.sm),
    paddingBottom: scale(Spacing.sm),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: scale(36),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HEADER_PADDING,
    paddingBottom: scale(Spacing['4xl']),
    gap: SECTION_GAP,
  },
  card: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: CARD_PADDING,
    gap: scale(Spacing.sm),
  },
  title: {
    ...Typography.h3,
    fontSize: moderateScale(18),
  },
  summary: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  evidenceList: {
    gap: scale(Spacing.xs),
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  evidenceLabel: {
    fontSize: moderateScale(12),
    flex: 1,
  },
  evidenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  evidenceValueText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  evidenceDelta: {
    fontSize: moderateScale(11),
  },
  nextStepsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: scale(Spacing.sm),
  },
  nextStepsButton: {
    height: scale(32),
    minWidth: scale(120),
    paddingHorizontal: scale(Spacing.md),
    borderWidth: 1,
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepsText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  shareButton: {
    height: scale(32),
    paddingHorizontal: scale(Spacing.md),
    borderWidth: 1,
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  suggestionCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: scale(Spacing.md),
  },
  suggestionText: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  feedbackCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: scale(Spacing.md),
    gap: scale(Spacing.sm),
  },
  feedbackTitle: {
    ...Typography.body,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: scale(Spacing.sm),
  },
  feedbackButton: {
    flex: 1,
    borderRadius: scale(16),
    borderWidth: 1,
    paddingVertical: scale(Spacing.xs),
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  feedbackThanks: {
    fontSize: moderateScale(11),
  },
  feedbackError: {
    fontSize: moderateScale(11),
  },
  chartSection: {
    gap: scale(Spacing.md),
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    ...Typography.body,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  chartUnit: {
    fontSize: moderateScale(11),
  },
  loadingState: {
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  loadingText: {
    fontSize: moderateScale(12),
  },
  chartValuePill: {
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
    alignItems: 'flex-end',
  },
  chartValueText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  chartValueMeta: {
    fontSize: moderateScale(10),
    marginTop: scale(2),
  },
  chartCard: {
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(Spacing.sm),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(Spacing['2xl']),
    gap: scale(Spacing.xs),
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
});
