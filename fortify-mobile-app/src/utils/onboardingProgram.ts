import { PENDING_ONBOARDING_PROGRAM_SPEC_KEY } from '@/src/constants/storageKeys';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { ProgramExercise } from '@/src/types/workout';
import type { OnboardingState } from '@/src/utils/onboardingState';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { DeviceEventEmitter } from 'react-native';
import { isExerciseGifImagePath } from '@/src/utils/exerciseImageCache';
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
const DURATION_WEEKS = 10;
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

export const resolveOnboardingProgramName = (
  spec: Pick<OnboardingProgramSpec, 'programName' | 'userName'>,
  fallbackName?: string | null
) => {
  const firstName = spec.userName?.split(/\s+/)[0];
  return spec.programName?.trim() || fallbackName?.trim() || (firstName ? `${firstName}'s Program` : 'Your Program');
};

const chooseStandardSplitNames = (workoutsPerWeek: number): string[] => {
  const count = Math.min(7, Math.max(1, workoutsPerWeek));
  if (count === 1) return ['Full Body'];
  if (count === 2) return ['Upper', 'Lower'];
  if (count === 3) return ['Push', 'Pull', 'Legs'];
  if (count === 4) return ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
  if (count === 5) return ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
  return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Full Body'].slice(0, count);
};

const getSpecificFocuses = (focuses: MuscleFocus[]) => (
  focuses.filter((focus) => focus && focus !== 'balanced')
);

const focusForWorkoutName = (name: string): MuscleFocus[] => {
  const lower = name.toLowerCase();
  if (lower.includes('push')) return ['chest', 'shoulders', 'arms'];
  if (lower.includes('pull')) return ['back', 'arms'];
  if (lower.includes('upper')) return ['chest', 'back', 'shoulders', 'arms'];
  if (lower.includes('lower') || lower.includes('legs')) return ['legs', 'glutes'];
  return ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core'];
};

const focusForStandardWorkout = (name: string, selectedFocuses: MuscleFocus[]): MuscleFocus[] => {
  const splitFocuses = focusForWorkoutName(name);
  const specificFocuses = getSpecificFocuses(selectedFocuses);
  if (specificFocuses.length === 0) return splitFocuses;

  const overlappingFocuses = specificFocuses.filter((focus) => splitFocuses.includes(focus));
  return overlappingFocuses.length > 0 ? [...overlappingFocuses, ...splitFocuses] : splitFocuses;
};

const chooseProgramWorkouts = (
  spec: Pick<OnboardingProgramSpec, 'workoutsPerWeek' | 'muscleFocuses' | 'fitnessGoal'>
): OnboardingProgramWorkoutBlueprint[] => {
  return chooseStandardSplitNames(spec.workoutsPerWeek).map((name) => ({
    name,
    focus: focusForStandardWorkout(name, spec.muscleFocuses),
  }));
};

export function buildOnboardingProgramBlueprint(spec: OnboardingProgramSpec): OnboardingProgramBlueprint {
  const isBalanced = spec.muscleFocuses.includes('balanced');
  const focusLabel = isBalanced
    ? 'Balanced training'
    : spec.muscleFocuses.map((focus) => MUSCLE_FOCUS_LABELS[focus]).join(', ');
  const workouts = chooseProgramWorkouts(spec);
  const scheduleLabel = spec.scheduleDays.length > 0
    ? spec.scheduleDays.map((day) => WEEKDAY_LABELS[day]).join(', ')
    : `${spec.workoutsPerWeek} days/week`;
  const subtitle = isBalanced
    ? `${spec.durationWeeks}-week ${focusLabel.toLowerCase()} plan`
    : `${spec.durationWeeks}-week ${focusLabel.toLowerCase()} focus`;

  return {
    name: resolveOnboardingProgramName(spec),
    subtitle,
    environmentLabel: TRAINING_ENVIRONMENT_LABELS[spec.trainingEnvironment],
    scheduleLabel,
    focusLabel,
    durationWeeks: spec.durationWeeks,
    workouts,
  };
}

