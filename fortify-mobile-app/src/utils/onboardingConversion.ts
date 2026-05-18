import { PENDING_ONBOARDING_CONVERSION_CONTEXT_KEY } from '@/src/constants/storageKeys';
import type { OnboardingState } from '@/src/utils/onboardingState';
import {
  buildOnboardingProgramBlueprint,
  buildOnboardingProgramSpec,
  type OnboardingProgramBlueprint,
} from '@/src/utils/onboardingProgram';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

export type ProgressBlocker = NonNullable<OnboardingState['progress_blocker']>;

export type OnboardingConversionContext = Record<string, string | number | boolean | null>;

export const ONBOARDING_CONVERSION_VARIANT = 'diagnose_build_unlock_v1';

export const PROGRESS_BLOCKER_LABELS: Record<ProgressBlocker, string> = {
  no_plan: 'Not knowing what to do next',
  unclear_progress: 'Not knowing if I am improving',
  plateaus: 'Getting stuck at the same weights',
  time: 'Workouts taking too long',
  accountability: 'Falling off my routine',
};

export const PROGRESS_BLOCKER_FEATURE_COPY: Record<ProgressBlocker, string> = {
  no_plan: 'Fortify turns your answers into a clear program before you train.',
  unclear_progress: 'Progress trends and AI insights show what is actually changing.',
  plateaus: 'Previous-lift guidance and AI adjustments help you break through stalls.',
  time: 'Your session length shapes exercise count, rest density, and workout structure.',
  accountability: 'Schedule, reminders, and clear next steps keep the routine easier to repeat.',
};

export const CHALLENGE_LABELS: Record<NonNullable<OnboardingState['biggest_challenge']>, string> = {
  consistency: 'Consistency',
  plateaus: 'Plateaus',
  starting_out: 'Starting out',
  time: 'Time',
};

export const MOTIVATION_COPY: Record<NonNullable<OnboardingState['fitness_motivation']>, string> = {
  self_confidence: 'increased confidence outside the gym',
  longevity: 'training that supports the long game',
  daily_energy: 'more energy for the rest of your day',
  strength_capability: 'feeling stronger and more capable',
  body_confidence: 'feeling better in your body',
  discipline: 'proof that you can follow through',
};

const joinValues = (values: readonly string[] | null | undefined) => {
  const filtered = values?.filter(Boolean) ?? [];
  return filtered.length > 0 ? filtered.join(', ') : null;
};

const firstValue = <T,>(values: readonly T[] | null | undefined, fallback?: T | null) => (
  values && values.length > 0 ? values[0] : fallback ?? null
);

export function getPrimaryProgressBlocker(state: OnboardingState | null | undefined): ProgressBlocker | null {
  return state?.progress_blocker ?? null;
}

export function getProgressBlockerInsightCopy(
  state: OnboardingState | null | undefined
): { label: string; feature: string } {
  const blocker = getPrimaryProgressBlocker(state);
  if (blocker) {
    return {
      label: PROGRESS_BLOCKER_LABELS[blocker],
      feature: PROGRESS_BLOCKER_FEATURE_COPY[blocker],
    };
  }

  const primaryChallenge = firstValue(state?.biggest_challenges, state?.biggest_challenge);
  if (primaryChallenge === 'plateaus') {
    return {
      label: CHALLENGE_LABELS.plateaus,
      feature: PROGRESS_BLOCKER_FEATURE_COPY.plateaus,
    };
  }
  if (primaryChallenge === 'time') {
    return {
      label: CHALLENGE_LABELS.time,
      feature: PROGRESS_BLOCKER_FEATURE_COPY.time,
    };
  }
  if (primaryChallenge === 'starting_out') {
    return {
      label: CHALLENGE_LABELS.starting_out,
      feature: PROGRESS_BLOCKER_FEATURE_COPY.no_plan,
    };
  }

  return {
    label: CHALLENGE_LABELS.consistency,
    feature: PROGRESS_BLOCKER_FEATURE_COPY.accountability,
  };
}

export function buildOnboardingConversionContext(
  state: OnboardingState | null | undefined,
): OnboardingConversionContext {
  const spec = buildOnboardingProgramSpec(state);
  const blueprint: OnboardingProgramBlueprint = buildOnboardingProgramBlueprint(spec);
  const primaryGoal = firstValue(state?.fitness_goals, state?.fitness_goal);
  const primaryOutcome = firstValue(state?.fitness_outcomes, null);
  const primaryChallenge = firstValue(state?.biggest_challenges, state?.biggest_challenge);
  const primaryMotivation = firstValue(state?.fitness_motivations, state?.fitness_motivation);
  const progressBlocker = getPrimaryProgressBlocker(state);

  return {
    onboarding_conversion_variant: ONBOARDING_CONVERSION_VARIANT,
    onboarding_goal: primaryGoal,
    onboarding_goals: joinValues(state?.fitness_goals),
    onboarding_primary_outcome: primaryOutcome,
    onboarding_outcomes: joinValues(state?.fitness_outcomes),
    onboarding_motivation: primaryMotivation,
    onboarding_motivations: joinValues(state?.fitness_motivations),
    onboarding_primary_challenge: primaryChallenge,
    onboarding_challenges: joinValues(state?.biggest_challenges),
    onboarding_progress_blocker: progressBlocker,
    onboarding_progress_blocker_label: progressBlocker ? PROGRESS_BLOCKER_LABELS[progressBlocker] : null,
    onboarding_experience: state?.lifting_experience ?? null,
    onboarding_tried_other_apps: state?.tried_other_apps ?? null,
    onboarding_training_environment: state?.training_environment ?? null,
    onboarding_muscle_focuses: joinValues(state?.muscle_focuses),
    onboarding_fitness_priorities: joinValues(state?.fitness_priorities),
    onboarding_workouts_per_week: state?.workouts_per_week ?? spec.workoutsPerWeek,
    onboarding_schedule_days_count: spec.scheduleDays.length,
    onboarding_session_duration_minutes: spec.sessionDurationMinutes,
    onboarding_goal_pace: spec.goalPace,
    onboarding_fortify_use_cases: joinValues(state?.fortify_use_cases),
    onboarding_heard_about: state?.heard_about ?? null,
    onboarding_program_name: blueprint.name,
    onboarding_program_subtitle: blueprint.subtitle,
    onboarding_program_duration_weeks: blueprint.durationWeeks,
    onboarding_program_schedule_label: blueprint.scheduleLabel,
    onboarding_program_focus_label: blueprint.focusLabel,
    onboarding_program_environment_label: blueprint.environmentLabel,
    onboarding_program_workout_count: blueprint.workouts.length,
    onboarding_program_first_workout: blueprint.workouts[0]?.name ?? null,
    onboarding_completed_at: new Date().toISOString(),
  };
}

export async function savePendingOnboardingConversionContext(
  context: OnboardingConversionContext
): Promise<void> {
  await setScopedItem(PENDING_ONBOARDING_CONVERSION_CONTEXT_KEY, JSON.stringify(context));
}

export async function loadPendingOnboardingConversionContext(): Promise<OnboardingConversionContext | null> {
  const raw = await getScopedItem(PENDING_ONBOARDING_CONVERSION_CONTEXT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OnboardingConversionContext;
  } catch {
    await removeScopedItem(PENDING_ONBOARDING_CONVERSION_CONTEXT_KEY);
    return null;
  }
}

export async function clearPendingOnboardingConversionContext(): Promise<void> {
  await removeScopedItem(PENDING_ONBOARDING_CONVERSION_CONTEXT_KEY);
}
