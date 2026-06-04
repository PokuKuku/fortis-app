import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { WeeklyProgressCarousel } from '@/src/components/program/WeeklyProgressCarousel';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';

const mockRunProFeature = jest.fn();

jest.mock('@/src/components/superwall/useProFeatureGate', () => ({
  useProFeatureGate: jest.fn(() => ({
    isPro: false,
    runProFeature: mockRunProFeature,
  })),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

describe('WeeklyProgressCarousel streak paywall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunProFeature.mockResolvedValue(false);
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
});
