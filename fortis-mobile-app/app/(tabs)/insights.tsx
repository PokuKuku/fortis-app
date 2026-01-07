import { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { addDays, format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { useExercises } from '@/src/hooks/useExercises';
import { useAIStore } from '@/src/store/aiStore';
import { TrainingInsight } from '@/src/types/insights';
import type { InsightChartSeries } from '@/src/types/insightCharts';
import { formatEvidenceDelta, formatEvidenceValue } from '@/src/utils/insightsFormat';
import { useAnalytics } from '@/src/services/analyticsService';
import { InsightSparkline } from '@/src/components/insights/InsightSparkline';
import { SegmentedControl } from '@/src/components/insights/SegmentedControl';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';
import { getInsightChartMapping, getInsightEvidenceOrder } from '@/src/utils/insightChartMapping';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.md);
const TITLE_PADDING_BOTTOM = scale(Spacing.md);
const SECTION_TITLE_SIZE = moderateScale(24);
const SECTION_GAP = scale(Spacing.lg);
const CARD_PADDING = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const INSIGHT_GAP = scale(Spacing.md);
const EVIDENCE_GAP = scale(Spacing.xs);
const EVIDENCE_TEXT_SIZE = moderateScale(13);
const EVIDENCE_META_SIZE = moderateScale(11);
const SUMMARY_TEXT_SIZE = moderateScale(14);
const SUMMARY_LINE_HEIGHT = moderateScale(20);
const ACTION_BUTTON_HEIGHT = scale(32);
const ACTION_TEXT_SIZE = moderateScale(12);
const LIST_PADDING_BOTTOM = scale(120);
const EMPTY_PADDING_Y = scale(Spacing['3xl']);

type SparklineData = {
  values: number[];
  highlightIndices: number[];
};

type ChartTab = 'progress' | 'volume' | 'frequency';

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

const resolveSparkline = (
  insight: TrainingInsight,
  series: InsightChartSeries | null
): SparklineData | null => {
  if (!series) {
    return null;
  }

  if (insight.type === 'LIFT_STALL_RISK_V1') {
    const values = series.progress.length > 0
      ? series.progress.map((point) => point.value)
      : series.volume.map((point) => point.value);
    if (values.length === 0) return null;
    const startIndex = Math.max(values.length - 3, 0);
    const highlightIndices = values.slice(startIndex).map((_, index) => startIndex + index);
    return { values, highlightIndices };
  }

  const mapping = getInsightChartMapping(insight.type);
  const seriesMap: Record<ChartTab, InsightChartSeries['volume']> = {
    progress: series.progress,
    volume: series.volume,
    frequency: series.frequency,
  };
  const preferredSeries =
    seriesMap[mapping.sparklineMetric].length > 0
      ? seriesMap[mapping.sparklineMetric]
      : series.volume.length > 0
      ? series.volume
      : series.frequency;
  const values = preferredSeries.map((point) => point.value);
  if (values.length === 0) return null;
  const anchorIndex = preferredSeries.findIndex((point) => point.date === insight.anchorDate);
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
  const filtered = ordered.filter((item) => {
    if (
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
}: {
  insight: TrainingInsight;
  onWhyPress: (insight: TrainingInsight) => void;
  onDismiss: (insight: TrainingInsight) => void;
  onOpenChart: (insight: TrainingInsight) => void;
}) {
  const { colors, isDark } = useTheme();
  const { series } = useInsightChartSeries(insight);
  const sparkline = useMemo(() => resolveSparkline(insight, series), [insight, series]);
  const sparklineLabel = useMemo(() => getInsightChartMapping(insight.type).sparklineLabel, [insight.type]);
  const evidenceItems = useMemo(() => resolveEvidence(insight).slice(0, 4), [insight]);

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <View style={[styles.cardBase, styles.insightCard, cardTheme]}>
      <View style={styles.insightHeader}>
        <View style={styles.insightHeaderRow}>
          <Text style={[styles.insightRange, { color: colors.textTertiary }]}>
            {formatWeekRange(insight.anchorDate)}
          </Text>
          <TouchableOpacity
            onPress={() => onDismiss(insight)}
            hitSlop={8}
            style={styles.dismissButton}
          >
            <Text style={[styles.dismissButtonText, { color: colors.textTertiary }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>{insight.title}</Text>
      </View>

      <Text style={[styles.insightSummary, { color: colors.textSecondary }]}>
        {insight.summary}
      </Text>

      {sparkline && (
        <View style={styles.sparklineContainer}>
          <Text style={[styles.sparklineLabel, { color: colors.textTertiary }]}>
            {sparklineLabel}
          </Text>
          <InsightSparkline
            values={sparkline.values}
            highlightIndices={sparkline.highlightIndices}
            stroke={colors.accent}
          />
        </View>
      )}

      <View style={styles.evidenceList}>
        {evidenceItems.map((item) => {
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
          <Text style={[styles.whyButtonText, { color: colors.accent }]}>Why?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewChartButton, { borderColor: colors.border }]}
          onPress={() => onOpenChart(insight)}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewChartText, { color: colors.textSecondary }]}>View chart</Text>
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
}: {
  insight: TrainingInsight;
  exerciseName: string;
  onWhyPress: (insight: TrainingInsight) => void;
  onDismiss: (insight: TrainingInsight) => void;
  onOpenChart: (insight: TrainingInsight) => void;
}) {
  const { colors } = useTheme();
  const { series } = useInsightChartSeries(insight);
  const sparkline = useMemo(() => resolveSparkline(insight, series), [insight, series]);
  const sparklineLabel = useMemo(() => getInsightChartMapping(insight.type).sparklineLabel, [insight.type]);

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
      <View style={styles.watchlistInfo}>
        <Text style={[styles.watchlistName, { color: colors.textPrimary }]}>
          {exerciseName}
        </Text>
        <Text style={[styles.watchlistStatus, { color: statusColor }]}>
          Stall risk
        </Text>
        <Text style={[styles.watchlistReason, { color: colors.textSecondary }]}>
          {e1rmDescriptor} ({exposuresText}); {volumeDescriptor}
        </Text>
        {suggestionText && (
          <Text style={[styles.watchlistSuggestion, { color: colors.textSecondary }]}>
            Suggested: {suggestionText}
          </Text>
        )}
        <View style={styles.watchlistEvidence}>
          {e1rmItem && (() => {
            const e1rmDeltaText = formatEvidenceDelta(e1rmItem)?.text;
            return (
              <View style={styles.watchlistEvidenceRow}>
                <Text style={[styles.watchlistEvidenceLabel, { color: colors.textTertiary }]}>
                  {e1rmItem.label}
                </Text>
                <Text style={[styles.watchlistEvidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(e1rmItem)}
                  {e1rmDeltaText ? ` (${e1rmDeltaText})` : ''}
                </Text>
              </View>
            );
          })()}
          {volumeItem && (() => {
            const volumeDeltaText = formatEvidenceDelta(volumeItem)?.text;
            return (
              <View style={styles.watchlistEvidenceRow}>
                <Text style={[styles.watchlistEvidenceLabel, { color: colors.textTertiary }]}>
                  {volumeItem.label}
                </Text>
                <Text style={[styles.watchlistEvidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(volumeItem)}
                  {volumeDeltaText ? ` (${volumeDeltaText})` : ''}
                </Text>
              </View>
            );
          })()}
        </View>
      </View>
      <View style={styles.watchlistSide}>
        {sparkline && (
          <View style={styles.watchlistSparkline}>
            <Text style={[styles.sparklineLabel, { color: colors.textTertiary }]}>
              {sparklineLabel}
            </Text>
            <InsightSparkline
              values={sparkline.values}
              highlightIndices={sparkline.highlightIndices}
              stroke={colors.accent}
              height={32}
            />
          </View>
        )}
        <View style={styles.watchlistActions}>
          <TouchableOpacity
            onPress={() => onWhyPress(insight)}
            style={styles.watchlistActionButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.watchlistWhy, { color: colors.accent }]}>Why?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onOpenChart(insight)}
            style={styles.watchlistActionButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.watchlistChart, { color: colors.textSecondary }]}>
              Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDismiss(insight)}
            style={styles.watchlistActionButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.watchlistDismiss, { color: colors.textTertiary }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { insights, isLoading, isRefreshing, refresh, dismissInsight, snoozeInsightType } = useTrainingInsights();
  const { exercises } = useExercises();
  const sendMessage = useAIStore((state) => state.sendMessage);
  const openConversation = useAIStore((state) => state.openConversation);
  const {
    trackInsightsViewed,
    trackVerdictWhyTapped,
    trackWatchlistItemOpened,
    trackChatOpenedFromInsight,
    trackInsightDismissed,
    trackInsightTypeSnoozed,
  } = useAnalytics();
  const hasTrackedView = useRef(false);
  const [chartTab, setChartTab] = useState<ChartTab>('volume');

  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach((exercise) => {
      map.set(exercise.id, exercise.name);
      if (exercise.slug) {
        map.set(exercise.slug, exercise.name);
      }
    });
    return map;
  }, [exercises]);

  const weeklyVerdict = useMemo(
    () => insights.find((insight) => insight.type === 'WEEKLY_VERDICT_V1'),
    [insights]
  );

  const fatigueRisk = useMemo(
    () => insights.find((insight) => insight.type === 'FATIGUE_RISK_V1'),
    [insights]
  );

  const stallRisks = useMemo(
    () => insights.filter((insight) => insight.type === 'LIFT_STALL_RISK_V1'),
    [insights]
  );

  const watchlistItems = useMemo(() => {
    const severityRank: Record<TrainingInsight['severity'], number> = {
      high: 2,
      medium: 1,
      low: 0,
    };
    return [...stallRisks]
      .filter((insight) => Boolean(insight.exerciseId))
      .sort((a, b) => {
        const bySeverity = severityRank[b.severity] - severityRank[a.severity];
        if (bySeverity !== 0) return bySeverity;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 5);
  }, [stallRisks]);

  const watchlistSummary = useMemo(
    () => stallRisks.find((insight) => insight.subjectKey === 'global'),
    [stallRisks]
  );

  const eligibleCount = useMemo(() => {
    const item = watchlistSummary?.evidence.find((evidence) => evidence.key === 'eligible_exercises');
    return item ? Number(item.value) : 0;
  }, [watchlistSummary]);

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  useEffect(() => {
    if (hasTrackedView.current || isLoading) {
      return;
    }
    hasTrackedView.current = true;
    trackInsightsViewed({
      has_weekly_verdict: Boolean(weeklyVerdict),
      watchlist_count: watchlistItems.length,
      watchlist_eligible: eligibleCount,
    });
  }, [eligibleCount, isLoading, trackInsightsViewed, watchlistItems.length, weeklyVerdict]);

  const openInsightChat = (insight: TrainingInsight, prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    openConversation();
    void sendMessage('FORTIS_ANALYST', prompt, { insightId: insight.id });
    trackChatOpenedFromInsight({
      insight_id: insight.id,
      insight_type: insight.type,
    });
    router.push('/ai/chat');
  };

  const handleWhyPress = (insight: TrainingInsight) => {
    trackVerdictWhyTapped({ insight_id: insight.id });
    openInsightChat(
      insight,
      'Explain this insight and suggest what I should do next week.'
    );
  };

  const handleOpenChart = (insight: TrainingInsight, tabOverride?: ChartTab) => {
    router.push({
      pathname: '/insights/[id]',
      params: { id: insight.id, tab: tabOverride ?? chartTab },
    });
  };

  const handleWatchlistPress = (insight: TrainingInsight) => {
    const exerciseName = insight.exerciseId
      ? exerciseNameById.get(insight.exerciseId) ?? 'this lift'
      : 'this lift';
    trackWatchlistItemOpened({
      insight_id: insight.id,
      exercise_id: insight.exerciseId,
      severity: insight.severity,
    });
    openInsightChat(
      insight,
      `Explain why ${exerciseName} is at stall risk and suggest adjustments for the next two weeks.`
    );
  };

  const handleFatigueWhyPress = (insight: TrainingInsight) => {
    openInsightChat(
      insight,
      'Explain this fatigue risk and suggest what I should adjust next week.'
    );
  };

  const handleDismissInsight = async (insight: TrainingInsight) => {
    trackInsightDismissed({ insight_id: insight.id, insight_type: insight.type });
    await dismissInsight(insight.id);
  };

  const handleSnoozeWatchlist = async () => {
    trackInsightTypeSnoozed({ insight_type: 'LIFT_STALL_RISK_V1', snooze_days: 14 });
    await snoozeInsightType('LIFT_STALL_RISK_V1', 14);
  };

  const handleOpenLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/exercises');
  };

  const hasInsights = Boolean(weeklyVerdict) || Boolean(fatigueRisk) || watchlistItems.length > 0 || Boolean(watchlistSummary);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Insights</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.textSecondary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            options={[
              { key: 'progress', label: 'Progress' },
              { key: 'volume', label: 'Volume' },
              { key: 'frequency', label: 'Frequency' },
            ]}
            value={chartTab}
            onChange={(value) => setChartTab(value as ChartTab)}
          />

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
                <MagnifyingGlassIcon color={colors.textSecondary} size={18} strokeWidth={2} />
              </View>
              <View style={styles.libraryText}>
                <Text style={[styles.libraryTitle, { color: colors.textPrimary }]}>
                  Exercise Library
                </Text>
                <Text style={[styles.librarySubtitle, { color: colors.textSecondary }]}>
                  Search and browse exercises
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {isLoading && !hasInsights ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading insights...
              </Text>
            </View>
          ) : !hasInsights ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No insights yet. Log a completed workout to generate your Weekly Verdict.
              </Text>
              <GlassButton style={styles.refreshButton} onPress={refresh}>
                <Text style={[styles.whyButtonText, { color: colors.accent }]}>Refresh</Text>
              </GlassButton>
            </View>
          ) : (
            <View style={styles.insightsList}>
              {weeklyVerdict && (
                <InsightCard
                  insight={weeklyVerdict}
                  onWhyPress={handleWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                />
              )}

              {fatigueRisk && (
                <InsightCard
                  insight={fatigueRisk}
                  onWhyPress={handleFatigueWhyPress}
                  onDismiss={handleDismissInsight}
                  onOpenChart={handleOpenChart}
                />
              )}

              {(watchlistItems.length > 0 || watchlistSummary) && (
                <View style={[styles.cardBase, styles.watchlistCard, cardTheme]}>
                  <View style={styles.watchlistHeader}>
                    <View>
                      <Text style={[styles.watchlistTitle, { color: colors.textPrimary }]}>
                        Watchlist
                      </Text>
                      <Text style={[styles.watchlistSubtitle, { color: colors.textTertiary }]}>
                        Lifts to keep an eye on
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleSnoozeWatchlist}
                      style={[styles.snoozeButton, { borderColor: colors.border }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.snoozeButtonText, { color: colors.textSecondary }]}>
                        Snooze 14d
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {watchlistItems.length === 0 ? (
                    <Text style={[styles.watchlistEmpty, { color: colors.textSecondary }]}>
                      {eligibleCount > 0
                        ? 'All clear this week. Your top lifts are steady.'
                        : 'Not enough data yet. Repeat a lift 3 times to unlock stall alerts.'}
                    </Text>
                  ) : (
                    <View style={styles.watchlistList}>
                      {watchlistItems.map((insight) => {
                        const exerciseName = insight.exerciseId
                          ? exerciseNameById.get(insight.exerciseId) ?? 'Unknown exercise'
                          : 'Unknown exercise';

                        return (
                          <WatchlistRow
                            key={insight.id}
                            insight={insight}
                            exerciseName={exerciseName}
                            onWhyPress={handleWatchlistPress}
                            onDismiss={handleDismissInsight}
                            onOpenChart={(selected) => handleOpenChart(selected, 'progress')}
                          />
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: moderateScale(15),
  },
  librarySubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(12),
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
    ...Typography.h3,
    fontSize: moderateScale(16),
  },
  watchlistSubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(11),
    marginTop: scale(Spacing.xs),
  },
  watchlistEmpty: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  snoozeButton: {
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
  },
  snoozeButtonText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  watchlistList: {
    gap: scale(Spacing.sm),
  },
  watchlistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: scale(Spacing.sm),
    gap: scale(Spacing.sm),
  },
  watchlistInfo: {
    flex: 1,
    gap: scale(Spacing.xs),
  },
  watchlistName: {
    fontSize: moderateScale(14),
  },
  watchlistStatus: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  watchlistReason: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
  watchlistSuggestion: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
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
    fontSize: moderateScale(11),
    flex: 1,
  },
  watchlistEvidenceValue: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  watchlistActions: {
    alignItems: 'flex-end',
    gap: scale(Spacing.xs),
  },
  watchlistSide: {
    alignItems: 'flex-end',
    gap: scale(Spacing.xs),
  },
  watchlistSparkline: {
    width: scale(90),
  },
  watchlistActionButton: {
    paddingHorizontal: scale(Spacing.xs),
    paddingVertical: scale(2),
  },
  watchlistWhy: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  watchlistChart: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  watchlistDismiss: {
    fontSize: moderateScale(11),
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
    fontSize: moderateScale(11),
  },
  dismissButton: {
    paddingHorizontal: scale(Spacing.xs),
    paddingVertical: scale(2),
  },
  dismissButtonText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  insightTitle: {
    ...Typography.h3,
    fontSize: moderateScale(16),
  },
  insightSummary: {
    fontSize: SUMMARY_TEXT_SIZE,
    lineHeight: SUMMARY_LINE_HEIGHT,
    marginBottom: scale(Spacing.md),
  },
  sparklineContainer: {
    marginBottom: scale(Spacing.md),
    gap: scale(Spacing.xs),
  },
  sparklineLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
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
    flex: 1,
  },
  evidenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  evidenceValueText: {
    fontSize: EVIDENCE_TEXT_SIZE,
  },
  evidenceDelta: {
    fontSize: EVIDENCE_META_SIZE,
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
  viewChartText: {
    fontSize: ACTION_TEXT_SIZE,
    fontWeight: '600',
  },
  loadingState: {
    paddingVertical: scale(Spacing.xl),
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  loadingText: {
    fontSize: moderateScale(13),
  },
  emptyState: {
    paddingVertical: EMPTY_PADDING_Y,
    alignItems: 'center',
    gap: scale(Spacing.md),
  },
  emptyText: {
    textAlign: 'center',
    fontSize: moderateScale(13),
    maxWidth: scale(260),
  },
  refreshButton: {
    alignSelf: 'center',
    height: ACTION_BUTTON_HEIGHT,
    paddingHorizontal: scale(Spacing.lg),
  },
});
