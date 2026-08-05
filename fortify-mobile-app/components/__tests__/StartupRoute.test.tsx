import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import StartupScreen from '@/app/index';

const mockReplace = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();
const mockResetStartupReveal = jest.fn();
const mockDownloadAsync = jest.fn(() => Promise.resolve());
const mockAnimatedLogoProps = jest.fn();

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
      downloadAsync: mockDownloadAsync,
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

jest.mock('@/src/utils/startupReveal', () => ({
  resetStartupReveal: () => mockResetStartupReveal(),
}));

jest.mock('@/components/AnimatedFortifyLogo', () => {
  const ReactModule = require('react') as typeof React;

  return {
    AnimatedFortifyLogo: (props: { onShineComplete?: () => void; shineDurationMs?: number }) => {
      mockAnimatedLogoProps(props);
      ReactModule.useEffect(() => {
        props.onShineComplete?.();
      }, [props.onShineComplete]);
      return null;
    },
  };
});

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

  it('routes pending incomplete profiles to the authoritative auth finalizer', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<StartupScreen />);
    await finishStartupWait();

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { onboarding: 'complete' },
    });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  it('routes pending missing profiles to the authoritative auth finalizer', async () => {
    mockAuthState.profile = null;
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<StartupScreen />);
    await finishStartupWait();

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth',
      params: { onboarding: 'complete' },
    });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  it('routes incomplete profiles to onboarding when there is no pending completion', async () => {
    render(<StartupScreen />);
    await finishStartupWait();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('does not block onboarding navigation on video warmup', async () => {
    mockDownloadAsync.mockImplementationOnce(() => new Promise(() => undefined));

    render(<StartupScreen />);
    await finishStartupWait();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('uses the shortened startup logo animation', () => {
    render(<StartupScreen />);

    expect(mockAnimatedLogoProps).toHaveBeenCalledWith(
      expect.objectContaining({ shineDurationMs: 600 }),
    );
  });

  it('arms the landing reveal only when cold-starting directly into the tabs', async () => {
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;

    render(<StartupScreen />);
    await finishStartupWait();

    await waitFor(() => {
      expect(mockResetStartupReveal).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
