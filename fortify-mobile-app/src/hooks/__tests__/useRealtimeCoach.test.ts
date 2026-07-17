import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { useRealtimeCoach } from '@/src/hooks/useRealtimeCoach';
import type { AIWorkoutTemplate } from '@/src/types/ai';

const mockCreateRealtimeCoachSession = jest.fn();
const mockGenerateVoiceWorkoutTemplate = jest.fn();
const mockGenerateRealtimeCoachScriptAudio = jest.fn();
const mockReportRealtimeCoachUsage = jest.fn();
const mockRequestAIDataSharingConsent = jest.fn();
const mockShouldGenerateWorkoutFromVoice = jest.fn((_text?: string, _hasCurrentWorkoutDraft?: boolean) => false);
const mockShouldEditWorkoutFromVoice = jest.fn((_text?: string, _hasCurrentWorkoutDraft?: boolean) => false);
const mockShouldRegenerateWorkoutFromVoice = jest.fn((_text?: string, _hasCurrentWorkoutDraft?: boolean) => false);
const mockSetAudioModeAsync = jest.fn((_mode: unknown) => Promise.resolve());
const mockSoundUnloadAsync = jest.fn(() => Promise.resolve());
const mockSoundCreateAsync = jest.fn((
  _source?: unknown,
  _initialStatus?: unknown,
  _onPlaybackStatusUpdate?: unknown
) => Promise.resolve({
  sound: {
    unloadAsync: mockSoundUnloadAsync,
  },
}));
const mockWriteAsStringAsync = jest.fn((
  _fileUri?: unknown,
  _contents?: unknown,
  _options?: unknown
) => Promise.resolve());
const mockInitialize = jest.fn(() => Promise.resolve(true));
const mockToggleRecording = jest.fn((_value: boolean) => true);
const mockTearDown = jest.fn();
const mockPlayPCMData = jest.fn();
const mockBypassVoiceProcessing = jest.fn();
const mockGetMicrophonePermissionsAsync = jest.fn(() => Promise.resolve({
  status: 'granted',
  granted: true,
  canAskAgain: true,
}));
const mockRequestMicrophonePermissionsAsync = jest.fn(() => Promise.resolve({
  status: 'granted',
  granted: true,
  canAskAgain: true,
}));
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
    Sound: {
      createAsync: (source: unknown, initialStatus: unknown, onPlaybackStatusUpdate: unknown) =>
        mockSoundCreateAsync(source, initialStatus, onPlaybackStatusUpdate),
    },
  },
  InterruptionModeAndroid: {
    DuckOthers: 'DuckOthers',
  },
  InterruptionModeIOS: {
    MixWithOthers: 'MixWithOthers',
    DoNotMix: 'DoNotMix',
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'voice-workout-message-id',
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
  createRealtimeCoachSession: (preferences: unknown, interactionMode: unknown) =>
    mockCreateRealtimeCoachSession(preferences, interactionMode),
  generateRealtimeCoachScriptAudio: (script: unknown, preferences: unknown) =>
    mockGenerateRealtimeCoachScriptAudio(script, preferences),
  generateVoiceWorkoutTemplate: (prompt: unknown, context: unknown) => mockGenerateVoiceWorkoutTemplate(prompt, context),
  reportRealtimeCoachUsage: (secondsUsed: unknown) => mockReportRealtimeCoachUsage(secondsUsed),
}));

jest.mock('@/src/services/aiConsentService', () => ({
  requestAIDataSharingConsent: (options?: unknown) => mockRequestAIDataSharingConsent(options),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  EncodingType: {
    Base64: 'base64',
  },
  writeAsStringAsync: (fileUri: unknown, contents: unknown, options: unknown) =>
    mockWriteAsStringAsync(fileUri, contents, options),
}));

jest.mock('@/src/utils/realtimeCoach', () => ({
  shouldEditWorkoutFromVoice: (text: string, hasCurrentWorkoutDraft?: boolean) =>
    mockShouldEditWorkoutFromVoice(text, hasCurrentWorkoutDraft),
  shouldGenerateWorkoutFromVoice: (text: string, hasCurrentWorkoutDraft?: boolean) =>
    mockShouldGenerateWorkoutFromVoice(text, hasCurrentWorkoutDraft),
  shouldRegenerateWorkoutFromVoice: (text: string, hasCurrentWorkoutDraft?: boolean) =>
    mockShouldRegenerateWorkoutFromVoice(text, hasCurrentWorkoutDraft),
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

const countRealtimeInputMessages = (socket: MockWebSocket): number =>
  socket.sentMessages.filter((message) => message.startsWith('{"realtimeInput"') && message.includes('"audio"')).length;

const countRealtimeActivityMessages = (socket: MockWebSocket, activity: 'activityStart' | 'activityEnd'): number =>
  socket.sentMessages.filter((message) => message.includes(`"${activity}"`)).length;

const pcmChunk = (sample: number, sampleCount = 320): Uint8Array => {
  const chunk = new Uint8Array(sampleCount * 2);
  const view = new DataView(chunk.buffer);
  for (let index = 0; index < sampleCount; index += 1) {
    view.setInt16(index * 2, sample, true);
  }
  return chunk;
};

const audioMessage = (byteLength = 4800): string => JSON.stringify({
  serverContent: {
    modelTurn: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/pcm;rate=24000',
            data: Buffer.from(new Uint8Array(byteLength)).toString('base64'),
          },
        },
      ],
    },
  },
});

