import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { StatsTabType, HubStats } from '@/src/types/program';
import { StatsPlaceholder } from '@/src/components/shared/StatsPlaceholder';

interface HubStatsSectionProps {
  stats: HubStats;
  totalExercises: number;
}

const TABS: StatsTabType[] = ['Volume', 'Reps', 'Duration'];

export function HubStatsSection({ stats, totalExercises }: HubStatsSectionProps) {
  const [selectedTab, setSelectedTab] = useState<StatsTabType>('Volume');

  const handleTabPress = (tab: StatsTabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const hasData = stats.timesCompleted > 0;

  return (
    <View style={styles.container}>
      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{totalExercises}</Text>
          <Text style={styles.quickStatLabel}>Exercises</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{stats.timesCompleted}</Text>
          <Text style={styles.quickStatLabel}>Completed</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
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
          // Future: Real chart component
          <StatsPlaceholder selectedTab={selectedTab} />
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
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.lg,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: -Spacing.sm,
  },
  quickStatValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
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
});
