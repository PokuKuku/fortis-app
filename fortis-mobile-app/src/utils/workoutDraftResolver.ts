import type { ExerciseWithSource } from '@/src/types/exercise';
import type { WorkoutDraftExercise, WorkoutDraftV1 } from '@/src/types/ai';
import { buildExerciseSearchIndex, searchExercisesWithScores } from '@/src/utils/exerciseSearch';
import { getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';

export type DraftResolutionReason = 'ambiguous' | 'missing';

export type DraftResolution = {
  exerciseIndex: number;
  query: string;
  candidates: ExerciseWithSource[];
  reason: DraftResolutionReason;
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

type DraftExerciseResolution = {
  status: 'resolved' | 'ambiguous' | 'missing';
  exercise?: ExerciseWithSource;
  candidates?: ExerciseWithSource[];
};

const resolveDraftExerciseQuery = (
  query: string,
  exercises: ExerciseWithSource[],
  searchIndex: ReturnType<typeof buildExerciseSearchIndex>
): DraftExerciseResolution => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return { status: 'missing' };
  }

  const canonicalMatches = exercises.filter((exercise) => {
    const canonicalKey = exercise.canonicalKey ? normalizeAlias(exercise.canonicalKey) : '';
    return canonicalKey && canonicalKey === normalizedQuery;
  });
  if (canonicalMatches.length === 1) {
    return { status: 'resolved', exercise: canonicalMatches[0] };
  }
  if (canonicalMatches.length > 1) {
    return { status: 'ambiguous', candidates: canonicalMatches.slice(0, 5) };
  }

  const exactMatches = exercises.filter((exercise) => {
    const normalizedName = normalizeAlias(exercise.normalizedName || exercise.name);
    return normalizedName === normalizedQuery;
  });
  if (exactMatches.length === 1) {
    return { status: 'resolved', exercise: exactMatches[0] };
  }
  if (exactMatches.length > 1) {
    return { status: 'ambiguous', candidates: exactMatches.slice(0, 5) };
  }

  const aliasMatches = exercises.filter((exercise) =>
    (exercise.aliases ?? []).some((alias) => normalizeAlias(alias) === normalizedQuery)
  );
  if (aliasMatches.length === 1) {
    return { status: 'resolved', exercise: aliasMatches[0] };
  }
  if (aliasMatches.length > 1) {
    return { status: 'ambiguous', candidates: aliasMatches.slice(0, 5) };
  }

  const scoredMatches = searchExercisesWithScores(normalizedQuery, searchIndex);
  if (scoredMatches.length === 0) {
    return { status: 'missing' };
  }

  const [top, second] = scoredMatches;
  const topScore = Math.min(top.score, 100) / 100;
  const secondScore = second ? Math.min(second.score, 100) / 100 : 0;

  if (topScore >= 0.92 && topScore - secondScore >= 0.08) {
    return { status: 'resolved', exercise: top.exercise };
  }

  return {
    status: 'ambiguous',
    candidates: scoredMatches.slice(0, 5).map((entry) => entry.exercise),
  };
};

export function resolveWorkoutDraftExercises(
  draft: WorkoutDraftV1,
  exercises: ExerciseWithSource[]
): { draft: WorkoutDraftV1; unresolved: DraftResolution[] } {
  const searchIndex = buildExerciseSearchIndex(exercises);
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const unresolved: DraftResolution[] = [];
  const updatedExercises: WorkoutDraftExercise[] = draft.exercises.map((exercise, index) => {
    if (exercise.resolved_exercise_id && exerciseMap.has(exercise.resolved_exercise_id)) {
      return exercise;
    }

    const resolution = resolveDraftExerciseQuery(exercise.query, exercises, searchIndex);
    if (resolution.status === 'resolved' && resolution.exercise) {
      return {
        ...exercise,
        resolved_exercise_id: resolution.exercise.id,
      };
    }

    unresolved.push({
      exerciseIndex: index,
      query: exercise.query,
      candidates: resolution.candidates ?? [],
      reason: resolution.status === 'missing' ? 'missing' : 'ambiguous',
    });

    return {
      ...exercise,
      resolved_exercise_id: null,
    };
  });

  return {
    draft: {
      ...draft,
      exercises: updatedExercises,
    },
    unresolved,
  };
}

const formatCandidateLabel = (exercise: ExerciseWithSource): string => {
  const equipment = exercise.equipment?.trim();
  const primary = exercise.primaryMuscles?.[0];
  const primaryLabel = primary ? getMuscleDisplayName(primary as MuscleKey) : '';
  const details = [equipment, primaryLabel].filter(Boolean).join(', ');
  return details ? `${exercise.name} (${details})` : exercise.name;
};

export function buildResolutionPrompt(resolution: DraftResolution): string {
  const { query, candidates, reason } = resolution;
  if (!candidates.length) {
    return `I couldn't find a match for "${query}". Reply with the exercise you want instead, or say cancel.`;
  }
  const options = candidates
    .map((candidate, index) => `${index + 1}. ${formatCandidateLabel(candidate)}`)
    .join('\n');
  const intro =
    reason === 'ambiguous'
      ? `I found multiple matches for "${query}". Reply with a number:`
      : `I found possible matches for "${query}". Reply with a number:`;
  return `${intro}\n${options}`;
}

export function buildDraftSummaryFallback(draft: WorkoutDraftV1): string {
  const exerciseLines = draft.exercises.slice(0, 5).map((exercise) => `- ${exercise.query}`);
  const extra = draft.exercises.length > 5 ? `\n+${draft.exercises.length - 5} more` : '';
  const summary = exerciseLines.length > 0 ? `\n${exerciseLines.join('\n')}${extra}` : '';
  return `${draft.title}${summary}\n\nReply yes to save, or tell me changes or cancel.`;
}
