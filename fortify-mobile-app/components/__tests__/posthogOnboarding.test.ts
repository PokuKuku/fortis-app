const mockPostHogCapture = jest.fn();

jest.mock('@/src/config/posthog', () => ({
  posthog: {
    capture: (...args: unknown[]) => mockPostHogCapture(...args),
  },
}));

describe('posthogOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks onboarding funnel screen views with unique properties', async () => {
    const { trackOnboardingFunnelScreen } = require('@/src/lib/posthogOnboarding');

    await trackOnboardingFunnelScreen("Q2. What's your gender?");

    expect(mockPostHogCapture).toHaveBeenCalledWith(
      'onboarding_step_viewed',
      expect.objectContaining({
        step_id: 'gender',
        step_index: 4,
        funnel_step: 4,
        screen_name: "Q2. What's your gender?",
        route: '/onboarding/gender',
      })
    );
  });

  it('tracks onboarding started when the welcome screen is viewed', async () => {
    const { trackOnboardingFunnelScreen } = require('@/src/lib/posthogOnboarding');

    await trackOnboardingFunnelScreen('Welcome Screen');

    expect(mockPostHogCapture).toHaveBeenCalledWith(
      'onboarding_started',
      expect.objectContaining({
        step_id: 'welcome',
        step_index: 1,
        funnel_step: 1,
        screen_name: 'Welcome Screen',
        route: '/onboarding/welcome',
      })
    );
  });

  it('keeps every onboarding screen name and route unique', () => {
    const { ONBOARDING_FUNNEL_STEPS } = require('@/src/lib/posthogOnboarding');
    const names = ONBOARDING_FUNNEL_STEPS.map((step: { eventName: string }) => step.eventName);
    const routes = ONBOARDING_FUNNEL_STEPS.map((step: { route: string }) => step.route);
    const stepIds = ONBOARDING_FUNNEL_STEPS.map((step: { stepId: string }) => step.stepId);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(routes).size).toBe(routes.length);
    expect(new Set(stepIds).size).toBe(stepIds.length);
  });
});
