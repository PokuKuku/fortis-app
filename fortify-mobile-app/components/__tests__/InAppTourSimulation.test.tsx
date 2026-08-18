import { useWorkoutStore } from '@/src/store/workoutStore';
import { TOUR_BACK_WORKOUT_EXERCISES } from '@/src/constants/inAppTour';
import { removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(async () => null),
  setScopedItem: jest.fn(async () => undefined),
  removeScopedItem: jest.fn(async () => undefined),
  getActiveScopedStorageUser: jest.fn(() => 'user-1'),
}));

describe('in-app tour workout simulation', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('keeps the demo workout in memory without saving or clearing user storage', () => {
    const started = useWorkoutStore.getState().startTourWorkoutSimulation(
      'Back Workout',
      TOUR_BACK_WORKOUT_EXERCISES.map((exercise) => ({ ...exercise })),
    );

    expect(started).toBe(true);
    expect(useWorkoutStore.getState().isTourSimulation).toBe(true);
    expect(useWorkoutStore.getState().activeSession?.exercises).toHaveLength(4);

    const exercise = useWorkoutStore.getState().activeSession!.exercises[0];
    const firstSet = exercise.sets[0];
    useWorkoutStore.getState().updateSet(exercise.localId, firstSet.localId, { weight: 225 });

    expect(setScopedItem).not.toHaveBeenCalled();

    useWorkoutStore.getState().cancelWorkout();

    expect(removeScopedItem).not.toHaveBeenCalled();
    expect(useWorkoutStore.getState().activeSession).toBeNull();
    expect(useWorkoutStore.getState().isTourSimulation).toBe(false);
  });
});
