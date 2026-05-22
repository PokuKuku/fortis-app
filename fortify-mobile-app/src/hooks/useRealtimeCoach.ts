import { useCallback, useEffect, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import { AppState } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Crypto from 'expo-crypto';
import { createRealtimeCoachSession, generateVoiceWorkoutTemplate } from '@/src/services/realtimeCoachService';
import type { AIRequestContext } from '@/src/types/ai';
import type {
  RealtimeCoachDebugStatus,
  RealtimeCoachPhase,
  RealtimeCoachPreferences,
  RealtimeCoachUsage,
  RealtimeTranscriptOverlay,
  VoiceWorkoutMessage,
} from '@/src/types/realtimeCoach';
import {
  base64ToUint8Array,
  downsamplePcm16Mono,
  GEMINI_INPUT_AUDIO_MIME_TYPE,
  parseGeminiLiveMessage,
  uint8ArrayToBase64,
} from '@/src/utils/geminiLive';
import { shouldGenerateWorkoutFromVoice } from '@/src/utils/realtimeCoach';

interface UseRealtimeCoachOptions {
  preferences: RealtimeCoachPreferences;
  currentWorkoutTemplateDraft?: AIRequestContext['currentWorkoutTemplateDraft'];
}

type TwoWayAudioModule = {
  initialize: () => Promise<unknown>;
  getMicrophonePermissionsAsync?: () => Promise<{ status?: string; granted?: boolean }>;
  requestMicrophonePermissionsAsync?: () => Promise<{ status?: string; granted?: boolean }>;
  bypassVoiceProcessing?: (value: boolean) => unknown;
  playPCMData: (audioData: Uint8Array) => unknown;
  toggleRecording: (value: boolean) => boolean;
  tearDown: () => unknown;
  addExpoTwoWayAudioEventListener: (
    eventName: 'onMicrophoneData' | 'onInputVolumeLevelData' | 'onOutputVolumeLevelData' | 'onRecordingChange' | 'onAudioInterruption',
    handler: (event: { data: Uint8Array } | { data: number } | { data: boolean } | { data: string }) => void
  ) => { remove?: () => void } | (() => void) | null | undefined;
};

const TRANSCRIPT_IDLE_HIDE_MS = 1600;
const MIC_STREAM_WATCHDOG_MS = 2000;
const MISSING_NATIVE_AUDIO_MESSAGE =
  'Voice Coach needs an app update before live audio can start.';
const GENERIC_VOICE_COACH_ERROR = 'Voice Coach could not start. Try again in a moment.';
const MICROPHONE_STREAM_ERROR =
  'Microphone stream is not emitting audio. On iOS Simulator, check host microphone input or test on a physical iPhone.';

const VOICE_COACH_ACTIVE_AUDIO_MODE = {
  allowsRecordingIOS: true,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

const VOICE_COACH_IDLE_AUDIO_MODE = {
  allowsRecordingIOS: false,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
  playsInSilentModeIOS: false,
  staysActiveInBackground: false,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

const GEMINI_VOICE_BY_COACH_VOICE: Record<RealtimeCoachPreferences['voice'], string> = {
  marin: 'Kore',
  cedar: 'Puck',
  coral: 'Aoede',
  verse: 'Charon',
  sage: 'Fenrir',
};

const isSocketOpen = (socket: WebSocket | null): socket is WebSocket =>
  Boolean(socket && socket.readyState === WebSocket.OPEN);

const normalizeGeminiModelName = (model: string) =>
  model.startsWith('models/') ? model : `models/${model}`;

const buildInstructions = (preferences: RealtimeCoachPreferences): string => {
  const intensityLabel = preferences.intensity < 0.34
    ? 'calm'
    : preferences.intensity < 0.67
      ? 'sharp'
      : 'hard-edged';
  const persona =
    preferences.personality === 'drill_sergeant'
      ? 'You are a blunt strength coach. Be demanding and confront weak training decisions, but only critique behavior, effort, and logged training choices. No body shaming, identity attacks, slurs, sexual content, protected-trait references, or medical claims.'
      : preferences.personality === 'hype'
        ? 'You are a high-energy strength coach. Celebrate wins, keep momentum high, and make the user feel ready to train.'
        : 'You are a direct strength coach. Be specific, useful, concise, and a little challenging.';

  return `${persona}

Voice Coach rules:
- Speak naturally in short turns. Keep most answers under 20 seconds.
- Ask at most one question at a time.
- If the user asks for a workout, briefly say you can build one, then ask for missing constraints only if necessary.
- Do not claim form detection, rep counting, or medical diagnosis.
- Style intensity: ${intensityLabel}.
- You are inside Fortify, a workout tracker and AI personal trainer.`;
};

const buildGeminiSetupMessage = (
  model: string,
  preferences: RealtimeCoachPreferences
) => ({
  setup: {
    model: normalizeGeminiModelName(model),
    generationConfig: {
      responseModalities: ['AUDIO'],
      temperature: 0.7,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: GEMINI_VOICE_BY_COACH_VOICE[preferences.voice],
          },
        },
      },
    },
    systemInstruction: {
      parts: [{ text: buildInstructions(preferences) }],
    },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    realtimeInputConfig: {
      automaticActivityDetection: {
        disabled: false,
        prefixPaddingMs: 300,
        silenceDurationMs: 650,
      },
      activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
    },
  },
});

