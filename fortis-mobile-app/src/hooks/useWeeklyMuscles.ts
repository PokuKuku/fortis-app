import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { startOfDay, startOfWeek, isAfter, isBefore, isEqual } from 'date-fns';

interface ExerciseWithMuscles {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
}

/**
 * Hook to aggregate muscle data from the current week's completed workouts.
 * Resets every Monday. Returns an array of exercises with their muscle groups for use with MuscleHeatmap.
 */
export function useWeeklyMuscles(): {
  exercises: ExerciseWithMuscles[];
  loading: boolean;
  hasWorkouts: boolean;
} {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const [exercises, setExercises] = useState<ExerciseWithMuscles[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract unique exercise IDs from sessions in the current week (Monday-Sunday)
  const weeklyExerciseIds = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday

    const exerciseIdSet = new Set<string>();

    for (const session of completedSessions) {
      const sessionDate = startOfDay(
        new Date(session.completedAt || session.startedAt)
      );

      // Check if session is within current week (Monday to today)
      if (
        (isAfter(sessionDate, weekStart) || isEqual(sessionDate, weekStart)) &&
        (isBefore(sessionDate, today) || isEqual(sessionDate, today))
      ) {
        for (const exercise of session.exercises) {
          // Only include exercises that have at least one completed set
          const hasCompletedSets = exercise.sets.some(set => set.isCompleted);
          if (hasCompletedSets) {
            exerciseIdSet.add(exercise.exerciseId);
          }
        }
      }
    }

    return Array.from(exerciseIdSet);
  }, [completedSessions]);

  // Fetch muscle data for all exercise IDs
  useEffect(() => {
    async function fetchMuscleData() {
      if (weeklyExerciseIds.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all(
          weeklyExerciseIds.map((id) => getExerciseById(id))
        );

        const exercisesWithMuscles = results
          .filter(Boolean)
          .map((ex) => ({
            primaryMuscles: ex!.primaryMuscles || [],
            secondaryMuscles: ex!.secondaryMuscles || [],
          }));

        setExercises(exercisesWithMuscles);
      } catch (error) {
        console.error('Error fetching muscle data:', error);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMuscleData();
  }, [weeklyExerciseIds.join(',')]);

  return {
    exercises,
    loading,
    hasWorkouts: weeklyExerciseIds.length > 0,
  };
}
