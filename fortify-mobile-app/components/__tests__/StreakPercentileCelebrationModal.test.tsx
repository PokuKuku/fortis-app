import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import {
  STREAK_PERCENTILE_MILESTONES,
  StreakPercentileCelebrationModal,
} from '@/src/components/retention/StreakPercentileCelebrationModal';

describe('StreakPercentileCelebrationModal', () => {
  it('renders the requested streak milestone and continues', () => {
    const onContinue = jest.fn();
    const view = render(
      <ThemeProvider>
        <StreakPercentileCelebrationModal visible streak={5} onContinue={onContinue} />
      </ThemeProvider>
    );

    expect(view.getByText('5 DAYS')).toBeTruthy();
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

    expect(view.getByText('10 DAYS')).toBeTruthy();
    expect(view.getByText('TOP 6%')).toBeTruthy();
    expect(view.getByText('ABSOLUTELY ELITE!')).toBeTruthy();
    expect(view.queryByText('How this is estimated')).toBeNull();
  });
});