export function formatOnboardingFrequencySummary(workoutsPerWeek?: number | null): string | null {
  if (typeof workoutsPerWeek !== 'number' || Number.isNaN(workoutsPerWeek)) return null;
  const normalizedWorkoutsPerWeek = Math.min(7, Math.max(1, Math.round(workoutsPerWeek)));
  return `${normalizedWorkoutsPerWeek} times a week`;
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

const HOME_EQUIPMENT = ['body only', 'bodyweight', 'body weight', 'dumbbell', 'bands', 'band', 'kettlebell', 'kettlebells'];
const GYM_EQUIPMENT = ['barbell', 'dumbbell', 'cable', 'machine', 'smith', 'leg press', 'hack squat'];

const usesHomeEquipment = (equipment: string) => HOME_EQUIPMENT.some((item) => equipment.includes(item));
const usesGymEquipment = (equipment: string) => GYM_EQUIPMENT.some((item) => equipment.includes(item));

const equipmentAllowed = (exercise: ExerciseWithSource, environment: TrainingEnvironment) => {
  const equipment = normalized(exercise.equipment);
  if (environment === 'gym') return true;
  if (environment === 'home') {
    return usesHomeEquipment(equipment);
  }
  return true;
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
    legs: ['quadriceps', 'hamstrings', 'calves', 'adductors', 'abductors'],
    glutes: ['glutes'],
    core: ['abdominals', 'abs', 'obliques'],
  };
  return map[focus].some((token) => muscles.includes(token) || name.includes(token));
};

const isLowValueGeneratedExercise = (exercise: ExerciseWithSource) => {
  const text = normalized(`${exercise.name} ${exercise.category}`);
  return /\b(stretch|mobility|roll|warm up|warmup|cardio)\b/.test(text) || exercise.isHidden;
};

const isWeakOnboardingVariant = (exercise: ExerciseWithSource) => {
  return /\b(advanced|beginner|assisted|behind neck|reverse|one[- ]?arm|one[- ]?leg|single[- ]?leg|deficit|bodyweight squatting|bench pull[- ]?ups?)\b/i.test(exercise.name);
};

const hasUsableExerciseGif = (exercise: ExerciseWithSource) => (
  exercise.images.some((image) => isExerciseGifImagePath(image))
);

type CanonicalOnboardingPreference = {
  id: string;
  name: string;
  slotIds: string[];
};

