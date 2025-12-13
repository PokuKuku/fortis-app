import { useEffect } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import * as Haptics from 'expo-haptics';

/**
 * Hook to manage rest timer countdown
 * Ticks every second when timer is active
 * Triggers haptics at countdown milestones
 */
export function useRestTimerTick() {
  const tickRestTimer = useWorkoutStore(s => s.tickRestTimer);
  const restTimer = useWorkoutStore(s => s.restTimer);

  useEffect(() => {
    if (!restTimer.isActive || restTimer.remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      const newRemaining = restTimer.remainingSeconds - 1;

      // Haptic feedback at key moments
      if (newRemaining === 3 || newRemaining === 2 || newRemaining === 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Success haptic when timer completes
      if (newRemaining === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      tickRestTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.remainingSeconds, tickRestTimer]);
}

/**
 * Format rest timer seconds to MM:SS
 */
export function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
