import { useMemo } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { startOfDay, subDays, format, isAfter, isBefore, isEqual } from 'date-fns';

export interface DailyActivity {
  day: string;           // "Mon", "Tue", etc.
  date: Date;
  volume: number;        // Total volume for that day
  workouts: number;      // Number of workouts that day
}

/**
 * Hook to calculate workout activity for the last 7 days.
 * Returns an array of 7 days with volume and workout count per day.
 */
export function useWeeklyActivity(): DailyActivity[] {
  const completedSessions = useWorkoutStore((state) => state.completedSessions);

  return useMemo(() => {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 6); // Include today, so 6 days back

    // Initialize 7 days of activity
    const weeklyData: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      weeklyData.push({
        day: format(date, 'EEE'), // "Mon", "Tue", etc.
        date: startOfDay(date),
        volume: 0,
        workouts: 0,
      });
    }

    // Process completed sessions within the last 7 days
    for (const session of completedSessions) {
      const sessionDate = startOfDay(
        new Date(session.completedAt || session.startedAt)
      );

      // Check if session is within our 7-day window
      if (
        (isAfter(sessionDate, sevenDaysAgo) || isEqual(sessionDate, sevenDaysAgo)) &&
        (isBefore(sessionDate, today) || isEqual(sessionDate, today))
      ) {
        // Find the matching day in our weekly data
        const dayIndex = weeklyData.findIndex(
          (d) => isEqual(startOfDay(d.date), sessionDate)
        );

        if (dayIndex !== -1) {
          weeklyData[dayIndex].workouts += 1;

          // Calculate session volume
          for (const exercise of session.exercises) {
            for (const set of exercise.sets) {
              if (set.isCompleted && set.setType !== 'warmup') {
                const weight = set.weight || 0;
                const reps = set.reps || 0;
                weeklyData[dayIndex].volume += weight * reps;
              }
            }
          }
        }
      }
    }

    // Round volumes
    weeklyData.forEach((d) => {
      d.volume = Math.round(d.volume);
    });

    return weeklyData;
  }, [completedSessions]);
}
