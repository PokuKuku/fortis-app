import type { SetType, WeightUnit, WorkoutExercise, WorkoutSet } from '@/src/types/workout';
import { mergeSetValueSuggestion, type SetValueSuggestion } from '@/src/utils/workoutSetSuggestions';

type SetPerformanceSource = {
  sets: Array<{
    weight: number | null;
    weightUnit?: WeightUnit | null;
    reps: number | null;
    setType: SetType | string;
  }>;
} | null | undefined;

export function getWorkoutSetInputSuggestion(params: {
  exercise: WorkoutExercise;
  previousSet?: WorkoutSet;
  setIndex: number;
  setType: SetType;
  suggestedPerformance?: SetPerformanceSource;
  fallbackPerformance?: SetPerformanceSource;
  secondaryFallbackPerformance?: SetPerformanceSource;
}): SetValueSuggestion | undefined {
  const typeIndex = params.exercise.sets
    .slice(0, params.setIndex)
    .filter((set) => set.setType === params.setType)
    .length;
  const suggestedSet = params.suggestedPerformance?.sets
    ?.filter((set) => set.setType === params.setType)[typeIndex]
    ?? params.fallbackPerformance?.sets
      ?.filter((set) => set.setType === params.setType)[typeIndex]
    ?? params.secondaryFallbackPerformance?.sets
      ?.filter((set) => set.setType === params.setType)[typeIndex];

  return mergeSetValueSuggestion(params.previousSet, suggestedSet, params.setType);
}
