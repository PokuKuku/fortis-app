import { startWorkoutFromStartPreset } from '@/src/services/startWorkoutFromPreset';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Program } from '@/src/types/workout';

const buildProgram = (overrides: Partial<Program> = {}): Program => {
  const now = new Date().toISOString();
  return {
    id: 'program-1',
    name: 'Program One',
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
        id: 'program-1-workout-1',
        name: 'Day 1',
        dayNumber: 1,
        exercises: [
          {
            id: 'program-1-ex-1',
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            sets: 3,
            reps: '8-10',
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
    ...overrides,
  };
};

describe('startWorkoutFromStartPreset', () => {
  const originalFetchPrograms = useProgramsStore.getState().fetchPrograms;
  const originalLoadProgress = useProgramProgressStore.getState().loadProgress;

  afterEach(() => {
    useProgramsStore.setState({
      fetchPrograms: originalFetchPrograms,
      programs: [],
      hasFetchedPrograms: false,
      isLoading: false,
    });
    useProgramProgressStore.setState({
      loadProgress: originalLoadProgress,
      isLoaded: false,
      progressByProgram: {},
    });
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('starts a program preset with program session context', async () => {
    const program = buildProgram();
    useProgramsStore.setState({ programs: [program] });
    useProgramProgressStore.setState({ isLoaded: true });

    const result = await startWorkoutFromStartPreset({
      type: 'program',
      programId: program.id,
    });

    const activeSession = useWorkoutStore.getState().activeSession;
    expect(result).toBe('started');
    expect(activeSession?.programId).toBe(program.id);
    expect(activeSession?.programWorkoutId).toBe(program.workouts[0].id);
    expect(activeSession?.programName).toBe(program.name);
  });

  it('force-fetches when the selected program is not already in the store', async () => {
    const program = buildProgram();
    const fetchPrograms = jest.fn(async () => {
      useProgramsStore.setState({ programs: [program] });
    });
    useProgramsStore.setState({ programs: [], fetchPrograms: fetchPrograms as any });
    useProgramProgressStore.setState({ isLoaded: true });

    const result = await startWorkoutFromStartPreset({
      type: 'program',
      programId: program.id,
    });

    expect(fetchPrograms).toHaveBeenCalledWith({ force: true });
    expect(result).toBe('started');
    expect(useWorkoutStore.getState().activeSession?.programId).toBe(program.id);
  });
});
