import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

type InsightRequest = {
  type?: 'weekly_verdict' | 'lift_stall_risk' | 'all';
  anchorDate?: string;
};

type WeeklyVolumeRow = {
  week_start: string;
  workouts_count: number | null;
  total_volume: number | null;
  total_time_seconds: number | null;
};

type ExposureRow = {
  exercise_id: string;
  exposure_at: string;
  week_start: string;
  total_volume: number | null;
  best_e1rm: number | null;
  working_sets: number | null;
};

type WeeklyExerciseAggRow = {
  exercise_id: string;
  week_start: string;
  total_volume: number | null;
};

type EvidenceItem = {
  key: string;
  label: string;
  value: number;
  unit: string;
  compareValue?: number;
  deltaValue?: number;
  source?: string;
  period?: string;
};

type VerdictOutput = {
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high';
};

const INSIGHT_TYPE = 'WEEKLY_VERDICT_V1';
const STALL_RISK_TYPE = 'LIFT_STALL_RISK_V1';
const WINDOW = '7d';
const STALL_WINDOW = '4w';
const GLOBAL_SUBJECT_KEY = 'global';
const SCHEMA_VERSION = '1';

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const getWeekStartUtc = (date: Date): Date => {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

const getWeekStartInTimezone = (timeZone: string): Date => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    const partMap = parts.reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    const year = Number(partMap.year);
    const month = Number(partMap.month);
    const day = Number(partMap.day);
    const weekday = partMap.weekday;

    if (!year || !month || !day || !weekday) {
      return getWeekStartUtc(new Date());
    }

    const weekdayIndex = WEEKDAY_INDEX[weekday] ?? 0;
    const diff = weekdayIndex === 0 ? -6 : 1 - weekdayIndex;
    const localDate = new Date(Date.UTC(year, month - 1, day));
    localDate.setUTCDate(localDate.getUTCDate() + diff);
    localDate.setUTCHours(0, 0, 0, 0);
    return localDate;
  } catch (error) {
    console.warn('[Insights] Failed to resolve timezone week start:', error);
    return getWeekStartUtc(new Date());
  }
};

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const clampNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Number(value);
};

const resolveWeekStart = (timezone: string): Date => {
  return getWeekStartInTimezone(timezone || 'UTC');
};

const buildWeeklyVerdict = ({
  thisWeekWorkouts,
  lastWeekWorkouts,
  thisWeekVolume,
  lastWeekVolume,
  prThisWeek,
}: {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
  prThisWeek: number;
}): VerdictOutput => {
  const totalWorkouts = thisWeekWorkouts + lastWeekWorkouts;
  const volumeDelta = thisWeekVolume - lastWeekVolume;
  const sessionDelta = thisWeekWorkouts - lastWeekWorkouts;

  if (totalWorkouts < 2) {
    return {
      title: 'Log more sessions to unlock insights',
      summary: 'Log 2+ sessions to unlock your Weekly Verdict and trend insights.',
      severity: 'low',
    };
  }

  if (sessionDelta > 0 && volumeDelta > 0 && prThisWeek > 0) {
    return {
      title: 'Great week — keep the momentum',
      summary: 'Sessions and volume climbed, plus you hit new PRs. Stay consistent.',
      severity: 'low',
    };
  }

  if (volumeDelta > 0 && prThisWeek === 0) {
    return {
      title: 'Volume climbed — watch fatigue',
      summary: 'Training load went up, but no new PRs showed up. Hold intensity steady and monitor fatigue.',
      severity: 'medium',
    };
  }

  if (sessionDelta < 0 || volumeDelta < 0) {
    return {
      title: 'Lower training load this week',
      summary: 'Overall load dipped compared to last week. Aim for consistency next week.',
      severity: 'medium',
    };
  }

  return {
    title: 'Steady week of training',
    summary: 'Your weekly load held steady. Keep building and progress will follow.',
    severity: 'low',
  };
};

