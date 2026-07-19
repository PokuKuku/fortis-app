import { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { ExerciseWithSource } from '@/src/types/exercise';
import * as ExerciseService from '@/src/services/exerciseService';

/**
 * Hook to load all exercises (base + custom) with automatic refresh on custom exercise changes
 */
export function useExercises(options?: { enabled?: boolean; deferInitialSnapshot?: boolean }) {
  const enabled = options?.enabled ?? true;
  const deferInitialSnapshot = options?.deferInitialSnapshot ?? false;
  const [exercises, setExercises] = useState<ExerciseWithSource[]>(() =>
    enabled
      ? deferInitialSnapshot
        ? ExerciseService.getCachedInitialExercisesSync() ?? []
        : ExerciseService.getInitialExercisesSync()
      : []
  );
  const exercisesRef = useRef(exercises);
  const [loading, setLoading] = useState(enabled && exercises.length === 0);
  const [error, setError] = useState<Error | null>(null);

  const loadExercises = useCallback(async (options?: { showLoading?: boolean }) => {
    try {
      if (options?.showLoading || exercisesRef.current.length === 0) {
        setLoading(true);
      }
      if (deferInitialSnapshot && exercisesRef.current.length === 0) {
        const initial = ExerciseService.getInitialExercisesSync();
        exercisesRef.current = initial;
        setExercises(initial);
        setLoading(false);
      }
      const data = await ExerciseService.getAllExercises();
      exercisesRef.current = data;
      setExercises(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [deferInitialSnapshot]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    loadExercises({ showLoading: false });

    // Listen for custom exercise changes
    const subscription = DeviceEventEmitter.addListener(
      'customExerciseUpsert',
      () => {
        ExerciseService.invalidateCustomCache();
        loadExercises({ showLoading: false });
      }
    );
    const librarySubscription = DeviceEventEmitter.addListener(
      'exerciseLibraryUpdated',
      () => {
        loadExercises({ showLoading: false });
      }
    );

    return () => {
      subscription.remove();
      librarySubscription.remove();
    };
  }, [enabled, loadExercises]);

  const refresh = useCallback(() => loadExercises({ showLoading: true }), [loadExercises]);

  return { exercises, loading, error, refresh };
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
