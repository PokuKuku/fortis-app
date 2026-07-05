import { useCallback, useEffect, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import { Alert, AppState, Linking } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import {
  createRealtimeCoachSession,
  generateRealtimeCoachScriptAudio,
  generateVoiceWorkoutTemplate,
  reportRealtimeCoachUsage,
} from '@/src/services/realtimeCoachService';
import type { AIClarificationOption, AIImage, AIRequestContext, AIWorkoutTemplate } from '@/src/types/ai';
import type {
  RealtimeCoachDebugStatus,
  RealtimeCoachPhase,
  RealtimeCoachPreferences,
  RealtimeCoachUsage,
  RealtimeTranscriptOverlay,
  RealtimeTranscriptSpeaker,
  VoiceWorkoutMessage,
} from '@/src/types/realtimeCoach';
import {
  base64ToUint8Array,
  downsamplePcm16Mono,
  GEMINI_INPUT_AUDIO_MIME_TYPE,
  parseGeminiLiveMessage,
  uint8ArrayToBase64,
} from '@/src/utils/geminiLive';
import { shouldEditWorkoutFromVoice, shouldGenerateWorkoutFromVoice } from '@/src/utils/realtimeCoach';
import { buildVoiceCoachInstructions } from '@/src/utils/realtimeCoachPrompt';
import { posthog } from '@/src/config/posthog';

interface UseRealtimeCoachOptions {
  preferences: RealtimeCoachPreferences;
  currentWorkoutTemplateDraft?: AIRequestContext['currentWorkoutTemplateDraft'];
  interactionMode?: 'push_to_talk' | 'realtime';
  onVisualContextConsumed?: () => void;
}

type TwoWayAudioModule = {
  initialize: () => Promise<unknown>;
  getMicrophonePermissionsAsync?: () => Promise<{ status?: string; granted?: boolean; canAskAgain?: boolean }>;
  requestMicrophonePermissionsAsync?: () => Promise<{ status?: string; granted?: boolean; canAskAgain?: boolean }>;
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
const USER_TURN_RELEASE_DRAIN_MS = 180;
const USAGE_REPORT_INTERVAL_MS = 30_000;
const PLAYBACK_BUFFER_TARGET_BYTES = 4096;
const PLAYBACK_BUFFER_FLUSH_MS = 24;
const PLAYBACK_MIC_SUPPRESSION_GUARD_MS = 250;
const REALTIME_SPEECH_START_RMS = 0.006;
const REALTIME_SPEECH_END_RMS = 0.003;
const REALTIME_SPEECH_END_DELAY_MS = 550;
const REALTIME_PREROLL_CHUNK_COUNT = 3;
const PCM16_MONO_BYTES_PER_SAMPLE = 2;
const PCM16_MONO_PLAYBACK_RATE = 16000;
const MISSING_NATIVE_AUDIO_MESSAGE =
  'Voice Coach needs an app update before live audio can start.';
const GENERIC_VOICE_COACH_ERROR = 'Voice Coach could not start. Try again in a moment.';
const VOICE_COACH_CONNECTION_ERROR = 'Voice Coach had trouble connecting. Check your connection and try again.';
const MICROPHONE_STREAM_ERROR =
  'Microphone stream is not emitting audio. On iOS Simulator, check host microphone input or test on a physical iPhone.';
const MICROPHONE_PERMISSION_MESSAGE = 'Turn on microphone access to use Voice Coach.';
const EMPTY_CREATOR_SCRIPT_ERROR = 'Type a roast script first.';
const MAX_RECENT_COACH_PHRASES = 6;
const WORKOUT_PROMPT_DEDUPE_MS = 45_000;

const isMicrophonePermissionGranted = (permission?: { status?: string; granted?: boolean } | null) => (
  permission?.granted === true || permission?.status === 'granted'
);

const getEditedWorkoutName = (sourceName: string, existingNames: string[]): string => {
  const rootName = sourceName.trim().replace(/\s+\(\d+\)$/, '') || 'Workout';
  const escapedRootName = rootName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const namePattern = new RegExp(`^${escapedRootName}(?: \\((\\d+)\\))?$`, 'i');
  const highestRevision = existingNames.reduce((highest, name) => {
    const match = name.trim().match(namePattern);
    if (!match) return highest;
    return Math.max(highest, match[1] ? Number.parseInt(match[1], 10) : 0);
  }, 0);

  return `${rootName} (${highestRevision + 1})`;
};

const WORKOUT_FOCUS_NAME_PATTERN = /\b(upper[\s_-]+body|lower[\s_-]+body|full[\s_-]+body|push|pull|chest|back|shoulders?|arms?|core|abs|glutes?|legs?|quads?|hamstrings?|calves|lats)\b/i;

const inferRequestedWorkoutFocus = (prompt: string): string | null => {
  const normalized = prompt.toLowerCase();
  if (/\bupper\s+body\b/.test(normalized)) return 'Upper Body';
  if (/\blower\s+body\b/.test(normalized)) return 'Lower Body';
  if (/\bfull\s+body\b/.test(normalized)) return 'Full Body';
  if (/\bpush\b/.test(normalized)) return 'Push';
  if (/\bpull\b/.test(normalized)) return 'Pull';
  if (/\bchest|pecs?\b/.test(normalized)) return 'Chest';
  if (/\bback|lats?|latissimus|rows?\b/.test(normalized)) return 'Back';
  if (/\bshoulders?|delts?\b/.test(normalized)) return 'Shoulders';
  if (/\barms?|biceps?|triceps?\b/.test(normalized)) return 'Arms';
  if (/\bcore|abs?\b/.test(normalized)) return 'Core';
  if (/\bglutes?\b/.test(normalized)) return 'Glutes';
  if (/\blegs?|quads?|hamstrings?|calves?\b/.test(normalized)) return 'Legs';
  return null;
};

const stripGeneratedWorkoutDuplicateSuffix = (name: string): string => (
  name.replace(/\s+\(\d+\)\s*$/, '').trim()
);

const workoutNameMatchesFocus = (name: string, focus: string): boolean => {
  const focusPattern = new RegExp(`\\b${focus.replace(/\s+/g, '[\\s_-]+')}\\b`, 'i');
  return focusPattern.test(name);
};

const makeWorkoutNameForFocus = (name: string, focus: string): string => {
  const modifier = /\bstrength\b/i.test(name)
    ? 'Strength '
    : /\bhypertrophy\b/i.test(name)
      ? 'Hypertrophy '
      : /\bconditioning\b/i.test(name)
        ? 'Conditioning '
        : '';

  return `${focus} ${modifier}Workout`.replace(/\s+/g, ' ').trim();
};

const normalizeGeneratedWorkoutForPrompt = (
  template: AIWorkoutTemplate,
  prompt: string
): AIWorkoutTemplate => {
  const requestedFocus = inferRequestedWorkoutFocus(prompt);
  const normalizedName = stripGeneratedWorkoutDuplicateSuffix(template.name);

  if (
    !requestedFocus
    || !WORKOUT_FOCUS_NAME_PATTERN.test(normalizedName)
    || workoutNameMatchesFocus(normalizedName, requestedFocus)
  ) {
    return {
      ...template,
      name: normalizedName,
    };
  }

  return {
    ...template,
    name: makeWorkoutNameForFocus(normalizedName, requestedFocus),
    focus: requestedFocus,
  };
};

const workoutsHaveSameExercises = (
  left: AIWorkoutTemplate,
  right: AIWorkoutTemplate
): boolean => (
  left.exercises.length === right.exercises.length
  && left.exercises.every((exercise, index) => {
    const candidate = right.exercises[index];
    return Boolean(candidate)
      && exercise.exerciseId === candidate.exerciseId
      && exercise.exerciseName === candidate.exerciseName
      && exercise.sets === candidate.sets
      && exercise.reps === candidate.reps
      && exercise.restSeconds === candidate.restSeconds;
  })
);

const VOICE_COACH_ACTIVE_AUDIO_MODE = {
  allowsRecordingIOS: true,
  interruptionModeIOS: InterruptionModeIOS.DoNotMix,
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

const CREATOR_SCRIPT_AUDIO_MODE = {
  ...VOICE_COACH_IDLE_AUDIO_MODE,
  playsInSilentModeIOS: true,
} as const;

const GEMINI_VOICE_BY_COACH_VOICE: Record<RealtimeCoachPreferences['voice'], string> = {
  marin: 'Kore',
  cedar: 'Puck',
  coral: 'Aoede',
  verse: 'Charon',
};

const VOICE_WORKOUT_TOOL_NAME = 'create_or_update_workout';

const VOICE_WORKOUT_TOOL_DECLARATION = {
  name: VOICE_WORKOUT_TOOL_NAME,
  description: 'Create or revise the current Fortify workout preview only when the user explicitly asks Fortify to make, create, build, generate, design, plan, write, give them, add, remove, replace, or resize a workout. Follow-up edit requests like "remove incline press" or "swap bench for dumbbells" should revise the current preview. Do not use this for status statements like "I am hitting chest today."',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The user workout request rewritten as a concise English command, preserving body part, equipment, exercise count, and edit details.',
      },
    },
    required: ['prompt'],
  },
};

