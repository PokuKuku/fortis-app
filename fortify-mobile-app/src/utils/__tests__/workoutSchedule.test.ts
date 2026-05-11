import type { WorkoutSession } from '@/src/types/workout';
import {
  buildSundayWeek,
  buildWeekProgressDays,
  deriveScheduleDaysFromWorkoutsPerWeek,
  getScheduledWorkoutDayStreak,
  normalizeWorkoutScheduleDays,
} from '@/src/utils/workoutSchedule';

function session(localId: string, completedAt: string, name = 'Workout'): WorkoutSession {
  return {
    localId,
    name,
    notes: '',
    startedAt: new Date(completedAt),
    completedAt: new Date(completedAt),
    exercises: [],
    isSynced: true,
  };
}

describe('workoutSchedule', () => {
  it('normalizes weekdays by rejecting invalid values, deduping, and sorting', () => {
    expect(normalizeWorkoutScheduleDays([5, 1, 9, 1, -1, '3', 2.5, null])).toEqual([1, 3, 5]);
  });

  it('builds Sunday-first week ranges', () => {
    const days = buildSundayWeek(new Date('2026-05-13T12:00:00'));

    expect(days.map((day) => day.getDay())).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(days[0].toISOString().slice(0, 10)).toBe('2026-05-10');
    expect(days[6].toISOString().slice(0, 10)).toBe('2026-05-16');
  });

  it('derives fallback days from workouts per week', () => {
    expect(deriveScheduleDaysFromWorkoutsPerWeek(null)).toEqual([1, 3, 5]);
    expect(deriveScheduleDaysFromWorkoutsPerWeek(2)).toEqual([1, 4]);
    expect(deriveScheduleDaysFromWorkoutsPerWeek(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('maps completed sessions to local calendar dates', () => {
    const days = buildWeekProgressDays({
      anchorDate: new Date('2026-05-11T12:00:00'),
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T20:00:00', 'Upper'),
        session('wednesday', '2026-05-13T06:30:00', 'Lower'),
      ],
      today: new Date('2026-05-11T12:00:00'),
    });

    expect(days[1].completedSessions.map((item) => item.name)).toEqual(['Upper']);
    expect(days[3].completedSessions.map((item) => item.name)).toEqual(['Lower']);
    expect(days[5].isScheduled).toBe(true);
    expect(days[5].completedSessions).toEqual([]);
  });

  it('counts only completed scheduled workout days in streaks and skips off days', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T12:00:00'),
        session('wednesday', '2026-05-13T12:00:00'),
        session('friday', '2026-05-15T12:00:00'),
      ],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(streak).toBe(3);
  });

  it('breaks streaks on the first missed scheduled workout day', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T12:00:00'),
        session('friday', '2026-05-15T12:00:00'),
      ],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(streak).toBe(1);
  });
});
