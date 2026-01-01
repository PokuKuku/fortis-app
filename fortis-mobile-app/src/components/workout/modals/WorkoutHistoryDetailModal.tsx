import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ClockIcon, ScaleIcon, TrophyIcon } from 'react-native-heroicons/outline';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { WorkoutSession } from '@/src/types/workout';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { getExerciseById } from '@/src/services/exerciseService';
import { getModalWidth } from '@/src/utils/responsive';

// UUID v4 pattern: 8-4-4-4-12 hex characters
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

interface WorkoutHistoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

function formatDuration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

export function WorkoutHistoryDetailModal({
  visible,
  onClose,
  session,
}: WorkoutHistoryDetailModalProps) {
  const { colors, isDark } = useTheme();

  // Map of exerciseId -> resolved exercise name (for UUID exercise names)
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});

  // Resolve UUID exercise names when modal opens
  useEffect(() => {
    if (!visible || !session) {
      setResolvedNames({});
      return;
    }

    const resolveUuidNames = async () => {
      const namesToResolve: Array<{ exerciseId: string; exerciseName: string }> = [];

      for (const exercise of session.exercises) {
        // Check if exerciseName looks like a UUID
        if (isUUID(exercise.exerciseName)) {
          namesToResolve.push({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
          });
        }
      }

      if (namesToResolve.length === 0) return;

      const resolved: Record<string, string> = {};

      await Promise.all(
        namesToResolve.map(async ({ exerciseId, exerciseName }) => {
          // Try to look up the exercise by ID
          const foundExercise = await getExerciseById(exerciseId);
          if (foundExercise) {
            resolved[exerciseId] = foundExercise.name;
          } else {
            // Fallback: try looking up by the UUID that was stored as the name
            const fallbackExercise = await getExerciseById(exerciseName);
            if (fallbackExercise) {
              resolved[exerciseId] = fallbackExercise.name;
            }
          }
        })
      );

      setResolvedNames(resolved);
    };

    resolveUuidNames();
  }, [visible, session]);

  // Helper to get display name for an exercise
  const getDisplayName = (exerciseId: string, exerciseName: string): string => {
    // If we resolved this UUID, use the resolved name
    if (resolvedNames[exerciseId]) {
      return resolvedNames[exerciseId];
    }
    // Otherwise use the stored name
    return exerciseName;
  };

  // Dynamic theme-aware styles
  const themedStyles = {
    dateTime: { color: colors.textSecondary },
    statsRow: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    statValue: { color: colors.textPrimary },
    exerciseName: { color: colors.accent },
    setNumber: { color: colors.textSecondary },
    setDetails: { color: colors.textPrimary },
  };

  if (!session) return null;

  const summary = getWorkoutSummary(session);
  const durationSeconds = session.durationSeconds === null
    ? null
    : session.durationSeconds ?? summary.durationSeconds;
  const formattedDateTime = format(session.startedAt, "HH:mm, EEEE, MMM d yyyy");

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={session.name}
      width={getModalWidth(300)}
    >
      {/* Date/Time */}
      <Text style={[styles.dateTime, themedStyles.dateTime]}>{formattedDateTime}</Text>

      {/* Stats Row */}
      <View style={[styles.statsRow, themedStyles.statsRow]}>
        <View style={styles.stat}>
          <ClockIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={[styles.statValue, themedStyles.statValue]}>{formatDuration(durationSeconds)}</Text>
        </View>

        <View style={styles.stat}>
          <ScaleIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={[styles.statValue, themedStyles.statValue]}>{formatVolume(summary.totalVolume)} lb</Text>
        </View>

        <View style={styles.stat}>
          <TrophyIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={[styles.statValue, themedStyles.statValue]}>0 PR</Text>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {session.exercises.map((exercise) => {
          const completedSets = exercise.sets.filter(s => s.isCompleted);
          if (completedSets.length === 0) return null;

          return (
            <View key={exercise.localId} style={styles.exerciseSection}>
              {/* Exercise Name */}
              <Text style={[styles.exerciseName, themedStyles.exerciseName]} numberOfLines={1}>
                {getDisplayName(exercise.exerciseId, exercise.exerciseName)}
              </Text>

              {/* Sets */}
              {completedSets.map((set, idx) => (
                <View key={set.localId} style={styles.setRow}>
                  <Text style={[styles.setNumber, themedStyles.setNumber]}>{idx + 1}</Text>
                  <Text style={[styles.setDetails, themedStyles.setDetails]}>
                    {set.weight ?? 0} × {set.reps ?? 0}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  dateTime: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseSection: {
    marginBottom: Spacing.lg,
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  setNumber: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 20,
  },
  setDetails: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
