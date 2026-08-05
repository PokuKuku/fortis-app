import type { WorkoutExercise, WorkoutSet } from '@/src/types/workout';
import { getWorkoutSetInputSuggestion } from '@/src/utils/workoutSetInputSuggestion';

const set = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
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
  ...overrides,
});

const exercise: WorkoutExercise = {
  localId: 'exercise-1',
  exerciseId: 'bench-press',
  exerciseName: 'Bench Press',
  sets: [set()],
  targetReps: '8-12',
  notes: '',
  orderIndex: 0,
};

describe('getWorkoutSetInputSuggestion', () => {
  it('prefers the weight saved on the workout while retaining progressed reps', () => {
    expect(getWorkoutSetInputSuggestion({
      exercise,
      setIndex: 0,
      setType: 'normal',
      preferredWeightPerformance: {
        sets: [{ weight: 135, reps: 8, setType: 'normal' }],
      },
      suggestedPerformance: {
        sets: [{ weight: 125, reps: 10, setType: 'normal' }],
      },
    })).toEqual({ weight: 135, reps: 10 });
  });

  it('uses the saved per-set weight instead of copying the previous set weight', () => {
    const twoSetExercise = {
      ...exercise,
      sets: [set(), set({ localId: 'set-2', setNumber: 2, orderIndex: 1 })],
    };

    expect(getWorkoutSetInputSuggestion({
      exercise: twoSetExercise,
      previousSet: set({ weight: 100, reps: 10 }),
      setIndex: 1,
      setType: 'normal',
      preferredWeightPerformance: {
        sets: [
          { weight: 100, reps: 10, setType: 'normal' },
          { weight: 120, reps: 8, setType: 'normal' },
        ],
      },
    })).toEqual({ weight: 120, reps: 10 });
  });

  it('falls back to the normal history suggestion when no workout weight was saved', () => {
    expect(getWorkoutSetInputSuggestion({
      exercise,
      setIndex: 0,
      setType: 'normal',
      preferredWeightPerformance: {
        sets: [{ weight: null, reps: 8, setType: 'normal' }],
      },
      suggestedPerformance: {
        sets: [{ weight: 125, reps: 10, setType: 'normal' }],
      },
    })).toEqual({ weight: 125, reps: 10 });
  });
});
