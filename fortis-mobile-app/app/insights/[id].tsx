import { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { InsightLineChart } from '@/src/components/insights/InsightLineChart';
import { SegmentedControl } from '@/src/components/insights/SegmentedControl';
import type { TrainingInsight } from '@/src/types/insights';
import type { InsightChartTab } from '@/src/types/insightCharts';
import { formatEvidenceDelta, formatEvidenceValue } from '@/src/utils/insightsFormat';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';

const HEADER_PADDING = scale(Spacing.lg);
const SECTION_GAP = scale(Spacing.lg);
const CARD_PADDING = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);

const getDefaultTab = (insight: TrainingInsight): InsightChartTab => {
  if (insight.type === 'LIFT_STALL_RISK_V1') return 'progress';
  if (insight.type === 'FATIGUE_RISK_V1') return 'volume';
  return 'volume';
};

export default function InsightDetailScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { insights } = useTrainingInsights({ skipRefresh: true });

  const insight = useMemo(
    () => insights.find((item) => item.id === id),
    [id, insights]
  );

  const { series, isLoading } = useInsightChartSeries(insight ?? null);
  const [selectedTab, setSelectedTab] = useState<InsightChartTab>(
    insight ? getDefaultTab(insight) : 'volume'
  );

  useEffect(() => {
    if (!insight) return;
    setSelectedTab(getDefaultTab(insight));
  }, [insight]);

  useEffect(() => {
    if (!series || !insight) return;
    const defaultTab = getDefaultTab(insight);
    const hasDefault = series[defaultTab].length > 1;
    if (hasDefault) {
      setSelectedTab(defaultTab);
      return;
    }
    if (series.volume.length > 1) {
      setSelectedTab('volume');
    } else if (series.progress.length > 1) {
      setSelectedTab('progress');
    } else if (series.frequency.length > 1) {
      setSelectedTab('frequency');
    }
  }, [insight, series]);

  const tabOptions = [
    { key: 'progress', label: 'Progress', disabled: (series?.progress?.length ?? 0) < 2 },
    { key: 'volume', label: 'Volume', disabled: (series?.volume?.length ?? 0) < 2 },
    { key: 'frequency', label: 'Frequency', disabled: (series?.frequency?.length ?? 0) < 2 },
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

  const activeSeries = series?.[selectedTab] ?? [];
  const highlightRange = selectedTab === 'progress' ? undefined : series?.highlight?.range;
  const highlightPoints = selectedTab === 'progress' ? series?.highlight?.points : undefined;
  const unit = series?.units?.[selectedTab];
  const suggestionPayload = insight.recommendation?.[0]?.payload as { text?: string } | undefined;
  const suggestionText = typeof suggestionPayload?.text === 'string' ? suggestionPayload.text : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <ChevronLeftIcon color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Insight</Text>
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
              {insight.evidence.map((item) => {
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

            {suggestionText && (
              <Text style={[styles.suggestion, { color: colors.textSecondary }]}>
                Suggested: {suggestionText}
              </Text>
            )}
          </View>

          <View style={styles.chartSection}>
            <SegmentedControl
              options={tabOptions}
              value={selectedTab}
              onChange={(value) => setSelectedTab(value as InsightChartTab)}
            />

            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>
                {selectedTab === 'progress' ? 'Progress' : selectedTab === 'frequency' ? 'Frequency' : 'Volume'}
              </Text>
              {unit && (
                <Text style={[styles.chartUnit, { color: colors.textTertiary }]}>
                  {unit}
                </Text>
              )}
            </View>

            {isLoading && !series ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.textSecondary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading chart...
                </Text>
              </View>
            ) : (
              <InsightLineChart
                points={activeSeries}
                stroke={colors.accent}
                highlightRange={highlightRange}
                highlightPoints={highlightPoints}
              />
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
  suggestion: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
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