const startConnectedSession = async (options?: {
  currentWorkoutTemplateDraft?: AIWorkoutTemplate;
  interactionMode?: 'push_to_talk' | 'realtime';
  preferences?: typeof preferences & {
    experienceMode?: 'coach' | 'conversation';
    conversationPersonaInstructions?: string;
  };
}) => {
  const hook = renderHook(() => useRealtimeCoach({
    preferences: options?.preferences ?? preferences,
    currentWorkoutTemplateDraft: options?.currentWorkoutTemplateDraft,
    interactionMode: options?.interactionMode,
  }));

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
  let alertSpy: jest.SpyInstance;
  let openSettingsSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
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
    mockShouldGenerateWorkoutFromVoice.mockReturnValue(false);
    mockShouldEditWorkoutFromVoice.mockReturnValue(false);
    mockShouldRegenerateWorkoutFromVoice.mockReturnValue(false);
    mockRequestAIDataSharingConsent.mockResolvedValue(true);
    mockGetMicrophonePermissionsAsync.mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true });
    mockRequestMicrophonePermissionsAsync.mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true });
    mockInitialize.mockResolvedValue(true);
    mockToggleRecording.mockReturnValue(true);
    mockGenerateRealtimeCoachScriptAudio.mockResolvedValue({
      type: 'script_audio',
      audio: {
        type: 'script_audio',
        audioBase64: Buffer.from(new Uint8Array([0, 0, 1, 0])).toString('base64'),
        mimeType: 'audio/pcm;rate=24000',
        sampleRate: 24000,
        voice: 'marin',
      },
    });
    mockReportRealtimeCoachUsage.mockResolvedValue({
      secondsUsedToday: 30,
      maxSecondsPerDay: 7200,
      maxSecondsPerSession: 1800,
    });
    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      answer: {
        text: 'I built a chest workout.',
        workoutTemplate: {
          name: 'Chest Workout',
          focus: 'Chest',
          exercises: [
            {
              exerciseId: 'exercise-1',
              exerciseName: 'Bench Press',
              sets: 4,
              reps: '6-10',
            },
          ],
        },
      },
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
    alertSpy.mockRestore();
    openSettingsSpy.mockRestore();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('connects without recording until the user holds to talk', async () => {
    const { hook } = await startConnectedSession();

    expect(mockRequestAIDataSharingConsent).toHaveBeenCalledWith({ forcePrompt: true });
    expect(hook.result.current.debugStatus.setupComplete).toBe(true);
    expect(hook.result.current.debugStatus.recordingStarted).toBe(false);
    expect(hook.result.current.isUserTurnActive).toBe(false);
    expect(hook.result.current.debugStatus.microphoneChunksSent).toBe(0);

    hook.unmount();
  });

  it('stops cleanly when AI data consent is declined', async () => {
    mockRequestAIDataSharingConsent.mockResolvedValue(false);

    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      await hook.result.current.start();
    });

    expect(mockRequestAIDataSharingConsent).toHaveBeenCalledWith({ forcePrompt: true });
    expect(mockGetMicrophonePermissionsAsync).not.toHaveBeenCalled();
    expect(mockCreateRealtimeCoachSession).not.toHaveBeenCalled();
    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.phase).toBe('stopped');

    hook.unmount();
  });

  it('shows a native microphone settings prompt instead of raw permission JSON when access is denied', async () => {
    mockGetMicrophonePermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });

    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      await hook.result.current.start();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Microphone Access Needed',
      'Turn on microphone access to use Voice Coach.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Not Now', style: 'cancel' }),
        expect.objectContaining({ text: 'Open Settings' }),
      ])
    );
    expect(mockRequestMicrophonePermissionsAsync).not.toHaveBeenCalled();
    expect(mockCreateRealtimeCoachSession).not.toHaveBeenCalled();
    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.phase).toBe('stopped');

    hook.unmount();
  });

  it('ignores late setup messages after stop without warning', async () => {
    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      await hook.result.current.start();
    });

    const socket = MockWebSocket.instances[0];
    act(() => {
      socket.open();
    });

    act(() => {
      hook.result.current.stop();
    });

    act(() => {
      socket.message(JSON.stringify({ setupComplete: {} }));
    });

    expect(console.warn).not.toHaveBeenCalledWith(
      '[Voice Coach] startup failed',
      expect.anything()
    );
    expect(hook.result.current.debugStatus.setupComplete).toBe(false);
    expect(hook.result.current.phase).toBe('stopped');

    hook.unmount();
  });

  it('reports actual connected usage on heartbeat and stop', async () => {
    const { hook } = await startConnectedSession();

    await act(async () => {
      jest.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(mockReportRealtimeCoachUsage).toHaveBeenCalledWith(30);

    await act(async () => {
      jest.advanceTimersByTime(12000);
      hook.result.current.stop();
      await Promise.resolve();
    });

    expect(mockReportRealtimeCoachUsage).toHaveBeenCalledWith(12);

    hook.unmount();
  });

  it('generates and plays creator script audio without starting a realtime session', async () => {
    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      const didSpeak = await hook.result.current.speakCreatorScript('Your excuses need a deload.');
      expect(didSpeak).toBe(true);
    });

    expect(mockCreateRealtimeCoachSession).not.toHaveBeenCalled();
    expect(mockGenerateRealtimeCoachScriptAudio).toHaveBeenCalledWith('Your excuses need a deload.', preferences);
    expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('voice-coach-script-'),
      expect.any(String),
      { encoding: 'base64' }
    );
    expect(mockSoundCreateAsync).toHaveBeenCalledWith(
      { uri: expect.stringContaining('voice-coach-script-') },
      { shouldPlay: true },
      expect.any(Function)
    );
    expect(hook.result.current.isSpeakingCreatorScript).toBe(true);

    hook.unmount();
  });

  it('surfaces creator script validation errors without calling the service', async () => {
    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      const didSpeak = await hook.result.current.speakCreatorScript('   ');
      expect(didSpeak).toBe(false);
    });

    expect(mockGenerateRealtimeCoachScriptAudio).not.toHaveBeenCalled();
    expect(hook.result.current.creatorScriptError).toBe('Type a roast script first.');

    hook.unmount();
  });

  it('surfaces creator script service errors', async () => {
    mockGenerateRealtimeCoachScriptAudio.mockResolvedValue({
      type: 'error',
      requestId: 'request-1',
      error: {
        code: 'FORBIDDEN',
        message: 'Voice Coach script controls are not enabled for this account.',
        retryable: false,
      },
    });
    const hook = renderHook(() => useRealtimeCoach({ preferences }));

    await act(async () => {
      const didSpeak = await hook.result.current.speakCreatorScript('Say this.');
      expect(didSpeak).toBe(false);
    });

    expect(hook.result.current.creatorScriptError).toBe('Voice Coach script controls are not enabled for this account.');
    expect(hook.result.current.isSpeakingCreatorScript).toBe(false);

    hook.unmount();
  });

  it('shows a mic watchdog error when push-to-talk recording starts but no microphone chunks arrive', async () => {
    const { hook } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
    });

    expect(hook.result.current.debugStatus.recordingStarted).toBe(true);
    expect(hook.result.current.isUserTurnActive).toBe(true);

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

  it('configures Gemini so speaker output does not interrupt itself', async () => {
    const { hook, socket } = await startConnectedSession();
    const setupMessage = JSON.parse(socket.sentMessages[0]);

    expect(setupMessage.setup.realtimeInputConfig.activityHandling).toBe('NO_INTERRUPTION');
    expect(setupMessage.setup.realtimeInputConfig.automaticActivityDetection.disabled).toBe(true);
    expect(setupMessage.setup.tools[0].functionDeclarations[0].name).toBe('create_or_update_workout');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('varied short acknowledgement');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('call the create_or_update_workout tool immediately');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('never say "chat"');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('Always speak English');
    expect(setupMessage.setup.systemInstruction.parts[0].text).not.toContain('in the chat');

    hook.unmount();
  });

  it('configures Gemini with the selected coach voice', async () => {
    const cedarPreferences = {
      ...preferences,
      voice: 'cedar' as const,
    };
    const hook = renderHook(() => useRealtimeCoach({ preferences: cedarPreferences }));

    await act(async () => {
      await hook.result.current.start();
    });

    const socket = MockWebSocket.instances[0];
    act(() => {
      socket.open();
    });
    const setupMessage = JSON.parse(socket.sentMessages[0]);

    expect(mockCreateRealtimeCoachSession).toHaveBeenCalledWith(cedarPreferences, 'push_to_talk');
    expect(setupMessage.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Puck');

    hook.unmount();
  });

  it('includes workout tools and sends completed typed turns in conversation mode', async () => {
    const conversationPreferences = {
      ...preferences,
      experienceMode: 'conversation' as const,
      conversationPersonaInstructions: 'Be sharp and use exact numbers.',
    };
    const { hook, socket } = await startConnectedSession({ preferences: conversationPreferences });
    const setupMessage = JSON.parse(socket.sentMessages[0]);

    expect(setupMessage.setup.tools[0].functionDeclarations[0].name).toBe('create_or_update_workout');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('Be sharp and use exact numbers.');
    expect(setupMessage.setup.systemInstruction.parts[0].text).toContain('call the create_or_update_workout tool immediately');

    act(() => {
      expect(hook.result.current.sendTextPrompt('Roast my consistency')).toBe(true);
    });
    const typedTurn = JSON.parse(socket.sentMessages[socket.sentMessages.length - 1]);
    expect(typedTurn.clientContent.turnComplete).toBe(true);
    expect(typedTurn.clientContent.turns[0].parts[0].text).toBe('Roast my consistency');

    hook.unmount();
  });

  it('starts conversation-mode workout generation from a typed prompt if Gemini completes without a tool call', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => (
      text === 'Make me an ab workout'
    ));
    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      answer: {
        text: 'I built an ab workout.',
        workoutTemplate: {
          name: 'Ab Workout',
          focus: 'Abs',
          exercises: [
            {
              exerciseId: 'exercise-1',
              exerciseName: 'Cable Crunch',
              sets: 3,
              reps: '10-15',
            },
          ],
        },
      },
    });
    const conversationPreferences = {
      ...preferences,
      experienceMode: 'conversation' as const,
    };
    const { hook, socket } = await startConnectedSession({ preferences: conversationPreferences });

    act(() => {
      expect(hook.result.current.sendTextPrompt('Make me an ab workout')).toBe(true);
      socket.message(JSON.stringify({
        serverContent: {
          turnComplete: true,
        },
      }));
    });

    await waitFor(() => {
      expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('Make me an ab workout', undefined);
      expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Ab Workout');
    });

    hook.unmount();
  });

  it('starts a session and sends a queued typed prompt from idle conversation mode', async () => {
    const conversationPreferences = {
      ...preferences,
      experienceMode: 'conversation' as const,
    };
    const hook = renderHook(() => useRealtimeCoach({ preferences: conversationPreferences }));

    await act(async () => {
      expect(hook.result.current.sendTextPrompt('Roast my consistency')).toBe(true);
      await Promise.resolve();
    });

    const socket = MockWebSocket.instances[0];
    expect(mockCreateRealtimeCoachSession).toHaveBeenCalledWith(conversationPreferences, 'push_to_talk');
    expect(socket.sentMessages).toHaveLength(0);

    act(() => {
      socket.open();
      socket.message(JSON.stringify({ setupComplete: {} }));
    });

    const typedTurn = JSON.parse(socket.sentMessages[socket.sentMessages.length - 1]);
    expect(typedTurn.clientContent.turnComplete).toBe(true);
    expect(typedTurn.clientContent.turns[0].parts[0].text).toBe('Roast my consistency');

    hook.unmount();
  });

  it('starts continuous recording and detects speech boundaries from PCM in realtime mode', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });
    const setupMessage = JSON.parse(socket.sentMessages[0]);

    expect(setupMessage.setup.realtimeInputConfig.activityHandling).toBe('START_OF_ACTIVITY_INTERRUPTS');
    expect(setupMessage.setup.realtimeInputConfig.automaticActivityDetection.disabled).toBe(true);
    expect(mockToggleRecording).toHaveBeenCalledWith(true);

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });
    expect(countRealtimeInputMessages(socket)).toBe(1);
    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(socket.sentMessages.findIndex((message) => message.includes('"activityStart"')))
      .toBeLessThan(socket.sentMessages.findIndex((message) => message.includes('"audio"')));

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      jest.advanceTimersByTime(550);
    });
    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(1);

    hook.unmount();
  });

  it('builds a workout at the conversation speech boundary without waiting for a tool call', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /make me a workout/i.test(text ?? ''));
    const conversationPreferences = {
      ...preferences,
      experienceMode: 'conversation' as const,
    };
    const { hook, socket } = await startConnectedSession({
      interactionMode: 'realtime',
      preferences: conversationPreferences,
    });

    await act(async () => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a workout' },
        },
      }));
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      jest.advanceTimersByTime(550 + 180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledTimes(1);
    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me a workout', undefined);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Chest Workout');

    await act(async () => {
      socket.message(JSON.stringify({
        serverContent: {
          outputTranscription: { text: 'I am starting that workout now.' },
          turnComplete: true,
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledTimes(1);
    hook.unmount();
  });

  it('does not transmit realtime ambient silence until a speech turn starts', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(0);
    expect(countRealtimeInputMessages(socket)).toBe(0);

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(countRealtimeInputMessages(socket)).toBe(4);

    hook.unmount();
  });

  it('does not treat coach playback captured by the microphone as realtime user speech', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      socket.message(audioMessage());
      jest.advanceTimersByTime(24);
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(0);
    expect(countRealtimeInputMessages(socket)).toBe(0);

    act(() => {
      jest.advanceTimersByTime(700);
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(countRealtimeInputMessages(socket)).toBe(1);
    hook.unmount();
  });

  it('accepts realtime speech promptly after multi-chunk coach playback finishes', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      socket.message(audioMessage());
      jest.advanceTimersByTime(24);
      socket.message(audioMessage());
      jest.advanceTimersByTime(24);
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(0);

    act(() => {
      jest.advanceTimersByTime(450);
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(countRealtimeInputMessages(socket)).toBe(1);
    hook.unmount();
  });

  it('starts a realtime turn for quieter speech PCM', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(250) });
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(countRealtimeInputMessages(socket)).toBe(1);
    hook.unmount();
  });

  it('does not end a realtime speech turn during quiet voiced audio', async () => {
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      jest.advanceTimersByTime(300);
      audioListeners.onMicrophoneData?.({ data: pcmChunk(350) });
      jest.advanceTimersByTime(300);
    });

    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(0);

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(0) });
      jest.advanceTimersByTime(550);
    });

    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(1);
    hook.unmount();
  });

  it('retries realtime microphone input when continuous recording emits no chunks', async () => {
    const { hook } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockBypassVoiceProcessing).toHaveBeenCalledWith(true);
    expect(hook.result.current.debugStatus.micWatchdogTriggered).toBe(true);
    expect(hook.result.current.error).toContain('Microphone stream is not emitting audio');

    hook.unmount();
  });

  it('shows a friendly message for low-level socket errors', async () => {
    const { hook, socket } = await startConnectedSession();

    act(() => {
      socket.onerror?.({
        _defaultPrevented: false,
        _timeStamp: 89366044.300541,
        type: 'error',
      });
    });

    expect(hook.result.current.phase).toBe('error');
    expect(hook.result.current.error).toBe(
      'Voice Coach had trouble connecting. Check your connection and try again.'
    );

    hook.unmount();
  });

  it('does not show the watchdog error once microphone chunks are emitted', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
    });

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

  it('sends activity markers around a push-to-talk turn', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
    });

    expect(countRealtimeActivityMessages(socket, 'activityStart')).toBe(1);
    expect(hook.result.current.debugStatus.pushToTalkActive).toBe(true);
    expect(mockToggleRecording).toHaveBeenLastCalledWith(true);

    act(() => {
      hook.result.current.endUserTurn();
    });

    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(0);
    expect(hook.result.current.debugStatus.pushToTalkActive).toBe(true);
    expect(mockToggleRecording).toHaveBeenLastCalledWith(true);

    act(() => {
      jest.advanceTimersByTime(180);
    });

    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(1);
    expect(hook.result.current.debugStatus.pushToTalkActive).toBe(false);
    expect(mockToggleRecording).toHaveBeenLastCalledWith(false);

    hook.unmount();
  });

  it('keeps sending trailing microphone chunks briefly after release before ending the turn', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
    });

    act(() => {
      hook.result.current.endUserTurn();
      audioListeners.onMicrophoneData?.({ data: new Uint8Array([1, 0, 2, 0]) });
    });

    expect(countRealtimeInputMessages(socket)).toBe(1);
    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(0);

    act(() => {
      jest.advanceTimersByTime(180);
    });

    expect(countRealtimeActivityMessages(socket, 'activityEnd')).toBe(1);
    expect(hook.result.current.debugStatus.userTurnMicrophoneChunksReceived).toBe(1);

    hook.unmount();
  });

  it('does not send microphone chunks outside a push-to-talk turn', async () => {
    const { hook, socket } = await startConnectedSession();

    act(() => {
      audioListeners.onMicrophoneData?.({ data: new Uint8Array([1, 0, 2, 0]) });
    });

    expect(countRealtimeInputMessages(socket)).toBe(0);

    hook.unmount();
  });

  it('lets an explicit push-to-talk hold send microphone chunks even after coach playback', async () => {
    const { hook, socket } = await startConnectedSession();

    act(() => {
      socket.message(audioMessage());
      jest.advanceTimersByTime(24);
    });

    await act(async () => {
      await hook.result.current.beginUserTurn();
    });

    act(() => {
      audioListeners.onMicrophoneData?.({ data: new Uint8Array([1, 0, 2, 0]) });
    });

    expect(countRealtimeInputMessages(socket)).toBe(1);
    expect(hook.result.current.debugStatus.userTurnMicrophoneChunksReceived).toBe(1);

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

  it('accumulates transcript chunks into the visible overlay', async () => {
    const { hook, socket } = await startConnectedSession();

    act(() => {
      socket.message(JSON.stringify({
        serverContent: {
          outputTranscription: { text: 'I built' },
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          outputTranscription: { text: 'your workout.' },
        },
      }));
    });

    expect(hook.result.current.transcriptOverlay).toEqual({
      speaker: 'coach',
      text: 'I built your workout.',
    });

    hook.unmount();
  });

  it('keeps user transcript hidden while still accumulating it for turn side effects', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a' },
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'chest workout' },
        },
      }));
      await Promise.resolve();
    });

    expect(hook.result.current.transcriptOverlay).toBeNull();

    hook.unmount();
  });

  it('does not generate workout cards from partial user transcript chunks', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /chest workout/i.test(text ?? ''));
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a' },
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'chest workout' },
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).not.toHaveBeenCalled();
    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(0);

    hook.unmount();
  });

  it('generates a workout card from a completed user transcript turn', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /chest workout/i.test(text ?? ''));
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a' },
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'chest workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me a chest workout', undefined);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Chest Workout');

    hook.unmount();
  });

  it('finalizes realtime transcript side effects when Gemini completes the turn', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /chest workout/i.test(text ?? ''));
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    await act(async () => {
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a chest workout' },
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          turnComplete: true,
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me a chest workout', undefined);
    hook.unmount();
  });

  it('does not finalize a partial realtime transcript when coach playback is interrupted', async () => {
    mockShouldGenerateWorkoutFromVoice.mockReturnValue(true);
    const { hook, socket } = await startConnectedSession({ interactionMode: 'realtime' });

    act(() => {
      audioListeners.onMicrophoneData?.({ data: pcmChunk(3000) });
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a' },
          interrupted: true,
        },
      }));
    });

    expect(mockGenerateVoiceWorkoutTemplate).not.toHaveBeenCalled();
    expect(hook.result.current.phase).toBe('user_speaking');
    hook.unmount();
  });

  it('starts voice workout generation from a Gemini Live tool call', async () => {
    let resolveWorkout: (value: unknown) => void = () => {};
    mockGenerateVoiceWorkoutTemplate.mockReturnValue(new Promise((resolve) => {
      resolveWorkout = resolve;
    }));
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_update_workout',
              args: {
                prompt: 'make me a chest workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me a chest workout', undefined);
    expect(hook.result.current.isGeneratingVoiceWorkout).toBe(true);
    expect(socket.sentMessages.some((message) => (
      message.includes('"toolResponse"')
      && message.includes('"id":"call-1"')
      && message.includes('"status":"workout_building_started"')
    ))).toBe(true);
    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(0);

    await act(async () => {
      resolveWorkout({
        type: 'answer',
        answer: {
          text: 'I built a chest workout.',
          workoutTemplate: {
            name: 'Chest Workout',
            focus: 'Chest',
            exercises: [
              {
                exerciseId: 'exercise-1',
                exerciseName: 'Bench Press',
                sets: 4,
                reps: '6-10',
              },
            ],
          },
        },
      });
      await Promise.resolve();
    });

    expect(hook.result.current.isGeneratingVoiceWorkout).toBe(false);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Chest Workout');

    hook.unmount();
  });

  it('carries a proposed workout into an affirmative follow-up', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      socket.message(JSON.stringify({
        serverContent: {
          outputTranscription: { text: 'Would you like me to build you a push workout?' },
          turnComplete: true,
        },
      }));
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'yes' },
        },
      }));
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [{
            id: 'call-affirmative',
            name: 'create_or_update_workout',
            args: { prompt: 'yes' },
          }],
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith(
      'Build the workout you just proposed: Would you like me to build you a push workout?',
      undefined
    );
    hook.unmount();
  });

  it('dedupes repeated workout tool calls for the same turn', async () => {
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_update_workout',
              args: {
                prompt: 'make me a chest workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    await act(async () => {
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-2',
              name: 'create_or_update_workout',
              args: {
                prompt: 'make me a chest workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledTimes(1);
    expect(socket.sentMessages.some((message) => (
      message.includes('"toolResponse"')
      && message.includes('"id":"call-2"')
      && message.includes('"status":"workout_building_already_started"')
    ))).toBe(true);

    hook.unmount();
  });

  it('allows the same workout prompt to be retried after the dedupe window if generation returns no card', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /back workout/i.test(text ?? ''));
    mockGenerateVoiceWorkoutTemplate
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'Coming up.',
        },
      })
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'I built a back workout.',
          workoutTemplate: {
            name: 'Back Workout',
            focus: 'Back',
            exercises: [
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Lat Pulldown',
                sets: 4,
                reps: '8-12',
              },
            ],
          },
        },
      });
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a back workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(0);

    await act(async () => {
      jest.advanceTimersByTime(45_001);
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a back workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledTimes(2);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Back Workout');

    hook.unmount();
  });

  it('renames stale realtime workout titles to match a new body-part request', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /back workout/i.test(text ?? ''));
    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      answer: {
        text: 'Back built.',
        workoutTemplate: {
          name: 'Chest Strength Workout (1)',
          focus: 'Chest',
          exercises: [
            {
              exerciseId: 'exercise-2',
              exerciseName: 'Lat Pulldown',
              sets: 4,
              reps: '8-12',
            },
          ],
        },
      },
    });
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a back workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me a back workout', undefined);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Back Strength Workout');
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.focus).toBe('Back');

    hook.unmount();
  });

  it('does not commit a workout card when voice workout generation returns no template', async () => {
    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      requestId: 'ai-request-id',
      answer: {
        text: 'I can make that.',
        citations: [],
      },
    });
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_update_workout',
              args: {
                prompt: 'make me an ab workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('make me an ab workout', undefined);
      expect(hook.result.current.voiceWorkoutMessages).toEqual([]);
    });
    expect(hook.result.current.isGeneratingVoiceWorkout).toBe(false);
    expect(hook.result.current.voiceWorkoutGenerationError).toBe(
      "We couldn't finish that workout. Check your connection and try again."
    );

    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      answer: {
        text: 'Here is your workout.',
        workoutTemplate: {
          name: 'Ab Workout',
          focus: 'Core',
          exercises: [{
            exerciseId: 'exercise-1',
            exerciseName: 'Crunch',
            sets: 3,
            reps: '12-15',
          }],
        },
      },
    });

    await act(async () => {
      expect(hook.result.current.retryVoiceWorkoutGeneration()).toBe(true);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledTimes(2);
      expect(hook.result.current.voiceWorkoutGenerationError).toBeNull();
      expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Ab Workout');
    });

    hook.unmount();
  });

  it('sends follow-up voice workout edits with the current draft context', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Chest Workout',
      focus: 'Chest',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: '6-10',
        },
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Cable Fly',
          sets: 3,
          reps: '10-15',
        },
        {
          exerciseId: 'exercise-3',
          exerciseName: 'Incline Press',
          sets: 3,
          reps: '8-12',
        },
      ],
    };
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /add dips/i.test(text ?? '')
    ));
    mockShouldEditWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /add dips/i.test(text ?? '')
    ));
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'add dips' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('add dips', {
      currentWorkoutTemplateDraft: draft,
    });

    hook.unmount();
  });

  it('sends follow-up voice workout regenerations with avoid draft context', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Chest Workout',
      focus: 'Chest',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: '6-10',
        },
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Cable Fly',
          sets: 3,
          reps: '10-15',
        },
      ],
    };
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /redo it/i.test(text ?? '')
    ));
    mockShouldRegenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /redo it/i.test(text ?? '')
    ));
    mockShouldEditWorkoutFromVoice.mockReturnValue(false);
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'redo it' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('redo it', {
      avoidWorkoutTemplateDraft: draft,
    });

    hook.unmount();
  });

  it('uses voice clarification taps to update the current generated workout draft', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Core Workout',
      focus: 'Core',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Cable Crunch',
          sets: 3,
          reps: '10-15',
        },
      ],
    };
    const clarifiedTemplate: AIWorkoutTemplate = {
      ...draft,
      exercises: [
        ...draft.exercises,
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Forearm Plank',
          sets: 3,
          reps: '30-45 sec',
        },
      ],
    };
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /plank/i.test(text ?? '')
    ));
    mockShouldEditWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /plank/i.test(text ?? '')
    ));
    mockGenerateVoiceWorkoutTemplate
      .mockResolvedValueOnce({
        type: 'clarification',
        requestId: 'request-1',
        clarification: {
          question: 'Which plank should I add?',
          workoutTemplate: draft,
          options: [
            {
              label: 'Add Forearm Plank',
              exerciseId: 'exercise-2',
              prompt: 'Add Forearm Plank',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        type: 'answer',
        requestId: 'request-2',
        answer: {
          text: 'Added Forearm Plank.',
          workoutTemplate: clarifiedTemplate,
        },
      });
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'add plank' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('add plank', {
        currentWorkoutTemplateDraft: draft,
      });
      expect(hook.result.current.voiceWorkoutMessages[0]?.clarification?.question).toBe('Which plank should I add?');
    });

    const clarificationMessage = hook.result.current.voiceWorkoutMessages[0];
    expect(clarificationMessage).toBeDefined();
    expect(clarificationMessage!.workoutTemplate).toEqual(draft);
    const selectedOption = clarificationMessage!.clarification!.options?.[0];
    expect(selectedOption).toBeDefined();

    act(() => {
      expect(hook.result.current.selectVoiceWorkoutClarification(
        clarificationMessage!.id,
        selectedOption!
      )).toBe(true);
    });

    await waitFor(() => {
      expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenLastCalledWith('Add Forearm Plank', {
        currentWorkoutTemplateDraft: draft,
      });
      expect(hook.result.current.voiceWorkoutMessages.at(-1)?.workoutTemplate.exercises).toEqual([
        expect.objectContaining({ exerciseName: 'Cable Crunch' }),
        expect.objectContaining({ exerciseName: 'Forearm Plank' }),
      ]);
    });
    expect(hook.result.current.voiceWorkoutMessages[0]?.clarification).toBeUndefined();

    hook.unmount();
  });

  it('keeps previous voice workout cards and numbers edited copies', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      /chest workout/i.test(text ?? '') || (Boolean(hasDraft) && /remove incline press|add dips/i.test(text ?? ''))
    ));
    mockGenerateVoiceWorkoutTemplate
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'I built a chest workout.',
          workoutTemplate: {
            name: 'Chest Workout',
            focus: 'Chest',
            exercises: [
              {
                exerciseId: 'exercise-1',
                exerciseName: 'Bench Press',
                sets: 4,
                reps: '6-10',
              },
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Cable Fly',
                sets: 3,
                reps: '10-15',
              },
              {
                exerciseId: 'exercise-3',
                exerciseName: 'Incline Press',
                sets: 3,
                reps: '8-12',
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'Updated.',
          workoutTemplate: {
            name: 'Chest Workout',
            focus: 'Chest',
            exercises: [
              {
                exerciseId: 'exercise-1',
                exerciseName: 'Bench Press',
                sets: 4,
                reps: '6-10',
              },
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Cable Fly',
                sets: 3,
                reps: '10-15',
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'Updated again.',
          workoutTemplate: {
            name: 'Chest Workout (1)',
            focus: 'Chest',
            exercises: [
              {
                exerciseId: 'exercise-1',
                exerciseName: 'Bench Press',
                sets: 4,
                reps: '6-10',
              },
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Cable Fly',
                sets: 3,
                reps: '10-15',
              },
              {
                exerciseId: 'exercise-4',
                exerciseName: 'Dips',
                sets: 3,
                reps: '8-12',
              },
            ],
          },
        },
      });
    mockShouldEditWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /remove incline press|add dips/i.test(text ?? '')
    ));
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a chest workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(1);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.exercises).toHaveLength(3);

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'remove incline press' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenLastCalledWith('remove incline press', {
      currentWorkoutTemplateDraft: expect.objectContaining({
        name: 'Chest Workout',
      }),
    });
    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(2);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Chest Workout');
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.exercises).toHaveLength(3);
    expect(hook.result.current.voiceWorkoutMessages[1]?.workoutTemplate.name).toBe('Chest Workout (1)');
    expect(hook.result.current.voiceWorkoutMessages[1]?.workoutTemplate.exercises).toEqual([
      expect.objectContaining({ exerciseName: 'Bench Press' }),
      expect.objectContaining({ exerciseName: 'Cable Fly' }),
    ]);

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'add dips' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenLastCalledWith('add dips', {
      currentWorkoutTemplateDraft: expect.objectContaining({
        name: 'Chest Workout (1)',
      }),
    });
    expect(hook.result.current.voiceWorkoutMessages.map((message) => message.workoutTemplate.name)).toEqual([
      'Chest Workout',
      'Chest Workout (1)',
      'Chest Workout (2)',
    ]);
    expect(hook.result.current.voiceWorkoutMessages[2]?.workoutTemplate.exercises).toEqual([
      expect.objectContaining({ exerciseName: 'Bench Press' }),
      expect.objectContaining({ exerciseName: 'Cable Fly' }),
      expect.objectContaining({ exerciseName: 'Dips' }),
    ]);

    hook.unmount();
  });

  it('does not append a numbered copy when an edit leaves the workout unchanged', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Chest Workout',
      focus: 'Chest',
      exercises: [
        { exerciseId: 'exercise-1', exerciseName: 'Bench Press', sets: 4, reps: '6-10' },
        { exerciseId: 'exercise-2', exerciseName: 'Cable Fly', sets: 3, reps: '10-15' },
        { exerciseId: 'exercise-3', exerciseName: 'Incline Press', sets: 3, reps: '8-12' },
      ],
    };
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /remove dips/i.test(text ?? '')
    ));
    mockShouldEditWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /remove dips/i.test(text ?? '')
    ));
    mockGenerateVoiceWorkoutTemplate.mockResolvedValue({
      type: 'answer',
      answer: {
        text: 'I could not find dips, so I left the workout unchanged.',
        workoutTemplate: draft,
      },
    });
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'remove dips' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(0);

    hook.unmount();
  });

  it('keeps previous voice workout cards when generating another workout', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /workout/i.test(text ?? ''));
    mockGenerateVoiceWorkoutTemplate
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'Chest built.',
          workoutTemplate: {
            name: 'Chest Workout',
            focus: 'Chest',
            exercises: [
              { exerciseId: 'exercise-1', exerciseName: 'Bench Press', sets: 4, reps: '6-10' },
              { exerciseId: 'exercise-2', exerciseName: 'Cable Fly', sets: 3, reps: '10-15' },
              { exerciseId: 'exercise-3', exerciseName: 'Incline Press', sets: 3, reps: '8-12' },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        type: 'answer',
        answer: {
          text: 'Back built.',
          workoutTemplate: {
            name: 'Back Workout',
            focus: 'Back',
            exercises: [
              { exerciseId: 'exercise-4', exerciseName: 'Lat Pulldown', sets: 4, reps: '8-12' },
              { exerciseId: 'exercise-5', exerciseName: 'Cable Row', sets: 3, reps: '8-12' },
              { exerciseId: 'exercise-6', exerciseName: 'Rear Delt Fly', sets: 3, reps: '12-15' },
            ],
          },
        },
      });
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({ serverContent: { inputTranscription: { text: 'make me a chest workout' } } }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({ serverContent: { inputTranscription: { text: 'make me a back workout' } } }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenLastCalledWith('make me a back workout', undefined);
    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(2);
    expect(hook.result.current.voiceWorkoutMessages.map((message) => message.workoutTemplate.name)).toEqual([
      'Chest Workout',
      'Back Workout',
    ]);

    hook.unmount();
  });

  it('uses the actual user transcript for vague realtime edit tool calls', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Chest Workout',
      focus: 'Chest',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: '6-10',
        },
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Cable Fly',
          sets: 3,
          reps: '10-15',
        },
        {
          exerciseId: 'exercise-3',
          exerciseName: 'Incline Press',
          sets: 3,
          reps: '8-12',
        },
      ],
    };
    mockShouldEditWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /remove incline press/i.test(text ?? '')
    ));
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'remove incline press' },
        },
      }));
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_update_workout',
              args: {
                prompt: 'update the current workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('remove incline press', {
      currentWorkoutTemplateDraft: draft,
    });

    hook.unmount();
  });

  it('uses the actual user transcript for vague realtime regeneration tool calls', async () => {
    const draft: AIWorkoutTemplate = {
      name: 'Chest Workout',
      focus: 'Chest',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: '6-10',
        },
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Cable Fly',
          sets: 3,
          reps: '10-15',
        },
      ],
    };
    mockShouldRegenerateWorkoutFromVoice.mockImplementation((text?: string, hasDraft?: boolean) => (
      Boolean(hasDraft) && /redo it/i.test(text ?? '')
    ));
    const { hook, socket } = await startConnectedSession({ currentWorkoutTemplateDraft: draft });

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'redo it' },
        },
      }));
      socket.message(JSON.stringify({
        toolCall: {
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_update_workout',
              args: {
                prompt: 'create another workout',
              },
            },
          ],
        },
      }));
      await Promise.resolve();
    });

    expect(mockGenerateVoiceWorkoutTemplate).toHaveBeenCalledWith('redo it', {
      avoidWorkoutTemplateDraft: draft,
    });

    hook.unmount();
  });

  it('shows voice workout generation as pending until the workout card is ready', async () => {
    mockShouldGenerateWorkoutFromVoice.mockImplementation((text?: string) => /back workout/i.test(text ?? ''));
    let resolveWorkout: (value: unknown) => void = () => {};
    mockGenerateVoiceWorkoutTemplate.mockReturnValue(new Promise((resolve) => {
      resolveWorkout = resolve;
    }));
    const { hook, socket } = await startConnectedSession();

    await act(async () => {
      await hook.result.current.beginUserTurn();
      socket.message(JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'make me a back workout' },
        },
      }));
      hook.result.current.endUserTurn();
      jest.advanceTimersByTime(180);
      await Promise.resolve();
    });

    expect(hook.result.current.isGeneratingVoiceWorkout).toBe(true);
    expect(hook.result.current.voiceWorkoutMessages).toHaveLength(0);

    await act(async () => {
      resolveWorkout({
        type: 'answer',
        answer: {
          text: 'I built a back workout.',
          workoutTemplate: {
            name: 'Back Workout',
            focus: 'Back',
            exercises: [
              {
                exerciseId: 'exercise-2',
                exerciseName: 'Lat Pulldown',
                sets: 4,
                reps: '8-12',
              },
            ],
          },
        },
      });
      await Promise.resolve();
    });

    expect(hook.result.current.isGeneratingVoiceWorkout).toBe(false);
    expect(hook.result.current.voiceWorkoutMessages[0]?.workoutTemplate.name).toBe('Back Workout');

    hook.unmount();
  });
});
