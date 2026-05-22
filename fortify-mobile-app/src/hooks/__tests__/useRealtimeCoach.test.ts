import { act, renderHook } from '@testing-library/react-native';
import { useRealtimeCoach } from '@/src/hooks/useRealtimeCoach';

const mockCreateRealtimeCoachSession = jest.fn();
const mockGenerateVoiceWorkoutTemplate = jest.fn();
const mockSetAudioModeAsync = jest.fn((_mode: unknown) => Promise.resolve());
const mockInitialize = jest.fn(() => Promise.resolve(true));
const mockToggleRecording = jest.fn((_value: boolean) => true);
const mockTearDown = jest.fn();
const mockPlayPCMData = jest.fn();
const mockBypassVoiceProcessing = jest.fn();
const mockGetMicrophonePermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted', granted: true }));
const mockRequestMicrophonePermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted', granted: true }));
const mockAddAudioListener = jest.fn();

type AudioEventName =
  | 'onMicrophoneData'
  | 'onInputVolumeLevelData'
  | 'onOutputVolumeLevelData'
  | 'onRecordingChange'
  | 'onAudioInterruption';

const audioListeners: Partial<Record<AudioEventName, (event: { data: unknown }) => void>> = {};

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: (mode: unknown) => mockSetAudioModeAsync(mode),
  },
  InterruptionModeAndroid: {
    DuckOthers: 'DuckOthers',
  },
  InterruptionModeIOS: {
    MixWithOthers: 'MixWithOthers',
  },
}));

jest.mock('@speechmatics/expo-two-way-audio', () => ({
  initialize: () => mockInitialize(),
  getMicrophonePermissionsAsync: () => mockGetMicrophonePermissionsAsync(),
  requestMicrophonePermissionsAsync: () => mockRequestMicrophonePermissionsAsync(),
  bypassVoiceProcessing: (value: boolean) => mockBypassVoiceProcessing(value),
  playPCMData: (audioData: Uint8Array) => mockPlayPCMData(audioData),
  toggleRecording: (value: boolean) => mockToggleRecording(value),
  tearDown: () => mockTearDown(),
  addExpoTwoWayAudioEventListener: (...args: [AudioEventName, (event: { data: unknown }) => void]) => mockAddAudioListener(...args),
}));

jest.mock('@/src/services/realtimeCoachService', () => ({
  createRealtimeCoachSession: (preferences: unknown) => mockCreateRealtimeCoachSession(preferences),
  generateVoiceWorkoutTemplate: (prompt: unknown, context: unknown) => mockGenerateVoiceWorkoutTemplate(prompt, context),
}));

jest.mock('@/src/utils/realtimeCoach', () => ({
  shouldGenerateWorkoutFromVoice: () => false,
}));

class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];

  readyState = 0;
  sentMessages: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(message: string) {
    this.sentMessages.push(message);
  }

  close() {
    this.readyState = 3;
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  message(data: string) {
    this.onmessage?.({ data });
  }
}

const preferences = {
  personality: 'direct' as const,
  intensity: 0.55,
  voice: 'marin' as const,
};

const startConnectedSession = async () => {
  const hook = renderHook(() => useRealtimeCoach({ preferences }));

  await act(async () => {
    await hook.result.current.start();
  });

  const socket = MockWebSocket.instances[0];
  act(() => {
    socket.open();
    socket.message(JSON.stringify({ setupComplete: {} }));
  });

  return { hook, socket };
};

describe('useRealtimeCoach', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    MockWebSocket.instances = [];
    Object.keys(audioListeners).forEach((key) => {
      delete audioListeners[key as AudioEventName];
    });
    mockAddAudioListener.mockImplementation((eventName: AudioEventName, handler: (event: { data: unknown }) => void) => {
      audioListeners[eventName] = handler;
      return {
        remove: jest.fn(() => {
          if (audioListeners[eventName] === handler) {
            delete audioListeners[eventName];
          }
        }),
      };
    });
    mockCreateRealtimeCoachSession.mockResolvedValue({
      type: 'session',
      session: {
        provider: 'gemini',
        accessToken: 'auth_tokens/test-token',
        liveEndpoint: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained',
        model: 'gemini-3.1-flash-live-preview',
        voice: 'marin',
        usage: {
          secondsUsedToday: 0,
          maxSecondsPerDay: 86400,
          maxSecondsPerSession: 86400,
        },
      },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows a mic watchdog error when recording starts but no microphone chunks arrive', async () => {
    const { hook } = await startConnectedSession();

    expect(hook.result.current.debugStatus.setupComplete).toBe(true);
    expect(hook.result.current.debugStatus.recordingStarted).toBe(true);
    expect(hook.result.current.debugStatus.microphoneChunksSent).toBe(0);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(hook.result.current.error).toBe(
      'Microphone stream is not emitting audio. On iOS Simulator, check host microphone input or test on a physical iPhone.'
    );
    expect(hook.result.current.debugStatus.micWatchdogTriggered).toBe(true);
    expect(hook.result.current.debugStatus.nativeAudioFallback).toBe('voice_processing_unavailable');
    expect(mockBypassVoiceProcessing).toHaveBeenCalledWith(true);

    hook.unmount();
  });

  it('does not show the watchdog error once microphone chunks are emitted', async () => {
    const { hook, socket } = await startConnectedSession();

    act(() => {
      audioListeners.onMicrophoneData?.({ data: new Uint8Array([1, 0, 2, 0]) });
      jest.advanceTimersByTime(2000);
    });

    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.debugStatus.microphoneChunksSent).toBe(1);
    expect(hook.result.current.debugStatus.micWatchdogTriggered).toBe(false);
    expect(mockBypassVoiceProcessing).not.toHaveBeenCalledWith(true);
    expect(socket.sentMessages.some((message) => message.includes('realtimeInput'))).toBe(true);

    hook.unmount();
  });

  it('tracks native recording and interruption diagnostics', async () => {
    const { hook } = await startConnectedSession();

    act(() => {
      audioListeners.onRecordingChange?.({ data: true });
      audioListeners.onAudioInterruption?.({ data: 'began' });
    });

    expect(hook.result.current.debugStatus.recordingChange).toBe(true);
    expect(hook.result.current.debugStatus.audioInterruption).toBe('began');

    hook.unmount();
  });
});
