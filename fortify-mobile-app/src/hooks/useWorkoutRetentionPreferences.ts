import { useCallback, useEffect, useState } from 'react';
import {
  loadWorkoutRetentionPreferences,
  saveWorkoutReminderEnabled,
  saveWorkoutReminderTime,
  type WorkoutRetentionPreferences,
} from '@/src/services/workoutRetentionPreferences';
import {
  DEFAULT_WORKOUT_REMINDER_TIME,
  normalizeReminderTime,
  type ReminderTime,
} from '@/src/utils/workoutRetention';

const DEFAULT_PREFERENCES: WorkoutRetentionPreferences = {
  reminderEnabled: true,
  reminderTime: DEFAULT_WORKOUT_REMINDER_TIME,
};

export function useWorkoutRetentionPreferences() {
  const [preferences, setPreferences] = useState<WorkoutRetentionPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadWorkoutRetentionPreferences()
      .then((loaded) => {
        if (!mounted) return;
        setPreferences(loaded);
      })
      .finally(() => {
        if (mounted) setIsLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setReminderEnabled = useCallback(async (enabled: boolean) => {
    setPreferences((current) => ({ ...current, reminderEnabled: enabled }));
    await saveWorkoutReminderEnabled(enabled);
  }, []);

  const setReminderTime = useCallback(async (time: ReminderTime) => {
    const normalized = normalizeReminderTime(time);
    setPreferences((current) => ({ ...current, reminderTime: normalized }));
    await saveWorkoutReminderTime(normalized);
  }, []);

  return {
    ...preferences,
    isLoaded,
    setReminderEnabled,
    setReminderTime,
  };
}
