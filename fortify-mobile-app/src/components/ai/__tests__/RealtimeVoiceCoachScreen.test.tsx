import React from 'react';
import { StyleSheet } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { RealtimeVoiceCoachScreen } from '@/src/components/ai/RealtimeVoiceCoachScreen';

const mockColors = {
  accent: '#44AAFF',
  accentLight: '#D7ECFF',
  background: '#000000',
  textPrimary: '#F7F7F7',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
};

jest.mock('@/src/contexts/ThemeContext', () => ({
  BaseColors: {
    success: '#00AA66',
    warning: '#FFCC00',
    error: '#FF4444',
    info: '#4488FF',
    chart1: '#111111',
    chart2: '#222222',
    chart3: '#333333',
    chart4: '#444444',
    chart5: '#555555',
  },
  DarkTheme: {
    ...mockColors,
    foreground: '#FFFFFF',
    card: '#111111',
    cardForeground: '#FFFFFF',
    popover: '#111111',
    popoverForeground: '#FFFFFF',
    primary: '#FFFFFF',
    primaryForeground: '#000000',
    secondary: '#222222',
    secondaryForeground: '#FFFFFF',
    muted: '#333333',
    mutedForeground: '#AAAAAA',
    accentForeground: '#000000',
    destructive: '#FF4444',
    destructiveForeground: '#FFFFFF',
    border: '#333333',
    input: '#333333',
    inputBackground: '#111111',
    ring: '#44AAFF',
    textDisabled: '#666666',
  },
  LightTheme: {
    ...mockColors,
    foreground: '#000000',
    card: '#FFFFFF',
    cardForeground: '#000000',
    popover: '#FFFFFF',
    popoverForeground: '#000000',
    primary: '#000000',
    primaryForeground: '#FFFFFF',
    secondary: '#EEEEEE',
    secondaryForeground: '#000000',
    muted: '#EEEEEE',
    mutedForeground: '#666666',
    accentForeground: '#000000',
    destructive: '#FF4444',
    destructiveForeground: '#FFFFFF',
    border: '#DDDDDD',
    input: '#DDDDDD',
    inputBackground: '#FFFFFF',
    ring: '#44AAFF',
    textDisabled: '#AAAAAA',
  },
  useTheme: () => ({
    colors: mockColors,
    isDark: true,
  }),
}));

jest.mock('@/src/components/ai/DumbbellVoiceVisualizer', () => ({
  DumbbellVoiceVisualizer: () => null,
}));

jest.mock('@/src/components/ai/ChatWorkoutTemplateCard', () => ({
  ChatWorkoutTemplateCard: () => null,
}));

const defaultProps = {
  phase: 'listening' as const,
  error: null,
  transcriptOverlay: null,
  voiceWorkoutMessages: [],
  savingWorkoutMessageId: null,
  startingWorkoutMessageId: null,
  isWorkoutActive: false,
  isActive: true,
  templateSaveError: null,
  onStart: jest.fn(),
  onStop: jest.fn(),
  onViewWorkoutTemplate: jest.fn(),
  onAddWorkoutTemplate: jest.fn(),
  onStartWorkoutTemplate: jest.fn(),
};

const flattenTextStyle = (node: { props: { style: unknown } }): any =>
  StyleSheet.flatten(node.props.style as Parameters<typeof StyleSheet.flatten>[0]);

describe('RealtimeVoiceCoachScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('does not render transcript text when idle', () => {
    const { queryByText } = render(<RealtimeVoiceCoachScreen {...defaultProps} />);

    expect(queryByText('Working text')).toBeNull();
  });

  it('uses theme text color for user transcript overlay', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'user', text: 'Working text' }}
      />
    );

    expect(flattenTextStyle(getByText('Working text')).color).toBe(mockColors.textPrimary);
  });

  it('uses accent color for coach transcript overlay', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Stay tight.' }}
      />
    );

    expect(flattenTextStyle(getByText('Stay tight.')).color).toBe(mockColors.accent);
  });

  it('removes transcript text after the fade-out completes', () => {
    const { getByText, queryByText, rerender } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'user', text: 'Finishing rep' }}
      />
    );

    expect(getByText('Finishing rep')).toBeTruthy();

    rerender(<RealtimeVoiceCoachScreen {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(queryByText('Finishing rep')).toBeNull();
  });

  it('does not render raw technical startup errors', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        error="Cannot read property 'initialize' of undefined"
      />
    );

    expect(queryByText("Cannot read property 'initialize' of undefined")).toBeNull();
    expect(getByText('Voice Coach could not start. Try again in a moment.')).toBeTruthy();
  });
});
