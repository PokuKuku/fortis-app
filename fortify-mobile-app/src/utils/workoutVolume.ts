import type { WorkoutSession, WeightUnit, WorkoutSet } from '@/src/types/workout';
import type { Exercise } from '@/src/types/exercise';

const LBS_TO_KG = 1 / 2.20462;
const KG_TO_LBS = 2.20462;

export type ExerciseVolumeMeta = Pick<
  Exercise,
  'id' | 'slug' | 'name' | 'equipment' | 'primaryMuscles'
>;

export type VolumeContext = {
  preferredUnits: 'imperial' | 'metric';
  weightUnits?: Record<string, WeightUnit>;
  exercisesById?: Map<string, ExerciseVolumeMeta>;
  bodyweightKg?: number | null;
  profileWeightKg?: number | null;
};

const BODYWEIGHT_EQUIPMENT = new Set([
  'body only',
  'bodyweight',
  'body weight',
  'assisted',
  'assisted bodyweight',
  'suspension',
]);

const BODYWEIGHT_NAME_REGEX =
  /(^|[^a-z])(pull[- ]?up|chin[- ]?up|push[- ]?up|dip|plank|sit[- ]?up|crunch|inverted row)($|[^a-z])/i;

export const isBodyweightExercise = (
  equipment?: string | null,
  name?: string | null
): boolean => {
  const normalizedEquipment = (equipment ?? '').toLowerCase();
  if (normalizedEquipment && BODYWEIGHT_EQUIPMENT.has(normalizedEquipment)) {
    return true;
  }
  const normalizedName = (name ?? '').toLowerCase();
  if (!normalizedName) return false;
  return BODYWEIGHT_NAME_REGEX.test(normalizedName);
};

export const getBodyweightMovementFactor = (
  primaryMuscles?: string[] | null
): number => {
  if (!primaryMuscles || primaryMuscles.length === 0) return 0;
  const primary = (primaryMuscles[0] ?? '').toLowerCase();
  if (!primary) return 0;
  if (/full[- _]?body|total[- _]?body/.test(primary)) return 0.6;
  if (
    [
      'glutes',
      'gluteus',
      'gluteus maximus',
      'gluteus medius',
      'gluteus minimus',
      'quads',
      'quadriceps',
      'hamstrings',
      'hamstring',
      'calves',
      'calf',
      'adductors',
      'adductor',
      'abductors',
      'abductor',
    ].includes(primary)
  ) {
    return 0.7;
  }
  if (
    [
      'chest',
      'pectorals',
      'pectoral',
      'pec',
      'pecs',
      'upper chest',
      'lower chest',
      'serratus anterior',
    ].includes(primary)
  ) {
    return 0.4;
  }
  if (
    [
      'lats',
      'latissimus dorsi',
      'upper back',
      'middle back',
      'mid back',
      'lower back',
      'back',
      'rhomboids',
      'traps',
      'trapezius',
      'erector spinae',
    ].includes(primary)
  ) {
    return 0.85;
  }
  if (
    [
      'front delts',
      'front deltoids',
      'anterior deltoid',
      'side delts',
      'side deltoids',
      'lateral deltoid',
      'lateral delts',
      'rear delts',
      'rear deltoids',
      'posterior deltoid',
      'shoulders',
      'delts',
      'deltoids',
      'rotator cuff',
    ].includes(primary)
  ) {
    return 0.5;
  }
  if (
    [
      'biceps',
      'bicep',
      'biceps brachii',
      'brachialis',
      'triceps',
      'tricep',
      'triceps brachii',
      'forearm',
      'forearms',
      'wrist flexors',
      'wrist extensors',
      'grip muscles',
    ].includes(primary)
  ) {
    return 0.45;
  }
  if (
    [
      'abs',
      'abdominals',
      'abdominal',
      'core',
      'hip flexors',
      'lower abs',
      'obliques',
      'oblique',
    ].includes(primary)
  ) {
    return 0.35;
  }
  return 0;
};

const resolveWeightUnit = (
  unit: WeightUnit | null | undefined,
  fallbackUnit: WeightUnit | undefined,
  preferredUnits: 'imperial' | 'metric'
): WeightUnit => {
  if (unit) return unit;
  if (fallbackUnit) return fallbackUnit;
  return preferredUnits === 'metric' ? 'kg' : 'lbs';
};

const normalizeWeight = (
  weight: number,
  unit: WeightUnit,
  preferredUnits: 'imperial' | 'metric'
): number => {
  if (preferredUnits === 'metric') {
    return unit === 'lbs' ? weight * LBS_TO_KG : weight;
  }
  return unit === 'kg' ? weight * KG_TO_LBS : weight;
};

const resolveBodyweightKg = (context: VolumeContext): number | null => {
  const latest = context.bodyweightKg ?? null;
  if (latest && latest > 0) return latest;
  const profile = context.profileWeightKg ?? null;
  if (profile && profile > 0) return profile;
  return null;
};

export const getSetVolume = (
  set: WorkoutSet,
  context: VolumeContext,
  options: {
    exerciseMeta?: ExerciseVolumeMeta;
    fallbackUnit?: WeightUnit;
    exerciseName?: string | null;
  } = {}
): number => {
  if (!set.isCompleted) return 0;
  if (set.setType === 'warmup') return 0;

  const reps = set.reps ?? null;
  if (reps === null || reps <= 0) return 0;

  const weight = set.weight ?? null;
  let addedWeightNorm: number | null = null;
  if (weight !== null && weight > 0) {
    const resolvedUnit = resolveWeightUnit(
      set.weightUnit,
      options.fallbackUnit,
      context.preferredUnits
    );
    addedWeightNorm = normalizeWeight(weight, resolvedUnit, context.preferredUnits);
  }

  const exerciseMeta = options.exerciseMeta;
  const isBodyweight = isBodyweightExercise(
    exerciseMeta?.equipment ?? null,
    exerciseMeta?.name ?? options.exerciseName ?? null
  );
  let bodyweightNorm: number | null = null;
  if (isBodyweight) {
    const bodyweightKg = resolveBodyweightKg(context);
    const movementFactor = getBodyweightMovementFactor(exerciseMeta?.primaryMuscles ?? null);
    if (bodyweightKg && movementFactor > 0) {
      const bodyweightPreferred =
        context.preferredUnits === 'metric' ? bodyweightKg : bodyweightKg * KG_TO_LBS;
      bodyweightNorm = bodyweightPreferred * movementFactor;
    }
  }

  if (addedWeightNorm === null && bodyweightNorm === null) return 0;
  return (Number(addedWeightNorm ?? 0) + Number(bodyweightNorm ?? 0)) * reps;
};

export const getSessionVolume = (
  session: WorkoutSession,
  context: VolumeContext
): number => {
  let total = 0;

  session.exercises.forEach((exercise) => {
    const fallbackUnit = context.weightUnits?.[exercise.exerciseId];
    const exerciseMeta = context.exercisesById?.get(exercise.exerciseId);
    exercise.sets.forEach((set) => {
      total += getSetVolume(set, context, {
        exerciseMeta,
        fallbackUnit,
        exerciseName: exercise.exerciseName,
      });
    });
  });

  return total;
};
