import type { WorkoutSession } from '@/src/types/workout';
import {
  buildWeeklyRecap,
  getDueWeeklyRecapWeekStart,
  getScheduledReminderDates,
  getScheduledWorkoutReminderBody,
  normalizeReminderTime,
  SCHEDULED_WORKOUT_REMINDER_BODIES,
} from '@/src/utils/workoutRetention';

function session(localId: string, completedAt: string, name = 'Workout'): WorkoutSession {
  return {
    localId,
    name,
    notes: '',
    startedAt: new Date(completedAt),
    completedAt: new Date(completedAt),
    durationSeconds: 1800,
    exercises: [
      {
        localId: `${localId}-exercise`,
        exerciseId: 'bench',
        exerciseName: 'Bench Press',
        notes: '',
        orderIndex: 0,
        sets: [
          {
            localId: `${localId}-set`,
            setNumber: 1,
            setType: 'normal',
            weight: 100,
            weightUnit: 'lbs',
            reps: 10,
            rpe: null,
            restSeconds: null,
            notes: '',
            isCompleted: true,
            orderIndex: 0,
          },
        ],
      },
    ],
    isSynced: true,
  };
}

function prSession(localId: string, completedAt: string, name = 'Workout'): WorkoutSession {
  const workout = session(localId, completedAt, name);
  workout.exercises[0].sets = [
    {
      ...workout.exercises[0].sets[0],
      localId: `${localId}-set-1`,
      weight: 225,
      reps: 8,
      notes: 'PR',
    },
    {
      ...workout.exercises[0].sets[0],
      localId: `${localId}-set-2`,
      setNumber: 2,
      weight: 185,
      reps: 12,
      notes: '',
      orderIndex: 1,
    },
  ];
  return workout;
}

describe('workoutRetention', () => {
  it('normalizes invalid reminder times to the default morning time', () => {
    expect(normalizeReminderTime({ hour: 25, minute: 0 })).toEqual({ hour: 8, minute: 0 });
    expect(normalizeReminderTime({ hour: 7, minute: 30 })).toEqual({ hour: 7, minute: 30 });
  });

  it('generates scheduled reminders only for selected weekdays after now', () => {
    const dates = getScheduledReminderDates({
      scheduleDays: [1, 3],
      time: { hour: 8, minute: 0 },
      from: new Date('2026-05-11T09:00:00'),
      maxCount: 3,
    });

    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2026-05-13',
      '2026-05-18',
      '2026-05-20',
    ]);
  });

  it('selects stable scheduled workout reminder copy for a notification date', () => {
    const date = new Date('2026-05-13T08:00:00');

    expect(SCHEDULED_WORKOUT_REMINDER_BODIES).toContain(getScheduledWorkoutReminderBody(date));
    expect(getScheduledWorkoutReminderBody(date)).toBe(getScheduledWorkoutReminderBody(new Date('2026-05-13T18:00:00')));
  });

  it('rotates scheduled workout reminder copy across upcoming dates', () => {
    const bodies = Array.from({ length: 14 }, (_, index) => (
      getScheduledWorkoutReminderBody(new Date(2026, 4, 13 + index, 8, 0, 0))
    ));

    expect(new Set(bodies).size).toBeGreaterThan(1);
  });

  it('returns weekly recap due only on Sunday evening', () => {
    expect(getDueWeeklyRecapWeekStart(new Date('2026-05-17T17:59:00'))).toBeNull();
    expect(getDueWeeklyRecapWeekStart(new Date('2026-05-17T18:00:00'))?.toISOString().slice(0, 10)).toBe('2026-05-10');
  });

  it('builds a client-side weekly recap', () => {
    const recap = buildWeeklyRecap({
      weekStart: new Date('2026-05-10T00:00:00'),
      scheduleDays: [1, 3, 5],
      sessions: [
        session('monday', '2026-05-11T12:00:00', 'Upper'),
        session('friday', '2026-05-15T12:00:00', 'Lower'),
      ],
    });

    expect(recap.workoutsCompleted).toBe(2);
    expect(recap.scheduledDays).toBe(3);
    expect(recap.scheduledDaysHit).toBe(2);
    expect(recap.scheduledDaysMissed).toBe(1);
    expect(recap.totalSets).toBe(2);
    expect(recap.notableExercises[0]).toMatchObject({ name: 'Bench Press', sets: 2 });
    expect(recap.prCount).toBe(0);
    expect(recap.prHighlights).toEqual([]);
  });

  it('uses schedule history when counting weekly scheduled days', () => {
    const recap = buildWeeklyRecap({
      weekStart: new Date('2026-05-10T00:00:00'),
      scheduleDays: [2, 4],
      scheduleHistory: [
        { effectiveDateKey: '1970-01-01', scheduleDays: [1, 3, 5] },
        { effectiveDateKey: '2026-05-16', scheduleDays: [2, 4] },
      ],
      sessions: [
        session('monday', '2026-05-11T12:00:00', 'Upper'),
        session('friday', '2026-05-15T12:00:00', 'Lower'),
      ],
    });

    expect(recap.scheduledDays).toBe(3);
    expect(recap.scheduledDaysHit).toBe(2);
    expect(recap.scheduledDaysMissed).toBe(1);
  });

  it('adds weekly PR highlights from completed PR-marked sets', () => {
    const recap = buildWeeklyRecap({
      weekStart: new Date('2026-05-10T00:00:00'),
      scheduleDays: [1],
      sessions: [
        prSession('monday', '2026-05-11T12:00:00', 'Push'),
      ],
    });

    expect(recap.prCount).toBe(1);
    expect(recap.prHighlights).toHaveLength(1);
    expect(recap.prHighlights[0]).toMatchObject({
      exerciseName: 'Bench Press',
      reps: 8,
      weight: 225,
      weightUnit: 'lbs',
      sessionName: 'Push',
    });
  });
});
