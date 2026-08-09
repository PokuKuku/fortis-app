import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { Program, WorkoutSession } from '@/src/types/workout';

const buildProgram = (overrides: Partial<Program>): Program => {
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
            sets: 1,
            reps: '5',
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
    ...overrides,
  };
};

describe('workout last performed updates', () => {
  const originalUpdateLastPerformed = useProgramsStore.getState().updateLastPerformed;

  afterEach(() => {
    useProgramsStore.setState({
      updateLastPerformed: originalUpdateLastPerformed,
      programs: [],
    });
    useProgramsStore.getState().resetStore();
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('does not update last performed when starting a template workout', async () => {
    const template = buildProgram({
      id: 'template-1',
      name: 'Template One',
      isTemplate: true,
    });
    const updateLastPerformed = jest.fn();
    useProgramsStore.setState({ programs: [template], updateLastPerformed: updateLastPerformed as any });

    const result = await useWorkoutStore.getState().startWorkoutFromTemplate(template.id);

    expect(result).toBe(true);
    expect(useWorkoutStore.getState().activeSession?.originalTargetReps).toEqual(['5']);
    expect(updateLastPerformed).not.toHaveBeenCalled();
  });

  it('does not update last performed when starting a program workout', async () => {
    const program = buildProgram({ id: 'program-2', name: 'Program Two' });
    const updateLastPerformed = jest.fn();
    useProgramsStore.setState({ programs: [program], updateLastPerformed: updateLastPerformed as any });

    const result = await useWorkoutStore.getState().startWorkoutFromProgram(
      program.id,
      program.workouts[0].id
    );

    expect(result).toBe(true);
    expect(useWorkoutStore.getState().activeSession?.originalTargetReps).toEqual(['5']);
    expect(updateLastPerformed).not.toHaveBeenCalled();
  });

  it('seeds program workout previous-column baseline from saved set details', async () => {
    const program = buildProgram({
      id: 'program-with-baseline',
      name: 'Program With Baseline',
      workouts: [
        {
          id: 'program-with-baseline-workout-1',
          name: 'Upper',
          dayNumber: 1,
          exercises: [
            {
              id: 'program-with-baseline-ex-1',
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              sets: 1,
              reps: '8-12',
              notes: '',
              orderIndex: 0,
              setDetails: [
                { weight: 185, reps: 10, setType: 'warmup' },
                { weight: 195, reps: 8, setType: 'dropset' },
              ],
            },
          ],
        },
      ],
    });

    useProgramsStore.setState({ programs: [program] });

    const result = await useWorkoutStore.getState().startWorkoutFromProgram(
      program.id,
      program.workouts[0].id
    );

    const exercise = useWorkoutStore.getState().activeSession?.exercises[0];
    expect(result).toBe(true);
    expect(exercise?.sets).toHaveLength(2);
    expect(exercise?.baselinePerformance?.sets).toEqual([
      { weight: 185, weightUnit: 'lbs', reps: 10, setType: 'warmup' },
      { weight: 195, weightUnit: 'lbs', reps: 8, setType: 'dropset' },
    ]);
    expect(exercise?.sets.map((set) => set.setType)).toEqual(['warmup', 'dropset']);
  });

  it('uses the lower target rep bound with a starting weight before any workout is logged', async () => {
    const program = buildProgram({
      id: 'program-with-starting-weight',
      workouts: [
        {
          id: 'program-with-starting-weight-workout-1',
          name: 'Upper',
          dayNumber: 1,
          exercises: [
            {
              id: 'program-with-starting-weight-ex-1',
              exerciseId: 'cable-incline-fly',
              exerciseName: 'Cable Incline Fly',
              sets: 1,
              reps: '12-15',
              notes: '',
              orderIndex: 0,
              setDetails: [{ weight: 22, reps: null }],
            },
          ],
        },
      ],
    });

    useProgramsStore.setState({ programs: [program] });

    const result = await useWorkoutStore.getState().startWorkoutFromProgram(
      program.id,
      program.workouts[0].id
    );

    expect(result).toBe(true);
    expect(useWorkoutStore.getState().activeSession?.exercises[0].baselinePerformance?.sets).toEqual([
      { weight: 22, weightUnit: 'lbs', reps: 12, setType: 'normal' },
    ]);
  });

  it('updates last performed when finishing a template workout', async () => {
    const template = buildProgram({
      id: 'template-2',
      name: 'Template Two',
      isTemplate: true,
    });
    const updateLastPerformed = jest.fn();
    useProgramsStore.setState({ programs: [template], updateLastPerformed: updateLastPerformed as any });

    const session: WorkoutSession = {
      localId: 'session-1',
      name: template.name,
      notes: '',
      startedAt: new Date('2024-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 100,
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
      programId: template.id,
    };

    useWorkoutStore.setState({
      activeSession: session,
      isWorkoutActive: true,
      completedSessions: [],
    });

    await useWorkoutStore.getState().finishWorkout();

    expect(updateLastPerformed).toHaveBeenCalledTimes(1);
    expect(updateLastPerformed).toHaveBeenCalledWith(template.id);
  });

  it('updates last performed when finishing a template workout with a workout id', async () => {
    const template = buildProgram({
      id: 'template-3',
      name: 'Template Three',
      isTemplate: true,
    });
    const updateLastPerformed = jest.fn();
    useProgramsStore.setState({ programs: [template], updateLastPerformed: updateLastPerformed as any });

    const session: WorkoutSession = {
      localId: 'session-2',
      name: template.name,
      notes: '',
      startedAt: new Date('2024-01-02T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-2',
          exerciseId: 'ex-2',
          exerciseName: 'Squat',
          sets: [
            {
              localId: 'set-2',
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
      programId: template.id,
      programWorkoutId: template.workouts[0].id,
    };

    useWorkoutStore.setState({
      activeSession: session,
      isWorkoutActive: true,
      completedSessions: [],
    });

    await useWorkoutStore.getState().finishWorkout();

    expect(updateLastPerformed).toHaveBeenCalledTimes(1);
    expect(updateLastPerformed).toHaveBeenCalledWith(template.id);
  });
});
