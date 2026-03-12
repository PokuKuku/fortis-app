import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { startOfDay, startOfWeek, endOfDay } from 'date-fns';
import { attributeSessionSetsToMuscles, bucketWeeklyTierIntensity, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { useWorkoutHistoryRange } from '@/src/hooks/useWorkoutHistoryRange';
import type { Exercise } from '@/src/types/exercise';
import type { WorkoutSession } from '@/src/types/workout';

/**
 * Aggregates weighted set-based weekly muscle tiers for the profile heatmap.
 * Resets every Monday and returns absolute tier levels for the profile/share cards.
 */
export function useWeeklyMuscles(): {
  muscleLevels: Record<MuscleKey, number>;
  loading: boolean;
  hasWorkouts: boolean;
  sessions: WorkoutSession[];
} {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const [muscleLevels, setMuscleLevels] = useState<Record<MuscleKey, number>>(
    {} as Record<MuscleKey, number>
  );
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
        const hasCompletedSets = exercise.sets.some(
          (set) => set.isCompleted && set.setType !== 'warmup' && (set.reps ?? 0) > 0
        );
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
        setMuscleLevels({} as Record<MuscleKey, number>);
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

        const scores = {} as Record<MuscleKey, number>;
        sourceSessions.forEach((session) => {
          const sessionScores = attributeSessionSetsToMuscles(session, exerciseMap);
          Object.entries(sessionScores).forEach(([key, value]) => {
            scores[key as MuscleKey] = (scores[key as MuscleKey] ?? 0) + value;
          });
        });

        setMuscleLevels(bucketWeeklyTierIntensity(scores));
      } catch (error) {
        console.error('Error fetching muscle data:', error);
        setMuscleLevels({} as Record<MuscleKey, number>);
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
  }, [weeklyExerciseIds, sourceSessions]);

  return {
    muscleLevels,
    loading: historyLoading || isComputing,
    hasWorkouts: weeklyExerciseIds.length > 0,
    sessions: sourceSessions,
  };
}
