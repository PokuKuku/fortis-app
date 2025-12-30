import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { PersonalRecordsCard } from '@/src/components/profile/PersonalRecordsCard';
import { useTopPersonalRecords } from '@/src/hooks/useTopPersonalRecords';
import { useAuth } from '@/src/contexts/AuthContext';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/src/hooks/useTopPersonalRecords', () => ({
  useTopPersonalRecords: jest.fn(),
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('react-native-heroicons/outline', () => {
  const React = require('react');
  return {
    TrophyIcon: (props: object) => React.createElement('TrophyIcon', props),
    ChevronRightIcon: (props: object) => React.createElement('ChevronRightIcon', props),
    ChevronLeftIcon: (props: object) => React.createElement('ChevronLeftIcon', props),
  };
});

describe('PersonalRecordsCard', () => {
  const renderWithTheme = (ui: React.ReactElement) => render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );

  const mockUseTopPersonalRecords = useTopPersonalRecords as jest.MockedFunction<typeof useTopPersonalRecords>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      profile: { preferred_units: 'imperial' },
    } as unknown as ReturnType<typeof useAuth>);
  });

  it('opens the modal and shows personal records', () => {
    mockUseTopPersonalRecords.mockReturnValue([
      {
        exerciseId: 'exercise-1',
        exerciseName: 'Dumbbell Incline Bench Press',
        maxWeight: 225,
        reps: 6,
        date: new Date('2025-12-27'),
      },
    ]);

    const { getByText, queryByText } = renderWithTheme(<PersonalRecordsCard />);

    expect(queryByText('Dumbbell Incline Bench Press')).toBeNull();
    fireEvent.press(getByText('Personal Records'));
    expect(getByText('Dumbbell Incline Bench Press')).toBeTruthy();
  });

  it('shows the empty state when there are no PRs', () => {
    mockUseTopPersonalRecords.mockReturnValue([]);

    const { getByText } = renderWithTheme(<PersonalRecordsCard />);

    fireEvent.press(getByText('Personal Records'));
    expect(getByText('No PRs yet')).toBeTruthy();
  });
});
