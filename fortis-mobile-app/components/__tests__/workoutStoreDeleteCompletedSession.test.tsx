import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn().mockResolvedValue(null),
  setScopedItem: jest.fn().mockResolvedValue(undefined),
  removeScopedItem: jest.fn().mockResolvedValue(undefined),
}));

const buildSession = (localId: string, overrides: Partial<WorkoutSession> = {}): WorkoutSession => ({
  localId,
  name: 'Test Session',
  notes: '',
  startedAt: new Date('2024-01-01T00:00:00.000Z'),
  completedAt: new Date('2024-01-01T01:00:00.000Z'),
  durationSeconds: 3600,
  exercises: [
    {
      localId: `${localId}-exercise-1`,
      exerciseId: 'exercise-1',
      exerciseName: 'Bench Press',
      sets: [
        {
          localId: `${localId}-set-1`,
          setNumber: 1,
          setType: 'normal',
          weight: 100,
          weightUnit: 'lbs',
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
  isSynced: true,
  ...overrides,
});

describe('workoutStore deleteCompletedSession', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('removes the session and syncing id', async () => {
    const sessionA = buildSession('local-a');
    const sessionB = buildSession('local-b');
    useWorkoutStore.setState({
      completedSessions: [sessionA, sessionB],
      syncingSessionIds: ['local-a'],
    });

    await useWorkoutStore.getState().deleteCompletedSession('local-a');

    const state = useWorkoutStore.getState();
    expect(state.completedSessions).toEqual([sessionB]);
    expect(state.syncingSessionIds).toEqual([]);
  });
});
