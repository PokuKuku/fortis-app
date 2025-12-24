import { useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';

export interface ProfileStats {
  totalVolume: number;        // Sum of weight × reps across all sessions
  totalWorkouts: number;      // Count of completed sessions
  totalTimeSeconds: number;   // Sum of all workout durations
  uniqueExercises: number;    // Count of unique exercise IDs
  lastWorkoutDate: Date | null;
}

/**
 * Hook to calculate aggregate workout statistics for the profile page.
 * All calculations are derived from locally stored completedSessions.
 */
export function useProfileStats(): ProfileStats {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);

  return useMemo(() => {
    if (completedSessions.length === 0) {
      return {
        totalVolume: 0,
        totalWorkouts: 0,
        totalTimeSeconds: 0,
        uniqueExercises: 0,
        lastWorkoutDate: null,
      };
    }

    let totalVolume = 0;
    let totalTimeSeconds = 0;
    const exerciseIds = new Set<string>();
    let lastWorkoutDate: Date | null = null;

    for (const session of completedSessions) {
      // Calculate duration from startedAt and completedAt
      if (session.startedAt && session.completedAt) {
        const startTime = new Date(session.startedAt).getTime();
        const endTime = new Date(session.completedAt).getTime();
        const durationSeconds = Math.floor((endTime - startTime) / 1000);
        if (durationSeconds > 0) {
          totalTimeSeconds += durationSeconds;
        }
      }

      // Track last workout date
      const sessionDate = session.completedAt
        ? new Date(session.completedAt)
        : new Date(session.startedAt);
      if (!lastWorkoutDate || sessionDate > lastWorkoutDate) {
        lastWorkoutDate = sessionDate;
      }

      // Process exercises and sets
      for (const exercise of session.exercises) {
        exerciseIds.add(exercise.exerciseId);

        for (const set of exercise.sets) {
          // Only count completed, non-warmup sets for volume
          if (set.isCompleted && set.setType !== 'warmup') {
            const weight = set.weight || 0;
            const reps = set.reps || 0;
            totalVolume += weight * reps;
          }
        }
      }
    }

    return {
      totalVolume: Math.round(totalVolume),
      totalWorkouts: completedSessions.length,
      totalTimeSeconds,
      uniqueExercises: exerciseIds.size,
      lastWorkoutDate,
    };
  }, [completedSessions]);
}
