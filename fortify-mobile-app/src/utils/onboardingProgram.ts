import { PENDING_ONBOARDING_PROGRAM_SPEC_KEY } from '@/src/constants/storageKeys';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { ProgramExercise } from '@/src/types/workout';
import type { OnboardingState } from '@/src/utils/onboardingState';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { DeviceEventEmitter } from 'react-native';
import {
  deriveScheduleDaysFromWorkoutsPerWeek,
  normalizeWorkoutScheduleDays,
  WEEKDAY_LABELS,
} from '@/src/utils/workoutSchedule';

export type TrainingEnvironment = 'gym' | 'home' | 'hybrid';
export type MuscleFocus = 'balanced' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'glutes' | 'core';
export type FitnessPriority = NonNullable<OnboardingState['fitness_priorities']>[number];
export type GoalPace = NonNullable<OnboardingState['goal_pace']>;
export type OnboardingProgramStatus = 'pending' | 'generating' | 'ready' | 'failed' | 'dismissed';

export type OnboardingProgramSpec = {
  id: string;
  status: OnboardingProgramStatus;
  createdAt: string;
  updatedAt: string;
  generatedProgramId?: string | null;
  error?: string | null;
  userName?: string | null;
  programName?: string | null;
  trainingEnvironment: TrainingEnvironment;
  muscleFocuses: MuscleFocus[];
  primaryMuscleFocus?: MuscleFocus | null;
  fitnessGoal?: OnboardingState['fitness_goal'] | null;
  liftingExperience?: OnboardingState['lifting_experience'] | null;
  workoutConsistency?: OnboardingState['workout_consistency'] | null;
  fitnessPriorities: FitnessPriority[];
  sessionDurationMinutes: number;
  goalPace: GoalPace;
  workoutsPerWeek: number;
  scheduleDays: number[];
  durationWeeks: number;
};

export type OnboardingProgramWorkoutBlueprint = {
  name: string;
  focus: MuscleFocus[];
};

export type OnboardingProgramBlueprint = {
  name: string;
  subtitle: string;
  environmentLabel: string;
  scheduleLabel: string;
  focusLabel: string;
  durationWeeks: number;
  workouts: OnboardingProgramWorkoutBlueprint[];
};

export type GeneratedProgramWorkout = {
  name: string;
  exercises: Array<Omit<ProgramExercise, 'id' | 'orderIndex'>>;
};

export type GeneratedProgramPayload = {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'hypertrophy' | 'general_fitness';
  durationWeeks: number;
  workouts: GeneratedProgramWorkout[];
  sourceSpecId: string;
};

export const TRAINING_ENVIRONMENT_LABELS: Record<TrainingEnvironment, string> = {
  gym: 'Gym',
  home: 'Home',
  hybrid: 'Hybrid',
};

export const MUSCLE_FOCUS_LABELS: Record<MuscleFocus, string> = {
  balanced: 'Balanced',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  glutes: 'Glutes',
  core: 'Core',
};

export const ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT = 'onboardingProgramSpecUpdated';

const DEFAULT_SCHEDULE = [1, 3, 5];
const DURATION_WEEKS = 8;
const DEFAULT_SESSION_DURATION_MINUTES = 45;
const DEFAULT_GOAL_PACE: GoalPace = 'balanced';

const stableHash = (input: string) => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash &= 0xffffffff;
  }
  return Math.abs(hash).toString(36);
};

const normalizeFocuses = (focuses?: OnboardingState['muscle_focuses'], fallback?: OnboardingState['muscle_focus']) => {
  const values = (focuses?.length ? focuses : fallback ? [fallback] : []) as MuscleFocus[];
  const deduped = Array.from(new Set(values.filter(Boolean)));
  if (deduped.includes('balanced') || deduped.length === 0) {
    return ['balanced'] as MuscleFocus[];
  }
  return deduped;
};

const resolveWorkoutsPerWeek = (state: OnboardingState | null | undefined) => {
  const explicit = typeof state?.workouts_per_week === 'number' ? state.workouts_per_week : null;
  const scheduled = normalizeWorkoutScheduleDays(state?.workout_schedule_days);
  const count = explicit ?? scheduled.length ?? DEFAULT_SCHEDULE.length;
  return Math.min(7, Math.max(1, count || DEFAULT_SCHEDULE.length));
};

