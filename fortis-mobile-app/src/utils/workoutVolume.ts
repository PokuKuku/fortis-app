import type { WorkoutSession, WeightUnit } from '@/src/types/workout';

const LBS_TO_KG = 1 / 2.20462;
const KG_TO_LBS = 2.20462;

const resolveWeightUnit = (
  unit: WeightUnit | null | undefined,
  fallbackUnit: WeightUnit | undefined,
  preferredUnits: 'imperial' | 'metric'
): WeightUnit => {
  if (unit) return unit;
  if (fallbackUnit) return fallbackUnit;
  return preferredUnits === 'metric' ? 'kg' : 'lbs';
};

const normalizeWeight = (
  weight: number,
  unit: WeightUnit,
  preferredUnits: 'imperial' | 'metric'
): number => {
  if (preferredUnits === 'metric') {
    return unit === 'lbs' ? weight * LBS_TO_KG : weight;
  }
  return unit === 'kg' ? weight * KG_TO_LBS : weight;
};

export const getSessionVolume = (
  session: WorkoutSession,
  preferredUnits: 'imperial' | 'metric',
  weightUnits: Record<string, WeightUnit>
): number => {
  let total = 0;

  session.exercises.forEach((exercise) => {
    const fallbackUnit = weightUnits[exercise.exerciseId];
    exercise.sets.forEach((set) => {
      if (!set.isCompleted) return;
      if (set.weight == null || set.reps == null) return;
      if (set.weight <= 0 || set.reps <= 0) return;

      const resolvedUnit = resolveWeightUnit(set.weightUnit, fallbackUnit, preferredUnits);
      const normalizedWeight = normalizeWeight(set.weight, resolvedUnit, preferredUnits);
      total += normalizedWeight * set.reps;
    });
  });

  return total;
};
