import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { createRealtimeCoachSession, generateVoiceWorkoutTemplate } from '@/src/services/realtimeCoachService';
import type { AIRequestContext } from '@/src/types/ai';
import type {
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
  playPCMData: (audioData: Uint8Array) => unknown;
  toggleRecording: (value: boolean) => boolean;
  tearDown: () => unknown;
  addExpoTwoWayAudioEventListener: (
    eventName: 'onMicrophoneData',
    handler: (event: { data: Uint8Array }) => void
  ) => { remove?: () => void } | (() => void) | null | undefined;
};

const TRANSCRIPT_IDLE_HIDE_MS = 1600;
const MISSING_NATIVE_AUDIO_MESSAGE =
  'Voice Coach needs an app update before live audio can start.';
const GENERIC_VOICE_COACH_ERROR = 'Voice Coach could not start. Try again in a moment.';

const isSocketOpen = (socket: WebSocket | null): socket is WebSocket =>
  Boolean(socket && socket.readyState === WebSocket.OPEN);

const normalizeGeminiModelName = (model: string) =>
  model.startsWith('models/') ? model : `models/${model}`;

const buildGeminiSetupMessage = (model: string) => ({
  setup: {
    model: normalizeGeminiModelName(model),
    generationConfig: {
      responseModalities: ['AUDIO'],
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
  let nativeModule: {
    initialize?: unknown;
    playPCMData?: unknown;
    toggleRecording?: unknown;
    tearDown?: unknown;
    addListener?: unknown;
  } | null;

  try {
    nativeModule = requireOptionalNativeModule('ExpoTwoWayAudio');
  } catch {
    return null;
  }

  if (
    typeof nativeModule?.initialize !== 'function'
    || typeof nativeModule.playPCMData !== 'function'
    || typeof nativeModule.toggleRecording !== 'function'
    || typeof nativeModule.tearDown !== 'function'
    || typeof nativeModule.addListener !== 'function'
  ) {
    return null;
  }

  return {
    initialize: nativeModule.initialize as TwoWayAudioModule['initialize'],
    playPCMData: nativeModule.playPCMData as TwoWayAudioModule['playPCMData'],
    toggleRecording: nativeModule.toggleRecording as TwoWayAudioModule['toggleRecording'],
    tearDown: nativeModule.tearDown as TwoWayAudioModule['tearDown'],
    addExpoTwoWayAudioEventListener: nativeModule.addListener as TwoWayAudioModule['addExpoTwoWayAudioEventListener'],
  };
};

export function useRealtimeCoach({
  preferences,
  currentWorkoutTemplateDraft,
}: UseRealtimeCoachOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<TwoWayAudioModule | null>(null);
  const microphoneSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWorkoutPromptRef = useRef('');
  const latestUserTranscriptRef = useRef('');
  const isMountedRef = useRef(true);

  const [phase, setPhase] = useState<RealtimeCoachPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcriptOverlay, setTranscriptOverlay] = useState<RealtimeTranscriptOverlay | null>(null);
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

  const cleanup = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    clearTranscriptHideTimeout();
    cleanupMicrophoneSubscription();
    latestUserTranscriptRef.current = '';

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
  }, [cleanupMicrophoneSubscription, clearTranscriptHideTimeout]);

  const stop = useCallback(() => {
    cleanup();
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
      if (!isSocketOpen(socket) || !event.data?.byteLength) return;
      socket.send(JSON.stringify({
        realtimeInput: {
          audio: {
            mimeType: GEMINI_INPUT_AUDIO_MIME_TYPE,
            data: uint8ArrayToBase64(event.data),
          },
        },
      }));
    }) ?? null;

    audio.toggleRecording(true);
  }, [cleanupMicrophoneSubscription]);

  const handleGeminiMessage = useCallback((raw: string) => {
    const actions = parseGeminiLiveMessage(raw);

    for (const action of actions) {
      if (action.type === 'setup_complete') {
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
        setError(action.message ? 'Voice Coach connection failed.' : GENERIC_VOICE_COACH_ERROR);
        setPhase('error');
      }
    }
  }, [handleWorkoutPrompt, hideTranscriptSoon, playGeminiAudio, showTranscript, startMicrophoneStreaming]);

  const start = useCallback(async () => {
    if (phase === 'connecting' || phase === 'listening' || phase === 'user_speaking' || phase === 'coach_speaking') {
      return;
    }

    cleanup();
    setError(null);
    setTranscriptOverlay(null);
    setPhase('connecting');

    try {
      const audio = getTwoWayAudioModule();
      if (!audio) {
        setError(MISSING_NATIVE_AUDIO_MESSAGE);
        setPhase('error');
        return;
      }

      await audio.initialize();
      audioRef.current = audio;

      const sessionResponse = await createRealtimeCoachSession(preferences);
      if (sessionResponse.type === 'error') {
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
        socket.send(JSON.stringify(buildGeminiSetupMessage(sessionResponse.session.model)));
      };

      socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
          handleGeminiMessage(event.data);
        }
      };

      socket.onerror = () => {
        setError('Voice Coach connection failed.');
        setPhase('error');
      };

      socket.onclose = () => {
        cleanupMicrophoneSubscription();
        try {
          audioRef.current?.toggleRecording(false);
        } catch {
          // Native audio may already be torn down.
        }
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
      console.warn('[Voice Coach] startup failed', startError);
      setError(GENERIC_VOICE_COACH_ERROR);
      setPhase('error');
    }
  }, [cleanup, cleanupMicrophoneSubscription, handleGeminiMessage, phase, preferences, stop]);

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
    voiceWorkoutMessages,
    isActive,
    start,
    stop,
    setError,
    markVoiceWorkoutSaved,
  };
}