const resolveSessionDurationMinutes = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_SESSION_DURATION_MINUTES;
  return Math.min(120, Math.max(20, Math.round(value)));
};

const resolveGoalPace = (value?: OnboardingState['goal_pace']): GoalPace => {
  if (value === 'steady' || value === 'aggressive') return value;
  return DEFAULT_GOAL_PACE;
};

const resolveFitnessPriorities = (values?: OnboardingState['fitness_priorities']): FitnessPriority[] => {
  const valid = new Set<FitnessPriority>([
    'strength',
    'muscle_growth',
    'fat_loss',
    'conditioning',
    'mobility',
    'consistency',
  ]);
  return Array.from(new Set((values ?? []).filter((value): value is FitnessPriority => valid.has(value as FitnessPriority))));
};

export function buildOnboardingProgramSpec(state: OnboardingState | null | undefined): OnboardingProgramSpec {
  const workoutsPerWeek = resolveWorkoutsPerWeek(state);
  const scheduleDays = normalizeWorkoutScheduleDays(state?.workout_schedule_days);
  const fallbackSchedule = scheduleDays.length > 0
    ? scheduleDays
    : deriveScheduleDaysFromWorkoutsPerWeek(workoutsPerWeek);
  const trainingEnvironment = state?.training_environment ?? 'gym';
  const muscleFocuses = normalizeFocuses(state?.muscle_focuses, state?.muscle_focus);
  const fitnessPriorities = resolveFitnessPriorities(state?.fitness_priorities);
  const sessionDurationMinutes = resolveSessionDurationMinutes(state?.session_duration_minutes);
  const goalPace = resolveGoalPace(state?.goal_pace);
  const payloadForHash = JSON.stringify({
    programName: state?.program_name?.trim() || null,
    trainingEnvironment,
    muscleFocuses,
    fitnessPriorities,
    sessionDurationMinutes,
    goalPace,
    fitnessGoal: state?.fitness_goal ?? null,
    liftingExperience: state?.lifting_experience ?? null,
    workoutsPerWeek,
    scheduleDays: fallbackSchedule,
  });
  const now = new Date().toISOString();

  return {
    id: `onboarding-program-${stableHash(payloadForHash)}`,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    generatedProgramId: null,
    userName: state?.full_name?.trim() || null,
    programName: state?.program_name?.trim() || null,
    trainingEnvironment,
    muscleFocuses,
    primaryMuscleFocus: muscleFocuses[0] ?? null,
    fitnessGoal: state?.fitness_goal ?? state?.fitness_goals?.[0] ?? null,
    liftingExperience: state?.lifting_experience ?? null,
    workoutConsistency: state?.workout_consistency ?? null,
    fitnessPriorities,
    sessionDurationMinutes,
    goalPace,
    workoutsPerWeek,
    scheduleDays: fallbackSchedule,
    durationWeeks: DURATION_WEEKS,
  };
}

const chooseBalancedSplitNames = (spec: Pick<OnboardingProgramSpec, 'workoutsPerWeek' | 'fitnessGoal'>): string[] => {
  const count = Math.min(7, Math.max(1, spec.workoutsPerWeek));
  if (count === 1) return ['Full Body'];
  if (count === 2) return ['Upper', 'Lower'];
  if (count === 3) {
    return spec.fitnessGoal === 'improve_strength'
      ? ['Upper Strength', 'Lower Strength', 'Full Body']
      : ['Push', 'Pull', 'Legs'];
  }
  if (count === 4) return ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
  if (count === 5) return ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
  return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Full Body'].slice(0, count);
};

const getSpecificFocuses = (focuses: MuscleFocus[]) => (
  focuses.filter((focus) => focus && focus !== 'balanced')
);

const formatFocusGroupName = (focuses: MuscleFocus[]) => (
  focuses.map((focus) => MUSCLE_FOCUS_LABELS[focus]).join(' + ')
);

const splitFocusesAcrossWorkouts = (focuses: MuscleFocus[], count: number): MuscleFocus[][] => {
  if (count <= focuses.length) {
    const baseSize = Math.floor(focuses.length / count);
    const remainder = focuses.length % count;
    let cursor = 0;
    return Array.from({ length: count }, (_, index) => {
      const size = baseSize + (index < remainder ? 1 : 0);
      const chunk = focuses.slice(cursor, cursor + size);
      cursor += size;
      return chunk;
    });
  }

  return Array.from({ length: count }, (_, index) => [focuses[index % focuses.length]]);
};

