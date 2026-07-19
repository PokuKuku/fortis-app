import type { ExerciseWithSource } from '@/src/types/exercise';
import { getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';

type ExerciseSearchEntry = {
  exercise: ExerciseWithSource;
  nameText: string;
  nameTokens: string[];
  stemmedNameText: string;
  nameTokenSet: Set<string>;
  aliasTexts: string[];
  aliasTokenTexts: string[];
  aliasTokenSet: Set<string>;
  instructionAliasTokenTexts: string[];
  instructionText: string;
  muscleText: string;
  equipmentText: string;
};

export type ExerciseSearchIndex = {
  entries: ExerciseSearchEntry[];
};

export type ExerciseSearchOptions = {
  enableFuzzy?: boolean;
  includeInstructions?: boolean;
  minFuzzyScore?: number;
};

export type ExerciseSearchBuildOptions = {
  includeInstructions?: boolean;
};

type CachedExerciseSearchIndexes = {
  full?: ExerciseSearchIndex;
  lean?: ExerciseSearchIndex;
};

const exerciseSearchIndexCache = new WeakMap<
  ExerciseWithSource[],
  CachedExerciseSearchIndexes
>();

const CANONICAL_QUERY_BOOSTS: Array<{
  query: string;
  preferredNames: string[];
  exactPreferredScore: number;
  variantPreferredScore: number;
}> = [
  {
    query: 'deadlift',
    preferredNames: ['barbell deadlift'],
    exactPreferredScore: 150,
    variantPreferredScore: 142,
  },
  {
    query: 'squat',
    preferredNames: ['barbell full squat'],
    exactPreferredScore: 150,
    variantPreferredScore: 142,
  },
];

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

const PLURAL_OVERRIDES: Record<string, string> = {
  ups: 'up',
  downs: 'down',
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[_/]+/g, ' ')
    .replace(/[-–—]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemToken(token: string): string {
  if (PLURAL_OVERRIDES[token]) {
    return PLURAL_OVERRIDES[token];
  }
  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith('es') && token.length > 3) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .split(' ')
    .map((token) => stemToken(token.trim()))
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

function buildPhraseSet(exercises: ExerciseWithSource[]): Set<string> {
  const phrases = new Set<string>();
  exercises.forEach((exercise) => {
    const tokens = tokenize(normalizeText(exercise.name));
    for (let n = 2; n <= Math.min(3, tokens.length); n += 1) {
      for (let i = 0; i <= tokens.length - n; i += 1) {
        phrases.add(tokens.slice(i, i + n).join(' '));
      }
    }
  });
  return phrases;
}

function extractInstructionAliases(instructionTokens: string[], phrases: Set<string>): string[] {
  const aliases = new Set<string>();
  for (let n = 2; n <= Math.min(3, instructionTokens.length); n += 1) {
    for (let i = 0; i <= instructionTokens.length - n; i += 1) {
      const phrase = instructionTokens.slice(i, i + n).join(' ');
      if (phrases.has(phrase)) {
        aliases.add(phrase);
      }
    }
  }
  return Array.from(aliases);
}

function getBigrams(text: string): Map<string, number> {
  const normalized = text.replace(/\s+/g, '');
  const bigrams = new Map<string, number>();
  for (let i = 0; i < normalized.length - 1; i += 1) {
    const bigram = normalized.slice(i, i + 2);
    bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1);
  }
  return bigrams;
}

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  const trimmedA = a.replace(/\s+/g, '');
  const trimmedB = b.replace(/\s+/g, '');
  if (trimmedA.length < 2 || trimmedB.length < 2) return 0;

  const aBigrams = getBigrams(trimmedA);
  const bBigrams = getBigrams(trimmedB);
  let intersection = 0;

  aBigrams.forEach((countA, bigram) => {
    const countB = bBigrams.get(bigram);
    if (countB) {
      intersection += Math.min(countA, countB);
    }
  });

  const total = trimmedA.length - 1 + trimmedB.length - 1;
  return total === 0 ? 0 : (2 * intersection) / total;
}

function hasAllTokens(tokens: string[], tokenSet: Set<string>): boolean {
  if (tokens.length === 0) return false;
  return tokens.every((token) => tokenSet.has(token));
}

