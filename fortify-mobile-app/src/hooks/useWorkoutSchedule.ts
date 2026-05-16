import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadLocalWorkoutScheduleHistory,
  loadLocalWorkoutScheduleDays,
  recordWorkoutScheduleChange,
  saveLocalWorkoutScheduleDays,
} from '@/src/services/workoutSchedulePreference';
import { loadWorkoutRetentionPreferences } from '@/src/services/workoutRetentionPreferences';
import { syncRetentionNotifications } from '@/src/services/workoutRetentionNotifications';
import {
  normalizeWorkoutScheduleDays,
  normalizeWorkoutScheduleHistory,
  resolveWorkoutScheduleDays,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';

export function useWorkoutSchedule() {
  const { profile, updateProfile } = useAuth();
  const [localDays, setLocalDays] = useState<number[] | null>(null);
  const [scheduleHistory, setScheduleHistory] = useState<WorkoutScheduleHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      loadLocalWorkoutScheduleDays(),
      loadLocalWorkoutScheduleHistory(),
    ])
      .then(([days, history]) => {
        if (!isActive) return;
        setLocalDays(days);
        setScheduleHistory(normalizeWorkoutScheduleHistory(history));
        setIsLoaded(true);
      })
      .catch(() => {
        if (!isActive) return;
        setLocalDays(null);
        setScheduleHistory([]);
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
    const previousScheduleDays = scheduleDays;
    setIsSaving(true);
    try {
      await saveLocalWorkoutScheduleDays(normalized);
      const nextHistory = await recordWorkoutScheduleChange({
        previousDays: previousScheduleDays,
        nextDays: normalized,
      });
      setLocalDays(normalized);
      setScheduleHistory(nextHistory);

      if (profile) {
        const { error } = await updateProfile({ workout_schedule_days: normalized });
        if (error) {
          return { error };
        }
      }

      void loadWorkoutRetentionPreferences()
        .then((preferences) => syncRetentionNotifications({
          scheduleDays: normalized,
          reminderEnabled: preferences.reminderEnabled,
          reminderTime: preferences.reminderTime,
        }))
        .catch(() => undefined);

      return { error: null };
    } finally {
      setIsSaving(false);
    }
  }, [profile, scheduleDays, updateProfile]);

  return {
    scheduleDays,
    scheduleHistory,
    isLoaded,
    isSaving,
    saveScheduleDays,
  };
}
