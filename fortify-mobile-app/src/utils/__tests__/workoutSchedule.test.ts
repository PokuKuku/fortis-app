import type { WorkoutSession } from '@/src/types/workout';
import {
  buildInitialWorkoutScheduleHistory,
  buildWorkoutScheduleHistoryForChange,
  buildSundayWeek,
  buildWeekProgressDays,
  clampWorkoutScheduleHistoryToActivationDate,
  deriveScheduleDaysFromWorkoutsPerWeek,
  getCompletedWeekdaysForProgram,
  getScheduleDaysForDate,
  getScheduledWorkoutDayStreak,
  getWorkoutDayStreak,
  normalizeWorkoutScheduleDays,
  resolveWorkoutScheduleDays,
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

function dailySessions(startDateKey: string, count: number): WorkoutSession[] {
  const start = new Date(`${startDateKey}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const completedAt = new Date(start);
    completedAt.setDate(start.getDate() + index);
    const key = completedAt.toISOString().slice(0, 10);
    return session(`workout-${key}`, `${key}T12:00:00`);
  });
}

function programSession(
  localId: string,
  completedAt: string | null,
  programId?: string
): WorkoutSession {
  const startedAt = completedAt
    ? new Date(completedAt)
    : new Date('2026-05-11T12:00:00');

  return {
    localId,
    name: 'Program Workout',
    notes: '',
    startedAt,
    completedAt: completedAt ? new Date(completedAt) : null,
    programId,
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

  it('keeps an explicit empty schedule instead of falling back', () => {
    expect(resolveWorkoutScheduleDays([], undefined, undefined, 3)).toEqual([]);
    expect(resolveWorkoutScheduleDays(undefined, [], undefined, 3)).toEqual([]);
    expect(resolveWorkoutScheduleDays(undefined, undefined, undefined, 3)).toEqual([1, 3, 5]);
  });

  it('starts initial schedule history on the activation date', () => {
    expect(buildInitialWorkoutScheduleHistory(
      [5, 1, 3],
      new Date('2026-05-19T12:00:00')
    )).toEqual([
      { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
    ]);
  });

  it('clamps legacy schedule history to account creation', () => {
    expect(clampWorkoutScheduleHistoryToActivationDate(
      [
        { effectiveDateKey: '1970-01-01', scheduleDays: [1, 3, 5] },
        { effectiveDateKey: '2026-05-21', scheduleDays: [2, 4] },
      ],
      new Date('2026-05-19T12:00:00')
    )).toEqual([
      { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      { effectiveDateKey: '2026-05-21', scheduleDays: [2, 4] },
    ]);
  });

  it('starts missing schedule history at account creation', () => {
    expect(clampWorkoutScheduleHistoryToActivationDate(
      [],
      new Date('2026-05-19T12:00:00'),
      [1, 3, 5]
    )).toEqual([
      { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
    ]);
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

  it('returns completed weekdays for only the requested program in the anchored week', () => {
    const weekdays = getCompletedWeekdaysForProgram(
      [
        programSession('matching-monday', '2026-05-11T20:00:00', 'program-a'),
        programSession('matching-monday-duplicate', '2026-05-11T21:00:00', 'program-a'),
        programSession('matching-thursday', '2026-05-14T06:30:00', 'program-a'),
        programSession('other-program', '2026-05-13T12:00:00', 'program-b'),
        programSession('standalone', '2026-05-15T12:00:00'),
        programSession('incomplete', null, 'program-a'),
        programSession('outside-week', '2026-05-18T12:00:00', 'program-a'),
      ],
      'program-a',
      new Date('2026-05-13T12:00:00')
    );

    expect(weekdays).toEqual([1, 4]);
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

  it('uses historical schedules so changing days does not rewrite past streak rules', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [2, 4],
      scheduleHistory: [
        { effectiveDateKey: '1970-01-01', scheduleDays: [1, 3, 5] },
        { effectiveDateKey: '2026-05-16', scheduleDays: [2, 4] },
      ],
      sessions: [
        session('monday', '2026-05-11T12:00:00'),
        session('wednesday', '2026-05-13T12:00:00'),
        session('friday', '2026-05-15T12:00:00'),
      ],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(streak).toBe(3);
  });

  it('keeps an 18 day streak after removing schedule days', () => {
    const today = new Date('2026-05-18T12:00:00');
    const history = buildWorkoutScheduleHistoryForChange({
      previousDays: [0, 1, 2, 3, 4, 5, 6],
      nextDays: [1, 2, 3, 4, 5],
      effectiveDate: today,
    });

    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 2, 3, 4, 5],
      scheduleHistory: history,
      sessions: dailySessions('2026-05-01', 18),
      today,
    });

    expect(streak).toBe(18);
  });

  it('continues with the new schedule after preserving the old schedule history', () => {
    const history = buildWorkoutScheduleHistoryForChange({
      previousDays: [0, 1, 2, 3, 4, 5, 6],
      nextDays: [1, 2, 3, 4, 5],
      effectiveDate: new Date('2026-05-18T12:00:00'),
    });

    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 2, 3, 4, 5],
      scheduleHistory: history,
      sessions: [
        ...dailySessions('2026-05-01', 18),
        session('tuesday', '2026-05-19T12:00:00'),
        session('wednesday', '2026-05-20T12:00:00'),
        session('thursday', '2026-05-21T12:00:00'),
        session('friday', '2026-05-22T12:00:00'),
      ],
      today: new Date('2026-05-25T12:00:00'),
    });

    expect(streak).toBe(22);
  });

  it('builds schedule history by preserving old rules before the edit date', () => {
    const history = buildWorkoutScheduleHistoryForChange({
      previousDays: [0, 1, 2, 3, 4, 5, 6],
      nextDays: [1, 2, 3, 4, 5],
      effectiveDate: new Date('2026-05-18T12:00:00'),
    });

    expect(history).toEqual([
      { effectiveDateKey: '1970-01-01', scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
      { effectiveDateKey: '2026-05-18', scheduleDays: [1, 2, 3, 4, 5] },
    ]);
  });

  it('does not backfill a fresh account schedule before its first active date', () => {
    expect(getScheduleDaysForDate({
      date: new Date('2026-05-18T12:00:00'),
      scheduleDays: [1, 3, 5],
      scheduleHistory: [
        { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      ],
    })).toEqual([]);

    expect(getScheduleDaysForDate({
      date: new Date('2026-05-19T12:00:00'),
      scheduleDays: [1, 3, 5],
      scheduleHistory: [
        { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      ],
    })).toEqual([1, 3, 5]);
  });

  it('keeps legacy no-history schedules active for previous dates', () => {
    const days = buildWeekProgressDays({
      anchorDate: new Date('2026-05-18T12:00:00'),
      scheduleDays: [1],
      sessions: [],
      today: new Date('2026-05-19T12:00:00'),
    });

    expect(days[1]).toMatchObject({
      dateKey: '2026-05-18',
      isScheduled: true,
      isMissed: true,
    });
  });

  it('does not mark pre-activation scheduled weekdays as missed', () => {
    const days = buildWeekProgressDays({
      anchorDate: new Date('2026-05-19T12:00:00'),
      scheduleDays: [1, 3, 5],
      scheduleHistory: [
        { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      ],
      sessions: [],
      today: new Date('2026-05-19T12:00:00'),
    });

    expect(days[1]).toMatchObject({
      dateKey: '2026-05-18',
      isScheduled: false,
      isMissed: false,
    });
    expect(days[3]).toMatchObject({
      dateKey: '2026-05-20',
      isScheduled: true,
    });
  });

  it('keeps fresh account schedule edits effective tomorrow without a legacy backfill', () => {
    const history = buildWorkoutScheduleHistoryForChange({
      previousDays: [1, 3, 5],
      nextDays: [2, 4],
      currentHistory: [
        { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      ],
      effectiveDate: new Date('2026-05-20T12:00:00'),
    });

    expect(history).toEqual([
      { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      { effectiveDateKey: '2026-05-20', scheduleDays: [2, 4] },
    ]);

    expect(getScheduleDaysForDate({
      date: new Date('2026-05-19T12:00:00'),
      scheduleDays: [2, 4],
      scheduleHistory: history,
    })).toEqual([1, 3, 5]);
    expect(getScheduleDaysForDate({
      date: new Date('2026-05-20T12:00:00'),
      scheduleDays: [2, 4],
      scheduleHistory: history,
    })).toEqual([2, 4]);
  });

  it('does not break scheduled streaks before the first schedule activation date', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 3, 5],
      scheduleHistory: [
        { effectiveDateKey: '2026-05-19', scheduleDays: [1, 3, 5] },
      ],
      sessions: [
        session('wednesday', '2026-05-20T12:00:00'),
      ],
      today: new Date('2026-05-21T12:00:00'),
    });

    expect(streak).toBe(1);
  });

  it('replaces same day schedule history entries instead of duplicating them', () => {
    const history = buildWorkoutScheduleHistoryForChange({
      previousDays: [1, 2, 3, 4, 5],
      nextDays: [1, 3, 5],
      currentHistory: [
        { effectiveDateKey: '1970-01-01', scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
        { effectiveDateKey: '2026-05-18', scheduleDays: [1, 2, 3, 4, 5] },
      ],
      effectiveDate: new Date('2026-05-18T12:00:00'),
    });

    expect(history).toEqual([
      { effectiveDateKey: '1970-01-01', scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
      { effectiveDateKey: '2026-05-18', scheduleDays: [1, 3, 5] },
    ]);
  });

  it('renders schedule dots from the schedule active on each date', () => {
    const days = buildWeekProgressDays({
      anchorDate: new Date('2026-05-11T12:00:00'),
      scheduleDays: [2, 4],
      scheduleHistory: [
        { effectiveDateKey: '1970-01-01', scheduleDays: [1, 3, 5] },
        { effectiveDateKey: '2026-05-16', scheduleDays: [2, 4] },
      ],
      sessions: [],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(days.map((day) => day.isScheduled)).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);

    const nextWeek = buildWeekProgressDays({
      anchorDate: new Date('2026-05-18T12:00:00'),
      scheduleDays: [2, 4],
      scheduleHistory: [
        { effectiveDateKey: '1970-01-01', scheduleDays: [1, 3, 5] },
        { effectiveDateKey: '2026-05-16', scheduleDays: [2, 4] },
      ],
      sessions: [],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(nextWeek.map((day) => day.isScheduled)).toEqual([
      false,
      false,
      true,
      false,
      true,
      false,
      false,
    ]);
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

  it('does not break a streak for an incomplete scheduled workout until that day is over', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T12:00:00'),
      ],
      today: new Date('2026-05-13T12:00:00'),
    });

    expect(streak).toBe(1);
  });

  it('breaks the streak after a scheduled workout day ends without a completion', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T12:00:00'),
      ],
      today: new Date('2026-05-14T12:00:00'),
    });

    expect(streak).toBe(0);
  });

  it('counts consecutive daily workouts when no schedule is selected', () => {
    const streak = getScheduledWorkoutDayStreak({
      scheduleDays: [],
      sessions: [
        session('thursday', '2026-05-14T12:00:00'),
        session('friday', '2026-05-15T12:00:00'),
        session('saturday', '2026-05-16T12:00:00'),
      ],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(streak).toBe(3);
  });

  it('exposes a daily workout streak helper', () => {
    const streak = getWorkoutDayStreak({
      sessions: [
        session('wednesday', '2026-05-13T12:00:00'),
        session('friday', '2026-05-15T12:00:00'),
        session('saturday', '2026-05-16T12:00:00'),
      ],
      today: new Date('2026-05-16T12:00:00'),
    });

    expect(streak).toBe(2);
  });
});
