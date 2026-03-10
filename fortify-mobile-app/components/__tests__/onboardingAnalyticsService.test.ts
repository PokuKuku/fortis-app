const mockTrackAnonymousMixpanelEvent = jest.fn();

jest.mock('@/src/lib/mixpanelOnboarding', () => ({
  trackAnonymousMixpanelEvent: (...args: unknown[]) =>
    mockTrackAnonymousMixpanelEvent(...args),
}));

describe('onboardingAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks onboarding step completion', () => {
    mockTrackAnonymousMixpanelEvent.mockResolvedValue(undefined);
    const { trackOnboardingStepCompleted } = require('@/src/services/onboardingAnalyticsService');

    trackOnboardingStepCompleted('profile_name');

    expect(mockTrackAnonymousMixpanelEvent).toHaveBeenCalledWith(
      'onboarding_step_completed',
      expect.objectContaining({
        step_id: 'profile_name',
        step_index: 1,
      }),
    );
  });

  it('swallows rejected tracking calls', async () => {
    mockTrackAnonymousMixpanelEvent.mockRejectedValue(new Error('tracking failed'));
    const { trackOnboardingFinished } = require('@/src/services/onboardingAnalyticsService');

    expect(() => trackOnboardingFinished()).not.toThrow();

    await Promise.resolve();
  });
});
