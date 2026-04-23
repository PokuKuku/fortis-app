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
    expect(mockTrack).toHaveBeenCalledWith('screen_view', {
      pathname: '/onboarding/welcome',
    });
  });

  it('identifies authenticated users and refreshes super properties', async () => {
    const mockIdentify = jest.fn().mockResolvedValue(undefined);
    const mockClearSuperProperties = jest.fn();
    const mockRegisterSuperProperties = jest.fn();
    const mockPeopleSet = jest.fn();
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

    let identifyMixpanelUser!: (userContext: Record<string, unknown>) => Promise<void>;
    jest.isolateModules(() => {
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
  });
});
