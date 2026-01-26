import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

type InsightRequest = {
  type?: 'weekly_verdict' | 'lift_stall_risk' | 'fatigue_risk' | 'imbalance_flag' | 'all';
  anchorDate?: string;
};

type WeeklyVolumeRow = {
  week_start: string;
  workouts_count: number | null;
  total_volume: number | null;
  total_time_seconds: number | null;
  avg_rpe?: number | null;
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

type MuscleGroupRow = {
  muscle_group: string;
  week_start: string;
  working_sets: number | null;
};

type WeeklySummaryRow = {
  week_start: string;
  workouts_count: number | null;
  total_volume: number | null;
};

type WorkoutSetRow = {
  session_id?: string | null;
  weight: number | null;
  reps: number | null;
  weight_unit: string | null;
  is_warmup: boolean | null;
  exercise_id?: string | null;
  exercise_name_snapshot?: string | null;
};

type WorkoutSessionWithSetsRow = {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  workout_sets: WorkoutSetRow[] | null;
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
const FATIGUE_RISK_TYPE = 'FATIGUE_RISK_V1';
const IMBALANCE_FLAG_TYPE = 'IMBALANCE_FLAG_V1';
const WORKOUT_RECAP_TYPE = 'WORKOUT_RECAP_V1';
const CONSISTENCY_STREAK_TYPE = 'CONSISTENCY_STREAK_V1';
const WEEKLY_VOLUME_PR_TYPE = 'WEEKLY_VOLUME_PR_V1';
const POSITIVE_INSIGHT_TYPES = [CONSISTENCY_STREAK_TYPE, WEEKLY_VOLUME_PR_TYPE];
const WINDOW = '7d';
const STALL_WINDOW = '4w';
const FATIGUE_WINDOW = '7d';
const IMBALANCE_WINDOW = '4w';
const STREAK_WINDOW = '7d';
const VOLUME_PR_WINDOW = '12w';
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

const getLocalDateParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const partMap = parts.reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  const year = Number(partMap.year);
  const month = Number(partMap.month);
  const day = Number(partMap.day);
  const hour = Number(partMap.hour);
  const minute = Number(partMap.minute);
  const second = Number(partMap.second);
  const weekday = partMap.weekday;

  if (!year || !month || !day || !weekday) {
    return null;
  }

  return {
    year,
    month,
    day,
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
    second: Number.isNaN(second) ? 0 : second,
    weekday,
  };
};

const getMondayIndex = (weekday: string): number => {
  const index = WEEKDAY_INDEX[weekday] ?? 0;
  return index === 0 ? 6 : index - 1;
};

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);
const toIsoDateTime = (date: Date): string => date.toISOString();

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const clampNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Number(value);
};

