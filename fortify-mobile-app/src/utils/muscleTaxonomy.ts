import type { WorkoutSession, WeightUnit } from '@/src/types/workout';
import type { Exercise } from '@/src/types/exercise';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';

export type MuscleKey =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'lats'
  | 'upper_back'
  | 'lower_back'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'adductors'
  | 'abductors';

export type HeatmapSide = 'front' | 'back' | 'both';

export type HeatmapRegion = {
  slug: string;
  side?: HeatmapSide;
};

export type MuscleTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export const MUSCLE_KEYS: MuscleKey[] = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'triceps',
  'biceps',
  'forearms',
  'lats',
  'upper_back',
  'lower_back',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'adductors',
  'abductors',
];

// Inventory check (exercises-export + curated): adductors/abductors appear ~10x each.
// Treat as inactive for v1 until they show up at meaningful frequency.
const INCLUDE_ADDUCTORS = false;
const INCLUDE_ABDUCTORS = false;

export const ACTIVE_MUSCLE_KEYS: MuscleKey[] = MUSCLE_KEYS.filter((key) => {
  if (key === 'adductors') return INCLUDE_ADDUCTORS;
  if (key === 'abductors') return INCLUDE_ABDUCTORS;
  return true;
});

export const MUSCLE_DISPLAY: Record<MuscleKey, string> = {
  chest: 'Chest',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  lats: 'Lats',
  upper_back: 'Upper Back',
  lower_back: 'Lower Back',
  abs: 'Abs',
  obliques: 'Obliques',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
};

export const MUSCLE_TO_HEATMAP_REGIONS: Record<MuscleKey, HeatmapRegion[]> = {
  chest: [{ slug: 'chest', side: 'front' }],
  front_delts: [{ slug: 'deltoids', side: 'both' }],
  side_delts: [{ slug: 'deltoids', side: 'both' }],
  rear_delts: [{ slug: 'deltoids', side: 'both' }],
  triceps: [{ slug: 'triceps', side: 'both' }],
  biceps: [{ slug: 'biceps', side: 'front' }],
  forearms: [{ slug: 'forearm', side: 'both' }],
  lats: [{ slug: 'upper-back', side: 'back' }],
  upper_back: [
    { slug: 'trapezius', side: 'back' },
    { slug: 'deltoids', side: 'front' },
  ],
  lower_back: [{ slug: 'lower-back', side: 'back' }],
  abs: [{ slug: 'abs', side: 'front' }],
  obliques: [{ slug: 'obliques', side: 'front' }],
  glutes: [{ slug: 'gluteal', side: 'back' }],
  quads: [{ slug: 'quadriceps', side: 'front' }],
  hamstrings: [{ slug: 'hamstring', side: 'back' }],
  calves: [{ slug: 'calves', side: 'both' }],
  adductors: [{ slug: 'adductors', side: 'both' }],
  abductors: [{ slug: 'gluteal', side: 'back' }],
};

const EXCLUDED_MUSCLES = new Set([
  'cardiovascular system',
  'neck',
  'sternocleidomastoid',
]);

