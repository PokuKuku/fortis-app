import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import type { RefObject } from 'react';
import { addDays, format } from 'date-fns';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import { useAnalytics } from '@/src/services/analyticsService';
import { InsightLineChart } from '@/src/components/insights/InsightLineChart';
import { InsightBarChart } from '@/src/components/insights/InsightBarChart';
import type { TrainingInsight } from '@/src/types/insights';
import type { InsightBarPoint, InsightChartPoint, InsightChartSeries } from '@/src/types/insightCharts';
import { formatEvidenceDelta, formatEvidenceValue } from '@/src/utils/insightsFormat';
import { getInsightEvidenceOrder } from '@/src/utils/insightChartMapping';
import { isDateOnly, parseDateInput } from '@/src/utils/dateParsing';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';

type ShareTemplate = 'hero' | 'split' | 'grid' | 'timeline';

type ShareChartConfig =
  | {
      kind: 'line';
      points: InsightChartPoint[];
      variant: 'line' | 'area' | 'bars';
      yLabel?: string;
      xLabel?: string;
      highlightRange?: { start: string; end: string };
      highlightPoints?: string[];
      formatYValue?: (value: number) => string;
      baselineValue?: number;
    }
  | {
      kind: 'bar';
      data: InsightBarPoint[];
      unit?: string;
    };

const HEADER_PADDING = scale(Spacing.lg);
const SECTION_GAP = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const isWorkoutRecapType = (type: TrainingInsight['type']): boolean =>
  type === 'WORKOUT_RECAP_V1';

const formatDateLabel = (value: string): string => {
  const date = parseDateInput(value);
  if (!date) {
    return value;
  }
  const displayDate = isDateOnly(value) ? addDays(date, 6) : date;
  return format(displayDate, 'MMM d');
};

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

const resolveShareYAxisLabel = (
  insight: TrainingInsight,
  metric: 'progress' | 'volume' | 'frequency',
  unit?: string
): string => {
  if (insight.type === 'IMBALANCE_FLAG_V1') {
    if (metric === 'progress') {
      return unit === '%' ? 'Share (%)' : 'Push/Pull ratio';
    }
    return 'Sets';
  }
  if (metric === 'frequency') {
    return 'Sessions';
  }
  if (metric === 'progress') {
    if (unit?.toLowerCase() === 'prs') {
      return 'PRs';
    }
    return `e1RM${unit ? ` (${unit})` : ''}`;
  }
  return `Volume${unit ? ` (${unit})` : ''}`;
};

const resolveShareChart = (
  insight: TrainingInsight,
  series: InsightChartSeries
): ShareChartConfig => {
  if (isWorkoutRecapType(insight.type)) {
    return {
      kind: 'bar',
      data: series.breakdown ?? [],
      unit: series.breakdownUnit ?? series.units.volume,
    };
  }

  let metric: 'progress' | 'volume' | 'frequency' = 'volume';
  let variant: 'line' | 'area' | 'bars' = 'area';

  if (insight.type === 'LIFT_STALL_RISK_V1') {
    metric = 'progress';
    variant = 'line';
  } else if (insight.type === 'CONSISTENCY_STREAK_V1') {
    metric = 'frequency';
    variant = 'bars';
  } else if (insight.type === 'IMBALANCE_FLAG_V1') {
    metric = 'progress';
    variant = 'line';
  }

  const points = series[metric] ?? [];
  const unit = series.units?.[metric];
  const isExposureProgress = insight.type === 'LIFT_STALL_RISK_V1' && metric === 'progress';
  const formatYValue =
    unit === '%'
      ? (value: number) => `${value.toFixed(0)}%`
      : unit === 'ratio'
      ? (value: number) => value.toFixed(2)
      : undefined;

  return {
    kind: 'line',
    points,
    variant,
    yLabel: resolveShareYAxisLabel(insight, metric, unit),
    xLabel: isExposureProgress ? 'Exposures' : 'Week',
    highlightRange: isExposureProgress ? undefined : series.highlight?.range,
    highlightPoints: isExposureProgress ? series.highlight?.points : undefined,
    formatYValue,
    baselineValue:
      insight.type === 'IMBALANCE_FLAG_V1' && unit === 'ratio'
        ? 1
        : undefined,
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
      shouldHideVolume
      && item.key === 'volume_load'
      && item.unit !== '%'
      && item.compareValue === undefined
      && item.deltaValue === undefined
    ) {
      return false;
    }
    return true;
  });
  return filtered.length > 0 ? filtered : insight.evidence;
};

