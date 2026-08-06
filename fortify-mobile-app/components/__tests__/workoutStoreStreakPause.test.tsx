import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSession } from '@/src/types/workout';
import {
  fetchCloudStreakPauseState,
  syncCloudStreakPauseState,
} from '@/src/services/streakPauseService';
import { removeScopedItem, setActiveScopedStorageUser } from '@/src/utils/scopedStorage';
import { STREAK_PAUSE_STATE_KEY } from '@/src/constants/storageKeys';

jest.mock('@/src/services/workoutCompletionNotifications', () => ({
  scheduleWorkoutCompletionNotification: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/services/streakPauseService', () => ({
  fetchCloudStreakPauseState: jest.fn(() => Promise.resolve(null)),
  syncCloudStreakPauseState: jest.fn(() => Promise.resolve()),
}));

describe('workout store streak pause', () => {
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
});
