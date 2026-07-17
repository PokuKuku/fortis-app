import { resolveActiveNumberPadSetUpdates } from '@/src/utils/activeWorkoutNumberPad';
import type { WorkoutExercise } from '@/src/types/workout';

const buildExercise = (sets: WorkoutExercise['sets']): WorkoutExercise => ({
  localId: 'exercise-1',
  exerciseId: 'bench',
  exerciseName: 'Bench Press',
  notes: '',
  orderIndex: 0,
  sets,
});

const buildSet = (
  localId: string,
  values: Partial<WorkoutExercise['sets'][number]> = {},
): WorkoutExercise['sets'][number] => ({
  localId,
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
  ...values,
});

describe('resolveActiveNumberPadSetUpdates', () => {
  it('uses the displayed suggested weight when saving reps on the first set', () => {
    const exercise = buildExercise([
      buildSet('set-1'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: { weight: 105, reps: 8 },
      inputType: 'reps',
      setLocalId: 'set-1',
      value: 10,
    })).toEqual({
      reps: 10,
      weight: 105,
    });
  });

  it('uses the displayed suggested reps when pressing next on an empty first set', () => {
    const exercise = buildExercise([
      buildSet('set-1'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: { weight: 105, reps: 8 },
      inputType: 'reps',
      setLocalId: 'set-1',
      value: null,
    })).toEqual({
      reps: 8,
      weight: 105,
    });
  });

  it('still defaults first-set weight to zero when no suggestion exists', () => {
    const exercise = buildExercise([
      buildSet('set-1'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputType: 'reps',
      setLocalId: 'set-1',
      value: 10,
    })).toEqual({
      reps: 10,
      weight: 0,
    });
  });

  it('commits the displayed placeholders instead of values from a preceding warm-up set', () => {
    const exercise = buildExercise([
      buildSet('warmup-1', {
        setType: 'warmup',
        weight: 70,
        reps: 4,
        isCompleted: true,
      }),
      buildSet('normal-1'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: { weight: 75, reps: 4 },
      inputType: 'reps',
      setLocalId: 'normal-1',
      value: null,
    })).toEqual({
      reps: 4,
      weight: 75,
    });
  });

  it('preserves an explicitly entered weight when completing through reps', () => {
    const exercise = buildExercise([
      buildSet('set-1', { weight: 80 }),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: { weight: 75, reps: 4 },
      inputType: 'reps',
      setLocalId: 'set-1',
      value: null,
    })).toEqual({
      reps: 4,
    });
  });

  it('returns null when reps cannot be resolved', () => {
    const exercise = buildExercise([
      buildSet('set-1'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputType: 'reps',
      setLocalId: 'set-1',
      value: null,
    })).toBeNull();
  });
});
