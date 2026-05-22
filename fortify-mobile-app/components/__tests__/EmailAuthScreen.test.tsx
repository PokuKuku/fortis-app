import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import EmailAuthScreen from '@/app/auth/email';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockSignInWithEmail = jest.fn();
const mockSignUpWithEmail = jest.fn();
const mockSetAllowProfileCreation = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();

let mockSearchParams: { source?: string; mode?: string } = {
  source: 'onboarding',
  mode: 'signin',
};

let mockAuthState: any = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: mockBack,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      background: '#f5f5f5',
      textPrimary: '#111111',
      textSecondary: '#666666',
      accent: '#22c55e',
      error: '#ef4444',
    },
  }),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  usePendingOnboardingAuthCompletion: () => mockUsePendingOnboardingAuthCompletion(),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    white: '#ffffff',
    background: '#111111',
    textPrimary: '#111111',
    textSecondary: '#666666',
    error: '#ef4444',
    success: '#22c55e',
  },
}));

jest.mock('@/constants/Sizes', () => ({
  Spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  BorderRadius: {
    md: 8,
    xl: 14,
    '2xl': 16,
  },
  FontSizes: {
    base: 16,
  },
}));

jest.mock('@/constants/Typography', () => ({
  Typography: {
    h1: {},
    body: {},
    bodySmall: {},
    caption: {},
    button: {},
  },
}));

jest.mock('@/components/GlassButton', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return {
    GlassButton: ({ onPress, children, disabled }: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        {children}
      </TouchableOpacity>
    ),
  };
});

jest.mock('react-native-heroicons/outline', () => ({
  ChevronLeftIcon: () => null,
  EnvelopeIcon: () => null,
  LockClosedIcon: () => null,
  UserIcon: () => null,
}));

describe('EmailAuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { source: 'onboarding', mode: 'signin' };
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
    mockAuthState = {
      signInWithEmail: mockSignInWithEmail.mockResolvedValue({ error: null }),
      signUpWithEmail: mockSignUpWithEmail.mockResolvedValue({ error: null }),
      setAllowProfileCreation: mockSetAllowProfileCreation,
      isAuthenticated: false,
      profileResolved: false,
      profile: null,
      needsOnboarding: false,
    };
  });

  it('routes to paywall gate after successful email sign-in once auth state resolves', async () => {
    const { getByPlaceholderText, getByText, rerender } = render(<EmailAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'reviewer@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('reviewer@example.com', 'password123');
    });
    expect(mockReplace).not.toHaveBeenCalled();

    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      profileResolved: true,
      profile: { onboarding_completed: true },
      needsOnboarding: false,
    };

    rerender(<EmailAuthScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });

  it('routes to onboarding after successful email sign-in when onboarding is still required', async () => {
    const { getByPlaceholderText, getByText, rerender } = render(<EmailAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'newuser@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });

    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      profileResolved: true,
      profile: null,
      needsOnboarding: true,
    };

    rerender(<EmailAuthScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('keeps loading instead of routing to onboarding while onboarding completion is pending', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });
    const { getByPlaceholderText, getByText, rerender } = render(<EmailAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'newuser@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });

    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      profileResolved: true,
      profile: null,
      needsOnboarding: true,
    };

    rerender(<EmailAuthScreen />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  it('keeps loading instead of routing to onboarding until pending completion state resolves', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: false });
    const { getByPlaceholderText, getByText, rerender } = render(<EmailAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'newuser@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });

    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      profileResolved: true,
      profile: null,
      needsOnboarding: true,
    };

    rerender(<EmailAuthScreen />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  it('routes onboarding-complete email sign-in through auth finalization flow', async () => {
    mockSearchParams = { source: 'onboarding-complete', mode: 'signin' };

    const { getByPlaceholderText, getByText, rerender } = render(<EmailAuthScreen />);

    fireEvent.changeText(getByPlaceholderText('your@email.com'), 'newuser@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });

    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      profileResolved: true,
      profile: null,
      needsOnboarding: true,
    };

    rerender(<EmailAuthScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/auth',
        params: { onboarding: 'complete' },
      });
    });
  });
});