const CANONICAL_ONBOARDING_EXERCISE_PREFERENCES: CanonicalOnboardingPreference[] = [
  { id: '8f4e3f99-cd79-49a9-542c-0238df792506', name: 'Wide-Grip Lat Pulldown', slotIds: ['vertical_pull', 'second_pull', 'vertical_pull_core'] },
  { id: '0608a659-2ce8-455a-0d0d-f264b0c80786', name: 'V-Bar Pulldown', slotIds: ['vertical_pull', 'second_pull', 'vertical_pull_core'] },
  { id: '967b8d8f-6842-48ad-3049-2eba275bc41e', name: 'Close-Grip Front Lat Pulldown', slotIds: ['vertical_pull', 'second_pull', 'vertical_pull_core'] },
  { id: 'aec04e6f-add8-4ca0-847e-c7a4e4879a22', name: 'Seated Cable Rows', slotIds: ['row', 'second_pull'] },
  { id: 'cd6e3284-218f-4781-910b-8fe9ecc575aa', name: 'Face Pull', slotIds: ['rear_delt_upper_back', 'shoulder_accessory'] },
  { id: '96dd46a4-976c-4c7e-dd21-2225fff1b258', name: 'Dumbbell Bicep Curl', slotIds: ['biceps', 'arm_accessory'] },
  { id: '0cb907f9-7f89-4ce6-05e4-3eadd55a87f4', name: 'Barbell Curl', slotIds: ['biceps', 'arm_accessory'] },
  { id: '5ede595d-40cd-412e-06d8-f6f6368d02db', name: 'EZ-Bar Curl', slotIds: ['biceps', 'arm_accessory'] },
  { id: '51849a2e-7c93-4f1b-6783-e24687ddc40f', name: 'Hammer Curls', slotIds: ['biceps', 'arm_accessory'] },
  { id: 'a46f5273-d6ed-4de8-cfe2-1646dad01bc9', name: 'Barbell Bench Press - Medium Grip', slotIds: ['horizontal_press', 'press'] },
  { id: 'd486b05a-e771-47d4-99a5-7b89d2390aeb', name: 'Dumbbell Bench Press', slotIds: ['horizontal_press', 'press'] },
  { id: '5fb424c6-0ab7-4ef3-0722-e47e1ed24740', name: 'Machine Bench Press', slotIds: ['horizontal_press', 'press', 'chest_accessory'] },
  { id: '00ce669e-1411-43de-d5a7-b7e85a160e30', name: 'Barbell Shoulder Press', slotIds: ['shoulder_press', 'shoulder_accessory', 'press'] },
  { id: 'ca7a37de-77ae-400a-3805-df1ba466419f', name: 'Dumbbell Shoulder Press', slotIds: ['shoulder_press', 'shoulder_accessory', 'press'] },
  { id: 'fd2e3afb-459d-4a0b-3816-815987897324', name: 'Leverage Shoulder Press', slotIds: ['shoulder_press', 'shoulder_accessory', 'press'] },
  { id: 'e89f2b37-4047-441b-21d4-072c0d03e98e', name: 'Side Lateral Raise', slotIds: ['lateral_raise', 'shoulder_accessory'] },
  { id: 'b262c55b-e735-4d3d-47be-a9cbafadcb24', name: 'Seated Side Lateral Raise', slotIds: ['lateral_raise', 'shoulder_accessory'] },
  { id: '697409e4-0b0a-464f-8ad1-054aa7b2117d', name: 'Triceps Pushdown', slotIds: ['triceps', 'arm_accessory'] },
  { id: '3d967c2b-4184-41bd-cc0a-882a8cead67f', name: 'Triceps Pushdown - Rope Attachment', slotIds: ['triceps', 'arm_accessory'] },
  { id: '488cf0c2-fc1a-457f-aeea-239e110c0bab', name: 'Triceps Pushdown - V-Bar Attachment', slotIds: ['triceps', 'arm_accessory'] },
  { id: '6bd35c77-0093-4d84-f7fd-7f7a3834f226', name: 'Barbell Squat', slotIds: ['squat_press'] },
  { id: '68be0377-1b01-4c53-d839-a5fc291fb389', name: 'Leg Press', slotIds: ['squat_press'] },
  { id: '07bccaa6-d851-4d7d-29b5-f67980133235', name: 'Romanian Deadlift', slotIds: ['hinge_curl', 'hinge'] },
  { id: '0d0fe991-6cad-4610-ef18-4e51795c9328', name: 'Lying Leg Curls', slotIds: ['hinge_curl'] },
  { id: '247e4e39-b46d-48f8-0085-f0c6fc34c011', name: 'Seated Leg Curl', slotIds: ['hinge_curl'] },
  { id: '94d8f05f-069a-4b44-eb68-bbefe2cfabe8', name: 'Leg Extensions', slotIds: ['unilateral_leg'] },
  { id: '8c3c8bf5-4099-44a0-6b2d-f381dfb26a1f', name: 'Calf Press', slotIds: ['calves'] },
  { id: 'dd5de488-04ec-4c8f-8043-3ead36c31017', name: 'Calf Press On The Leg Press Machine', slotIds: ['calves'] },
  { id: 'be3a2e88-0b03-479c-b870-937092be0238', name: 'Seated Calf Raise', slotIds: ['calves'] },
  { id: '3c9cfe7d-5a90-4137-7197-4f0f82d17234', name: 'Smith Machine Calf Raise', slotIds: ['calves'] },
  { id: 'f11e6b2b-4750-43a0-8aeb-9f75dc12e340', name: 'Standing Calf Raises', slotIds: ['calves'] },
  { id: '750b8c83-2f2c-4634-efc6-581de0628c32', name: 'Barbell Hip Thrust', slotIds: ['glute_hip', 'hinge'] },
  { id: '1f189423-23b3-4427-dd89-f8ea66d77d82', name: 'Cable Hip Adduction', slotIds: ['glute_hip'] },
  { id: '35047242-8cc2-4ba8-db82-78998c956c16', name: 'Thigh Abductor', slotIds: ['glute_hip'] },
  { id: '46c835f3-4282-4472-7fbf-374f08f9ac92', name: 'Thigh Adductor', slotIds: ['glute_hip'] },
];

type OnboardingMovementSlot = {
  id: string;
  tokens: string[];
  keywords: RegExp[];
  preferredEquipment?: string[];
  mechanic?: 'compound' | 'isolation';
  optional?: boolean;
};

const getWorkoutSlotKey = (name: string): 'push' | 'pull' | 'legs' | 'upper' | 'full_body' => {
  const lower = name.toLowerCase();
  if (lower.includes('push')) return 'push';
  if (lower.includes('pull')) return 'pull';
  if (lower.includes('upper')) return 'upper';
  if (lower.includes('lower') || lower.includes('legs')) return 'legs';
  return 'full_body';
};