/**
 * Fuzzy matching is useful for typos, but a multi-word exercise query should
 * still share an exercise term with the candidate. Without this guard, string
 * similarity can surface unrelated movements (for example, squats for a rear
 * delt fly) in the closest-match picker.
 */
function hasFuzzyExerciseTermOverlap(queryTokens: string[], entry: ExerciseSearchEntry): boolean {
  if (queryTokens.length < 2) return true;

  return queryTokens.some(
    (token) => entry.nameTokenSet.has(token) || entry.aliasTokenSet.has(token)
  );
}

function getCanonicalIntentScore(queryTokens: string[], entry: ExerciseSearchEntry): number {
  if (queryTokens.length !== 1) return 0;

  const [queryToken] = queryTokens;
  const matchingBoost = CANONICAL_QUERY_BOOSTS.find((candidate) => candidate.query === queryToken);
  if (!matchingBoost) return 0;

  if (matchingBoost.preferredNames.some((preferredName) => entry.stemmedNameText === preferredName)) {
    return matchingBoost.exactPreferredScore;
  }

  if (matchingBoost.preferredNames.some((preferredName) => entry.stemmedNameText.startsWith(`${preferredName} `))) {
    return matchingBoost.variantPreferredScore;
  }

  return 0;
}

export function getCachedExerciseSearchIndex(
  exercises: ExerciseWithSource[],
  options: ExerciseSearchBuildOptions = {}
): ExerciseSearchIndex | null {
  const includeInstructions = options.includeInstructions ?? true;
  const cached = exerciseSearchIndexCache.get(exercises);
  return (includeInstructions ? cached?.full : cached?.lean) ?? null;
}

export function buildExerciseSearchIndex(
  exercises: ExerciseWithSource[],
  options: ExerciseSearchBuildOptions = {}
): ExerciseSearchIndex {
  const includeInstructions = options.includeInstructions ?? true;
  const cacheKey = includeInstructions ? 'full' : 'lean';
  const cached = exerciseSearchIndexCache.get(exercises)?.[cacheKey];
  if (cached) return cached;

  const phrases = includeInstructions ? buildPhraseSet(exercises) : new Set<string>();

  const entries = exercises.map((exercise) => {
    const nameText = normalizeText(exercise.name);
    const nameTokens = tokenize(nameText);
    const stemmedNameText = nameTokens.join(' ');
    const nameTokenSet = new Set(nameTokens);

    const aliasTexts = new Set<string>();
    const slugText = exercise.slug ? normalizeText(exercise.slug) : '';
    const idText = exercise.id ? normalizeText(exercise.id) : '';
    if (slugText && slugText !== nameText) aliasTexts.add(slugText);
    if (idText && idText !== nameText) aliasTexts.add(idText);
    (exercise.aliases ?? []).forEach((alias) => {
      const normalizedAlias = normalizeText(alias);
      if (normalizedAlias && normalizedAlias !== nameText) {
        aliasTexts.add(normalizedAlias);
      }
    });

    const aliasTokenTexts = Array.from(aliasTexts)
      .map((text) => tokenize(text).join(' '))
      .filter(Boolean);
    const aliasTokenSet = new Set(aliasTokenTexts.flatMap((text) => text.split(' ')));

    // Phrases found in instructions are discovery hints, not authoritative
    // aliases. Keeping them separate prevents copy such as "sit up straight"
    // from outranking an exercise whose actual name is "sit-up".
    const instructionText = includeInstructions
      ? normalizeText((exercise.instructions ?? []).join(' '))
      : '';
    const instructionAliasTokenTexts = instructionText
      ? extractInstructionAliases(tokenize(instructionText), phrases)
      : [];

    const muscleTokens = [
      ...(exercise.primaryMuscles ?? []),
      ...(exercise.secondaryMuscles ?? []),
    ];
    const muscleLabelText = muscleTokens
      .map((muscle) => getMuscleDisplayName(muscle as MuscleKey))
      .join(' ');
    const muscleText = normalizeText(
      [...muscleTokens, muscleLabelText].join(' ')
    );
    const equipmentText = normalizeText(exercise.equipment ?? '');

    return {
      exercise,
      nameText,
      nameTokens,
      stemmedNameText,
      nameTokenSet,
      aliasTexts: Array.from(aliasTexts),
      aliasTokenTexts,
      aliasTokenSet,
      instructionAliasTokenTexts,
      instructionText,
      muscleText,
      equipmentText,
    };
  });

  const index = { entries };
  const cachedIndexes = exerciseSearchIndexCache.get(exercises) ?? {};
  cachedIndexes[cacheKey] = index;
  exerciseSearchIndexCache.set(exercises, cachedIndexes);
  return index;
}

