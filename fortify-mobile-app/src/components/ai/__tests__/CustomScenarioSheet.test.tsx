import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
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
      error: '#cc0000',
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
  it('does not activate or persist Custom Coach when its pill is pressed', () => {
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

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps prompt edits local until Save is pressed', async () => {
    const onChange = jest.fn(() => Promise.resolve());
    const onClose = jest.fn();
    const view = render(
      <CustomScenarioSheet
        visible
        preferences={preferences}
        onChange={onChange}
        onClose={onClose}
      />
    );

    fireEvent.changeText(
      view.getByTestId('custom-scenario-instructions-input'),
      '  Be upbeat and concise.  '
    );
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(view.getByTestId('custom-coach-save-button'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        ...preferences,
        personality: 'custom',
        customInstructions: 'Be upbeat and concise.',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('disables Save for empty prompts and unchanged active Custom Coach prompts', () => {
    const emptyView = render(
      <CustomScenarioSheet
        visible
        preferences={{ ...preferences, customInstructions: '' }}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(emptyView.getByTestId('custom-coach-save-button').props.accessibilityState)
      .toEqual({ disabled: true });
    emptyView.unmount();

    const activeView = render(
      <CustomScenarioSheet
        visible
        preferences={{ ...preferences, personality: 'custom' }}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(activeView.getByTestId('custom-coach-save-button').props.accessibilityState)
      .toEqual({ disabled: true });
  });

  it('discards an unsaved prompt when the sheet closes and reopens', () => {
    const props = {
      preferences,
      onChange: jest.fn(),
      onClose: jest.fn(),
    };
    const view = render(<CustomScenarioSheet visible {...props} />);

    fireEvent.changeText(view.getByTestId('custom-scenario-instructions-input'), 'Unsaved draft');
    view.rerender(<CustomScenarioSheet visible={false} {...props} />);
    view.rerender(<CustomScenarioSheet visible {...props} />);

    expect(view.getByTestId('custom-scenario-instructions-input').props.value)
      .toBe(preferences.customInstructions);
  });

  it('keeps the sheet open and shows an error when Save fails', async () => {
    const onClose = jest.fn();
    const view = render(
      <CustomScenarioSheet
        visible
        preferences={preferences}
        onChange={jest.fn(() => Promise.reject(new Error('storage failed')))}
        onClose={onClose}
      />
    );

    fireEvent.changeText(view.getByTestId('custom-scenario-instructions-input'), 'A different coach');
    fireEvent.press(view.getByTestId('custom-coach-save-button'));

    await waitFor(() => {
      expect(view.getByText('Couldn’t save Custom Coach. Try again.')).toBeTruthy();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('continues saving preset coaching styles immediately', () => {
    const onChange = jest.fn();
    const view = render(
      <CustomScenarioSheet
        visible
        preferences={preferences}
        onChange={onChange}
        onClose={jest.fn()}
      />
    );

    fireEvent.press(view.getByTestId('custom-scenario-preset-roast'));
    expect(onChange).toHaveBeenCalledWith({ ...preferences, personality: 'roast' });
  });
});
