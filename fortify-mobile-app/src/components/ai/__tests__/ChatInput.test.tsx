import React from 'react';
import { Alert } from 'react-native';
import { act, render } from '@testing-library/react-native';

const speechListeners: Record<string, ((event?: unknown) => void) | undefined> = {};

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: () => ({
    requestPermissionsAsync: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addListener: jest.fn((eventName: string, listener: (event?: unknown) => void) => {
      speechListeners[eventName] = listener;
      return { remove: jest.fn() };
    }),
  }),
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
});
