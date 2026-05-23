import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import OnboardingCompleteScreen from '@/app/onboarding/complete';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUpdateProfile = jest.fn();
const mockClearOnboardingState = jest.fn();
const mockClearInAppTourState = jest.fn();
const mockGetOnboardingState = jest.fn();
const mockMarkPendingOnboardingAuthCompletion = jest.fn();
const mockAuthState = {
  updateProfile: mockUpdateProfile,
  isAuthenticated: false,
  profile: null as null | {
    full_name?: string | null;
    onboarding_completed?: boolean;
    preferred_units?: string;
  },
};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#111827',
      accentOverlay: 'rgba(17,24,39,0.12)',
      error: '#ef4444',
      glassBackground: 'rgba(0,0,0,0.04)',
      glassBorder: 'rgba(0,0,0,0.08)',
      surfaceElevated: '#ffffff',
      textPrimary: '#111111',
      textSecondary: '#555555',
      textTertiary: '#999999',
      white: '#ffffff',
    },
  }),
}));

jest.mock('@/constants/Sizes', () => ({
  BorderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
  },
  Spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
}));

jest.mock('@/constants/Typography', () => ({
  Typography: {
    body: {},
    caption: {},
  },
}));

jest.mock('@/src/utils/onboardingState', () => ({
  getOnboardingState: () => mockGetOnboardingState(),
  clearOnboardingState: () => mockClearOnboardingState(),
}));

jest.mock('@/src/services/onboardingAnalyticsService', () => ({
  useOnboardingFunnelScreen: jest.fn(),
  trackOnboardingFinished: jest.fn(),
}));

jest.mock('@/src/services/inAppTourService', () => ({
  clearInAppTourState: () => mockClearInAppTourState(),
}));

jest.mock('@/src/utils/onboardingConversion', () => ({
  buildOnboardingConversionContext: jest.fn(() => ({})),
  savePendingOnboardingConversionContext: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  markPendingOnboardingAuthCompletion: () => mockMarkPendingOnboardingAuthCompletion(),
}));

jest.mock('@/src/components/onboarding/OnboardingScreen', () => ({
  OnboardingScreen: ({ children, floatingFooter }: { children: React.ReactNode; floatingFooter?: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return (
      <View>
        {children}
        {floatingFooter}
      </View>
    );
  },
}));

jest.mock('@/components/GlassButton', () => ({
  GlassButton: ({ children, onPress, disabled }: { children: React.ReactNode; onPress?: () => void; disabled?: boolean }) => {
    const React = require('react');
    const { Pressable } = require('react-native');
    return (
      <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}>
        {children}
      </Pressable>
    );
  },
}));

jest.mock('@/src/components/workout/MuscleHeatmap', () => ({
  MuscleHeatmap: () => {
    const React = require('react');
    const { View } = require('react-native');
    return <View testID="muscle-heatmap" />;
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children?: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('react-native-heroicons/solid', () => ({
  CheckIcon: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>check</Text>;
  },
}));

describe('OnboardingCompleteScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.profile = null;
    mockUpdateProfile.mockResolvedValue({ error: null });
    mockClearOnboardingState.mockResolvedValue(undefined);
    mockClearInAppTourState.mockResolvedValue(undefined);
    mockMarkPendingOnboardingAuthCompletion.mockResolvedValue(undefined);
    mockGetOnboardingState.mockResolvedValue({
      full_name: 'Kwaku',
      gender: 'male',
      fitness_goal: 'build_muscle',
      fitness_motivation: 'strength_capability',
      lifting_experience: 'beginner',
      workouts_per_week: 3,
      workout_schedule_days: [1, 3, 5],
      training_environment: 'home',
      muscle_focuses: ['arms', 'shoulders'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('routes unauthenticated users to auth finalization without saving locally', async () => {
    render(<OnboardingCompleteScreen />);

    await act(async () => {
      jest.advanceTimersByTime(14_500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("I'm ready")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText("I'm ready"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockMarkPendingOnboardingAuthCompletion).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/auth',
        params: { onboarding: 'complete' },
      });
    });
    expect(mockReplace).not.toHaveBeenCalledWith('/paywall-gate');
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockClearOnboardingState).not.toHaveBeenCalled();
  });

  it('finalizes on the complete page when the user is already authenticated', async () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.profile = {
      full_name: null,
      onboarding_completed: false,
      preferred_units: 'imperial',
    };

    render(<OnboardingCompleteScreen />);

    await act(async () => {
      jest.advanceTimersByTime(15_500);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Kwaku',
        onboarding_completed: true,
      }));
    });

    await waitFor(() => {
      expect(mockClearOnboardingState).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });

  it('continues finalization after returning authenticated from auth', async () => {
    const { rerender } = render(<OnboardingCompleteScreen />);

    await act(async () => {
      jest.advanceTimersByTime(14_500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("I'm ready")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText("I'm ready"));
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { onboarding: 'complete' },
    });

    mockAuthState.isAuthenticated = true;
    mockAuthState.profile = {
      full_name: null,
      onboarding_completed: false,
      preferred_units: 'imperial',
    };

    rerender(<OnboardingCompleteScreen />);

    await act(async () => {
      jest.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Kwaku',
        onboarding_completed: true,
      }));
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });
});