const ONBOARDING_MOVEMENT_SLOTS: Record<ReturnType<typeof getWorkoutSlotKey>, OnboardingMovementSlot[]> = {
  pull: [
    { id: 'vertical_pull', tokens: ['lats'], keywords: [/\b(pulldown|pull[- ]?up|chin[- ]?up)\b/i], preferredEquipment: ['cable', 'machine'], mechanic: 'compound' },
    { id: 'row', tokens: ['upper back', 'middle back', 'lats'], keywords: [/\b(row|rowing)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell', 'barbell'], mechanic: 'compound' },
    { id: 'rear_delt_upper_back', tokens: ['rear delts', 'upper back', 'traps'], keywords: [/\b(face pull|rear delt|reverse fly|reverse pec deck|shrug)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell'], mechanic: 'isolation' },
    { id: 'biceps', tokens: ['biceps'], keywords: [/\b(curl|biceps)\b/i], preferredEquipment: ['dumbbell', 'cable', 'barbell'], mechanic: 'isolation' },
    { id: 'second_pull', tokens: ['lats', 'upper back', 'middle back'], keywords: [/\b(row|rowing|pulldown|pull[- ]?up|chin[- ]?up)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell', 'barbell'], optional: true },
  ],
  push: [
    { id: 'horizontal_press', tokens: ['chest', 'pectorals'], keywords: [/\b(bench press|chest press|push[- ]?up|dip)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'shoulder_press', tokens: ['shoulders', 'delts'], keywords: [/\b(shoulder press|overhead press|military press)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'chest_accessory', tokens: ['chest', 'pectorals'], keywords: [/\b(fly|flye|pec deck|cable crossover|chest press)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell'], mechanic: 'isolation' },
    { id: 'lateral_raise', tokens: ['shoulders', 'delts'], keywords: [/\b(lateral raise|side raise)\b/i], preferredEquipment: ['dumbbell', 'cable', 'machine'], mechanic: 'isolation' },
    { id: 'triceps', tokens: ['triceps'], keywords: [/\b(pushdown|triceps?|skullcrusher|extension)\b/i], preferredEquipment: ['cable', 'dumbbell', 'barbell'], mechanic: 'isolation' },
  ],
  legs: [
    { id: 'squat_press', tokens: ['quadriceps', 'quads'], keywords: [/\b(squat|leg press|hack squat)\b/i], preferredEquipment: ['barbell', 'machine'], mechanic: 'compound' },
    { id: 'hinge_curl', tokens: ['hamstrings'], keywords: [/\b(deadlift|romanian|rdl|leg curl|hamstring curl)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'unilateral_leg', tokens: ['quadriceps', 'glutes'], keywords: [/\b(lunge|split squat|step[- ]?up)\b/i], preferredEquipment: ['dumbbell', 'barbell', 'body'], optional: true },
    { id: 'calves', tokens: ['calves'], keywords: [/\b(calf raise|calf press|calves)\b/i], preferredEquipment: ['machine', 'dumbbell'], mechanic: 'isolation' },
    { id: 'glute_hip', tokens: ['glutes', 'adductors', 'abductors'], keywords: [/\b(hip thrust|glute bridge|adduction|abduction|adductor|abductor)\b/i], preferredEquipment: ['barbell', 'machine', 'cable'], optional: true },
  ],
  upper: [
    { id: 'horizontal_press', tokens: ['chest', 'pectorals'], keywords: [/\b(bench press|chest press|push[- ]?up)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'row', tokens: ['upper back', 'middle back', 'lats'], keywords: [/\b(row|rowing)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell', 'barbell'], mechanic: 'compound' },
    { id: 'vertical_pull', tokens: ['lats'], keywords: [/\b(pulldown|pull[- ]?up|chin[- ]?up)\b/i], preferredEquipment: ['cable', 'machine'], mechanic: 'compound' },
    { id: 'shoulder_accessory', tokens: ['shoulders', 'delts'], keywords: [/\b(shoulder press|lateral raise|side raise|rear delt|face pull)\b/i], preferredEquipment: ['dumbbell', 'cable', 'machine'], optional: true },
    { id: 'arm_accessory', tokens: ['biceps', 'triceps'], keywords: [/\b(curl|pushdown|triceps?|biceps)\b/i], preferredEquipment: ['dumbbell', 'cable', 'barbell'], optional: true },
  ],
  full_body: [
    { id: 'squat_press', tokens: ['quadriceps', 'quads'], keywords: [/\b(squat|leg press|hack squat)\b/i], preferredEquipment: ['barbell', 'machine', 'dumbbell'], mechanic: 'compound' },
    { id: 'press', tokens: ['chest', 'shoulders', 'pectorals'], keywords: [/\b(bench press|chest press|shoulder press|overhead press|push[- ]?up)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'row', tokens: ['upper back', 'middle back', 'lats'], keywords: [/\b(row|rowing)\b/i], preferredEquipment: ['cable', 'machine', 'dumbbell', 'barbell'], mechanic: 'compound' },
    { id: 'hinge', tokens: ['hamstrings', 'glutes'], keywords: [/\b(deadlift|romanian|rdl|hip thrust|glute bridge)\b/i], preferredEquipment: ['barbell', 'dumbbell', 'machine'], mechanic: 'compound' },
    { id: 'vertical_pull_core', tokens: ['lats', 'abs', 'obliques'], keywords: [/\b(pulldown|pull[- ]?up|chin[- ]?up|plank|crunch|leg raise)\b/i], preferredEquipment: ['cable', 'machine', 'body'], optional: true },
  ],
};

const getCanonicalOnboardingMatchScore = (exercise: ExerciseWithSource, slotId?: string) => {
  const ids = new Set(
    [exercise.id, exercise.remoteId, exercise.canonicalId]
      .filter((value): value is string => !!value)
      .map((value) => value.toLowerCase())
  );
  const lookupValues = new Set(
    [exercise.name, exercise.slug, exercise.canonicalKey, exercise.normalizedName]
      .filter((value): value is string => !!value)
      .map((value) => normalized(value))
  );
  let bestScore = 0;

  CANONICAL_ONBOARDING_EXERCISE_PREFERENCES.forEach((preference) => {
    if (slotId && !preference.slotIds.includes(slotId)) return;
    const preferenceName = normalized(preference.name);
    const preferenceSlug = normalized(preference.name.replace(/\s+/g, '-'));
    if (ids.has(preference.id.toLowerCase())) {
      bestScore = Math.max(bestScore, slotId ? 70 : 24);
      return;
    }
    if (lookupValues.has(preferenceName) || lookupValues.has(preferenceSlug)) {
      bestScore = Math.max(bestScore, slotId ? 54 : 18);
    }
  });

  return bestScore;
};

const getObscureOnboardingPenalty = (
  exercise: ExerciseWithSource,
  environment: TrainingEnvironment,
) => {
  const equipment = normalized(exercise.equipment);
  let penalty = isWeakOnboardingVariant(exercise) ? 28 : 0;
  if ((environment === 'gym' || environment === 'hybrid') && /\b(band|bands)\b/.test(equipment)) {
    penalty += 14;
  }
  return penalty;
};

const getExerciseFamily = (exercise: ExerciseWithSource): string => {
  const text = normalized(`${exercise.name} ${exercise.equipment}`)
    .replace(/\b(assisted|machine|cable|dumbbell|barbell|seated|standing|single arm|one arm|wide grip|close grip|incline|decline)\b/g, ' ')
    .replace(/\s+/g, ' ');

  if (/\b(pull up|pullup|chin up|chinup)\b/.test(text)) return 'vertical-pull-bodyweight';
  if (/\b(pulldown|pull down)\b/.test(text)) return 'vertical-pull-pulldown';
  if (/\b(row|rowing)\b/.test(text)) return 'row';
  if (/\b(face pull|rear delt|reverse fly|reverse pec deck)\b/.test(text)) return 'rear-delt-upper-back';
  if (/\b(shrug)\b/.test(text)) return 'shrug';
  if (/\b(deadlift|rack pull|rdl|romanian)\b/.test(text)) return 'hinge';
  if (/\b(calf raise|calf press)\b/.test(text)) return 'calf';
  if (/\b(squat|leg press|hack squat)\b/.test(text)) return 'squat';
  if (/\b(lunge|split squat|step up)\b/.test(text)) return 'unilateral-leg';
  if (/\b(leg curl|hamstring curl)\b/.test(text)) return 'leg-curl';
  if (/\b(leg extension)\b/.test(text)) return 'leg-extension';
  if (/\b(hip thrust|glute bridge)\b/.test(text)) return 'glute-bridge';
  if (/\b(adduction|adductor)\b/.test(text)) return 'adductor';
  if (/\b(abduction|abductor)\b/.test(text)) return 'abductor';
  if (/\b(bench press|chest press|push up|dip)\b/.test(text)) return 'horizontal-press';
  if (/\b(shoulder press|overhead press|military press)\b/.test(text)) return 'vertical-press';
  if (/\b(fly|flye|pec deck)\b/.test(text)) return 'fly';
  if (/\b(lateral raise|side raise)\b/.test(text)) return 'lateral-raise';
  if (/\b(curl)\b/.test(text)) return 'biceps-curl';
  if (/\b(pushdown|tricep|skullcrusher|extension)\b/.test(text)) return 'triceps';
  if (/\b(crunch|sit up|plank|leg raise)\b/.test(text)) return 'core';
  return exercise.canonicalKey || exercise.canonicalId || normalized(exercise.name);
};

const slotMatchesExercise = (exercise: ExerciseWithSource, slot: OnboardingMovementSlot): boolean => {
  const text = normalized(`${exercise.name} ${exercise.primaryMuscles.join(' ')} ${exercise.secondaryMuscles.join(' ')}`);
  return slot.keywords.some((pattern) => pattern.test(exercise.name) || pattern.test(text))
    || slot.tokens.some((token) => text.includes(normalized(token)));
};

const slotScoreExercise = (
  exercise: ExerciseWithSource,
  slot: OnboardingMovementSlot,
  focuses: MuscleFocus[],
  environment: TrainingEnvironment
) => {
  const baseScore = scoreExercise(exercise, focuses, environment);
  const equipment = normalized(exercise.equipment);
  const name = exercise.name;
  let score = baseScore;
  if (slot.keywords.some((pattern) => pattern.test(name))) score += 30;
  score += getCanonicalOnboardingMatchScore(exercise, slot.id);
  if (slot.preferredEquipment?.some((item) => equipment.includes(item))) score += 10;
  if (slot.mechanic === 'compound' && /\b(bench|press|row|pulldown|pull up|pull-up|squat|deadlift|rdl|lunge|leg press|hip thrust)\b/i.test(name)) score += 8;
  if (slot.mechanic === 'isolation' && /\b(curl|extension|fly|raise|pushdown|face pull|calf|adduction|abduction)\b/i.test(name)) score += 6;
  if ((environment === 'gym' || environment === 'hybrid') && usesGymEquipment(equipment)) score += 14;
  if ((environment === 'gym' || environment === 'hybrid') && /\b(bodyweight|body only)\b/.test(equipment)) score -= 12;
  if (environment === 'home' && usesHomeEquipment(equipment)) score += 4;
  score -= getObscureOnboardingPenalty(exercise, environment);
  return score;
};

const scoreExercise = (exercise: ExerciseWithSource, focuses: MuscleFocus[], environment: TrainingEnvironment) => {
  let score = 0;
  focuses.forEach((focus) => {
    if (exerciseMatchesMuscle(exercise, focus)) score += 8;
  });
  if (hasUsableExerciseGif(exercise)) score += 16;
  else score -= 20;
  const equipment = normalized(exercise.equipment);
  if (exercise.isCurated && !exercise.canonicalId) score += 12;
  else if (exercise.isCurated) score += 5;
  else if (!exercise.canonicalId) score += 2;
  if (exercise.source === 'custom') score -= 6;
  if ((environment === 'gym' || environment === 'hybrid') && usesGymEquipment(equipment)) score += 6;
  if ((environment === 'gym' || environment === 'hybrid') && usesHomeEquipment(equipment) && !usesGymEquipment(equipment)) score -= 2;
  if (environment === 'home' && usesHomeEquipment(equipment)) score += 3;
  if (/\b(bench|press|row|pulldown|pull up|pull-up|squat|deadlift|lunge|leg press|hip thrust)\b/i.test(exercise.name)) score += 2;
  score += getCanonicalOnboardingMatchScore(exercise);
  score -= getObscureOnboardingPenalty(exercise, environment);
  return score;
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
  const usableExercises = exercises.filter((exercise) => (
    !isLowValueGeneratedExercise(exercise) && hasUsableExerciseGif(exercise)
  ));
  if (usableExercises.length === 0) return null;

  const workouts = blueprint.workouts.map((workout) => {
    const requestedFocuses = workout.focus.includes('balanced') ? spec.muscleFocuses : workout.focus;
    const focuses = requestedFocuses.includes('balanced') ? focusForWorkoutName(workout.name) : requestedFocuses;
    const allowedExercises = usableExercises
      .filter((exercise) => equipmentAllowed(exercise, spec.trainingEnvironment));
    const eligibleExercises = allowedExercises
      .filter((exercise) => focuses.some((focus) => exerciseMatchesMuscle(exercise, focus)));
    const ranked = eligibleExercises
      .map((exercise) => ({ exercise, score: scoreExercise(exercise, focuses, spec.trainingEnvironment) }))
      .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

    const selected: ExerciseWithSource[] = [];
    const groups = new Set<string>();
    const selectedIds = new Set<string>();
    const addExercise = (exercise: ExerciseWithSource, options?: { allowFamilyDuplicate?: boolean }) => {
      const group = getExerciseFamily(exercise);
      const id = exercise.remoteId ?? exercise.id;
      if (selectedIds.has(id)) return false;
      if (!options?.allowFamilyDuplicate && groups.has(group)) return false;
      selected.push(exercise);
      selectedIds.add(id);
      groups.add(group);
      return true;
    };
    const addSlotExercise = (slot: OnboardingMovementSlot) => {
      if (selected.length >= targetExerciseCount) return;
      const candidates = allowedExercises
        .filter((exercise) => !selectedIds.has(exercise.remoteId ?? exercise.id))
        .filter((exercise) => !groups.has(getExerciseFamily(exercise)))
        .filter((exercise) => slotMatchesExercise(exercise, slot))
        .map((exercise) => ({
          exercise,
          canonicalScore: getCanonicalOnboardingMatchScore(exercise, slot.id),
          score: slotScoreExercise(exercise, slot, focuses, spec.trainingEnvironment),
        }))
        .sort((a, b) =>
          b.canonicalScore - a.canonicalScore
          || b.score - a.score
          || a.exercise.name.localeCompare(b.exercise.name)
        );
      const winner = candidates.find(({ exercise }) => !isWeakOnboardingVariant(exercise))?.exercise
        ?? candidates[0]?.exercise;
      if (winner && slot.optional && isWeakOnboardingVariant(winner)) {
        return;
      }
      if (winner) {
        addExercise(winner);
      }
    };
    const addRankedExercises = (
      candidates: Array<{ exercise: ExerciseWithSource; score: number }>,
      options?: { allowFamilyDuplicate?: boolean }
    ) => {
      for (const { exercise } of candidates) {
        if (selected.length >= targetExerciseCount) break;
        if (selected.length >= 3 && isWeakOnboardingVariant(exercise)) continue;
        addExercise(exercise, options);
      }
    };

    ONBOARDING_MOVEMENT_SLOTS[getWorkoutSlotKey(workout.name)]
      .filter((slot) => !slot.optional)
      .forEach((slot) => addSlotExercise(slot));

    ONBOARDING_MOVEMENT_SLOTS[getWorkoutSlotKey(workout.name)]
      .filter((slot) => slot.optional)
      .forEach((slot) => addSlotExercise(slot));

    addRankedExercises(ranked);
    addRankedExercises(ranked, { allowFamilyDuplicate: true });
    if (selected.length < 3) {
      for (const { exercise } of ranked) {
        if (selected.length >= targetExerciseCount || selected.length >= 3) break;
        addExercise(exercise, { allowFamilyDuplicate: true });
      }
    }

    return {
      name: workout.name,
      exercises: selected.map((exercise, index) =>
        buildExercise(exercise, index, trainingIntent, spec.goalPace)
      ),
    };
  }).filter((workout) => workout.exercises.length > 0);

  if (workouts.length === 0) return null;

  return {
    name: resolveOnboardingProgramName(spec),
    description: `${blueprint.subtitle} built for ${blueprint.environmentLabel.toLowerCase()} training.`,
    difficulty: spec.liftingExperience === 'advanced' ? 'advanced' : spec.liftingExperience === 'none' ? 'beginner' : 'intermediate',
    goal: trainingIntent === 'strength' ? 'strength' : trainingIntent === 'hypertrophy' ? 'hypertrophy' : 'general_fitness',
    durationWeeks: spec.durationWeeks,
    workouts,
    sourceSpecId: spec.id,
  };
}
