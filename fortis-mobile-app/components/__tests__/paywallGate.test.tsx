import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PaywallGateScreen from '@/app/paywall-gate';

const mockRegisterPlacement = jest.fn();
const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockGetEntitlements = jest.fn().mockResolvedValue({ active: [] });
const mockSetSubscriptionStatus = jest.fn().mockResolvedValue(undefined);

jest.mock(
  'expo-superwall',
  () => ({
    usePlacement: jest.fn(() => ({
      registerPlacement: mockRegisterPlacement,
    })),
    useSuperwall: jest.fn((selector: (state: any) => any) =>
      selector({
        isConfigured: false,
        isLoading: false,
        configurationError: new Error('config failed'),
      }),
    ),
    useSuperwallEvents: jest.fn(),
    useUser: jest.fn(() => ({
      refresh: mockRefresh,
      subscriptionStatus: { status: 'INACTIVE' },
      user: { appUserId: 'user-1' },
      getEntitlements: mockGetEntitlements,
      setSubscriptionStatus: mockSetSubscriptionStatus,
    })),
  }),
  { virtual: true },
);

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1' },
    isAuthResolved: true,
  })),
}));

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: jest.fn(() => ({
    queueTourStartAfterPaywallClose: jest.fn(),
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

describe('PaywallGateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a recoverable error when Superwall has a configuration error', async () => {
    const { findByText } = render(<PaywallGateScreen />);

    expect(await findByText('Subscription Required')).toBeTruthy();
    expect(await findByText('Unable to load paywall. Check connection and try again.')).toBeTruthy();

    await waitFor(() => {
      expect(mockRegisterPlacement).not.toHaveBeenCalled();
    });
  });
});