const focusedWorkoutVariant = (
  occurrence: number,
  count: number,
  focusCount: number,
  fitnessGoal: OnboardingProgramSpec['fitnessGoal']
) => {
  if (count <= focusCount) {
    return fitnessGoal === 'improve_strength' ? 'Strength' : 'Focus';
  }

  const variants = fitnessGoal === 'improve_strength'
    ? ['Strength', 'Volume', 'Accessory', 'Power', 'Pump', 'Support', 'Finish']
    : ['Strength', 'Volume', 'Accessory', 'Pump', 'Hypertrophy', 'Support', 'Finish'];
  return variants[occurrence] ?? `Day ${occurrence + 1}`;
};

const chooseFocusedSplitWorkouts = (
  spec: Pick<OnboardingProgramSpec, 'workoutsPerWeek' | 'muscleFocuses' | 'fitnessGoal'>
): OnboardingProgramWorkoutBlueprint[] => {
  const count = Math.min(7, Math.max(1, spec.workoutsPerWeek));
  const focuses = getSpecificFocuses(spec.muscleFocuses);
  const chunks = splitFocusesAcrossWorkouts(focuses, count);
  const occurrences = new Map<string, number>();

  return chunks.map((focusChunk) => {
    const key = focusChunk.join('|');
    const occurrence = occurrences.get(key) ?? 0;
    occurrences.set(key, occurrence + 1);
    const label = formatFocusGroupName(focusChunk);
    const variant = focusedWorkoutVariant(occurrence, count, focuses.length, spec.fitnessGoal);
    return {
      name: `${label} ${variant}`,
      focus: focusChunk,
    };
  });
};

const focusForWorkoutName = (name: string): MuscleFocus[] => {
  const lower = name.toLowerCase();
  if (lower.includes('push')) return ['chest', 'shoulders', 'arms'];
  if (lower.includes('pull')) return ['back', 'arms'];
  if (lower.includes('upper')) return ['chest', 'back', 'shoulders'];
  if (lower.includes('lower') || lower.includes('legs')) return ['legs', 'glutes'];
  return ['chest', 'back', 'legs', 'core'];
};

const chooseProgramWorkouts = (
  spec: Pick<OnboardingProgramSpec, 'workoutsPerWeek' | 'muscleFocuses' | 'fitnessGoal'>
): OnboardingProgramWorkoutBlueprint[] => {
  const specificFocuses = getSpecificFocuses(spec.muscleFocuses);
  if (specificFocuses.length > 0) {
    return chooseFocusedSplitWorkouts(spec);
  }

  return chooseBalancedSplitNames(spec).map((name) => ({
    name,
    focus: focusForWorkoutName(name),
  }));
};

export function buildOnboardingProgramBlueprint(spec: OnboardingProgramSpec): OnboardingProgramBlueprint {
  const firstName = spec.userName?.split(/\s+/)[0];
  const focusLabel = spec.muscleFocuses.includes('balanced')
    ? 'Balanced training'
    : spec.muscleFocuses.map((focus) => MUSCLE_FOCUS_LABELS[focus]).join(', ');
  const workouts = chooseProgramWorkouts(spec);
  const scheduleLabel = spec.scheduleDays.length > 0
    ? spec.scheduleDays.map((day) => WEEKDAY_LABELS[day]).join(', ')
    : `${spec.workoutsPerWeek} days/week`;

  return {
    name: spec.programName?.trim() || (firstName ? `${firstName}'s Program` : 'Your Program'),
    subtitle: `${spec.durationWeeks}-week ${focusLabel.toLowerCase()} plan`,
    environmentLabel: TRAINING_ENVIRONMENT_LABELS[spec.trainingEnvironment],
    scheduleLabel,
    focusLabel,
    durationWeeks: spec.durationWeeks,
    workouts,
  };
}

export async function savePendingOnboardingProgramSpec(spec: OnboardingProgramSpec): Promise<void> {
  await setScopedItem(PENDING_ONBOARDING_PROGRAM_SPEC_KEY, JSON.stringify(spec));
  DeviceEventEmitter.emit(ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT, spec);
}

