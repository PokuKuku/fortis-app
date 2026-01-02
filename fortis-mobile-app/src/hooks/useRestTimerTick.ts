import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useWorkoutStore } from '@/src/store/workoutStore';
import * as Haptics from 'expo-haptics';

/**
 * Hook to manage rest timer countdown
 * Ticks every second when timer is active
 * Triggers haptics at countdown milestones
 */
export function useRestTimerTick() {
  const tickRestTimer = useWorkoutStore(s => s.tickRestTimer);
  const restTimer = useWorkoutStore(s => s.restTimer);
  const appState = useRef(AppState.currentState);

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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      tickRestTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.remainingSeconds, restTimer.endTimestamp, tickRestTimer]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current.match(/inactive|background/);
      appState.current = nextState;
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
