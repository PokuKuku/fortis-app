describe('mixpanelOnboarding', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = 'test-token';
  });

  it('tracks exact onboarding funnel screen events with required properties', async () => {
    const mockInit = jest.fn().mockResolvedValue(undefined);
    const mockTrack = jest.fn();
    const mockFlush = jest.fn();
    const mockGetDistinctId = jest.fn().mockResolvedValue('anon-123');
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: mockInit,
      track: mockTrack,
      flush: mockFlush,
      getDistinctId: mockGetDistinctId,
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));

    let trackOnboardingFunnelScreen!: (
      eventName: 'Q2. What\'s your gender?'
    ) => Promise<void>;
    jest.isolateModules(() => {
      ({ trackOnboardingFunnelScreen } = require('@/src/lib/mixpanelOnboarding'));
    });

    await trackOnboardingFunnelScreen("Q2. What's your gender?");

    expect(mockMixpanelCtor).toHaveBeenCalledWith('test-token', false, false);
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith("Q2. What's your gender?", {
      funnel_step: 4,
      screen_name: "Q2. What's your gender?",
      distinct_id: 'anon-123',
    });
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('keeps the configured funnel mapping in order', () => {
    let ONBOARDING_FUNNEL_STEPS!: Array<{ funnelStep: number; eventName: string }>;
    jest.isolateModules(() => {
      ({ ONBOARDING_FUNNEL_STEPS } = require('@/src/lib/mixpanelOnboarding'));
    });

    expect(ONBOARDING_FUNNEL_STEPS.map((step) => step.eventName)).toEqual([
      'Welcome Screen',
      'Profile Name',
      'Greeting',
      "Q2. What's your gender?",
      'Q3. Whats your birthdate?',
      "Q4. What's your height?",
      "Q5. What's your weight?",
      'Q6. How did you hear about us?',
      'Q7. Fitness Background',
      'Q8. Lifting Experience?',
      'Q9. How consistent are you',
      'Q10. Other apps?',
      'Q11. Fortify Clarity',
      'Q12. What is your fitness goal?',
      'Q13. What are you biggest challenge',
      'Q14. Fortify Provides Insights',
      'Thank you page',
      'Social Proof page',
      'Ask for rating page',
      'Ask for notifications page',
      'Onboarding Complete Page',
    ]);
    expect(ONBOARDING_FUNNEL_STEPS.map((step) => step.funnelStep)).toEqual(
      Array.from({ length: 21 }, (_, index) => index + 1)
    );
  });

  it('does not throw when track is unavailable', async () => {
    const mockInit = jest.fn().mockResolvedValue(undefined);
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: mockInit,
      track: undefined,
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));

    let trackAnonymousMixpanelEvent!: (
      eventName: string,
      properties: Record<string, unknown>
    ) => Promise<void>;
    jest.isolateModules(() => {
      ({ trackAnonymousMixpanelEvent } = require('@/src/lib/mixpanelOnboarding'));
    });

    await expect(
      trackAnonymousMixpanelEvent('onboarding_finished', {})
    ).resolves.toBeUndefined();
  });
});