const getTwoWayAudioModule = (): TwoWayAudioModule | null => {
  let audioPackage: {
    initialize?: unknown;
    getMicrophonePermissionsAsync?: unknown;
    requestMicrophonePermissionsAsync?: unknown;
    bypassVoiceProcessing?: unknown;
    playPCMData?: unknown;
    toggleRecording?: unknown;
    tearDown?: unknown;
    addExpoTwoWayAudioEventListener?: unknown;
  } | null;

  try {
    audioPackage = require('@speechmatics/expo-two-way-audio');
  } catch {
    return null;
  }

  if (
    typeof audioPackage?.initialize !== 'function'
    || typeof audioPackage.playPCMData !== 'function'
    || typeof audioPackage.toggleRecording !== 'function'
    || typeof audioPackage.tearDown !== 'function'
    || typeof audioPackage.addExpoTwoWayAudioEventListener !== 'function'
  ) {
    return null;
  }

  return {
    initialize: audioPackage.initialize as TwoWayAudioModule['initialize'],
    getMicrophonePermissionsAsync: audioPackage.getMicrophonePermissionsAsync as TwoWayAudioModule['getMicrophonePermissionsAsync'],
    requestMicrophonePermissionsAsync: audioPackage.requestMicrophonePermissionsAsync as TwoWayAudioModule['requestMicrophonePermissionsAsync'],
    bypassVoiceProcessing: audioPackage.bypassVoiceProcessing as TwoWayAudioModule['bypassVoiceProcessing'],
    playPCMData: audioPackage.playPCMData as TwoWayAudioModule['playPCMData'],
    toggleRecording: audioPackage.toggleRecording as TwoWayAudioModule['toggleRecording'],
    tearDown: audioPackage.tearDown as TwoWayAudioModule['tearDown'],
    addExpoTwoWayAudioEventListener: audioPackage.addExpoTwoWayAudioEventListener as TwoWayAudioModule['addExpoTwoWayAudioEventListener'],
  };
};

const normalizeMicrophoneChunk = (data: unknown): Uint8Array | null => {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return new Uint8Array(data);

  if (data && typeof data === 'object') {
    const candidate = data as { buffer?: unknown; byteOffset?: unknown; byteLength?: unknown; length?: unknown };
    if (candidate.buffer instanceof ArrayBuffer) {
      return new Uint8Array(
        candidate.buffer,
        typeof candidate.byteOffset === 'number' ? candidate.byteOffset : 0,
        typeof candidate.byteLength === 'number' ? candidate.byteLength : undefined
      );
    }

    if (typeof candidate.length === 'number') {
      const values = Array.from({ length: candidate.length }, (_, index) => (
        Number((data as Record<number, unknown>)[index]) || 0
      ));
      return new Uint8Array(values);
    }
  }

  return null;
};

const getServerMessageDebugType = (raw: string): string => {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.keys(parsed).slice(0, 2).join(',') || 'json';
  } catch {
    return 'unparseable';
  }
};

