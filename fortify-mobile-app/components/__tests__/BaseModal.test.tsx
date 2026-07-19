import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BaseModal } from '@/src/components/ui/BaseModal';

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    textPrimary: '#111111',
    textSecondary: '#444444',
    success: '#22c55e',
    error: '#ef4444',
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      textPrimary: '#111111',
      textSecondary: '#444444',
    },
  }),
}));

describe('BaseModal close button', () => {
  it('provides an expanded hit target and closes when pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <BaseModal visible onClose={onClose} title="Workout details">
        <Text>Modal content</Text>
      </BaseModal>
    );

    const closeButton = getByLabelText('Close modal');
    expect(closeButton.props.hitSlop).toBe(10);

    fireEvent.press(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('accepts a faster entrance without changing modal behavior', () => {
    const { getByText } = render(
      <BaseModal
        visible
        onClose={jest.fn()}
        title="Quick modal"
        enterDuration={120}
        backdropEnterDuration={100}
      >
        <Text>Ready</Text>
      </BaseModal>
    );

    expect(getByText('Quick modal')).toBeTruthy();
    expect(getByText('Ready')).toBeTruthy();
  });
});
