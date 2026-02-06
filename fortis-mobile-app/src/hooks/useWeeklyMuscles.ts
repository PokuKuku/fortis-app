import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { startOfDay, startOfWeek, endOfDay } from 'date-fns';
import { attributeSessionToMuscles, bucketIntensity, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutHistoryRange } from '@/src/hooks/useWorkoutHistoryRange';
import { useAuth } from '@/src/contexts/AuthContext';
import type { Exercise } from '@/src/types/exercise';
import type { WorkoutSession } from '@/src/types/workout';

/**
 * Aggregates volume-based muscle intensity for the current week.
 * Resets every Monday and returns intensity levels for MuscleHeatmap.
 */
export function useWeeklyMuscles(): {
  muscleLevels: Record<MuscleKey, number>;
  loading: boolean;
  hasWorkouts: boolean;
  sessions: WorkoutSession[];
} {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { bodyweightKg } = useLatestBodyweight();
  const { profile } = useAuth();
  const [muscleLevels, setMuscleLevels] = useState<Record<MuscleKey, number>>({});
  const [isComputing, setIsComputing] = useState(true);

  const todayKey = startOfDay(new Date()).getTime();
  const today = new Date(todayKey);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  const { sessions: weeklySessions, isLoading: historyLoading } = useWorkoutHistoryRange({
    dateFrom: weekStart,
    dateTo: endOfDay(today),
    localSessions: completedSessions,
  });
  const sourceSessions = weeklySessions;

  const weeklyExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    sourceSessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const hasCompletedSets = exercise.sets.some(set => set.isCompleted);
        if (hasCompletedSets) ids.add(exercise.exerciseId);
      });
    });
    return Array.from(ids);
  }, [sourceSessions]);

  // Fetch muscle data for all exercise IDs
  useEffect(() => {
    let isMounted = true;
    async function fetchMuscleData() {
      if (weeklyExerciseIds.length === 0) {
        setMuscleLevels({});
        setIsComputing(false);
        return;
      }

      setIsComputing(true);

      try {
        const results = await Promise.all(
          weeklyExerciseIds.map((id) => getExerciseById(id))
        );

        const exerciseMap = new Map<string, Exercise>();
        results.forEach((exercise, index) => {
          if (!exercise) return;
          const lookupId = weeklyExerciseIds[index];
          if (lookupId) {
            exerciseMap.set(lookupId, exercise);
          }
          exerciseMap.set(exercise.id, exercise);
          if (exercise.slug) {
            exerciseMap.set(exercise.slug, exercise);
          }
        });

        const scores: Record<MuscleKey, number> = {};
        const preferredUnits = profile?.preferred_units ?? 'imperial';
        sourceSessions.forEach((session) => {
          const sessionScores = attributeSessionToMuscles(session, exerciseMap, {
            bodyweightKg,
            profileWeightKg: profile?.weight_kg ?? null,
            preferredUnits,
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
        if (isMounted) {
          setIsComputing(false);
        }
      }
    }

    fetchMuscleData();
    return () => {
      isMounted = false;
    };
  }, [weeklyExerciseIds, sourceSessions, bodyweightKg, weightUnits, profile?.preferred_units, profile?.weight_kg]);

  return {
    muscleLevels,
    loading: historyLoading || isComputing,
    hasWorkouts: weeklyExerciseIds.length > 0,
    sessions: sourceSessions,
  };
}
