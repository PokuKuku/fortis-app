import {
  LAST_ACKNOWLEDGED_WEEKLY_RECAP_KEY,
  LAST_SHOWN_WEEKLY_RECAP_KEY,
  RETENTION_NOTIFICATION_IDS_KEY,
  SCHEDULED_WORKOUT_REMINDER_ENABLED_KEY,
  SCHEDULED_WORKOUT_REMINDER_TIME_KEY,
} from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  DEFAULT_WORKOUT_REMINDER_TIME,
  normalizeReminderTime,
  type ReminderTime,
} from '@/src/utils/workoutRetention';

export type WorkoutRetentionPreferences = {
  reminderEnabled: boolean;
  reminderTime: ReminderTime;
};

export async function loadWorkoutRetentionPreferences(): Promise<WorkoutRetentionPreferences> {
  const [enabledRaw, timeRaw] = await Promise.all([
    getScopedItem(SCHEDULED_WORKOUT_REMINDER_ENABLED_KEY),
    getScopedItem(SCHEDULED_WORKOUT_REMINDER_TIME_KEY),
  ]);

  let parsedTime: unknown = null;
  try {
    parsedTime = timeRaw ? JSON.parse(timeRaw) : null;
  } catch {
    parsedTime = null;
  }

  return {
    reminderEnabled: enabledRaw !== 'false',
    reminderTime: normalizeReminderTime(parsedTime ?? DEFAULT_WORKOUT_REMINDER_TIME),
  };
}

export async function saveWorkoutReminderEnabled(enabled: boolean): Promise<void> {
  await setScopedItem(SCHEDULED_WORKOUT_REMINDER_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function saveWorkoutReminderTime(time: ReminderTime): Promise<void> {
  await setScopedItem(SCHEDULED_WORKOUT_REMINDER_TIME_KEY, JSON.stringify(normalizeReminderTime(time)));
}

export async function loadRetentionNotificationIds(): Promise<string[]> {
  try {
    const raw = await getScopedItem(RETENTION_NOTIFICATION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];
  } catch {
    return [];
  }
}

export async function saveRetentionNotificationIds(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    await removeScopedItem(RETENTION_NOTIFICATION_IDS_KEY);
    return;
  }
  await setScopedItem(RETENTION_NOTIFICATION_IDS_KEY, JSON.stringify(ids));
}

export async function getLastShownWeeklyRecapKey(): Promise<string | null> {
  return getScopedItem(LAST_SHOWN_WEEKLY_RECAP_KEY);
}

export async function setLastShownWeeklyRecapKey(weekKey: string): Promise<void> {
  await setScopedItem(LAST_SHOWN_WEEKLY_RECAP_KEY, weekKey);
}

export async function getLastAcknowledgedWeeklyRecapKey(): Promise<string | null> {
  return getScopedItem(LAST_ACKNOWLEDGED_WEEKLY_RECAP_KEY);
}

export async function setLastAcknowledgedWeeklyRecapKey(weekKey: string): Promise<void> {
  await setScopedItem(LAST_ACKNOWLEDGED_WEEKLY_RECAP_KEY, weekKey);
}
