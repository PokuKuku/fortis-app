import type { ExerciseWithSource } from '@/src/types/exercise';

type ExerciseSearchEntry = {
  exercise: ExerciseWithSource;
  nameText: string;
  nameTokenSet: Set<string>;
  aliasTexts: string[];
  aliasTokenSet: Set<string>;
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

export function buildExerciseSearchIndex(exercises: ExerciseWithSource[]): ExerciseSearchIndex {
  const phrases = buildPhraseSet(exercises);

  const entries = exercises.map((exercise) => {
    const nameText = normalizeText(exercise.name);
    const nameTokens = tokenize(nameText);
    const nameTokenSet = new Set(nameTokens);

    const aliasTexts = new Set<string>();
    const slugText = exercise.slug ? normalizeText(exercise.slug) : '';
    const idText = exercise.id ? normalizeText(exercise.id) : '';
    if (slugText && slugText !== nameText) aliasTexts.add(slugText);
    if (idText && idText !== nameText) aliasTexts.add(idText);

    const instructionText = normalizeText((exercise.instructions ?? []).join(' '));
    if (instructionText) {
      const instructionTokens = tokenize(instructionText);
      extractInstructionAliases(instructionTokens, phrases).forEach((alias) => aliasTexts.add(alias));
    }

    const aliasTokenSet = new Set(
      Array.from(aliasTexts).flatMap((text) => tokenize(text))
    );

    const muscleText = normalizeText([
      ...(exercise.primaryMuscles ?? []),
      ...(exercise.secondaryMuscles ?? []),
    ].join(' '));
    const equipmentText = normalizeText(exercise.equipment ?? '');

    return {
      exercise,
      nameText,
      nameTokenSet,
      aliasTexts: Array.from(aliasTexts),
      aliasTokenSet,
      instructionText,
      muscleText,
      equipmentText,
    };
  });

  return { entries };
}

export function searchExercises(
  query: string,
  index: ExerciseSearchIndex,
  options: ExerciseSearchOptions = {}
): ExerciseWithSource[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return index.entries.map((entry) => entry.exercise);
  }

  const queryTokens = tokenize(normalizedQuery);
  if (queryTokens.length === 0) {
    return index.entries.map((entry) => entry.exercise);
  }

  const enableFuzzy = options.enableFuzzy ?? true;
  const includeInstructions = options.includeInstructions ?? true;
  const minFuzzyScore = options.minFuzzyScore ?? 0.55;

  const results: Array<{ exercise: ExerciseWithSource; score: number }> = [];

  index.entries.forEach((entry) => {
    let score = 0;

    const nameTokenMatch = hasAllTokens(queryTokens, entry.nameTokenSet);
    const aliasTokenMatch = hasAllTokens(queryTokens, entry.aliasTokenSet);

    if (nameTokenMatch) score = 100;
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
      entry.instructionText.includes(normalizedQuery)
    ) {
      score = Math.max(score, 75);
    }
    if (entry.muscleText.includes(normalizedQuery)) {
      score = Math.max(score, 60);
    }
    if (entry.equipmentText.includes(normalizedQuery)) {
      score = Math.max(score, 55);
    }

    if (enableFuzzy && normalizedQuery.length >= 3 && score < 90) {
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
      results.push({ exercise: entry.exercise, score });
    }
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.exercise.name.localeCompare(b.exercise.name);
  });

  return results.map((result) => result.exercise);
}
