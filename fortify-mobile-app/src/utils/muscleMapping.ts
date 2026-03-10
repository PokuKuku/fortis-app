import { normalizeMuscle, normalizeMuscleArray as normalizeMuscleArrayCanonical } from '@/src/utils/muscleTaxonomy';

/**
 * Backwards-compatible wrapper for canonical muscle normalization.
 * Returns the canonical key string when recognized, otherwise an empty string.
 */
export function normalizeMuscleName(muscle: string): string {
  return normalizeMuscle(muscle) ?? '';
}

/**
 * Normalizes an array of muscle names into canonical keys.
 */
export function normalizeMuscleArray(muscles: string[]): string[] {
  return normalizeMuscleArrayCanonical(muscles);
}
