describe('mixpanel', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = 'test-token';
    process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL = 'https://api.mixpanel.com';
    process.env.EXPO_PUBLIC_APP_ENV = 'test';
  });

  it('tracks events in JS mode', async () => {
    const mockInit = jest.fn().mockResolvedValue(undefined);
    const mockTrack = jest.fn();
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: mockInit,
      track: mockTrack,
      identify: jest.fn().mockResolvedValue(undefined),
      clearSuperProperties: jest.fn(),
      registerSuperProperties: jest.fn(),
      reset: jest.fn(),
      getPeople: jest.fn(() => ({ set: jest.fn() })),
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));

    let trackMixpanelEvent!: (
      eventName: string,
      properties?: Record<string, unknown>
    ) => Promise<void>;
    jest.isolateModules(() => {
      ({ trackMixpanelEvent } = require('@/src/lib/mixpanel'));
    });

    await trackMixpanelEvent('screen_view', { pathname: '/onboarding/welcome' });

    expect(mockMixpanelCtor).toHaveBeenCalledWith('test-token', false, false);
    expect(mockInit).toHaveBeenCalledWith(
      false,
      expect.objectContaining({
        app_environment: 'test',
        app_platform: expect.any(String),
        auth_state: 'anonymous',
      }),
      'https://api.mixpanel.com'
    );
    expect(mockTrack).toHaveBeenCalledWith(
      'screen_view',
      expect.objectContaining({
        pathname: '/onboarding/welcome',
        time: expect.any(Number),
      })
    );
  });

  it('identifies authenticated users and refreshes super properties', async () => {
    const mockIdentify = jest.fn().mockResolvedValue(undefined);
    const mockClearSuperProperties = jest.fn();
    const mockRegisterSuperProperties = jest.fn();
    const mockPeopleSet = jest.fn();
    const mockReplayInitialize = jest.fn().mockResolvedValue(undefined);
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      track: jest.fn(),
      identify: mockIdentify,
      clearSuperProperties: mockClearSuperProperties,
      registerSuperProperties: mockRegisterSuperProperties,
      reset: jest.fn(),
      getPeople: jest.fn(() => ({ set: mockPeopleSet })),
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));
    jest.doMock('@mixpanel/react-native-session-replay', () => ({
      MPSessionReplay: {
        initialize: mockReplayInitialize,
        identify: jest.fn().mockResolvedValue(undefined),
      },
      MPSessionReplayConfig: jest.fn().mockImplementation((config = {}) => config),
      MPSessionReplayMask: {
        Text: 'text',
        Web: 'web',
        Map: 'map',
        Image: 'image',
      },
      MPSessionReplayRemoteSettingsMode: {
        Disabled: 'disabled',
      },
    }));

    let identifyMixpanelUser!: (userContext: Record<string, unknown>) => Promise<void>;
    jest.isolateModules(() => {
      require('react-native').NativeModules.MixpanelReactNativeSessionReplay = {};
      ({ identifyMixpanelUser } = require('@/src/lib/mixpanel'));
    });

    await identifyMixpanelUser({
      distinctId: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      preferredUnits: 'imperial',
      onboardingCompleted: true,
      themeMode: 'dark',
      accentColor: 'midnight',
    });

    expect(mockIdentify).toHaveBeenCalledWith('user-123');
    expect(mockClearSuperProperties).toHaveBeenCalled();
    expect(mockRegisterSuperProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        auth_state: 'authenticated',
        user_id: 'user-123',
        email: 'test@example.com',
        preferred_units: 'imperial',
      })
    );
    expect(mockPeopleSet).toHaveBeenCalledWith(
      expect.objectContaining({
        $email: 'test@example.com',
        $name: 'Test User',
      })
    );
    expect(mockReplayInitialize).toHaveBeenCalledWith(
      'test-token',
      'user-123',
      expect.objectContaining({
        autoStartRecording: true,
        recordingSessionsPercent: 100,
        wifiOnly: true,
      })
    );
  });

  it('initializes session replay with the anonymous Mixpanel distinct id', async () => {
    process.env.EXPO_PUBLIC_MIXPANEL_REPLAY_SAMPLE_RATE = '25';
    const mockInit = jest.fn().mockResolvedValue(undefined);
    const mockGetDistinctId = jest.fn().mockResolvedValue('anon-123');
    const mockReplayInitialize = jest.fn().mockResolvedValue(undefined);
    const mockConfigCtor = jest.fn().mockImplementation((config = {}) => config);
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: mockInit,
      track: jest.fn(),
      identify: jest.fn().mockResolvedValue(undefined),
      clearSuperProperties: jest.fn(),
      registerSuperProperties: jest.fn(),
      reset: jest.fn(),
      getDistinctId: mockGetDistinctId,
      getPeople: jest.fn(() => ({ set: jest.fn() })),
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));
    jest.doMock('@mixpanel/react-native-session-replay', () => ({
      MPSessionReplay: {
        initialize: mockReplayInitialize,
        identify: jest.fn().mockResolvedValue(undefined),
      },
      MPSessionReplayConfig: mockConfigCtor,
      MPSessionReplayMask: {
        Text: 'text',
        Web: 'web',
        Map: 'map',
        Image: 'image',
      },
      MPSessionReplayRemoteSettingsMode: {
        Disabled: 'disabled',
      },
    }));

    let initializeMixpanel!: () => Promise<boolean>;
    jest.isolateModules(() => {
      require('react-native').NativeModules.MixpanelReactNativeSessionReplay = {};
      ({ initializeMixpanel } = require('@/src/lib/mixpanel'));
    });

    await expect(initializeMixpanel()).resolves.toBe(true);

    expect(mockReplayInitialize).toHaveBeenCalledWith(
      'test-token',
      'anon-123',
      expect.objectContaining({
        recordingSessionsPercent: 25,
        autoMaskedViews: ['text', 'image', 'web', 'map'],
      })
    );
  });

  it('skips session replay when the native module is not linked', async () => {
    const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      track: jest.fn(),
      identify: jest.fn().mockResolvedValue(undefined),
      clearSuperProperties: jest.fn(),
      registerSuperProperties: jest.fn(),
      reset: jest.fn(),
      getDistinctId: jest.fn().mockResolvedValue('anon-123'),
      getPeople: jest.fn(() => ({ set: jest.fn() })),
    }));

    jest.doMock('mixpanel-react-native', () => ({
      Mixpanel: mockMixpanelCtor,
    }));
    jest.doMock('@mixpanel/react-native-session-replay', () => {
      throw new Error('should not import unlinked replay package');
    });

    let initializeMixpanel!: () => Promise<boolean>;
    jest.isolateModules(() => {
      delete require('react-native').NativeModules.MixpanelReactNativeSessionReplay;
      ({ initializeMixpanel } = require('@/src/lib/mixpanel'));
    });

    await expect(initializeMixpanel()).resolves.toBe(true);

    expect(mockWarn).toHaveBeenCalledWith(
      '[Mixpanel] Session Replay native module is not linked; rebuild the native app to enable replay.'
    );
    mockWarn.mockRestore();
  });
});
