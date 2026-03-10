import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { ExerciseWithSource } from '@/src/types/exercise';
import * as ExerciseService from '@/src/services/exerciseService';

/**
 * Hook to load all exercises (base + custom) with automatic refresh on custom exercise changes
 */
export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ExerciseService.getAllExercises();
      setExercises(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();

    // Listen for custom exercise changes
    const subscription = DeviceEventEmitter.addListener(
      'customExerciseUpsert',
      () => {
        ExerciseService.invalidateCustomCache();
        loadExercises();
      }
    );
    const librarySubscription = DeviceEventEmitter.addListener(
      'exerciseLibraryUpdated',
      () => {
        loadExercises();
      }
    );

    return () => {
      subscription.remove();
      librarySubscription.remove();
    };
  }, [loadExercises]);

  return { exercises, loading, error, refresh: loadExercises };
}

/**
 * Hook to load a single exercise by ID
 */
export function useExercise(id: string | undefined) {
  const [exercise, setExercise] = useState<ExerciseWithSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setExercise(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        let data = await ExerciseService.getExerciseById(id);
        if (!data) {
          await ExerciseService.refreshExerciseCache();
          data = await ExerciseService.getExerciseById(id);
        }
        if (!isMounted) return;
        setExercise(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err as Error);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { exercise, loading, error };
}
