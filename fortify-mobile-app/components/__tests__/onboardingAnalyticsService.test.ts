const mockFlushMixpanel = jest.fn();
const mockTrackMixpanelEvent = jest.fn(() => Promise.resolve());

jest.mock('@/src/lib/mixpanel', () => ({
  flushMixpanel: (...args: unknown[]) => mockFlushMixpanel(...args),
  getMixpanelIdentityProperties: jest.fn(() => Promise.resolve({ distinct_id: 'anon-123' })),
  trackMixpanelEvent: mockTrackMixpanelEvent,
}));

describe('onboardingAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks onboarding step completion with the configured step index', async () => {
    mockFlushMixpanel.mockResolvedValue(undefined);
    const { trackOnboardingStepCompleted } = require('@/src/services/onboardingAnalyticsService');

    trackOnboardingStepCompleted('coach_personality');

    await Promise.resolve();

    expect(mockTrackMixpanelEvent).toHaveBeenCalledWith(
      'Onboarding Step Completed',
      expect.objectContaining({
        step_id: 'coach_personality',
        step_index: 18,
        distinct_id: 'anon-123',
      }),
      { flush: true }
    );

  });

  it('swallows rejected tracking calls', async () => {
    mockFlushMixpanel.mockRejectedValue(new Error('tracking failed'));
    const { trackOnboardingFinished } = require('@/src/services/onboardingAnalyticsService');

    expect(() => trackOnboardingFinished()).not.toThrow();

    await Promise.resolve();
  });
});
