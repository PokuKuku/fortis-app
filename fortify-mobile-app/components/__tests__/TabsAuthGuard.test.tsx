import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockUsePendingOnboardingAuthCompletion = jest.fn();

const mockAuthState = {
  isAuthenticated: true,
  isLoading: false,
  needsOnboarding: true,
  profile: { onboarding_completed: false } as { onboarding_completed: boolean } | null,
  profileResolved: true,
  user: { id: 'user-1' },
};

const MockTabs = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
MockTabs.Screen = () => null;

jest.mock('expo-router', () => ({
  Tabs: MockTabs,
  usePathname: () => '/programs',
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('expo-superwall', () => ({
  usePlacement: jest.fn(() => ({
    registerPlacement: jest.fn(),
  })),
  useSuperwall: jest.fn((selector: (state: any) => any) =>
    selector({ isConfigured: false, isLoading: false }),
  ),
  useUser: jest.fn(() => ({
    subscriptionStatus: { status: 'INACTIVE' },
    getEntitlements: jest.fn(() => Promise.resolve({ active: [] })),
    setSubscriptionStatus: jest.fn(() => Promise.resolve()),
    user: { appUserId: 'user-1' },
  })),
}), { virtual: true });

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#111827',
      accentOverlay: 'rgba(17,24,39,0.12)',
      background: '#ffffff',
      glassBackground: 'rgba(0,0,0,0.04)',
      glassBorder: 'rgba(0,0,0,0.08)',
      textPrimary: '#111111',
      textSecondary: '#666666',
      white: '#ffffff',
    },
  }),
}));

jest.mock('@/src/utils/onboardingAuthCompletion', () => ({
  usePendingOnboardingAuthCompletion: () => mockUsePendingOnboardingAuthCompletion(),
}));

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: () => ({
    isTourActive: false,
    activeStepId: null,
    advanceStep: jest.fn(),
  }),
}));

jest.mock('@/src/store/workoutStore', () => ({
  useWorkoutStore: jest.fn((selector: any) => selector({
    isWorkoutActive: false,
  })),
}));

jest.mock('@/src/store/programsStore', () => ({
  useProgramsStore: jest.fn(() => ({
    programs: [],
    fetchPrograms: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock('@/src/store/programProgressStore', () => ({
  useProgramProgressStore: jest.fn((selector: any) => selector({
    loadProgress: jest.fn(),
  })),
}));

jest.mock('@/src/store/startPresetStore', () => ({
  useStartPresetStore: jest.fn((selector: any) => selector({
    preset: null,
    loadPreset: jest.fn(),
    setPreset: jest.fn(),
  })),
}));

jest.mock('@/src/hooks/useExercises', () => ({
  useExercises: () => ({
    exercises: [],
  }),
}));

jest.mock('@/src/components/tour/TourAnchor', () => ({
  TourAnchor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/src/components/workout/modals/StartButtonConfigModal', () => ({
  StartButtonConfigModal: () => null,
}));

jest.mock('@/src/services/startWorkoutFromPreset', () => ({
  startWorkoutFromStartPreset: jest.fn(),
}));

jest.mock('@/src/components/superwall/subscriptionStatusSync', () => ({
  reconcileSubscriptionStatus: jest.fn(() => Promise.resolve({
    wasVerified: false,
    hasActiveSubscription: false,
  })),
}));

jest.mock('@/src/components/haptics/navigationHaptics', () => ({
  triggerImmediateNavigationHaptic: jest.fn(),
}));

jest.mock('@/src/services/exerciseService', () => ({
  saveCustomExercise: jest.fn(),
}));

jest.mock('@/src/utils/exerciseSearch', () => ({
  buildExerciseSearchIndex: jest.fn(() => []),
  searchExercises: jest.fn(() => []),
}));

jest.mock('react-native-heroicons/outline', () => ({
  CalendarDaysIcon: () => null,
  Squares2X2Icon: () => null,
  UserIcon: () => null,
  SparklesIcon: () => null,
  ChartBarIcon: () => null,
}));

jest.mock('@/src/components/icons/DumbbellIcon', () => ({
  DumbbellIcon: () => null,
}));

jest.mock('@/components/GlassButton', () => ({
  GlassButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const TabLayout = require('@/app/(tabs)/_layout').default;

describe('Tabs auth guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.isAuthenticated = true;
    mockAuthState.isLoading = false;
    mockAuthState.profile = { onboarding_completed: false };
    mockAuthState.profileResolved = true;
    mockAuthState.needsOnboarding = true;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: false, isResolved: true });
  });

  it('routes incomplete profiles to onboarding when there is no pending completion', async () => {
    render(<TabLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('does not route to onboarding while onboarding completion is pending', async () => {
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  it('routes completed profiles with pending onboarding completion to the paywall gate', async () => {
    mockAuthState.profile = { onboarding_completed: true };
    mockAuthState.needsOnboarding = false;
    mockUsePendingOnboardingAuthCompletion.mockReturnValue({ isPending: true, isResolved: true });

    render(<TabLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/paywall-gate');
    });
  });
});
