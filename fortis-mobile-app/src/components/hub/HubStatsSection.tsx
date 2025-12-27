import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { StatsTabType, HubStats } from '@/src/types/program';
import { StatsPlaceholder } from '@/src/components/shared/StatsPlaceholder';
import { useTheme } from '@/src/contexts/ThemeContext';

interface HubStatsSectionProps {
  stats: HubStats;
}

const TABS: StatsTabType[] = ['Volume', 'Reps', 'Duration'];

export function HubStatsSection({ stats }: HubStatsSectionProps) {
  const { colors, isDark } = useTheme();
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
  };

  const handleTabPress = (tab: StatsTabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const hasData = stats.timesCompleted > 0;

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
