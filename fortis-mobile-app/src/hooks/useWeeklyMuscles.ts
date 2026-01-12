import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { startOfDay, startOfWeek, endOfDay } from 'date-fns';
import { attributeSessionToMuscles, bucketIntensity, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import type { Exercise } from '@/src/types/exercise';
import type { WorkoutSession, WorkoutExercise, WorkoutSet, WeightUnit } from '@/src/types/workout';

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
  const { profile } = useAuth();
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { bodyweightKg } = useLatestBodyweight();
  const [muscleLevels, setMuscleLevels] = useState<Record<MuscleKey, number>>({});
  const [isComputing, setIsComputing] = useState(true);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>([]);

  const todayKey = startOfDay(new Date()).getTime();
  const today = new Date(todayKey);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  const weekStartKey = weekStart.getTime();
  const weekStartIso = weekStart.toISOString();
  const weekEndIso = endOfDay(today).toISOString();

  const weeklySessions = useMemo(() => {
    return completedSessions.filter((session) => {
      const sessionDateKey = startOfDay(
        new Date(session.completedAt || session.startedAt)
      ).getTime();

      return sessionDateKey >= weekStartKey && sessionDateKey <= todayKey;
    });
  }, [completedSessions, weekStartKey, todayKey]);

  const shouldFetchRemote = weeklySessions.length === 0;

  useEffect(() => {
    let isActive = true;

    if (!shouldFetchRemote || !profile?.id || !isSupabaseConfigured()) {
      setRemoteSessions([]);
      setIsFetchingRemote(false);
      return () => {
        isActive = false;
      };
    }

    type RemoteWorkoutSetRow = {
      local_id: string | null;
      exercise_id: string;
      set_number: number | null;
      reps: number | null;
      weight: number | null;
      weight_unit: WeightUnit | null;
      is_warmup: boolean | null;
      is_dropset: boolean | null;
      is_failure: boolean | null;
      order_index: number | null;
    };

    type RemoteWorkoutSessionRow = {
      id: string;
      local_id: string | null;
      started_at: string;
      completed_at: string | null;
      workout_sets: RemoteWorkoutSetRow[] | null;
    };

    const buildRemoteSessions = (rows: RemoteWorkoutSessionRow[]): WorkoutSession[] => {
      return rows
        .filter((session) => (session.workout_sets || []).length > 0)
        .map((session) => {
          const sessionKey = session.local_id || session.id;
          const exerciseMap = new Map<string, WorkoutSet[]>();

          (session.workout_sets || []).forEach((set, index) => {
            if (!set.exercise_id) return;
            if (!exerciseMap.has(set.exercise_id)) {
              exerciseMap.set(set.exercise_id, []);
            }

            const setType = set.is_warmup ? 'warmup'
              : set.is_dropset ? 'dropset'
              : set.is_failure ? 'failure'
              : 'normal';
            const orderIndex = set.order_index ?? set.set_number ?? index;
            const setNumber = set.set_number ?? index + 1;

            exerciseMap.get(set.exercise_id)!.push({
              localId: set.local_id || `${sessionKey}-set-${index}`,
              setNumber,
              setType,
              weight: set.weight,
              weightUnit: set.weight_unit ?? null,
              reps: set.reps,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex,
            });
          });

          const exercises: WorkoutExercise[] = Array.from(exerciseMap.entries())
            .map(([exerciseId, sets], index) => ({
              localId: `${sessionKey}-ex-${index}`,
              exerciseId,
              exerciseName: exerciseId,
              sets: sets.sort((a, b) => a.orderIndex - b.orderIndex),
              notes: '',
              orderIndex: index,
            }));

          return {
            localId: sessionKey,
            userId: profile.id,
            name: '',
            notes: '',
            startedAt: new Date(session.started_at),
            completedAt: session.completed_at ? new Date(session.completed_at) : null,
            exercises,
            isSynced: true,
          };
        });
    };

    const loadRemote = async () => {
      setIsFetchingRemote(true);
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          local_id,
          started_at,
          completed_at,
          workout_sets (
            local_id,
            exercise_id,
            set_number,
            reps,
            weight,
            weight_unit,
            is_warmup,
            is_dropset,
            is_failure,
            order_index
          )
        `)
        .eq('user_id', profile.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekStartIso)
        .lte('completed_at', weekEndIso);

      if (!isActive) return;

      if (error || !data) {
        setRemoteSessions([]);
        setIsFetchingRemote(false);
        return;
      }

      setRemoteSessions(buildRemoteSessions(data as RemoteWorkoutSessionRow[]));
      setIsFetchingRemote(false);
    };

    loadRemote().catch((error) => {
      if (!isActive) return;
      console.warn('[WeeklyMuscles] Failed to load remote sessions:', error);
      setRemoteSessions([]);
      setIsFetchingRemote(false);
    });

    return () => {
      isActive = false;
    };
  }, [profile?.id, shouldFetchRemote, weekStartIso, weekEndIso]);

  const sourceSessions = weeklySessions.length > 0 ? weeklySessions : remoteSessions;

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
        results.forEach((exercise) => {
          if (exercise) exerciseMap.set(exercise.id, exercise);
        });

        const scores: Record<MuscleKey, number> = {};
        sourceSessions.forEach((session) => {
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
        if (isMounted) {
          setIsComputing(false);
        }
      }
    }

    fetchMuscleData();
    return () => {
      isMounted = false;
    };
  }, [weeklyExerciseIds, sourceSessions, bodyweightKg, weightUnits]);

  return {
    muscleLevels,
    loading: isFetchingRemote || isComputing,
    hasWorkouts: weeklyExerciseIds.length > 0,
    sessions: sourceSessions,
  };
}
