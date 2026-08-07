export interface WorkoutCatalogCandidate {
  id: string;
  primaryMuscles: string[];
}

const WORKOUT_MUSCLE_ALIASES: Record<string, string> = {
  abdominal: 'abs',
  abdominals: 'abs',
  chest: 'pectorals',
  pec: 'pectorals',
  pecs: 'pectorals',
  pectoral: 'pectorals',
  quadriceps: 'quads',
  shoulder: 'delts',
  shoulders: 'delts',
  deltoid: 'delts',
  deltoids: 'delts',
  'front delts': 'delts',
  'side delts': 'delts',
  'rear delts': 'delts',
  oblique: 'abs',
  obliques: 'abs',
  'hip flexor': 'abs',
  'hip flexors': 'abs',
  'middle back': 'upper back',
  'lower back': 'spine',
};

export const normalizeWorkoutMuscle = (value: string | null | undefined): string => {
  const normalized = (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return WORKOUT_MUSCLE_ALIASES[normalized] ?? normalized;
};

export function selectBalancedWorkoutCatalog<T extends WorkoutCatalogCandidate>(
  rankedCandidates: T[],
  targetMuscles: string[],
  limit: number,
  minimumPerTarget?: number
): T[] {
  const selected = new Map<string, T>();
  const canonicalTargets = Array.from(new Set(targetMuscles.map(normalizeWorkoutMuscle)));
  const targetQuota = minimumPerTarget ?? Math.min(
    12,
    Math.max(4, Math.floor(limit / Math.max(1, canonicalTargets.length)))
  );

  if (canonicalTargets.length > 1) {
    canonicalTargets.forEach((target) => {
      rankedCandidates
        .filter((candidate) => (
          candidate.primaryMuscles.map(normalizeWorkoutMuscle).includes(target)
        ))
        .slice(0, targetQuota)
        .forEach((candidate) => {
          if (selected.size < limit) selected.set(candidate.id, candidate);
        });
    });
  }

  rankedCandidates.forEach((candidate) => {
    if (selected.size < limit) selected.set(candidate.id, candidate);
  });

  return Array.from(selected.values());
}
