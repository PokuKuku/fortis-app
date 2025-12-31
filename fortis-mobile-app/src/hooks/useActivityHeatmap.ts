import { useEffect, useMemo, useState } from 'react';
import { addDays, format, startOfDay, startOfWeek, subDays } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export interface HeatmapDay {
  date: Date;
  volume: number;
  hasActivity: boolean;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export interface HeatmapMonthLabel {
  label: string;
  weekIndex: number;
}

type WorkoutSetRow = {
  weight: number | null;
  reps: number | null;
  is_warmup: boolean | null;
};

type WorkoutSessionRow = {
  completed_at: string | null;
  started_at: string;
  workout_sets: WorkoutSetRow[] | null;
};

export function useActivityHeatmap(userId?: string, weekCount: number = 52): {
  weeks: HeatmapWeek[];
  monthLabels: HeatmapMonthLabel[];
  maxVolume: number;
  isLoading: boolean;
  hasActivity: boolean;
} {
  const [dayVolumes, setDayVolumes] = useState<Record<string, number>>({});
  const [dayActivity, setDayActivity] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const startDate = useMemo(() => {
    const today = startOfDay(new Date());
    // Start from the Monday of the current week, then go back (weekCount - 1) weeks
    // This ensures the current week (including today) is always in the grid
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    return subDays(currentWeekStart, (weekCount - 1) * 7);
  }, [weekCount]);

  useEffect(() => {
    let isMounted = true;

    if (!userId || !isSupabaseConfigured()) {
      setDayVolumes({});
      return;
    }

    setIsLoading(true);

    const load = async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('completed_at, started_at, workout_sets!session_id(weight, reps, is_warmup)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate.toISOString());

      if (!isMounted) return;

      if (error) {
        console.warn('[ActivityHeatmap] Failed to load activity data:', error.message);
        setDayVolumes({});
        setIsLoading(false);
        return;
      }

      const volumeByDay: Record<string, number> = {};
      const activityByDay: Record<string, boolean> = {};
      (data as WorkoutSessionRow[] | null)?.forEach((session) => {
        const sessionDate = startOfDay(new Date(session.completed_at || session.started_at));
        const key = format(sessionDate, 'yyyy-MM-dd');
        let dayVolume = 0;

        // Mark as having activity if session is completed (query already filters for completed_at != null)
        // This ensures activity shows even if workout_sets relationship fails to load
        let dayHasActivity = session.completed_at !== null;

        (session.workout_sets || []).forEach((set) => {
          if (set.is_warmup) return;
          const weight = set.weight ?? 0;
          const reps = set.reps ?? 0;
          dayVolume += weight * reps;
        });

        volumeByDay[key] = (volumeByDay[key] || 0) + dayVolume;
        activityByDay[key] = activityByDay[key] || dayHasActivity;
      });

      setDayVolumes(volumeByDay);
      setDayActivity(activityByDay);
      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [startDate, userId]);

  const weeks = useMemo(() => {
    const result: HeatmapWeek[] = [];
    for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
      const days: HeatmapDay[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = addDays(startDate, weekIndex * 7 + dayIndex);
        const key = format(date, 'yyyy-MM-dd');
        days.push({
          date,
          volume: dayVolumes[key] || 0,
          hasActivity: dayActivity[key] || false,
        });
      }
      result.push({ days });
    }
    // Reverse so current week is first (left side), older weeks to the right
    return result.reverse();
  }, [dayVolumes, dayActivity, startDate, weekCount]);

  const monthLabels = useMemo(() => {
    const labels: HeatmapMonthLabel[] = [];
    const minSpacingWeeks = 3;
    let lastLabeledMonth = '';
    let lastLabelWeekIndex = -100;
    weeks.forEach((week, weekIndex) => {
      const monthLabel = format(week.days[0].date, 'MMM');
      if (monthLabel === lastLabeledMonth) return;
      if (weekIndex - lastLabelWeekIndex < minSpacingWeeks) return;
      labels.push({ label: monthLabel, weekIndex });
      lastLabeledMonth = monthLabel;
      lastLabelWeekIndex = weekIndex;
    });
    return labels;
  }, [weeks]);

  const maxVolume = useMemo(() => {
    const volumes = Object.values(dayVolumes);
    if (volumes.length === 0) return 0;
    return Math.max(...volumes);
  }, [dayVolumes]);

  return {
    weeks,
    monthLabels,
    maxVolume,
    isLoading,
    hasActivity: Object.values(dayActivity).some(Boolean),
  };
}
