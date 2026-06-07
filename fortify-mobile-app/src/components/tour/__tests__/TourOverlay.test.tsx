import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TourOverlay } from '@/src/components/tour/TourOverlay';

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    colors: {
      accent: '#ffffff',
      accentForegroundOnFill: '#000000',
      accentShadow: '#000000',
      buttonFog: ['transparent', 'transparent'],
      buttonGradient: ['#ffffff', '#dddddd'],
      glassBorder: '#444444',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('TourOverlay', () => {
  it('points upward when the tooltip is placed below its anchor', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Workouts overview"
        placement="below"
        showArrow
      />
    );

    expect(view.getByTestId('tour-arrow-up')).toBeTruthy();
    expect(view.queryByTestId('tour-arrow-down')).toBeNull();
  });

  it('keeps replay and next as independent actions', () => {
    const replay = jest.fn();
    const next = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="AI overview"
        auxiliaryAction={{ label: 'Replay introduction', onPress: replay }}
        primaryAction={{ label: 'Next', onPress: next }}
      />
    );

    fireEvent.press(view.getByLabelText('Replay introduction'));
    fireEvent.press(view.getByText('Next'));

    expect(replay).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
