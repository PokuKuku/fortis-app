import { ONBOARDING_STATE_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

export type OnboardingState = {
  full_name?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  preferred_units?: 'imperial' | 'metric';
  lifting_experience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  workouts_per_week?: number;
  workout_schedule_days?: number[];
  training_environment?: 'gym' | 'home' | 'hybrid';
  tried_other_apps?: 'consistent' | 'occasionally' | 'stopped' | 'never';
  heard_about?:
    | 'tiktok'
    | 'app_store'
    | 'instagram'
    | 'youtube'
    | 'friend_family'
    | 'reddit'
    | 'google'
    | 'x'
    | 'tv'
    | 'facebook'
    | 'other';
  fitness_goal?: 'build_muscle' | 'general_health' | 'lose_fat' | 'improve_strength' | 'stay_consistent';
  fitness_goals?: Array<
    'build_muscle' | 'general_health' | 'lose_fat' | 'improve_strength' | 'stay_consistent'
  >;
  fitness_outcomes?: Array<
    | 'build_visible_muscle'
    | 'strength_progress'
    | 'lose_body_fat'
    | 'improve_conditioning'
    | 'move_better'
    | 'training_consistency'
    | 'feel_strong_capable'
    | 'body_confidence'
    | 'daily_energy'
    | 'stay_consistent_long_term'
    | 'overall_health'
  >;
  muscle_focus?: 'balanced' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'glutes' | 'core';
  muscle_focuses?: Array<'balanced' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'glutes' | 'core'>;
  biggest_challenge?: 'consistency' | 'plateaus' | 'starting_out' | 'time';
  biggest_challenges?: Array<'consistency' | 'plateaus' | 'starting_out' | 'time'>;
  progress_blocker?: 'no_plan' | 'unclear_progress' | 'plateaus' | 'time' | 'accountability';
  fitness_motivation?:
    | 'self_confidence'
    | 'longevity'
    | 'daily_energy'
    | 'strength_capability'
    | 'body_confidence'
    | 'discipline';
  fitness_motivations?: Array<
    | 'self_confidence'
    | 'longevity'
    | 'daily_energy'
    | 'strength_capability'
    | 'body_confidence'
    | 'discipline'
  >;
  workout_consistency?: 'none' | 'daily' | 'few_times_week' | 'once_or_less' | 'starting';
  session_duration_minutes?: number;
  goal_pace?: 'steady' | 'balanced' | 'aggressive';
  program_name?: string;
  fitness_priorities?: Array<
    'strength'
    | 'muscle_growth'
    | 'fat_loss'
    | 'conditioning'
    | 'mobility'
    | 'consistency'
  >;
  fortify_use_cases?: Array<
    'track_workouts'
    | 'follow_program'
    | 'ai_insights'
    | 'progress_trends'
    | 'reminders_accountability'
  >;
};

let inMemoryState: OnboardingState | null = null;

export async function getOnboardingState(): Promise<OnboardingState | null> {
  if (inMemoryState) {
    return inMemoryState;
  }

  const stored = await getScopedItem(ONBOARDING_STATE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as OnboardingState;
    inMemoryState = parsed;
    return parsed;
  } catch {
    await removeScopedItem(ONBOARDING_STATE_KEY);
    return null;
  }
}

export async function updateOnboardingState(updates: Partial<OnboardingState>): Promise<OnboardingState> {
  const current = (await getOnboardingState()) ?? {};
  const next = { ...current, ...updates };
  inMemoryState = next;
  await setScopedItem(ONBOARDING_STATE_KEY, JSON.stringify(next));
  return next;
}

export async function clearOnboardingState(): Promise<void> {
  inMemoryState = null;
  await removeScopedItem(ONBOARDING_STATE_KEY);
}