const MUSCLE_ALIASES: Record<string, MuscleKey> = {
  // Chest
  'chest': 'chest',
  'pectorals': 'chest',
  'pectoral': 'chest',
  'pec': 'chest',
  'pecs': 'chest',
  'upper chest': 'chest',
  'lower chest': 'chest',
  'serratus anterior': 'chest',

  // Delts / shoulders
  'shoulders': 'side_delts',
  'delts': 'side_delts',
  'deltoids': 'side_delts',
  'side delts': 'side_delts',
  'lateral deltoid': 'side_delts',
  'lateral delts': 'side_delts',
  'front delts': 'front_delts',
  'front deltoids': 'front_delts',
  'anterior deltoid': 'front_delts',
  'rear delts': 'rear_delts',
  'rear deltoids': 'rear_delts',
  'posterior deltoid': 'rear_delts',
  'rotator cuff': 'rear_delts',

  // Arms
  'biceps': 'biceps',
  'bicep': 'biceps',
  'biceps brachii': 'biceps',
  'brachialis': 'biceps',
  'triceps': 'triceps',
  'tricep': 'triceps',
  'triceps brachii': 'triceps',
  'forearm': 'forearms',
  'forearms': 'forearms',
  'wrist flexors': 'forearms',
  'wrist extensors': 'forearms',
  'wrists': 'forearms',
  'hands': 'forearms',
  'grip muscles': 'forearms',

  // Back
  'back': 'upper_back',
  'upper back': 'upper_back',
  'middle back': 'upper_back',
  'mid back': 'upper_back',
  'rhomboids': 'upper_back',
  'traps': 'upper_back',
  'trapezius': 'upper_back',
  'levator scapulae': 'upper_back',
  'lats': 'lats',
  'latissimus dorsi': 'lats',
  'lower back': 'lower_back',
  'erector spinae': 'lower_back',
  'spine': 'lower_back',

  // Core
  'abs': 'abs',
  'abdominals': 'abs',
  'abdominal': 'abs',
  'core': 'abs',
  'hip flexors': 'abs',
  'lower abs': 'abs',
  'obliques': 'obliques',
  'oblique': 'obliques',

  // Legs
  'glutes': 'glutes',
  'gluteus': 'glutes',
  'gluteus maximus': 'glutes',
  'gluteus medius': 'glutes',
  'gluteus minimus': 'glutes',
  'quads': 'quads',
  'quadriceps': 'quads',
  'hamstrings': 'hamstrings',
  'hamstring': 'hamstrings',
  'calves': 'calves',
  'calf': 'calves',
  'soleus': 'calves',
  'tibialis anterior': 'calves',
  'shins': 'calves',
  'ankles': 'calves',
  'ankle stabilizers': 'calves',
  'adductors': 'adductors',
  'adductor': 'adductors',
  'inner thighs': 'adductors',
  'groin': 'adductors',
  'abductors': 'abductors',
  'abductor': 'abductors',
};

const KEYWORD_RULES: Array<[RegExp, MuscleKey]> = [
  [/\bpectoral|\bpec\b/i, 'chest'],
  [/\bdeltoid|\bdelt\b|\bshoulder/i, 'side_delts'],
  [/\banterior deltoid|\bfront delt/i, 'front_delts'],
  [/\bposterior deltoid|\brear delt/i, 'rear_delts'],
  [/\btricep/i, 'triceps'],
  [/\bbicep/i, 'biceps'],
  [/\bforearm|\bbrachioradialis|\bwrist|\bgrip/i, 'forearms'],
  [/\bquad|\bquadricep/i, 'quads'],
  [/\bhamstring/i, 'hamstrings'],
  [/\bglute/i, 'glutes'],
  [/\bcalf|\bsoleus|\btibialis|\bshin/i, 'calves'],
  [/\boblique/i, 'obliques'],
  [/\babs|\babdom|\bcore|\bhip flexor/i, 'abs'],
  [/\badductor|\binner thigh|\bgroin/i, 'adductors'],
  [/\babductor/i, 'abductors'],
  [/\btrapezius|\btrap\b|\brhomboid/i, 'upper_back'],
  [/\blat(s|issimus)?\b/i, 'lats'],
  [/\bupper back|\bmid back|\bmiddle back/i, 'upper_back'],
  [/\blower back|\berector/i, 'lower_back'],
  [/\bback\b/i, 'upper_back'],
];

const normalizeInput = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function normalizeMuscle(input: string): MuscleKey | null {
  if (!input) return null;
  const normalized = normalizeInput(input);
  if (!normalized || EXCLUDED_MUSCLES.has(normalized)) return null;

  const alias = MUSCLE_ALIASES[normalized];
  if (alias) {
    return ACTIVE_MUSCLE_KEYS.includes(alias) ? alias : null;
  }

  const keyCandidate = normalized.replace(/\s+/g, '_') as MuscleKey;
  if (MUSCLE_KEYS.includes(keyCandidate)) {
    return ACTIVE_MUSCLE_KEYS.includes(keyCandidate) ? keyCandidate : null;
  }

  const rule = KEYWORD_RULES.find(([pattern]) => pattern.test(normalized));
  if (!rule) return null;
  return ACTIVE_MUSCLE_KEYS.includes(rule[1]) ? rule[1] : null;
}

