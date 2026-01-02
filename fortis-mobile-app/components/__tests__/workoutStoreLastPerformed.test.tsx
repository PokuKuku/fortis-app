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
    expect(updateLastPerformed).not.toHaveBeenCalled();
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
});
