import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { RealtimeCoachSettingsModal } from '@/src/components/ai/RealtimeCoachSettingsModal';
import type { RealtimeCoachPreferences } from '@/src/types/realtimeCoach';

jest.mock('@/src/contexts/ThemeContext', () => {
  const actual = jest.requireActual('@/src/contexts/ThemeContext');

  return {
    ...actual,
    useTheme: () => ({
      isDark: false,
      colors: {
        ...actual.LightTheme,
        accent: '#17233a',
        accentOverlay: '#e7ebf2',
        accentForegroundOnFill: '#ffffff',
        background: '#ffffff',
        border: '#dddddd',
        error: '#cc0000',
        textPrimary: '#111111',
        textSecondary: '#555555',
        textTertiary: '#777777',
      },
    }),
  };
});

const preferences: RealtimeCoachPreferences = {
  personality: 'direct',
  intensity: 0.55,
  voice: 'marin',
  customInstructions: 'Speak like a grounded personal coach.',
  interactionMode: 'push_to_talk',
};

describe('RealtimeCoachSettingsModal', () => {
  it('saves and activates Custom Coach Style only when Save is pressed', async () => {
    const onChange = jest.fn(() => Promise.resolve());
    const onClose = jest.fn();
    const view = render(
      <RealtimeCoachSettingsModal
        visible
        preferences={preferences}
        onChange={onChange}
        onClose={onClose}
      />
    );

    fireEvent.press(view.getByTestId('realtime-coach-custom-coach-select-button'));
    expect(onChange).not.toHaveBeenCalled();
    expect(view.getByTestId('realtime-coach-personality-roast').props.accessibilityState).toEqual({ selected: false });
    expect(view.getByTestId('realtime-coach-custom-coach-select-button').props.accessibilityState).toEqual({ selected: true });

    fireEvent.changeText(view.getByTestId('realtime-coach-custom-coach-input'), 'Be calm but direct.');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(view.getByTestId('realtime-coach-finished-button'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        ...preferences,
        personality: 'custom',
        customInstructions: 'Be calm but direct.',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows a save failure without closing', async () => {
    const onClose = jest.fn();
    const view = render(
      <RealtimeCoachSettingsModal
        visible
        preferences={preferences}
        onChange={jest.fn(() => Promise.reject(new Error('storage failed')))}
        onClose={onClose}
      />
    );

    fireEvent.press(view.getByTestId('realtime-coach-custom-coach-select-button'));
    fireEvent.changeText(view.getByTestId('realtime-coach-custom-coach-input'), 'A different coach');
    fireEvent.press(view.getByTestId('realtime-coach-finished-button'));

    await waitFor(() => {
      expect(view.getByText('Couldn’t save Custom Coach Style. Try again.')).toBeTruthy();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('continues saving voice and preset style selections immediately', () => {
    const onChange = jest.fn();
    const view = render(
      <RealtimeCoachSettingsModal
        visible
        preferences={preferences}
        onChange={onChange}
        onClose={jest.fn()}
      />
    );

    fireEvent.press(view.getByText('Cedar'));
    expect(onChange).toHaveBeenCalledWith({ ...preferences, voice: 'cedar' });

    fireEvent.press(view.getByText('Tough Love'));
    expect(onChange).toHaveBeenCalledWith({ ...preferences, personality: 'roast' });
  });

  it('closes with Save when there are no custom style changes to save', () => {
    const onChange = jest.fn();
    const onClose = jest.fn();
    const view = render(
      <RealtimeCoachSettingsModal
        visible
        preferences={{ ...preferences, personality: 'custom' }}
        onChange={onChange}
        onClose={onClose}
      />
    );

    fireEvent.press(view.getByTestId('realtime-coach-finished-button'));
    expect(onChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps preset coaching styles and Custom Coach Style mutually exclusive', () => {
    const view = render(
      <RealtimeCoachSettingsModal
        visible
        preferences={{ ...preferences, personality: 'custom' }}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(view.getByTestId('realtime-coach-custom-coach-select-button').props.accessibilityState).toEqual({ selected: true });

    fireEvent.press(view.getByText('Practical'));
    expect(view.getByTestId('realtime-coach-personality-direct').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByTestId('realtime-coach-custom-coach-select-button').props.accessibilityState).toEqual({ selected: false });
  });
});
