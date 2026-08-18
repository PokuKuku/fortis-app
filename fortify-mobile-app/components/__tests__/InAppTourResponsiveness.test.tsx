import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { InAppTourProvider, useInAppTour } from '@/src/contexts/InAppTourContext';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';

const mockNavigate = jest.fn();
const mockUpdateProfile = jest.fn();
const mockLoadInAppTourState = jest.fn();
const mockSaveInAppTourState = jest.fn();
const mockClearInAppTourState = jest.fn();
const mockCompleteStartupReveal = jest.fn();
const mockProfile = {
  id: 'user-1',
  onboarding_completed: true,
  created_at: '2026-08-01T12:00:00.000Z',
  has_seen_in_app_tour: true,
  in_app_tour_completed_at: null as string | null,
  in_app_tour_version: 30,
};

jest.mock('expo-router', () => ({
  usePathname: () => '/',
  useRouter: () => ({ navigate: mockNavigate }),
  useSegments: () => ['(tabs)'],
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    isAuthResolved: true,
    isAuthenticated: true,
    profile: mockProfile,
    profileResolved: true,
    updateProfile: mockUpdateProfile,
  }),
}));

jest.mock('@/src/services/inAppTourService', () => ({
  loadInAppTourState: () => mockLoadInAppTourState(),
  saveInAppTourState: (...args: unknown[]) => mockSaveInAppTourState(...args),
  clearInAppTourState: () => mockClearInAppTourState(),
  resumeInProgressTourAtStep: (state: Record<string, unknown>, stepId: string) => ({
    ...state,
    stepId,
    updatedAt: '2026-08-17T12:00:00.000Z',
  }),
}));

jest.mock('@/src/store/workoutStore', () => ({
  useWorkoutStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    activeSession: null,
    cancelWorkout: jest.fn(),
    isWorkoutActive: false,
  }),
}));

jest.mock('@/src/config/posthog', () => ({
  posthog: { capture: jest.fn() },
}));

jest.mock('@/src/utils/startupReveal', () => ({
  completeStartupReveal: () => mockCompleteStartupReveal(),
}));

jest.mock('@/src/components/tour/TourOverlay', () => ({
  TourOverlay: ({
    visible,
    hideTooltip,
    primaryAction,
    secondaryAction,
    onTooltipHideComplete,
  }: {
    visible: boolean;
    hideTooltip: boolean;
    primaryAction?: { label: string; onPress: () => void; disabled?: boolean } | null;
    secondaryAction?: { label: string; onPress: () => void; disabled?: boolean } | null;
    onTooltipHideComplete?: (() => void) | null;
  }) => {
    const ReactModule = require('react') as typeof React;
    const { Pressable: MockPressable, Text: MockText } = require('react-native');

    ReactModule.useEffect(() => {
      if (hideTooltip) {
        onTooltipHideComplete?.();
      }
    }, [hideTooltip, onTooltipHideComplete]);

    return (
      <ReactModule.Fragment>
        <MockText testID="tour-render-state">
          {`${visible}:${hideTooltip}:${primaryAction?.label ?? 'none'}`}
        </MockText>
        {visible && !hideTooltip ? (
          <ReactModule.Fragment>
        {primaryAction ? (
        <MockPressable
          accessibilityRole="button"
          disabled={primaryAction.disabled}
          onPress={primaryAction.onPress}
        >
          <MockText>{primaryAction.label}</MockText>
        </MockPressable>
      ) : null}
      {secondaryAction ? (
        <MockPressable
          accessibilityRole="button"
          disabled={secondaryAction.disabled}
          onPress={secondaryAction.onPress}
        >
          <MockText>{secondaryAction.label}</MockText>
        </MockPressable>
      ) : null}
          </ReactModule.Fragment>
        ) : null}
      </ReactModule.Fragment>
    );
  },
}));

jest.mock('@/src/components/ui/AccentColorPicker', () => {
  const ReactModule = require('react') as typeof React;
  const { Text: MockText } = require('react-native');

  return {
    AccentColorPicker: ({ visible }: { visible: boolean }) => visible
      ? ReactModule.createElement(MockText, null, 'Primary style picker')
      : null,
  };
});

