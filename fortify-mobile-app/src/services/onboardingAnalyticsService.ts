import { posthog } from '@/src/config/posthog';
import {
  getOnboardingStepProperties,
  type OnboardingStepId,
} from '@/src/lib/posthogOnboarding';
export {
  ONBOARDING_FUNNEL_STEPS,
  trackOnboardingFunnelScreen,
  useOnboardingFunnelScreen,
} from '@/src/lib/posthogOnboarding';

type OnboardingProperties = Record<string, unknown>;

export function trackOnboardingStepCompleted(
  stepId: OnboardingStepId,
  properties: OnboardingProperties = {}
): void {
  const stepProperties = getOnboardingStepProperties(stepId);
  if (!stepProperties) return;

  const onboardingProperties = {
    ...stepProperties,
    ...properties,
  };
  posthog.capture('onboarding_step_completed', onboardingProperties);
}

export function trackOnboardingFinished(properties: OnboardingProperties = {}): void {
  const onboardingProperties = {
    ...getOnboardingStepProperties('onboarding_complete'),
    ...properties,
  };
  posthog.capture('onboarding_completed', onboardingProperties);
}
