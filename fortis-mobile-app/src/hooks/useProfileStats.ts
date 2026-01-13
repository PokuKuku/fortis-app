import { useMemo } from 'react';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';

export interface ProfileStats {
  totalVolume: number;        // Sum of weight × reps across all sessions
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

  return useMemo(() => {
    if (sessions.length === 0) return EMPTY_STATS;

    let totalVolume = 0;
    let totalWorkouts = 0;
    let totalTimeSeconds = 0;
    const uniqueExercises = new Set<string>();

    sessions.forEach((session) => {
      let hasCompletedSet = false;
      session.exercises.forEach((exercise) => {
        uniqueExercises.add(exercise.exerciseId);
        exercise.sets.forEach((set) => {
          if (!set.isCompleted) return;
          hasCompletedSet = true;
          const weight = set.weight ?? 0;
          const reps = set.reps ?? 0;
          totalVolume += weight * reps;
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
  }, [sessions]);
}
