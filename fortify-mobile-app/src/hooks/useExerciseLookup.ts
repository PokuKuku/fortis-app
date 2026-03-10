import { useMemo } from 'react';
import { useExercises } from '@/src/hooks/useExercises';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { ExerciseVolumeMeta } from '@/src/utils/workoutVolume';

type ExerciseLookupResult = {
  exercisesById: Map<string, ExerciseVolumeMeta>;
  loading: boolean;
  error: Error | null;
};

export function useExerciseLookup(): ExerciseLookupResult {
  const { exercises, loading, error } = useExercises();

  const exercisesById = useMemo(() => {
    const lookup = new Map<string, ExerciseVolumeMeta>();
    exercises.forEach((exercise) => {
      lookup.set(exercise.id, exercise);
      if (exercise.slug) {
        lookup.set(exercise.slug, exercise);
      }
    });
    return lookup;
  }, [exercises]);

  return { exercisesById, loading, error };
}
