import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

const speechListeners: Record<string, ((event?: unknown) => void) | undefined> = {};
const mockSpeechModule = {
  requestPermissionsAsync: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addListener: jest.fn((eventName: string, listener: (event?: unknown) => void) => {
    speechListeners[eventName] = listener;
    return { remove: jest.fn() };
  }),
};

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: () => mockSpeechModule,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      background: '#ffffff',
      textPrimary: '#111111',
      textTertiary: '#666666',
      accent: '#111111',
      accentBorder: '#111111',
    },
  }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: { error: '#ff0000' },
}));

jest.mock('@/src/services/microphonePermissionService', () => ({
  openMicrophoneSettings: jest.fn(),
}));

const { ChatInput } = require('@/src/components/ai/ChatInput');

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(speechListeners).forEach((key) => delete speechListeners[key]);
  });

  it('does not show an alert when speech recognition is aborted during teardown', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(
      <ChatInput
        value=""
        onChangeText={jest.fn()}
        onSend={jest.fn()}
      />
    );

    act(() => {
      speechListeners.error?.({
        error: 'aborted',
        message: 'Speech recognition aborted.',
      });
    });

    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('requests AI consent before starting voice dictation permissions', async () => {
    const onRequestAIConsent = jest.fn().mockResolvedValue(false);
    const view = render(
      <ChatInput
        value=""
        onChangeText={jest.fn()}
        onSend={jest.fn()}
        onRequestAIConsent={onRequestAIConsent}
      />
    );

    await act(async () => {
      fireEvent.press(view.getByLabelText('Start voice dictation'));
    });

    expect(onRequestAIConsent).toHaveBeenCalledTimes(1);
    expect(mockSpeechModule.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockSpeechModule.start).not.toHaveBeenCalled();
  });
});
