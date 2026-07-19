import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();

const mockAuthState = {
  isAuthResolved: true,
  isAuthenticated: true,
  needsOnboarding: true,
  profileResolved: true,
};

jest.mock('expo-router', () => ({
  useRootNavigationState: () => ({ key: 'root' }),
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
    },
  }),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  usePendingOnboardingAuthCompletion: () => mockUsePendingOnboardingAuthCompletion(),
}));

jest.mock('@/components/AnimatedFortifyLogo', () => ({
  AnimatedFortifyLogo: () => null,
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/src/store/startPresetStore', () => ({
  useStartPresetStore: {
    getState: () => ({
      loadPreset: jest.fn(() => Promise.resolve()),
      preset: null,
    }),
  },
}));

jest.mock('@/src/store/workoutStore', () => ({
  useWorkoutStore: {
    getState: () => ({
      isWorkoutActive: false,
      loadActiveSession: jest.fn(() => Promise.resolve()),
    }),
  },
}));

jest.mock('@/src/services/startWorkoutFromPreset', () => ({
  startWorkoutFromStartPreset: jest.fn(() => Promise.resolve('none')),
}));

const StartWorkoutDeepLinkScreen = require('@/app/start-workout').default;

describe('StartWorkout deep link auth guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.isAuthResolved = true;
    mockAuthState.isAuthenticated = true;
    mockAuthState.needsOnboarding = true;
    mockAuthState.profileResolved = true;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
  });

  it('routes incomplete profiles to onboarding when there is no pending completion', async () => {
    render(<StartWorkoutDeepLinkScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('routes pending incomplete profiles to the authoritative auth finalizer', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<StartWorkoutDeepLinkScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/auth',
        params: { onboarding: 'complete' },
      });
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    });
  });
});