export function normalizeMuscleArray(muscles: string[]): MuscleKey[] {
  if (!muscles || !Array.isArray(muscles)) return [];
  const normalized: MuscleKey[] = [];
  muscles.forEach((muscle) => {
    const key = normalizeMuscle(muscle);
    if (!key) return;
    if (!normalized.includes(key)) normalized.push(key);
  });
  return normalized;
}

export function getMuscleDisplayName(muscle: MuscleKey): string {
  return MUSCLE_DISPLAY[muscle] ?? muscle;
}

export type MuscleCategory = 'push' | 'pull' | 'legs' | 'core' | 'other';

const MUSCLE_CATEGORY: Record<MuscleKey, MuscleCategory> = {
  chest: 'push',
  front_delts: 'push',
  side_delts: 'push',
  rear_delts: 'pull',
  triceps: 'push',
  biceps: 'pull',
  forearms: 'pull',
  lats: 'pull',
  upper_back: 'pull',
  lower_back: 'pull',
  abs: 'core',
  obliques: 'core',
  glutes: 'legs',
  quads: 'legs',
  hamstrings: 'legs',
  calves: 'legs',
  adductors: 'legs',
  abductors: 'legs',
};

export function getMuscleCategory(muscle: MuscleKey): MuscleCategory {
  return MUSCLE_CATEGORY[muscle] ?? 'other';
}

