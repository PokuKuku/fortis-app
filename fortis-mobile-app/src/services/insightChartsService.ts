import { addDays } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import type { TrainingInsight } from '@/src/types/insights';
import type { InsightChartPoint, InsightChartSeries } from '@/src/types/insightCharts';

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

const getVolumeUnit = (insight: TrainingInsight): string | undefined => {
  return insight.evidence.find((item) => item.key === 'volume_load')?.unit;
};

const getProgressUnit = (insight: TrainingInsight): string | undefined => {
  return insight.evidence.find((item) => item.key === 'best_e1rm')?.unit;
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

  if (insight.type === 'WEEKLY_VERDICT_V1' || insight.type === 'FATIGUE_RISK_V1') {
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
    series.highlight = {
      range: { start: insight.anchorDate, end: insight.anchorDate },
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

  return series;
}
