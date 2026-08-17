import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { InAppTourProvider } from '@/src/contexts/InAppTourContext';

const mockNavigate = jest.fn();
const mockUpdateProfile = jest.fn();
const mockLoadInAppTourState = jest.fn();
const mockSaveInAppTourState = jest.fn();
const mockClearInAppTourState = jest.fn();

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
    profile: {
      id: 'user-1',
      onboarding_completed: true,
      created_at: '2026-08-01T12:00:00.000Z',
      has_seen_in_app_tour: true,
      in_app_tour_completed_at: null,
      in_app_tour_version: 30,
    },
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

jest.mock('@/src/components/tour/TourOverlay', () => ({
  TourOverlay: ({
    visible,
    hideTooltip,
    primaryAction,
    secondaryAction,
  }: {
    visible: boolean;
    hideTooltip: boolean;
    primaryAction?: { label: string; onPress: () => void; disabled?: boolean } | null;
    secondaryAction?: { label: string; onPress: () => void; disabled?: boolean } | null;
  }) => {
    const ReactModule = require('react') as typeof React;
    const { Pressable: MockPressable, Text: MockText } = require('react-native');

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

  it('dismisses the tour locally without waiting for persistence or the server', async () => {
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
    const skipButton = view.getByRole('button', { name: 'Skip tour' });
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(view.queryByRole('button', { name: 'Skip tour' })).toBeNull();
    });
  });
});