describe('in-app tour responsiveness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadInAppTourState.mockResolvedValue({
      version: 30,
      status: 'in_progress',
      stepId: 'welcome',
      updatedAt: '2026-08-16T12:00:00.000Z',
    });
    mockClearInAppTourState.mockResolvedValue(undefined);
    mockProfile.has_seen_in_app_tour = true;
    mockProfile.in_app_tour_completed_at = null;
    mockProfile.in_app_tour_version = 30;
  });

  it('accepts Continue while cold-start persistence and server sync are still pending', async () => {
    mockSaveInAppTourState.mockReturnValue(new Promise(() => undefined));
    mockUpdateProfile.mockReturnValue(new Promise(() => undefined));

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
    });
    const continueButton = view.getByRole('button', { name: 'Continue' });
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(view.getByText('Primary style picker')).toBeTruthy();
    });
  });

  it('does not offer a skip action on tour modals', async () => {
    mockSaveInAppTourState.mockReturnValue(new Promise(() => undefined));
    mockUpdateProfile.mockReturnValue(new Promise(() => undefined));

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
    });
    expect(view.queryByRole('button', { name: 'Skip tour' })).toBeNull();
  });

  it('premeasures the next same-screen anchor before advancing', async () => {
    mockLoadInAppTourState.mockResolvedValue(null);
    mockProfile.has_seen_in_app_tour = false;

    function PremeasureProbe() {
      const { premeasureAnchorIds } = useInAppTour();
      return <Text testID="tour-premeasure-anchors">{premeasureAnchorIds.join(',')}</Text>;
    }

    const view = render(
      <InAppTourProvider>
        <PremeasureProbe />
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-premeasure-anchors').props.children)
        .toContain(TOUR_ANCHOR_IDS.streakCounter);
    });
  });

  it('starts on Home without replaying navigation or the startup reveal', async () => {
    mockLoadInAppTourState.mockResolvedValue(null);
    mockProfile.has_seen_in_app_tour = false;

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
    });

    expect(mockCompleteStartupReveal).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to a centered Continue step when an anchor never measures', async () => {
    mockLoadInAppTourState.mockResolvedValue(null);
    mockProfile.has_seen_in_app_tour = false;

    function LockProbe() {
      const { isScreenScrollLocked } = useInAppTour();
      return <Text testID="tour-scroll-lock">{String(isScreenScrollLocked)}</Text>;
    }

    const view = render(
      <InAppTourProvider>
        <LockProbe />
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
    });

    fireEvent.press(view.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(view.getByTestId('tour-scroll-lock').props.children).toBe('false');
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1300));
    });

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
      expect(view.getByTestId('tour-scroll-lock').props.children).toBe('true');
    });
  });

  it('starts an in-memory tour when local state loading fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockLoadInAppTourState.mockRejectedValue(new Error('storage unavailable'));
    mockProfile.has_seen_in_app_tour = false;

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toBe('true:false:Continue');
    });
    expect(warnSpy).toHaveBeenCalledWith(
      '[InAppTour] Failed to load local tour state:',
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });

  it('preserves completion from an older tour version without showing the new tour', async () => {
    mockLoadInAppTourState.mockResolvedValue({
      version: 29,
      status: 'completed',
      stepId: 'primary_style',
      updatedAt: '2026-08-01T12:00:00.000Z',
    });
    mockProfile.has_seen_in_app_tour = false;
    mockProfile.in_app_tour_completed_at = null;
    mockProfile.in_app_tour_version = 29;

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(mockSaveInAppTourState).toHaveBeenCalledWith(expect.objectContaining({
        version: 30,
        status: 'completed',
      }));
    });
    expect(view.getByTestId('tour-render-state').props.children).toMatch(/^false:/);
    expect(mockClearInAppTourState).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not re-enroll a server-completed account from an older version', async () => {
    mockLoadInAppTourState.mockResolvedValue(null);
    mockProfile.has_seen_in_app_tour = true;
    mockProfile.in_app_tour_completed_at = '2026-08-01T12:00:00.000Z';
    mockProfile.in_app_tour_version = 12;

    const view = render(
      <InAppTourProvider>
        <Text>App</Text>
      </InAppTourProvider>
    );

    await waitFor(() => {
      expect(view.getByTestId('tour-render-state').props.children).toMatch(/^false:/);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
