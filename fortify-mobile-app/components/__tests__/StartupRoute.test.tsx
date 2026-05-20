import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import StartupScreen from '@/app/index';

const mockReplace = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();

const mockAuthState = {
  isAuthResolved: true,
  isAuthenticated: true,
  needsOnboarding: true,
  profile: { onboarding_completed: false } as { onboarding_completed: boolean } | null,
  profileResolved: true,
};

jest.mock('expo-router', () => ({
  usePathname: () => '/',
  useRootNavigationState: () => ({ key: 'root' }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(() => Promise.resolve()),
    })),
  },
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(() => Promise.resolve()),
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
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

describe('Startup route guard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockAuthState.isAuthResolved = true;
    mockAuthState.isAuthenticated = true;
    mockAuthState.profile = { onboarding_completed: false };
    mockAuthState.profileResolved = true;
    mockAuthState.needsOnboarding = true;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const finishStartupWait = async () => {
    await act(async () => {
      jest.advanceTimersByTime(700);
      await Promise.resolve();
    });
  };

  it('keeps loading instead of routing incomplete profiles to onboarding during pending completion', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<StartupScreen />);
    await finishStartupWait();

    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  it('keeps loading instead of routing missing profiles to onboarding during pending completion', async () => {
    mockAuthState.profile = null;
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<StartupScreen />);
    await finishStartupWait();

    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  it('routes incomplete profiles to onboarding when there is no pending completion', async () => {
    render(<StartupScreen />);
    await finishStartupWait();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });
});
