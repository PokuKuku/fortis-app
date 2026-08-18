import React from 'react';
import { act, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import {
  AnimatedStreakCounter,
  getStartupStreakRollTiming,
} from '@/src/components/program/AnimatedStreakCounter';

function Counter({
  value,
  isPaused = false,
  animateFromZeroOnMount = false,
}: {
  value: number;
  isPaused?: boolean;
  animateFromZeroOnMount?: boolean;
}) {
  return (
    <ThemeProvider>
      <AnimatedStreakCounter
        value={value}
        isPaused={isPaused}
        animateFromZeroOnMount={animateFromZeroOnMount}
      />
    </ThemeProvider>
  );
}

describe('AnimatedStreakCounter', () => {
  it('rolls from the previous number when the streak increases', () => {
    const view = render(<Counter value={3} />);

    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();

    view.rerender(<Counter value={4} />);

    expect(view.getByTestId('streak-number-current').props.children).toBe(4);
    expect(view.getByTestId('streak-number-outgoing').props.children).toBe(3);
    expect(view.getByTestId('streak-fire-glow')).toBeTruthy();
  });

  it('updates without a roll and removes the glow while paused', () => {
    const view = render(<Counter value={3} />);

    view.rerender(<Counter value={4} isPaused />);

    expect(view.getByTestId('streak-number-current').props.children).toBe(4);
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();
    expect(view.queryByTestId('streak-fire-glow')).toBeNull();
  });

  it('does not celebrate when the streak decreases', () => {
    const view = render(<Counter value={4} />);

    view.rerender(<Counter value={2} />);

    expect(view.getByTestId('streak-number-current').props.children).toBe(2);
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();
  });

  it('counts in place from zero to the hydrated streak on a cold start', () => {
    jest.useFakeTimers();
    const view = render(<Counter value={12} animateFromZeroOnMount />);

    expect(view.getByTestId('streak-number-current').props.defaultValue).toBe('0');
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();
    expect(view.queryByTestId('streak-number-reel')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(2_000);
    });

    expect(view.getByTestId('streak-number-current').props.children).toBe(12);
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();
    jest.useRealTimers();
  });

  it('does not animate a zero streak on a cold start', () => {
    const view = render(<Counter value={0} animateFromZeroOnMount />);

    expect(view.getByTestId('streak-number-current').props.children).toBe(0);
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();
  });

  it('uses shorter steps for higher streaks', () => {
    expect(getStartupStreakRollTiming(30).stepDuration)
      .toBeLessThan(getStartupStreakRollTiming(5).stepDuration);
  });
});
