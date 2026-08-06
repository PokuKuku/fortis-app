import { PENDING_HOME_WORKOUT_CELEBRATION_KEY } from '@/src/constants/storageKeys';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';
import {
  getScopedItem,
  removeScopedItem,
  setActiveScopedStorageUser,
} from '@/src/utils/scopedStorage';

jest.mock('@/src/services/workoutCompletionNotifications', () => ({
  scheduleWorkoutCompletionNotification: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/services/workoutHistoryService', () => ({
  syncWorkoutSession: jest.fn(() => Promise.resolve({ success: false, queued: true })),
  resyncMissingSets: jest.fn(() => Promise.resolve()),
}));

const buildSession = (localId: string): WorkoutSession => ({
  localId,
  name: 'Scheduled workout',
  notes: '',
  startedAt: new Date(),
  completedAt: null,
  exercises: [
    {
      localId: `${localId}-exercise`,
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      notes: '',
      orderIndex: 0,
      sets: [
        {
          localId: `${localId}-set`,
          setNumber: 1,
          setType: 'normal',
          weight: 135,
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
  isSynced: false,
});

describe('workout completion celebration queue', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    setActiveScopedStorageUser(null);
    useWorkoutStore.getState().resetStore();
    await removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
  });

  afterEach(async () => {
    jest.useRealTimers();
    useWorkoutStore.getState().resetStore();
    await removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
    jest.clearAllMocks();
  });

  it('keeps the first pending celebration when another workout finishes that day', async () => {
    jest.setSystemTime(new Date('2026-08-06T09:00:00-04:00'));
    useWorkoutStore.setState({
      activeSession: buildSession('first-workout'),
      isWorkoutActive: true,
      completedSessions: [],
    });

    await useWorkoutStore.getState().finishWorkout();

    jest.setSystemTime(new Date('2026-08-06T18:00:00-04:00'));
    useWorkoutStore.setState({
      activeSession: buildSession('second-workout'),
      isWorkoutActive: true,
    });

    await useWorkoutStore.getState().finishWorkout();

    const rawPendingCelebration = await getScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
    expect(rawPendingCelebration).not.toBeNull();
    expect(JSON.parse(rawPendingCelebration as string)).toEqual(expect.objectContaining({
      sessionLocalId: 'first-workout',
    }));
  });
});