export async function loadPendingOnboardingProgramSpec(): Promise<OnboardingProgramSpec | null> {
  const raw = await getScopedItem(PENDING_ONBOARDING_PROGRAM_SPEC_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProgramSpec;
  } catch {
    await removeScopedItem(PENDING_ONBOARDING_PROGRAM_SPEC_KEY);
    return null;
  }
}

export async function updatePendingOnboardingProgramSpec(
  updates: Partial<OnboardingProgramSpec>
): Promise<OnboardingProgramSpec | null> {
  const current = await loadPendingOnboardingProgramSpec();
  if (!current) return null;
  const next = { ...current, ...updates, updatedAt: new Date().toISOString() };
  await savePendingOnboardingProgramSpec(next);
  return next;
}

export async function clearPendingOnboardingProgramSpec(): Promise<void> {
  await removeScopedItem(PENDING_ONBOARDING_PROGRAM_SPEC_KEY);
  DeviceEventEmitter.emit(ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT, null);
}

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const equipmentAllowed = (exercise: ExerciseWithSource, environment: TrainingEnvironment, workoutIndex: number) => {
  const equipment = normalized(exercise.equipment);
  if (environment === 'gym') return true;
  if (environment === 'home') {
    return ['body only', 'bodyweight', 'body weight', 'dumbbell', 'bands', 'band', 'kettlebell', 'kettlebells'].some((item) => equipment.includes(item));
  }
  if (workoutIndex % 2 === 0) return true;
  return ['body only', 'bodyweight', 'body weight', 'dumbbell', 'bands', 'band', 'kettlebell', 'kettlebells', 'cable'].some((item) => equipment.includes(item));
};

const exerciseMatchesMuscle = (exercise: ExerciseWithSource, focus: MuscleFocus) => {
  if (focus === 'balanced') return true;
  const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].map(normalized).join(' ');
  const name = normalized(exercise.name);
  const map: Record<MuscleFocus, string[]> = {
    balanced: [],
    chest: ['chest', 'pectorals'],
    back: ['back', 'lats', 'middle back', 'lower back', 'traps'],
    shoulders: ['shoulders', 'delts', 'deltoids'],
    arms: ['biceps', 'triceps', 'forearms'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'adductors'],
    glutes: ['glutes'],
    core: ['abdominals', 'abs', 'obliques'],
  };
  return map[focus].some((token) => muscles.includes(token) || name.includes(token));
};

const isLowValueGeneratedExercise = (exercise: ExerciseWithSource) => {
  const text = normalized(`${exercise.name} ${exercise.category}`);
  return /\b(stretch|mobility|roll|warm up|warmup|cardio)\b/.test(text) || exercise.isHidden;
};

const scoreExercise = (exercise: ExerciseWithSource, focuses: MuscleFocus[], environment: TrainingEnvironment) => {
  let score = 0;
  focuses.forEach((focus) => {
    if (exerciseMatchesMuscle(exercise, focus)) score += 8;
  });
  if (exercise.isCurated) score += 4;
  if (!exercise.canonicalId) score += 2;
  const equipment = normalized(exercise.equipment);
  if (environment === 'gym' && ['barbell', 'dumbbell', 'cable', 'machine'].some((item) => equipment.includes(item))) score += 2;
  if (environment === 'home' && ['body', 'dumbbell', 'band', 'kettlebell'].some((item) => equipment.includes(item))) score += 2;
  if (/\b(bench|press|row|pulldown|pull up|pull-up|squat|deadlift|lunge|leg press|hip thrust)\b/i.test(exercise.name)) score += 2;
  if (/\b(assisted|reverse|decline close grip|behind neck)\b/i.test(exercise.name)) score -= 5;
  return score;
};

const resolveProgramName = (spec: OnboardingProgramSpec) => {
  const firstName = spec.userName?.split(/\s+/)[0];
  return spec.programName?.trim() || (firstName ? `${firstName}'s Program` : 'Your Program');
};

const getPrimaryTrainingIntent = (
  spec: Pick<OnboardingProgramSpec, 'fitnessPriorities' | 'fitnessGoal'>
) => {
  if (spec.fitnessPriorities.includes('strength')) return 'strength';
  if (spec.fitnessPriorities.includes('muscle_growth')) return 'hypertrophy';
  if (spec.fitnessPriorities.includes('conditioning') || spec.fitnessPriorities.includes('fat_loss')) return 'conditioning';
  if (spec.fitnessGoal === 'improve_strength') return 'strength';
  if (spec.fitnessGoal === 'build_muscle') return 'hypertrophy';
  return 'general';
};

