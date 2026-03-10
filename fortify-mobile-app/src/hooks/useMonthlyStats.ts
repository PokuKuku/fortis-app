import { useEffect, useMemo, useState } from 'react';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import type { WorkoutSession, WeightUnit } from '@/src/types/workout';
import { getSessionVolume, type VolumeContext } from '@/src/utils/workoutVolume';

export type MonthlyStats = {
  totalVolume: number;
  totalWorkouts: number;
  totalTimeSeconds: number;
  isLoading: boolean;
};

const getStatsFromSessions = (
  sessions: WorkoutSession[],
  volumeContext: VolumeContext
) => {
  let totalVolume = 0;
  let totalWorkouts = 0;
  let totalTimeSeconds = 0;

  sessions.forEach((session) => {
    const summary = getWorkoutSummary(session);
    if (summary.totalSets === 0) return;

    totalWorkouts += 1;
    totalVolume += getSessionVolume(session, volumeContext);

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
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const [stats, setStats] = useState<MonthlyStats>({
    totalVolume: 0,
    totalWorkouts: 0,
    totalTimeSeconds: 0,
    isLoading: true,
  });

  const volumeContext = useMemo<VolumeContext>(
    () => ({
      preferredUnits,
      weightUnits,
      exercisesById,
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
    }),
    [preferredUnits, weightUnits, exercisesById, bodyweightKg, profile?.weight_kg]
  );

  const localMonthlyStats = useMemo(() => {
    if (completedSessions.length === 0) return null;
    return getStatsFromSessions(completedSessions, volumeContext);
  }, [completedSessions, volumeContext]);

  useEffect(() => {
    setStats({
      ...(localMonthlyStats ?? { totalVolume: 0, totalWorkouts: 0, totalTimeSeconds: 0 }),
      isLoading: false,
    });
  }, [localMonthlyStats]);

  return stats;
}
