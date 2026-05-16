import { flushMixpanel } from '@/src/lib/mixpanel';
export {
  ONBOARDING_FUNNEL_STEPS,
  trackOnboardingFunnelScreen,
  useOnboardingFunnelScreen,
} from '@/src/lib/mixpanelOnboarding';

const ONBOARDING_STEP_INDEX = {
  profile_name: 1,
  gender: 2,
  birthdate: 3,
  body_metrics: 4,
  referral_source: 5,
  fitness_background: 6,
  lifting_experience: 7,
  workout_consistency: 8,
  workout_schedule: 9,
  tried_other_apps: 10,
  clarity_animation: 11,
  fitness_goals: 12,
  biggest_challenges: 13,
  fitness_motivations: 14,
  insights_preview: 15,
  privacy_thank_you: 16,
  social_proof: 17,
  app_rating: 18,
  notifications_prompt: 19,
} as const;

type OnboardingStepId = keyof typeof ONBOARDING_STEP_INDEX;

function flushPendingOnboardingEvents(reason: string): void {
  void flushMixpanel().catch((error) => {
    console.warn('[OnboardingAnalytics] Flush failed:', reason, error);
  });
}

export function trackOnboardingStepCompleted(stepId: OnboardingStepId): void {
  void ONBOARDING_STEP_INDEX[stepId];
  flushPendingOnboardingEvents('step_completed');
}

export function trackOnboardingFinished(): void {
  flushPendingOnboardingEvents('onboarding_finished');
}
