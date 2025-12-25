import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { StatsTabType, HubStats } from '@/src/types/program';
import { StatsPlaceholder } from '@/src/components/shared/StatsPlaceholder';

interface HubStatsSectionProps {
  stats: HubStats;
}

const TABS: StatsTabType[] = ['Volume', 'Reps', 'Duration'];

export function HubStatsSection({ stats }: HubStatsSectionProps) {
  const [selectedTab, setSelectedTab] = useState<StatsTabType>('Volume');

  const handleTabPress = (tab: StatsTabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const hasData = stats.timesCompleted > 0;

  return (
    <View style={styles.container}>
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
