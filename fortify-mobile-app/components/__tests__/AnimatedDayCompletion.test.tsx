import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { AnimatedDayCompletion } from '@/src/components/program/AnimatedDayCompletion';

function DayStatus({ isComplete }: { isComplete: boolean }) {
  return (
    <ThemeProvider>
      <AnimatedDayCompletion
        isComplete={isComplete}
        dateLabel="5"
        dateColor="#777777"
      />
    </ThemeProvider>
  );
}

describe('AnimatedDayCompletion', () => {
  it('celebrates when an incomplete day becomes complete', () => {
    const view = render(<DayStatus isComplete={false} />);

    expect(view.getByText('5')).toBeTruthy();
    expect(view.queryByTestId('completed-day-check')).toBeNull();

    view.rerender(<DayStatus isComplete />);

    expect(view.getByTestId('completed-day-check-icon')).toBeTruthy();
    expect(view.getByTestId('completed-day-check-glow')).toBeTruthy();
  });

  it('does not replay the celebration for an already completed day', () => {
    const view = render(<DayStatus isComplete />);

    expect(view.getByTestId('completed-day-check-icon')).toBeTruthy();
    expect(view.queryByTestId('completed-day-check-glow')).toBeNull();
  });
});
