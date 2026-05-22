import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CONTEXT_CACHE_TTL_MS = Math.max(
  0,
  Number(Deno.env.get('AI_CONTEXT_CACHE_TTL_SECONDS') ?? '120') * 1000
);
const CONTEXT_CACHE_MAX_ENTRIES = Math.max(
  0,
  Number(Deno.env.get('AI_CONTEXT_CACHE_MAX_ENTRIES') ?? '500')
);

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const contextCache = new Map<string, CacheEntry<unknown>>();

export interface AIUserContext {
  preferredUnits: string;
  timezone: string;
  goals: unknown[];
  trainingExperience: string | null;
  latestBodyWeight: {
    weight: number;
    unit: string;
    recordedAt: string;
  } | null;
}

export interface AIBaseContext {
  user: AIUserContext;
  history?: unknown;
  analytics?: unknown;
}

export function compactJson(value: unknown): string {
  return JSON.stringify(value);
}

export function buildCacheKey(...parts: Array<string | number | boolean | null | undefined>): string {
  return parts.map((part) => (part === undefined || part === null ? 'na' : String(part))).join('|');
}

function getCachedValue<T>(key: string): { hit: boolean; value?: T } {
  const entry = contextCache.get(key);
  if (!entry) return { hit: false };
  if (Date.now() > entry.expiresAt) {
    contextCache.delete(key);
    return { hit: false };
  }
  return { hit: true, value: entry.value as T };
}

function pruneCacheIfNeeded() {
  if (CONTEXT_CACHE_MAX_ENTRIES <= 0) return;
  if (contextCache.size <= CONTEXT_CACHE_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of contextCache) {
    if (now > entry.expiresAt) {
      contextCache.delete(key);
    }
    if (contextCache.size <= CONTEXT_CACHE_MAX_ENTRIES) return;
  }
  if (contextCache.size <= CONTEXT_CACHE_MAX_ENTRIES) return;
  const oldestKey = contextCache.keys().next().value;
  if (oldestKey) {
    contextCache.delete(oldestKey);
  }
}

export async function withContextCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (CONTEXT_CACHE_TTL_MS <= 0) {
    return fetcher();
  }
  const cached = getCachedValue<T>(key);
  if (cached.hit) {
    return cached.value as T;
  }
  const value = await fetcher();
  contextCache.set(key, { value, expiresAt: Date.now() + CONTEXT_CACHE_TTL_MS });
  pruneCacheIfNeeded();
  return value;
}

export async function fetchAIUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<AIUserContext> {
  const { data } = await supabase.rpc('get_user_preferences_for_ai', {
    p_user_id: userId,
  });

  const prefs = data?.[0] ?? {};
  const latestWeight =
    prefs.latest_body_weight !== undefined && prefs.latest_body_weight !== null
      ? {
          weight: Number(prefs.latest_body_weight),
          unit: String(prefs.latest_body_weight_unit || 'lb'),
          recordedAt: String(prefs.latest_body_weight_at || ''),
        }
      : null;

  return {
    preferredUnits: prefs.preferred_units || 'imperial',
    timezone: prefs.timezone || 'UTC',
    goals: Array.isArray(prefs.goals) ? prefs.goals : [],
    trainingExperience: typeof prefs.lifting_experience === 'string' ? prefs.lifting_experience : null,
    latestBodyWeight: latestWeight,
  };
}