const fetchUserPrefs = async (
  supabase: SupabaseClient,
  userId: string
): Promise<{ preferredUnits: 'imperial' | 'metric'; timezone: string }> => {
  const { data } = await supabase.rpc('get_user_preferences_for_ai', {
    p_user_id: userId,
  });
  const prefs = data?.[0] ?? {};
  return {
    preferredUnits: prefs.preferred_units === 'metric' ? 'metric' : 'imperial',
    timezone: typeof prefs.timezone === 'string' && prefs.timezone ? prefs.timezone : 'UTC',
  };
};

const fetchConservatismLevel = async (
  supabase: SupabaseClient,
  userId: string
): Promise<'chill' | 'standard' | 'aggressive'> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('conservatism_level')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[Insights] Failed to fetch conservatism level:', error.message);
    return 'standard';
  }

  const level = data?.conservatism_level;
  if (level === 'chill' || level === 'aggressive') {
    return level;
  }
  return 'standard';
};

const fetchWeeklyVolume = async (
  supabase: SupabaseClient,
  userId: string,
  weekStart: Date,
  lastWeekStart: Date
): Promise<{ thisWeek: WeeklyVolumeRow | null; lastWeek: WeeklyVolumeRow | null }> => {
  const { data } = await supabase
    .from('weekly_workout_volume')
    .select('week_start, workouts_count, total_volume, total_time_seconds')
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(lastWeekStart))
    .lte('week_start', toIsoDate(weekStart));

  const map = new Map<string, WeeklyVolumeRow>();
  (data ?? []).forEach((row: WeeklyVolumeRow) => {
    if (!row?.week_start) return;
    const key = toIsoDate(new Date(row.week_start));
    map.set(key, row);
  });

  return {
    thisWeek: map.get(toIsoDate(weekStart)) ?? null,
    lastWeek: map.get(toIsoDate(lastWeekStart)) ?? null,
  };
};

