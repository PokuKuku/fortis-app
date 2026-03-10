import { useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';

export interface ProfileStats {
  totalVolume: number;        // Normalized volume across all sessions
  totalWorkouts: number;      // Count of completed sessions
  totalTimeSeconds: number;   // Sum of all workout durations
  uniqueExercises: number;    // Count of unique exercise IDs
  lastWorkoutDate: Date | null;
}

const EMPTY_STATS: ProfileStats = {
  totalVolume: 0,
  totalWorkouts: 0,
  totalTimeSeconds: 0,
  uniqueExercises: 0,
  lastWorkoutDate: null,
};

/**
 * Hook to aggregate workout statistics from the workout history source.
 */
export function useProfileStats(): ProfileStats {
  const { sessions } = useWorkoutHistorySource();
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const preferredUnits = profile?.preferred_units ?? 'imperial';

  return useMemo(() => {
    if (sessions.length === 0) return EMPTY_STATS;

    let totalVolume = 0;
    let totalWorkouts = 0;
    let totalTimeSeconds = 0;
    const uniqueExercises = new Set<string>();
    const volumeContext: VolumeContext = {
      preferredUnits,
      weightUnits,
      exercisesById,
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
    };

    sessions.forEach((session) => {
      let hasCompletedSet = false;
      session.exercises.forEach((exercise) => {
        uniqueExercises.add(exercise.exerciseId);
        const exerciseMeta = exercisesById?.get(exercise.exerciseId);
        const fallbackUnit = weightUnits?.[exercise.exerciseId];
        exercise.sets.forEach((set) => {
          if (!set.isCompleted) return;
          hasCompletedSet = true;
          totalVolume += getSetVolume(set, volumeContext, {
            exerciseMeta,
            fallbackUnit,
            exerciseName: exercise.exerciseName,
          });
        });
      });

      if (!hasCompletedSet) return;
      totalWorkouts += 1;
      const durationSeconds = session.durationSeconds
        ?? (session.completedAt
          ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
          : 0);
      totalTimeSeconds += Math.max(0, durationSeconds);
    });

    const lastSession = sessions[0];
    const lastWorkoutDate = lastSession?.completedAt ?? lastSession?.startedAt ?? null;

    return {
      totalVolume: Math.round(totalVolume),
      totalWorkouts,
      totalTimeSeconds,
      uniqueExercises: uniqueExercises.size,
      lastWorkoutDate,
    };
  }, [
    sessions,
    preferredUnits,
    weightUnits,
    exercisesById,
    bodyweightKg,
    profile?.weight_kg,
  ]);
}
