import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ProgramDetail,
  WorkoutDetail,
  WorkoutExerciseDetail,
  HubStats,
  ProgramWorkout as HubProgramWorkout,
  ProgramExercise as HubProgramExercise,
} from '@/src/types/program';
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
  const storePrograms = useProgramsStore((state) => state.programs);
  const fetchPrograms = useProgramsStore((state) => state.fetchPrograms);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    let isMounted = true;
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const programDetails = await Promise.all(
          storePrograms
            .filter((program) => !program.isTemplate)
            .map((program) => convertStoreProgramToDetail(program))
        );
        if (isMounted) {
          setPrograms(programDetails);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [storePrograms]);

  const refresh = useCallback(() => fetchPrograms({ force: true }), [fetchPrograms]);

  return { programs, loading, error, refresh };
}

/**
 * Hook to load a single program by ID with refresh capability
 * Searches programsStore (defaults and user programs)
 */
export function useProgram(id: string | undefined) {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storePrograms = useProgramsStore((state) => state.programs);
  const fetchPrograms = useProgramsStore((state) => state.fetchPrograms);

  // Track current program for deletion optimization (avoids stale closure)
  const programRef = useRef<ProgramDetail | null>(null);
  programRef.current = program;

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    let isMounted = true;
    const loadProgram = async () => {
      if (!id) {
        if (isMounted) {
          setProgram(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const foundProgram = storePrograms.find((p) => p.id === id && !p.isTemplate);
        if (foundProgram) {
          // OPTIMIZATION: Check if this is just an exercise deletion
          // If so, skip expensive reconversion and just filter the existing data
          const currentProgram = programRef.current;
          if (currentProgram) {
            const currentExerciseIds = new Set(
              currentProgram.workouts.flatMap(w => w.exercises.map(e => e.id))
            );
            const newExerciseIds = new Set(
              foundProgram.workouts.flatMap(w => w.exercises.map(e => e.id))
            );

            // If new exercises are a subset of current (deletion only), just filter
            const isSubset = Array.from(newExerciseIds).every(exId => currentExerciseIds.has(exId));
            const isDeletion = newExerciseIds.size < currentExerciseIds.size;

            if (isSubset && isDeletion) {
              // Skip expensive reconversion - just filter deleted exercises
              if (isMounted) {
                setProgram(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    workouts: prev.workouts.map((w, idx) => ({
                      ...w,
                      exercises: w.exercises.filter(e =>
                        foundProgram.workouts[idx]?.exercises.some(fe => fe.id === e.id)
                      )
                    }))
                  };
                });
                setLoading(false);
              }
              return;
            }
          }

          // Full conversion for initial load or additions
          const converted = await convertStoreProgramToDetail(foundProgram);
          if (isMounted) {
            setProgram(converted);
            setError(null);
          }
          return;
        }

        if (isMounted) {
          setProgram(null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgram();

    return () => {
      isMounted = false;
    };
  }, [id, storePrograms]);

  const refresh = useCallback(() => fetchPrograms({ force: true }), [fetchPrograms]);

  return { program, loading, error, refresh };
}

/**
 * Hook to load all workouts with refresh capability
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storePrograms = useProgramsStore((state) => state.programs);
  const fetchPrograms = useProgramsStore((state) => state.fetchPrograms);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    let isMounted = true;
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const templateDetails = await Promise.all(
          storePrograms
            .filter((program) => program.isTemplate && program.workouts[0])
            .map((template) => convertProgramWorkoutToDetail(
              template.workouts[0],
              template.lastPerformedAt
            ))
        );
        if (isMounted) {
          setWorkouts(templateDetails);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isMounted = false;
    };
  }, [storePrograms]);

  const refresh = useCallback(() => fetchPrograms({ force: true }), [fetchPrograms]);

  return { workouts, loading, error, refresh };
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
    secondaryMuscles: exerciseData?.secondaryMuscles ?? [],
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
        secondaryMuscles: exerciseData?.secondaryMuscles ?? [],
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
 * Searches programsStore templates and program workouts
 */
export function useWorkout(id: string | undefined) {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const programs = useProgramsStore((state) => state.programs);
  const fetchPrograms = useProgramsStore((state) => state.fetchPrograms);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    let isMounted = true;
    const loadWorkout = async () => {
      if (!id) {
        if (isMounted) {
          setWorkout(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        for (const program of programs) {
          const foundWorkout = program.workouts.find((w) => w.id === id);
          if (foundWorkout) {
            const converted = await convertProgramWorkoutToDetail(
              foundWorkout,
              program.lastPerformedAt
            );
            if (isMounted) {
              setWorkout(converted);
              setError(null);
            }
            return;
          }
        }

        const template = programs.find((p) => p.id === id && p.isTemplate);
        if (template && template.workouts[0]) {
          const converted = await convertProgramWorkoutToDetail(
            template.workouts[0],
            template.lastPerformedAt
          );
          converted.name = template.name;
          converted.id = template.id;
          if (isMounted) {
            setWorkout(converted);
            setError(null);
          }
          return;
        }

        if (isMounted) {
          setWorkout(null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWorkout();

    return () => {
      isMounted = false;
    };
  }, [id, programs]);

  const refresh = useCallback(() => fetchPrograms({ force: true }), [fetchPrograms]);

  return { workout, loading, error, refresh };
}
