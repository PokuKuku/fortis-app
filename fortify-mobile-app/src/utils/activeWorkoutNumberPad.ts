import type { WorkoutExercise } from '@/src/types/workout';
import type { SetValueSuggestion } from '@/src/utils/workoutSetSuggestions';

export type ActiveNumberPadSetUpdates = {
  reps?: number;
  weight?: number;
};

export function resolveActiveNumberPadSetUpdates(params: {
  exercise: WorkoutExercise | undefined;
  inputSuggestion?: SetValueSuggestion;
  inputType: 'weight' | 'reps';
  setLocalId: string;
  value: number | null;
}): ActiveNumberPadSetUpdates | null {
  const setIndex = params.exercise?.sets.findIndex((set) => set.localId === params.setLocalId) ?? -1;
  const set = setIndex >= 0 ? params.exercise?.sets[setIndex] : undefined;
  const previousSet = setIndex > 0 ? params.exercise?.sets[setIndex - 1] : undefined;

  let finalValue = params.value;
  if (finalValue === null && previousSet) {
    finalValue = previousSet[params.inputType];
  }
  if (finalValue === null) {
    finalValue = params.inputSuggestion?.[params.inputType] ?? null;
  }

  if (finalValue === null && params.inputType === 'weight') {
    finalValue = 0;
  }

  if (finalValue === null) {
    return null;
  }

  const updates: ActiveNumberPadSetUpdates = params.inputType === 'weight'
    ? { weight: finalValue }
    : { reps: finalValue };

  if (params.inputType === 'reps' && set?.weight === null && previousSet?.weight == null) {
    updates.weight = params.inputSuggestion?.weight ?? 0;
  }

  return updates;
}
