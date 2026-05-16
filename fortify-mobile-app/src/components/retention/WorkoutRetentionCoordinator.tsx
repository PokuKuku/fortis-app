import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { parseISO } from 'date-fns';
import type { Exercise } from '@/src/types/exercise';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { useWorkoutRetentionPreferences } from '@/src/hooks/useWorkoutRetentionPreferences';
import { useWorkoutSchedule } from '@/src/hooks/useWorkoutSchedule';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { syncRetentionNotifications } from '@/src/services/workoutRetentionNotifications';
import {
  getLastAcknowledgedWeeklyRecapKey,
  getLastShownWeeklyRecapKey,
  setLastAcknowledgedWeeklyRecapKey,
  setLastShownWeeklyRecapKey,
} from '@/src/services/workoutRetentionPreferences';
import {
  buildWeeklyRecap,
  getDueWeeklyRecapWeekStart,
  SCHEDULED_WORKOUT_REMINDER_KIND,
  WEEKLY_RECAP_KIND,
  type WeeklyRecap,
} from '@/src/utils/workoutRetention';
import { WeeklyRecapModal } from '@/src/components/retention/WeeklyRecapModal';

export function WorkoutRetentionCoordinator() {
  const { user, profile } = useAuth();
  const { scheduleDays, scheduleHistory } = useWorkoutSchedule();
  const { sessions } = useWorkoutHistorySource({ enabled: Boolean(user) });
  const { exercisesById } = useExerciseLookup();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const preferences = useWorkoutRetentionPreferences();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [weeklyRecap, setWeeklyRecap] = useState<WeeklyRecap | null>(null);

  const sessionsKey = useMemo(
    () => sessions.map((session) => `${session.localId}:${session.completedAt?.getTime() ?? 0}`).join('|'),
    [sessions]
  );
  const scheduleKey = scheduleDays.join(',');
  const scheduleHistoryKey = scheduleHistory
    .map((entry) => `${entry.effectiveDateKey}:${entry.scheduleDays.join(',')}`)
    .join('|');

  const syncNotifications = useCallback(() => {
    if (!preferences.isLoaded) return;
    void syncRetentionNotifications({
      scheduleDays,
      reminderEnabled: preferences.reminderEnabled,
      reminderTime: preferences.reminderTime,
    });
  }, [
    preferences.isLoaded,
    preferences.reminderEnabled,
    preferences.reminderTime,
    scheduleKey,
    scheduleDays,
  ]);

  const buildRecapForWeek = useCallback((weekStart: Date) => buildWeeklyRecap({
    weekStart,
    scheduleDays,
    scheduleHistory,
    sessions,
    exercisesById: exercisesById as unknown as Map<string, Exercise>,
    preferredUnits: profile?.preferred_units === 'metric' ? 'metric' : 'imperial',
    weightUnits,
  }), [exercisesById, profile?.preferred_units, scheduleDays, scheduleHistory, sessions, weightUnits]);

  const maybeShowWeeklyRecap = useCallback(async (forceWeekStart?: Date | null) => {
    if (!user) return;
    const dueWeekStart = forceWeekStart ?? getDueWeeklyRecapWeekStart();
    if (!dueWeekStart) return;
    const recap = buildRecapForWeek(dueWeekStart);
    const lastShown = await getLastShownWeeklyRecapKey();
    const lastAcknowledged = await getLastAcknowledgedWeeklyRecapKey();
    if (!forceWeekStart && (lastShown === recap.weekKey || lastAcknowledged === recap.weekKey)) return;
    await setLastShownWeeklyRecapKey(recap.weekKey);
    setWeeklyRecap(recap);
  }, [buildRecapForWeek, user]);

  useEffect(() => {
    syncNotifications();
  }, [syncNotifications]);

  useEffect(() => {
    void maybeShowWeeklyRecap();
  }, [maybeShowWeeklyRecap, sessionsKey, scheduleKey, scheduleHistoryKey]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;
      if ((previous === 'background' || previous === 'inactive') && nextState === 'active') {
        syncNotifications();
        void maybeShowWeeklyRecap();
      }
    });
    return () => subscription.remove();
  }, [maybeShowWeeklyRecap, syncNotifications]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        kind?: string;
        dateKey?: string;
      };
      if (!data?.kind) return;

      router.replace('/(tabs)');
      if (data.kind === WEEKLY_RECAP_KIND) {
        const weekStart = data.dateKey ? parseISO(`${data.dateKey}T00:00:00`) : getDueWeeklyRecapWeekStart();
        void maybeShowWeeklyRecap(weekStart);
        return;
      }
      if (data.kind === SCHEDULED_WORKOUT_REMINDER_KIND) {
        return;
      }
    });
    return () => subscription.remove();
  }, [maybeShowWeeklyRecap]);

  const handleCloseWeeklyRecap = async () => {
    if (weeklyRecap) {
      await setLastAcknowledgedWeeklyRecapKey(weeklyRecap.weekKey);
    }
    setWeeklyRecap(null);
  };

  return (
    <>
      <WeeklyRecapModal
        visible={Boolean(weeklyRecap)}
        recap={weeklyRecap}
        userName={profile?.full_name}
        onClose={() => void handleCloseWeeklyRecap()}
      />
    </>
  );
}
