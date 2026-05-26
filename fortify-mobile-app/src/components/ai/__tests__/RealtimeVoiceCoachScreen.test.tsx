import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
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
    setupComplete: true,
    recordingStarted: false,
    microphoneChunksSent: 0,
    serverMessagesReceived: 0,
  },
  voiceWorkoutMessages: [],
  isGeneratingVoiceWorkout: false,
  savingWorkoutMessageId: null,
  startingWorkoutMessageId: null,
  isWorkoutActive: false,
  isActive: true,
  isUserTurnActive: false,
  templateSaveError: null,
  onTalkStart: jest.fn(),
  onTalkEnd: jest.fn(),
  onViewWorkoutTemplate: jest.fn(),
  onAddWorkoutTemplate: jest.fn(),
  onStartWorkoutTemplate: jest.fn(),
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

  it('does not render transcript overlay text', () => {
    const { queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Stay tight.' }}
      />
    );

    expect(queryByText('Stay tight.')).toBeNull();
  });

  it('keeps transcript overlay text removed after rerender', () => {
    const { queryByText, rerender } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        transcriptOverlay={{ speaker: 'coach', text: 'Finishing rep' }}
      />
    );

    expect(queryByText('Finishing rep')).toBeNull();

    rerender(<RealtimeVoiceCoachScreen {...defaultProps} />);

    expect(queryByText('Finishing rep')).toBeNull();
  });

  it('sanitizes raw technical connection errors before rendering', () => {
    const { getByText, queryByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        error={'Voice Coach connection failed: {"_defaultPrevented":false,"_timeStamp":89366044.300541,"type":"error","_bubbles":false}'}
      />
    );

    expect(queryByText('Voice Coach could not start. Try again in a moment.')).toBeNull();
    expect(queryByText(/_defaultPrevented/)).toBeNull();
    expect(getByText('Voice Coach had trouble connecting. Check your connection and try again.')).toBeTruthy();
  });

  it('renders voice limit messages as neutral notices instead of red errors', () => {
    const { getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        error="You've reached today's Voice Coach limit. Try again tomorrow."
      />
    );

    const notice = getByText("You've reached today's Voice Coach limit. Try again tomorrow.");
    const noticeStyle = StyleSheet.flatten(notice.props.style);
    expect(noticeStyle.color).toBe(mockColors.textSecondary);
  });

  it('does not render native audio diagnostics in the clean idle voice screen', () => {
    const { queryByText } = render(
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

    expect(queryByText(/nativeRec:yes/)).toBeNull();
    expect(queryByText(/ptt:/)).toBeNull();
    expect(queryByText(/phase:/)).toBeNull();
  });

  it('uses press-and-hold handlers for the talk button', () => {
    const onTalkStart = jest.fn();
    const onTalkEnd = jest.fn();
    const { getByLabelText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        onTalkStart={onTalkStart}
        onTalkEnd={onTalkEnd}
      />
    );

    const talkButton = getByLabelText('Hold to talk to Voice Coach');
    fireEvent(talkButton, 'pressIn');
    fireEvent(talkButton, 'pressOut');
    fireEvent.press(talkButton);

    expect(onTalkStart).toHaveBeenCalledTimes(1);
    expect(onTalkEnd).toHaveBeenCalledTimes(1);
  });

  it('dims and disables the talk button while connecting', () => {
    const onTalkStart = jest.fn();
    const onTalkEnd = jest.fn();
    const { getByLabelText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        phase="connecting"
        debugStatus={{
          ...defaultProps.debugStatus,
          setupComplete: false,
        }}
        onTalkStart={onTalkStart}
        onTalkEnd={onTalkEnd}
      />
    );

    const talkButton = getByLabelText('Hold to talk to Voice Coach');
    fireEvent(talkButton, 'pressIn');
    fireEvent(talkButton, 'pressOut');

    expect(onTalkStart).not.toHaveBeenCalled();
    expect(onTalkEnd).not.toHaveBeenCalled();
    expect(talkButton.props.accessibilityState).toEqual({ disabled: true });
    expect(StyleSheet.flatten(talkButton.props.style).opacity).toBeLessThan(1);
  });

  it('renders workout cards in the voice screen content', () => {
    const { getByTestId, getByText } = render(
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

    const slotStyle = StyleSheet.flatten(getByTestId('voice-middle-content-slot').props.style);
    const cardScrollStyle = StyleSheet.flatten(getByTestId('voice-card-scroll').props.style);
    const cardShellStyle = StyleSheet.flatten(getByTestId('voice-card-shell-voice-card-1').props.style);
    expect(slotStyle.top).toBeGreaterThan(0);
    expect(slotStyle.bottom).toBeGreaterThan(0);
    expect(slotStyle.height).toBeGreaterThan(0);
    expect(cardScrollStyle.maxHeight).toBe(slotStyle.height);
    expect(cardScrollStyle.maxHeight).toBeGreaterThan(190);
    expect(cardShellStyle.width).toBe('100%');
    expect(cardShellStyle.transform).toHaveLength(2);
  });

  it('renders a pending workout card while voice workout generation is delayed', () => {
    const { getByTestId, getByText } = render(
      <RealtimeVoiceCoachScreen
        {...defaultProps}
        isGeneratingVoiceWorkout
      />
    );

    expect(getByText('Building Workout')).toBeTruthy();
    expect(getByText('Coming up...')).toBeTruthy();
    expect(getByTestId('voice-card-scroll')).toBeTruthy();
    expect(getByTestId('voice-workout-loading-card')).toBeTruthy();
  });
});
