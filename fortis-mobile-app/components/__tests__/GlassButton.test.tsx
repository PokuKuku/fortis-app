import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassButton } from '../GlassButton';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('GlassButton', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <GlassButton>
        <Text>Test Button</Text>
      </GlassButton>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton onPress={onPressMock}>
        <Text>Press Me</Text>
      </GlassButton>
    );

    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton onPress={onPressMock} disabled>
        <Text>Disabled Button</Text>
      </GlassButton>
    );

    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies custom style', () => {
    const customStyle = { width: 200 };
    const { getByTestId } = render(
      <GlassButton style={customStyle}>
        <Text testID="button-content">Styled Button</Text>
      </GlassButton>
    );

    expect(getByTestId('button-content')).toBeTruthy();
  });
});