export async function fetchHistorySummary(
  supabase: SupabaseClient,
  userId: string,
  periodWeeks: number
): Promise<unknown> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodWeeks * 7);

  const { data: weeklyVolume } = await supabase
    .from('weekly_workout_volume')
    .select('*')
    .eq('user_id', userId)
    .gte('week_start', startDate.toISOString())
    .order('week_start', { ascending: false });

  const totalWorkouts = weeklyVolume?.reduce((sum, w) => sum + (w.workouts_count || 0), 0) || 0;
  const totalVolume = weeklyVolume?.reduce((sum, w) => sum + (w.total_volume || 0), 0) || 0;
  const totalDuration =
    weeklyVolume?.reduce((sum, w) => sum + (w.total_time_seconds || 0), 0) || 0;
  const recentWeeks = weeklyVolume?.slice(0, 4) || [];
  const previousWeeks = weeklyVolume?.slice(4, 8) || [];
  const avgRecentVolume =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / recentWeeks.length
      : 0;
  const avgPreviousVolume =
    previousWeeks.length > 0
      ? previousWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / previousWeeks.length
      : 0;
  const volumeChangePct =
    avgPreviousVolume > 0 ? ((avgRecentVolume - avgPreviousVolume) / avgPreviousVolume) * 100 : null;
  const avgRecentWorkouts =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.workouts_count || 0), 0) / recentWeeks.length
      : 0;
  const avgPreviousWorkouts =
    previousWeeks.length > 0
      ? previousWeeks.reduce((sum, w) => sum + (w.workouts_count || 0), 0) / previousWeeks.length
      : 0;
  const workoutChangePct =
    avgPreviousWorkouts > 0
      ? ((avgRecentWorkouts - avgPreviousWorkouts) / avgPreviousWorkouts) * 100
      : null;

  return {
    periodWeeks,
    overview: {
      totalWorkouts,
      avgWorkoutsPerWeek: totalWorkouts / Math.max(periodWeeks, 1),
      totalVolume,
      totalDurationSeconds: totalDuration,
      totalDurationMinutes: Math.round(totalDuration / 60),
      avgDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0,
    },
    weeklyVolume: weeklyVolume?.map((w) => ({
      weekStart: w.week_start,
      workouts: w.workouts_count,
      totalVolume: w.total_volume,
      totalTimeSeconds: w.total_time_seconds,
    })),
    trendSignals: {
      avgVolumeRecent4Weeks: Math.round(avgRecentVolume),
      avgVolumePrevious4Weeks: Math.round(avgPreviousVolume),
      volumeChangePct: volumeChangePct !== null ? Math.round(volumeChangePct * 10) / 10 : null,
      avgWorkoutsRecent4Weeks: Math.round(avgRecentWorkouts * 10) / 10,
      avgWorkoutsPrevious4Weeks: Math.round(avgPreviousWorkouts * 10) / 10,
      workoutChangePct: workoutChangePct !== null ? Math.round(workoutChangePct * 10) / 10 : null,
    },
  };
}

export async function fetchAnalytics(
  supabase: SupabaseClient,
  userId: string
): Promise<unknown> {
  try {
    const [userStatsResult, muscleFrequencyResult] = await Promise.all([
      supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('muscle_group_frequency')
        .select('*')
        .eq('user_id', userId)
        .order('times_trained', { ascending: false }),
    ]);

    if (userStatsResult.error) {
      console.warn('Failed to fetch user workout stats:', userStatsResult.error);
    }
    if (muscleFrequencyResult.error) {
      console.warn('Failed to fetch muscle group frequency:', muscleFrequencyResult.error);
    }

    const userStats = userStatsResult.data;
    const muscleFrequency = muscleFrequencyResult.data;

    return {
      scope: 'lifetime',
      userStats: userStats
        ? {
            totalWorkouts: userStats.total_workouts,
            totalWorkoutDays: userStats.total_workout_days,
            totalTimeSeconds: userStats.total_time_seconds,
            avgWorkoutDuration: userStats.avg_workout_duration,
            lastWorkoutDate: userStats.last_workout_date,
            uniqueExercisesPerformed: userStats.unique_exercises_performed,
            totalVolume: userStats.total_volume,
          }
        : null,
      muscleGroupFrequency: muscleFrequency?.map((m) => ({
        muscleGroup: m.muscle_group,
        timesTrained: m.times_trained,
        totalVolume: m.total_volume,
        lastTrained: m.last_trained,
      })) || [],
    };
  } catch (error) {
    console.warn('Failed to fetch analytics:', error);
    return {
      userStats: null,
      muscleGroupFrequency: [],
    };
  }
}
