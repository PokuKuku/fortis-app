import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useWorkoutStore } from '@/src/store/workoutStore';

const WORKOUT_REMINDER_CHANNEL_ID = 'workout-reminder';
const REMINDER_START_MINUTES = 60;
const REMINDER_REPEAT_MINUTES = 20;
const REMINDER_MAX_HOURS = 12;

const ensureWorkoutReminderChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(WORKOUT_REMINDER_CHANNEL_ID, {
    name: 'Workout reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
};

const cancelReminderNotifications = async (ids: string[]) => {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
};

const scheduleReminderNotifications = async (sessionStartMs: number): Promise<string[]> => {
  const { status, granted } = await Notifications.getPermissionsAsync();
  if (!granted && status !== 'granted') return [];

  await ensureWorkoutReminderChannel();

  const now = Date.now();
  const startMs = sessionStartMs + REMINDER_START_MINUTES * 60 * 1000;
  const intervalMs = REMINDER_REPEAT_MINUTES * 60 * 1000;
  const endLimitMs = sessionStartMs + REMINDER_MAX_HOURS * 60 * 60 * 1000;

  let firstMs = startMs;
  if (now >= startMs) {
    const elapsed = now - startMs;
    const intervalsPassed = Math.floor(elapsed / intervalMs);
    firstMs = startMs + (intervalsPassed + 1) * intervalMs;
  }

  if (firstMs > endLimitMs) return [];

  const ids: string[] = [];
  for (let timestamp = firstMs; timestamp <= endLimitMs; timestamp += intervalMs) {
    // Stop if we try to schedule in the past due to clock shifts.
    if (timestamp <= Date.now()) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Need to finish your workout?',
        body: 'Fortis is still tracking your session. Resume or wrap it up when you’re ready.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(timestamp),
        channelId: WORKOUT_REMINDER_CHANNEL_ID,
      },
    });
    ids.push(id);
  }

  return ids;
};

export function useWorkoutReminderNotifications() {
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const isWorkoutActive = useWorkoutStore((s) => s.isWorkoutActive);
  const sessionStartMs = activeSession?.startedAt?.getTime() ?? null;
  const appState = useRef(AppState.currentState);
  const [isBackgrounded, setIsBackgrounded] = useState(
    AppState.currentState.match(/inactive|background/) !== null
  );
  const reminderIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
      setIsBackgrounded(nextState.match(/inactive|background/) !== null);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const sync = async () => {
      await cancelReminderNotifications(reminderIdsRef.current);
      reminderIdsRef.current = [];

      if (!isWorkoutActive || !sessionStartMs || !isBackgrounded) return;
      const ids = await scheduleReminderNotifications(sessionStartMs);
      if (!isCancelled) {
        reminderIdsRef.current = ids;
      }
    };

    void sync();

    return () => {
      isCancelled = true;
    };
  }, [isBackgrounded, isWorkoutActive, sessionStartMs]);

  useEffect(() => {
    return () => {
      void cancelReminderNotifications(reminderIdsRef.current);
    };
  }, []);
}
