import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays } from 'date-fns';
import {
  getScheduledWorkoutReminderBody,
  getScheduledReminderDates,
  getWeeklyRecapNotificationDates,
  SCHEDULED_WORKOUT_REMINDER_KIND,
  WEEKLY_RECAP_KIND,
  type ReminderTime,
  type RetentionNotificationKind,
} from '@/src/utils/workoutRetention';
import { getDateKey } from '@/src/utils/workoutSchedule';
import {
  loadRetentionNotificationIds,
  saveRetentionNotificationIds,
} from '@/src/services/workoutRetentionPreferences';

const RETENTION_CHANNEL_ID = 'workout-retention';
const RETENTION_NOTIFICATION_TITLES = new Set([
  'Training day is here!',
  'Your week is wrapped!',
]);
let retentionNotificationSyncQueue: Promise<void> = Promise.resolve();

const ensureRetentionChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(RETENTION_CHANNEL_ID, {
    name: 'Workout schedule',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
};

export async function cancelRetentionNotifications(): Promise<void> {
  const [persistedIds, scheduledIds] = await Promise.all([
    loadRetentionNotificationIds(),
    getScheduledRetentionNotificationIds(),
  ]);
  const ids = Array.from(new Set([...persistedIds, ...scheduledIds]));
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await saveRetentionNotificationIds([]);
}

const getScheduledRetentionNotificationIds = async (): Promise<string[]> => {
  if (typeof Notifications.getAllScheduledNotificationsAsync !== 'function') {
    return [];
  }

  try {
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    return requests
      .filter((request) => {
        const data = request.content?.data as { kind?: string } | undefined;
        if (data?.kind === SCHEDULED_WORKOUT_REMINDER_KIND || data?.kind === WEEKLY_RECAP_KIND) {
          return true;
        }

        const trigger = request.trigger as { channelId?: string } | null;
        if (trigger?.channelId === RETENTION_CHANNEL_ID) {
          return true;
        }

        return RETENTION_NOTIFICATION_TITLES.has(request.content?.title ?? '');
      })
      .map((request) => request.identifier);
  } catch {
    return [];
  }
};

async function scheduleRetentionNotification({
  kind,
  date,
}: {
  kind: RetentionNotificationKind;
  date: Date;
}): Promise<string | null> {
  const contentByKind = {
    [SCHEDULED_WORKOUT_REMINDER_KIND]: {
      title: 'Training day is here!',
      body: getScheduledWorkoutReminderBody(date),
    },
    [WEEKLY_RECAP_KIND]: {
      title: 'Your week is wrapped!',
      body: 'See what you hit, what you missed, and where you leveled up!',
    },
  } as const;

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        ...contentByKind[kind],
        sound: 'default',
        data: {
          kind,
          dateKey: getDateKey(kind === WEEKLY_RECAP_KIND ? addDays(date, -7) : date),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: RETENTION_CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

async function performRetentionNotificationSync({
  scheduleDays,
  reminderEnabled,
  reminderTime,
}: {
  scheduleDays: number[];
  reminderEnabled: boolean;
  reminderTime: ReminderTime;
}): Promise<void> {
  await cancelRetentionNotifications();

  if (!reminderEnabled || scheduleDays.length === 0) return;

  let permissions: { status: string; granted: boolean } | null = null;
  try {
    permissions = await Notifications.getPermissionsAsync();
  } catch {
    return;
  }
  if (!permissions.granted && permissions.status !== 'granted') return;

  try {
    await ensureRetentionChannel();
  } catch {
    return;
  }

  const now = new Date();
  const scheduledReminderDates = getScheduledReminderDates({
    scheduleDays,
    time: reminderTime,
    from: now,
  });
  const weeklyRecapDates = getWeeklyRecapNotificationDates({ from: now });

  const ids: string[] = [];
  for (const date of scheduledReminderDates) {
    const id = await scheduleRetentionNotification({ kind: SCHEDULED_WORKOUT_REMINDER_KIND, date });
    if (id) ids.push(id);
  }
  for (const date of weeklyRecapDates) {
    const id = await scheduleRetentionNotification({ kind: WEEKLY_RECAP_KIND, date });
    if (id) ids.push(id);
  }

  await saveRetentionNotificationIds(ids);
}

export function syncRetentionNotifications({
  scheduleDays,
  reminderEnabled,
  reminderTime,
}: {
  scheduleDays: number[];
  reminderEnabled: boolean;
  reminderTime: ReminderTime;
}): Promise<void> {
  retentionNotificationSyncQueue = retentionNotificationSyncQueue
    .catch(() => undefined)
    .then(() => performRetentionNotificationSync({
      scheduleDays,
      reminderEnabled,
      reminderTime,
    }));

  return retentionNotificationSyncQueue;
}
