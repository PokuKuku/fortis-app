import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AuthCallbackScreen from '@/app/auth/callback';

const mockReplace = jest.fn();
const mockGetInitialURL = jest.fn();
const mockAddEventListener = jest.fn();
const mockSetSession = jest.fn();
const mockHasPendingOnboardingAuthCompletion = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('expo-linking', () => ({
  getInitialURL: () => mockGetInitialURL(),
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
}));

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: (...args: unknown[]) => mockSetSession(...args),
    },
  },
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  hasPendingOnboardingAuthCompletion: () => mockHasPendingOnboardingAuthCompletion(),
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      background: '#f5f5f5',
      textPrimary: '#111111',
      textSecondary: '#666666',
      glassBackground: 'rgba(0,0,0,0.04)',
      glassBorder: 'rgba(0,0,0,0.08)',
      error: '#ef4444',
    },
  }),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/components/GlassButton', () => ({
  GlassButton: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/constants/Typography', () => ({
  Typography: {
    h2: {},
    body: {},
    button: {},
  },
}));

jest.mock('@/constants/Sizes', () => ({
  Spacing: {
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  BorderRadius: {
    xl: 14,
  },
}));

const callbackUrl = 'fortis://auth/callback#access_token=access-token&refresh_token=refresh-token';

describe('AuthCallbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInitialURL.mockResolvedValue(callbackUrl);
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
    mockSetSession.mockResolvedValue({ error: null });
    mockHasPendingOnboardingAuthCompletion.mockResolvedValue(false);
  });

  it('routes back to onboarding finalization when the completion intent is pending', async () => {
    mockHasPendingOnboardingAuthCompletion.mockResolvedValue(true);

    render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/auth',
        params: { onboarding: 'complete' },
      });
    });
  });

  it('routes to startup when no onboarding completion intent is pending', async () => {
    render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('fails closed instead of routing to startup when completion intent cannot be read', async () => {
    mockHasPendingOnboardingAuthCompletion.mockRejectedValueOnce(new Error('storage unavailable'));

    const { getByText } = render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(getByText(/could not verify your onboarding progress/i)).toBeTruthy();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
