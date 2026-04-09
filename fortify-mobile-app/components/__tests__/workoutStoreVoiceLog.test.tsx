import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';
import type { WorkoutVoiceInterpretation } from '@/src/types/workoutVoice';

describe('workout voice log apply', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
  });

  it('fills incomplete sets before appending new sets', () => {
    const activeSession: WorkoutSession = {
      localId: 'session-1',
      name: 'Push Day',
      notes: '',
      startedAt: new Date('2026-03-10T12:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'ex-bench',
          exerciseName: 'Bench Press',
          orderIndex: 0,
          notes: '',
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 185,
              weightUnit: 'lbs',
              reps: 5,
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
              weight: null,
              weightUnit: 'lbs',
              reps: null,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: 1,
            },
          ],
        },
      ],
      isSynced: false,
    };

    const interpretation: WorkoutVoiceInterpretation = {
      transcript: '3 sets of 225 for 5 reps',
      sets: 3,
      weight: 225,
      reps: 5,
      weightUnit: 'lbs',
      setType: 'normal',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: true,
      missingFields: [],
      confidence: 'high',
    };

    useWorkoutStore.setState({
      activeSession,
      isWorkoutActive: true,
      weightUnits: { 'ex-bench': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-1', interpretation);
    const updatedExercise = useWorkoutStore.getState().activeSession?.exercises[0];

    expect(result).toEqual({
      appliedSetLocalIds: expect.any(Array),
      addedSetCount: 2,
    });
    expect(updatedExercise?.sets).toHaveLength(4);
    expect(updatedExercise?.sets[0]).toMatchObject({
      localId: 'set-1',
      weight: 185,
      reps: 5,
      isCompleted: true,
    });
    expect(updatedExercise?.sets[1]).toMatchObject({
      localId: 'set-2',
      weight: 225,
      reps: 5,
      weightUnit: 'lbs',
      isCompleted: true,
    });
    expect(updatedExercise?.sets[2]).toMatchObject({
      weight: 225,
      reps: 5,
      weightUnit: 'lbs',
      isCompleted: true,
    });
    expect(updatedExercise?.sets[3]).toMatchObject({
      weight: 225,
      reps: 5,
      weightUnit: 'lbs',
      isCompleted: true,
    });
  });

  it('applies the spoken set type to every targeted set', () => {
    useWorkoutStore.setState({
      activeSession: {
        localId: 'session-3',
        name: 'Push Day',
        notes: '',
        startedAt: new Date('2026-03-10T12:00:00.000Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'exercise-3',
            exerciseId: 'ex-bench',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-1',
                setNumber: 1,
                setType: 'normal',
                weight: null,
                weightUnit: 'lbs',
                reps: null,
                rpe: null,
                restSeconds: null,
                notes: '',
                isCompleted: false,
                orderIndex: 0,
              },
            ],
          },
        ],
        isSynced: false,
      },
      isWorkoutActive: true,
      weightUnits: { 'ex-bench': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-3', {
      transcript: '3 warm up sets of 225 for 5 reps',
      sets: 3,
      weight: 225,
      reps: 5,
      weightUnit: 'lbs',
      setType: 'warmup',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: false,
      missingFields: [],
      confidence: 'high',
    });

    const updatedSets = useWorkoutStore.getState().activeSession?.exercises[0].sets ?? [];

    expect(result).toEqual({
      appliedSetLocalIds: expect.any(Array),
      addedSetCount: 2,
    });
    expect(updatedSets).toHaveLength(3);
    expect(updatedSets.every((set) => set.setType === 'warmup')).toBe(true);
    expect(updatedSets.every((set) => set.isCompleted)).toBe(true);
  });

  it('reuses an entered weight when only reps are spoken', () => {
    useWorkoutStore.setState({
      activeSession: {
        localId: 'session-4',
        name: 'Push Day',
        notes: '',
        startedAt: new Date('2026-03-10T12:00:00.000Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'exercise-4',
            exerciseId: 'ex-bench',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-1',
                setNumber: 1,
                setType: 'normal',
                weight: 225,
                weightUnit: 'lbs',
                reps: null,
                rpe: null,
                restSeconds: null,
                notes: '',
                isCompleted: false,
                orderIndex: 0,
              },
            ],
          },
        ],
        isSynced: false,
      },
      isWorkoutActive: true,
      weightUnits: { 'ex-bench': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-4', {
      transcript: '3 sets of 5 reps',
      sets: 3,
      weight: null,
      reps: 5,
      weightUnit: 'lbs',
      setType: 'normal',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: true,
      missingFields: ['weight'],
      confidence: 'medium',
    });

    const updatedSets = useWorkoutStore.getState().activeSession?.exercises[0].sets ?? [];

    expect(result).toEqual({
      appliedSetLocalIds: expect.any(Array),
      addedSetCount: 2,
    });
    expect(updatedSets).toHaveLength(3);
    expect(updatedSets.every((set) => set.weight === 225)).toBe(true);
    expect(updatedSets.every((set) => set.reps === 5)).toBe(true);
    expect(updatedSets.every((set) => set.isCompleted)).toBe(true);
  });

  it('reuses entered reps when only weight is spoken', () => {
    useWorkoutStore.setState({
      activeSession: {
        localId: 'session-5',
        name: 'Push Day',
        notes: '',
        startedAt: new Date('2026-03-10T12:00:00.000Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'exercise-5',
            exerciseId: 'ex-bench',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-1',
                setNumber: 1,
                setType: 'normal',
                weight: null,
                weightUnit: 'lbs',
                reps: 8,
                rpe: null,
                restSeconds: null,
                notes: '',
                isCompleted: false,
                orderIndex: 0,
              },
            ],
          },
        ],
        isSynced: false,
      },
      isWorkoutActive: true,
      weightUnits: { 'ex-bench': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-5', {
      transcript: '3 sets of 185',
      sets: 3,
      weight: 185,
      reps: null,
      weightUnit: 'lbs',
      setType: 'normal',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: true,
      missingFields: ['reps'],
      confidence: 'medium',
    });

    const updatedSets = useWorkoutStore.getState().activeSession?.exercises[0].sets ?? [];

    expect(result).toEqual({
      appliedSetLocalIds: expect.any(Array),
      addedSetCount: 2,
    });
    expect(updatedSets).toHaveLength(3);
    expect(updatedSets.every((set) => set.weight === 185)).toBe(true);
    expect(updatedSets.every((set) => set.reps === 8)).toBe(true);
    expect(updatedSets.every((set) => set.isCompleted)).toBe(true);
  });

  it('infers a single set when the current set already provides the missing field', () => {
    useWorkoutStore.setState({
      activeSession: {
        localId: 'session-6',
        name: 'Push Day',
        notes: '',
        startedAt: new Date('2026-03-10T12:00:00.000Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'exercise-6',
            exerciseId: 'ex-bench',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            notes: '',
            sets: [
              {
                localId: 'set-1',
                setNumber: 1,
                setType: 'normal',
                weight: 225,
                weightUnit: 'lbs',
                reps: null,
                rpe: null,
                restSeconds: null,
                notes: '',
                isCompleted: false,
                orderIndex: 0,
              },
            ],
          },
        ],
        isSynced: false,
      },
      isWorkoutActive: true,
      weightUnits: { 'ex-bench': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-6', {
      transcript: '5 reps',
      sets: null,
      weight: null,
      reps: 5,
      weightUnit: 'lbs',
      setType: 'normal',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: true,
      missingFields: ['sets', 'weight'],
      confidence: 'low',
    });

    const updatedSets = useWorkoutStore.getState().activeSession?.exercises[0].sets ?? [];

    expect(result).toEqual({
      appliedSetLocalIds: expect.any(Array),
      addedSetCount: 0,
    });
    expect(updatedSets).toHaveLength(1);
    expect(updatedSets[0]).toMatchObject({
      weight: 225,
      reps: 5,
      isCompleted: true,
    });
  });

  it('returns null when required voice fields are missing', () => {
    useWorkoutStore.setState({
      activeSession: {
        localId: 'session-2',
        name: 'Leg Day',
        notes: '',
        startedAt: new Date('2026-03-10T12:00:00.000Z'),
        completedAt: null,
        exercises: [
          {
            localId: 'exercise-2',
            exerciseId: 'ex-squat',
            exerciseName: 'Squat',
            orderIndex: 0,
            notes: '',
            sets: [],
          },
        ],
        isSynced: false,
      },
      isWorkoutActive: true,
      weightUnits: { 'ex-squat': 'lbs' },
    });

    const result = useWorkoutStore.getState().applyVoiceLog('exercise-2', {
      transcript: '3 sets of 225',
      sets: 3,
      weight: 225,
      reps: null,
      weightUnit: 'lbs',
      setType: 'normal',
      inferredSets: false,
      inferredWeightUnit: true,
      inferredSetType: true,
      missingFields: ['reps'],
      confidence: 'low',
    });

    expect(result).toBeNull();
    expect(useWorkoutStore.getState().activeSession?.exercises[0].sets).toHaveLength(0);
  });
});
