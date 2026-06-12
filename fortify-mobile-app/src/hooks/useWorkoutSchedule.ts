import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadLocalWorkoutScheduleHistory,
  loadLocalWorkoutScheduleDays,
  recordWorkoutScheduleChange,
  saveLocalWorkoutScheduleDays,
} from '@/src/services/workoutSchedulePreference';
import { loadWorkoutRetentionPreferences } from '@/src/services/workoutRetentionPreferences';
import { syncRetentionNotifications } from '@/src/services/workoutRetentionNotifications';
import type { WorkoutSession } from '@/src/types/workout';
import {
  buildWorkoutScheduleHistoryForChange,
  clampWorkoutScheduleHistoryToActivationDate,
  getScheduledWorkoutDayStreak,
  normalizeWorkoutScheduleDays,
  normalizeWorkoutScheduleHistory,
  resolveWorkoutScheduleDays,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';

export function useWorkoutSchedule() {
  const { profile, updateProfile, user } = useAuth();
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

  const cloudScheduleHistory = useMemo(
    () => normalizeWorkoutScheduleHistory(profile?.workout_schedule_history),
    [profile?.workout_schedule_history]
  );
  const sourceScheduleHistory = cloudScheduleHistory.length > 0
    ? cloudScheduleHistory
    : scheduleHistory;
  const accountCreatedAt = profile?.created_at ?? user?.created_at;
  const activeScheduleHistory = useMemo(
    () => clampWorkoutScheduleHistoryToActivationDate(
      sourceScheduleHistory,
      accountCreatedAt ? new Date(accountCreatedAt) : null,
      scheduleDays
    ),
    [accountCreatedAt, scheduleDays, sourceScheduleHistory]
  );

  const saveScheduleDays = useCallback(async (
    days: number[],
    options: { sessions?: WorkoutSession[]; today?: Date } = {}
  ) => {
    const normalized = normalizeWorkoutScheduleDays(days);
    const previousScheduleDays = scheduleDays;
    const editDate = options.today ?? new Date();
    const effectiveDate = addDays(editDate, 1);
    const sourceHistory = activeScheduleHistory;
    setIsSaving(true);
    try {
      await saveLocalWorkoutScheduleDays(normalized);
      let nextHistory = await recordWorkoutScheduleChange({
        previousDays: previousScheduleDays,
        nextDays: normalized,
        currentHistory: sourceHistory,
        effectiveDate,
      });

      if (options.sessions?.length) {
        const previousStreak = getScheduledWorkoutDayStreak({
          scheduleDays: previousScheduleDays,
          scheduleHistory: sourceHistory,
          sessions: options.sessions,
          today: editDate,
        });
        const nextStreak = getScheduledWorkoutDayStreak({
          scheduleDays: normalized,
          scheduleHistory: nextHistory,
          sessions: options.sessions,
          today: editDate,
        });

        if (nextStreak < previousStreak) {
          nextHistory = await recordWorkoutScheduleChange({
            previousDays: previousScheduleDays,
            nextDays: normalized,
            currentHistory: buildWorkoutScheduleHistoryForChange({
              previousDays: previousScheduleDays,
              nextDays: normalized,
              currentHistory: [],
              effectiveDate,
            }),
            effectiveDate,
          });
        }
      }

      setLocalDays(normalized);
      setScheduleHistory(nextHistory);

      if (profile) {
        const { error } = await updateProfile({
          workout_schedule_days: normalized,
          workout_schedule_history: nextHistory,
        });
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
  }, [activeScheduleHistory, profile, scheduleDays, updateProfile]);

  return {
    scheduleDays,
    scheduleHistory: activeScheduleHistory,
    isLoaded,
    isSaving,
    saveScheduleDays,
  };
}
