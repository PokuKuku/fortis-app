const mockFlushMixpanel = jest.fn();

jest.mock('@/src/lib/mixpanel', () => ({
  flushMixpanel: (...args: unknown[]) => mockFlushMixpanel(...args),
  getMixpanelIdentityProperties: jest.fn(() => Promise.resolve({ distinct_id: 'anon-123' })),
  trackMixpanelEvent: jest.fn(() => Promise.resolve()),
}));

describe('onboardingAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('flushes pending events on onboarding step completion', () => {
    mockFlushMixpanel.mockResolvedValue(undefined);
    const { trackOnboardingStepCompleted } = require('@/src/services/onboardingAnalyticsService');

    trackOnboardingStepCompleted('profile_name');

    expect(mockFlushMixpanel).toHaveBeenCalledTimes(1);
  });

  it('swallows rejected tracking calls', async () => {
    mockFlushMixpanel.mockRejectedValue(new Error('tracking failed'));
    const { trackOnboardingFinished } = require('@/src/services/onboardingAnalyticsService');

    expect(() => trackOnboardingFinished()).not.toThrow();

    await Promise.resolve();
  });
});
