import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWeeklyMuscles } from '@/src/hooks/useWeeklyMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

/**
 * WeeklyMuscleHeatmapCard - Displays a body heatmap of muscles trained
 * in the last 7 days on the Profile tab.
 */
export function WeeklyMuscleHeatmapCard() {
  const { colors, isDark } = useTheme();
  const { exercises, loading, hasWorkouts } = useWeeklyMuscles();
  const bodyType = useWorkoutStore((state) => state.bodyType);

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <View style={[styles.container, cardStyle]}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        Muscles Hit This Week
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : !hasWorkouts ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            Complete a workout to see your muscle activity
          </Text>
        </View>
      ) : (
        <MuscleHeatmap
          exercises={exercises}
          gender={bodyType}
          scale={0.45}
          compact
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
