/**
 * Maps ExerciseDB muscle names to app-standard muscle names.
 * ExerciseDB uses anatomical names like "pectoralis major" while
 * the app uses common names like "chest".
 */

const MUSCLE_MAP: Record<string, string> = {
  // Chest
  'pectoralis major': 'chest',
  'pectoralis minor': 'chest',
  'serratus anterior': 'chest',

  // Back
  'latissimus dorsi': 'lats',
  'trapezius': 'traps',
  'rhomboids': 'middle back',
  'erector spinae': 'lower back',
  'infraspinatus': 'middle back',
  'teres major': 'lats',
  'teres minor': 'middle back',

  // Shoulders
  'deltoid': 'shoulders',
  'anterior deltoid': 'shoulders',
  'posterior deltoid': 'shoulders',
  'lateral deltoid': 'shoulders',
  'deltoids': 'shoulders',

  // Arms
  'biceps brachii': 'biceps',
  'biceps': 'biceps',
  'triceps brachii': 'triceps',
  'triceps': 'triceps',
  'brachialis': 'biceps',
  'brachioradialis': 'forearms',
  'forearm': 'forearms',
  'forearms': 'forearms',
  'wrist flexors': 'forearms',
  'wrist extensors': 'forearms',

  // Legs
  'quadriceps': 'quadriceps',
  'quads': 'quadriceps',
  'rectus femoris': 'quadriceps',
  'vastus lateralis': 'quadriceps',
  'vastus medialis': 'quadriceps',
  'vastus intermedius': 'quadriceps',
  'hamstrings': 'hamstrings',
  'biceps femoris': 'hamstrings',
  'semitendinosus': 'hamstrings',
  'semimembranosus': 'hamstrings',
  'gluteus maximus': 'glutes',
  'gluteus medius': 'glutes',
  'gluteus minimus': 'glutes',
  'glutes': 'glutes',
  'gastrocnemius': 'calves',
  'soleus': 'calves',
  'calves': 'calves',
  'tibialis anterior': 'calves',

  // Core
  'rectus abdominis': 'abdominals',
  'abdominals': 'abdominals',
  'abs': 'abdominals',
  'obliques': 'abdominals',
  'external oblique': 'abdominals',
  'internal oblique': 'abdominals',
  'transverse abdominis': 'abdominals',
  'hip flexors': 'abdominals',

  // Other
  'adductors': 'adductors',
  'adductor magnus': 'adductors',
  'adductor longus': 'adductors',
  'abductors': 'abductors',
  'tensor fasciae latae': 'abductors',
  'sternocleidomastoid': 'neck',
  'neck': 'neck',
  'levator scapulae': 'neck',
};

/**
 * Normalizes a single muscle name from ExerciseDB format to app format.
 * If no mapping exists, returns the original name in lowercase.
 */
export function normalizeMuscleName(muscle: string): string {
  const normalized = muscle.toLowerCase().trim();
  return MUSCLE_MAP[normalized] || normalized;
}

/**
 * Normalizes an array of muscle names and removes duplicates.
 */
export function normalizeMuscleArray(muscles: string[]): string[] {
  if (!muscles || !Array.isArray(muscles)) return [];
  const normalized = muscles.map(normalizeMuscleName);
  return [...new Set(normalized)];
}
