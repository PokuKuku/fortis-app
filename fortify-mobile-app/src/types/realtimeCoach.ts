import type { AIWorkoutTemplate } from '@/src/types/ai';

export type AIVoiceMode = 'chat' | 'voice';
export type AICoachPersonality = 'direct' | 'drill_sergeant' | 'hype' | 'roast';
export type AICoachVoice = 'marin' | 'cedar' | 'coral' | 'verse' | 'sage';

export interface RealtimeCoachPreferences {
  personality: AICoachPersonality;
  intensity: number;
  voice: AICoachVoice;
  customInstructions?: string;
}

export interface RealtimeCoachUsage {
  secondsUsedToday: number;
  maxSecondsPerDay: number;
  maxSecondsPerSession: number;
}

export interface RealtimeCoachSession {
  provider: 'gemini';
  accessToken: string;
  liveEndpoint: string;
  expiresAt?: string;
  model: string;
  voice: AICoachVoice;
  usage: RealtimeCoachUsage;
}

export interface RealtimeCoachScriptAudio {
  type: 'script_audio';
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  voice: AICoachVoice;
}

export type RealtimeTranscriptSpeaker = 'user' | 'coach';

export interface RealtimeTranscriptOverlay {
  speaker: RealtimeTranscriptSpeaker;
  text: string;
}

export interface RealtimeCoachDebugStatus {
  socketOpened: boolean;
  setupComplete: boolean;
  recordingStarted: boolean;
  microphoneChunksSent: number;
  serverMessagesReceived: number;
  lastMicrophoneChunkBytes?: number;
  lastServerMessageType?: string;
  lastSocketClose?: string;
  recordingChange?: boolean;
  audioInterruption?: string;
  micWatchdogTriggered?: boolean;
  nativeAudioFallback?: 'voice_processing_unavailable' | null;
  pushToTalkActive?: boolean;
  userTurnMicrophoneChunksSent?: number;
  userTurnMicrophoneChunksReceived?: number;
}

export type RealtimeCoachPhase =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'user_speaking'
  | 'coach_speaking'
  | 'stopped'
  | 'error';

export interface VoiceWorkoutMessage {
  id: string;
  text: string;
  workoutTemplate: AIWorkoutTemplate;
  savedWorkoutTemplateId?: string | null;
}

export const COACH_VOICES: AICoachVoice[] = ['marin', 'cedar', 'coral', 'verse', 'sage'];
export const COACH_PERSONALITIES: AICoachPersonality[] = ['direct', 'drill_sergeant', 'hype', 'roast'];

export const COACH_VOICE_LABELS: Record<AICoachVoice, string> = {
  marin: 'Marin',
  cedar: 'Cedar',
  coral: 'Coral',
  verse: 'Verse',
  sage: 'Sage',
};

export const COACH_PERSONALITY_LABELS: Record<AICoachPersonality, string> = {
  direct: 'Direct',
  drill_sergeant: 'Drill',
  hype: 'Hype',
  roast: 'Roast',
};

export const DEFAULT_REALTIME_COACH_PREFERENCES: RealtimeCoachPreferences = {
  personality: 'direct',
  intensity: 0.55,
  voice: 'marin',
  customInstructions: '',
};
