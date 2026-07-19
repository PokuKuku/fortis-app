import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';

const mockRegisterPlacement = jest.fn();
let mockPlacementHandlers: {
  onDismiss?: (paywallInfo: unknown, result: { type: string }) => void;
  onSkip?: (reason: unknown) => void;
  onError?: (error: string) => void;
} = {};
const mockIdentify = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockGetEntitlements = jest.fn().mockResolvedValue({ active: [] });
const mockSetSubscriptionStatus = jest.fn().mockResolvedValue(undefined);
const mockQueueTourStartAfterPaywallClose = jest.fn();
const mockReplace = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();
const mockClearPendingOnboardingAuthCompletion = jest.fn().mockResolvedValue(undefined);
const mockSubscriptionStatusState: { status: string; entitlements?: Array<{ id: string; type: string }> } = {
  status: 'INACTIVE',
};

const mockSuperwallState = {
  isConfigured: false,
  isLoading: false,
  configurationError: new Error('config failed') as Error | null,
};

const mockAuthState = {
  user: { id: 'user-1' as string | null },
  isAuthResolved: true,
  profile: { onboarding_completed: true } as { onboarding_completed: boolean } | null,
  profileResolved: true,
  needsOnboarding: false,
};

const mockSuperwallUserState = {
  appUserId: 'user-1' as string | null,
};

jest.mock(
  'expo-superwall',
  () => ({
    usePlacement: jest.fn((handlers) => {
      mockPlacementHandlers = handlers;
      return {
        registerPlacement: mockRegisterPlacement,
      };
    }),
    useSuperwall: jest.fn((selector: (state: any) => any) =>
      selector(mockSuperwallState),
    ),
    useSuperwallEvents: jest.fn(),
    useUser: jest.fn(() => ({
      identify: mockIdentify,
      refresh: mockRefresh,
      signOut: mockSignOut,
      subscriptionStatus: mockSubscriptionStatusState,
      user: mockSuperwallUserState.appUserId
        ? { appUserId: mockSuperwallUserState.appUserId }
        : null,
      getEntitlements: mockGetEntitlements,
      setSubscriptionStatus: mockSetSubscriptionStatus,
    })),
  }),
  { virtual: true },
);

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => mockAuthState),
}));

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: jest.fn(() => ({
    queueTourStartAfterPaywallClose: mockQueueTourStartAfterPaywallClose,
  })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: true,
    colors: {
      background: '#111111',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
    },
  })),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  clearPendingOnboardingAuthCompletion: () => mockClearPendingOnboardingAuthCompletion(),
  usePendingOnboardingAuthCompletion: () => mockUsePendingOnboardingAuthCompletion(),
}));

jest.mock('@/src/utils/onboardingConversion', () => ({
  loadPendingOnboardingConversionContext: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/components/AnimatedLogo', () => ({
  AnimatedLogo: () => null,
}));

const PaywallGateScreen = require('@/app/paywall-gate').default;

describe('PaywallGateScreen', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockPlacementHandlers = {};
    mockSuperwallState.isConfigured = false;
    mockSuperwallState.isLoading = false;
    mockSuperwallState.configurationError = new Error('config failed');
    mockAuthState.user = { id: 'user-1' };
    mockAuthState.isAuthResolved = true;
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.profileResolved = true;
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
    mockSuperwallUserState.appUserId = 'user-1';
    mockSubscriptionStatusState.status = 'INACTIVE';
    delete mockSubscriptionStatusState.entitlements;
  });

  it('does not render the error card when Superwall has a configuration error', async () => {
    const { queryByText } = render(<PaywallGateScreen />);

    expect(queryByText('Subscription Required')).toBeNull();
    expect(queryByText('Unable to load paywall. Check connection and try again.')).toBeNull();

    await waitFor(() => {
      expect(mockRegisterPlacement).not.toHaveBeenCalled();
    });
  });

  it('never presents the paywall while Superwall identity is anonymous', async () => {
    jest.useFakeTimers();
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockSuperwallUserState.appUserId = null;

    render(<PaywallGateScreen />);

    for (let index = 0; index < 4; index += 1) {
      await act(async () => {
        jest.advanceTimersByTime(2_100);
      });
      await act(async () => {
        await Promise.resolve();
      });
    }

    await waitFor(() => {
      expect(mockIdentify).toHaveBeenCalled();
      expect(mockRegisterPlacement).not.toHaveBeenCalled();
    });
  });

  it('does not register a second paywall when a stale retry fires during presentation', async () => {
    jest.useFakeTimers();
    mockSuperwallState.isConfigured = false;
    mockSuperwallState.configurationError = null;

    const screen = render(<PaywallGateScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    mockSuperwallState.isConfigured = true;
    screen.rerender(<PaywallGateScreen />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockRegisterPlacement).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2_100);
      await Promise.resolve();
    });

    expect(mockRegisterPlacement).toHaveBeenCalledTimes(1);
  });

  it('reconciles stale active status before deciding access', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockSubscriptionStatusState.status = 'ACTIVE';
    mockSubscriptionStatusState.entitlements = [{ id: 'fortis_pro', type: 'SERVICE_LEVEL' }];
    mockGetEntitlements.mockResolvedValueOnce({ active: [], inactive: [] });

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockSetSubscriptionStatus).toHaveBeenCalledWith({ status: 'INACTIVE' });
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });
  });

  it('redirects incomplete profiles back to onboarding instead of entering the app', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: false };
    mockAuthState.needsOnboarding = true;

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
    expect(mockQueueTourStartAfterPaywallClose).not.toHaveBeenCalled();
  });

  it('routes pending incomplete profiles to the authoritative auth finalizer', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: false };
    mockAuthState.needsOnboarding = true;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<PaywallGateScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { onboarding: 'complete' },
    });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    expect(mockQueueTourStartAfterPaywallClose).not.toHaveBeenCalled();
  });

  it('routes pending missing profiles to the authoritative auth finalizer', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = null;
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<PaywallGateScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { onboarding: 'complete' },
    });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    expect(mockQueueTourStartAfterPaywallClose).not.toHaveBeenCalled();
  });

  it('keeps pending onboarding completion when the post-onboarding paywall is declined', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });
    expect(mockClearPendingOnboardingAuthCompletion).not.toHaveBeenCalled();

    await act(async () => {
      mockPlacementHandlers.onDismiss?.({}, { type: 'declined' });
      await Promise.resolve();
    });

    expect(mockClearPendingOnboardingAuthCompletion).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  it('enters the app after a purchase verifies active subscription access', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });
    mockGetEntitlements
      .mockResolvedValueOnce({ active: [], inactive: [] })
      .mockResolvedValueOnce({
        active: [{ id: 'fortis_pro', type: 'SERVICE_LEVEL' }],
        inactive: [],
      });

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });

    await act(async () => {
      mockPlacementHandlers.onDismiss?.({}, { type: 'purchased' });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockClearPendingOnboardingAuthCompletion).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('does not clear pending onboarding completion when Superwall skips during the sticky gate', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });

    await act(async () => {
      mockPlacementHandlers.onSkip?.('paywall_not_available');
      await Promise.resolve();
    });

    expect(mockClearPendingOnboardingAuthCompletion).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
  });

  it('does not clear pending onboarding completion when Superwall errors during the sticky gate', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });

    await act(async () => {
      mockPlacementHandlers.onError?.('paywall failed');
      await Promise.resolve();
    });

    expect(mockClearPendingOnboardingAuthCompletion).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
  });

});
