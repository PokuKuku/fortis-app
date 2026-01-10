import type { ExerciseWithSource } from '@/src/types/exercise';
import type {
  WorkoutProposalExercise,
  WorkoutProposalSet,
  WorkoutProposalV1,
} from '@/src/types/ai';
import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';

export type ProposalResolutionStatus = 'resolved' | 'ambiguous' | 'missing';

export type ProposalExerciseResolution = {
  query: string;
  status: ProposalResolutionStatus;
  exercise?: ExerciseWithSource;
  candidates?: ExerciseWithSource[];
};

const normalizeQuery = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeAlias = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const buildRepRange = (set: WorkoutProposalSet): string | null => {
  const min = set.reps_min;
  const max = set.reps_max;
  if (min && max && min !== max) return `${min}-${max}`;
  if (min || max) return String(max ?? min ?? '');
  return null;
};

const buildSetSummary = (sets: WorkoutProposalSet[]): string | null => {
  const summaries = sets.map((entry) => {
    const range = buildRepRange(entry);
    const parts = [`${entry.sets} sets`];
    if (range) parts.push(`${range} reps`);
    if (entry.rir !== undefined) parts.push(`RIR ${entry.rir}`);
    if (entry.rest_sec !== undefined) parts.push(`${entry.rest_sec}s rest`);
    if (entry.kind) parts.push(entry.kind);
    return parts.join(' / ');
  });

  return summaries.length > 1 ? summaries.join(' | ') : summaries[0] ?? null;
};

export function resolveExerciseQuery(
  query: string,
  exercises: ExerciseWithSource[]
): ProposalExerciseResolution {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return { query, status: 'missing' };
  }

  const canonicalMatches = exercises.filter((exercise) => {
    const canonicalKey = exercise.canonicalKey ? normalizeAlias(exercise.canonicalKey) : '';
    return canonicalKey && canonicalKey === normalizedQuery;
  });

  if (canonicalMatches.length === 1) {
    return { query, status: 'resolved', exercise: canonicalMatches[0] };
  }
  if (canonicalMatches.length > 1) {
    return { query, status: 'ambiguous', candidates: canonicalMatches.slice(0, 6) };
  }

  const exactMatches = exercises.filter((exercise) => {
    const normalizedName = normalizeAlias(exercise.normalizedName || exercise.name);
    return normalizedName === normalizedQuery;
  });
  if (exactMatches.length === 1) {
    return { query, status: 'resolved', exercise: exactMatches[0] };
  }
  if (exactMatches.length > 1) {
    return { query, status: 'ambiguous', candidates: exactMatches.slice(0, 6) };
  }

  const aliasMatches = exercises.filter((exercise) => {
    return (exercise.aliases ?? []).some((alias) => normalizeAlias(alias) === normalizedQuery);
  });
  if (aliasMatches.length === 1) {
    return { query, status: 'resolved', exercise: aliasMatches[0] };
  }
  if (aliasMatches.length > 1) {
    return { query, status: 'ambiguous', candidates: aliasMatches.slice(0, 6) };
  }

  const searchIndex = buildExerciseSearchIndex(exercises);
  const fuzzyMatches = searchExercises(normalizedQuery, searchIndex);
  if (fuzzyMatches.length === 0) {
    return { query, status: 'missing' };
  }
  if (fuzzyMatches.length === 1) {
    return { query, status: 'resolved', exercise: fuzzyMatches[0] };
  }

  return {
    query,
    status: 'ambiguous',
    candidates: fuzzyMatches.slice(0, 6),
  };
}

export function buildTemplateExercisesFromProposal(
  proposal: WorkoutProposalV1,
  resolutions: ProposalExerciseResolution[]
): Array<{
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}> {
  return proposal.exercises.map((exercise, index) => {
    const resolution = resolutions[index];
    if (!resolution || resolution.status !== 'resolved' || !resolution.exercise) {
      throw new Error(`Exercise "${exercise.exercise_query}" is not resolved`);
    }

    const totalSets = exercise.sets.reduce((sum, entry) => sum + entry.sets, 0);
    const primarySet = exercise.sets.find((entry) => buildRepRange(entry));
    const reps = buildRepRange(primarySet ?? exercise.sets[0]) ?? '8-12';
    const restSeconds = exercise.sets.find((entry) => entry.rest_sec !== undefined)?.rest_sec;
    const setSummary = buildSetSummary(exercise.sets);
    const notes = [exercise.notes, setSummary ? `Prescription: ${setSummary}` : null]
      .filter(Boolean)
      .join('\n');

    return {
      exerciseId: resolution.exercise.id,
      exerciseName: resolution.exercise.name,
      sets: totalSets > 0 ? totalSets : 1,
      reps,
      restSeconds,
      notes: notes || undefined,
    };
  });
}

export function getExercisePreviewNames(exercises: WorkoutProposalExercise[], limit = 5): string[] {
  return exercises.slice(0, limit).map((exercise) => exercise.exercise_query);
}
