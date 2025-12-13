import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

/**
 * Hook to track elapsed time since workout started
 * Updates every second
 * Returns elapsed time in seconds
 */
export function useElapsedTime() {
  const workoutStartTime = useWorkoutStore(s => s.workoutStartTime);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!workoutStartTime) {
      setElapsed(0);
      return;
    }

    // Calculate initial elapsed time
    setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));

    // Update every second
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

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

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
