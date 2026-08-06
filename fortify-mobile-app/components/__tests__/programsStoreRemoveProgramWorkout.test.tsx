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
    name: 'Upper/Lower',
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
        exercises: [
          {
            id: 'local-ex-1',
            exerciseId: 'ex-press',
            exerciseName: 'Bench Press',
            sets: 3,
            reps: '6',
            restSeconds: 120,
            notes: '',
            orderIndex: 0,
          },
        ],
      },
      {
        id: 'local-workout-2',
        name: 'Lower',
        dayNumber: 2,
        exercises: [
          {
            id: 'local-ex-2',
            exerciseId: 'ex-squat',
            exerciseName: 'Back Squat',
            sets: 4,
            reps: '5',
            restSeconds: 150,
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
  };
};

describe('programsStore remove workout/exercise', () => {
  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('removes a workout and reindexes day numbers for local programs', async () => {
    const program = buildLocalProgram();
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore
      .getState()
      .removeWorkoutFromProgram(program.id, 'local-workout-1');

    const updated = useProgramsStore.getState().programs.find(p => p.id === program.id);

    expect(result).toBe(true);
    expect(updated?.workouts).toHaveLength(1);
    expect(updated?.workouts[0].id).toBe('local-workout-2');
    expect(updated?.workouts[0].dayNumber).toBe(1);
  });

  it('removes an exercise and reindexes order for local workouts', async () => {
    const program = buildLocalProgram();
    program.workouts[0].exercises.push({
      id: 'local-ex-3',
      exerciseId: 'ex-row',
      exerciseName: 'Barbell Row',
      sets: 3,
      reps: '8',
      restSeconds: 90,
      notes: '',
      orderIndex: 1,
    });
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore
      .getState()
      .removeExerciseFromProgramWorkout(program.id, 'local-workout-1', 'local-ex-1');

    const updated = useProgramsStore.getState().programs.find(p => p.id === program.id);
    const updatedExercises = updated?.workouts[0].exercises ?? [];

    expect(result).toBe(true);
    expect(updatedExercises).toHaveLength(1);
    expect(updatedExercises[0].id).toBe('local-ex-3');
    expect(updatedExercises[0].orderIndex).toBe(0);
  });

  it('refuses to remove the final exercise from a workout', async () => {
    const program = buildLocalProgram();
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore
      .getState()
      .removeExerciseFromProgramWorkout(program.id, 'local-workout-1', 'local-ex-1');

    expect(result).toBe(false);
    expect(useProgramsStore.getState().programs[0]).toEqual(program);
    expect(useProgramsStore.getState().error).toBe(
      'A program workout must contain at least one exercise'
    );
  });
});