const getShareTemplate = (insight: TrainingInsight): ShareTemplate => {
  switch (insight.type) {
    case 'WEEKLY_VERDICT_V1':
    case 'FATIGUE_RISK_V1':
    case 'IMBALANCE_FLAG_V1':
      return 'timeline';
    case 'LIFT_STALL_RISK_V1':
      return 'split';
    case 'WORKOUT_RECAP_V1':
      return 'grid';
    case 'CONSISTENCY_STREAK_V1':
    case 'WEEKLY_VOLUME_PR_V1':
    default:
      return 'hero';
  }
};

const getShareBadge = (insight: TrainingInsight): string => {
  switch (insight.type) {
    case 'WEEKLY_VERDICT_V1':
      return 'Weekly update';
    case 'FATIGUE_RISK_V1':
      return 'Recovery';
    case 'IMBALANCE_FLAG_V1':
      return 'Balance';
    case 'LIFT_STALL_RISK_V1':
      return 'Stall watch';
    case 'WORKOUT_RECAP_V1':
      return 'Workout recap';
    case 'CONSISTENCY_STREAK_V1':
      return 'Streak';
    case 'WEEKLY_VOLUME_PR_V1':
      return 'Volume PR';
    default:
      return 'Training highlight';
  }
};

export default function InsightShareScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { insights } = useTrainingInsights();
  const { trackInsightShareStarted, trackInsightShareCompleted } = useAnalytics();
  const viewShotRef = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCaptureReady] = useState(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require('react-native-view-shot');
      return Boolean(module?.captureRef);
    } catch {
      return false;
    }
  });

  const insight = useMemo(
    () => insights.find((item) => item.id === id),
    [id, insights]
  );
  const { series, isLoading: isChartLoading, refresh: refreshChart } = useInsightChartSeries(insight ?? null);
  const shareChart = useMemo(
    () => (insight && series ? resolveShareChart(insight, series) : null),
    [insight, series]
  );
  const chartIsLoading = Boolean(insight) && isChartLoading && !shareChart;
  const isShareable = Boolean(insight);
  const evidenceItems = useMemo(() => (insight ? resolveEvidence(insight).slice(0, 3) : []), [insight]);
  const weekLabel = insight ? formatWeekRange(insight.anchorDate) : 'This week';
  const primaryEvidence = evidenceItems[0];
  const secondaryEvidence = evidenceItems.slice(1);
  const template = insight ? getShareTemplate(insight) : 'hero';
  const badgeLabel = insight ? getShareBadge(insight) : 'Training highlight';
  const heroDelta = primaryEvidence ? formatEvidenceDelta(primaryEvidence) : null;
  const comparisonBars = primaryEvidence?.compareValue !== undefined
    ? [
        { label: 'Last', value: primaryEvidence.compareValue },
        { label: 'This', value: primaryEvidence.value },
      ]
    : null;
  const comparisonMax = comparisonBars
    ? Math.max(...comparisonBars.map((item) => item.value), 1)
    : 1;
  const gradientColors = isDark
    ? ['#0c1413', '#131c1b', '#0f1918']
    : ['#f4f7f6', '#eef1f1', '#f6f8f8'];
  const ViewShotComponent = isCaptureReady
    ? (require('react-native-view-shot').default as any)
    : null;
  const shareButtonDisabled = isSharing || !isCaptureReady || chartIsLoading;

  useEffect(() => {
    if (!insight) return;
    refreshChart();
  }, [insight, refreshChart]);

  const handleShare = async () => {
    if (!insight || !isShareable) return;
    if (chartIsLoading) return;
    if (!isCaptureReady || !viewShotRef.current) {
      setShareError('Share preview requires a dev client rebuild.');
      return;
    }
    setIsSharing(true);
    setShareError(null);
    trackInsightShareStarted({
      insight_id: insight.id,
      insight_type: insight.type,
      privacy_mode: 'detailed',
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { captureRef } = require('react-native-view-shot') as {
        captureRef: (ref: RefObject<any>, options?: { format?: string; quality?: number; result?: string }) => Promise<string>;
      };
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const title = insight.title;
      const shareResult = await Share.share(
        Platform.OS === 'ios'
          ? { url: uri, title }
          : { message: title, url: uri, title }
      );
      const result =
        shareResult.action === Share.sharedAction
          ? 'shared'
          : shareResult.action === Share.dismissedAction
          ? 'dismissed'
          : 'unknown';
      trackInsightShareCompleted({
        insight_id: insight.id,
        insight_type: insight.type,
        privacy_mode: 'detailed',
        result,
      });
    } catch (error) {
      setShareError('Could not generate the share image.');
      trackInsightShareCompleted({
        insight_id: insight.id,
        insight_type: insight.type,
        privacy_mode: 'detailed',
        result: 'error',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderShareChart = () => {
    if (chartIsLoading) {
      return (
        <View
          style={[
            styles.chartLoading,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <ActivityIndicator size="small" color={colors.textSecondary} />
          <Text style={[styles.chartLoadingText, { color: colors.textSecondary }]}>
            Loading chart...
          </Text>
        </View>
      );
    }

    if (!shareChart) {
      return null;
    }

    if (shareChart.kind === 'bar') {
      return <InsightBarChart data={shareChart.data} unit={shareChart.unit} />;
    }

    const fill = shareChart.variant === 'area' ? colors.accentOverlay : undefined;

    return (
      <InsightLineChart
        points={shareChart.points}
        height={scale(150)}
        stroke={colors.accent}
        highlightRange={shareChart.highlightRange}
        highlightPoints={shareChart.highlightPoints}
        xLabel={shareChart.xLabel}
        yLabel={shareChart.yLabel}
        formatXValue={formatDateLabel}
        formatYValue={shareChart.formatYValue}
        variant={shareChart.variant}
        fill={fill}
        fillOpacity={shareChart.variant === 'area' ? 1 : undefined}
        baselineValue={shareChart.baselineValue}
        baselineColor={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.3)'}
      />
    );
  };

  const shareCard = insight ? (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.shareCard,
        styles.templateCard,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)',
        },
      ]}
      collapsable={false}
    >
      <View
        style={[
          styles.shareGlow,
          { backgroundColor: colors.accent, opacity: isDark ? 0.16 : 0.12 },
        ]}
      />
      <View style={styles.shareHeader}>
        <Text style={[styles.brand, { color: colors.accent }]}>FORTIS</Text>
        <Text style={[styles.weekLabel, { color: colors.textTertiary }]}>{weekLabel}</Text>
      </View>
      <View
        style={[
          styles.shareBadge,
          { backgroundColor: colors.accentOverlay, borderColor: colors.accent },
        ]}
      >
        <Text style={[styles.shareBadgeText, { color: colors.accent }]}>
          {badgeLabel}
        </Text>
      </View>
      <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>{insight.title}</Text>
      <Text style={[styles.shareSummary, { color: colors.textSecondary }]}>{insight.summary}</Text>

      {(shareChart || chartIsLoading) && (
        <View style={styles.shareChart}>
          {renderShareChart()}
        </View>
      )}

      {template === 'hero' && primaryEvidence && (
        <>
          <View style={styles.heroRow}>
            <Text style={[styles.heroLabel, { color: colors.textTertiary }]}>
              {primaryEvidence.label}
            </Text>
            <View style={styles.heroValueRow}>
              <Text style={[styles.heroValue, { color: colors.accent }]}>
                {formatEvidenceValue(primaryEvidence)}
              </Text>
              <View style={[styles.heroAccent, { backgroundColor: colors.accent }]} />
            </View>
          </View>
          <View style={styles.evidenceList}>
            {secondaryEvidence.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.evidenceRow,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <Text style={[styles.evidenceLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.evidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(item)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {template === 'split' && primaryEvidence && (
        <View style={styles.splitRow}>
          <View style={styles.splitColumn}>
            <Text style={[styles.heroLabel, { color: colors.textTertiary }]}>
              {primaryEvidence.label}
            </Text>
            <Text style={[styles.heroValue, { color: colors.accent }]}>
              {formatEvidenceValue(primaryEvidence)}
            </Text>
            {heroDelta && (
              <Text style={[styles.deltaText, { color: colors.textTertiary }]}>
                {heroDelta.text}
              </Text>
            )}
          </View>
          <View style={styles.splitColumn}>
            {secondaryEvidence.map((item) => (
              <View key={item.key} style={styles.splitEvidence}>
                <Text style={[styles.evidenceLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.evidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(item)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {template === 'grid' && (
        <View style={styles.grid}>
          {evidenceItems.map((item) => (
            <View
              key={item.key}
              style={[
                styles.gridTile,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                {formatEvidenceValue(item)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {template === 'timeline' && primaryEvidence && (
        <View style={styles.timelineBlock}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.heroLabel, { color: colors.textTertiary }]}>
              {primaryEvidence.label}
            </Text>
            <Text style={[styles.heroValue, { color: colors.accent }]}>
              {formatEvidenceValue(primaryEvidence)}
            </Text>
            {heroDelta && (
              <Text style={[styles.deltaText, { color: colors.textSecondary }]}>
                {heroDelta.text} vs last week
              </Text>
            )}
          </View>
          {comparisonBars ? (
            <View style={styles.comparisonBlock}>
              {comparisonBars.map((bar) => {
                const width = Math.max((bar.value / comparisonMax) * 100, 8);
                return (
                  <View key={bar.label} style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                      {bar.label}
                    </Text>
                    <View
                      style={[
                        styles.comparisonTrack,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                      ]}
                    >
                      <View
                        style={[
                          styles.comparisonFill,
                          {
                            width: `${width}%`,
                            backgroundColor:
                              bar.label === 'This' ? colors.accent : colors.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.comparisonValue, { color: colors.textPrimary }]}>
                      {formatEvidenceValue({
                        ...primaryEvidence,
                        value: bar.value,
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          <View style={styles.timelineEvidence}>
            {secondaryEvidence.map((item) => (
              <View key={item.key} style={styles.timelineRow}>
                <Text style={[styles.evidenceLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.evidenceValue, { color: colors.textPrimary }]}>
                  {formatEvidenceValue(item)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.shareFooter}>
        <Text style={[styles.shareHandle, { color: colors.textTertiary }]}>
          fortis.app
        </Text>
      </View>
    </LinearGradient>
  ) : null;

  if (!insight || !isShareable) {
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
              Share preview unavailable
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              Select a shareable insight to continue.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <ChevronLeftIcon color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Share insight</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewSection}>
            {isCaptureReady && ViewShotComponent ? (
              <ViewShotComponent ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                {shareCard}
              </ViewShotComponent>
            ) : (
              shareCard
            )}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: colors.accentOverlay, borderColor: colors.accent },
              ]}
              onPress={handleShare}
              disabled={shareButtonDisabled}
              activeOpacity={0.8}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
              )}
            </TouchableOpacity>
            {chartIsLoading && (
              <Text style={[styles.shareError, { color: colors.textTertiary }]}>
                Loading chart data...
              </Text>
            )}
            {!isCaptureReady && (
              <Text style={[styles.shareError, { color: colors.textTertiary }]}>
                Share preview requires a dev client rebuild.
              </Text>
            )}
            {shareError && (
              <Text style={[styles.shareError, { color: colors.error }]}>
                {shareError}
              </Text>
            )}
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
  headerTitle: {
    ...Typography.h3,
    fontSize: moderateScale(16),
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
  previewSection: {
    alignItems: 'center',
  },
  shareCard: {
    width: scale(320),
    minHeight: scale(360),
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: scale(Spacing.lg),
    gap: scale(Spacing.sm),
    overflow: 'hidden',
  },
  templateCard: {
    gap: scale(Spacing.md),
  },
  shareGlow: {
    position: 'absolute',
    top: -scale(60),
    right: -scale(40),
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 2,
    fontSize: moderateScale(13),
  },
  weekLabel: {
    fontSize: moderateScale(11),
  },
  shareBadge: {
    alignSelf: 'flex-start',
    borderRadius: scale(BorderRadius.lg),
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
  },
  shareBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  shareTitle: {
    ...Typography.h3,
    fontSize: moderateScale(20),
  },
  shareSummary: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  heroRow: {
    paddingVertical: scale(Spacing.sm),
    gap: scale(Spacing.xs),
  },
  heroLabel: {
    fontSize: moderateScale(11),
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  heroValue: {
    fontSize: moderateScale(28),
    fontWeight: '700',
  },
  deltaText: {
    fontSize: moderateScale(11),
    marginTop: scale(Spacing.xs),
  },
  heroAccent: {
    width: scale(36),
    height: scale(4),
    borderRadius: scale(4),
  },
  evidenceList: {
    gap: scale(Spacing.xs),
  },
  shareChart: {
    marginTop: scale(Spacing.xs),
  },
  chartLoading: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(Spacing.md),
    gap: scale(Spacing.xs),
  },
  chartLoadingText: {
    fontSize: moderateScale(11),
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(Spacing.sm),
    borderRadius: scale(BorderRadius.md),
    borderWidth: 1,
    paddingVertical: scale(Spacing.xs),
    paddingHorizontal: scale(Spacing.sm),
  },
  evidenceLabel: {
    fontSize: moderateScale(11),
    flex: 1,
  },
  evidenceValue: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: scale(Spacing.md),
  },
  splitColumn: {
    flex: 1,
    gap: scale(Spacing.sm),
  },
  splitEvidence: {
    gap: scale(Spacing.xs),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(Spacing.sm),
  },
  gridTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: scale(BorderRadius.md),
    borderWidth: 1,
    paddingVertical: scale(Spacing.sm),
    paddingHorizontal: scale(Spacing.sm),
    gap: scale(Spacing.xs),
  },
  gridLabel: {
    fontSize: moderateScale(11),
  },
  gridValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  timelineBlock: {
    gap: scale(Spacing.sm),
  },
  timelineHeader: {
    gap: scale(Spacing.xs),
  },
  comparisonBlock: {
    gap: scale(Spacing.xs),
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  comparisonLabel: {
    width: scale(36),
    fontSize: moderateScale(10),
  },
  comparisonTrack: {
    flex: 1,
    height: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  comparisonFill: {
    height: '100%',
    borderRadius: scale(3),
  },
  comparisonValue: {
    minWidth: scale(48),
    textAlign: 'right',
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  timelineEvidence: {
    gap: scale(Spacing.xs),
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  shareFooter: {
    marginTop: scale(Spacing.xs),
    gap: scale(Spacing.xs),
  },
  privacyHint: {
    fontSize: moderateScale(10),
  },
  shareHandle: {
    fontSize: moderateScale(10),
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  controlsSection: {
    gap: scale(Spacing.sm),
  },
  sectionLabel: {
    fontSize: moderateScale(12),
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: scale(BorderRadius.lg),
    borderWidth: 1,
    padding: scale(Spacing.xs),
    gap: scale(Spacing.xs),
  },
  toggleButton: {
    flex: 1,
    borderRadius: scale(BorderRadius.md),
    paddingVertical: scale(Spacing.xs),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  toggleHint: {
    fontSize: moderateScale(11),
  },
  actionsSection: {
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  shareButton: {
    height: scale(36),
    minWidth: scale(140),
    borderRadius: scale(18),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(Spacing.lg),
  },
  shareButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  shareError: {
    fontSize: moderateScale(11),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(Spacing.lg),
    gap: scale(Spacing.xs),
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: moderateScale(15),
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
});
