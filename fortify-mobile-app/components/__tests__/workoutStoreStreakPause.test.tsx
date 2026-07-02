import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSession } from '@/src/types/workout';

jest.mock('@/src/services/workoutCompletionNotifications', () => ({
  scheduleWorkoutCompletionNotification: jest.fn(() => Promise.resolve()),
}));

describe('workout store streak pause', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
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
});
