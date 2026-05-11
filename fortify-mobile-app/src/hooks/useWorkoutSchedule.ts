import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadLocalWorkoutScheduleDays,
  saveLocalWorkoutScheduleDays,
} from '@/src/services/workoutSchedulePreference';
import {
  normalizeWorkoutScheduleDays,
  resolveWorkoutScheduleDays,
} from '@/src/utils/workoutSchedule';

export function useWorkoutSchedule() {
  const { profile, updateProfile } = useAuth();
  const [localDays, setLocalDays] = useState<number[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    loadLocalWorkoutScheduleDays()
      .then((days) => {
        if (!isActive) return;
        setLocalDays(days);
        setIsLoaded(true);
      })
      .catch(() => {
        if (!isActive) return;
        setLocalDays(null);
        setIsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const scheduleDays = useMemo(
    () => resolveWorkoutScheduleDays(
      profile?.workout_schedule_days,
      localDays,
      undefined,
      profile?.workouts_per_week
    ),
    [localDays, profile?.workout_schedule_days, profile?.workouts_per_week]
  );

  const saveScheduleDays = useCallback(async (days: number[]) => {
    const normalized = normalizeWorkoutScheduleDays(days);
    setIsSaving(true);
    try {
      await saveLocalWorkoutScheduleDays(normalized);
      setLocalDays(normalized);

      if (profile) {
        const { error } = await updateProfile({ workout_schedule_days: normalized });
        if (error) {
          return { error };
        }
      }

      return { error: null };
    } finally {
      setIsSaving(false);
    }
  }, [profile, updateProfile]);

  return {
    scheduleDays,
    isLoaded,
    isSaving,
    saveScheduleDays,
  };
}
