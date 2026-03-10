import { useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';

interface RecordEntry {
  value: number;
  date: Date;
}

interface WeightRecord extends RecordEntry {
  reps: number;
}

interface RepsRecord extends RecordEntry {
  weight: number;
}

export interface ExerciseRecords {
  maxWeight: WeightRecord | null;
  maxReps: RepsRecord | null;
  maxVolume: RecordEntry | null;
  estimated1RM: RecordEntry | null;
  totalSets: number;
  totalWorkouts: number;
}

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function useExerciseRecords(exerciseId: string | undefined): ExerciseRecords {
  const { sessions } = useWorkoutHistorySource({ enabled: Boolean(exerciseId) });
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const preferredUnits = profile?.preferred_units ?? 'imperial';

  return useMemo(() => {
    const emptyRecords: ExerciseRecords = {
      maxWeight: null,
      maxReps: null,
      maxVolume: null,
      estimated1RM: null,
      totalSets: 0,
      totalWorkouts: 0,
    };

    if (!exerciseId) return emptyRecords;

    let maxWeight: WeightRecord | null = null;
    let maxReps: RepsRecord | null = null;
    let maxVolume: RecordEntry | null = null;
    let best1RM: RecordEntry | null = null;
    let totalSets = 0;
    let totalWorkouts = 0;

    const volumeContext: VolumeContext = {
      preferredUnits,
      weightUnits,
      exercisesById,
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
    };

    for (const session of sessions) {
      const exerciseData = session.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      );

      if (!exerciseData) continue;

      const completedSets = exerciseData.sets.filter((s) => s.isCompleted);
      if (completedSets.length === 0) continue;

      totalWorkouts++;
      const sessionDate = new Date(session.completedAt || session.startedAt);

      // Calculate session volume for this exercise
      let sessionVolume = 0;

      const exerciseMeta = exercisesById?.get(exerciseId);
      const fallbackUnit = weightUnits?.[exerciseId];

      for (const set of completedSets) {
        totalSets++;
        const weight = set.weight || 0;
        const reps = set.reps || 0;

        sessionVolume += getSetVolume(set, volumeContext, {
          exerciseMeta,
          fallbackUnit,
          exerciseName: exerciseData.exerciseName,
        });

        // Check max weight (only non-warmup sets)
        if (set.setType !== 'warmup' && weight > 0) {
          if (!maxWeight || weight > maxWeight.value) {
            maxWeight = { value: weight, date: sessionDate, reps };
          }
        }

        // Check max reps
        if (reps > 0) {
          if (!maxReps || reps > maxReps.value) {
            maxReps = { value: reps, date: sessionDate, weight };
          }
        }

        // Calculate and check estimated 1RM (only non-warmup sets)
        if (set.setType !== 'warmup' && weight > 0 && reps > 0) {
          const e1rm = calculateEstimated1RM(weight, reps);
          if (!best1RM || e1rm > best1RM.value) {
            best1RM = { value: e1rm, date: sessionDate };
          }
        }
      }

      // Check max volume (single session)
      if (sessionVolume > 0) {
        if (!maxVolume || sessionVolume > maxVolume.value) {
          maxVolume = { value: sessionVolume, date: sessionDate };
        }
      }
    }

    return {
      maxWeight,
      maxReps,
      maxVolume,
      estimated1RM: best1RM,
      totalSets,
      totalWorkouts,
    };
  }, [
    exerciseId,
    sessions,
    preferredUnits,
    weightUnits,
    exercisesById,
    bodyweightKg,
    profile?.weight_kg,
  ]);
}
