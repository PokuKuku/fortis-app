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
  tried_other_apps: 9,
  clarity_animation: 10,
  fitness_goals: 11,
  biggest_challenges: 12,
  insights_preview: 13,
  privacy_thank_you: 14,
  social_proof: 15,
  app_rating: 16,
  notifications_prompt: 17,
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
