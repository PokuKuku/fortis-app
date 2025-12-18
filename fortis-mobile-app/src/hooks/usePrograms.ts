import { useState, useEffect, useCallback } from 'react';
import { ProgramDetail, WorkoutDetail } from '@/src/types/program';
import * as ProgramService from '@/src/services/programService';

/**
 * Hook to load all programs with refresh capability
 */
export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProgramService.getAllPrograms();
      setPrograms(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  return { programs, loading, error, refresh: loadPrograms };
}

/**
 * Hook to load a single program by ID with refresh capability
 */
export function useProgram(id: string | undefined) {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProgram = useCallback(async () => {
    if (!id) {
      setProgram(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await ProgramService.getProgramById(id);
      setProgram(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  return { program, loading, error, refresh: loadProgram };
}

/**
 * Hook to load all workouts with refresh capability
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProgramService.getAllWorkouts();
      setWorkouts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return { workouts, loading, error, refresh: loadWorkouts };
}

/**
 * Hook to load a single workout by ID with refresh capability
 */
export function useWorkout(id: string | undefined) {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWorkout = useCallback(async () => {
    if (!id) {
      setWorkout(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await ProgramService.getWorkoutById(id);
      setWorkout(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  return { workout, loading, error, refresh: loadWorkout };
}