export function searchExercises(
  query: string,
  index: ExerciseSearchIndex,
  options: ExerciseSearchOptions = {}
): ExerciseWithSource[] {
  return searchExercisesWithScores(query, index, options).map((result) => result.exercise);
}

export function searchExercisesWithScores(
  query: string,
  index: ExerciseSearchIndex,
  options: ExerciseSearchOptions = {}
): Array<{ exercise: ExerciseWithSource; score: number }> {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return index.entries.map((entry) => ({ exercise: entry.exercise, score: 0 }));
  }

  const queryTokens = tokenize(normalizedQuery);
  const stemmedQuery = queryTokens.join(' ');
  if (queryTokens.length === 0) {
    return index.entries.map((entry) => ({ exercise: entry.exercise, score: 0 }));
  }

  const enableFuzzy = options.enableFuzzy ?? true;
  const includeInstructions = options.includeInstructions ?? true;
  const minFuzzyScore = options.minFuzzyScore ?? 0.55;

  const results: Array<{ exercise: ExerciseWithSource; score: number }> = [];

  index.entries.forEach((entry) => {
    let score = 0;

    const nameTokenMatch = hasAllTokens(queryTokens, entry.nameTokenSet);
    const aliasTokenMatch = hasAllTokens(queryTokens, entry.aliasTokenSet);
    const nameExtraTokenCount = Math.max(0, entry.nameTokens.length - queryTokens.length);
    const aliasExactStemmedMatch = entry.aliasTokenTexts.some((text) => text === stemmedQuery);
    const aliasPrefixStemmedMatch = entry.aliasTokenTexts.some((text) => text.startsWith(`${stemmedQuery} `));
    const instructionAliasMatch = entry.instructionAliasTokenTexts.some((text) => text === stemmedQuery);

    if (entry.stemmedNameText === stemmedQuery) {
      score = 140;
    } else if (aliasExactStemmedMatch) {
      score = 132;
    } else if (entry.stemmedNameText.startsWith(`${stemmedQuery} `)) {
      score = 116;
    } else if (aliasPrefixStemmedMatch) {
      score = 108;
    }

    if (nameTokenMatch) {
      score = Math.max(score, 100 - Math.min(nameExtraTokenCount, 8) * 3);
    }
    if (aliasTokenMatch) score = Math.max(score, 90);

    if (entry.nameText.includes(normalizedQuery)) {
      score += 10;
    }
    if (entry.aliasTexts.some((text) => text.includes(normalizedQuery))) {
      score += 8;
    }
    if (
      includeInstructions &&
      queryTokens.length >= 2 &&
      (entry.instructionText.includes(normalizedQuery) || instructionAliasMatch)
    ) {
      score = Math.max(score, 75);
    }
    if (entry.muscleText.includes(normalizedQuery)) {
      score = Math.max(score, 60);
    }
    if (entry.equipmentText.includes(normalizedQuery)) {
      score = Math.max(score, 55);
    }

    score = Math.max(score, getCanonicalIntentScore(queryTokens, entry));

    if (
      enableFuzzy
      && normalizedQuery.length >= 3
      && score < 90
      && hasFuzzyExerciseTermOverlap(queryTokens, entry)
    ) {
      let bestSimilarity = diceCoefficient(normalizedQuery, entry.nameText);
      entry.aliasTexts.forEach((alias) => {
        const similarity = diceCoefficient(normalizedQuery, alias);
        if (similarity > bestSimilarity) bestSimilarity = similarity;
      });
      if (bestSimilarity >= minFuzzyScore) {
        score = Math.max(score, 40 + bestSimilarity * 40);
      }
    }

    if (score > 0) {
      if (entry.exercise.isCurated && !entry.exercise.canonicalId) {
        score += 6;
      }
      results.push({ exercise: entry.exercise, score });
    }
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.exercise.name.localeCompare(b.exercise.name);
  });

  return results;
}
