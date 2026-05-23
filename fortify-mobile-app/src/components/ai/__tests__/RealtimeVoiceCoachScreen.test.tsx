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

jest.mock('@/src/components/ai/ChatWorkoutTemplateCard', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    ChatWorkoutTemplateCard: ({ template }: { template: { name: string } }) => (
      <Text>{`${template.name} Card`}</Text>
    ),
  };
});

const defaultProps = {
  phase: 'listening' as const,
  error: null,
  transcriptOverlay: null,
  userAudioLevel: 0,
  coachAudioLevel: 0,
  debugStatus: {
    socketOpened: false,
    setupComplete: false,
    recordingStarted: false,
    microphoneChunksSent: 0,
    serverMessagesReceived: 0,
  },
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

const finishTypewriter = () => {
  act(() => {
    jest.advanceTimersByTime(1200);
  });
};

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

    finishTypewriter();

    expect(flattenTextStyle(getByText('Working text')).color).toBe(mockColors.textPrimary);
  });

  it('uses accent color for coach transcript overlay', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Stay tight.' }}
      />
    );

    finishTypewriter();

    expect(flattenTextStyle(getByText('Stay tight.')).color).toBe(mockColors.accent);
  });

  it('renders transcript text with larger type', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Stay tight.' }}
      />
    );

    finishTypewriter();

    expect(flattenTextStyle(getByText('Stay tight.')).fontSize).toBeGreaterThan(16);
  });

  it('caps transcript text to a two-line rolling window', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{
          speaker: 'coach',
          text: 'this opening sentence should fall away once the live caption fills two lines and the newest words should remain visible now',
        }}
      />
    );

    finishTypewriter();

    expect(queryByText(/This opening sentence/)).toBeNull();
    const transcript = getByText(/newest words should remain visible/);
    expect(transcript.props.numberOfLines).toBe(2);
    expect(transcript.props.ellipsizeMode).toBe('clip');
  });

  it('capitalizes all-lowercase transcript text', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'user', text: "i need a chest workout. make it hard." }}
      />
    );

    finishTypewriter();

    expect(queryByText("i need a chest workout. make it hard.")).toBeNull();
    expect(getByText("I need a chest workout. Make it hard.")).toBeTruthy();
  });

  it('types transcript text in progressively', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Rep one.' }}
      />
    );

    act(() => {
      jest.advanceTimersByTime(18);
    });

    expect(getByText('R')).toBeTruthy();
    expect(queryByText('Rep one.')).toBeNull();

    finishTypewriter();

    expect(getByText('Rep one.')).toBeTruthy();
  });

  it('removes transcript text after the fade-out completes', () => {
    const { getByText, queryByText, rerender } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'user', text: 'Finishing rep' }}
      />
    );

    finishTypewriter();
    expect(getByText('Finishing rep')).toBeTruthy();

    rerender(<RealtimeVoiceCoachScreen {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(queryByText('Finishing rep')).toBeNull();
  });

  it('renders raw technical startup errors in development debug mode', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        error="Cannot read property 'initialize' of undefined"
      />
    );

    expect(queryByText('Voice Coach could not start. Try again in a moment.')).toBeNull();
    expect(getByText("Cannot read property 'initialize' of undefined")).toBeTruthy();
  });

  it('renders native audio diagnostics in the debug line', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        debugStatus={{
          socketOpened: true,
          setupComplete: true,
          recordingStarted: true,
          recordingChange: true,
          microphoneChunksSent: 0,
          serverMessagesReceived: 1,
          lastServerMessageType: 'setupComplete',
          micWatchdogTriggered: true,
          nativeAudioFallback: 'voice_processing_unavailable',
          audioInterruption: 'began',
        }}
      />
    );

    expect(getByText(/nativeRec:yes/)).toBeTruthy();
    expect(getByText(/micWatch:yes/)).toBeTruthy();
    expect(getByText(/native:voice_processing_unavailable/)).toBeTruthy();
    expect(getByText(/interrupt:began/)).toBeTruthy();
  });

  it('renders workout cards in the voice screen content', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        voiceWorkoutMessages={[
          {
            id: 'voice-card-1',
            text: 'I made a chest workout.',
            workoutTemplate: {
              name: 'Chest Workout',
              focus: 'Chest',
              exercises: [
                {
                  exerciseId: 'bench-press',
                  exerciseName: 'Bench Press',
                  sets: 4,
                  reps: '6-10',
                },
              ],
            },
          },
        ]}
      />
    );

    expect(getByText('Chest Workout Card')).toBeTruthy();
  });
});
