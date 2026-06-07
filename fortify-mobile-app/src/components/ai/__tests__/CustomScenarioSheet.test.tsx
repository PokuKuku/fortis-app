import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CustomScenarioSheet } from '@/src/components/ai/CustomScenarioSheet';
import type { RealtimeCoachPreferences } from '@/src/types/realtimeCoach';

jest.mock('@/constants/Typography', () => ({
  Typography: {
    body: { fontSize: 16, lineHeight: 24 },
    caption: { fontSize: 12, lineHeight: 16 },
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#17233a',
      accentForegroundOnFill: '#ffffff',
      textPrimary: '#111111',
      textSecondary: '#555555',
      textTertiary: '#777777',
    },
  }),
}));

const preferences: RealtimeCoachPreferences = {
  personality: 'direct',
  intensity: 0.55,
  voice: 'marin',
  customInstructions: 'Speak like a grounded personal coach.',
};

describe('CustomScenarioSheet', () => {
  it('selects Custom Coach from its pill while preserving its description', () => {
    const onChange = jest.fn();
    const view = render(
      <CustomScenarioSheet
        visible
        preferences={preferences}
        onChange={onChange}
        onClose={jest.fn()}
      />
    );

    const customCoachPill = view.getByTestId('custom-coach-select-button');
    expect(customCoachPill.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(customCoachPill);

    expect(onChange).toHaveBeenCalledWith({
      ...preferences,
      personality: 'custom',
    });
  });

  it('shows the Custom Coach pill as selected for a custom personality', () => {
    const view = render(
      <CustomScenarioSheet
        visible
        preferences={{ ...preferences, personality: 'custom' }}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(view.getByTestId('custom-coach-select-button').props.accessibilityState)
      .toEqual({ selected: true });
  });
});
