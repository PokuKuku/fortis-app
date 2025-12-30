import { useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useExercises } from '@/src/hooks/useExercises';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  reps: number;          // Reps at max weight
  date: Date;
}

/**
 * Hook to calculate top personal records across all exercises.
 * Returns the top 5 exercises by max weight lifted (non-warmup sets only).
 */
export function useTopPersonalRecords(limit: number = 5): PersonalRecord[] {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const { exercises } = useExercises();

  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach(exercise => {
      map.set(exercise.id, exercise.name);
      if (exercise.slug) {
        map.set(exercise.slug, exercise.name);
      }
    });
    return map;
  }, [exercises]);

  return useMemo(() => {
    // Map to store best lift per exercise
    const prMap = new Map<string, PersonalRecord>();

    for (const session of completedSessions) {
      const sessionDate = new Date(session.completedAt || session.startedAt);

      for (const exercise of session.exercises) {
        for (const set of exercise.sets) {
          // Only count completed, non-warmup sets
          if (set.isCompleted && set.setType !== 'warmup' && set.weight && set.weight > 0) {
            const existingPR = prMap.get(exercise.exerciseId);

            // Update if this is a new PR (higher weight)
            if (!existingPR || set.weight > existingPR.maxWeight) {
              const resolvedName = exerciseNameById.get(exercise.exerciseId);
              prMap.set(exercise.exerciseId, {
                exerciseId: exercise.exerciseId,
                exerciseName: resolvedName || exercise.exerciseName || 'Unknown Exercise',
                maxWeight: set.weight,
                reps: set.reps || 0,
                date: sessionDate,
              });
            }
          }
        }
      }
    }

    // Convert to array and sort by max weight descending
    const prs = Array.from(prMap.values());
    prs.sort((a, b) => b.maxWeight - a.maxWeight);

    // Return top N
    return prs.slice(0, limit);
  }, [completedSessions, limit, exerciseNameById]);
}
