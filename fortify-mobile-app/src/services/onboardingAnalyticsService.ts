import {
  flushMixpanel,
  getMixpanelIdentityProperties,
  trackMixpanelEvent,
  type MixpanelProperties,
} from '@/src/lib/mixpanel';
export {
  ONBOARDING_FUNNEL_STEPS,
  trackOnboardingFunnelScreen,
  useOnboardingFunnelScreen,
} from '@/src/lib/mixpanelOnboarding';

const ONBOARDING_STEP_INDEX = {
  profile_name: 1,
  gender: 2,
  fitness_goals: 3,
  fitness_motivations: 4,
  lifting_experience: 5,
  tried_other_apps: 6,
  progress_blocker: 7,
  insights_preview: 8,
  program_setup_intro: 9,
  training_environment: 10,
  muscle_focus: 11,
  fitness_priorities: 12,
  workout_consistency: 13,
  workout_schedule: 14,
  session_duration: 15,
  goal_pace: 16,
  six_month_preview: 17,
  metrics_intro: 18,
  birthdate: 19,
  body_metrics: 20,
  referral_source: 22,
  privacy_thank_you: 23,
  social_proof: 24,
  app_rating: 25,
  notifications_prompt: 26,
  biggest_challenges: 99,
  fitness_background: 99,
} as const;

type OnboardingStepId = keyof typeof ONBOARDING_STEP_INDEX;

function flushPendingOnboardingEvents(reason: string): void {
  void flushMixpanel().catch((error) => {
    console.warn('[OnboardingAnalytics] Flush failed:', reason, error);
  });
}

export function trackOnboardingStepCompleted(
  stepId: OnboardingStepId,
  properties: MixpanelProperties = {}
): void {
  const stepIndex = ONBOARDING_STEP_INDEX[stepId];
  void (async () => {
    const identityProperties = await getMixpanelIdentityProperties();
    await trackMixpanelEvent(
      'Onboarding Step Completed',
      {
        step_id: stepId,
        step_index: stepIndex,
        ...identityProperties,
        ...properties,
      },
      { flush: true }
    );
  })().catch((error) => {
    console.warn('[OnboardingAnalytics] Step completion failed:', stepId, error);
    flushPendingOnboardingEvents('step_completed_fallback');
  });
}

export function trackOnboardingFinished(properties: MixpanelProperties = {}): void {
  void (async () => {
    const identityProperties = await getMixpanelIdentityProperties();
    await trackMixpanelEvent(
      'Onboarding Finished',
      {
        step_id: 'onboarding_finished',
        step_index: 27,
        ...identityProperties,
        ...properties,
      },
      { flush: true }
    );
  })().catch((error) => {
    console.warn('[OnboardingAnalytics] Finished event failed:', error);
    flushPendingOnboardingEvents('onboarding_finished_fallback');
  });
}
