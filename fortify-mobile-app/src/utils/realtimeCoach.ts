import {
  COACH_PERSONALITIES,
  COACH_VOICES,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPhase,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';

export const shouldGenerateWorkoutFromVoice = (text: string): boolean => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  return /\b(make|create|build|generate|design|write|plan|give me|need|want)\b[\s\S]{0,80}\b(workout|routine|session|template)\b/i.test(normalized)
    || /\b(full body|upper body|lower body|push|pull|legs|chest|back|shoulders|arms|core)\b[\s\S]{0,60}\b(workout|routine|session|template)\b/i.test(normalized);
};

export const normalizeRealtimeCoachPhase = (value: unknown): RealtimeCoachPhase =>
  value === 'connecting'
  || value === 'listening'
  || value === 'user_speaking'
  || value === 'coach_speaking'
  || value === 'stopped'
  || value === 'error'
    ? value
    : 'idle';

export const coerceRealtimeCoachPreferences = (
  value: Partial<RealtimeCoachPreferences>
): RealtimeCoachPreferences => {
  const personality = COACH_PERSONALITIES.includes(value.personality as AICoachPersonality)
    ? value.personality as AICoachPersonality
    : DEFAULT_REALTIME_COACH_PREFERENCES.personality;
  const voice = COACH_VOICES.includes(value.voice as AICoachVoice)
    ? value.voice as AICoachVoice
    : DEFAULT_REALTIME_COACH_PREFERENCES.voice;
  const intensity = typeof value.intensity === 'number' && Number.isFinite(value.intensity)
    ? Math.min(1, Math.max(0, value.intensity))
    : DEFAULT_REALTIME_COACH_PREFERENCES.intensity;

  return { personality, voice, intensity };
};

export const getIntensityLabel = (intensity: number): string => {
  if (intensity < 0.34) return 'Calm';
  if (intensity < 0.67) return 'Sharp';
  return 'Hard';
};
