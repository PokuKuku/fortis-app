import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { ProgramWorkout } from '@/src/types/program';
import { useTheme } from '@/src/contexts/ThemeContext';

interface WorkoutStackPreviewProps {
  /**
   * All workouts in the program (sorted by dayNumber)
   */
  workouts: ProgramWorkout[];
  /**
   * IDs of workouts that have been completed
   */
  completedIds: string[];
  /**
   * Current day number the user is on (1-indexed)
   */
  currentDayNumber: number;
  /**
   * Maximum number of workouts to display (default: 3)
   */
  maxVisible?: number;
}

/**
 * Displays a stacked preview of workouts in a program,
 * showing completed workouts and highlighting the next one.
 */
export function WorkoutStackPreview({
  workouts,
  completedIds,
  currentDayNumber,
  maxVisible = 3,
}: WorkoutStackPreviewProps) {
  const { colors, isDark } = useTheme();

  // Sort workouts by day number
  const sortedWorkouts = [...workouts].sort((a, b) => a.dayNumber - b.dayNumber);

  // Theme-aware styles for next workout highlighting
  const themedStyles = {
    workoutRow: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
    },
    workoutRowCompleted: {
      opacity: isDark ? 0.5 : 0.6,
    },
    workoutRowNext: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
      opacity: 1,
    },
    dayBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    dayBadgeNext: {
      backgroundColor: colors.accent,
    },
    dayBadgeText: {
      color: colors.textSecondary,
    },
    dayBadgeTextNext: {
      color: colors.background,
    },
    workoutName: {
      color: colors.textPrimary,
    },
    workoutNameCompleted: {
      color: colors.textTertiary,
    },
    workoutNameNext: {
      color: colors.textPrimary,
      fontWeight: '600' as const,
    },
  };

  // Determine which workouts to show (centered around current day)
  const getVisibleWorkouts = () => {
    if (sortedWorkouts.length <= maxVisible) {
      return sortedWorkouts;
    }

    // Find the index of the current/next workout
    const currentIndex = sortedWorkouts.findIndex(w => w.dayNumber === currentDayNumber);

    if (currentIndex === -1) {
      // If not found, show first N workouts
      return sortedWorkouts.slice(0, maxVisible);
    }

    // Try to show one completed workout before current, plus current and next
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(sortedWorkouts.length, startIndex + maxVisible);

    // Adjust if we're near the end
    const adjustedStart = Math.max(0, endIndex - maxVisible);

    return sortedWorkouts.slice(adjustedStart, adjustedStart + maxVisible);
  };

  const visibleWorkouts = getVisibleWorkouts();

  const isCompleted = (workoutId: string) => completedIds.includes(workoutId);
  const isNext = (workout: ProgramWorkout) => workout.dayNumber === currentDayNumber && !isCompleted(workout.id);

  if (workouts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleWorkouts.map((workout) => {
        const completed = isCompleted(workout.id);
        const next = isNext(workout);

        return (
          <View
            key={workout.id}
            style={[
              styles.workoutRow,
              themedStyles.workoutRow,
              completed && styles.workoutRowCompleted,
              completed && themedStyles.workoutRowCompleted,
              next && [styles.workoutRowNext, themedStyles.workoutRowNext],
            ]}
          >
            <View style={[styles.dayBadge, themedStyles.dayBadge, next && themedStyles.dayBadgeNext]}>
              <Text style={[styles.dayBadgeText, themedStyles.dayBadgeText, next && themedStyles.dayBadgeTextNext]}>
                D{workout.dayNumber}
              </Text>
            </View>
            <Text
              style={[
                styles.workoutName,
                themedStyles.workoutName,
                completed && themedStyles.workoutNameCompleted,
                next && themedStyles.workoutNameNext,
              ]}
              numberOfLines={1}
            >
              {workout.name}
            </Text>
            {completed && (
              <CheckIcon size={14} color={colors.accent} strokeWidth={2.5} />
            )}
            {next && (
              <ChevronRightIcon size={14} color={colors.accent} strokeWidth={2.5} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginTop: 4,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  workoutRowCompleted: {
    // opacity now applied via themedStyles
  },
  workoutRowNext: {
    // themed styles applied in component
  },
  dayBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  dayBadgeNext: {
    // backgroundColor now applied via themedStyles (colors.accent)
  },
  dayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  workoutName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
});