export function resolveMuscleTargetKeys(input: string): MuscleKey[] {
  const normalized = normalizeInput(input);
  if (!normalized) return [];
  if (normalized === 'back') return ['upper_back', 'lower_back', 'lats'];
  if (normalized === 'shoulders' || normalized === 'delts' || normalized === 'deltoids') {
    return ['front_delts', 'side_delts', 'rear_delts'];
  }
  if (normalized === 'core' || normalized === 'abs' || normalized === 'abdominals') {
    return ['abs', 'obliques'];
  }
  if (normalized === 'legs' || normalized === 'lower body') {
    return (['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] as MuscleKey[])
      .filter((key) => ACTIVE_MUSCLE_KEYS.includes(key));
  }
  const key = normalizeMuscle(input);
  return key ? [key] : [];
}

type AttributionOptions = {
  bodyweightKg?: number | null;
  profileWeightKg?: number | null;
  preferredUnits?: 'imperial' | 'metric';
  weightUnitByExercise?: Record<string, WeightUnit>;
};

export const WEEKLY_MUSCLE_TIER_THRESHOLDS = {
  e: 0.5,
  d: 3,
  c: 5,
  b: 9,
  a: 13,
  s: 18,
} as const;

export const WEEKLY_MUSCLE_TIER_COLORS: Record<MuscleTier, string> = {
  S: '#F67B7D',
  A: '#F6C07A',
  B: '#F2E57A',
  C: '#9AF06C',
  D: '#7DBBFF',
  E: '#8B7CFF',
};

const resolveExerciseMuscles = (
  exercise: Exercise,
  exerciseName: string
): { primary: MuscleKey[]; secondary: MuscleKey[] } => {
  const primary = normalizeMuscleArray(exercise.primaryMuscles || []);
  const secondary = normalizeMuscleArray(exercise.secondaryMuscles || []);
  const fallbackMuscles: MuscleKey[] =
    primary.length === 0 && secondary.length === 0
      ? normalizeMuscleArray([exerciseName || exercise.name || ''])
      : [];

  return {
    primary: primary.length > 0 ? primary : fallbackMuscles,
    secondary,
  };
};

export function attributeSessionToMuscles(
  session: WorkoutSession,
  exercisesById: Map<string, Exercise>,
  options: AttributionOptions = {}
): Record<MuscleKey, number> {
  const scores = {} as Record<MuscleKey, number>;
  const preferredUnits = options.preferredUnits ?? 'imperial';
  const volumeContext: VolumeContext = {
    preferredUnits,
    weightUnits: options.weightUnitByExercise,
    bodyweightKg: options.bodyweightKg ?? null,
    profileWeightKg: options.profileWeightKg ?? null,
  };

  session.exercises.forEach((workoutExercise) => {
    const exercise = exercisesById.get(workoutExercise.exerciseId);
    if (!exercise) return;

    const primary = normalizeMuscleArray(exercise.primaryMuscles || []);
    const secondary = normalizeMuscleArray(exercise.secondaryMuscles || []);
    if (primary.length === 0 && secondary.length === 0) return;

    const fallbackWeightUnit = options.weightUnitByExercise?.[workoutExercise.exerciseId];

    workoutExercise.sets.forEach((set) => {
      const units = getSetVolume(set, volumeContext, {
        exerciseMeta: exercise,
        fallbackUnit: fallbackWeightUnit,
        exerciseName: workoutExercise.exerciseName,
      });
      if (units <= 0) return;

      primary.forEach((muscle) => {
        scores[muscle] = (scores[muscle] ?? 0) + units * 1.0;
      });
      secondary.forEach((muscle) => {
        scores[muscle] = (scores[muscle] ?? 0) + units * 0.5;
      });
    });
  });

  return scores;
}

export function attributeSessionSetsToMuscles(
  session: WorkoutSession,
  exercisesById: Map<string, Exercise>
): Record<MuscleKey, number> {
  const scores = {} as Record<MuscleKey, number>;

  session.exercises.forEach((workoutExercise) => {
    const exercise = exercisesById.get(workoutExercise.exerciseId);
    if (!exercise) return;

    const { primary, secondary } = resolveExerciseMuscles(exercise, workoutExercise.exerciseName);
    if (primary.length === 0 && secondary.length === 0) return;

    workoutExercise.sets.forEach((set) => {
      if (!set.isCompleted) return;
      if (set.setType === 'warmup') return;
      if ((set.reps ?? 0) <= 0) return;

      if (primary.length > 0) {
        const primaryShare = 1 / primary.length;
        primary.forEach((muscle) => {
          scores[muscle] = (scores[muscle] ?? 0) + primaryShare;
        });
      }

      if (secondary.length > 0) {
        const secondaryShare = 0.5 / secondary.length;
        secondary.forEach((muscle) => {
          scores[muscle] = (scores[muscle] ?? 0) + secondaryShare;
        });
      }
    });
  });

  return scores;
}

export function attributeExercisesToMuscles(exercises: Exercise[]): Record<MuscleKey, number> {
  const scores = {} as Record<MuscleKey, number>;

  exercises.forEach((exercise) => {
    const primary = normalizeMuscleArray(exercise.primaryMuscles || []);
    const secondary = normalizeMuscleArray(exercise.secondaryMuscles || []);
    primary.forEach((muscle) => {
      scores[muscle] = (scores[muscle] ?? 0) + 1;
    });
    secondary.forEach((muscle) => {
      scores[muscle] = (scores[muscle] ?? 0) + 0.5;
    });
  });

  return scores;
}

export function bucketIntensity(scores: Record<MuscleKey, number>): Record<MuscleKey, number> {
  const entries = Object.entries(scores)
    .filter(([key]) => ACTIVE_MUSCLE_KEYS.includes(key as MuscleKey)) as Array<[MuscleKey, number]>;
  const maxScore = entries.reduce((max, [, value]) => Math.max(max, value), 0);

  if (maxScore <= 0) {
    const empty = {} as Record<MuscleKey, number>;
    entries.forEach(([key]) => {
      empty[key] = 0;
    });
    return empty;
  }

  const levels = {} as Record<MuscleKey, number>;
  entries.forEach(([muscle, value]) => {
    const norm = value / maxScore;
    let level = 0;
    if (norm < 0.08) level = 0;
    else if (norm < 0.2) level = 1;
    else if (norm < 0.4) level = 2;
    else if (norm < 0.65) level = 3;
    else if (norm < 0.85) level = 4;
    else level = 5;
    levels[muscle] = level;
  });
  return levels;
}

export function bucketWeeklyTierIntensity(
  scores: Record<MuscleKey, number>
): Record<MuscleKey, number> {
  const levels = {} as Record<MuscleKey, number>;

  ACTIVE_MUSCLE_KEYS.forEach((muscle) => {
    const value = scores[muscle] ?? 0;
    let level = 0;

    if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.s) level = 6;
    else if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.a) level = 5;
    else if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.b) level = 4;
    else if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.c) level = 3;
    else if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.d) level = 2;
    else if (value >= WEEKLY_MUSCLE_TIER_THRESHOLDS.e) level = 1;

    levels[muscle] = level;
  });

  return levels;
}
