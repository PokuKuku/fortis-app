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
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { getSessionVolume } from '@/src/utils/workoutVolume';
import { getExerciseById, isCustomExercise } from '@/src/services/exerciseService';
import {
  ProgramWorkout as StoreProgramWorkout,
  ProgramExercise as StoreProgramExercise,
  Program as StoreProgram,
} from '@/src/types/workout';
import type { WorkoutSession, WeightUnit } from '@/src/types/workout';

/**
 * Hook to load all programs with refresh capability
 */
export function usePrograms() {
  const [programs, setPrograms] = useState<ProgramDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storePrograms = useProgramsStore((state) => state.programs);
  const fetchPrograms = useProgramsStore((state) => state.fetchPrograms);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { profile } = useAuth();
  const preferredUnits = profile?.preferred_units ?? 'imperial';

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
              .map((program) =>
                convertStoreProgramToDetail(
                  program,
                  completedSessions,
                  preferredUnits,
                  weightUnits
                )
              )
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
  }, [storePrograms, completedSessions, preferredUnits, weightUnits]);

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
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { profile } = useAuth();
  const preferredUnits = profile?.preferred_units ?? 'imperial';

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
          // OPTIMIZATION: If this is a deletion-only update (exercises/workouts removed),
          // skip expensive reconversion and just filter existing data.
          const currentProgram = programRef.current;
          if (currentProgram) {
            const currentWorkoutIds = currentProgram.workouts.map((w) => w.id);
            const nextWorkoutIds = foundProgram.workouts.map((w) => w.id);
            const workoutIdsSubset = nextWorkoutIds.every((id) => currentWorkoutIds.includes(id));
            const workoutDeletionOnly =
              workoutIdsSubset && nextWorkoutIds.length < currentWorkoutIds.length;

            const currentExerciseIds = new Set(
              currentProgram.workouts.flatMap((w) => w.exercises.map((e) => e.id))
            );
            const nextExerciseIds = new Set(
              foundProgram.workouts.flatMap((w) => w.exercises.map((e) => e.id))
            );

            const exerciseIdsSubset = Array.from(nextExerciseIds).every((exId) =>
              currentExerciseIds.has(exId)
            );
            const exerciseDeletionOnly = nextExerciseIds.size < currentExerciseIds.size;

            if (
              workoutIdsSubset &&
              exerciseIdsSubset &&
              (workoutDeletionOnly || exerciseDeletionOnly)
            ) {
              const nextWorkoutMap = new Map(
                foundProgram.workouts.map((workout) => [workout.id, workout])
              );

              if (isMounted) {
                setProgram((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    workouts: prev.workouts
                      .filter((workout) => nextWorkoutMap.has(workout.id))
                      .map((workout) => {
                        const nextWorkout = nextWorkoutMap.get(workout.id);
                        const nextExerciseIdsForWorkout = new Set(
                          nextWorkout?.exercises.map((exercise) => exercise.id) ?? []
                        );
                        return {
                          ...workout,
                          dayNumber: nextWorkout?.dayNumber ?? workout.dayNumber,
                          exercises: workout.exercises.filter((exercise) =>
                            nextExerciseIdsForWorkout.has(exercise.id)
                          ),
                        };
                      }),
                  };
                });
                setLoading(false);
              }
              return;
            }
          }

          // Full conversion for initial load or additions
          const converted = await convertStoreProgramToDetail(
            foundProgram,
            completedSessions,
            preferredUnits,
            weightUnits
          );
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
  }, [id, storePrograms, completedSessions, preferredUnits, weightUnits]);

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
  const displayName = isCustomExercise(exercise.exerciseId)
    ? exercise.exerciseName
    : exerciseData?.name ?? exercise.exerciseName;

  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    exerciseName: displayName,
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
  program: StoreProgram,
  completedSessions: WorkoutSession[],
  preferredUnits: 'imperial' | 'metric',
  weightUnits: Record<string, WeightUnit>
): Promise<ProgramDetail> {
  // Convert all workouts with metadata lookup
  const workouts = await Promise.all(
    program.workouts.map((w) => convertStoreWorkoutToHub(w))
  );

  const stats = buildProgramStats(program.id, completedSessions, preferredUnits, weightUnits);

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
    stats,
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
      const displayName = isCustomExercise(ex.exerciseId)
        ? ex.exerciseName
        : exerciseData?.name ?? ex.exerciseName;
      return {
        id: ex.id,
        exerciseId: ex.exerciseId,
        exerciseName: displayName,
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

const buildProgramStats = (
  programId: string,
  completedSessions: WorkoutSession[],
  preferredUnits: 'imperial' | 'metric',
  weightUnits: Record<string, WeightUnit>
): HubStats => {
  const sessions = completedSessions.filter(
    (session) => session.programId === programId && session.completedAt
  );

  if (sessions.length === 0) {
    return {
      timesCompleted: 0,
      volumeHistory: [],
      repsHistory: [],
      durationHistory: [],
    };
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return aTime - bTime;
  });

  const historyLimit = 8;
  const recentSessions = sortedSessions.slice(-historyLimit);

  const volumeHistory = recentSessions.map((session) => {
    const totalVolume = getSessionVolume(session, preferredUnits, weightUnits);
    return {
      date: session.completedAt ? new Date(session.completedAt).toISOString() : new Date().toISOString(),
      value: Math.round(totalVolume),
    };
  });

  const repsHistory = recentSessions.map((session) => {
    const summary = getWorkoutSummary(session);
    return {
      date: session.completedAt ? new Date(session.completedAt).toISOString() : new Date().toISOString(),
      value: summary.totalReps,
    };
  });

  const durationHistory = recentSessions.map((session) => {
    const summary = getWorkoutSummary(session);
    const durationSeconds = session.durationSeconds ?? summary.durationSeconds;
    return {
      date: session.completedAt ? new Date(session.completedAt).toISOString() : new Date().toISOString(),
      value: Math.max(0, Math.round(durationSeconds)),
    };
  });

  return {
    timesCompleted: sessions.length,
    volumeHistory,
    repsHistory,
    durationHistory,
  };
};

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
