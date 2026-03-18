import { useWorkoutStore } from '@/src/store/workoutStore';
import { getScopedItem } from '@/src/utils/scopedStorage';

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn().mockResolvedValue(null),
  setScopedItem: jest.fn().mockResolvedValue(undefined),
  removeScopedItem: jest.fn().mockResolvedValue(undefined),
}));

const mockedGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;

describe('workoutStore lastEditedAt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    useWorkoutStore.getState().resetStore();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('updates lastEditedAt for workout edits but not timer-only changes', () => {
    jest.setSystemTime(new Date('2026-03-18T17:00:00.000Z'));
    useWorkoutStore.getState().startWorkout('Push Day');

    const startedAt = useWorkoutStore.getState().activeSession?.lastEditedAt;
    expect(startedAt?.toISOString()).toBe('2026-03-18T17:00:00.000Z');

    jest.setSystemTime(new Date('2026-03-18T17:15:00.000Z'));
    useWorkoutStore.getState().updateWorkoutNotes('Felt strong');

    const editedAt = useWorkoutStore.getState().activeSession?.lastEditedAt;
    expect(editedAt?.toISOString()).toBe('2026-03-18T17:15:00.000Z');

    jest.setSystemTime(new Date('2026-03-18T17:30:00.000Z'));
    useWorkoutStore.getState().pauseWorkoutTimer();

    const afterPause = useWorkoutStore.getState().activeSession?.lastEditedAt;
    expect(afterPause?.toISOString()).toBe('2026-03-18T17:15:00.000Z');
  });

  it('rehydrates lastEditedAt from persisted active workout data', async () => {
    mockedGetScopedItem.mockResolvedValueOnce(JSON.stringify({
      localId: 'session-1',
      name: 'Leg Day',
      notes: '',
      startedAt: '2026-03-18T17:00:00.000Z',
      lastEditedAt: '2026-03-18T17:42:00.000Z',
      completedAt: null,
      exercises: [],
      isSynced: false,
    }));

    await useWorkoutStore.getState().loadActiveSession();

    expect(useWorkoutStore.getState().activeSession?.lastEditedAt).toEqual(
      new Date('2026-03-18T17:42:00.000Z')
    );
  });
});
