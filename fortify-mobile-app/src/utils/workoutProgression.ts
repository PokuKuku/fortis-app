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

  const rangeMatch = normalized.match(/^(\d+)\s*[-–]\s*(\d+)$/);
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

export function buildRepRangeProgressionSuggestion(
  targetReps: string | null | undefined,
  setCount: number,
  previousSets: ProgressionSetInput[] | null | undefined
): ProgressionSuggestion | null {
  const range = parseRepRange(targetReps);
  if (!range || setCount < 1 || !previousSets?.length) return null;

  const normalSets = previousSets
    .filter((set) => (set.setType || 'normal') === 'normal')
    .slice(0, setCount);

  if (normalSets.length < setCount) return null;

  const hitTopRange = normalSets.every(
    (set) => set.reps !== null && set.reps !== undefined && set.reps >= range.max
  );
  if (!hitTopRange) return null;

  return {
    sets: normalSets.map((set) => {
      const unit = set.weightUnit ?? null;
      return {
        weight: set.weight === null || set.weight === undefined
          ? null
          : set.weight + getProgressionIncrement(unit),
        reps: range.min,
        weightUnit: unit,
        setType: 'normal',
      };
    }),
  };
}
