import { useState, useEffect } from 'react';
import { getExerciseById } from '@/src/services/exerciseService';
import type { Exercise } from '@/src/types/exercise';

export function useExercisesWithMuscles(exerciseIds: string[]): Exercise[] {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    async function fetchMuscles() {
      if (exerciseIds.length === 0) {
        setExercises([]);
        return;
      }
      const results = await Promise.all(
        exerciseIds.map(id => getExerciseById(id))
      );
      setExercises(results.filter(Boolean) as Exercise[]);
    }
    fetchMuscles();
  }, [exerciseIds.join(',')]);

  return exercises;
}
