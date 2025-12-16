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

    return () => subscription.remove();
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
    if (!id) {
      setExercise(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    ExerciseService.getExerciseById(id)
      .then(data => {
        setExercise(data);
        setError(null);
      })
      .catch(err => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { exercise, loading, error };
}
