import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useWorkoutStore } from '@/src/store/workoutStore';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

const REST_TIMER_CHANNEL_ID = 'rest-timer';

const ensureRestTimerChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REST_TIMER_CHANNEL_ID, {
    name: 'Rest timer',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
};

const scheduleRestTimerNotification = async (endTimestamp: number): Promise<string | null> => {
  const { status, granted } = await Notifications.getPermissionsAsync();
  if (!granted && status !== 'granted') return null;

  await ensureRestTimerChannel();

  if (endTimestamp <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest complete!',
      body: 'Back to it — crush the next set.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(endTimestamp),
      channelId: REST_TIMER_CHANNEL_ID,
    },
  });
};

const cancelRestTimerNotification = async (notificationId: string | null) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore notification cleanup failures.
  }
};

/**
 * Hook to manage rest timer countdown
 * Ticks every second when timer is active
 * Triggers haptics at countdown milestones
 */
export function useRestTimerTick() {
  const tickRestTimer = useWorkoutStore(s => s.tickRestTimer);
  const restTimer = useWorkoutStore(s => s.restTimer);
  const appState = useRef(AppState.currentState);
  const notificationIdRef = useRef<string | null>(null);
  const [isBackgrounded, setIsBackgrounded] = useState(
    AppState.currentState.match(/inactive|background/) !== null
  );

  useEffect(() => {
    if (!restTimer.isActive) return;
    if (!restTimer.endTimestamp && restTimer.remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      const newRemaining = restTimer.endTimestamp
        ? Math.max(0, Math.ceil((restTimer.endTimestamp - Date.now()) / 1000))
        : Math.max(0, restTimer.remainingSeconds - 1);

      // Haptic feedback at key moments
      if (newRemaining !== restTimer.remainingSeconds && (newRemaining === 3 || newRemaining === 2 || newRemaining === 1)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Success haptic when timer completes
      if (newRemaining === 0 && restTimer.remainingSeconds !== 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      tickRestTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.remainingSeconds, restTimer.endTimestamp, tickRestTimer]);

  useEffect(() => {
    let isCancelled = false;

    const syncNotification = async () => {
      if (!restTimer.isActive || !restTimer.endTimestamp || !isBackgrounded) {
        await cancelRestTimerNotification(notificationIdRef.current);
        notificationIdRef.current = null;
        return;
      }

      await cancelRestTimerNotification(notificationIdRef.current);
      const nextId = await scheduleRestTimerNotification(restTimer.endTimestamp);
      if (!isCancelled) {
        notificationIdRef.current = nextId;
      }
    };

    void syncNotification();

    return () => {
      isCancelled = true;
    };
  }, [restTimer.isActive, restTimer.endTimestamp, isBackgrounded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current.match(/inactive|background/);
      appState.current = nextState;
      setIsBackgrounded(nextState.match(/inactive|background/) !== null);
      if (wasInactive && nextState === 'active') {
        tickRestTimer();
      }
    });

    return () => subscription.remove();
  }, [tickRestTimer]);
}

/**
 * Format rest timer seconds to MM:SS
 */
export function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
