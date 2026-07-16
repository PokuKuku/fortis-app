import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/constants/Colors', () => ({
  Colors: {
    textPrimary: '#111111',
    textSecondary: '#555555',
    textTertiary: '#777777',
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      textPrimary: '#111111',
      textSecondary: '#555555',
      surfaceOverlay: 'rgba(0, 0, 0, 0.04)',
      accent: '#111111',
      accentForeground: '#ffffff',
    },
  }),
}));

const { AIConnectionErrorCard } = require('@/src/components/ai/AIConnectionErrorCard');

describe('AIConnectionErrorCard', () => {
  it('explains the interruption and retries from an explicit button', () => {
    const onRetry = jest.fn();
    const view = render(<AIConnectionErrorCard onRetry={onRetry} />);

    expect(view.getByText('Connection interrupted')).toBeTruthy();
    expect(view.getByText('Your message is safe. Try again when you have a connection.')).toBeTruthy();

    fireEvent.press(view.getByLabelText('Try sending message again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