const normalizeServerMessage = (data: unknown): string | null => {
  if (typeof data === 'string') return data;
  if (data instanceof Uint8Array) return Buffer.from(data).toString('utf8');
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  return null;
};

const setVoiceCoachAudioMode = async (isActive: boolean) => {
  await Audio.setAudioModeAsync(isActive ? VOICE_COACH_ACTIVE_AUDIO_MODE : VOICE_COACH_IDLE_AUDIO_MODE);
};

export function useRealtimeCoach({
  preferences,
  currentWorkoutTemplateDraft,
}: UseRealtimeCoachOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<TwoWayAudioModule | null>(null);
  const microphoneSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const inputVolumeSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const outputVolumeSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const recordingSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const audioInterruptionSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micWatchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWorkoutPromptRef = useRef('');
  const latestUserTranscriptRef = useRef('');
  const microphoneChunksSentRef = useRef(0);
  const isMountedRef = useRef(true);

  const [phase, setPhase] = useState<RealtimeCoachPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcriptOverlay, setTranscriptOverlay] = useState<RealtimeTranscriptOverlay | null>(null);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [coachAudioLevel, setCoachAudioLevel] = useState(0);
  const [debugStatus, setDebugStatus] = useState<RealtimeCoachDebugStatus>({
    socketOpened: false,
    setupComplete: false,
    recordingStarted: false,
    microphoneChunksSent: 0,
    serverMessagesReceived: 0,
  });
  const [usage, setUsage] = useState<RealtimeCoachUsage | null>(null);
  const [voiceWorkoutMessages, setVoiceWorkoutMessages] = useState<VoiceWorkoutMessage[]>([]);

  const clearTranscriptHideTimeout = useCallback(() => {
    if (transcriptHideTimeoutRef.current) {
      clearTimeout(transcriptHideTimeoutRef.current);
      transcriptHideTimeoutRef.current = null;
    }
  }, []);

  const hideTranscriptSoon = useCallback(() => {
    clearTranscriptHideTimeout();
    transcriptHideTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setTranscriptOverlay(null);
      }
    }, TRANSCRIPT_IDLE_HIDE_MS);
  }, [clearTranscriptHideTimeout]);

  const showTranscript = useCallback((overlay: RealtimeTranscriptOverlay) => {
    clearTranscriptHideTimeout();
    setTranscriptOverlay(overlay);
  }, [clearTranscriptHideTimeout]);

  const cleanupMicrophoneSubscription = useCallback(() => {
    const subscription = microphoneSubscriptionRef.current;
    microphoneSubscriptionRef.current = null;
    if (typeof subscription === 'function') {
      subscription();
      return;
    }
    subscription?.remove?.();
  }, []);

  const cleanupVolumeSubscriptions = useCallback(() => {
    const subscriptions = [
      inputVolumeSubscriptionRef.current,
      outputVolumeSubscriptionRef.current,
    ];
    inputVolumeSubscriptionRef.current = null;
    outputVolumeSubscriptionRef.current = null;

    subscriptions.forEach((subscription) => {
      if (typeof subscription === 'function') {
        subscription();
        return;
      }
      subscription?.remove?.();
    });
  }, []);

  const cleanupNativeAudioDiagnosticSubscriptions = useCallback(() => {
    const subscriptions = [
      recordingSubscriptionRef.current,
      audioInterruptionSubscriptionRef.current,
    ];
    recordingSubscriptionRef.current = null;
    audioInterruptionSubscriptionRef.current = null;

    subscriptions.forEach((subscription) => {
      if (typeof subscription === 'function') {
        subscription();
        return;
      }
      subscription?.remove?.();
    });
  }, []);

  const clearMicWatchdog = useCallback(() => {
    if (micWatchdogTimeoutRef.current) {
      clearTimeout(micWatchdogTimeoutRef.current);
      micWatchdogTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    clearMicWatchdog();
    clearTranscriptHideTimeout();
    cleanupMicrophoneSubscription();
    cleanupVolumeSubscriptions();
    cleanupNativeAudioDiagnosticSubscriptions();
    latestUserTranscriptRef.current = '';
    if (isMountedRef.current) {
      setUserAudioLevel(0);
      setCoachAudioLevel(0);
      setDebugStatus((current) => ({
        ...current,
        recordingStarted: false,
      }));
    }

    try {
      audioRef.current?.toggleRecording(false);
    } catch {
      // Native audio may already be torn down.
    }

    try {
      audioRef.current?.tearDown();
    } catch {
      // Native audio may already be torn down.
    }

    audioRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
  }, [
    cleanupMicrophoneSubscription,
    cleanupNativeAudioDiagnosticSubscriptions,
    cleanupVolumeSubscriptions,
    clearMicWatchdog,
    clearTranscriptHideTimeout,
  ]);

  const stop = useCallback(() => {
    cleanup();
    void setVoiceCoachAudioMode(false).catch(() => {
      // Audio mode reset is best-effort when stopping.
    });
    if (isMountedRef.current) {
      setTranscriptOverlay(null);
      setPhase('stopped');
    }
  }, [cleanup]);

  const handleWorkoutPrompt = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed === lastWorkoutPromptRef.current || !shouldGenerateWorkoutFromVoice(trimmed)) {
      return;
    }

    lastWorkoutPromptRef.current = trimmed;
    const response = await generateVoiceWorkoutTemplate(trimmed, currentWorkoutTemplateDraft ? {
      currentWorkoutTemplateDraft,
    } : undefined);

    const template = response.type === 'answer' ? response.answer?.workoutTemplate : undefined;
    if (!template || !Array.isArray(template.exercises) || template.exercises.length === 0) {
      return;
    }

    setVoiceWorkoutMessages((current) => [
      ...current,
      {
        id: Crypto.randomUUID(),
        text: response.answer?.text ?? "Here's the workout.",
        workoutTemplate: template,
        savedWorkoutTemplateId: null,
      },
    ]);
  }, [currentWorkoutTemplateDraft]);

  const playGeminiAudio = useCallback((base64: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const pcm24k = base64ToUint8Array(base64);
    const pcm16k = downsamplePcm16Mono(pcm24k);
    audio.playPCMData(pcm16k);
  }, []);

  const startMicrophoneStreaming = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      throw new Error('This build does not include realtime audio support yet. Rebuild the dev app and try again.');
    }

    cleanupMicrophoneSubscription();
    microphoneSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener('onMicrophoneData', (event) => {
      const socket = socketRef.current;
      const chunk = normalizeMicrophoneChunk(event.data);
      if (!isSocketOpen(socket) || !chunk?.byteLength) return;
      microphoneChunksSentRef.current += 1;
      socket.send(JSON.stringify({
        realtimeInput: {
          audio: {
            mimeType: GEMINI_INPUT_AUDIO_MIME_TYPE,
            data: uint8ArrayToBase64(chunk),
          },
        },
      }));
      setDebugStatus((current) => ({
        ...current,
        microphoneChunksSent: microphoneChunksSentRef.current,
        lastMicrophoneChunkBytes: chunk.byteLength,
        micWatchdogTriggered: false,
        nativeAudioFallback: null,
      }));
      setError((current) => current === MICROPHONE_STREAM_ERROR ? null : current);
    }) ?? null;

    const isRecording = audio.toggleRecording(true);
    setDebugStatus((current) => ({
      ...current,
      recordingStarted: Boolean(isRecording),
    }));
    if (!isRecording) {
      throw new Error('Microphone recording did not start.');
    }

    clearMicWatchdog();
    micWatchdogTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current || microphoneChunksSentRef.current > 0) return;
      try {
        audioRef.current?.bypassVoiceProcessing?.(true);
      } catch {
        // The fallback is best-effort; the watchdog message is the useful signal.
      }
      setDebugStatus((current) => ({
        ...current,
        micWatchdogTriggered: true,
        nativeAudioFallback: 'voice_processing_unavailable',
      }));
      setError(MICROPHONE_STREAM_ERROR);
    }, MIC_STREAM_WATCHDOG_MS);
  }, [cleanupMicrophoneSubscription, clearMicWatchdog]);

  const startVolumeMonitoring = useCallback((audio: TwoWayAudioModule) => {
    cleanupVolumeSubscriptions();
    inputVolumeSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener(
      'onInputVolumeLevelData',
      (event) => {
        if (typeof event.data !== 'number') return;
        setUserAudioLevel(Math.max(0, Math.min(1, event.data)));
      }
    ) ?? null;
    outputVolumeSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener(
      'onOutputVolumeLevelData',
      (event) => {
        if (typeof event.data !== 'number') return;
        setCoachAudioLevel(Math.max(0, Math.min(1, event.data)));
      }
    ) ?? null;
  }, [cleanupVolumeSubscriptions]);

  const startNativeAudioDiagnostics = useCallback((audio: TwoWayAudioModule) => {
    cleanupNativeAudioDiagnosticSubscriptions();
    recordingSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener(
      'onRecordingChange',
      (event) => {
        if (typeof event.data !== 'boolean') return;
        setDebugStatus((current) => ({
          ...current,
          recordingStarted: event.data,
          recordingChange: event.data,
        }));
      }
    ) ?? null;
    audioInterruptionSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener(
      'onAudioInterruption',
      (event) => {
        if (typeof event.data !== 'string') return;
        setDebugStatus((current) => ({
          ...current,
          audioInterruption: event.data,
        }));
      }
    ) ?? null;
  }, [cleanupNativeAudioDiagnosticSubscriptions]);

  const handleGeminiMessage = useCallback((raw: string) => {
    const actions = parseGeminiLiveMessage(raw);

    for (const action of actions) {
      if (action.type === 'setup_complete') {
        setDebugStatus((current) => ({ ...current, setupComplete: true }));
        startMicrophoneStreaming();
        setPhase('listening');
        continue;
      }

      if (action.type === 'phase') {
        setPhase(action.phase);
        continue;
      }

      if (action.type === 'transcript') {
        showTranscript({ speaker: action.speaker, text: action.text });
        if (action.speaker === 'user') {
          latestUserTranscriptRef.current = action.text;
        }
        continue;
      }

      if (action.type === 'audio') {
        playGeminiAudio(action.base64);
        continue;
      }

      if (action.type === 'turn_complete') {
        if (latestUserTranscriptRef.current) {
          void handleWorkoutPrompt(latestUserTranscriptRef.current);
          latestUserTranscriptRef.current = '';
        }
        hideTranscriptSoon();
        continue;
      }

      if (action.type === 'go_away') {
        setPhase('listening');
        continue;
      }

      if (action.type === 'error') {
        setError(action.message || GENERIC_VOICE_COACH_ERROR);
        setPhase('error');
      }
    }
  }, [handleWorkoutPrompt, hideTranscriptSoon, playGeminiAudio, showTranscript, startMicrophoneStreaming]);

  const start = useCallback(async () => {
    if (phase === 'connecting' || phase === 'listening' || phase === 'user_speaking' || phase === 'coach_speaking') {
      return;
    }

    cleanup();
    microphoneChunksSentRef.current = 0;
    setError(null);
    setTranscriptOverlay(null);
    setDebugStatus({
      socketOpened: false,
      setupComplete: false,
      recordingStarted: false,
      microphoneChunksSent: 0,
      serverMessagesReceived: 0,
    });
    setPhase('connecting');

    try {
      const audio = getTwoWayAudioModule();
      if (!audio) {
        setError(MISSING_NATIVE_AUDIO_MESSAGE);
        setPhase('error');
        return;
      }

      await setVoiceCoachAudioMode(true);

      const permission = await audio.getMicrophonePermissionsAsync?.();
      if (permission && permission.status !== 'granted' && permission.granted !== true) {
        const requestedPermission = await audio.requestMicrophonePermissionsAsync?.();
        if (requestedPermission && requestedPermission.status !== 'granted' && requestedPermission.granted !== true) {
          throw new Error(`Microphone permission denied: ${JSON.stringify(requestedPermission)}`);
        }
      }

      const initialized = await audio.initialize();
      if (initialized === false) {
        throw new Error('Two-way audio failed to initialize.');
      }
      audioRef.current = audio;
      audio.bypassVoiceProcessing?.(false);
      startNativeAudioDiagnostics(audio);
      startVolumeMonitoring(audio);

      const sessionResponse = await createRealtimeCoachSession(preferences);
      if (sessionResponse.type === 'error') {
        cleanup();
        void setVoiceCoachAudioMode(false).catch(() => {
          // Audio mode reset is best-effort after session creation failure.
        });
        setError(sessionResponse.error.message);
        setPhase('error');
        return;
      }

      setUsage(sessionResponse.session.usage);

      const socket = new WebSocket(
        `${sessionResponse.session.liveEndpoint}?access_token=${encodeURIComponent(sessionResponse.session.accessToken)}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setDebugStatus((current) => ({ ...current, socketOpened: true }));
        socket.send(JSON.stringify(buildGeminiSetupMessage(sessionResponse.session.model, preferences)));
      };

      socket.onmessage = (event) => {
        const raw = normalizeServerMessage(event.data);

        setDebugStatus((current) => ({
          ...current,
          serverMessagesReceived: current.serverMessagesReceived + 1,
          lastServerMessageType: raw
            ? getServerMessageDebugType(raw)
            : typeof event.data,
        }));
        if (raw) {
          handleGeminiMessage(raw);
        }
      };

      socket.onerror = (event) => {
        setError(`Voice Coach connection failed: ${JSON.stringify(event)}`);
        setPhase('error');
      };

      socket.onclose = (event) => {
        clearMicWatchdog();
        cleanupMicrophoneSubscription();
        cleanupVolumeSubscriptions();
        cleanupNativeAudioDiagnosticSubscriptions();
        try {
          audioRef.current?.toggleRecording(false);
        } catch {
          // Native audio may already be torn down.
        }
        try {
          audioRef.current?.tearDown();
        } catch {
          // Native audio may already be torn down.
        }
        audioRef.current = null;
        void setVoiceCoachAudioMode(false).catch(() => {
          // Audio mode reset is best-effort after socket close.
        });
        setDebugStatus((current) => ({
          ...current,
          recordingStarted: false,
          lastSocketClose: `${event.code}${event.reason ? ` ${event.reason}` : ''}`,
        }));
        if (isMountedRef.current && phase !== 'stopped') {
          setPhase((current) => (
            current === 'connecting' || current === 'listening' || current === 'user_speaking' || current === 'coach_speaking'
              ? 'stopped'
              : current
          ));
        }
      };

      sessionTimeoutRef.current = setTimeout(() => {
        stop();
      }, sessionResponse.session.usage.maxSecondsPerSession * 1000);
    } catch (startError) {
      cleanup();
      void setVoiceCoachAudioMode(false).catch(() => {
        // Audio mode reset is best-effort after startup failure.
      });
      console.warn('[Voice Coach] startup failed', startError);
      setError(startError instanceof Error ? startError.message : GENERIC_VOICE_COACH_ERROR);
      setPhase('error');
    }
  }, [
    cleanup,
    cleanupMicrophoneSubscription,
    cleanupNativeAudioDiagnosticSubscriptions,
    cleanupVolumeSubscriptions,
    clearMicWatchdog,
    handleGeminiMessage,
    phase,
    preferences,
    startNativeAudioDiagnostics,
    startVolumeMonitoring,
    stop,
  ]);

  const markVoiceWorkoutSaved = useCallback((messageId: string, templateId: string) => {
    setVoiceWorkoutMessages((current) => current.map((message) => (
      message.id === messageId
        ? { ...message, savedWorkoutTemplateId: templateId }
        : message
    )));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        stop();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [stop]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
      void setVoiceCoachAudioMode(false).catch(() => {
        // Audio mode reset is best-effort during unmount.
      });
    };
  }, [cleanup]);

  const isActive = phase === 'connecting'
    || phase === 'listening'
    || phase === 'user_speaking'
    || phase === 'coach_speaking';

  return {
    phase,
    error,
    usage,
    transcriptOverlay,
    userAudioLevel,
    coachAudioLevel,
    debugStatus,
    voiceWorkoutMessages,
    isActive,
    start,
    stop,
    setError,
    markVoiceWorkoutSaved,
  };
}