const isSocketOpen = (socket: WebSocket | null): socket is WebSocket =>
  Boolean(socket && socket.readyState === WebSocket.OPEN);

const normalizeGeminiModelName = (model: string) =>
  model.startsWith('models/') ? model : `models/${model}`;

const createWavBase64FromPcm16 = (pcmBase64: string, sampleRate: number): string => {
  const pcm = Buffer.from(pcmBase64, 'base64');
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * PCM16_MONO_BYTES_PER_SAMPLE;
  const blockAlign = PCM16_MONO_BYTES_PER_SAMPLE;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM16_MONO_BYTES_PER_SAMPLE * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]).toString('base64');
};

export const buildGeminiSetupMessage = (
  model: string,
  preferences: RealtimeCoachPreferences,
  interactionMode: 'push_to_talk' | 'realtime'
) => {
  return {
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
      parts: [{
        text: buildVoiceCoachInstructions(preferences, {
          workoutToolName: VOICE_WORKOUT_TOOL_NAME,
        }),
      }],
    },
    tools: [
      {
        functionDeclarations: [VOICE_WORKOUT_TOOL_DECLARATION],
      },
    ],
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    realtimeInputConfig: {
      automaticActivityDetection: {
        disabled: true,
      },
      activityHandling: interactionMode === 'realtime' ? 'START_OF_ACTIVITY_INTERRUPTS' : 'NO_INTERRUPTION',
    },
    },
  };
};

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

const calculatePcm16Rms = (chunk: Uint8Array): number => {
  const sampleCount = Math.floor(chunk.byteLength / PCM16_MONO_BYTES_PER_SAMPLE);
  if (sampleCount === 0) return 0;

  const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  let sumSquares = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    const normalizedSample = view.getInt16(index * PCM16_MONO_BYTES_PER_SAMPLE, true) / 32768;
    sumSquares += normalizedSample * normalizedSample;
  }
  return Math.sqrt(sumSquares / sampleCount);
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

const normalizeTranscriptChunk = (text: string): string => text.replace(/\s+/g, ' ').trim();

