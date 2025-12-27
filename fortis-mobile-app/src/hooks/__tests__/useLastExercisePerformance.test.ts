import { getLatestExercisePerformance } from '../useLastExercisePerformance';
import type { WorkoutSession } from '@/src/types/workout';

const buildSession = (overrides: Partial<WorkoutSession>): WorkoutSession => ({
  localId: 'session-1',
  name: 'Session',
  notes: '',
  startedAt: new Date('2024-01-01T00:00:00Z'),
  completedAt: new Date('2024-01-01T01:00:00Z'),
  exercises: [],
  isSynced: false,
  ...overrides,
});

describe('getLatestExercisePerformance', () => {
  it('returns null when there is no matching exercise', () => {
    const sessions: WorkoutSession[] = [
      buildSession({
        exercises: [
          {
            localId: 'ex-1',
            exerciseId: 'bench-press',
            exerciseName: 'Bench Press',
            sets: [],
            notes: '',
            orderIndex: 0,
          },
        ],
      }),
    ];

    expect(getLatestExercisePerformance(sessions, 'squat')).toBeNull();
  });

  it('returns the latest session set data ordered by set index', () => {
    const sessions: WorkoutSession[] = [
      buildSession({
        localId: 'session-old',
        startedAt: new Date('2024-01-01T00:00:00Z'),
        completedAt: new Date('2024-01-01T01:00:00Z'),
        exercises: [
          {
            localId: 'ex-old',
            exerciseId: 'bench-press',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-old-1',
                setNumber: 1,
                setType: 'normal',
                weight: 125,
                weightUnit: 'lbs',
                reps: 8,
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
      }),
      buildSession({
        localId: 'session-new',
        startedAt: new Date('2024-02-01T00:00:00Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'ex-new',
            exerciseId: 'bench-press',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-new-2',
                setNumber: 2,
                setType: 'normal',
                weight: 155,
                weightUnit: 'lbs',
                reps: 8,
                rpe: null,
                restSeconds: null,
                notes: '',
                isCompleted: true,
                orderIndex: 1,
              },
              {
                localId: 'set-new-1',
                setNumber: 1,
                setType: 'normal',
                weight: 135,
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
      }),
    ];

    const performance = getLatestExercisePerformance(sessions, 'bench-press');

    expect(performance).not.toBeNull();
    expect(performance?.setCount).toBe(2);
    expect(performance?.weight).toBe(155);
    expect(performance?.weightUnit).toBe('lbs');
    expect(performance?.sets).toEqual([
      { weight: 135, reps: 10, weightUnit: 'lbs' },
      { weight: 155, reps: 8, weightUnit: 'lbs' },
    ]);
  });

  it('filters by program workout when provided', () => {
    const sessions: WorkoutSession[] = [
      buildSession({
        localId: 'session-a',
        startedAt: new Date('2024-03-01T00:00:00Z'),
        completedAt: new Date('2024-03-01T01:00:00Z'),
        programWorkoutId: 'program-workout-1',
        exercises: [
          {
            localId: 'ex-a',
            exerciseId: 'squat',
            exerciseName: 'Squat',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-a-1',
                setNumber: 1,
                setType: 'normal',
                weight: 225,
                weightUnit: 'lbs',
                reps: 5,
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
      }),
      buildSession({
        localId: 'session-b',
        startedAt: new Date('2024-03-05T00:00:00Z'),
        completedAt: new Date('2024-03-05T01:00:00Z'),
        programWorkoutId: 'program-workout-2',
        exercises: [
          {
            localId: 'ex-b',
            exerciseId: 'squat',
            exerciseName: 'Squat',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-b-1',
                setNumber: 1,
                setType: 'normal',
                weight: 245,
                weightUnit: 'lbs',
                reps: 3,
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
      }),
    ];

    const performance = getLatestExercisePerformance(sessions, 'squat', {
      programWorkoutId: 'program-workout-1',
    });

    expect(performance?.weight).toBe(225);
  });

  it('filters by workout name when no program ids are provided', () => {
    const sessions: WorkoutSession[] = [
      buildSession({
        localId: 'session-a',
        name: 'Upper Body',
        startedAt: new Date('2024-03-01T00:00:00Z'),
        completedAt: new Date('2024-03-01T01:00:00Z'),
        exercises: [
          {
            localId: 'ex-a',
            exerciseId: 'row',
            exerciseName: 'Row',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-a-1',
                setNumber: 1,
                setType: 'normal',
                weight: 95,
                weightUnit: 'lbs',
                reps: 12,
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
      }),
      buildSession({
        localId: 'session-b',
        name: 'Full Body',
        startedAt: new Date('2024-03-02T00:00:00Z'),
        completedAt: new Date('2024-03-02T01:00:00Z'),
        exercises: [
          {
            localId: 'ex-b',
            exerciseId: 'row',
            exerciseName: 'Row',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-b-1',
                setNumber: 1,
                setType: 'normal',
                weight: 105,
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
      }),
    ];

    const performance = getLatestExercisePerformance(sessions, 'row', {
      workoutName: 'Upper Body',
    });

    expect(performance?.weight).toBe(95);
  });
});
