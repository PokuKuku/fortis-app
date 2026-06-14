import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { VoiceSettingsPopover } from '@/src/components/ai/VoiceSettingsPopover';

jest.mock('@/constants/Typography', () => ({
  Typography: {
    bodySmall: { fontSize: 14 },
    caption: { fontSize: 12 },
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#17233a',
      background: '#ffffff',
      border: '#dddddd',
      textPrimary: '#111111',
      textSecondary: '#555555',
      textTertiary: '#777777',
    },
  }),
}));

jest.mock('react-native-heroicons/outline', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Cog6ToothIcon: () => <Text>gear</Text>,
    ChatBubbleLeftRightIcon: () => <Text>conversation</Text>,
    PhotoIcon: () => <Text>photo</Text>,
    UserCircleIcon: () => <Text>coach</Text>,
  };
});

describe('VoiceSettingsPopover', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens and routes coaching style and media actions', () => {
    const onOpenCoachingStyle = jest.fn();
    const onAddMedia = jest.fn();
    const view = render(
      <VoiceSettingsPopover
        interactionMode="push_to_talk"
        onInteractionModeChange={jest.fn()}
        onOpenCoachingStyle={onOpenCoachingStyle}
        onAddMedia={onAddMedia}
      />
    );

    fireEvent.press(view.getByTestId('voice-settings-gear'));
    expect(view.getByTestId('voice-settings-popover')).toBeTruthy();
    fireEvent.press(view.getByText('Coaching Style'));
    expect(onOpenCoachingStyle).not.toHaveBeenCalled();
    jest.advanceTimersByTime(220);
    expect(onOpenCoachingStyle).toHaveBeenCalled();

    fireEvent.press(view.getByTestId('voice-settings-gear'));
    fireEvent.press(view.getByText('Add Photos or Video'));
    jest.advanceTimersByTime(220);
    expect(onAddMedia).toHaveBeenCalled();
  });

  it('toggles realtime mode', () => {
    const onInteractionModeChange = jest.fn();
    const view = render(
      <VoiceSettingsPopover
        interactionMode="push_to_talk"
        onInteractionModeChange={onInteractionModeChange}
        onOpenCoachingStyle={jest.fn()}
        onAddMedia={jest.fn()}
      />
    );

    fireEvent.press(view.getByTestId('voice-settings-gear'));
    fireEvent(view.getByTestId('realtime-mode-switch'), 'valueChange', true);
    expect(onInteractionModeChange).toHaveBeenCalledWith('realtime');
  });

  it('toggles conversation mode', () => {
    const onExperienceModeChange = jest.fn();
    const view = render(
      <VoiceSettingsPopover
        interactionMode="push_to_talk"
        experienceMode="coach"
        onInteractionModeChange={jest.fn()}
        onExperienceModeChange={onExperienceModeChange}
        onOpenCoachingStyle={jest.fn()}
        onAddMedia={jest.fn()}
      />
    );

    fireEvent.press(view.getByTestId('voice-settings-gear'));
    fireEvent(view.getByTestId('conversation-mode-switch'), 'valueChange', true);
    jest.advanceTimersByTime(220);
    expect(onExperienceModeChange).toHaveBeenCalledWith('conversation');
  });
});
