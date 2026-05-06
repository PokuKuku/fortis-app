import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';

describe('workout number pad auto-save', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
  });

  it('saves pending values when switching inputs in an active session', () => {
    const activeSession: WorkoutSession = {
      localId: 'session-1',
      name: 'Upper 1',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
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
              weight: null,
              reps: null,
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

    useWorkoutStore.setState({
      activeSession,
      isWorkoutActive: true,
      activeNumberPad: {
        exerciseLocalId: 'exercise-1',
        setLocalId: 'set-1',
        inputType: 'weight',
        pendingValue: '135',
        hasError: false,
      },
    });

    useWorkoutStore.getState().openNumberPad('exercise-1', 'set-1', 'reps');

    const updatedSession = useWorkoutStore.getState().activeSession;
    expect(updatedSession?.exercises[0].sets[0].weight).toBe(135);
    expect(useWorkoutStore.getState().activeNumberPad?.inputType).toBe('reps');
    expect(useWorkoutStore.getState().activeNumberPad?.pendingValue).toBe('');
  });

  it('saves pending values when switching inputs in the editor session', () => {
    const editorSession: WorkoutSession = {
      localId: 'session-2',
      name: 'Template',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
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
              weight: null,
              reps: null,
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

    useWorkoutStore.setState({
      editorSession,
      activeNumberPad: {
        exerciseLocalId: 'exercise-2',
        setLocalId: 'set-2',
        inputType: 'weight',
        pendingValue: '95',
        hasError: false,
      },
    });

    useWorkoutStore.getState().openEditorNumberPad('exercise-2', 'set-2', 'reps');

    const updatedSession = useWorkoutStore.getState().editorSession;
    expect(updatedSession?.exercises[0].sets[0].weight).toBe(95);
    expect(useWorkoutStore.getState().activeNumberPad?.inputType).toBe('reps');
    expect(useWorkoutStore.getState().activeNumberPad?.pendingValue).toBe('');
  });

  it('updates active exercise target and resizes sets', () => {
    const activeSession: WorkoutSession = {
      localId: 'session-3',
      name: 'Upper 1',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-3',
          exerciseId: 'ex-3',
          exerciseName: 'Incline Press',
          targetReps: '8-12',
          sets: [
            {
              localId: 'set-3',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              reps: null,
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

    useWorkoutStore.setState({
      activeSession,
      isWorkoutActive: true,
      weightUnits: { 'ex-3': 'lbs' },
    });

    useWorkoutStore.getState().updateExerciseTarget('exercise-3', {
      sets: 4,
      minReps: 6,
      maxReps: 10,
    });

    const updatedExercise = useWorkoutStore.getState().activeSession?.exercises[0];
    expect(updatedExercise?.targetReps).toBe('6-10');
    expect(updatedExercise?.sets).toHaveLength(4);
    expect(updatedExercise?.sets.map((set) => set.setNumber)).toEqual([1, 2, 3, 4]);
    expect(updatedExercise?.sets.map((set) => set.orderIndex)).toEqual([0, 1, 2, 3]);
  });
});
