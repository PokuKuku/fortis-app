import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ClockIcon, ScaleIcon, TrophyIcon } from 'react-native-heroicons/outline';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import type { WeightUnit, WorkoutSession, WorkoutSet } from '@/src/types/workout';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { VolumeContext } from '@/src/utils/workoutVolume';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { getExerciseById } from '@/src/services/exerciseService';
import { getModalWidth } from '@/src/utils/responsive';
import { getSetVolume } from '@/src/utils/workoutVolume';

// UUID v4 pattern: 8-4-4-4-12 hex characters
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

interface WorkoutHistoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry?: () => void;
  session: WorkoutSession | null;
  allSessions?: WorkoutSession[];
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

function formatWeightValue(value: number | null): string {
  if (value === null || value === undefined) return '—';
  const stringValue = value.toString();
  return stringValue.includes('.')
    ? stringValue.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
    : stringValue;
}

function formatWeightUnit(unit?: WeightUnit | null): string {
  return unit === 'kg' ? 'kg' : 'lbs';
}

function formatSetDetails(set: WorkoutSet): string {
  const weightText = formatWeightValue(set.weight);
  const repsText = set.reps === null || set.reps === undefined ? '—' : set.reps.toString();
  const unitLabel = formatWeightUnit(set.weightUnit);
  return `${repsText} reps × ${weightText} ${unitLabel}`;
}

export function WorkoutHistoryDetailModal({
  visible,
  onClose,
  onRetry,
  session,
  allSessions = [],
}: WorkoutHistoryDetailModalProps) {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const modalStyles = useModalStyles();

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

  const preferredUnits = profile?.preferred_units ?? 'imperial';
  const volumeContext: VolumeContext = {
    preferredUnits,
    weightUnits,
    exercisesById,
    bodyweightKg,
    profileWeightKg: profile?.weight_kg ?? null,
  };
  const summary = getWorkoutSummary(session, volumeContext);
  const sessionPrCount = (() => {
    const targetStartMs = session.startedAt.getTime();
    const priorSessions = allSessions
      .filter((candidate) => candidate.localId !== session.localId)
      .filter((candidate) => candidate.startedAt.getTime() < targetStartMs);

    const priorBestByExercise = new Map<string, number>();

    const updateBestE1rm = (candidateSession: WorkoutSession, target: Map<string, number>) => {
      candidateSession.exercises.forEach((exercise) => {
        const fallbackUnit = weightUnits[exercise.exerciseId];
        const exerciseMeta = exercisesById.get(exercise.exerciseId);
        exercise.sets.forEach((set) => {
          if (!set.isCompleted || set.setType === 'warmup') return;
          if (!set.reps || set.reps <= 0) return;

          const setVolume = getSetVolume(set, volumeContext, {
            exerciseMeta,
            fallbackUnit,
            exerciseName: exercise.exerciseName,
          });
          if (setVolume <= 0) return;

          const effectiveWeight = setVolume / set.reps;
          const e1rm = effectiveWeight * (1 + Math.min(set.reps, 12) / 30);
          const prevBest = target.get(exercise.exerciseId) ?? 0;
          if (e1rm > prevBest) {
            target.set(exercise.exerciseId, e1rm);
          }
        });
      });
    };

    priorSessions.forEach((priorSession) => updateBestE1rm(priorSession, priorBestByExercise));

    const sessionBestByExercise = new Map<string, number>();
    updateBestE1rm(session, sessionBestByExercise);

    let prCount = 0;
    sessionBestByExercise.forEach((sessionBest, exerciseId) => {
      const priorBest = priorBestByExercise.get(exerciseId);
      if (priorBest === undefined || sessionBest > priorBest) {
        prCount += 1;
      }
    });

    return prCount;
  })();
  const durationSeconds = session.durationSeconds === null
    ? null
    : session.durationSeconds ?? summary.durationSeconds;
  const formattedDateTime = format(session.startedAt, "HH:mm, EEEE, MMM d yyyy");
  const volumeLabel = `${formatVolume(summary.totalVolume)} ${formatWeightUnit(
    preferredUnits === 'metric' ? 'kg' : 'lbs'
  )}`;
  const canRetry = !session.isSynced && typeof onRetry === 'function';

  const handleRetryPress = () => {
    if (!canRetry) return;
    onRetry?.();
    onClose();
  };

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
          <Text
            style={[styles.statValue, themedStyles.statValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatDuration(durationSeconds)}
          </Text>
        </View>

        <View style={styles.stat}>
          <ScaleIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text
            style={[styles.statValue, themedStyles.statValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {volumeLabel}
          </Text>
        </View>

        <View style={styles.stat}>
          <TrophyIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text
            style={[styles.statValue, themedStyles.statValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {sessionPrCount} PR{sessionPrCount === 1 ? '' : 's'}
          </Text>
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
                    {formatSetDetails(set)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {canRetry && (
        <View style={[modalStyles.actions, styles.actions]}>
          {canRetry && (
            <Pressable
              onPress={handleRetryPress}
              style={({ pressed }) => [
                modalStyles.successButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={modalStyles.successButtonText}>Retry sync</Text>
            </Pressable>
          )}
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 0,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
    minWidth: 0,
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
  actions: {
    marginTop: Spacing.lg,
  },
});
