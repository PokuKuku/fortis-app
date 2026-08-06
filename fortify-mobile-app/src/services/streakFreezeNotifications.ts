import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const STREAK_FREEZE_PASS_EARNED_KIND = 'streak-freeze-pass-earned';
export const STREAK_FREEZE_PASS_REDEEMED_KIND = 'streak-freeze-pass-redeemed';

const STREAK_FREEZE_CHANNEL_ID = 'streak-freeze';

export function configureStreakFreezeNotificationPresentation(): void {
  if (typeof Notifications.setNotificationHandler !== 'function') return;

  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as { kind?: string } | undefined;
      const shouldPresent = data?.kind === STREAK_FREEZE_PASS_EARNED_KIND
        || data?.kind === STREAK_FREEZE_PASS_REDEEMED_KIND;
      return {
        shouldShowBanner: shouldPresent,
        shouldShowList: shouldPresent,
        shouldPlaySound: shouldPresent,
        shouldSetBadge: false,
      };
    },
  });
}

async function ensureStreakFreezeChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(STREAK_FREEZE_CHANNEL_ID, {
    name: 'Streak freezes',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function sendStreakFreezeNotification({
  title,
  body,
  kind,
  dateKey,
}: {
  title: string;
  body: string;
  kind: string;
  dateKey: string;
}): Promise<string | null> {
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.status !== 'granted') return null;

    await ensureStreakFreezeChannel();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { kind, dateKey },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 1000),
        channelId: STREAK_FREEZE_CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

export function notifyStreakFreezePassEarned(milestoneDateKey: string): Promise<string | null> {
  return sendStreakFreezeNotification({
    title: '❄️ Streak Freeze Pass Earned!',
    body: 'Five scheduled workouts in a row! Your next missed workout is covered.',
    kind: STREAK_FREEZE_PASS_EARNED_KIND,
    dateKey: milestoneDateKey,
  });
}

export function notifyStreakFreezePassRedeemed(missedDateKey: string): Promise<string | null> {
  return sendStreakFreezeNotification({
    title: '❄️ Streak Freeze Activated',
    body: 'You missed your scheduled workout, but your Streak Freeze saved your progress!',
    kind: STREAK_FREEZE_PASS_REDEEMED_KIND,
    dateKey: missedDateKey,
  });
}