const fetchWeeklyPrCounts = async (
  supabase: SupabaseClient,
  userId: string,
  weekStart: Date
): Promise<{ thisWeek: number; lastWeek: number }> => {
  const { data, error } = await supabase.rpc('get_weekly_pr_counts', {
    p_user_id: userId,
    p_week_start: toIsoDate(weekStart),
  });

  if (error) {
    console.warn('[Insights] Failed to fetch weekly PR counts:', error.message);
    return { thisWeek: 0, lastWeek: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    thisWeek: Number(row?.this_week ?? 0),
    lastWeek: Number(row?.last_week ?? 0),
  };
};

const fetchSnoozes = async (
  adminClient: SupabaseClient,
  userId: string
): Promise<Map<string, string>> => {
  const { data, error } = await adminClient
    .from('training_insight_snoozes')
    .select('type, snoozed_until')
    .eq('user_id', userId);

  if (error) {
    console.warn('[Insights] Failed to fetch snoozes:', error.message);
    return new Map();
  }

  const snoozes = new Map<string, string>();
  (data ?? []).forEach((row: { type: string; snoozed_until: string }) => {
    if (row?.type && row?.snoozed_until) {
      snoozes.set(row.type, row.snoozed_until);
    }
  });
  return snoozes;
};

const STALL_THRESHOLDS: Record<'chill' | 'standard' | 'aggressive', number> = {
  chill: 0,
  standard: 0.5,
  aggressive: 1.0,
};

const isSuspiciousDelta = (value: number, compareValue: number): boolean => {
  if (value <= 0 || compareValue <= 0) return false;
  const ratio = Math.max(value, compareValue) / Math.min(value, compareValue);
  return ratio >= 8;
};

const sortByExposure = (a: { exposures: number; lastExposureAt: number }, b: { exposures: number; lastExposureAt: number }) => {
  if (a.exposures !== b.exposures) {
    return b.exposures - a.exposures;
  }
  return b.lastExposureAt - a.lastExposureAt;
};

const buildStallRecommendation = ({
  e1rmDeltaPct,
  volumeDeltaPct,
}: {
  e1rmDeltaPct: number;
  volumeDeltaPct: number;
}): { type: string; payload: Record<string, unknown>; rationaleKey: string } => {
  if (e1rmDeltaPct < 0 && volumeDeltaPct > 0) {
    return {
      type: 'DELOAD',
      payload: { text: 'Deload for 1 week to reduce fatigue.' },
      rationaleKey: 'FATIGUE_ACCUMULATION',
    };
  }

  if (volumeDeltaPct <= -5) {
    return {
      type: 'ADD_SETS',
      payload: { text: 'Add 1 set per week for the next 2 weeks.' },
      rationaleKey: 'STALL_LOW_STIMULUS',
    };
  }

  return {
    type: 'CHANGE_REP_RANGE',
    payload: { text: 'Shift to 6–8 reps for the next 2 weeks.' },
    rationaleKey: 'STALL_TECHNIQUE_VARIATION',
  };
};

const buildStallRiskInsights = async ({
  adminClient,
  userId,
  weekStart,
  preferredUnits,
  conservatismLevel,
}: {
  adminClient: SupabaseClient;
  userId: string;
  weekStart: Date;
  preferredUnits: 'imperial' | 'metric';
  conservatismLevel: 'chill' | 'standard' | 'aggressive';
}): Promise<Record<string, unknown>[]> => {
  const lookbackStart = addDays(weekStart, -42);

  const { data: exposures, error: exposureError } = await adminClient
    .from('exercise_exposures')
    .select('exercise_id, exposure_at, week_start, total_volume, best_e1rm, working_sets')
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(lookbackStart))
    .lte('week_start', toIsoDate(weekStart));

  if (exposureError) {
    console.warn('[Insights] Failed to fetch exercise exposures:', exposureError.message);
    return [];
  }

  if (!exposures || exposures.length === 0) {
    return [
      {
        user_id: userId,
        type: STALL_RISK_TYPE,
        window: STALL_WINDOW,
        anchor_date: toIsoDate(weekStart),
        subject_key: GLOBAL_SUBJECT_KEY,
        severity: 'low',
        status: 'active',
        title: 'Not enough data yet',
        summary: 'Repeat a lift 3 times in the last 6 weeks to unlock stall alerts.',
        evidence: [
          {
            key: 'eligible_exercises',
            label: 'Eligible lifts',
            value: 0,
            unit: 'lifts',
            source: 'exercise_exposures',
            period: 'last_6w',
          },
          {
            key: 'flagged_exercises',
            label: 'Flagged lifts',
            value: 0,
            unit: 'lifts',
            source: 'training_insights',
            period: 'this_week',
          },
        ],
        recommendation: [],
        schema_version: SCHEMA_VERSION,
      },
    ];
  }

  const exposuresByExercise = new Map<string, ExposureRow[]>();
  exposures.forEach((row: ExposureRow) => {
    if (!row?.exercise_id) return;
    const list = exposuresByExercise.get(row.exercise_id) ?? [];
    list.push(row);
    exposuresByExercise.set(row.exercise_id, list);
  });

  const ranked = Array.from(exposuresByExercise.entries())
    .map(([exerciseId, items]) => {
      const lastExposureAt = items.reduce((max, item) => {
        const ts = new Date(item.exposure_at).getTime();
        return Number.isNaN(ts) ? max : Math.max(max, ts);
      }, 0);
      return {
        exerciseId,
        exposures: items.length,
        lastExposureAt,
      };
    })
    .sort(sortByExposure)
    .slice(0, 5);

  const candidateIds = ranked.map((item) => item.exerciseId);
  if (candidateIds.length === 0) {
    return [
      {
        user_id: userId,
        type: STALL_RISK_TYPE,
        window: STALL_WINDOW,
        anchor_date: toIsoDate(weekStart),
        subject_key: GLOBAL_SUBJECT_KEY,
        severity: 'low',
        status: 'active',
        title: 'Not enough data yet',
        summary: 'Repeat a lift 3 times in the last 6 weeks to unlock stall alerts.',
        evidence: [
          {
            key: 'eligible_exercises',
            label: 'Eligible lifts',
            value: 0,
            unit: 'lifts',
            source: 'exercise_exposures',
            period: 'last_6w',
          },
          {
            key: 'flagged_exercises',
            label: 'Flagged lifts',
            value: 0,
            unit: 'lifts',
            source: 'training_insights',
            period: 'this_week',
          },
        ],
        recommendation: [],
        schema_version: SCHEMA_VERSION,
      },
    ];
  }

  const volumeLookbackStart = addDays(weekStart, -21);

  const [{ data: weeklyAggs }, { data: exerciseNames }] = await Promise.all([
    adminClient
      .from('exercise_weekly_agg')
      .select('exercise_id, week_start, total_volume')
      .eq('user_id', userId)
      .in('exercise_id', candidateIds)
      .gte('week_start', toIsoDate(volumeLookbackStart))
      .lte('week_start', toIsoDate(weekStart)),
    adminClient
      .from('exercises')
      .select('id, name')
      .in('id', candidateIds),
  ]);

  const exerciseNameById = new Map<string, string>();
  (exerciseNames ?? []).forEach((row: { id: string; name: string }) => {
    if (row?.id) {
      exerciseNameById.set(row.id, row.name);
    }
  });

  const weeklyByExercise = new Map<string, Map<string, number>>();
  (weeklyAggs ?? []).forEach((row: WeeklyExerciseAggRow) => {
    const weekKey = toIsoDate(new Date(row.week_start));
    if (!weeklyByExercise.has(row.exercise_id)) {
      weeklyByExercise.set(row.exercise_id, new Map());
    }
    weeklyByExercise.get(row.exercise_id)?.set(weekKey, clampNumber(row.total_volume));
  });

  const weekKey = toIsoDate(weekStart);
  const weekKeyMinus1 = toIsoDate(addDays(weekStart, -7));
  const weekKeyMinus2 = toIsoDate(addDays(weekStart, -14));
  const weekKeyMinus3 = toIsoDate(addDays(weekStart, -21));

  const threshold = STALL_THRESHOLDS[conservatismLevel] ?? STALL_THRESHOLDS.standard;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';
  const insights: Record<string, unknown>[] = [];
  let flaggedCount = 0;

  ranked.forEach((candidate) => {
    const items = exposuresByExercise.get(candidate.exerciseId) ?? [];
    if (items.length < 3) return;

    const sorted = [...items].sort((a, b) => {
      return new Date(a.exposure_at).getTime() - new Date(b.exposure_at).getTime();
    });
    const lastThree = sorted.slice(-3);
    if (lastThree.length < 3) return;

    const oldest = lastThree[0];
    const latest = lastThree[lastThree.length - 1];
    const oldestE1 = clampNumber(oldest.best_e1rm);
    const latestE1 = clampNumber(latest.best_e1rm);
    const e1rmDeltaPct = oldestE1 > 0 ? ((latestE1 - oldestE1) / oldestE1) * 100 : 0;

    const weeklyMap = weeklyByExercise.get(candidate.exerciseId) ?? new Map();
    const recentVolume =
      (weeklyMap.get(weekKey) ?? 0) + (weeklyMap.get(weekKeyMinus1) ?? 0);
    const previousVolume =
      (weeklyMap.get(weekKeyMinus2) ?? 0) + (weeklyMap.get(weekKeyMinus3) ?? 0);
    const volumeDeltaPct =
      previousVolume > 0 ? ((recentVolume - previousVolume) / previousVolume) * 100 : 100;

    if (!(e1rmDeltaPct <= threshold && volumeDeltaPct <= 5)) {
      return;
    }

    const exerciseName = exerciseNameById.get(candidate.exerciseId) ?? 'this lift';
    const severity =
      e1rmDeltaPct < 0 && volumeDeltaPct > 0 ? 'high' : 'medium';
    const recommendation = buildStallRecommendation({ e1rmDeltaPct, volumeDeltaPct });

    const evidence: EvidenceItem[] = [
      {
        key: 'best_e1rm',
        label: 'Best e1RM (3 exposures)',
        value: Math.round(latestE1),
        unit,
        compareValue: Math.round(oldestE1),
        deltaValue: Math.round(latestE1 - oldestE1),
        source: 'exercise_exposures',
        period: 'last_3_exposures',
      },
      {
        key: 'volume_load',
        label: 'Volume (last 2w)',
        value: Math.round(recentVolume),
        unit,
        compareValue: Math.round(previousVolume),
        deltaValue: Math.round(recentVolume - previousVolume),
        source: 'exercise_weekly_agg',
        period: 'last_2w',
      },
      {
        key: 'exposures',
        label: 'Exposures (6w)',
        value: candidate.exposures,
        unit: 'sessions',
        source: 'exercise_exposures',
        period: 'last_6w',
      },
    ];

    flaggedCount += 1;
    insights.push({
      user_id: userId,
      type: STALL_RISK_TYPE,
      window: STALL_WINDOW,
      anchor_date: toIsoDate(weekStart),
      subject_key: `exercise:${candidate.exerciseId}`,
      severity,
      status: 'active',
      title: `Stall risk: ${exerciseName}`,
      summary: `Recent ${exerciseName} progress has flattened. A small adjustment could help restart momentum.`,
      evidence,
      recommendation: [recommendation],
      schema_version: SCHEMA_VERSION,
      exercise_id: candidate.exerciseId,
    });
  });

  const eligibleCount = ranked.filter((candidate) => {
    const items = exposuresByExercise.get(candidate.exerciseId) ?? [];
    return items.length >= 3;
  }).length;

  const summaryTitle = eligibleCount === 0
    ? 'Not enough data yet'
    : flaggedCount === 0
    ? 'All clear this week'
    : 'Watchlist updated';
  const summaryText = eligibleCount === 0
    ? 'Repeat a lift 3 times in the last 6 weeks to unlock stall alerts.'
    : flaggedCount === 0
    ? 'Your top lifts are steady this week. Keep building consistency.'
    : 'Stall risks detected for your top lifts. Tap a lift to see why.';

  insights.push({
    user_id: userId,
    type: STALL_RISK_TYPE,
    window: STALL_WINDOW,
    anchor_date: toIsoDate(weekStart),
    subject_key: GLOBAL_SUBJECT_KEY,
    severity: flaggedCount > 0 ? 'medium' : 'low',
    status: 'active',
    title: summaryTitle,
    summary: summaryText,
    evidence: [
      {
        key: 'eligible_exercises',
        label: 'Eligible lifts',
        value: eligibleCount,
        unit: 'lifts',
        source: 'exercise_exposures',
        period: 'last_6w',
      },
      {
        key: 'flagged_exercises',
        label: 'Flagged lifts',
        value: flaggedCount,
        unit: 'lifts',
        source: 'training_insights',
        period: 'this_week',
      },
    ],
    recommendation: [],
    schema_version: SCHEMA_VERSION,
  });

  return insights;
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const origin = req.headers.get('origin');

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 'method_not_allowed', 405, false, undefined, origin);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid authorization', 'UNAUTHORIZED', 401, false, undefined, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return errorResponse('Supabase service configuration missing', 'config_error', 500, false, undefined, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401, false, undefined, origin);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let body: InsightRequest = {};
  try {
    body = (await req.json()) as InsightRequest;
  } catch {
    body = {};
  }

  if (body.type && body.type !== 'weekly_verdict' && body.type !== 'lift_stall_risk' && body.type !== 'all') {
    return errorResponse('Unsupported insight type', 'invalid_request', 400, false, undefined, origin);
  }

  const requestType = body.type ?? 'all';
  const shouldRunWeekly = requestType === 'weekly_verdict' || requestType === 'all';
  const shouldRunStall = requestType === 'lift_stall_risk' || requestType === 'all';

  const [{ preferredUnits, timezone }, conservatismLevel, snoozes] = await Promise.all([
    fetchUserPrefs(supabase, user.id),
    fetchConservatismLevel(adminClient, user.id),
    fetchSnoozes(adminClient, user.id),
  ]);

  const weekStart = resolveWeekStart(timezone);
  const lastWeekStart = addDays(weekStart, -7);

  const snoozedUntilWeekly = snoozes.get(INSIGHT_TYPE);
  const snoozedUntilStall = snoozes.get(STALL_RISK_TYPE);
  const shouldRunWeeklyFinal = shouldRunWeekly && (!snoozedUntilWeekly || snoozedUntilWeekly < toIsoDate(weekStart));
  const shouldRunStallFinal = shouldRunStall && (!snoozedUntilStall || snoozedUntilStall < toIsoDate(weekStart));

  const [weeklyVolume, prCounts] = await Promise.all([
    shouldRunWeeklyFinal ? fetchWeeklyVolume(supabase, user.id, weekStart, lastWeekStart) : Promise.resolve({ thisWeek: null, lastWeek: null }),
    shouldRunWeeklyFinal ? fetchWeeklyPrCounts(supabase, user.id, weekStart) : Promise.resolve({ thisWeek: 0, lastWeek: 0 }),
  ]);

  const insightsToUpsert: Record<string, unknown>[] = [];

  if (shouldRunWeeklyFinal) {
    const thisWeekWorkouts = clampNumber(weeklyVolume.thisWeek?.workouts_count);
    const lastWeekWorkouts = clampNumber(weeklyVolume.lastWeek?.workouts_count);
    const thisWeekVolume = clampNumber(weeklyVolume.thisWeek?.total_volume);
    const lastWeekVolume = clampNumber(weeklyVolume.lastWeek?.total_volume);

    const verdict = buildWeeklyVerdict({
      thisWeekWorkouts,
      lastWeekWorkouts,
      thisWeekVolume,
      lastWeekVolume,
      prThisWeek: prCounts.thisWeek,
    });

    const volumeUnit = preferredUnits === 'metric' ? 'kg' : 'lbs';
    const shouldSuppressVolumeDelta = isSuspiciousDelta(thisWeekVolume, lastWeekVolume);
    if (shouldSuppressVolumeDelta) {
      console.warn('[Insights] Suspicious weekly volume delta detected', {
        userId: user.id,
        thisWeekVolume,
        lastWeekVolume,
      });
    }

    const evidence: EvidenceItem[] = [
      {
        key: 'sessions',
        label: 'Workouts',
        value: thisWeekWorkouts,
        unit: 'workouts',
        compareValue: lastWeekWorkouts,
        deltaValue: thisWeekWorkouts - lastWeekWorkouts,
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
      {
        key: 'volume_load',
        label: 'Total volume',
        value: Math.round(thisWeekVolume),
        unit: volumeUnit,
        compareValue: shouldSuppressVolumeDelta ? undefined : Math.round(lastWeekVolume),
        deltaValue: shouldSuppressVolumeDelta ? undefined : Math.round(thisWeekVolume - lastWeekVolume),
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
    ];

    if (prCounts.thisWeek > 0 || prCounts.lastWeek > 0) {
      evidence.push({
        key: 'prs',
        label: 'PRs',
        value: prCounts.thisWeek,
        unit: 'prs',
        compareValue: prCounts.lastWeek,
        deltaValue: prCounts.thisWeek - prCounts.lastWeek,
        source: 'exercise_personal_records',
        period: 'this_week',
      });
    }

    insightsToUpsert.push({
      user_id: user.id,
      type: INSIGHT_TYPE,
      window: WINDOW,
      anchor_date: toIsoDate(weekStart),
      subject_key: GLOBAL_SUBJECT_KEY,
      severity: verdict.severity,
      status: 'active',
      title: verdict.title,
      summary: verdict.summary,
      evidence,
      recommendation: [],
      schema_version: SCHEMA_VERSION,
    });
  }

  if (shouldRunStallFinal) {
    const stallInsights = await buildStallRiskInsights({
      adminClient,
      userId: user.id,
      weekStart,
      preferredUnits,
      conservatismLevel,
    });
    insightsToUpsert.push(...stallInsights);
  }

  if (insightsToUpsert.length === 0) {
    return jsonResponse(
      {
        anchorDate: toIsoDate(weekStart),
        insights: [],
      },
      200,
      origin
    );
  }

  const { data: upsertedInsights, error: upsertError } = await adminClient
    .from('training_insights')
    .upsert(insightsToUpsert, {
      onConflict: 'user_id,type,window,anchor_date,subject_key',
    })
    .select('*');

  if (upsertError) {
    return errorResponse(upsertError.message, 'insight_upsert_failed', 500, false, undefined, origin);
  }

  return jsonResponse(
    {
      anchorDate: toIsoDate(weekStart),
      insights: upsertedInsights ?? [],
      insight: upsertedInsights?.[0] ?? null,
    },
    200,
    origin
  );
});
