const mockPostHogCapture = jest.fn();

jest.mock('@/src/config/posthog', () => ({
  posthog: {
    capture: (...args: unknown[]) => mockPostHogCapture(...args),
  },
}));

describe('onboardingAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks onboarding step completion with the configured step index', () => {
    const { trackOnboardingStepCompleted } = require('@/src/services/onboardingAnalyticsService');

    trackOnboardingStepCompleted('coach_personality');

    expect(mockPostHogCapture).toHaveBeenCalledWith(
      'onboarding_step_completed',
      expect.objectContaining({
        step_id: 'coach_personality',
        step_index: 20,
        screen_name: 'Q19. Voice Coach Personality',
        funnel_step: 20,
        route: '/onboarding/coach-personality',
      })
    );
  });

  it('tracks onboarding completion in PostHog', () => {
    const { trackOnboardingFinished } = require('@/src/services/onboardingAnalyticsService');

    trackOnboardingFinished({ fitness_goal: 'build_muscle' });

    expect(mockPostHogCapture).toHaveBeenCalledWith(
      'onboarding_completed',
      expect.objectContaining({
        step_id: 'onboarding_complete',
        step_index: 30,
        screen_name: 'Onboarding Complete Page',
        funnel_step: 30,
        route: '/onboarding/complete',
        fitness_goal: 'build_muscle',
      })
    );
  });

});
