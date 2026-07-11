import type { SetType, WeightUnit } from '@/src/types/workout';

export interface RepRange {
  min: number;
  max: number;
}

export interface ProgressionSetInput {
  weight: number | null;
  reps: number | null;
  weightUnit?: WeightUnit | null;
  setType: SetType | string;
}

export interface ProgressionSuggestion {
  sets: Array<{
    weight: number | null;
    reps: number | null;
    weightUnit?: WeightUnit | null;
    setType: SetType;
  }>;
}

export const DEFAULT_TARGET_REPS = '8-12';

export function parseRepRange(reps: string | null | undefined): RepRange | null {
  if (!reps) return null;
  const normalized = reps.trim();
  if (!normalized) return null;

  const rangeMatch = normalized.match(/^(\d+)\s*(?:[-–]|to)\s*(\d+)$/i);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < 1) return null;
    return min <= max ? { min, max } : { min: max, max: min };
  }

  const exactMatch = normalized.match(/^(\d+)$/);
  if (exactMatch) {
    const value = Number(exactMatch[1]);
    if (!Number.isFinite(value) || value < 1) return null;
    return { min: value, max: value };
  }

  return null;
}

export function formatRepRange(min: number, max: number): string {
  const safeMin = Math.max(1, Math.round(min));
  const safeMax = Math.max(safeMin, Math.round(max));
  return safeMin === safeMax ? `${safeMin}` : `${safeMin}-${safeMax}`;
}

export function getProgressionIncrement(unit: WeightUnit | null | undefined): number {
  return unit === 'kg' ? 2.5 : 5;
}

function normalizeSetType(value: SetType | string | null | undefined): SetType {
  return value === 'warmup' || value === 'dropset' || value === 'failure'
    ? value
    : 'normal';
}

export function buildRepRangeProgressionSuggestion(
  targetReps: string | null | undefined,
  currentSets: number | ProgressionSetInput[],
  previousSets: ProgressionSetInput[] | null | undefined
): ProgressionSuggestion | null {
  const range = parseRepRange(targetReps);
  if (!range || !previousSets?.length) return null;

  const typeCounts = new Map<SetType, number>();
  const orderedTypes: SetType[] = [];

  if (typeof currentSets === 'number') {
    if (currentSets < 1) return null;
    typeCounts.set('normal', currentSets);
    orderedTypes.push('normal');
  } else {
    if (currentSets.length < 1) return null;
    currentSets.forEach((set) => {
      const type = normalizeSetType(set.setType);
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      if (!orderedTypes.includes(type)) {
        orderedTypes.push(type);
      }
    });
  }

  const suggestedSets: ProgressionSuggestion['sets'] = [];

  orderedTypes.forEach((type) => {
    const count = typeCounts.get(type) ?? 0;
    const previousSetsOfType = previousSets
      .filter((set) => normalizeSetType(set.setType) === type)
      .slice(0, count);

    if (previousSetsOfType.length < count) return;

    const hitTopRange = previousSetsOfType.every(
      (set) => set.reps !== null && set.reps !== undefined && set.reps >= range.max
    );

    if (!hitTopRange) {
      const firstSet = previousSetsOfType[0];
      if (firstSet.reps === null || firstSet.reps === undefined) return;
      suggestedSets.push({
        weight: firstSet.weight ?? null,
        reps: Math.min(firstSet.reps + 1, range.max),
        weightUnit: firstSet.weightUnit ?? null,
        setType: type,
      });
      return;
    }

    previousSetsOfType.forEach((set) => {
      const unit = set.weightUnit ?? null;
      suggestedSets.push({
        weight: set.weight === null || set.weight === undefined
          ? null
          : set.weight + getProgressionIncrement(unit),
        reps: range.min,
        weightUnit: unit,
        setType: type,
      });
    });
  });

  return suggestedSets.length > 0 ? { sets: suggestedSets } : null;
}
