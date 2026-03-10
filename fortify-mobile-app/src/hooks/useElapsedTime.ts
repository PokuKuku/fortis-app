import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';

/**
 * Hook to track elapsed time since workout started
 * Updates every second, handles pause state
 * Returns elapsed time in seconds
 */
export function useElapsedTime() {
  const workoutStartTime = useWorkoutStore(s => s.workoutStartTime);
  const isWorkoutTimerPaused = useWorkoutStore(s => s.isWorkoutTimerPaused);
  const pausedElapsedSeconds = useWorkoutStore(s => s.pausedElapsedSeconds);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // If paused, show the paused elapsed time
    if (isWorkoutTimerPaused) {
      setElapsed(pausedElapsedSeconds);
      return;
    }

    if (!workoutStartTime) {
      setElapsed(pausedElapsedSeconds || 0);
      return;
    }

    // Calculate initial elapsed time (current running time + any previously paused time)
    const calculateElapsed = () =>
      Math.floor((Date.now() - workoutStartTime) / 1000) + pausedElapsedSeconds;

    setElapsed(calculateElapsed());

    // Update every second
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime, isWorkoutTimerPaused, pausedElapsedSeconds]);

  return elapsed;
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
