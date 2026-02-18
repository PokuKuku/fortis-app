import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { WORKOUT_REMINDER_NOTIFICATION_IDS_KEY } from '@/src/constants/storageKeys';

const WORKOUT_REMINDER_CHANNEL_ID = 'workout-reminder';
const WORKOUT_REMINDER_KIND = 'workout-reminder';
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

const loadPersistedReminderIds = async (): Promise<string[]> => {
  try {
    const raw = await getScopedItem(WORKOUT_REMINDER_NOTIFICATION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
};

const persistReminderIds = async (ids: string[]): Promise<void> => {
  try {
    if (ids.length === 0) {
      await removeScopedItem(WORKOUT_REMINDER_NOTIFICATION_IDS_KEY);
      return;
    }
    await setScopedItem(WORKOUT_REMINDER_NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Best effort only.
  }
};

const getScheduledWorkoutReminderIds = async (): Promise<string[]> => {
  if (typeof Notifications.getAllScheduledNotificationsAsync !== 'function') {
    return [];
  }

  try {
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    return requests
      .filter((request) => {
        const data = request.content?.data as { kind?: string } | undefined;
        if (data?.kind === WORKOUT_REMINDER_KIND) {
          return true;
        }

        const trigger = request.trigger as { channelId?: string } | null;
        if (trigger?.channelId === WORKOUT_REMINDER_CHANNEL_ID) {
          return true;
        }

        // Backward-compatible cleanup for reminders scheduled before `kind` tagging.
        return request.content?.title === 'Need to finish your workout?';
      })
      .map((request) => request.identifier);
  } catch {
    return [];
  }
};

const scheduleReminderNotifications = async (sessionStartMs: number): Promise<string[]> => {
  let permissions: { status: string; granted: boolean } | null = null;
  try {
    permissions = await Notifications.getPermissionsAsync();
  } catch {
    return [];
  }
  if (!permissions.granted && permissions.status !== 'granted') return [];

  try {
    await ensureWorkoutReminderChannel();
  } catch {
    return [];
  }

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
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Need to finish your workout?',
          body: 'Fortis is still tracking your session. Resume or wrap it up when you’re ready.',
          sound: 'default',
          data: { kind: WORKOUT_REMINDER_KIND },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(timestamp),
          channelId: WORKOUT_REMINDER_CHANNEL_ID,
        },
      });
      ids.push(id);
    } catch {
      // Best effort: keep scheduling subsequent reminders.
    }
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
      try {
        const persistedIds = await loadPersistedReminderIds();
        const previouslyScheduledIds = await getScheduledWorkoutReminderIds();
        const idsToCancel = Array.from(new Set([...reminderIdsRef.current, ...persistedIds, ...previouslyScheduledIds]));
        await cancelReminderNotifications(idsToCancel);
        await persistReminderIds([]);
        reminderIdsRef.current = [];

        if (!isWorkoutActive || !sessionStartMs || !isBackgrounded) return;
        const ids = await scheduleReminderNotifications(sessionStartMs);
        if (isCancelled) {
          await cancelReminderNotifications(ids);
          return;
        }
        reminderIdsRef.current = ids;
        await persistReminderIds(ids);
      } catch {
        // Never throw from sync; stale reminders are cleaned on next successful pass.
      }
    };

    void sync();

    return () => {
      isCancelled = true;
    };
  }, [isBackgrounded, isWorkoutActive, sessionStartMs]);

  useEffect(() => {
    return () => {
      void (async () => {
        const persistedIds = await loadPersistedReminderIds();
        const idsToCancel = Array.from(new Set([...reminderIdsRef.current, ...persistedIds]));
        await cancelReminderNotifications(idsToCancel);
        await persistReminderIds([]);
      })();
    };
  }, []);
}
