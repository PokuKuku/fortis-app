import { useMemo } from 'react';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import type { WorkoutSession, WorkoutExercise, WeightUnit, SetType } from '@/src/types/workout';

interface LastPerformanceSet {
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit | null;
  setType: SetType;
}

export interface LastPerformance {
  setCount: number;
  weight: number | null;
  reps: number | null;
  exerciseId: string;
  weightUnit: WeightUnit | null;
  sets: LastPerformanceSet[];
}

interface WorkoutContext {
  programWorkoutId?: string;
  programId?: string;
  workoutName?: string;
}

/**
 * Hook to fetch the user's last performance for a specific exercise.
 * Returns the last session's sets (weight/reps) and summary details.
 * Uses workout history as the source of truth.
 */
export function useLastExercisePerformance(
  exerciseId: string | undefined,
  context?: WorkoutContext
) {
  const shouldLoad = Boolean(exerciseId);
  const { sessions, isLoading } = useWorkoutHistorySource({ enabled: shouldLoad });

  const lastPerformance = useMemo(
    () => getLatestExercisePerformance(sessions, exerciseId, context),
    [sessions, exerciseId, context]
  );

  return {
    lastPerformance,
    loading: shouldLoad ? isLoading : false,
  };
}

export function getLatestExercisePerformance(
  completedSessions: WorkoutSession[],
  exerciseId: string | undefined,
  context?: WorkoutContext
): LastPerformance | null {
  if (!exerciseId) return null;

  const isMatchingWorkout = (session: WorkoutSession) => {
    if (context?.programWorkoutId) {
      return session.programWorkoutId === context.programWorkoutId;
    }
    if (context?.programId) {
      return session.programId === context.programId;
    }
    if (context?.workoutName) {
      return session.name === context.workoutName;
    }
    return true;
  };

  let latestExercise: WorkoutExercise | null = null;
  let latestTimestamp = -1;

  completedSessions.forEach((session) => {
    if (!isMatchingWorkout(session)) return;
    const exercise = session.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (!exercise) return;

    const timestamp = (session.completedAt ?? session.startedAt).getTime();
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestExercise = exercise;
    }
  });

  if (!latestExercise) return null;

  // Type assertion needed due to TypeScript narrowing limitation with forEach closures
  const exercise = latestExercise as WorkoutExercise;
  const orderedSets = [...exercise.sets]
    .sort((a, b) => a.orderIndex - b.orderIndex);

  if (orderedSets.length === 0) return null;

  return buildLastPerformance(
    exerciseId,
    orderedSets.map((set) => ({
      weight: set.weight ?? null,
      reps: set.reps ?? null,
      weightUnit: set.weightUnit ?? null,
      setType: set.setType || 'normal',
    }))
  );
}

const buildLastPerformance = (
  exerciseId: string,
  sets: LastPerformanceSet[]
): LastPerformance => {
  const lastSet = sets[sets.length - 1];
  return {
    exerciseId,
    setCount: sets.length,
    weight: lastSet?.weight ?? null,
    reps: lastSet?.reps ?? null,
    weightUnit: lastSet?.weightUnit ?? null,
    sets,
  };
};
