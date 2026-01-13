import { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import { mergeWorkoutSessions } from '@/src/utils/workoutHistory';
import type { WorkoutSession } from '@/src/types/workout';

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

export function useActivityHeatmap(
  userId?: string,
  mode: 'year' | 'rolling' = 'year',
  weekCount: number = 52,
  localSessions?: WorkoutSession[]
): {
  weeks: HeatmapWeek[];
  monthLabels: HeatmapMonthLabel[];
  maxVolume: number;
  isLoading: boolean;
  hasActivity: boolean;
} {
  const [dayVolumes, setDayVolumes] = useState<Record<string, number>>({});
  const [dayActivity, setDayActivity] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const yearStart = useMemo(() => startOfYear(today), [today]);
  const yearEnd = useMemo(() => endOfYear(today), [today]);
  const computedWeekCount = useMemo(() => {
    if (mode !== 'year') return weekCount;
    const start = startOfWeek(yearStart, { weekStartsOn: 1 });
    const end = endOfWeek(yearEnd, { weekStartsOn: 1 });
    const totalDays = differenceInCalendarDays(end, start) + 1;
    return Math.ceil(totalDays / 7);
  }, [mode, weekCount, yearStart, yearEnd]);
  const startDate = useMemo(() => {
    if (mode === 'year') {
      return startOfWeek(yearStart, { weekStartsOn: 1 });
    }
    // Start from the Monday of the current week, then go back (weekCount - 1) weeks
    // This ensures the current week (including today) is always in the grid
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    return subDays(currentWeekStart, (weekCount - 1) * 7);
  }, [mode, today, weekCount, yearStart]);

  useEffect(() => {
    let isMounted = true;
    const hasLocalSessions = (localSessions?.length ?? 0) > 0;
    const isInRange = (date: Date) => {
      if (date < startDate) return false;
      if (mode === 'year' && date > yearEnd) return false;
      return true;
    };
    const buildMaps = (sessions: WorkoutSession[]) => {
      const volumeByDay: Record<string, number> = {};
      const activityByDay: Record<string, boolean> = {};

      sessions.forEach((session) => {
        const sessionDate = startOfDay(new Date(session.startedAt));
        if (!isInRange(sessionDate)) return;

        let dayVolume = 0;
        let dayHasActivity = false;

        session.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            if (!set.isCompleted) return;
            dayHasActivity = true;
            if (set.setType === 'warmup') return;
            const weight = set.weight ?? 0;
            const reps = set.reps ?? 0;
            dayVolume += weight * reps;
          });
        });

        if (!dayHasActivity) return;

        const key = format(sessionDate, 'yyyy-MM-dd');
        volumeByDay[key] = (volumeByDay[key] || 0) + dayVolume;
        activityByDay[key] = activityByDay[key] || dayHasActivity;
      });

      return { volumeByDay, activityByDay };
    };
    const applyMaps = (sessions: WorkoutSession[]) => {
      const { volumeByDay, activityByDay } = buildMaps(sessions);
      setDayVolumes(volumeByDay);
      setDayActivity(activityByDay);
    };

    if (!userId) {
      applyMaps(localSessions ?? []);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (hasLocalSessions) {
      applyMaps(localSessions ?? []);
    }
    setIsLoading(true);

    const load = async () => {
      const rangeEnd = mode === 'year' ? endOfDay(yearEnd) : endOfDay(today);
      const { sessions } = await fetchWorkoutHistory({
        dateFrom: startDate,
        dateTo: rangeEnd,
      });

      if (!isMounted) return;
      const mergedSessions = hasLocalSessions
        ? mergeWorkoutSessions(sessions, localSessions ?? [])
        : sessions;
      applyMaps(mergedSessions);
      setIsLoading(false);
    };

    load().catch((error) => {
      if (!isMounted) return;
      console.warn('[ActivityHeatmap] Failed to load activity data:', error);
      applyMaps(localSessions ?? []);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [localSessions, mode, startDate, userId, yearEnd, today]);

  const weeks = useMemo(() => {
    const result: HeatmapWeek[] = [];
    for (let weekIndex = 0; weekIndex < computedWeekCount; weekIndex += 1) {
      const days: HeatmapDay[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = addDays(startDate, weekIndex * 7 + dayIndex);
        const key = format(date, 'yyyy-MM-dd');
        const isInYear = mode !== 'year' || (date >= yearStart && date <= yearEnd);
        days.push({
          date,
          volume: isInYear ? (dayVolumes[key] || 0) : 0,
          hasActivity: isInYear ? (dayActivity[key] || false) : false,
        });
      }
      result.push({ days });
    }
    if (mode === 'rolling') {
      // Reverse so current week is first (left side), older weeks to the right
      return result.reverse();
    }
    return result;
  }, [dayVolumes, dayActivity, startDate, computedWeekCount, mode, yearEnd, yearStart]);

  const monthLabels = useMemo(() => {
    const labels: HeatmapMonthLabel[] = [];
    const minSpacingWeeks = 3;
    let lastLabeledMonth = '';
    let lastLabelWeekIndex = -100;
    weeks.forEach((week, weekIndex) => {
      const labelDate = mode === 'year'
        ? (
            week.days.find((day) =>
              day.date >= yearStart && day.date <= yearEnd && day.date.getDate() === 1
            )?.date
            ?? week.days.find((day) => day.date >= yearStart && day.date <= yearEnd)?.date
          )
        : week.days[0].date;
      if (!labelDate) return;
      const monthLabel = format(labelDate, 'MMM');
      if (monthLabel === lastLabeledMonth) return;
      if (weekIndex - lastLabelWeekIndex < minSpacingWeeks) return;
      labels.push({ label: monthLabel, weekIndex });
      lastLabeledMonth = monthLabel;
      lastLabelWeekIndex = weekIndex;
    });
    return labels;
  }, [mode, weeks, yearEnd, yearStart]);

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
