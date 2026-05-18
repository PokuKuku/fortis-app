import { useEffect } from 'react';
import {
  getMixpanelIdentityProperties,
  trackMixpanelEvent,
  type MixpanelProperties,
} from '@/src/lib/mixpanel';

export const ONBOARDING_FUNNEL_STEPS = [
  { funnelStep: 1, eventName: 'Welcome Screen', route: '/onboarding/welcome' },
  { funnelStep: 2, eventName: 'Profile Name', route: '/onboarding' },
  { funnelStep: 3, eventName: 'Greeting', route: '/onboarding/greeting' },
  { funnelStep: 4, eventName: "Q2. What's your gender?", route: '/onboarding/gender' },
  { funnelStep: 5, eventName: 'Q14. What is your fitness goal?', route: '/onboarding/goal' },
  { funnelStep: 6, eventName: 'Q17. Fitness Motivation', route: '/onboarding/motivation' },
  { funnelStep: 7, eventName: 'Q8. Lifting Experience?', route: '/onboarding/experience' },
  { funnelStep: 8, eventName: 'Q12. Other apps?', route: '/onboarding/other-apps' },
  { funnelStep: 9, eventName: 'Q17. Progress Blocker', route: '/onboarding/progress-blocker' },
  { funnelStep: 10, eventName: 'Q18. Fortify Provides Insights', route: '/onboarding/insights' },
  { funnelStep: 11, eventName: 'Program Setup Intro', route: '/onboarding/program-setup-intro' },
  { funnelStep: 12, eventName: 'Q11. Training Environment', route: '/onboarding/training-environment' },
  { funnelStep: 13, eventName: 'Q15. Muscle Focus', route: '/onboarding/muscle-focus' },
  { funnelStep: 14, eventName: 'Q13. Fitness Priorities', route: '/onboarding/fitness-priorities' },
  { funnelStep: 15, eventName: 'Q9. How consistent are you', route: '/onboarding/consistency' },
  { funnelStep: 16, eventName: 'Q10. Workout Schedule', route: '/onboarding/workout-schedule' },
  { funnelStep: 17, eventName: 'Q16. Session Duration', route: '/onboarding/session-duration' },
  { funnelStep: 18, eventName: 'Q17. Goal Pace', route: '/onboarding/goal-pace' },
  { funnelStep: 19, eventName: 'Q9. Six Month Preview', route: '/onboarding/six-month-preview' },
  { funnelStep: 20, eventName: 'Q18. Program Name', route: '/onboarding/program-name' },
  { funnelStep: 21, eventName: 'Metrics Intro', route: '/onboarding/metrics-intro' },
  { funnelStep: 22, eventName: 'Q3. Whats your birthdate?', route: '/onboarding/birthdate' },
  { funnelStep: 23, eventName: "Q4. What's your height?", route: '/onboarding/height' },
  { funnelStep: 24, eventName: "Q5. What's your weight?", route: '/onboarding/weight' },
  { funnelStep: 25, eventName: 'Q6. How did you hear about us?', route: '/onboarding/source' },
  { funnelStep: 26, eventName: 'Thank you page', route: '/onboarding/thank-you' },
  { funnelStep: 27, eventName: 'Social Proof page', route: '/onboarding/social-proof' },
  { funnelStep: 28, eventName: 'Ask for rating page', route: '/onboarding/rating' },
  { funnelStep: 29, eventName: 'Ask for notifications page', route: '/onboarding/notifications' },
  { funnelStep: 30, eventName: 'Onboarding Complete Page', route: '/onboarding/complete' },
  { funnelStep: 98, eventName: 'Q16. What are you biggest challenge', route: '/onboarding/challenge' },
  { funnelStep: 99, eventName: 'Q7. Fitness Background', route: '/onboarding/fitness-background' },
] as const;

export type OnboardingFunnelEventName =
  (typeof ONBOARDING_FUNNEL_STEPS)[number]['eventName'];

export function getOnboardingFunnelStep(eventName: OnboardingFunnelEventName) {
  return ONBOARDING_FUNNEL_STEPS.find((step) => step.eventName === eventName);
}

export async function trackOnboardingFunnelScreen(
  eventName: OnboardingFunnelEventName,
  properties: MixpanelProperties = {}
): Promise<void> {
  const step = getOnboardingFunnelStep(eventName);
  if (!step) {
    console.warn('[Mixpanel] Unknown onboarding funnel event:', eventName);
    return;
  }

  const identityProperties = await getMixpanelIdentityProperties();
  await trackMixpanelEvent(
    eventName,
    {
      funnel_step: step.funnelStep,
      screen_name: eventName,
      ...identityProperties,
      ...properties,
    },
    { flush: true }
  );
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
      console.warn('[Mixpanel] Failed to track onboarding funnel screen:', eventName, error);
    });
  }, [enabled, eventName]);
}

export async function trackAnonymousMixpanelEvent(
  eventName: string,
  properties: Record<string, unknown>
): Promise<void> {
  await trackMixpanelEvent(eventName, properties);
}
