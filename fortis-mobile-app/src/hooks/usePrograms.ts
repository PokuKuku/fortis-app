import { useState, useEffect, useCallback } from 'react';
import {
  ProgramDetail,
  WorkoutDetail,
  WorkoutExerciseDetail,
  HubStats,
  ProgramWorkout as HubProgramWorkout,
  ProgramExercise as HubProgramExercise,
} from '@/src/types/program';
import * as ProgramService from '@/src/services/programService';
import { useProgramsStore } from '@/src/store/programsStore';
import { getExerciseById } from '@/src/services/exerciseService';
import {
  ProgramWorkout as StoreProgramWorkout,
  ProgramExercise as StoreProgramExercise,
  Program as StoreProgram,
} from '@/src/types/workout';

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
 * Searches both ProgramService (sample programs) and programsStore (user programs)
 */
export function useProgram(id: string | undefined) {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storePrograms = useProgramsStore((state) => state.programs);

  const loadProgram = useCallback(async () => {
    if (!id) {
      setProgram(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First try ProgramService (sample/default programs)
      const data = await ProgramService.getProgramById(id);
      if (data) {
        setProgram(data);
        setError(null);
        return;
      }

      // If not found, search programsStore (user-created programs)
      const foundProgram = storePrograms.find((p) => p.id === id);
      if (foundProgram) {
        const converted = await convertStoreProgramToDetail(foundProgram);
        setProgram(converted);
        setError(null);
        return;
      }

      // Not found in either source
      setProgram(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id, storePrograms]);

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
 * Convert a store ProgramExercise to hub ProgramExercise with metadata lookup
 */
async function convertStoreExerciseToHub(
  exercise: StoreProgramExercise,
  index: number
): Promise<HubProgramExercise> {
  // Try to get exercise metadata from the exercise library
  const exerciseData = await getExerciseById(exercise.exerciseId);

  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    orderIndex: exercise.orderIndex ?? index,
    targetSets: exercise.sets,
    targetReps: exercise.reps,
    restSeconds: exercise.restSeconds,
    notes: exercise.notes,
    primaryMuscles: exerciseData?.primaryMuscles ?? [],
    images: exerciseData?.images ?? [],
  };
}

/**
 * Convert a store ProgramWorkout to hub ProgramWorkout format
 */
async function convertStoreWorkoutToHub(
  workout: StoreProgramWorkout
): Promise<HubProgramWorkout> {
  const exercises = await Promise.all(
    workout.exercises.map((ex, index) => convertStoreExerciseToHub(ex, index))
  );

  return {
    id: workout.id,
    name: workout.name,
    description: undefined,
    dayNumber: workout.dayNumber,
    exercises,
  };
}

/**
 * Convert a store Program to hub ProgramDetail format
 */
async function convertStoreProgramToDetail(
  program: StoreProgram
): Promise<ProgramDetail> {
  // Convert all workouts with metadata lookup
  const workouts = await Promise.all(
    program.workouts.map((w) => convertStoreWorkoutToHub(w))
  );

  // Create empty stats (user programs don't have pre-computed stats)
  const emptyStats: HubStats = {
    timesCompleted: 0,
    volumeHistory: [],
    repsHistory: [],
    durationHistory: [],
  };

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    difficulty: program.difficulty,
    durationWeeks: program.durationWeeks ?? 0,
    goal: program.goal,
    createdBy: program.createdBy,
    isPublic: program.isPublic,
    workouts,
    stats: emptyStats,
    lastPerformed: program.lastPerformedAt ?? undefined,
  };
}

/**
 * Convert a store ProgramWorkout to WorkoutDetail format (for standalone workout view)
 */
async function convertProgramWorkoutToDetail(
  programWorkout: StoreProgramWorkout,
  lastPerformedAt?: string | null
): Promise<WorkoutDetail> {
  // Convert all exercises with metadata lookup
  const exercises = await Promise.all(
    programWorkout.exercises.map(async (ex, index) => {
      const exerciseData = await getExerciseById(ex.exerciseId);
      return {
        id: ex.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        orderIndex: ex.orderIndex ?? index,
        targetSets: ex.sets,
        targetReps: ex.reps,
        primaryMuscles: exerciseData?.primaryMuscles ?? [],
        images: exerciseData?.images ?? [],
      } as WorkoutExerciseDetail;
    })
  );

  // Create empty stats (user workouts don't have pre-computed stats)
  const emptyStats: HubStats = {
    timesCompleted: 0,
    volumeHistory: [],
    repsHistory: [],
    durationHistory: [],
  };

  return {
    id: programWorkout.id,
    name: programWorkout.name,
    description: undefined,
    exercises,
    stats: emptyStats,
    lastPerformed: lastPerformedAt ?? undefined,
  };
}

/**
 * Hook to load a single workout by ID with refresh capability
 * Searches both ProgramService (sample workouts) and programsStore (user workouts)
 */
export function useWorkout(id: string | undefined) {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const programs = useProgramsStore((state) => state.programs);

  const loadWorkout = useCallback(async () => {
    if (!id) {
      setWorkout(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First try ProgramService (sample/default workouts)
      const data = await ProgramService.getWorkoutById(id);
      if (data) {
        setWorkout(data);
        setError(null);
        return;
      }

      // If not found, search programsStore (user-created workouts)
      for (const program of programs) {
        const foundWorkout = program.workouts.find((w) => w.id === id);
        if (foundWorkout) {
          const converted = await convertProgramWorkoutToDetail(
            foundWorkout,
            program.lastPerformedAt
          );
          setWorkout(converted);
          setError(null);
          return;
        }
      }

      // Check if ID matches a template (program with isTemplate: true)
      const template = programs.find((p) => p.id === id && p.isTemplate);
      if (template && template.workouts[0]) {
        const converted = await convertProgramWorkoutToDetail(
          template.workouts[0],
          template.lastPerformedAt
        );
        // Use template name instead of workout name
        converted.name = template.name;
        converted.id = template.id;
        setWorkout(converted);
        setError(null);
        return;
      }

      // Not found in either source
      setWorkout(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id, programs]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  return { workout, loading, error, refresh: loadWorkout };
}
