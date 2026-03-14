import { trackAnonymousMixpanelEvent } from '@/src/lib/mixpanelOnboarding';

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

function fireAndForgetTracking(eventName: string, properties: Record<string, unknown>): void {
  void trackAnonymousMixpanelEvent(eventName, properties).catch((error) => {
    console.warn('[OnboardingAnalytics] Tracking failed:', eventName, error);
  });
}

export function trackOnboardingStepCompleted(stepId: OnboardingStepId): void {
  fireAndForgetTracking('onboarding_step_completed', {
    step_id: stepId,
    step_index: ONBOARDING_STEP_INDEX[stepId],
  });
}

export function trackOnboardingFinished(): void {
  fireAndForgetTracking('onboarding_finished', {});
}
