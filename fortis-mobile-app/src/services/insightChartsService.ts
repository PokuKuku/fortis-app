import { addDays } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { parseSubjectKey } from '@/src/types/insights';
import type { TrainingInsight } from '@/src/types/insights';
import type { InsightBarPoint, InsightChartPoint, InsightChartSeries } from '@/src/types/insightCharts';

const WEEKLY_SERIES_WEEKS = 12;
const EXPOSURE_LOOKBACK_DAYS = 42;

type WeeklyVolumeRow = {
  week_start: string;
  total_volume: number | null;
  workouts_count: number | null;
};

type ExerciseWeeklyRow = {
  week_start: string;
  total_volume: number | null;
  exposures: number | null;
  best_e1rm: number | null;
};

type ExerciseExposureRow = {
  exposure_at: string;
  best_e1rm: number | null;
};

type MuscleGroupSetRow = {
  week_start: string;
  muscle_group: string | null;
  working_sets: number | null;
};

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const toIsoDateTime = (date: Date): string => date.toISOString();

const parseNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const normalizeWeekSeries = <T extends { week_start: string }>(
  rows: T[],
  value: (row: T) => number
): InsightChartPoint[] => {
  return rows
    .map((row) => ({
      date: row.week_start,
      value: value(row),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const normalizeExposureSeries = (rows: ExerciseExposureRow[]): InsightChartPoint[] => {
  return rows
    .map((row) => ({
      date: new Date(row.exposure_at).toISOString(),
      value: parseNumber(row.best_e1rm),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const normalizeMuscleGroup = (group: string): string => {
  const key = group.trim().toLowerCase();
  if (['middle back', 'upper back', 'lower back', 'lats', 'traps'].includes(key)) return 'back';
  if (['quadriceps', 'quads'].includes(key)) return 'quads';
  if (['glutes', 'gluteus maximus'].includes(key)) return 'glutes';
  if (['abdominals', 'abs', 'core'].includes(key)) return 'core';
  if (['delts', 'deltoids', 'shoulders'].includes(key)) return 'shoulders';
  if (['pectorals', 'chest'].includes(key)) return 'chest';
  if (['hamstrings'].includes(key)) return 'hamstrings';
  if (['biceps'].includes(key)) return 'biceps';
  if (['triceps'].includes(key)) return 'triceps';
  if (['calves'].includes(key)) return 'calves';
  return key;
};

const getVolumeUnit = (insight: TrainingInsight): string | undefined => {
  return insight.evidence.find((item) => item.key === 'volume_load')?.unit;
};

const getProgressUnit = (insight: TrainingInsight): string | undefined => {
  return insight.evidence.find((item) => item.key === 'best_e1rm')?.unit;
};

const getVolumeUnitFallback = (insight: TrainingInsight): string => {
  return getVolumeUnit(insight) ?? 'lbs';
};

export async function fetchInsightChartSeries(
  insight: TrainingInsight
): Promise<InsightChartSeries | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const anchorDate = new Date(`${insight.anchorDate}T00:00:00`);
  const weeklyStart = Number.isNaN(anchorDate.getTime())
    ? new Date()
    : addDays(anchorDate, -7 * (WEEKLY_SERIES_WEEKS - 1));
  const exposureStart = Number.isNaN(anchorDate.getTime())
    ? addDays(new Date(), -EXPOSURE_LOOKBACK_DAYS)
    : addDays(anchorDate, -EXPOSURE_LOOKBACK_DAYS);

  const series: InsightChartSeries = {
    progress: [],
    volume: [],
    frequency: [],
    units: {},
  };

  if (
    insight.type === 'WEEKLY_VERDICT_V1' ||
    insight.type === 'FATIGUE_RISK_V1' ||
    insight.type === 'CONSISTENCY_STREAK_V1' ||
    insight.type === 'WEEKLY_VOLUME_PR_V1'
  ) {
    const { data, error } = await supabase
      .from('weekly_workout_volume')
      .select('week_start, total_volume, workouts_count')
      .eq('user_id', user.id)
      .gte('week_start', toIsoDate(weeklyStart))
      .order('week_start', { ascending: true });

    if (error || !data) {
      return series;
    }

    const rows = data as WeeklyVolumeRow[];
    series.volume = normalizeWeekSeries(rows, (row) => parseNumber(row.total_volume));
    series.frequency = normalizeWeekSeries(rows, (row) => parseNumber(row.workouts_count));
    series.units = {
      volume: getVolumeUnit(insight),
      frequency: 'workouts',
    };
    const anchor = Number.isNaN(anchorDate.getTime()) ? new Date() : anchorDate;
    const lastWeek = addDays(anchor, -7);
    series.highlight = {
      range: { start: toIsoDate(lastWeek), end: toIsoDate(anchor) },
    };

    return series;
  }

  if (insight.type === 'LIFT_STALL_RISK_V1') {
    const exerciseId = insight.exerciseId;
    if (!exerciseId) {
      return series;
    }

    const [weeklyAgg, exposures] = await Promise.all([
      supabase
        .from('exercise_weekly_agg')
        .select('week_start, total_volume, exposures, best_e1rm')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .gte('week_start', toIsoDate(weeklyStart))
        .order('week_start', { ascending: true }),
      supabase
        .from('exercise_exposures')
        .select('exposure_at, best_e1rm')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .gte('exposure_at', toIsoDateTime(exposureStart))
        .order('exposure_at', { ascending: true }),
    ]);

    if (!weeklyAgg.error && weeklyAgg.data) {
      const rows = weeklyAgg.data as ExerciseWeeklyRow[];
      series.volume = normalizeWeekSeries(rows, (row) => parseNumber(row.total_volume));
      series.frequency = normalizeWeekSeries(rows, (row) => parseNumber(row.exposures));
    }

    if (!exposures.error && exposures.data) {
      const exposureRows = exposures.data as ExerciseExposureRow[];
      series.progress = normalizeExposureSeries(exposureRows);
    }

    const highlightStart = Number.isNaN(anchorDate.getTime())
      ? insight.anchorDate
      : toIsoDate(addDays(anchorDate, -21));

    const highlightPoints = series.progress.slice(-3).map((point) => point.date);

    series.units = {
      progress: getProgressUnit(insight),
      volume: getVolumeUnit(insight),
      frequency: 'sessions',
    };
    series.highlight = {
      range: { start: highlightStart, end: insight.anchorDate },
      points: highlightPoints,
    };

    return series;
  }

  if (insight.type === 'FIRST_WORKOUT_RECAP_V1') {
    const subject = parseSubjectKey(insight.subjectKey);
    if (subject.type !== 'session') {
      return series;
    }
    const volumeUnit = getVolumeUnitFallback(insight);
    const { data, error } = await supabase
      .from('workout_sets')
      .select('exercise_id, reps, weight, weight_unit, is_warmup, exercises(name)')
      .eq('session_id', subject.sessionId);

    if (error || !data) {
      return series;
    }

    const byExercise = new Map<string, { name: string; volume: number }>();
    (data as Array<{
      exercise_id: string;
      reps: number | null;
      weight: number | null;
      weight_unit: string | null;
      is_warmup: boolean | null;
      exercises?: { name?: string } | null;
    }>)
      .forEach((row) => {
        if (!row?.exercise_id) return;
        if (row.is_warmup) return;
        if (!row.reps || !row.weight || row.reps <= 0 || row.weight <= 0) return;
        const weightNorm =
          volumeUnit === 'kg'
            ? row.weight_unit === 'lbs'
              ? row.weight / 2.20462
              : row.weight
            : row.weight_unit === 'kg'
            ? row.weight * 2.20462
            : row.weight;
        const volume = weightNorm * row.reps;
        const name = row.exercises?.name ?? 'Exercise';
        const existing = byExercise.get(row.exercise_id) ?? { name, volume: 0 };
        existing.volume += volume;
        byExercise.set(row.exercise_id, existing);
      });

    const breakdown: InsightBarPoint[] = Array.from(byExercise.values())
      .map((entry) => ({
        label: entry.name,
        value: entry.volume,
      }))
      .sort((a, b) => b.value - a.value);

    const top = breakdown.slice(0, 5);
    if (breakdown.length > 5) {
      const otherTotal = breakdown.slice(5).reduce((sum, item) => sum + item.value, 0);
      top.push({ label: 'Other', value: otherTotal });
    }

    series.breakdown = top;
    series.breakdownUnit = volumeUnit;
    return series;
  }

  if (insight.type === 'IMBALANCE_FLAG_V1') {
    const { data, error } = await supabase
      .from('weekly_muscle_group_sets')
      .select('week_start, muscle_group, working_sets')
      .eq('user_id', user.id)
      .gte('week_start', toIsoDate(weeklyStart))
      .order('week_start', { ascending: true });

    if (error || !data) {
      return series;
    }

    const rows = data as MuscleGroupSetRow[];
    const subject = parseSubjectKey(insight.subjectKey);
    const targetGroup =
      insight.muscleGroup ??
      (subject.type === 'muscle' ? subject.muscleGroup : undefined);
    const targetKey = targetGroup ? normalizeMuscleGroup(targetGroup) : null;
    const hasPushPullEvidence = insight.evidence.some((item) =>
      ['push_sets', 'pull_sets', 'push_pull_ratio'].includes(item.key)
    );
    const isPushPull = subject.type === 'global' || hasPushPullEvidence;
    const pushGroups = new Set(['chest', 'shoulders', 'triceps']);
    const pullGroups = new Set(['back', 'biceps']);

    const byWeek = new Map<string, { push: number; pull: number; total: number; target: number }>();
    rows.forEach((row) => {
      if (!row.week_start) return;
      const weekKey = row.week_start;
      const group = row.muscle_group ? normalizeMuscleGroup(row.muscle_group) : '';
      const sets = parseNumber(row.working_sets);
      const bucket = byWeek.get(weekKey) ?? { push: 0, pull: 0, total: 0, target: 0 };
      bucket.total += sets;
      if (group && pushGroups.has(group)) bucket.push += sets;
      if (group && pullGroups.has(group)) bucket.pull += sets;
      if (targetKey && group === targetKey) bucket.target += sets;
      byWeek.set(weekKey, bucket);
    });

    const weeks = Array.from(byWeek.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    series.volume = weeks.map((week) => ({
      date: week,
      value: isPushPull ? byWeek.get(week)?.push ?? 0 : byWeek.get(week)?.target ?? 0,
    }));
    series.frequency = weeks.map((week) => ({
      date: week,
      value: isPushPull ? byWeek.get(week)?.pull ?? 0 : byWeek.get(week)?.total ?? 0,
    }));
    series.progress = weeks.map((week) => {
      const bucket = byWeek.get(week) ?? { push: 0, pull: 0, total: 0, target: 0 };
      const ratio = bucket.pull > 0 ? bucket.push / bucket.pull : bucket.push > 0 ? 2 : 1;
      const share = bucket.total > 0 ? (bucket.target / bucket.total) * 100 : 0;
      return {
        date: week,
        value: isPushPull ? Number(ratio.toFixed(2)) : Number(share.toFixed(1)),
      };
    });

    series.units = {
      volume: 'sets',
      frequency: 'sets',
      progress: isPushPull ? 'ratio' : '%',
    };

    const anchor = Number.isNaN(anchorDate.getTime()) ? new Date() : anchorDate;
    series.highlight = {
      range: {
        start: toIsoDate(addDays(anchor, -7)),
        end: toIsoDate(anchor),
      },
    };

    return series;
  }

  return series;
}
