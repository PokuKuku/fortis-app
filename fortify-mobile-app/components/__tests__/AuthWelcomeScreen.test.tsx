import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AuthWelcomeScreen from '@/app/auth/index';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetAllowProfileCreation = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockUpdateProfile = jest.fn();
const mockGetOnboardingState = jest.fn();
const mockClearOnboardingState = jest.fn();
const mockHasPendingOnboardingAuthCompletion = jest.fn();
const mockClearPendingOnboardingAuthCompletion = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();

let mockSearchParams: { onboarding?: string } = { onboarding: 'complete' };

const mockAuthState: any = {
  signInWithGoogle: mockSignInWithGoogle,
  signInWithApple: mockSignInWithApple,
  isAuthenticated: true,
  needsOnboarding: true,
  updateProfile: mockUpdateProfile,
  profile: {
    id: 'user-1',
    onboarding_completed: false,
    preferred_units: 'imperial',
  },
  isLoading: false,
  profileResolved: true,
  setAllowProfileCreation: mockSetAllowProfileCreation,
};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useNavigation: () => ({
    canGoBack: () => false,
    goBack: jest.fn(),
  }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children ?? null,
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
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
      glassBackground: 'rgba(0,0,0,0.04)',
      glassBorder: 'rgba(0,0,0,0.08)',
      error: '#ef4444',
      accent: '#22c55e',
      white: '#ffffff',
    },
  }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#111111',
    textSecondary: '#666666',
    error: '#ef4444',
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
    '4xl': 40,
  },
  BorderRadius: {
    md: 8,
    xl: 14,
    '2xl': 16,
  },
}));

jest.mock('@/constants/Typography', () => ({
  Typography: {
    body: {},
    caption: {},
    button: {},
  },
}));

jest.mock('@/src/utils/onboardingState', () => ({
  getOnboardingState: () => mockGetOnboardingState(),
  clearOnboardingState: () => mockClearOnboardingState(),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  clearPendingOnboardingAuthCompletion: () => mockClearPendingOnboardingAuthCompletion(),
  hasPendingOnboardingAuthCompletion: () => mockHasPendingOnboardingAuthCompletion(),
  markPendingOnboardingAuthCompletion: jest.fn(),
  usePendingOnboardingAuthCompletion: () => mockUsePendingOnboardingAuthCompletion(),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/components/AnimatedLogo', () => ({
  AnimatedLogo: () => null,
}));

jest.mock('@/src/components/auth/AuthProviderButtons', () => ({
  AuthProviderButtons: () => null,
}));

jest.mock('react-native-heroicons/outline', () => ({
  ChevronLeftIcon: () => null,
}));

describe('AuthWelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = { onboarding: 'complete' };
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
    mockHasPendingOnboardingAuthCompletion.mockResolvedValue(false);
    mockClearPendingOnboardingAuthCompletion.mockResolvedValue(undefined);
    mockGetOnboardingState.mockResolvedValue({
      full_name: 'New User',
      gender: 'male',
      birth_date: '1997-01-01',
      height_cm: 180,
      weight_kg: 80,
      preferred_units: 'imperial',
      lifting_experience: 'beginner',
      workouts_per_week: 3,
      tried_other_apps: 'occasionally',
      fitness_goal: 'build_muscle',
      biggest_challenge: 'consistency',
      workout_consistency: 'starting',
    });
    mockAuthState.profile = {
      ...mockAuthState.profile,
      onboarding_completed: false,
    };
    mockUpdateProfile.mockImplementation(async () => {
      mockAuthState.profile = {
        ...mockAuthState.profile,
        onboarding_completed: true,
      };
      return { error: null };
    });
    mockClearOnboardingState.mockResolvedValue(undefined);
  });

  it('finalizes onboarding-complete auth flow exactly once and routes to paywall', async () => {
    render(<AuthWelcomeScreen />);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockClearOnboardingState).toHaveBeenCalledTimes(1);
      expect(mockClearPendingOnboardingAuthCompletion).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });

  it('finalizes onboarding when returning from auth callback with a pending completion intent', async () => {
    mockSearchParams = {};
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<AuthWelcomeScreen />);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockClearOnboardingState).toHaveBeenCalledTimes(1);
      expect(mockClearPendingOnboardingAuthCompletion).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });

  it('does not route to onboarding while pending completion intent is still loading', async () => {
    mockSearchParams = {};
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: false });

    render(<AuthWelcomeScreen />);

    await waitFor(() => {
      expect(mockSetAllowProfileCreation).toHaveBeenCalledWith(false);
    });

    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
