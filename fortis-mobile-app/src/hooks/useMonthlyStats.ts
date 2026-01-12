import { useEffect, useMemo, useState } from 'react';
import { startOfDay, startOfWeek, subDays, endOfDay } from 'date-fns';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import type { WorkoutSession } from '@/src/types/workout';

export type MonthlyStats = {
  totalVolume: number;
  totalWorkouts: number;
  totalTimeSeconds: number;
  isLoading: boolean;
};

const getStatsFromSessions = (sessions: WorkoutSession[]) => {
  let totalVolume = 0;
  let totalWorkouts = 0;
  let totalTimeSeconds = 0;

  sessions.forEach((session) => {
    const summary = getWorkoutSummary(session);
    if (summary.totalSets === 0) return;

    totalWorkouts += 1;
    totalVolume += summary.totalVolume;

    const durationSeconds = session.durationSeconds
      ?? (session.completedAt
        ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
        : 0);
    totalTimeSeconds += Math.max(0, durationSeconds);
  });

  return { totalVolume, totalWorkouts, totalTimeSeconds };
};

export function useMonthlyStats(
  completedSessions: WorkoutSession[],
  userId?: string
): MonthlyStats {
  const [stats, setStats] = useState<MonthlyStats>({
    totalVolume: 0,
    totalWorkouts: 0,
    totalTimeSeconds: 0,
    isLoading: true,
  });

  const todayKey = startOfDay(new Date()).getTime();
  const today = new Date(todayKey);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const rangeStartKey = subDays(weekStart, 7 * 3).getTime();
  const rangeEndKey = endOfDay(today).getTime();
  const rangeStart = useMemo(() => new Date(rangeStartKey), [rangeStartKey]);
  const rangeEnd = useMemo(() => new Date(rangeEndKey), [rangeEndKey]);

  const localInRange = useMemo(() => {
    if (completedSessions.length === 0) return [];
    return completedSessions.filter((session) => {
      const sessionDateKey = startOfDay(
        new Date(session.completedAt ?? session.startedAt)
      ).getTime();
      return sessionDateKey >= rangeStartKey && sessionDateKey <= rangeEndKey;
    });
  }, [completedSessions, rangeStartKey, rangeEndKey]);

  const localMonthlyStats = useMemo(() => {
    if (localInRange.length === 0) return null;
    return getStatsFromSessions(localInRange);
  }, [localInRange]);

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setStats({ ...(localMonthlyStats ?? { totalVolume: 0, totalWorkouts: 0, totalTimeSeconds: 0 }), isLoading: false });
      return () => {
        isMounted = false;
      };
    }

    if (localMonthlyStats) {
      setStats({ ...localMonthlyStats, isLoading: true });
    }

    const loadMonthly = async () => {
      const { sessions } = await fetchWorkoutHistory({
        dateFrom: rangeStart,
        dateTo: rangeEnd,
      });

      if (!isMounted) return;
      const merged = localInRange.length === 0
        ? sessions
        : [...sessions, ...localInRange.filter((session) => (
          !sessions.some((remote) => remote.localId === session.localId)
        ))];
      const nextStats = getStatsFromSessions(merged);
      setStats({ ...nextStats, isLoading: false });
    };

    loadMonthly().catch((error) => {
      if (!isMounted) return;
      console.warn('[MonthlyStats] Failed to load remote sessions:', error);
      setStats({ ...(localMonthlyStats ?? { totalVolume: 0, totalWorkouts: 0, totalTimeSeconds: 0 }), isLoading: false });
    });

    return () => {
      isMounted = false;
    };
  }, [userId, rangeStart, rangeEnd, localMonthlyStats, localInRange]);

  return stats;
}
