import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { PROFILE_STATS_CACHE_KEY } from '@/src/constants/storageKeys';

export interface ProfileStats {
  totalVolume: number;        // Sum of weight × reps across all sessions
  totalWorkouts: number;      // Count of completed sessions
  totalTimeSeconds: number;   // Sum of all workout durations
  uniqueExercises: number;    // Count of unique exercise IDs
  lastWorkoutDate: Date | null;
}

type ProfileStatsCache = Omit<ProfileStats, 'lastWorkoutDate'> & {
  lastWorkoutDate: string | null;
};

const EMPTY_STATS: ProfileStats = {
  totalVolume: 0,
  totalWorkouts: 0,
  totalTimeSeconds: 0,
  uniqueExercises: 0,
  lastWorkoutDate: null,
};

/**
 * Hook to fetch aggregate workout statistics from Supabase.
 * Falls back to cached stats when offline.
 */
export function useProfileStats(): ProfileStats {
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);

  useEffect(() => {
    let isMounted = true;

    const loadCachedStats = async () => {
      const cached = await getScopedItem(PROFILE_STATS_CACHE_KEY);
      if (!cached || !isMounted) return;

      try {
        const parsed = JSON.parse(cached) as ProfileStatsCache;
        setStats({
          totalVolume: parsed.totalVolume,
          totalWorkouts: parsed.totalWorkouts,
          totalTimeSeconds: parsed.totalTimeSeconds,
          uniqueExercises: parsed.uniqueExercises,
          lastWorkoutDate: parsed.lastWorkoutDate ? new Date(parsed.lastWorkoutDate) : null,
        });
      } catch {
        // Ignore cache parse errors
      }
    };

    const fetchRemoteStats = async () => {
      if (!isSupabaseConfigured()) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data || !isMounted) {
        return;
      }

      const nextStats: ProfileStats = {
        totalVolume: Math.round(data.total_volume ?? 0),
        totalWorkouts: data.total_workouts ?? 0,
        totalTimeSeconds: data.total_time_seconds ?? 0,
        uniqueExercises: data.unique_exercises_performed ?? 0,
        lastWorkoutDate: data.last_workout_date ? new Date(data.last_workout_date) : null,
      };

      setStats(nextStats);

      const cachePayload: ProfileStatsCache = {
        ...nextStats,
        lastWorkoutDate: nextStats.lastWorkoutDate ? nextStats.lastWorkoutDate.toISOString() : null,
      };
      await setScopedItem(PROFILE_STATS_CACHE_KEY, JSON.stringify(cachePayload));
    };

    loadCachedStats().finally(fetchRemoteStats);

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
}
