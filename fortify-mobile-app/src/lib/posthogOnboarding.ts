import { useEffect } from 'react';
import { posthog } from '@/src/config/posthog';

type OnboardingProperties = Record<string, unknown>;

export const ONBOARDING_FUNNEL_STEPS = [
  { stepId: 'welcome', funnelStep: 1, eventName: 'Welcome Screen', route: '/onboarding/welcome' },
  { stepId: 'profile_name', funnelStep: 2, eventName: 'Profile Name', route: '/onboarding' },
  { stepId: 'greeting', funnelStep: 3, eventName: 'Greeting', route: '/onboarding/greeting' },
  { stepId: 'gender', funnelStep: 4, eventName: "Q2. What's your gender?", route: '/onboarding/gender' },
  { stepId: 'fitness_goals', funnelStep: 5, eventName: 'Q14. What is your fitness goal?', route: '/onboarding/goal' },
  { stepId: 'fitness_motivations', funnelStep: 6, eventName: 'Q17. Fitness Motivation', route: '/onboarding/motivation' },
  { stepId: 'lifting_experience', funnelStep: 7, eventName: 'Q8. Lifting Experience?', route: '/onboarding/experience' },
  { stepId: 'tried_other_apps', funnelStep: 8, eventName: 'Q12. Other apps?', route: '/onboarding/other-apps' },
  { stepId: 'progress_blocker', funnelStep: 9, eventName: 'Q17. Progress Blocker', route: '/onboarding/progress-blocker' },
  { stepId: 'insights_preview', funnelStep: 10, eventName: 'Q18. Fortify Provides Insights', route: '/onboarding/insights' },
  { stepId: 'program_setup_intro', funnelStep: 11, eventName: 'Program Setup Intro', route: '/onboarding/program-setup-intro' },
  { stepId: 'training_environment', funnelStep: 12, eventName: 'Q11. Training Environment', route: '/onboarding/training-environment' },
  { stepId: 'muscle_focus', funnelStep: 13, eventName: 'Q15. Muscle Focus', route: '/onboarding/muscle-focus' },
  { stepId: 'fitness_priorities', funnelStep: 14, eventName: 'Q13. Fitness Priorities', route: '/onboarding/fitness-priorities' },
  { stepId: 'workout_consistency', funnelStep: 15, eventName: 'Q9. How consistent are you', route: '/onboarding/consistency' },
  { stepId: 'workout_schedule', funnelStep: 16, eventName: 'Q10. Workout Schedule', route: '/onboarding/workout-schedule' },
  { stepId: 'session_duration', funnelStep: 17, eventName: 'Q16. Session Duration', route: '/onboarding/session-duration' },
  { stepId: 'goal_pace', funnelStep: 18, eventName: 'Q17. Goal Pace', route: '/onboarding/goal-pace' },
  { stepId: 'six_month_preview', funnelStep: 19, eventName: 'Q9. Six Month Preview', route: '/onboarding/six-month-preview' },
  { stepId: 'coach_personality', funnelStep: 20, eventName: 'Q19. Voice Coach Personality', route: '/onboarding/coach-personality' },
  { stepId: 'metrics_intro', funnelStep: 21, eventName: 'Metrics Intro', route: '/onboarding/metrics-intro' },
  { stepId: 'birthdate', funnelStep: 22, eventName: 'Q3. Whats your birthdate?', route: '/onboarding/birthdate' },
  { stepId: 'height', funnelStep: 23, eventName: "Q4. What's your height?", route: '/onboarding/height' },
  { stepId: 'weight', funnelStep: 24, eventName: "Q5. What's your weight?", route: '/onboarding/weight' },
  { stepId: 'referral_source', funnelStep: 25, eventName: 'Q6. How did you hear about us?', route: '/onboarding/source' },
  { stepId: 'privacy_thank_you', funnelStep: 26, eventName: 'Thank you page', route: '/onboarding/thank-you' },
  { stepId: 'social_proof', funnelStep: 27, eventName: 'Social Proof page', route: '/onboarding/social-proof' },
  { stepId: 'app_rating', funnelStep: 28, eventName: 'Ask for rating page', route: '/onboarding/rating' },
  { stepId: 'notifications_prompt', funnelStep: 29, eventName: 'Ask for notifications page', route: '/onboarding/notifications' },
  { stepId: 'onboarding_complete', funnelStep: 30, eventName: 'Onboarding Complete Page', route: '/onboarding/complete' },
  { stepId: 'biggest_challenges', funnelStep: 98, eventName: 'Q16. What are you biggest challenge', route: '/onboarding/challenge' },
  { stepId: 'fitness_background', funnelStep: 99, eventName: 'Q7. Fitness Background', route: '/onboarding/fitness-background' },
] as const;

export type OnboardingFunnelEventName =
  (typeof ONBOARDING_FUNNEL_STEPS)[number]['eventName'];
export type OnboardingStepId = (typeof ONBOARDING_FUNNEL_STEPS)[number]['stepId'];

export function getOnboardingFunnelStep(eventName: OnboardingFunnelEventName) {
  return ONBOARDING_FUNNEL_STEPS.find((step) => step.eventName === eventName);
}

export function getOnboardingFunnelStepById(stepId: OnboardingStepId) {
  return ONBOARDING_FUNNEL_STEPS.find((step) => step.stepId === stepId);
}

export function getOnboardingStepProperties(stepId: OnboardingStepId) {
  const step = getOnboardingFunnelStepById(stepId);
  if (!step) return null;

  return {
    step_id: step.stepId,
    step_index: step.funnelStep,
    screen_name: step.eventName,
    funnel_step: step.funnelStep,
    route: step.route,
  };
}

export async function trackOnboardingFunnelScreen(
  eventName: OnboardingFunnelEventName,
  properties: OnboardingProperties = {}
): Promise<void> {
  const step = getOnboardingFunnelStep(eventName);
  if (!step) {
    console.warn('[PostHog] Unknown onboarding funnel event:', eventName);
    return;
  }

  const onboardingProperties = {
    ...getOnboardingStepProperties(step.stepId),
    ...properties,
  };

  if (step.funnelStep === 1) {
    posthog.capture('onboarding_started', onboardingProperties);
  }
  posthog.capture('onboarding_step_viewed', onboardingProperties);
}

export function useOnboardingFunnelScreen(
  eventName: OnboardingFunnelEventName,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void trackOnboardingFunnelScreen(eventName).catch((error) => {
      console.warn('[PostHog] Failed to track onboarding funnel screen:', eventName, error);
    });
  }, [enabled, eventName]);
}
