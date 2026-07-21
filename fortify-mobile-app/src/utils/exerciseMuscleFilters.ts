import type { Exercise } from '@/src/types/exercise';
import {
  normalizeMuscleArray,
  type MuscleKey,
} from '@/src/utils/muscleTaxonomy';

// The exercise library historically labels all delt exercises as `delts`, which
// normalizes to side_delts. Use the exercise name to expose the more specific
// front-delt filter without changing the stored exercise taxonomy globally.
const FRONT_DELT_EXERCISE_PATTERN =
  /\b(?:front raise|shoulder press|overhead press|military press|arnold press|push press|landmine press|bradford press|handstand push(?:-?up)?|pike push(?:-?up)?)\b/i;

const REAR_DELT_EXERCISE_PATTERN =
  /\b(?:rear delt|rear deltoid|rear lateral raise|reverse (?:fly|flye|pec deck|butterfly)|face pull|incline y-?raise|shoulder external rotation)\b/i;

export function getExerciseMuscleFilterKeys(exercise: Exercise): MuscleKey[] {
  const muscles = normalizeMuscleArray(exercise.primaryMuscles ?? []);

  if (
    REAR_DELT_EXERCISE_PATTERN.test(exercise.name) &&
    !muscles.includes('rear_delts')
  ) {
    muscles.push('rear_delts');
  }

  if (
    muscles.includes('side_delts') &&
    FRONT_DELT_EXERCISE_PATTERN.test(exercise.name) &&
    !muscles.includes('front_delts')
  ) {
    muscles.push('front_delts');
  }

  return muscles;
}

export function exerciseMatchesMuscleFilters(
  exercise: Exercise,
  selectedMuscles: string[]
): boolean {
  if (selectedMuscles.length === 0) return true;

  const exerciseMuscles = getExerciseMuscleFilterKeys(exercise);
  return exerciseMuscles.some((muscle) => selectedMuscles.includes(muscle));
}
