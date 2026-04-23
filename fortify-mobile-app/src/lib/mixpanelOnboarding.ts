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
  { funnelStep: 5, eventName: 'Q3. Whats your birthdate?', route: '/onboarding/birthdate' },
  { funnelStep: 6, eventName: "Q4. What's your height?", route: '/onboarding/height' },
  { funnelStep: 7, eventName: "Q5. What's your weight?", route: '/onboarding/weight' },
  { funnelStep: 8, eventName: 'Q6. How did you hear about us?', route: '/onboarding/source' },
  { funnelStep: 9, eventName: 'Q7. Fitness Background', route: '/onboarding/fitness-background' },
  { funnelStep: 10, eventName: 'Q8. Lifting Experience?', route: '/onboarding/experience' },
  { funnelStep: 11, eventName: 'Q9. How consistent are you', route: '/onboarding/consistency' },
  { funnelStep: 12, eventName: 'Q10. Other apps?', route: '/onboarding/other-apps' },
  { funnelStep: 13, eventName: 'Q11. Fortify Clarity', route: '/onboarding/clarity' },
  { funnelStep: 14, eventName: 'Q12. What is your fitness goal?', route: '/onboarding/goal' },
  { funnelStep: 15, eventName: 'Q13. What are you biggest challenge', route: '/onboarding/challenge' },
  { funnelStep: 16, eventName: 'Q14. Fortify Provides Insights', route: '/onboarding/insights' },
  { funnelStep: 17, eventName: 'Thank you page', route: '/onboarding/thank-you' },
  { funnelStep: 18, eventName: 'Social Proof page', route: '/onboarding/social-proof' },
  { funnelStep: 19, eventName: 'Ask for rating page', route: '/onboarding/rating' },
  { funnelStep: 20, eventName: 'Ask for notifications page', route: '/onboarding/notifications' },
  { funnelStep: 21, eventName: 'Onboarding Complete Page', route: '/onboarding/complete' },
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
