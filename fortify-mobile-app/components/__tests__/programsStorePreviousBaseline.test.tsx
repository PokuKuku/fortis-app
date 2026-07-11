import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { Program, WorkoutSession } from '@/src/types/workout';

const now = '2026-07-11T12:00:00.000Z';

const template: Program = {
  id: 'local-template-push',
  name: 'Push',
  difficulty: 'intermediate',
  isPublic: false,
  isDefault: false,
  isAiCreated: false,
  isTemplate: true,
  lastPerformedAt: now,
  createdBy: 'local',
  createdAt: now,
  updatedAt: now,
  workouts: [{
    id: 'local-template-push-workout',
    name: 'Push',
    dayNumber: 1,
    exercises: [{
      id: 'template-bench',
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      sets: 2,
      reps: '8-12',
      restSeconds: 120,
      orderIndex: 0,
    }],
  }],
};

const program: Program = {
  ...template,
  id: 'local-program',
  name: 'PPL',
  isTemplate: false,
  workouts: [],
};

const completedSourceWorkout: WorkoutSession = {
  localId: 'source-session',
  name: 'Push',
  startedAt: new Date('2026-07-10T12:00:00.000Z'),
  completedAt: new Date('2026-07-10T13:00:00.000Z'),
  programId: template.id,
  programWorkoutId: template.workouts[0].id,
  exercises: [{
    localId: 'session-bench',
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    notes: '',
    orderIndex: 0,
    sets: [
      {
        localId: 'set-1',
        setNumber: 1,
        setType: 'warmup',
        weight: 95,
        reps: 10,
        rpe: null,
        restSeconds: null,
        notes: '',
        isCompleted: true,
        orderIndex: 0,
      },
      {
        localId: 'set-2',
        setNumber: 2,
        setType: 'normal',
        weight: 185,
        reps: 8,
        rpe: null,
        restSeconds: null,
        notes: '',
        isCompleted: true,
        orderIndex: 1,
      },
    ],
  }],
  isSynced: true,
};

describe('program workout source baseline', () => {
  afterEach(() => {
    useProgramsStore.getState().resetStore();
    useWorkoutStore.getState().resetStore();
  });

  it('keeps a new program workout id while snapshotting the source Previous column', async () => {
    useProgramsStore.setState({ programs: [template, program] });
    useWorkoutStore.setState({ completedSessions: [completedSourceWorkout] });

    const appended = await useProgramsStore.getState().appendTemplateToProgram(program.id, template.id);
    const copiedWorkout = useProgramsStore.getState().programs
      .find((entry) => entry.id === program.id)?.workouts[0];

    expect(appended).toBe(true);
    expect(copiedWorkout?.id).not.toBe(template.workouts[0].id);
    expect(copiedWorkout?.exercises[0].setDetails).toEqual([
      { weight: 95, reps: 10, setType: 'warmup' },
      { weight: 185, reps: 8, setType: 'normal' },
    ]);

    const started = await useWorkoutStore.getState().startWorkoutFromProgram(
      program.id,
      copiedWorkout!.id
    );
    const activeExercise = useWorkoutStore.getState().activeSession?.exercises[0];

    expect(started).toBe(true);
    expect(useWorkoutStore.getState().activeSession?.programWorkoutId).toBe(copiedWorkout?.id);
    expect(activeExercise?.baselinePerformance?.sets).toEqual([
      { weight: 95, weightUnit: 'lbs', reps: 10, setType: 'warmup' },
      { weight: 185, weightUnit: 'lbs', reps: 8, setType: 'normal' },
    ]);
  });

  it('recovers the source Previous column when an existing program has no copied baseline', async () => {
    const existingProgram: Program = {
      ...program,
      workouts: [{
        id: 'existing-program-push-workout',
        name: 'Push',
        dayNumber: 1,
        exercises: [{
          ...template.workouts[0].exercises[0],
          id: 'existing-program-bench',
          setDetails: undefined,
        }],
      }],
    };
    useProgramsStore.setState({ programs: [template, existingProgram] });
    useWorkoutStore.setState({ completedSessions: [completedSourceWorkout] });

    const started = await useWorkoutStore.getState().startWorkoutFromProgram(
      existingProgram.id,
      existingProgram.workouts[0].id
    );
    const activeExercise = useWorkoutStore.getState().activeSession?.exercises[0];

    expect(started).toBe(true);
    expect(activeExercise?.sets.map((set) => set.setType)).toEqual(['warmup', 'normal']);
    expect(activeExercise?.baselinePerformance?.sets).toEqual([
      { weight: 95, weightUnit: 'lbs', reps: 10, setType: 'warmup' },
      { weight: 185, weightUnit: 'lbs', reps: 8, setType: 'normal' },
    ]);
  });
});
