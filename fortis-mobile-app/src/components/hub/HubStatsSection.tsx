import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { StatsTabType, HubStats } from '@/src/types/program';
import { StatsPlaceholder } from '@/src/components/shared/StatsPlaceholder';
import { InsightLineChart } from '@/src/components/insights/InsightLineChart';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';

interface HubStatsSectionProps {
  stats: HubStats;
}

const TABS: StatsTabType[] = ['Volume', 'Reps', 'Duration'];

const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`.replace('.0', '');
  if (absValue >= 1000) return `${(value / 1000).toFixed(1)}k`.replace('.0', '');
  return Math.round(value).toString();
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
};

const resolveChartVariant = (tab: StatsTabType) => {
  switch (tab) {
    case 'Reps':
      return 'bars' as const;
    case 'Duration':
      return 'line' as const;
    case 'Volume':
    default:
      return 'area' as const;
  }
};

const resolveYAxisLabel = (tab: StatsTabType, volumeUnit: string) => {
  switch (tab) {
    case 'Reps':
      return 'Total reps';
    case 'Duration':
      return 'Minutes';
    case 'Volume':
    default:
      return `Total volume (${volumeUnit})`;
  }
};

export function HubStatsSection({ stats }: HubStatsSectionProps) {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const preferredUnits = profile?.preferred_units ?? 'imperial';
  const volumeUnit = preferredUnits === 'metric' ? 'kg' : 'lbs';
  const [selectedTab, setSelectedTab] = useState<StatsTabType>('Volume');

  // Theme-aware styles
  const themedStyles = {
    tabBar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    tabActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    tabText: { color: colors.textSecondary },
    tabTextActive: { color: colors.textPrimary },
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
  };

  const handleTabPress = (tab: StatsTabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const history =
    selectedTab === 'Volume'
      ? stats.volumeHistory
      : selectedTab === 'Reps'
      ? stats.repsHistory
      : stats.durationHistory;
  const hasData = stats.timesCompleted > 0 && history.length > 0;
  const chartVariant = resolveChartVariant(selectedTab);
  const yAxisLabel = resolveYAxisLabel(selectedTab, volumeUnit);
  const formatVolumeValue = (value: number) => `${formatCompactNumber(value)} ${volumeUnit}`;

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, themedStyles.tabBar]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && [styles.tabActive, themedStyles.tabActive]]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                themedStyles.tabText,
                selectedTab === tab && themedStyles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Area */}
      <View style={styles.chartContainer}>
        {hasData ? (
          <View style={[styles.chartCard, themedStyles.card]}>
            <InsightLineChart
              points={history}
              height={160}
              variant={chartVariant}
              fill={colors.accentOverlay}
              fillOpacity={0.3}
              formatYValue={
                selectedTab === 'Duration'
                  ? formatDuration
                  : selectedTab === 'Volume'
                    ? formatVolumeValue
                    : formatCompactNumber
              }
              xLabel="Date"
              yLabel={yAxisLabel}
              emptyLabel="Add another workout to see progress trends"
            />
          </View>
        ) : (
          <StatsPlaceholder selectedTab={selectedTab} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  chartContainer: {
    // Container for chart/placeholder
  },
  chartCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
});
