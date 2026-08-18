import { useState, useEffect } from 'react';
import { getExerciseById } from '@/src/services/exerciseService';
import type { Exercise } from '@/src/types/exercise';

// Fetches full exercise metadata for a list of IDs (used for muscle attribution).
export function useExercisesWithMuscles(
  exerciseIds: string[],
  options?: { enabled?: boolean }
): Exercise[] {
  const enabled = options?.enabled ?? true;
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchMuscles() {
      if (!enabled || exerciseIds.length === 0) {
        setExercises([]);
        return;
      }
      const results = await Promise.all(
        exerciseIds.map(id => getExerciseById(id))
      );
      if (!isMounted) return;
      setExercises(results.filter(Boolean) as Exercise[]);
    }
    void fetchMuscles();
    return () => {
      isMounted = false;
    };
  }, [enabled, exerciseIds.join(',')]);

  return exercises;
}