const clampRpe = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const numeric = Number(value);
  return numeric > 0 ? numeric : null;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
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
  isWeekToDate,
}: {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
  prThisWeek: number;
  isWeekToDate: boolean;
}): VerdictOutput => {
  const totalWorkouts = thisWeekWorkouts + lastWeekWorkouts;
  const volumeDelta = thisWeekVolume - lastWeekVolume;
  const sessionDelta = thisWeekWorkouts - lastWeekWorkouts;
  const timeframe = isWeekToDate ? 'So far this week, ' : '';
  const compareLabel = isWeekToDate ? 'the same time last week' : 'last week';

  if (totalWorkouts < 2) {
    return {
      title: 'Log more sessions to unlock insights',
      summary: 'Log a couple sessions and I’ll start spotting weekly trends for you.',
      severity: 'low',
    };
  }

  if (sessionDelta > 0 && volumeDelta > 0 && prThisWeek > 0) {
    return {
      title: isWeekToDate ? 'Strong start — keep the momentum' : 'Great week — keep the momentum',
      summary: `${timeframe}sessions and volume climbed, plus you hit new PRs — nice work! Keep the streak going.`,
      severity: 'low',
    };
  }

  if (volumeDelta > 0 && prThisWeek === 0) {
    return {
      title: isWeekToDate ? 'Load is up so far — watch recovery' : 'Volume climbed — watch recovery',
      summary: `${timeframe}training load went up without clear performance gains. Keep intensity steady and monitor recovery.`,
      severity: 'medium',
    };
  }

  if (sessionDelta < 0 || volumeDelta < 0) {
    return {
      title: isWeekToDate ? 'Lower training load so far' : 'Lower training load this week',
      summary: `${timeframe}overall load dipped compared to ${compareLabel}. Aim for consistency as the week continues.`,
      severity: 'medium',
    };
  }

  return {
    title: isWeekToDate ? 'Steady start this week' : 'Steady week of training',
    summary: `${timeframe}your weekly load held steady. Keep building and progress will follow.`,
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
  const selection = 'week_start, workouts_count, total_volume, total_time_seconds, avg_rpe';
  let { data, error } = await supabase
    .from('weekly_workout_volume')
    .select(selection)
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(lastWeekStart))
    .lte('week_start', toIsoDate(weekStart));

  if (error?.message?.includes('avg_rpe')) {
    ({ data } = await supabase
      .from('weekly_workout_volume')
      .select('week_start, workouts_count, total_volume, total_time_seconds')
      .eq('user_id', userId)
      .gte('week_start', toIsoDate(lastWeekStart))
      .lte('week_start', toIsoDate(weekStart)));
  } else if (error) {
    console.warn('[Insights] Failed to fetch weekly volume:', error.message);
    return { thisWeek: null, lastWeek: null };
  }

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

const fetchWeekToDateVolume = async (
  supabase: SupabaseClient,
  userId: string,
  weekStart: Date,
  lastWeekStart: Date,
  preferredUnits: 'imperial' | 'metric',
  timezone: string
): Promise<{ thisWeek: WeeklyVolumeRow; lastWeek: WeeklyVolumeRow }> => {
  const empty = {
    week_start: toIsoDate(weekStart),
    workouts_count: 0,
    total_volume: 0,
    total_time_seconds: 0,
  };
  const now = new Date();
  const nowLocal = getLocalDateParts(now, timezone);
  if (!nowLocal) {
    return { thisWeek: empty, lastWeek: { ...empty, week_start: toIsoDate(lastWeekStart) } };
  }
  const nowLocalDate = new Date(Date.UTC(nowLocal.year, nowLocal.month - 1, nowLocal.day));
  const currentDayIndex = getMondayIndex(nowLocal.weekday);
  const nowLocalSeconds = nowLocal.hour * 3600 + nowLocal.minute * 60 + nowLocal.second;
  const currentWeekStartDate = new Date(nowLocalDate);
  currentWeekStartDate.setUTCDate(currentWeekStartDate.getUTCDate() - currentDayIndex);
  const lastWeekStartDate = addDays(currentWeekStartDate, -7);
  const dayMs = 24 * 60 * 60 * 1000;

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, started_at, duration_seconds, workout_sets(weight, reps, weight_unit, is_warmup)')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('started_at', toIsoDateTime(lastWeekStartDate))
    .lt('started_at', toIsoDateTime(now));

  if (error) {
    console.warn('[Insights] Failed to fetch week-to-date volume:', error.message);
    return { thisWeek: empty, lastWeek: { ...empty, week_start: toIsoDate(lastWeekStart) } };
  }

  const thisWeek = { ...empty, week_start: toIsoDate(currentWeekStartDate) };
  const lastWeek = { ...empty, week_start: toIsoDate(lastWeekStartDate) };

  (data as WorkoutSessionWithSetsRow[] | null)?.forEach((session) => {
    const startedAt = new Date(session.started_at);
    const localParts = getLocalDateParts(startedAt, timezone);
    if (!localParts) return;
    const sessionLocalDate = new Date(Date.UTC(localParts.year, localParts.month - 1, localParts.day));
    const sessionDayDiff = Math.floor((sessionLocalDate.getTime() - currentWeekStartDate.getTime()) / dayMs);
    const sessionSeconds = localParts.hour * 3600 + localParts.minute * 60 + localParts.second;
    const isThisWeek = sessionDayDiff >= 0 && sessionDayDiff <= 6;
    const isLastWeek = sessionDayDiff >= -7 && sessionDayDiff <= -1;

    let shouldInclude = false;
    let target = thisWeek;

    if (isThisWeek) {
      shouldInclude =
        sessionDayDiff < currentDayIndex ||
        (sessionDayDiff === currentDayIndex && sessionSeconds <= nowLocalSeconds);
      target = thisWeek;
    } else if (isLastWeek) {
      const lastWeekDayIndex = sessionDayDiff + 7;
      shouldInclude =
        lastWeekDayIndex < currentDayIndex ||
        (lastWeekDayIndex === currentDayIndex && sessionSeconds <= nowLocalSeconds);
      target = lastWeek;
    }

    if (!shouldInclude) return;

    target.workouts_count = clampNumber(target.workouts_count) + 1;
    target.total_time_seconds = clampNumber(target.total_time_seconds) + clampNumber(session.duration_seconds);

    (session.workout_sets ?? []).forEach((set) => {
      if (set.is_warmup) return;
      if (set.reps === null || set.weight === null) return;
      if (set.reps <= 0 || set.weight <= 0) return;
      const normalizedWeight = normalizeWeight(set.weight, set.weight_unit, preferredUnits);
      target.total_volume = clampNumber(target.total_volume) + normalizedWeight * set.reps;
    });
  });

  return { thisWeek, lastWeek };
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

const fetchWeekToDatePrCounts = async (
  supabase: SupabaseClient,
  userId: string,
  weekStart: Date
): Promise<{ thisWeek: number; lastWeek: number }> => {
  const { data, error } = await supabase.rpc('get_week_to_date_pr_counts', {
    p_user_id: userId,
    p_week_start: toIsoDate(weekStart),
  });

  if (error) {
    console.warn('[Insights] Failed to fetch week-to-date PR counts:', error.message);
    return { thisWeek: 0, lastWeek: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    thisWeek: Number(row?.this_week ?? 0),
    lastWeek: Number(row?.last_week ?? 0),
  };
};

const fetchWeeklySummary = async (
  adminClient: SupabaseClient,
  userId: string,
  start: Date,
  end: Date
): Promise<WeeklySummaryRow[]> => {
  const { data, error } = await adminClient
    .from('weekly_workout_volume')
    .select('week_start, workouts_count, total_volume')
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(start))
    .lte('week_start', toIsoDate(end))
    .order('week_start', { ascending: true });

  if (error) {
    console.warn('[Insights] Failed to fetch weekly summary:', error.message);
    return [];
  }

  return (data as WeeklySummaryRow[]) ?? [];
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

const fetchFeedbackSignals = async (
  adminClient: SupabaseClient,
  userId: string,
  weekStart: Date
): Promise<{ suppressed: Set<string>; notHelpfulCounts: Map<string, number> }> => {
  const lookbackStart = addDays(weekStart, -30);
  const { data, error } = await adminClient
    .from('training_insight_feedback')
    .select('type, rating, created_at')
    .eq('user_id', userId)
    .gte('created_at', toIsoDateTime(lookbackStart));

  if (error) {
    console.warn('[Insights] Failed to fetch insight feedback:', error.message);
    return { suppressed: new Set(), notHelpfulCounts: new Map() };
  }

  const suppression = new Map<string, { count: number; last: number }>();
  (data ?? []).forEach((row: { type: string; rating: string; created_at: string }) => {
    if (row?.rating !== 'not_helpful' || !row.type || !row.created_at) return;
    const createdAt = new Date(row.created_at).getTime();
    const current = suppression.get(row.type) ?? { count: 0, last: 0 };
    suppression.set(row.type, {
      count: current.count + 1,
      last: Math.max(current.last, createdAt),
    });
  });

  const suppressionWindowStart = addDays(weekStart, -14).getTime();
  const suppressed = new Set<string>();
  const notHelpfulCounts = new Map<string, number>();
  suppression.forEach((value, type) => {
    notHelpfulCounts.set(type, value.count);
    if (value.count >= 2 && value.last >= suppressionWindowStart) {
      suppressed.add(type);
    }
  });

  return { suppressed, notHelpfulCounts };
};

const STALL_THRESHOLDS: Record<'chill' | 'standard' | 'aggressive', number> = {
  chill: 0,
  standard: 0.5,
  aggressive: 1.0,
};

const FATIGUE_THRESHOLDS: Record<
  'chill' | 'standard' | 'aggressive',
  { volumeSpikeWoW: number; e1rmDropForFatigue: number; minSessions: number }
> = {
  chill: { volumeSpikeWoW: 40, e1rmDropForFatigue: -2.5, minSessions: 2 },
  standard: { volumeSpikeWoW: 30, e1rmDropForFatigue: -2.0, minSessions: 2 },
  aggressive: { volumeSpikeWoW: 20, e1rmDropForFatigue: -1.5, minSessions: 2 },
};

const IMBALANCE_THRESHOLDS = {
  pushPullMin: 0.7,
  pushPullMax: 1.3,
  minTotalSets: 12,
  underdoseSets: 4,
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

const normalizeWeight = (
  weight: number,
  weightUnit: string | null | undefined,
  preferredUnits: 'imperial' | 'metric'
): number => {
  if (preferredUnits === 'metric') {
    return weightUnit === 'lbs' ? weight / 2.20462 : weight;
  }
  return weightUnit === 'kg' ? weight * 2.20462 : weight;
};

const normalizeBodyweight = (
  weight: number,
  unit: string | null | undefined,
  preferredUnits: 'imperial' | 'metric'
): number | null => {
  if (!weight || weight <= 0) return null;
  const normalizedUnit = (unit ?? '').toLowerCase();
  if (normalizedUnit === 'kg') {
    return preferredUnits === 'metric' ? weight : weight * 2.20462;
  }
  if (normalizedUnit === 'lb' || normalizedUnit === 'lbs') {
    return preferredUnits === 'imperial' ? weight : weight / 2.20462;
  }
  return null;
};

const BODYWEIGHT_EQUIPMENT = new Set(['body only', 'bodyweight', 'body weight', 'assisted', 'suspension']);
const BODYWEIGHT_NAME_PATTERN =
  /(^|[^a-z])(pull[- ]?up|chin[- ]?up|push[- ]?up|dip|plank|sit[- ]?up|crunch|inverted row)($|[^a-z])/i;

const isBodyweightExercise = (equipment?: string | null, name?: string | null): boolean => {
  const normalizedEquipment = (equipment ?? '').toLowerCase();
  if (BODYWEIGHT_EQUIPMENT.has(normalizedEquipment)) {
    return true;
  }
  const normalizedName = (name ?? '').toLowerCase();
  if (!normalizedName) return false;
  return BODYWEIGHT_NAME_PATTERN.test(normalizedName);
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

const buildFatigueRecommendation = (): { type: string; payload: Record<string, unknown>; rationaleKey: string } => {
  return {
    type: 'DELOAD',
    payload: { text: 'Deload for 1 week (reduce sets by 20–30%).' },
    rationaleKey: 'FATIGUE_ACCUMULATION',
  };
};

const normalizeMuscleGroup = (group: string): string => {
  const key = group.trim().toLowerCase();
  if (['middle back', 'upper back', 'lower back', 'lats', 'traps'].includes(key)) return 'back';
  if (['quadriceps', 'quads'].includes(key)) return 'quads';
  if (['hamstrings'].includes(key)) return 'hamstrings';
  if (['glutes', 'gluteus maximus'].includes(key)) return 'glutes';
  if (['abdominals', 'abs', 'core'].includes(key)) return 'core';
  if (['delts', 'deltoids', 'shoulders'].includes(key)) return 'shoulders';
  if (['pectorals', 'chest'].includes(key)) return 'chest';
  if (['biceps'].includes(key)) return 'biceps';
  if (['triceps'].includes(key)) return 'triceps';
  if (['calves'].includes(key)) return 'calves';
  return key;
};

const formatMuscleLabel = (group: string): string => {
  if (!group) return 'that muscle group';
  return group
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const buildImbalanceInsight = async ({
  adminClient,
  userId,
  weekStart,
  feedbackCount,
}: {
  adminClient: SupabaseClient;
  userId: string;
  weekStart: Date;
  feedbackCount: number;
}): Promise<Record<string, unknown> | null> => {
  const lookbackStart = addDays(weekStart, -7);
  const { data, error } = await adminClient
    .from('weekly_muscle_group_sets')
    .select('muscle_group, week_start, working_sets')
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(lookbackStart))
    .lte('week_start', toIsoDate(weekStart));

  if (error) {
    console.warn('[Insights] Failed to fetch muscle group sets:', error.message);
    return null;
  }

  const totalsByGroup = new Map<string, number>();
  let totalSets = 0;
  (data as MuscleGroupRow[] | null ?? []).forEach((row) => {
    if (!row?.muscle_group) return;
    const group = normalizeMuscleGroup(row.muscle_group);
    const sets = clampNumber(row.working_sets);
    totalsByGroup.set(group, (totalsByGroup.get(group) ?? 0) + sets);
    totalSets += sets;
  });

  const thresholds =
    feedbackCount > 0
      ? {
          pushPullMin: IMBALANCE_THRESHOLDS.pushPullMin + 0.05,
          pushPullMax: IMBALANCE_THRESHOLDS.pushPullMax - 0.05,
          minTotalSets: IMBALANCE_THRESHOLDS.minTotalSets + 4,
          underdoseSets: IMBALANCE_THRESHOLDS.underdoseSets + 2,
        }
      : IMBALANCE_THRESHOLDS;

  if (totalSets < thresholds.minTotalSets) {
    return null;
  }

  const pushGroups = new Set(['chest', 'shoulders', 'triceps']);
  const pullGroups = new Set(['back', 'biceps']);
  let pushSets = 0;
  let pullSets = 0;

  totalsByGroup.forEach((value, key) => {
    if (pushGroups.has(key)) pushSets += value;
    if (pullGroups.has(key)) pullSets += value;
  });

  const ratio = pullSets > 0 ? pushSets / pullSets : pushSets > 0 ? 2 : 1;

  if (pushSets >= thresholds.underdoseSets && pullSets >= thresholds.underdoseSets) {
    if (ratio < thresholds.pushPullMin || ratio > thresholds.pushPullMax) {
      const skewLabel = ratio > thresholds.pushPullMax ? 'push-heavy' : 'pull-heavy';
      const severity = ratio > 1.6 || ratio < 0.6 ? 'high' : 'medium';
      return {
        user_id: userId,
        type: IMBALANCE_FLAG_TYPE,
        window: IMBALANCE_WINDOW,
        anchor_date: toIsoDate(weekStart),
        subject_key: GLOBAL_SUBJECT_KEY,
        severity,
        status: 'active',
        title: 'Muscle balance check: push/pull skewed',
        summary: `Your last two weeks were ${skewLabel}. Add a few sets to the lagging side.`,
        evidence: [
          {
            key: 'push_sets',
            label: 'Push sets (2w)',
            value: Math.round(pushSets),
            unit: 'sets',
            source: 'weekly_muscle_group_sets',
            period: 'last_2w',
          },
          {
            key: 'pull_sets',
            label: 'Pull sets (2w)',
            value: Math.round(pullSets),
            unit: 'sets',
            source: 'weekly_muscle_group_sets',
            period: 'last_2w',
          },
          {
            key: 'push_pull_ratio',
            label: 'Push/Pull ratio',
            value: Number(ratio.toFixed(2)),
            unit: 'ratio',
            source: 'weekly_muscle_group_sets',
            period: 'last_2w',
          },
        ],
        recommendation: [
          {
            type: 'ADD_SETS',
            payload: { text: 'Add 2 sets per week to the lagging side.' },
            rationaleKey: 'IMBALANCE_UNDERDOSED',
          },
        ],
        schema_version: SCHEMA_VERSION,
      };
    }
  }

  const majorGroups = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'core'];
  const underdosed = majorGroups
    .map((group) => ({
      group,
      sets: totalsByGroup.get(group) ?? 0,
    }))
    .sort((a, b) => a.sets - b.sets)[0];

  if (underdosed && underdosed.sets < thresholds.underdoseSets) {
    const groupLabel = formatMuscleLabel(underdosed.group);
    return {
      user_id: userId,
      type: IMBALANCE_FLAG_TYPE,
      window: IMBALANCE_WINDOW,
      anchor_date: toIsoDate(weekStart),
      subject_key: `muscle:${underdosed.group}`,
      severity: 'medium',
      status: 'active',
      title: `Undertrained ${groupLabel}`,
      summary: `${groupLabel} volume has been light over the last two weeks. Add a few focused sets.`,
      evidence: [
        {
          key: 'underdosed_sets',
          label: `${groupLabel} sets (2w)`,
          value: Math.round(underdosed.sets),
          unit: 'sets',
          source: 'weekly_muscle_group_sets',
          period: 'last_2w',
        },
        {
          key: 'total_sets',
          label: 'Total working sets (2w)',
          value: Math.round(totalSets),
          unit: 'sets',
          source: 'weekly_muscle_group_sets',
          period: 'last_2w',
        },
      ],
      recommendation: [
        {
          type: 'SWAP_ACCESSORY',
          payload: { text: `Add 2 sets per week for ${groupLabel}.` },
          rationaleKey: 'IMBALANCE_UNDERDOSED',
        },
      ],
      schema_version: SCHEMA_VERSION,
      muscle_group: underdosed.group,
    };
  }

  return null;
};

const buildFatigueRiskInsight = async ({
  adminClient,
  userId,
  weekStart,
  lastWeekStart,
  conservatismLevel,
  feedbackCount,
  thisWeekVolume,
  lastWeekVolume,
  thisWeekWorkouts,
  lastWeekWorkouts,
  thisWeekRpe,
  lastWeekRpe,
}: {
  adminClient: SupabaseClient;
  userId: string;
  weekStart: Date;
  lastWeekStart: Date;
  conservatismLevel: 'chill' | 'standard' | 'aggressive';
  feedbackCount: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisWeekRpe?: number | null;
  lastWeekRpe?: number | null;
}): Promise<Record<string, unknown> | null> => {
  const baseThreshold = FATIGUE_THRESHOLDS[conservatismLevel] ?? FATIGUE_THRESHOLDS.standard;
  const threshold =
    feedbackCount > 0
      ? {
          volumeSpikeWoW: baseThreshold.volumeSpikeWoW + 10,
          e1rmDropForFatigue: baseThreshold.e1rmDropForFatigue - 0.5,
          minSessions: baseThreshold.minSessions + 1,
        }
      : baseThreshold;
  const totalWorkouts = thisWeekWorkouts + lastWeekWorkouts;
  if (totalWorkouts < threshold.minSessions) {
    return null;
  }

  if (thisWeekVolume <= 0 || lastWeekVolume <= 0) {
    return null;
  }
  if (isSuspiciousDelta(thisWeekVolume, lastWeekVolume)) {
    return null;
  }

  const volumeDeltaPct = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
  const normalizedThisRpe = clampRpe(thisWeekRpe);
  const normalizedLastRpe = clampRpe(lastWeekRpe);
  const hasRpe = normalizedThisRpe !== null && normalizedLastRpe !== null;
  const rpeDelta = hasRpe ? normalizedThisRpe - normalizedLastRpe : null;
  const rpeDeltaRounded = rpeDelta !== null ? Number(rpeDelta.toFixed(1)) : null;

  const lookbackStart = addDays(weekStart, -42);
  const { data: exposures } = await adminClient
    .from('exercise_exposures')
    .select('exercise_id, exposure_at')
    .eq('user_id', userId)
    .gte('exposure_at', toIsoDateTime(lookbackStart));

  const exposureByExercise = new Map<string, { exerciseId: string; exposures: number; lastExposureAt: number }>();
  (exposures ?? []).forEach((row: { exercise_id: string; exposure_at: string }) => {
    if (!row?.exercise_id || !row?.exposure_at) return;
    const exposureAt = new Date(row.exposure_at).getTime();
    const existing = exposureByExercise.get(row.exercise_id);
    if (existing) {
      existing.exposures += 1;
      existing.lastExposureAt = Math.max(existing.lastExposureAt, exposureAt);
    } else {
      exposureByExercise.set(row.exercise_id, {
        exerciseId: row.exercise_id,
        exposures: 1,
        lastExposureAt: exposureAt,
      });
    }
  });

  const ranked = Array.from(exposureByExercise.values())
    .sort(sortByExposure)
    .slice(0, 5);
  const candidateIds = ranked.map((item) => item.exerciseId);
  if (candidateIds.length === 0) {
    return null;
  }

  const { data: weeklyAggs } = await adminClient
    .from('exercise_weekly_agg')
    .select('exercise_id, week_start, best_e1rm')
    .eq('user_id', userId)
    .in('exercise_id', candidateIds)
    .gte('week_start', toIsoDate(lastWeekStart))
    .lte('week_start', toIsoDate(weekStart));

  const weekKey = toIsoDate(weekStart);
  const lastWeekKey = toIsoDate(lastWeekStart);
  const e1rmThis: number[] = [];
  const e1rmLast: number[] = [];
  const byExerciseWeek = new Map<string, Map<string, number>>();

  (weeklyAggs ?? []).forEach((row: { exercise_id: string; week_start: string; best_e1rm: number | null }) => {
    if (!row?.exercise_id || !row?.week_start) return;
    const key = toIsoDate(new Date(row.week_start));
    if (!byExerciseWeek.has(row.exercise_id)) {
      byExerciseWeek.set(row.exercise_id, new Map());
    }
    byExerciseWeek.get(row.exercise_id)?.set(key, clampNumber(row.best_e1rm));
  });

  candidateIds.forEach((exerciseId) => {
    const weekMap = byExerciseWeek.get(exerciseId);
    if (!weekMap) return;
    const lastValue = clampNumber(weekMap.get(lastWeekKey));
    const thisValue = clampNumber(weekMap.get(weekKey));
    if (lastValue > 0 && thisValue > 0) {
      e1rmLast.push(lastValue);
      e1rmThis.push(thisValue);
    }
  });

  if (e1rmLast.length === 0 || e1rmThis.length === 0) {
    return null;
  }

  const avgLast = e1rmLast.reduce((sum, value) => sum + value, 0) / e1rmLast.length;
  const avgThis = e1rmThis.reduce((sum, value) => sum + value, 0) / e1rmThis.length;
  if (avgLast <= 0) {
    return null;
  }
  const e1rmDeltaPct = ((avgThis - avgLast) / avgLast) * 100;

  if (!(volumeDeltaPct >= threshold.volumeSpikeWoW && e1rmDeltaPct <= threshold.e1rmDropForFatigue)) {
    return null;
  }

  const severity = e1rmDeltaPct <= threshold.e1rmDropForFatigue * 2 ? 'high' : 'medium';
  const rpeSpike = rpeDeltaRounded !== null && rpeDeltaRounded >= 0.5;
  const summary = rpeSpike
    ? 'Weekly volume jumped while top-lift e1RM dipped, and average RPE climbed. A short deload could help recovery.'
    : 'Weekly volume jumped while top-lift e1RM dipped. A short deload could help recovery.';

  return {
    user_id: userId,
    type: FATIGUE_RISK_TYPE,
    window: FATIGUE_WINDOW,
    anchor_date: toIsoDate(weekStart),
    subject_key: GLOBAL_SUBJECT_KEY,
    severity,
    status: 'active',
    title: 'Fatigue risk: volume spiked',
    summary,
    evidence: [
      {
        key: 'volume_load',
        label: 'Volume change (WoW)',
        value: Number(volumeDeltaPct.toFixed(1)),
        unit: '%',
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
      {
        key: 'best_e1rm',
        label: 'Best e1RM change (WoW)',
        value: Number(e1rmDeltaPct.toFixed(1)),
        unit: '%',
        source: 'exercise_weekly_agg',
        period: 'this_week',
      },
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
      ...(hasRpe
        ? [
            {
              key: 'avg_rpe',
              label: 'Avg RPE (WoW)',
              value: Number(normalizedThisRpe.toFixed(1)),
              unit: 'rpe',
              compareValue: Number(normalizedLastRpe.toFixed(1)),
              deltaValue: rpeDeltaRounded ?? undefined,
              source: 'weekly_workout_volume',
              period: 'this_week',
            } satisfies EvidenceItem,
          ]
        : []),
    ],
    recommendation: [buildFatigueRecommendation()],
    schema_version: SCHEMA_VERSION,
  };
};

const buildWorkoutRecapInsights = async ({
  adminClient,
  userId,
  preferredUnits,
  limit = 20,
}: {
  adminClient: SupabaseClient;
  userId: string;
  preferredUnits: 'imperial' | 'metric';
  limit?: number;
}): Promise<{ insights: Record<string, unknown>[]; activeSubjectKey: string | null }> => {
  const { data: sessions, error } = await adminClient
    .from('workout_sessions')
    .select('id, started_at, completed_at, duration_seconds')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[Insights] Failed to fetch workout sessions for recap:', error.message);
    return { insights: [], activeSubjectKey: null };
  }

  if (!sessions || sessions.length === 0) {
    return { insights: [], activeSubjectKey: null };
  }

  const sessionIds = sessions.map((session) => session.id).filter(Boolean);
  if (sessionIds.length === 0) {
    return { insights: [], activeSubjectKey: null };
  }

  const { data: sets, error: setsError } = await adminClient
    .from('workout_sets')
    .select('session_id, exercise_id, exercise_name_snapshot, reps, weight, weight_unit, is_warmup')
    .in('session_id', sessionIds);

  if (setsError) {
    console.warn('[Insights] Failed to fetch session sets for recap:', setsError.message);
    return { insights: [], activeSubjectKey: null };
  }

  const setsBySession = new Map<string, WorkoutSetRow[]>();
  const exerciseIds = new Set<string>();
  (sets ?? []).forEach((row: WorkoutSetRow) => {
    if (!row?.session_id) return;
    const list = setsBySession.get(row.session_id) ?? [];
    list.push(row);
    setsBySession.set(row.session_id, list);
    if (row.exercise_id) {
      exerciseIds.add(row.exercise_id);
    }
  });

  const { data: exerciseRows } = exerciseIds.size
    ? await adminClient
        .from('exercises')
        .select('id, name, equipment')
        .in('id', Array.from(exerciseIds))
    : { data: [] as Array<{ id: string; name: string; equipment?: string | null }> };
  const exerciseNameById = new Map<string, string>();
  const exerciseEquipmentById = new Map<string, string>();
  (exerciseRows ?? []).forEach((row: { id: string; name: string }) => {
    if (row?.id) {
      exerciseNameById.set(row.id, row.name);
      if ((row as { equipment?: string | null }).equipment) {
        exerciseEquipmentById.set(row.id, (row as { equipment?: string | null }).equipment ?? '');
      }
    }
  });

  const { data: bodyweightRows } = await adminClient
    .from('user_body_metrics')
    .select('weight, unit')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(1);
  const bodyweightRow = bodyweightRows?.[0];
  const bodyweightPreferred = bodyweightRow
    ? normalizeBodyweight(bodyweightRow.weight, bodyweightRow.unit, preferredUnits)
    : null;

  const volumeUnit = preferredUnits === 'metric' ? 'kg' : 'lbs';
  const latestSession = sessions[0];
  const activeSubjectKey = latestSession?.id ? `session:${latestSession.id}` : null;
  const insights: Record<string, unknown>[] = [];

  sessions.forEach((session) => {
    if (!session?.id) return;
    const sessionSets = setsBySession.get(session.id) ?? [];
    let loggedSets = 0;
    let totalVolume = 0;
    const exercises = new Set<string>();
    let topSet: { exerciseId: string; weight: number; reps: number; e1rm: number } | null = null;

    sessionSets.forEach((row) => {
      if (!row?.exercise_id) return;
      if (!row.reps || row.reps <= 0) return;
      loggedSets += 1;
      exercises.add(row.exercise_id);

      let weightNorm: number | null = null;
      if (row.weight && row.weight > 0) {
        weightNorm = normalizeWeight(row.weight, row.weight_unit, preferredUnits);
      } else {
        const equipment = exerciseEquipmentById.get(row.exercise_id);
        const fallbackName = exerciseNameById.get(row.exercise_id) ?? row.exercise_name_snapshot ?? '';
        if (isBodyweightExercise(equipment, fallbackName)) {
          weightNorm = bodyweightPreferred ?? 1;
        }
      }

      if (weightNorm !== null) {
        totalVolume += weightNorm * row.reps;
        const repsClamped = Math.min(row.reps, 12);
        const e1rm = weightNorm * (1 + repsClamped / 30.0);
        if (!topSet || e1rm > topSet.e1rm) {
          topSet = {
            exerciseId: row.exercise_id,
            weight: weightNorm,
            reps: row.reps,
            e1rm,
          };
        }
      }
    });

    if (loggedSets === 0) {
      return;
    }

    const durationSeconds = session.duration_seconds ?? null;
    const durationMinutes = durationSeconds ? Math.round(durationSeconds / 60) : null;
    const evidence: EvidenceItem[] = [
      {
        key: 'working_sets',
        label: 'Sets logged',
        value: loggedSets,
        unit: 'sets',
        source: 'workout_sets',
        period: 'session',
      },
      {
        key: 'total_volume',
        label: 'Total volume',
        value: Math.round(totalVolume),
        unit: volumeUnit,
        source: 'workout_sets',
        period: 'session',
      },
      {
        key: 'exercises',
        label: 'Exercises trained',
        value: exercises.size,
        unit: 'exercises',
        source: 'workout_sets',
        period: 'session',
      },
    ];

    if (durationMinutes && durationMinutes > 0) {
      evidence.push({
        key: 'duration',
        label: 'Duration',
        value: durationMinutes,
        unit: 'min',
        source: 'workout_sessions',
        period: 'session',
      });
    }

    if (topSet) {
      const exerciseName = exerciseNameById.get(topSet.exerciseId) ?? 'Top lift';
      evidence.push({
        key: 'top_set',
        label: `Top set (${exerciseName} × ${topSet.reps} reps)`,
        value: Math.round(topSet.weight),
        unit: volumeUnit,
        source: 'workout_sets',
        period: 'session',
      });
    }

    insights.push({
      user_id: userId,
      type: WORKOUT_RECAP_TYPE,
      window: WINDOW,
      anchor_date: toIsoDate(new Date(session.started_at)),
      subject_key: `session:${session.id}`,
      severity: 'low',
      status: session.id === latestSession.id ? 'active' : 'dismissed',
      title: 'Workout recap',
      summary: 'Here’s a quick recap of this session.',
      evidence,
      recommendation: [],
      schema_version: SCHEMA_VERSION,
    });
  });

  return { insights, activeSubjectKey };
};

const buildConsistencyStreakInsight = ({
  userId,
  weekStart,
  thisWeekWorkouts,
  baseline,
  streakWeeks,
}: {
  userId: string;
  weekStart: Date;
  thisWeekWorkouts: number;
  baseline: number;
  streakWeeks: number;
}): Record<string, unknown> | null => {
  const milestones = new Set([2, 4, 8, 12]);
  if (!milestones.has(streakWeeks)) {
    return null;
  }

  return {
    user_id: userId,
    type: CONSISTENCY_STREAK_TYPE,
    window: STREAK_WINDOW,
    anchor_date: toIsoDate(weekStart),
    subject_key: GLOBAL_SUBJECT_KEY,
    severity: 'low',
    status: 'active',
    title: `${streakWeeks}-week consistency streak`,
    summary: 'You’re building a strong training habit — keep it rolling!',
    evidence: [
      {
        key: 'sessions',
        label: 'Workouts this week',
        value: thisWeekWorkouts,
        unit: 'workouts',
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
      {
        key: 'streak_weeks',
        label: 'Streak',
        value: streakWeeks,
        unit: 'weeks',
        source: 'weekly_workout_volume',
        period: 'streak',
      },
      {
        key: 'baseline_sessions',
        label: 'Baseline workouts/week',
        value: baseline,
        unit: 'workouts',
        source: 'weekly_workout_volume',
        period: 'baseline',
      },
    ],
    recommendation: [
      {
        type: 'INCREASE_FREQUENCY',
        payload: { text: 'Keep the streak by scheduling your next session now.' },
        rationaleKey: 'CONSISTENCY_LOW',
      },
    ],
    schema_version: SCHEMA_VERSION,
  };
};

const buildWeeklyVolumePrInsight = ({
  userId,
  weekStart,
  thisWeekVolume,
  priorBest,
  volumeUnit,
}: {
  userId: string;
  weekStart: Date;
  thisWeekVolume: number;
  priorBest: number;
  volumeUnit: string;
}): Record<string, unknown> | null => {
  if (priorBest <= 0) {
    return null;
  }
  const pctChange = ((thisWeekVolume - priorBest) / priorBest) * 100;
  if (pctChange < 5) {
    return null;
  }

  return {
    user_id: userId,
    type: WEEKLY_VOLUME_PR_TYPE,
    window: VOLUME_PR_WINDOW,
    anchor_date: toIsoDate(weekStart),
    subject_key: GLOBAL_SUBJECT_KEY,
    severity: 'low',
    status: 'active',
    title: 'New 12-week volume high',
    summary: 'This was your strongest training week in the last 12 weeks.',
    evidence: [
      {
        key: 'volume_load',
        label: 'Weekly volume',
        value: Math.round(thisWeekVolume),
        unit: volumeUnit,
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
      {
        key: 'prior_best',
        label: 'Prior 12-week best',
        value: Math.round(priorBest),
        unit: volumeUnit,
        source: 'weekly_workout_volume',
        period: 'last_12w',
      },
      {
        key: 'change_pct',
        label: 'Change',
        value: Number(pctChange.toFixed(1)),
        unit: '%',
        source: 'weekly_workout_volume',
        period: 'this_week',
      },
    ],
    recommendation: [
      {
        type: 'INCREASE_FREQUENCY',
        payload: { text: 'Hold volume steady next week to consolidate.' },
        rationaleKey: 'CONSISTENCY_LOW',
      },
    ],
    schema_version: SCHEMA_VERSION,
  };
};

const buildStallRiskInsights = async ({
  adminClient,
  userId,
  weekStart,
  preferredUnits,
  conservatismLevel,
  thisWeekRpe,
  lastWeekRpe,
}: {
  adminClient: SupabaseClient;
  userId: string;
  weekStart: Date;
  preferredUnits: 'imperial' | 'metric';
  conservatismLevel: 'chill' | 'standard' | 'aggressive';
  thisWeekRpe?: number | null;
  lastWeekRpe?: number | null;
}): Promise<Record<string, unknown>[]> => {
  const lookbackStart = addDays(weekStart, -42);
  const normalizedThisRpe = clampRpe(thisWeekRpe);
  const normalizedLastRpe = clampRpe(lastWeekRpe);
  const rpeDelta =
    normalizedThisRpe !== null && normalizedLastRpe !== null
      ? Number((normalizedThisRpe - normalizedLastRpe).toFixed(1))
      : null;
  const rpeSpike = rpeDelta !== null && rpeDelta >= 0.5;

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
    const rpeNote = rpeSpike ? ' Average RPE was higher this week, which can mask progress.' : '';

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
      summary: `Recent ${exerciseName} progress has flattened. A small adjustment could help restart momentum.${rpeNote}`,
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
      ...(rpeDelta !== null
        ? [
            {
              key: 'avg_rpe',
              label: 'Avg RPE (WoW)',
              value: Number((normalizedThisRpe ?? 0).toFixed(1)),
              unit: 'rpe',
              compareValue: Number((normalizedLastRpe ?? 0).toFixed(1)),
              deltaValue: rpeDelta,
              source: 'weekly_workout_volume',
              period: 'this_week',
            } satisfies EvidenceItem,
          ]
        : []),
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

  if (
    body.type &&
    body.type !== 'weekly_verdict' &&
    body.type !== 'lift_stall_risk' &&
    body.type !== 'fatigue_risk' &&
    body.type !== 'imbalance_flag' &&
    body.type !== 'all'
  ) {
    return errorResponse('Unsupported insight type', 'invalid_request', 400, false, undefined, origin);
  }

  const requestType = body.type ?? 'all';
  const shouldRunWeekly = requestType === 'weekly_verdict' || requestType === 'all';
  const shouldRunStall = requestType === 'lift_stall_risk' || requestType === 'all';
  const shouldRunFatigue = requestType === 'fatigue_risk' || requestType === 'all';
  const shouldRunImbalance = requestType === 'imbalance_flag' || requestType === 'all';
  const shouldRunPositive = requestType === 'all';

  const [{ preferredUnits, timezone }, conservatismLevel, snoozes] = await Promise.all([
    fetchUserPrefs(supabase, user.id),
    fetchConservatismLevel(adminClient, user.id),
    fetchSnoozes(adminClient, user.id),
  ]);

  const weekStart = resolveWeekStart(timezone);
  const lastWeekStart = addDays(weekStart, -7);
  const feedbackSignals = await fetchFeedbackSignals(adminClient, user.id, weekStart);

  const snoozedUntilWeekly = snoozes.get(INSIGHT_TYPE);
  const snoozedUntilStall = snoozes.get(STALL_RISK_TYPE);
  const snoozedUntilFatigue = snoozes.get(FATIGUE_RISK_TYPE);
  const snoozedUntilImbalance = snoozes.get(IMBALANCE_FLAG_TYPE);
  const shouldRunWeeklyFinal = shouldRunWeekly && (!snoozedUntilWeekly || snoozedUntilWeekly < toIsoDate(weekStart));
  const shouldRunStallFinal =
    shouldRunStall &&
    (!snoozedUntilStall || snoozedUntilStall < toIsoDate(weekStart)) &&
    !feedbackSignals.suppressed.has(STALL_RISK_TYPE);
  const shouldRunFatigueFinal =
    shouldRunFatigue &&
    (!snoozedUntilFatigue || snoozedUntilFatigue < toIsoDate(weekStart)) &&
    !feedbackSignals.suppressed.has(FATIGUE_RISK_TYPE);
  const shouldRunImbalanceFinal =
    shouldRunImbalance &&
    (!snoozedUntilImbalance || snoozedUntilImbalance < toIsoDate(weekStart)) &&
    !feedbackSignals.suppressed.has(IMBALANCE_FLAG_TYPE);

  const shouldFetchWeeklyVolume =
    shouldRunWeeklyFinal || shouldRunFatigueFinal || shouldRunPositive || shouldRunStallFinal;

  if (feedbackSignals.suppressed.size > 0) {
    const suppressedTypes = Array.from(feedbackSignals.suppressed);
    const { error: suppressError } = await adminClient
      .from('training_insights')
      .update({ status: 'dismissed' })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('type', suppressedTypes);
    if (suppressError) {
      console.warn('[Insights] Failed to suppress insights via feedback:', suppressError.message);
    }
  }

  const [weeklyVolume, prCounts] = await Promise.all([
    shouldFetchWeeklyVolume ? fetchWeeklyVolume(supabase, user.id, weekStart, lastWeekStart) : Promise.resolve({ thisWeek: null, lastWeek: null }),
    shouldRunWeeklyFinal ? fetchWeekToDatePrCounts(supabase, user.id, weekStart) : Promise.resolve({ thisWeek: 0, lastWeek: 0 }),
  ]);

  const weekToDateVolume = shouldRunWeeklyFinal
    ? await fetchWeekToDateVolume(supabase, user.id, weekStart, lastWeekStart, preferredUnits, timezone)
    : null;

  const weeklySummary = shouldRunPositive
    ? await fetchWeeklySummary(adminClient, user.id, addDays(weekStart, -7 * 11), weekStart)
    : [];

  const insightsToUpsert: Record<string, unknown>[] = [];

  if (shouldRunWeeklyFinal) {
    const thisWeekWorkouts = clampNumber(weekToDateVolume?.thisWeek.workouts_count);
    const lastWeekWorkouts = clampNumber(weekToDateVolume?.lastWeek.workouts_count);
    const thisWeekVolume = clampNumber(weekToDateVolume?.thisWeek.total_volume);
    const lastWeekVolume = clampNumber(weekToDateVolume?.lastWeek.total_volume);

    const verdict = buildWeeklyVerdict({
      thisWeekWorkouts,
      lastWeekWorkouts,
      thisWeekVolume,
      lastWeekVolume,
      prThisWeek: prCounts.thisWeek,
      isWeekToDate: true,
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
        label: 'Workouts (WTD)',
        value: thisWeekWorkouts,
        unit: 'workouts',
        compareValue: lastWeekWorkouts,
        deltaValue: thisWeekWorkouts - lastWeekWorkouts,
        source: 'workout_sessions',
        period: 'week_to_date',
      },
      {
        key: 'volume_load',
        label: 'Total volume (WTD)',
        value: Math.round(thisWeekVolume),
        unit: volumeUnit,
        compareValue: shouldSuppressVolumeDelta ? undefined : Math.round(lastWeekVolume),
        deltaValue: shouldSuppressVolumeDelta ? undefined : Math.round(thisWeekVolume - lastWeekVolume),
        source: 'workout_sets',
        period: 'week_to_date',
      },
    ];

    if (prCounts.thisWeek > 0 || prCounts.lastWeek > 0) {
      evidence.push({
        key: 'prs',
        label: 'PRs (WTD)',
        value: prCounts.thisWeek,
        unit: 'prs',
        compareValue: prCounts.lastWeek,
        deltaValue: prCounts.thisWeek - prCounts.lastWeek,
        source: 'exercise_exposures',
        period: 'week_to_date',
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
    const thisWeekRpe = clampRpe(weeklyVolume.thisWeek?.avg_rpe);
    const lastWeekRpe = clampRpe(weeklyVolume.lastWeek?.avg_rpe);
    const stallInsights = await buildStallRiskInsights({
      adminClient,
      userId: user.id,
      weekStart,
      preferredUnits,
      conservatismLevel,
      thisWeekRpe,
      lastWeekRpe,
    });
    insightsToUpsert.push(...stallInsights);
  }

  if (shouldRunFatigueFinal) {
    const thisWeekWorkouts = clampNumber(weeklyVolume.thisWeek?.workouts_count);
    const lastWeekWorkouts = clampNumber(weeklyVolume.lastWeek?.workouts_count);
    const thisWeekVolume = clampNumber(weeklyVolume.thisWeek?.total_volume);
    const lastWeekVolume = clampNumber(weeklyVolume.lastWeek?.total_volume);
    const thisWeekRpe = clampRpe(weeklyVolume.thisWeek?.avg_rpe);
    const lastWeekRpe = clampRpe(weeklyVolume.lastWeek?.avg_rpe);

    const fatigueInsight = await buildFatigueRiskInsight({
      adminClient,
      userId: user.id,
      weekStart,
      lastWeekStart,
      conservatismLevel,
      feedbackCount: feedbackSignals.notHelpfulCounts.get(FATIGUE_RISK_TYPE) ?? 0,
      thisWeekVolume,
      lastWeekVolume,
      thisWeekWorkouts,
      lastWeekWorkouts,
      thisWeekRpe,
      lastWeekRpe,
    });

    if (fatigueInsight) {
      insightsToUpsert.push(fatigueInsight);
    }
  }

  if (shouldRunImbalanceFinal) {
    const imbalanceInsight = await buildImbalanceInsight({
      adminClient,
      userId: user.id,
      weekStart,
      feedbackCount: feedbackSignals.notHelpfulCounts.get(IMBALANCE_FLAG_TYPE) ?? 0,
    });

    if (imbalanceInsight) {
      insightsToUpsert.push(imbalanceInsight);
    }
  }

  if (shouldRunPositive) {
    const { insights: recapInsights, activeSubjectKey } = await buildWorkoutRecapInsights({
      adminClient,
      userId: user.id,
      preferredUnits,
    });

    if (activeSubjectKey) {
      const { error: recapDismissError } = await adminClient
        .from('training_insights')
        .update({ status: 'dismissed' })
        .eq('user_id', user.id)
        .eq('type', WORKOUT_RECAP_TYPE)
        .neq('subject_key', activeSubjectKey)
        .eq('status', 'active');
      if (recapDismissError) {
        console.warn('[Insights] Failed to dismiss older workout recaps:', recapDismissError.message);
      }
    }

    if (recapInsights.length > 0) {
      insightsToUpsert.push(...recapInsights);
    }

    const thisWeekWorkouts = clampNumber(weeklyVolume.thisWeek?.workouts_count);
    const thisWeekVolume = clampNumber(weeklyVolume.thisWeek?.total_volume);
    const volumeUnit = preferredUnits === 'metric' ? 'kg' : 'lbs';

    if (thisWeekWorkouts >= 2) {
      const positiveLimit = thisWeekWorkouts >= 6 ? 2 : 1;
      const positiveWindowStart = addDays(weekStart, -7);
      const { data: recentPositive } = await adminClient
        .from('training_insights')
        .select('type, created_at')
        .eq('user_id', user.id)
        .in('type', POSITIVE_INSIGHT_TYPES)
        .gte('created_at', toIsoDateTime(positiveWindowStart));

      const positiveRemaining = Math.max(positiveLimit - (recentPositive?.length ?? 0), 0);

      if (positiveRemaining > 0) {
        const cooldownStart = addDays(weekStart, -28);
        const { data: cooldownRows } = await adminClient
          .from('training_insights')
          .select('type, created_at')
          .eq('user_id', user.id)
          .in('type', POSITIVE_INSIGHT_TYPES)
          .gte('created_at', toIsoDateTime(cooldownStart));

        const cooldownTypes = new Set<string>((cooldownRows ?? []).map((row: { type: string }) => row.type));

        const weeklyMap = new Map<string, WeeklySummaryRow>();
        weeklySummary.forEach((row) => {
          if (!row?.week_start) return;
          weeklyMap.set(toIsoDate(new Date(row.week_start)), row);
        });
        const fullSeries = Array.from({ length: 12 }, (_, index) => {
          const weekDate = addDays(weekStart, -7 * (11 - index));
          const key = toIsoDate(weekDate);
          const row = weeklyMap.get(key);
          return {
            week_start: key,
            workouts_count: clampNumber(row?.workouts_count),
            total_volume: clampNumber(row?.total_volume),
          };
        });

        const previousWeeks = fullSeries.slice(0, fullSeries.length - 1);
        const baselineWindow = previousWeeks.slice(-8);
        const baselineMedian = median(baselineWindow.map((row) => row.workouts_count ?? 0));
        const baseline = clamp(Math.round(baselineMedian), 2, 6);
        const qualifiedThreshold = baseline <= 2 ? 2 : Math.max(3, baseline);
        let streakWeeks = 0;
        for (let i = fullSeries.length - 1; i >= 0; i -= 1) {
          if ((fullSeries[i].workouts_count ?? 0) >= qualifiedThreshold) {
            streakWeeks += 1;
          } else {
            break;
          }
        }

        const positiveInsights: Record<string, unknown>[] = [];

        if (!cooldownTypes.has(CONSISTENCY_STREAK_TYPE)) {
          const streakInsight = buildConsistencyStreakInsight({
            userId: user.id,
            weekStart,
            thisWeekWorkouts,
            baseline,
            streakWeeks,
          });
          if (streakInsight) {
            positiveInsights.push(streakInsight);
          }
        }

        if (!cooldownTypes.has(WEEKLY_VOLUME_PR_TYPE)) {
          const priorBest = Math.max(
            0,
            ...previousWeeks.map((row) => row.total_volume ?? 0)
          );
          const volumeInsight = buildWeeklyVolumePrInsight({
            userId: user.id,
            weekStart,
            thisWeekVolume,
            priorBest,
            volumeUnit,
          });
          if (volumeInsight) {
            positiveInsights.push(volumeInsight);
          }
        }

        positiveInsights.slice(0, positiveRemaining).forEach((insight) => {
          insightsToUpsert.push(insight);
        });
      }
    }
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

  const insightKeys = insightsToUpsert
    .map((insight) => ({
      type: String(insight.type),
      window: String(insight.window),
      anchor_date: String(insight.anchor_date),
      subject_key: String(insight.subject_key),
    }))
    .filter((key) => key.type && key.window && key.anchor_date && key.subject_key);

  const types = Array.from(new Set(insightKeys.map((key) => key.type)));
  const windows = Array.from(new Set(insightKeys.map((key) => key.window)));
  const anchorDates = Array.from(new Set(insightKeys.map((key) => key.anchor_date)));
  const subjectKeys = Array.from(new Set(insightKeys.map((key) => key.subject_key)));

  if (types.length > 0 && windows.length > 0 && anchorDates.length > 0 && subjectKeys.length > 0) {
    const { data: dismissedRows, error: dismissedError } = await adminClient
      .from('training_insights')
      .select('type, window, anchor_date, subject_key, status')
      .eq('user_id', user.id)
      .in('type', types)
      .in('window', windows)
      .in('anchor_date', anchorDates)
      .in('subject_key', subjectKeys)
      .eq('status', 'dismissed');

    if (dismissedError) {
      console.warn('[Insights] Failed to fetch dismissed insights:', dismissedError.message);
    } else {
      const dismissedKeys = new Set(
        (dismissedRows ?? []).map((row) =>
          `${row.type}|${row.window}|${row.anchor_date}|${row.subject_key}`
        )
      );

      insightsToUpsert.forEach((insight) => {
        const key = `${insight.type}|${insight.window}|${insight.anchor_date}|${insight.subject_key}`;
        if (dismissedKeys.has(key)) {
          insight.status = 'dismissed';
        }
      });
    }
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
