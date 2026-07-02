import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { WeeklyProgressCarousel } from '@/src/components/program/WeeklyProgressCarousel';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useWorkoutStore } from '@/src/store/workoutStore';

const mockRunProFeature = jest.fn();
let mockIsPro = false;

jest.mock('@/src/components/superwall/useProFeatureGate', () => ({
  useProFeatureGate: jest.fn(() => ({
    isPro: mockIsPro,
    runProFeature: mockRunProFeature,
  })),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe('WeeklyProgressCarousel streak paywall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPro = false;
    mockRunProFeature.mockResolvedValue(false);
    useWorkoutStore.getState().resetStore();
  });

  it('opens the workout streak placement from the Go Pro button', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[1, 2, 3]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByLabelText('Go Pro to view workout streak'));

    expect(mockRunProFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: PAYWALL_PLACEMENTS.workoutStreak,
        params: expect.objectContaining({
          action: 'view_workout_streak',
          source: 'weekly_progress',
        }),
      }),
      expect.any(Function),
    );
  });

  it('opens streak options and pauses the streak for pro users', () => {
    mockIsPro = true;
    const today = new Date();

    const { getByLabelText, getByText } = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[
            {
              localId: 'session-today',
              name: 'Today',
              startedAt: today,
              completedAt: today,
              exercises: [],
            } as any,
          ]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByLabelText('Open workout streak options'));
    fireEvent.press(getByText('Pause'));

    expect(useWorkoutStore.getState().isStreakPaused).toBe(true);
    expect(useWorkoutStore.getState().pausedStreakCount).toBe(1);
    expect(useWorkoutStore.getState().streakPausesUsedThisMonth).toBe(1);
    expect(getByText('2 left this month')).toBeTruthy();
    expect(getByText('Pauses reset next month.')).toBeTruthy();
    expect(getByText('Paused')).toBeTruthy();
  });
});
