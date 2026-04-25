import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Program, WorkoutSession } from '@/src/types/workout';

const buildTemplate = (): Program => {
  const now = new Date().toISOString();
  return {
    id: 'local-template-1',
    name: 'Leg Day',
    description: undefined,
    difficulty: 'intermediate',
    goal: undefined,
    durationWeeks: undefined,
    isPublic: false,
    isDefault: false,
    isAiCreated: false,
    isTemplate: true,
    lastPerformedAt: null,
    createdBy: 'local',
    createdAt: now,
    updatedAt: now,
    workouts: [
      {
        id: 'local-template-1-workout',
        name: 'Leg Day',
        dayNumber: 1,
        exercises: [
          {
            id: 'local-template-1-ex-1',
            exerciseId: 'ex-squat',
            exerciseName: 'Squat',
            sets: 3,
            reps: '5',
            restSeconds: 120,
            notes: '',
            orderIndex: 1,
            setDetails: [
              { weight: 100, reps: 5 },
              { weight: 105, reps: 5 },
              { weight: 110, reps: 5 },
            ],
          },
          {
            id: 'local-template-1-ex-0',
            exerciseId: 'ex-lunge',
            exerciseName: 'Lunge',
            sets: 2,
            reps: '8',
            restSeconds: 90,
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
  };
};

describe('workout editor store', () => {
  const originalCreate = useProgramsStore.getState().createWorkoutTemplate;
  const originalUpdate = useProgramsStore.getState().updateWorkoutTemplate;

  afterEach(() => {
    useProgramsStore.setState({
      createWorkoutTemplate: originalCreate,
      updateWorkoutTemplate: originalUpdate,
    });
    useProgramsStore.getState().resetStore();
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('initializes editor from template with set details', async () => {
    const template = buildTemplate();
    useProgramsStore.setState({ programs: [template] });

    const result = await useWorkoutStore.getState().initEditorSessionFromTemplate(template.id);

    expect(result).toBe(true);
    const session = useWorkoutStore.getState().editorSession;
    expect(session?.name).toBe('Leg Day');
    expect(session?.exercises).toHaveLength(2);
    expect(session?.exercises[0].exerciseName).toBe('Lunge');
    expect(session?.exercises[0].sets).toHaveLength(2);
    expect(session?.exercises[1].exerciseName).toBe('Squat');
    expect(session?.exercises[1].sets).toHaveLength(3);
    expect(session?.exercises[1].sets[1].weight).toBe(105);
    expect(session?.exercises[1].sets[1].reps).toBe(5);
  });

  it('saves edited templates via updateWorkoutTemplate', async () => {
    const editorSession: WorkoutSession = {
      localId: 'session-1',
      name: 'Upper Body ',
      notes: '',
      startedAt: new Date('2024-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'ex-bench',
          exerciseName: 'Bench Press',
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 100,
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: 0,
            },
          ],
          notes: '',
          orderIndex: 0,
        },
      ],
      isSynced: false,
    };

    const updateWorkoutTemplate = jest.fn().mockResolvedValue('template-123');
    const createWorkoutTemplate = jest.fn().mockResolvedValue('template-new');

    useProgramsStore.setState({
      updateWorkoutTemplate: updateWorkoutTemplate as any,
      createWorkoutTemplate: createWorkoutTemplate as any,
    });
    useWorkoutStore.setState({ editorSession });

    const result = await useWorkoutStore.getState().saveEditorAsTemplate('template-123');

    expect(createWorkoutTemplate).not.toHaveBeenCalled();
    expect(updateWorkoutTemplate).toHaveBeenCalledTimes(1);
    const [templateId, name, exercises] = updateWorkoutTemplate.mock.calls[0];
    expect(templateId).toBe('template-123');
    expect(name).toBe('Upper Body');
    expect(exercises).toHaveLength(1);
    expect(exercises[0].exerciseId).toBe('ex-bench');
    expect(exercises[0].setDetails).toEqual([{ weight: 100, reps: 8 }]);
    expect(result).toBe('template-123');
  });

  it('reorders editor exercises and reindexes order', () => {
    const editorSession: WorkoutSession = {
      localId: 'session-1',
      name: 'Upper Body',
      notes: '',
      startedAt: new Date('2024-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'ex-bench',
          exerciseName: 'Bench Press',
          sets: [],
          notes: '',
          orderIndex: 0,
        },
        {
          localId: 'exercise-2',
          exerciseId: 'ex-row',
          exerciseName: 'Row',
          sets: [],
          notes: '',
          orderIndex: 1,
        },
        {
          localId: 'exercise-3',
          exerciseId: 'ex-curl',
          exerciseName: 'Curl',
          sets: [],
          notes: '',
          orderIndex: 2,
        },
      ],
      isSynced: false,
    };

    useWorkoutStore.setState({ editorSession });

    useWorkoutStore.getState().reorderEditorExercises(2, 0);

    const updatedExercises = useWorkoutStore.getState().editorSession?.exercises ?? [];
    expect(updatedExercises.map((exercise) => exercise.exerciseName)).toEqual([
      'Curl',
      'Bench Press',
      'Row',
    ]);
    expect(updatedExercises.map((exercise) => exercise.orderIndex)).toEqual([0, 1, 2]);
  });
});
