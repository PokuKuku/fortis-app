import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { AnimatedStreakCounter } from '@/src/components/program/AnimatedStreakCounter';

function Counter({ value, isPaused = false }: { value: number; isPaused?: boolean }) {
  return (
    <ThemeProvider>
      <AnimatedStreakCounter value={value} isPaused={isPaused} />
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
});
