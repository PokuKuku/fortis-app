import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';

const mockRegisterPlacement = jest.fn();
const mockIdentify = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockGetEntitlements = jest.fn().mockResolvedValue({ active: [] });
const mockSetSubscriptionStatus = jest.fn().mockResolvedValue(undefined);
const mockQueueTourStartAfterPaywallClose = jest.fn();
const mockTrackDripFunnelConversion = jest.fn().mockResolvedValue(true);
const mockTrackDripFunnelPaywallDeclined = jest.fn().mockResolvedValue(true);
const mockTrackDripFunnelPaywallPresented = jest.fn().mockResolvedValue(true);
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
};

const mockSuperwallUserState = {
  appUserId: 'user-1' as string | null,
};

jest.mock(
  'expo-superwall',
  () => ({
    usePlacement: jest.fn(() => ({
      registerPlacement: mockRegisterPlacement,
    })),
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

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/components/AnimatedLogo', () => ({
  AnimatedLogo: () => null,
}));

jest.mock('@/src/services/dripFunnelService', () => ({
  trackDripFunnelConversion: mockTrackDripFunnelConversion,
  trackDripFunnelPaywallDeclined: mockTrackDripFunnelPaywallDeclined,
  trackDripFunnelPaywallPresented: mockTrackDripFunnelPaywallPresented,
}));

const PaywallGateScreen = require('@/app/paywall-gate').default;

describe('PaywallGateScreen', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockSuperwallState.isConfigured = false;
    mockSuperwallState.isLoading = false;
    mockSuperwallState.configurationError = new Error('config failed');
    mockAuthState.user = { id: 'user-1' };
    mockAuthState.isAuthResolved = true;
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

  it('does not stay stuck waiting for identity on first launch', async () => {
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
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });
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

  it('schedules the drip funnel when the hard paywall is presented', async () => {
    mockSuperwallState.isConfigured = true;
    mockSuperwallState.configurationError = null;

    render(<PaywallGateScreen />);

    await waitFor(() => {
      expect(mockRegisterPlacement).toHaveBeenCalledWith({ placement: 'fortis_first' });
    });

    const { usePlacement } = jest.requireMock('expo-superwall');
    const options = usePlacement.mock.calls[0][0];

    act(() => {
      options.onPresent({ name: 'Onboarding Paywall' });
    });

    expect(mockTrackDripFunnelPaywallPresented).toHaveBeenCalledWith({
      placement: 'fortis_first',
      paywallName: 'Onboarding Paywall',
      resultType: 'presented',
    });
  });
});
