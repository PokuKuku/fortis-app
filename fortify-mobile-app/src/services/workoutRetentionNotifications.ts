import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays } from 'date-fns';
import {
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

const ensureRetentionChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(RETENTION_CHANNEL_ID, {
    name: 'Workout schedule',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
};

export async function cancelRetentionNotifications(): Promise<void> {
  const ids = await loadRetentionNotificationIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await saveRetentionNotificationIds([]);
}

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
      body: 'You’ve got a workout scheduled today. Let’s keep the streak alive!',
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

export async function syncRetentionNotifications({
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
