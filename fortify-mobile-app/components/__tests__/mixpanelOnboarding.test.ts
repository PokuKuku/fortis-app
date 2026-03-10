describe('mixpanelOnboarding', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = 'test-token';
  });

  it('initializes Mixpanel in JS mode and tracks events', async () => {
    const mockInit = jest.fn().mockResolvedValue(undefined);
    const mockTrack = jest.fn();
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: mockInit,
      track: mockTrack,
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));

    let trackAnonymousMixpanelEvent: (
      eventName: string,
      properties: Record<string, unknown>
    ) => Promise<void>;
    jest.isolateModules(() => {
      ({ trackAnonymousMixpanelEvent } = require('@/src/lib/mixpanelOnboarding'));
    });

    await trackAnonymousMixpanelEvent('onboarding_finished', {});

    expect(mockMixpanelCtor).toHaveBeenCalledWith('test-token', false, false);
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('onboarding_finished', {});
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

    let trackAnonymousMixpanelEvent: (
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
