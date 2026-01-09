import { useProgramsStore } from '@/src/store/programsStore';
import { Program } from '@/src/types/workout';

jest.mock('@/src/services/programSyncService', () => ({
  syncLocalProgram: jest.fn().mockResolvedValue({ success: false }),
  processPendingProgramQueue: jest.fn().mockResolvedValue({
    processed: 0,
    failed: 0,
    idMappings: new Map(),
  }),
  removeFromPendingQueue: jest.fn().mockResolvedValue(undefined),
}));

const buildLocalProgram = (): Program => {
  const now = new Date().toISOString();
  return {
    id: 'local-program-1',
    name: 'Strength Split',
    description: undefined,
    difficulty: 'beginner',
    goal: undefined,
    durationWeeks: undefined,
    isPublic: false,
    isDefault: false,
    isAiCreated: false,
    isTemplate: false,
    lastPerformedAt: null,
    createdBy: 'local',
    createdAt: now,
    updatedAt: now,
    workouts: [
      {
        id: 'local-workout-1',
        name: 'Upper',
        dayNumber: 1,
        exercises: [],
      },
      {
        id: 'local-workout-2',
        name: 'Lower',
        dayNumber: 2,
        exercises: [],
      },
      {
        id: 'local-workout-3',
        name: 'Full Body',
        dayNumber: 3,
        exercises: [],
      },
    ],
  };
};

describe('programsStore reorderProgramWorkouts', () => {
  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('reorders workouts and reindexes day numbers for local programs', async () => {
    const program = buildLocalProgram();
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore
      .getState()
      .reorderProgramWorkouts(program.id, [
        'local-workout-3',
        'local-workout-1',
        'local-workout-2',
      ]);

    const updated = useProgramsStore.getState().programs.find(p => p.id === program.id);
    const updatedIds = updated?.workouts.map(workout => workout.id);
    const updatedDays = updated?.workouts.map(workout => workout.dayNumber);

    expect(result).toBe(true);
    expect(updatedIds).toEqual(['local-workout-3', 'local-workout-1', 'local-workout-2']);
    expect(updatedDays).toEqual([1, 2, 3]);
  });
});