const getTargetExerciseCount = (
  spec: Pick<OnboardingProgramSpec, 'sessionDurationMinutes' | 'goalPace'>
) => {
  const base = spec.sessionDurationMinutes <= 30 ? 4 : spec.sessionDurationMinutes <= 55 ? 5 : 6;
  const paceAdjustment = spec.goalPace === 'steady' ? -1 : spec.goalPace === 'aggressive' ? 1 : 0;
  return Math.min(7, Math.max(3, base + paceAdjustment));
};

const getRestSeconds = (base: number, pace: GoalPace) => {
  const multiplier = pace === 'steady' ? 1.15 : pace === 'aggressive' ? 0.85 : 1;
  return Math.round((base * multiplier) / 5) * 5;
};

const buildExercise = (
  exercise: ExerciseWithSource,
  index: number,
  intent: ReturnType<typeof getPrimaryTrainingIntent>,
  pace: GoalPace
): Omit<ProgramExercise, 'id' | 'orderIndex'> => {
  const compound = /\b(bench|press|row|pulldown|pull up|pull-up|squat|deadlift|lunge|leg press|hip thrust)\b/i.test(exercise.name);
  const strengthFocused = intent === 'strength';
  const conditioningFocused = intent === 'conditioning';
  return {
    exerciseId: exercise.remoteId ?? exercise.id,
    exerciseName: exercise.name,
    sets: compound && index < 2 ? 4 : pace === 'aggressive' && index < 4 ? 4 : 3,
    reps: strengthFocused && compound
      ? '5-8'
      : conditioningFocused
        ? '10-15'
        : compound ? '6-10' : '10-15',
    restSeconds: getRestSeconds(compound ? 90 : conditioningFocused ? 45 : 60, pace),
    notes: '',
  };
};

export function buildDeterministicOnboardingProgram(
  spec: OnboardingProgramSpec,
  exercises: ExerciseWithSource[]
): GeneratedProgramPayload | null {
  const blueprint = buildOnboardingProgramBlueprint(spec);
  const targetExerciseCount = getTargetExerciseCount(spec);
  const trainingIntent = getPrimaryTrainingIntent(spec);
  const usableExercises = exercises.filter((exercise) => !isLowValueGeneratedExercise(exercise));
  if (usableExercises.length === 0) return null;

  const workouts = blueprint.workouts.map((workout, workoutIndex) => {
    const requestedFocuses = workout.focus.includes('balanced') ? spec.muscleFocuses : workout.focus;
    const focuses = requestedFocuses.includes('balanced') ? focusForWorkoutName(workout.name) : requestedFocuses;
    const ranked = usableExercises
      .filter((exercise) => equipmentAllowed(exercise, spec.trainingEnvironment, workoutIndex))
      .filter((exercise) => focuses.some((focus) => exerciseMatchesMuscle(exercise, focus)))
      .map((exercise) => ({ exercise, score: scoreExercise(exercise, focuses, spec.trainingEnvironment) }))
      .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

    const selected: ExerciseWithSource[] = [];
    const groups = new Set<string>();
    for (const { exercise } of ranked) {
      if (selected.length >= targetExerciseCount) break;
      const group = exercise.canonicalKey || exercise.canonicalId || normalized(exercise.name);
      if (groups.has(group)) continue;
      selected.push(exercise);
      groups.add(group);
    }

    return {
      name: workout.name,
      exercises: selected.map((exercise, index) =>
        buildExercise(exercise, index, trainingIntent, spec.goalPace)
      ),
    };
  }).filter((workout) => workout.exercises.length >= 3);

  if (workouts.length === 0) return null;

  return {
    name: resolveProgramName(spec),
    description: `${blueprint.subtitle} built for ${blueprint.environmentLabel.toLowerCase()} training.`,
    difficulty: spec.liftingExperience === 'advanced' ? 'advanced' : spec.liftingExperience === 'none' ? 'beginner' : 'intermediate',
    goal: trainingIntent === 'strength' ? 'strength' : trainingIntent === 'hypertrophy' ? 'hypertrophy' : 'general_fitness',
    durationWeeks: spec.durationWeeks,
    workouts,
    sourceSpecId: spec.id,
  };
}
