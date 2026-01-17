import { useEffect, useMemo, useState } from 'react';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import type { WorkoutSession, WeightUnit } from '@/src/types/workout';
import { getSessionVolume } from '@/src/utils/workoutVolume';

export type MonthlyStats = {
  totalVolume: number;
  totalWorkouts: number;
  totalTimeSeconds: number;
  isLoading: boolean;
};

const getStatsFromSessions = (
  sessions: WorkoutSession[],
  preferredUnits: 'imperial' | 'metric',
  weightUnits: Record<string, WeightUnit>
) => {
  let totalVolume = 0;
  let totalWorkouts = 0;
  let totalTimeSeconds = 0;

  sessions.forEach((session) => {
    const summary = getWorkoutSummary(session);
    if (summary.totalSets === 0) return;

    totalWorkouts += 1;
    totalVolume += getSessionVolume(session, preferredUnits, weightUnits);

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
  preferredUnits: 'imperial' | 'metric' = 'imperial',
  weightUnits: Record<string, WeightUnit> = {},
  _userId?: string
): MonthlyStats {
  const [stats, setStats] = useState<MonthlyStats>({
    totalVolume: 0,
    totalWorkouts: 0,
    totalTimeSeconds: 0,
    isLoading: true,
  });

  const localMonthlyStats = useMemo(() => {
    if (completedSessions.length === 0) return null;
    return getStatsFromSessions(completedSessions, preferredUnits, weightUnits);
  }, [completedSessions, preferredUnits, weightUnits]);

  useEffect(() => {
    setStats({
      ...(localMonthlyStats ?? { totalVolume: 0, totalWorkouts: 0, totalTimeSeconds: 0 }),
      isLoading: false,
    });
  }, [localMonthlyStats]);

  return stats;
}
