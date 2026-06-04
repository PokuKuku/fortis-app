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

  it('uses the previous set when confirming an empty value after the first set', () => {
    const exercise = buildExercise([
      buildSet('set-1', { weight: 135, reps: 8, isCompleted: true }),
      buildSet('set-2'),
    ]);

    expect(resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: { weight: 150, reps: 10 },
      inputType: 'reps',
      setLocalId: 'set-2',
      value: null,
    })).toEqual({
      reps: 8,
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
