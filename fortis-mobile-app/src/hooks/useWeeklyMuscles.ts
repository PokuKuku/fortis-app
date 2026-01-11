import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { startOfDay, startOfWeek, isAfter, isBefore, isEqual } from 'date-fns';
import { attributeSessionToMuscles, bucketIntensity, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import type { Exercise } from '@/src/types/exercise';

/**
 * Hook to aggregate muscle data from the current week's completed workouts.
 * Resets every Monday. Returns an array of exercises with their muscle groups for use with MuscleHeatmap.
 */
export function useWeeklyMuscles(): {
  muscleLevels: Record<MuscleKey, number>;
  loading: boolean;
  hasWorkouts: boolean;
} {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { bodyweightKg } = useLatestBodyweight();
  const [muscleLevels, setMuscleLevels] = useState<Record<MuscleKey, number>>({});
  const [loading, setLoading] = useState(true);

  const weeklySessions = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday

    return completedSessions.filter((session) => {
      const sessionDate = startOfDay(
        new Date(session.completedAt || session.startedAt)
      );

      // Check if session is within current week (Monday to today)
      return (
        (isAfter(sessionDate, weekStart) || isEqual(sessionDate, weekStart)) &&
        (isBefore(sessionDate, today) || isEqual(sessionDate, today))
      );
    });
  }, [completedSessions]);

  const weeklyExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    weeklySessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const hasCompletedSets = exercise.sets.some(set => set.isCompleted);
        if (hasCompletedSets) ids.add(exercise.exerciseId);
      });
    });
    return Array.from(ids);
  }, [weeklySessions]);

  // Fetch muscle data for all exercise IDs
  useEffect(() => {
    async function fetchMuscleData() {
      if (weeklyExerciseIds.length === 0) {
        setMuscleLevels({});
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all(
          weeklyExerciseIds.map((id) => getExerciseById(id))
        );

        const exerciseMap = new Map<string, Exercise>();
        results.forEach((exercise) => {
          if (exercise) exerciseMap.set(exercise.id, exercise);
        });

        const scores: Record<MuscleKey, number> = {};
        weeklySessions.forEach((session) => {
          const sessionScores = attributeSessionToMuscles(session, exerciseMap, {
            bodyweightKg,
            weightUnitByExercise: weightUnits,
          });
          Object.entries(sessionScores).forEach(([key, value]) => {
            scores[key as MuscleKey] = (scores[key as MuscleKey] ?? 0) + value;
          });
        });

        setMuscleLevels(bucketIntensity(scores));
      } catch (error) {
        console.error('Error fetching muscle data:', error);
        setMuscleLevels({});
      } finally {
        setLoading(false);
      }
    }

    fetchMuscleData();
  }, [weeklyExerciseIds.join(','), weeklySessions, bodyweightKg, weightUnits]);

  return {
    muscleLevels,
    loading,
    hasWorkouts: weeklyExerciseIds.length > 0,
  };
}