const appendTranscriptChunk = (current: string, nextChunk: string): string => {
  const next = normalizeTranscriptChunk(nextChunk);
  if (!next) return current;

  const existing = normalizeTranscriptChunk(current);
  if (!existing) return next;
  if (next === existing || existing.endsWith(next)) return existing;
  if (next.startsWith(existing)) return next;

  const separator = /^[,.;:!?]/.test(next) || /[-'’/]$/.test(existing) ? '' : ' ';
  return `${existing}${separator}${next}`;
};

const normalizeWorkoutPromptKey = (prompt: string): string => (
  prompt.trim().toLowerCase().replace(/\s+/g, ' ')
);

const setVoiceCoachAudioMode = async (isActive: boolean) => {
  await Audio.setAudioModeAsync(isActive ? VOICE_COACH_ACTIVE_AUDIO_MODE : VOICE_COACH_IDLE_AUDIO_MODE);
};

export function useRealtimeCoach({
  preferences,
  currentWorkoutTemplateDraft,
  interactionMode = 'push_to_talk',
  onVisualContextConsumed,
}: UseRealtimeCoachOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<TwoWayAudioModule | null>(null);
  const creatorScriptSoundRef = useRef<Audio.Sound | null>(null);
  const microphoneSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const inputVolumeSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const outputVolumeSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const recordingSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const audioInterruptionSubscriptionRef = useRef<{ remove?: () => void } | (() => void) | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usageReportIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micWatchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTurnEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackFlushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackMicSuppressionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackChunksRef = useRef<Uint8Array[]>([]);
  const playbackBytesRef = useRef(0);
  const playbackMicSuppressedUntilRef = useRef(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  const usageReportedSecondsRef = useRef(0);
  const setupCompleteRef = useRef(false);
  const isUserTurnActiveRef = useRef(false);
  const pendingUserTurnRef = useRef(false);
  const pendingTextPromptRef = useRef<string | null>(null);
  const visualContextPendingRef = useRef(false);
  const realtimeSpeechActiveRef = useRef(false);
  const realtimeSpeechEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimePrerollChunksRef = useRef<Uint8Array[]>([]);
  const inFlightWorkoutPromptRef = useRef('');
  const recentWorkoutPromptAttemptsRef = useRef<Map<string, number>>(new Map());
  const workoutHandledThisTurnRef = useRef(false);
  const latestVoiceWorkoutTemplateDraftRef = useRef<AIWorkoutTemplate | null>(null);
  const latestUserTranscriptRef = useRef('');
  const recentCoachPhrasesRef = useRef<string[]>([]);
  const userTurnMicrophoneChunksSentRef = useRef(0);
  const userTurnMicrophoneChunksReceivedRef = useRef(0);
  const isMicrophonePermissionAlertVisibleRef = useRef(false);
  const transcriptBuffersRef = useRef<Record<RealtimeTranscriptSpeaker, string>>({
    user: '',
    coach: '',
  });
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
  const [isGeneratingVoiceWorkout, setIsGeneratingVoiceWorkout] = useState(false);
  const [isUserTurnActive, setIsUserTurnActive] = useState(false);
  const [isSpeakingCreatorScript, setIsSpeakingCreatorScript] = useState(false);
  const [creatorScriptError, setCreatorScriptError] = useState<string | null>(null);

  const showMicrophonePermissionAlert = useCallback(() => {
    if (isMicrophonePermissionAlertVisibleRef.current) return;

    isMicrophonePermissionAlertVisibleRef.current = true;
    Alert.alert(
      'Microphone Access Needed',
      MICROPHONE_PERMISSION_MESSAGE,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            isMicrophonePermissionAlertVisibleRef.current = false;
          },
        },
        {
          text: 'Open Settings',
          onPress: () => {
            isMicrophonePermissionAlertVisibleRef.current = false;
            if (typeof Linking.openSettings === 'function') {
              void Linking.openSettings().catch(() => undefined);
            }
          },
        },
      ]
    );
  }, []);

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

  const resetTranscriptBuffers = useCallback(() => {
    transcriptBuffersRef.current = {
      user: '',
      coach: '',
    };
    latestUserTranscriptRef.current = '';
  }, []);

  const rememberCoachPhrase = useCallback((text: string) => {
    const normalized = normalizeTranscriptChunk(text);
    if (!normalized) return;

    recentCoachPhrasesRef.current = [
      normalized,
      ...recentCoachPhrasesRef.current.filter((phrase) => phrase !== normalized),
    ].slice(0, MAX_RECENT_COACH_PHRASES);
  }, []);

  const showTranscriptChunk = useCallback((overlay: RealtimeTranscriptOverlay): string => {
    const nextText = appendTranscriptChunk(transcriptBuffersRef.current[overlay.speaker], overlay.text);
    transcriptBuffersRef.current[overlay.speaker] = nextText;
    if (overlay.speaker === 'user') {
      latestUserTranscriptRef.current = nextText;
    }
    showTranscript({ speaker: overlay.speaker, text: nextText });
    return nextText;
  }, [showTranscript]);

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

  const clearUserTurnEndTimeout = useCallback(() => {
    if (userTurnEndTimeoutRef.current) {
      clearTimeout(userTurnEndTimeoutRef.current);
      userTurnEndTimeoutRef.current = null;
    }
  }, []);

  const clearRealtimeSpeechEndTimeout = useCallback(() => {
    if (realtimeSpeechEndTimeoutRef.current) {
      clearTimeout(realtimeSpeechEndTimeoutRef.current);
      realtimeSpeechEndTimeoutRef.current = null;
    }
  }, []);

  const clearPlaybackQueue = useCallback(() => {
    if (playbackFlushTimeoutRef.current) {
      clearTimeout(playbackFlushTimeoutRef.current);
      playbackFlushTimeoutRef.current = null;
    }
    if (playbackMicSuppressionTimeoutRef.current) {
      clearTimeout(playbackMicSuppressionTimeoutRef.current);
      playbackMicSuppressionTimeoutRef.current = null;
    }
    playbackChunksRef.current = [];
    playbackBytesRef.current = 0;
    playbackMicSuppressedUntilRef.current = 0;
  }, []);

  const unloadCreatorScriptSound = useCallback(() => {
    const sound = creatorScriptSoundRef.current;
    creatorScriptSoundRef.current = null;
    if (sound) {
      void sound.unloadAsync().catch(() => {
        // Script playback may already be unloaded.
      });
    }
  }, []);

  const clearUsageReportInterval = useCallback(() => {
    if (usageReportIntervalRef.current) {
      clearInterval(usageReportIntervalRef.current);
      usageReportIntervalRef.current = null;
    }
  }, []);

  const reportElapsedUsage = useCallback(() => {
    const startedAt = sessionStartedAtRef.current;
    if (!startedAt) return;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const deltaSeconds = elapsedSeconds - usageReportedSecondsRef.current;
    if (deltaSeconds <= 0) return;

    usageReportedSecondsRef.current = elapsedSeconds;
    void reportRealtimeCoachUsage(deltaSeconds)
      .then((nextUsage) => {
        if (nextUsage && isMountedRef.current) {
          setUsage(nextUsage);
        }
      })
      .catch((usageError) => {
        console.warn('[Voice Coach] usage report failed', usageError);
      });
  }, []);

  const finalizeUsageReporting = useCallback(() => {
    clearUsageReportInterval();
    reportElapsedUsage();
    sessionStartedAtRef.current = null;
    usageReportedSecondsRef.current = 0;
  }, [clearUsageReportInterval, reportElapsedUsage]);

  const suppressMicForPlayback = useCallback((pcmByteLength: number) => {
    if (playbackMicSuppressionTimeoutRef.current) {
      clearTimeout(playbackMicSuppressionTimeoutRef.current);
      playbackMicSuppressionTimeoutRef.current = null;
    }

    const playbackDurationMs = Math.ceil(
      (pcmByteLength / PCM16_MONO_BYTES_PER_SAMPLE / PCM16_MONO_PLAYBACK_RATE) * 1000
    );

    const now = Date.now();
    const queuedPlaybackEnd = Math.max(
      now,
      playbackMicSuppressedUntilRef.current - PLAYBACK_MIC_SUPPRESSION_GUARD_MS
    );
    playbackMicSuppressedUntilRef.current = queuedPlaybackEnd + playbackDurationMs + PLAYBACK_MIC_SUPPRESSION_GUARD_MS;
    playbackMicSuppressionTimeoutRef.current = setTimeout(() => {
      if (Date.now() >= playbackMicSuppressedUntilRef.current) {
        playbackMicSuppressionTimeoutRef.current = null;
        playbackMicSuppressedUntilRef.current = 0;
      }
    }, playbackMicSuppressedUntilRef.current - now);
  }, []);

  const flushPlaybackQueue = useCallback(() => {
    if (playbackFlushTimeoutRef.current) {
      clearTimeout(playbackFlushTimeoutRef.current);
      playbackFlushTimeoutRef.current = null;
    }

    const chunks = playbackChunksRef.current;
    const byteLength = playbackBytesRef.current;
    playbackChunksRef.current = [];
    playbackBytesRef.current = 0;

    const audio = audioRef.current;
    if (!audio || chunks.length === 0 || byteLength === 0) return;

    const merged = new Uint8Array(byteLength);
    let offset = 0;
    chunks.forEach((chunk) => {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    });

    suppressMicForPlayback(byteLength);
    audio.playPCMData(merged);
  }, [suppressMicForPlayback]);

  const cleanup = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    finalizeUsageReporting();
    clearMicWatchdog();
    clearUserTurnEndTimeout();
    clearRealtimeSpeechEndTimeout();
    clearPlaybackQueue();
    unloadCreatorScriptSound();
    clearTranscriptHideTimeout();
    cleanupMicrophoneSubscription();
    cleanupVolumeSubscriptions();
    cleanupNativeAudioDiagnosticSubscriptions();
    resetTranscriptBuffers();
    setupCompleteRef.current = false;
    isUserTurnActiveRef.current = false;
    pendingUserTurnRef.current = false;
    realtimeSpeechActiveRef.current = false;
    realtimePrerollChunksRef.current = [];
    userTurnMicrophoneChunksSentRef.current = 0;
    userTurnMicrophoneChunksReceivedRef.current = 0;
    if (isMountedRef.current) {
      setUserAudioLevel(0);
      setCoachAudioLevel(0);
      setDebugStatus((current) => ({
        ...current,
        recordingStarted: false,
        pushToTalkActive: false,
        userTurnMicrophoneChunksSent: 0,
        userTurnMicrophoneChunksReceived: 0,
      }));
      setIsUserTurnActive(false);
      setIsSpeakingCreatorScript(false);
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
    clearUserTurnEndTimeout,
    clearRealtimeSpeechEndTimeout,
    clearPlaybackQueue,
    clearTranscriptHideTimeout,
    finalizeUsageReporting,
    resetTranscriptBuffers,
    unloadCreatorScriptSound,
  ]);

  const stop = useCallback(() => {
    pendingTextPromptRef.current = null;
    cleanup();
    void setVoiceCoachAudioMode(false).catch(() => {
      // Audio mode reset is best-effort when stopping.
    });
    if (isMountedRef.current) {
      setTranscriptOverlay(null);
      setPhase('stopped');
    }
  }, [cleanup]);

  const speakCreatorScript = useCallback(async (script: string): Promise<boolean> => {
    const trimmed = script.trim();
    if (!trimmed) {
      setCreatorScriptError(EMPTY_CREATOR_SCRIPT_ERROR);
      return false;
    }

    setCreatorScriptError(null);
    setIsSpeakingCreatorScript(true);
    unloadCreatorScriptSound();

    try {
      const response = await generateRealtimeCoachScriptAudio(trimmed, preferences);
      if (response.type === 'error') {
        setCreatorScriptError(response.error.message);
        return false;
      }

      const sampleRate = Number.isFinite(response.audio.sampleRate)
        ? response.audio.sampleRate
        : 24000;
      const wavBase64 = createWavBase64FromPcm16(response.audio.audioBase64, sampleRate);
      const fileUri = `${FileSystem.cacheDirectory ?? ''}voice-coach-script-${Date.now()}.wav`;

      if (!FileSystem.cacheDirectory) {
        throw new Error('Script audio cache is not available on this device.');
      }

      await Audio.setAudioModeAsync(CREATOR_SCRIPT_AUDIO_MODE);
      await FileSystem.writeAsStringAsync(fileUri, wavBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            unloadCreatorScriptSound();
            if (isMountedRef.current) {
              setIsSpeakingCreatorScript(false);
              setPhase((current) => (
                current === 'coach_speaking'
                  ? socketRef.current
                    ? 'listening'
                    : 'stopped'
                  : current
              ));
            }
            void setVoiceCoachAudioMode(false).catch(() => {
              // Audio mode reset is best-effort after script playback.
            });
          }
        }
      );

      creatorScriptSoundRef.current = sound;
      setPhase('coach_speaking');
      setTranscriptOverlay(null);
      return true;
    } catch (scriptError) {
      console.warn('[Voice Coach] script playback failed', scriptError);
      setCreatorScriptError(scriptError instanceof Error ? scriptError.message : 'Unable to play Voice Coach script.');
      return false;
    } finally {
      if (isMountedRef.current && !creatorScriptSoundRef.current) {
        setIsSpeakingCreatorScript(false);
      }
    }
  }, [preferences, unloadCreatorScriptSound]);

  const sendGeminiToolResponse = useCallback((
    id: string,
    name: string,
    response: Record<string, unknown>
  ) => {
    const socket = socketRef.current;
    if (!isSocketOpen(socket)) return;
    socket.send(JSON.stringify({
      toolResponse: {
        functionResponses: [
          {
            id,
            name,
            response,
          },
        ],
      },
    }));
  }, []);

  const handleWorkoutPrompt = useCallback(async (
    prompt: string,
    options: { force?: boolean; draft?: AIWorkoutTemplate } = {}
  ): Promise<boolean> => {
    const trimmed = prompt.trim();
    const promptKey = normalizeWorkoutPromptKey(trimmed);
    const now = Date.now();
    const recentAttemptAt = recentWorkoutPromptAttemptsRef.current.get(promptKey);
    recentWorkoutPromptAttemptsRef.current.forEach((attemptAt, key) => {
      if (now - attemptAt > WORKOUT_PROMPT_DEDUPE_MS) {
        recentWorkoutPromptAttemptsRef.current.delete(key);
      }
    });
    const draft = options.draft ?? latestVoiceWorkoutTemplateDraftRef.current ?? currentWorkoutTemplateDraft;
    if (
      !trimmed
      || trimmed === inFlightWorkoutPromptRef.current
      || (recentAttemptAt !== undefined && now - recentAttemptAt < WORKOUT_PROMPT_DEDUPE_MS)
      || (!options.force && !shouldGenerateWorkoutFromVoice(trimmed, Boolean(draft)))
    ) {
      return false;
    }

    inFlightWorkoutPromptRef.current = trimmed;
    recentWorkoutPromptAttemptsRef.current.set(promptKey, now);
    workoutHandledThisTurnRef.current = true;
    const shouldCreateEditedVoiceWorkout = shouldEditWorkoutFromVoice(trimmed, Boolean(draft));
    setIsGeneratingVoiceWorkout(true);

    try {
      const response = await generateVoiceWorkoutTemplate(trimmed, shouldCreateEditedVoiceWorkout && draft ? {
        currentWorkoutTemplateDraft: draft,
      } : undefined);

      const template = response.type === 'answer'
        ? response.answer?.workoutTemplate
        : response.type === 'clarification'
          ? response.clarification?.workoutTemplate
          : undefined;
      if (!template || !Array.isArray(template.exercises) || template.exercises.length === 0) {
        console.warn('[Voice Coach] workout generation returned no workout template', {
          responseType: response.type,
          errorCode: response.type === 'error' ? response.error?.code : undefined,
        });
        return false;
      }
      if (response.type === 'clarification' && response.clarification) {
        setVoiceWorkoutMessages((current) => {
          const nextMessage: VoiceWorkoutMessage = {
            id: Crypto.randomUUID(),
            text: response.clarification?.question ?? 'Which option should I use?',
            workoutTemplate: template,
            clarification: response.clarification,
            savedWorkoutTemplateId: null,
          };

          latestVoiceWorkoutTemplateDraftRef.current = template;

          return [
            ...current,
            nextMessage,
          ];
        });
        return true;
      }
      if (shouldCreateEditedVoiceWorkout && draft && workoutsHaveSameExercises(draft, template)) {
        return false;
      }

      setVoiceWorkoutMessages((current) => {
        const nextTemplate = shouldCreateEditedVoiceWorkout && draft
          ? {
              ...template,
              name: getEditedWorkoutName(draft.name, [
                draft.name,
                ...current.map((message) => message.workoutTemplate.name),
              ]),
            }
          : normalizeGeneratedWorkoutForPrompt(template, trimmed);
        const nextMessage: VoiceWorkoutMessage = {
          id: Crypto.randomUUID(),
          text: response.answer?.text ?? "Here's the workout.",
          workoutTemplate: nextTemplate,
          savedWorkoutTemplateId: null,
        };

        latestVoiceWorkoutTemplateDraftRef.current = nextTemplate;

        return [
          ...current,
          nextMessage,
        ];
      });
      return true;
    } catch (workoutError) {
      console.warn('[Voice Coach] workout generation failed', workoutError);
      return false;
    } finally {
      if (inFlightWorkoutPromptRef.current === trimmed) {
        inFlightWorkoutPromptRef.current = '';
      }
      if (isMountedRef.current) {
        setIsGeneratingVoiceWorkout(false);
      }
    }
  }, [currentWorkoutTemplateDraft]);

  const selectVoiceWorkoutClarification = useCallback((
    messageId: string,
    option: string | AIClarificationOption
  ): boolean => {
    const selectedMessage = voiceWorkoutMessages.find((message) => message.id === messageId);
    const selectedDraft = selectedMessage?.workoutTemplate;
    const prompt = typeof option === 'string'
      ? option
      : option.prompt ?? option.label;

    if (!prompt.trim() || !selectedDraft) {
      return false;
    }

    setVoiceWorkoutMessages((current) => current.map((message) => (
      message.id === messageId
        ? { ...message, clarification: undefined }
        : message
    )));

    void handleWorkoutPrompt(prompt, {
      force: true,
      draft: selectedDraft,
    });
    return true;
  }, [handleWorkoutPrompt, voiceWorkoutMessages]);

  const handleWorkoutToolCall = useCallback(async (
    id: string,
    name: string,
    args: Record<string, unknown>
  ) => {
    if (name !== VOICE_WORKOUT_TOOL_NAME) {
      sendGeminiToolResponse(id, name, {
        ok: false,
        error: 'Unsupported tool.',
      });
      return;
    }

    if (workoutHandledThisTurnRef.current) {
      sendGeminiToolResponse(id, name, {
        ok: true,
        status: 'workout_building_already_started',
      });
      return;
    }

    const transcriptPrompt = latestUserTranscriptRef.current.trim();
    const draft = latestVoiceWorkoutTemplateDraftRef.current ?? currentWorkoutTemplateDraft;
    const shouldPreferTranscriptEdit = shouldEditWorkoutFromVoice(transcriptPrompt, Boolean(draft));
    const promptValue = args.prompt ?? args.request ?? args.text;
    const prompt = shouldPreferTranscriptEdit
      ? transcriptPrompt
      : typeof promptValue === 'string'
        ? promptValue.trim()
        : transcriptPrompt;

    if (!prompt) {
      sendGeminiToolResponse(id, name, {
        ok: false,
        error: 'No workout request transcript was available.',
      });
      return;
    }

    sendGeminiToolResponse(id, name, {
      ok: true,
      prompt,
      status: 'workout_building_started',
      spokenInstruction: 'Say only a short acknowledgement that Fortify is starting the build. Do not describe the workout. Do not repeat a previous acknowledgement phrase from this session.',
      recentCoachPhrases: recentCoachPhrasesRef.current,
    });
    void handleWorkoutPrompt(prompt, { force: true });
  }, [currentWorkoutTemplateDraft, handleWorkoutPrompt, sendGeminiToolResponse]);

  const maybeGenerateWorkoutFromTranscript = useCallback((text: string) => {
    if (workoutHandledThisTurnRef.current) return;
    const draft = latestVoiceWorkoutTemplateDraftRef.current ?? currentWorkoutTemplateDraft;
    if (!shouldGenerateWorkoutFromVoice(text, Boolean(draft))) return;
    void handleWorkoutPrompt(text);
  }, [currentWorkoutTemplateDraft, handleWorkoutPrompt]);

  const playGeminiAudio = useCallback((base64: string) => {
    const pcm24k = base64ToUint8Array(base64);
    const pcm16k = downsamplePcm16Mono(pcm24k);
    playbackChunksRef.current.push(pcm16k);
    playbackBytesRef.current += pcm16k.byteLength;

    if (playbackBytesRef.current >= PLAYBACK_BUFFER_TARGET_BYTES) {
      flushPlaybackQueue();
      return;
    }

    if (!playbackFlushTimeoutRef.current) {
      playbackFlushTimeoutRef.current = setTimeout(flushPlaybackQueue, PLAYBACK_BUFFER_FLUSH_MS);
    }
  }, [flushPlaybackQueue]);

  const sendMicrophoneChunk = useCallback((socket: WebSocket, chunk: Uint8Array) => {
    microphoneChunksSentRef.current += 1;
    userTurnMicrophoneChunksSentRef.current += 1;
    socket.send(JSON.stringify({
      realtimeInput: {
        audio: {
          mimeType: GEMINI_INPUT_AUDIO_MIME_TYPE,
          data: uint8ArrayToBase64(chunk),
        },
      },
    }));
  }, []);

  const updateRealtimeSpeechActivity = useCallback((chunk: Uint8Array): boolean => {
    if (interactionMode !== 'realtime' || !setupCompleteRef.current) return false;
    const socket = socketRef.current;
    if (!isSocketOpen(socket)) return false;

    if (Date.now() < playbackMicSuppressedUntilRef.current) {
      clearRealtimeSpeechEndTimeout();
      realtimeSpeechActiveRef.current = false;
      realtimePrerollChunksRef.current = [];
      return false;
    }

    const rms = calculatePcm16Rms(chunk);
    if (rms >= REALTIME_SPEECH_START_RMS) {
      clearRealtimeSpeechEndTimeout();
      if (!realtimeSpeechActiveRef.current) {
        posthog.capture('voice_chat_used');
        realtimeSpeechActiveRef.current = true;
        latestUserTranscriptRef.current = '';
        transcriptBuffersRef.current.user = '';
        workoutHandledThisTurnRef.current = false;
        clearPlaybackQueue();
        socket.send(JSON.stringify({ realtimeInput: { activityStart: {} } }));
        realtimePrerollChunksRef.current.forEach((prerollChunk) => {
          sendMicrophoneChunk(socket, prerollChunk);
        });
        realtimePrerollChunksRef.current = [];
        setPhase('user_speaking');
      }
      return true;
    }

    if (realtimeSpeechActiveRef.current) {
      if (rms > REALTIME_SPEECH_END_RMS) {
        clearRealtimeSpeechEndTimeout();
      } else if (!realtimeSpeechEndTimeoutRef.current) {
        realtimeSpeechEndTimeoutRef.current = setTimeout(() => {
          realtimeSpeechEndTimeoutRef.current = null;
          if (!realtimeSpeechActiveRef.current) return;
          realtimeSpeechActiveRef.current = false;
          const currentSocket = socketRef.current;
          if (isSocketOpen(currentSocket)) {
            currentSocket.send(JSON.stringify({ realtimeInput: { activityEnd: {} } }));
          }
          setPhase((current) => current === 'user_speaking' ? 'listening' : current);
        }, REALTIME_SPEECH_END_DELAY_MS);
      }
      return true;
    }

    realtimePrerollChunksRef.current.push(chunk);
    if (realtimePrerollChunksRef.current.length > REALTIME_PREROLL_CHUNK_COUNT) {
      realtimePrerollChunksRef.current.shift();
    }
    return false;
  }, [
    clearPlaybackQueue,
    clearRealtimeSpeechEndTimeout,
    interactionMode,
    sendMicrophoneChunk,
  ]);

  const installMicrophoneStreaming = useCallback((): boolean => {
    const audio = audioRef.current;
    if (!audio) {
      setDebugStatus((current) => ({
        ...current,
        setupComplete: false,
        nativeAudioFallback: 'voice_processing_unavailable',
      }));
      return false;
    }

    cleanupMicrophoneSubscription();
    microphoneSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener('onMicrophoneData', (event) => {
      const socket = socketRef.current;
      const chunk = normalizeMicrophoneChunk(event.data);
      if (!isSocketOpen(socket) || !chunk?.byteLength) return;
      if (interactionMode !== 'realtime' && !isUserTurnActiveRef.current) return;
      userTurnMicrophoneChunksReceivedRef.current += 1;
      const shouldSendChunk = interactionMode === 'realtime'
        ? updateRealtimeSpeechActivity(chunk)
        : true;
      if (shouldSendChunk) {
        sendMicrophoneChunk(socket, chunk);
      }
      setDebugStatus((current) => ({
        ...current,
        microphoneChunksSent: microphoneChunksSentRef.current,
        userTurnMicrophoneChunksSent: userTurnMicrophoneChunksSentRef.current,
        userTurnMicrophoneChunksReceived: userTurnMicrophoneChunksReceivedRef.current,
        lastMicrophoneChunkBytes: chunk.byteLength,
        micWatchdogTriggered: false,
        nativeAudioFallback: null,
      }));
      setError((current) => current === MICROPHONE_STREAM_ERROR ? null : current);
    }) ?? null;

    setDebugStatus((current) => ({
      ...current,
      recordingStarted: false,
      pushToTalkActive: false,
      userTurnMicrophoneChunksSent: 0,
      userTurnMicrophoneChunksReceived: 0,
    }));
    return true;
  }, [cleanupMicrophoneSubscription, interactionMode, sendMicrophoneChunk, updateRealtimeSpeechActivity]);

  const armMicrophoneWatchdog = useCallback(() => {
    clearMicWatchdog();
    micWatchdogTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current || !isUserTurnActiveRef.current || userTurnMicrophoneChunksReceivedRef.current > 0) return;
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
  }, [clearMicWatchdog]);

  const startUserTurn = useCallback((): boolean => {
    const audio = audioRef.current;
    const socket = socketRef.current;
    if (!audio || !isSocketOpen(socket) || !setupCompleteRef.current) return false;

    clearMicWatchdog();
    clearUserTurnEndTimeout();
    clearPlaybackQueue();
    latestUserTranscriptRef.current = '';
    transcriptBuffersRef.current.user = '';
    workoutHandledThisTurnRef.current = false;
    userTurnMicrophoneChunksSentRef.current = 0;
    userTurnMicrophoneChunksReceivedRef.current = 0;
    isUserTurnActiveRef.current = true;
    pendingUserTurnRef.current = false;
    setIsUserTurnActive(true);
    setPhase('user_speaking');
    socket.send(JSON.stringify({
      realtimeInput: {
        activityStart: {},
      },
    }));
    posthog.capture('voice_chat_used');

    const isRecording = audio.toggleRecording(true);
    setDebugStatus((current) => ({
      ...current,
      recordingStarted: Boolean(isRecording),
      pushToTalkActive: true,
      userTurnMicrophoneChunksSent: 0,
      userTurnMicrophoneChunksReceived: 0,
    }));
    if (!isRecording) {
      isUserTurnActiveRef.current = false;
      setIsUserTurnActive(false);
      setDebugStatus((current) => ({
        ...current,
        recordingStarted: false,
        pushToTalkActive: false,
      }));
      throw new Error('Microphone recording did not start.');
    }

    armMicrophoneWatchdog();

    return true;
  }, [armMicrophoneWatchdog, clearMicWatchdog, clearPlaybackQueue, clearUserTurnEndTimeout]);

  const finishUserTurn = useCallback(() => {
    pendingUserTurnRef.current = false;
    if (!isUserTurnActiveRef.current) return;

    clearMicWatchdog();
    if (userTurnEndTimeoutRef.current) return;

    userTurnEndTimeoutRef.current = setTimeout(() => {
      userTurnEndTimeoutRef.current = null;
      if (!isMountedRef.current || !isUserTurnActiveRef.current) return;

      const socket = socketRef.current;
      isUserTurnActiveRef.current = false;
      setIsUserTurnActive(false);

      try {
        audioRef.current?.toggleRecording(false);
      } catch {
        // Native audio may already be torn down.
      }

      if (isSocketOpen(socket)) {
        socket.send(JSON.stringify({
          realtimeInput: {
            activityEnd: {},
          },
        }));
      }

      setDebugStatus((current) => ({
        ...current,
        recordingStarted: false,
        pushToTalkActive: false,
      }));

      if (latestUserTranscriptRef.current) {
        maybeGenerateWorkoutFromTranscript(latestUserTranscriptRef.current);
      }

      transcriptBuffersRef.current.user = '';
      latestUserTranscriptRef.current = '';
      setPhase((current) => (current === 'user_speaking' ? 'listening' : current));
    }, USER_TURN_RELEASE_DRAIN_MS);
  }, [clearMicWatchdog, maybeGenerateWorkoutFromTranscript]);

  const startVolumeMonitoring = useCallback((audio: TwoWayAudioModule) => {
    cleanupVolumeSubscriptions();
    inputVolumeSubscriptionRef.current = audio.addExpoTwoWayAudioEventListener(
      'onInputVolumeLevelData',
      (event) => {
        if (typeof event.data !== 'number') return;
        const level = Math.max(0, Math.min(1, event.data));
        setUserAudioLevel(level);
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

  const sendTextPromptOverSocket = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    const socket = socketRef.current;
    if (!trimmed || !isSocketOpen(socket) || !setupCompleteRef.current) return false;
    clearPlaybackQueue();
    latestUserTranscriptRef.current = trimmed;
    transcriptBuffersRef.current.user = '';
    workoutHandledThisTurnRef.current = false;
    socket.send(JSON.stringify({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: trimmed }],
        }],
        turnComplete: true,
      },
    }));
    setPhase('listening');
    return true;
  }, [clearPlaybackQueue]);

  const handleGeminiMessage = useCallback((raw: string) => {
    const actions = parseGeminiLiveMessage(raw);

    for (const action of actions) {
      if (action.type === 'setup_complete') {
        if (!audioRef.current || !isSocketOpen(socketRef.current)) {
          continue;
        }
        setupCompleteRef.current = true;
        setDebugStatus((current) => ({ ...current, setupComplete: true }));
        if (!installMicrophoneStreaming()) {
          setupCompleteRef.current = false;
          setPhase('stopped');
          continue;
        }
        if (interactionMode === 'realtime') {
          userTurnMicrophoneChunksSentRef.current = 0;
          userTurnMicrophoneChunksReceivedRef.current = 0;
          const isRecording = audioRef.current.toggleRecording(true);
          isUserTurnActiveRef.current = Boolean(isRecording);
          setIsUserTurnActive(Boolean(isRecording));
          setDebugStatus((current) => ({
            ...current,
            recordingStarted: Boolean(isRecording),
            pushToTalkActive: false,
          }));
          if (isRecording) {
            armMicrophoneWatchdog();
          } else {
            setError('Microphone recording did not start. Switch to push-and-hold mode and try again.');
            setPhase('error');
          }
        }
        if (pendingUserTurnRef.current) {
          try {
            startUserTurn();
          } catch (turnError) {
            pendingUserTurnRef.current = false;
            setError(turnError instanceof Error ? turnError.message : GENERIC_VOICE_COACH_ERROR);
            setPhase('error');
          }
        } else {
          setPhase('listening');
        }
        if (pendingTextPromptRef.current) {
          const pendingTextPrompt = pendingTextPromptRef.current;
          pendingTextPromptRef.current = null;
          if (!sendTextPromptOverSocket(pendingTextPrompt)) {
            pendingTextPromptRef.current = pendingTextPrompt;
          }
        }
        continue;
      }

      if (action.type === 'phase') {
        setPhase(
          interactionMode === 'realtime'
          && action.phase === 'listening'
          && realtimeSpeechActiveRef.current
            ? 'user_speaking'
            : action.phase
        );
        continue;
      }

      if (action.type === 'transcript') {
        if (action.speaker === 'user') {
          const transcript = appendTranscriptChunk(transcriptBuffersRef.current.user, action.text);
          transcriptBuffersRef.current.user = transcript;
          latestUserTranscriptRef.current = transcript;
        } else {
          showTranscriptChunk({ speaker: action.speaker, text: action.text });
        }
        continue;
      }

      if (action.type === 'audio') {
        playGeminiAudio(action.base64);
        continue;
      }

      if (action.type === 'tool_call') {
        void handleWorkoutToolCall(action.id, action.name, action.args);
        continue;
      }

      if (action.type === 'turn_complete') {
        if ((interactionMode === 'realtime' || !isUserTurnActiveRef.current) && latestUserTranscriptRef.current) {
          maybeGenerateWorkoutFromTranscript(latestUserTranscriptRef.current);
          latestUserTranscriptRef.current = '';
        }
        rememberCoachPhrase(transcriptBuffersRef.current.coach);
        hideTranscriptSoon();
        transcriptBuffersRef.current.coach = '';
        if (visualContextPendingRef.current) {
          visualContextPendingRef.current = false;
          onVisualContextConsumed?.();
        }
        continue;
      }

      if (action.type === 'interrupted') {
        clearPlaybackQueue();
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
  }, [
    clearPlaybackQueue,
    armMicrophoneWatchdog,
    hideTranscriptSoon,
    handleWorkoutToolCall,
    interactionMode,
    maybeGenerateWorkoutFromTranscript,
    onVisualContextConsumed,
    playGeminiAudio,
    installMicrophoneStreaming,
    rememberCoachPhrase,
    sendTextPromptOverSocket,
    showTranscriptChunk,
    startUserTurn,
  ]);

  const start = useCallback(async () => {
    if (phase === 'connecting' || phase === 'listening' || phase === 'user_speaking' || phase === 'coach_speaking') {
      return;
    }

    cleanup();
    microphoneChunksSentRef.current = 0;
    setupCompleteRef.current = false;
    resetTranscriptBuffers();
    setError(null);
    setTranscriptOverlay(null);
    setDebugStatus({
      socketOpened: false,
      setupComplete: false,
      recordingStarted: false,
      microphoneChunksSent: 0,
      serverMessagesReceived: 0,
      pushToTalkActive: false,
      userTurnMicrophoneChunksSent: 0,
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
      if (!isMicrophonePermissionGranted(permission)) {
        const canRequestPermission = permission?.status === 'undetermined' || permission?.canAskAgain !== false;
        const requestedPermission = canRequestPermission
          ? await audio.requestMicrophonePermissionsAsync?.()
          : permission;

        if (!isMicrophonePermissionGranted(requestedPermission)) {
          showMicrophonePermissionAlert();
          cleanup();
          void setVoiceCoachAudioMode(false).catch(() => {
            // Audio mode reset is best-effort after permission denial.
          });
          setError(null);
          setPhase('stopped');
          return;
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

      const sessionResponse = await createRealtimeCoachSession(preferences, interactionMode);
      if (sessionResponse.type === 'error') {
        pendingTextPromptRef.current = null;
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
        sessionStartedAtRef.current = Date.now();
        usageReportedSecondsRef.current = 0;
        clearUsageReportInterval();
        usageReportIntervalRef.current = setInterval(reportElapsedUsage, USAGE_REPORT_INTERVAL_MS);
        setDebugStatus((current) => ({ ...current, socketOpened: true }));
        socket.send(JSON.stringify(buildGeminiSetupMessage(sessionResponse.session.model, preferences, interactionMode)));
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
        console.warn('[Voice Coach] socket connection failed', event);
        setError(VOICE_COACH_CONNECTION_ERROR);
        setPhase('error');
      };

      socket.onclose = (event) => {
        finalizeUsageReporting();
        clearMicWatchdog();
        clearRealtimeSpeechEndTimeout();
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
        setupCompleteRef.current = false;
        isUserTurnActiveRef.current = false;
        pendingUserTurnRef.current = false;
        realtimeSpeechActiveRef.current = false;
        realtimePrerollChunksRef.current = [];
        setIsUserTurnActive(false);
        void setVoiceCoachAudioMode(false).catch(() => {
          // Audio mode reset is best-effort after socket close.
        });
        setDebugStatus((current) => ({
          ...current,
          recordingStarted: false,
          pushToTalkActive: false,
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
      pendingTextPromptRef.current = null;
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
    clearRealtimeSpeechEndTimeout,
    clearUsageReportInterval,
    handleGeminiMessage,
    finalizeUsageReporting,
    interactionMode,
    phase,
    preferences,
    reportElapsedUsage,
    showMicrophonePermissionAlert,
    startNativeAudioDiagnostics,
    startVolumeMonitoring,
    stop,
  ]);

  const beginUserTurn = useCallback(async () => {
    if (interactionMode === 'realtime') {
      if (phase === 'idle' || phase === 'stopped' || phase === 'error') await start();
      return;
    }
    if (isUserTurnActiveRef.current) return;

    pendingUserTurnRef.current = true;
    try {
      if (startUserTurn()) return;
    } catch (turnError) {
      pendingUserTurnRef.current = false;
      setError(turnError instanceof Error ? turnError.message : GENERIC_VOICE_COACH_ERROR);
      setPhase('error');
      return;
    }

    if (phase === 'idle' || phase === 'stopped' || phase === 'error') {
      await start();
    }
  }, [interactionMode, phase, start, startUserTurn]);

  const endUserTurn = useCallback(() => {
    if (interactionMode === 'realtime') return;
    finishUserTurn();
  }, [finishUserTurn, interactionMode]);

  const sendVisualContext = useCallback((images: AIImage[]): boolean => {
    const socket = socketRef.current;
    if (!isSocketOpen(socket) || !setupCompleteRef.current || images.length === 0) return false;
    socket.send(JSON.stringify({
      clientContent: {
        turns: [{
          role: 'user',
          parts: images.map((image) => ({
            inlineData: { mimeType: image.mimeType, data: image.base64 },
          })),
        }],
        turnComplete: false,
      },
    }));
    visualContextPendingRef.current = true;
    return true;
  }, []);

  const sendTextPrompt = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    if (sendTextPromptOverSocket(trimmed)) return true;

    pendingTextPromptRef.current = trimmed;
    if (phase === 'idle' || phase === 'stopped' || phase === 'error') {
      void start();
    }
    return true;
  }, [phase, sendTextPromptOverSocket, start]);

  const markVoiceWorkoutSaved = useCallback((messageId: string, templateId: string) => {
    setVoiceWorkoutMessages((current) => current.map((message) => (
      message.id === messageId
        ? { ...message, savedWorkoutTemplateId: templateId }
        : message
    )));
  }, []);

  const dismissVoiceWorkoutMessage = useCallback((messageId: string) => {
    setVoiceWorkoutMessages((current) => {
      const nextMessages = current.filter((message) => message.id !== messageId);
      latestVoiceWorkoutTemplateDraftRef.current = nextMessages.length > 0
        ? nextMessages[nextMessages.length - 1].workoutTemplate
        : null;
      return nextMessages;
    });
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
    isGeneratingVoiceWorkout,
    isSpeakingCreatorScript,
    creatorScriptError,
    isActive,
    isUserTurnActive,
    start,
    stop,
    beginUserTurn,
    endUserTurn,
    sendVisualContext,
    sendTextPrompt,
    speakCreatorScript,
    setError,
    markVoiceWorkoutSaved,
    dismissVoiceWorkoutMessage,
    selectVoiceWorkoutClarification,
  };
}
