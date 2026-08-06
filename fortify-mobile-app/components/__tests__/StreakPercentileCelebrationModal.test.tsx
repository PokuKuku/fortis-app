import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import {
  STREAK_PERCENTILE_MILESTONES,
  StreakPercentileCelebrationModal,
  shouldUseCompactStreakLayout,
} from '@/src/components/retention/StreakPercentileCelebrationModal';

describe('StreakPercentileCelebrationModal', () => {
  it('uses matching layouts on modern phones with similar aspect ratios', () => {
    expect(shouldUseCompactStreakLayout(402, 874)).toBe(false);
    expect(shouldUseCompactStreakLayout(375, 812)).toBe(false);
    expect(shouldUseCompactStreakLayout(375, 667)).toBe(true);
  });

  it('renders the requested streak milestone and continues', () => {
    const onContinue = jest.fn();
    const view = render(
      <ThemeProvider>
        <StreakPercentileCelebrationModal visible streak={5} onContinue={onContinue} />
      </ThemeProvider>
    );

    expect(view.getByLabelText('5 day streak')).toBeTruthy();
    expect(view.getByTestId('streak-day-current').props.children).toBe(5);
    expect(view.getByTestId('streak-day-outgoing').props.children).toBe(4);
    expect(view.getByText('FIVE FOR FIVE!')).toBeTruthy();
    expect(view.getByText(STREAK_PERCENTILE_MILESTONES[5].message)).toBeTruthy();
    expect(view.getByTestId('streak-percentile-flame')).toBeTruthy();
    expect(view.getByTestId('streak-percentile-arc')).toBeTruthy();

    fireEvent.press(view.getByLabelText('Continue from streak celebration'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('uses the elite treatment at day ten', () => {
    const view = render(
      <ThemeProvider>
        <StreakPercentileCelebrationModal visible streak={10} onContinue={jest.fn()} />
      </ThemeProvider>
    );

    expect(view.getByLabelText('10 day streak')).toBeTruthy();
    expect(view.getByLabelText('Top 6% of lifters')).toBeTruthy();
    expect(view.getByText('OF LIFTERS')).toBeTruthy();
    expect(view.getByText('ABSOLUTELY ELITE!')).toBeTruthy();
    expect(view.queryByText('How this is estimated')).toBeNull();
  });

  it('keeps the flame geometry fixed across streak milestones', () => {
    const view = render(
      <ThemeProvider>
        <StreakPercentileCelebrationModal visible streak={1} onContinue={jest.fn()} />
      </ThemeProvider>
    );
    const dayOneFlameStyle = view.getByLabelText('Animated realistic workout streak flame').props.style;

    view.rerender(
      <ThemeProvider>
        <StreakPercentileCelebrationModal visible streak={10} onContinue={jest.fn()} />
      </ThemeProvider>
    );

    expect(view.getByLabelText('Animated realistic workout streak flame').props.style).toEqual(
      dayOneFlameStyle
    );
  });
});
