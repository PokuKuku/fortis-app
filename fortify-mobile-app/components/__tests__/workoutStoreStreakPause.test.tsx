import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSession } from '@/src/types/workout';
import {
  fetchCloudStreakPauseState,
  syncCloudStreakPauseState,
} from '@/src/services/streakPauseService';
import { removeScopedItem, setActiveScopedStorageUser } from '@/src/utils/scopedStorage';
import { STREAK_PAUSE_STATE_KEY } from '@/src/constants/storageKeys';
import {
  getFirstMissedScheduledWorkoutDateKey,
  getScheduledWorkoutDayStreak,
} from '@/src/utils/workoutSchedule';

jest.mock('@/src/services/workoutCompletionNotifications', () => ({
  scheduleWorkoutCompletionNotification: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/services/streakPauseService', () => ({
  fetchCloudStreakPauseState: jest.fn(() => Promise.resolve(null)),
  syncCloudStreakPauseState: jest.fn(() => Promise.resolve()),
}));

describe('workout store streak pause', () => {
  const completedSession = (localId: string, dateKey: string): WorkoutSession => ({
    localId,
    name: 'Scheduled workout',
    notes: '',
    startedAt: new Date(`${dateKey}T12:00:00`),
    completedAt: new Date(`${dateKey}T12:00:00`),
    exercises: [],
    isSynced: true,
  });

  beforeEach(() => {
    setActiveScopedStorageUser(null);
    jest.mocked(fetchCloudStreakPauseState).mockResolvedValue(null);
  });

  afterEach(async () => {
    jest.useRealTimers();
    useWorkoutStore.getState().resetStore();
    await removeScopedItem(STREAK_PAUSE_STATE_KEY);
    jest.clearAllMocks();
  });

  it('keeps a paused streak paused after finishing a workout', async () => {
    const session: WorkoutSession = {
      localId: 'streak-session-1',
      name: 'Push Day',
      notes: '',
      startedAt: new Date('2026-06-30T12:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 185,
              reps: 5,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
          ],
          notes: '',
          orderIndex: 0,
        },
      ],
      isSynced: false,
    };

    useWorkoutStore.setState({
      activeSession: session,
      isWorkoutActive: true,
      completedSessions: [],
      isStreakPaused: true,
      streakPausedAt: '2026-06-29T12:00:00.000Z',
      pausedStreakCount: 3,
    });

    await useWorkoutStore.getState().finishWorkout();

    expect(useWorkoutStore.getState().isStreakPaused).toBe(true);
    expect(useWorkoutStore.getState().streakPausedAt).toBe('2026-06-29T12:00:00.000Z');
    expect(useWorkoutStore.getState().pausedStreakCount).toBe(3);
  });

  it('limits streak pauses to three per month', async () => {
    await expect(useWorkoutStore.getState().pauseStreak(4)).resolves.toBe(true);
    await useWorkoutStore.getState().resumeStreak();
    await expect(useWorkoutStore.getState().pauseStreak(4)).resolves.toBe(true);
    await useWorkoutStore.getState().resumeStreak();
    await expect(useWorkoutStore.getState().pauseStreak(4)).resolves.toBe(true);
    await useWorkoutStore.getState().resumeStreak();

    await expect(useWorkoutStore.getState().pauseStreak(4)).resolves.toBe(false);

    expect(useWorkoutStore.getState().isStreakPaused).toBe(false);
    expect(useWorkoutStore.getState().streakPausesUsedThisMonth).toBe(3);
  });

  it('keeps the pause period after resuming so covered dates remain protected', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-29T08:00:00-04:00'));

    await expect(useWorkoutStore.getState().pauseStreak(4)).resolves.toBe(true);
    expect(useWorkoutStore.getState().streakPausePeriods).toEqual([{
      startDateKey: '2026-06-29',
      endDateKey: null,
    }]);

    jest.setSystemTime(new Date('2026-06-30T08:00:00-04:00'));
    await useWorkoutStore.getState().resumeStreak();

    expect(useWorkoutStore.getState().streakPausePeriods).toEqual([{
      startDateKey: '2026-06-29',
      endDateKey: '2026-06-30',
    }]);
    expect(syncCloudStreakPauseState).toHaveBeenLastCalledWith(expect.objectContaining({
      isPaused: false,
      streakPausePeriods: [{
        startDateKey: '2026-06-29',
        endDateKey: '2026-06-30',
      }],
    }));
  });

  it('hydrates newer streak pause state from the account cloud record', async () => {
    jest.mocked(fetchCloudStreakPauseState).mockResolvedValue({
      isPaused: false,
      pausedAt: null,
      pausedStreakCount: null,
      streakPausePeriods: [{
        startDateKey: '2026-07-04',
        endDateKey: '2026-07-04',
      }],
      streakPauseMonthKey: '2026-07',
      streakPausesUsedThisMonth: 1,
      updatedAt: '2026-07-04T20:00:00.000Z',
    });

    await useWorkoutStore.getState().loadStreakPauseState();

    expect(useWorkoutStore.getState().streakPausePeriods).toEqual([{
      startDateKey: '2026-07-04',
      endDateKey: '2026-07-04',
    }]);
    expect(useWorkoutStore.getState().streakPauseUpdatedAt)
      .toBe('2026-07-04T20:00:00.000Z');
  });

  it('holds only one earned streak freeze pass at a time', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-10T12:00:00'));

    await expect(useWorkoutStore.getState().earnStreakFreezePass('2026-07-10'))
      .resolves.toBe(true);
    await expect(useWorkoutStore.getState().earnStreakFreezePass('2026-07-11'))
      .resolves.toBe(false);

    expect(useWorkoutStore.getState().streakFreezePassAvailable).toBe(true);
    expect(useWorkoutStore.getState().streakFreezePassMilestoneDateKey).toBe('2026-07-10');
  });

  it('redeems the pass and resets freeze progress to the protected date', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-10T12:00:00'));
    await useWorkoutStore.getState().earnStreakFreezePass('2026-07-10');

    jest.setSystemTime(new Date('2026-07-14T12:00:00'));
    await expect(useWorkoutStore.getState().redeemStreakFreezePass('2026-07-13'))
      .resolves.toBe(true);

    expect(useWorkoutStore.getState().streakFreezePassAvailable).toBe(false);
    expect(useWorkoutStore.getState().streakPausePeriods).toContainEqual({
      startDateKey: '2026-07-13',
      endDateKey: '2026-07-13',
    });
    expect(useWorkoutStore.getState().streakFreezePassMilestoneDateKey)
      .toBe('2026-07-13');
  });

  it('preserves five real workouts after redemption and lets the next workout build to six', async () => {
    const fiveWorkoutSessions = [
      completedSession('workout-1', '2026-07-06'),
      completedSession('workout-2', '2026-07-08'),
      completedSession('workout-3', '2026-07-10'),
      completedSession('workout-4', '2026-07-13'),
      completedSession('workout-5', '2026-07-15'),
    ];
    const scheduleDays = [1, 3, 5];

    expect(getScheduledWorkoutDayStreak({
      scheduleDays,
      sessions: fiveWorkoutSessions,
      today: new Date('2026-07-16T12:00:00'),
    })).toBe(5);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T12:00:00'));
    await useWorkoutStore.getState().earnStreakFreezePass('2026-07-15');
    jest.setSystemTime(new Date('2026-07-18T12:00:00'));

    const missedDateKey = getFirstMissedScheduledWorkoutDateKey({
      afterDateKey: '2026-07-15',
      scheduleDays,
      sessions: fiveWorkoutSessions,
      today: new Date(),
    });
    expect(missedDateKey).toBe('2026-07-17');
    await useWorkoutStore.getState().redeemStreakFreezePass(missedDateKey as string);

    const protectedPeriods = useWorkoutStore.getState().streakPausePeriods;
    expect(getScheduledWorkoutDayStreak({
      scheduleDays,
      sessions: fiveWorkoutSessions,
      streakPausePeriods: protectedPeriods,
      today: new Date(),
    })).toBe(5);

    expect(getScheduledWorkoutDayStreak({
      scheduleDays,
      sessions: [completedSession('workout-6', '2026-07-20'), ...fiveWorkoutSessions],
      streakPausePeriods: protectedPeriods,
      today: new Date('2026-07-21T12:00:00'),
    })).toBe(6);
    expect(useWorkoutStore.getState().streakFreezePassAvailable).toBe(false);
  });
});
