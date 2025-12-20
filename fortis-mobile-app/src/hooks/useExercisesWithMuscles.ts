import { useState, useEffect } from 'react';
import { getExerciseById } from '@/src/services/exerciseService';

interface ExerciseWithMuscles {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
}

export function useExercisesWithMuscles(exerciseIds: string[]): ExerciseWithMuscles[] {
  const [exercises, setExercises] = useState<ExerciseWithMuscles[]>([]);

  useEffect(() => {
    async function fetchMuscles() {
      if (exerciseIds.length === 0) {
        setExercises([]);
        return;
      }
      const results = await Promise.all(
        exerciseIds.map(id => getExerciseById(id))
      );
      setExercises(
        results
          .filter(Boolean)
          .map(ex => ({
            primaryMuscles: ex!.primaryMuscles,
            secondaryMuscles: ex!.secondaryMuscles,
          }))
      );
    }
    fetchMuscles();
  }, [exerciseIds.join(',')]);

  return exercises;
}
