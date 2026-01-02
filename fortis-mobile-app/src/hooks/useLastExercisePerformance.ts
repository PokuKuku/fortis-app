import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession, WorkoutExercise, WeightUnit } from '@/src/types/workout';

interface LastPerformanceSet {
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit | null;
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

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Hook to fetch the user's last performance for a specific exercise.
 * Returns the last session's sets (weight/reps) and summary details.
 * Prefers local completed sessions, falling back to Supabase for UUID exercises.
 */
export function useLastExercisePerformance(
  exerciseId: string | undefined,
  context?: WorkoutContext
) {
  const [lastPerformance, setLastPerformance] = useState<LastPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const completedSessions = useWorkoutStore((s) => s.completedSessions);

  const localPerformance = useMemo(
    () => getLatestExercisePerformance(completedSessions, exerciseId, context),
    [completedSessions, exerciseId, context]
  );

  useEffect(() => {
    if (localPerformance) {
      setLastPerformance(localPerformance);
      setLoading(false);
      return;
    }

    if (!context?.programWorkoutId && !context?.programId) {
      setLastPerformance(null);
      setLoading(false);
      return;
    }

    // Skip if no exerciseId or if it's not a valid UUID (local exercise without history)
    if (!exerciseId || !isValidUUID(exerciseId)) {
      setLastPerformance(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    const fetchLastPerformance = async () => {
      setLoading(true);

      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!isActive) return;
        if (!user) {
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        // Find the most recent completed session containing this exercise
        // Then get all non-warmup sets for that exercise in that session
        let query = supabase
          .from('workout_sets')
          .select(`
            id,
            weight,
            reps,
            weight_unit,
            set_number,
            order_index,
            is_warmup,
            is_dropset,
            is_failure,
            session_id,
            workout_sessions!inner (
              id,
              user_id,
              completed_at
            )
          `)
          .eq('exercise_id', exerciseId)
          .eq('workout_sessions.user_id', user.id)
          .not('workout_sessions.completed_at', 'is', null)
          .eq('is_warmup', false)
          .order('workout_sessions(completed_at)', { ascending: false })
          .order('set_number', { ascending: true });

        // Only add context filters if they are valid UUIDs (local IDs like 'default-template-upper' are not valid)
        if (context?.programWorkoutId && isValidUUID(context.programWorkoutId)) {
          query = query.eq('workout_sessions.program_workout_id', context.programWorkoutId);
        } else if (context?.programId && isValidUUID(context.programId)) {
          query = query.eq('workout_sessions.program_id', context.programId);
        }

        const { data: sets, error } = await query;

        if (!isActive) return;
        if (error) {
          console.error('Error fetching last performance:', error);
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        if (!sets || sets.length === 0) {
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        // Get the session_id of the most recent session
        const mostRecentSessionId = sets[0].session_id;

        // Filter sets to only include those from the most recent session
        const setsFromLastSession = sets.filter(s => s.session_id === mostRecentSessionId);

        const orderedSets = [...setsFromLastSession].sort((a, b) => {
          const aOrder = a.order_index ?? a.set_number ?? 0;
          const bOrder = b.order_index ?? b.set_number ?? 0;
          return aOrder - bOrder;
        });

        if (!isActive) return;
        setLastPerformance(buildLastPerformance(exerciseId, orderedSets.map((set) => ({
          weight: set.weight ?? null,
          reps: set.reps ?? null,
          weightUnit: (set as { weight_unit?: WeightUnit | null }).weight_unit ?? null,
        }))));
      } catch (err) {
        console.error('Error in useLastExercisePerformance:', err);
        if (!isActive) return;
        setLastPerformance(null);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    fetchLastPerformance();

    return () => {
      isActive = false;
    };
  }, [exerciseId, localPerformance, context]);

  return { lastPerformance, loading };
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
    return false;
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

  const orderedSets = [...latestExercise.sets]
    .filter((set) => set.setType !== 'warmup')
    .sort((a, b) => a.orderIndex - b.orderIndex);

  if (orderedSets.length === 0) return null;

  return buildLastPerformance(
    exerciseId,
    orderedSets.map((set) => ({
      weight: set.weight ?? null,
      reps: set.reps ?? null,
      weightUnit: set.weightUnit ?? null,
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
