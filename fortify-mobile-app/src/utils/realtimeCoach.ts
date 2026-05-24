import {
  COACH_PERSONALITIES,
  COACH_VOICES,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPhase,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';

const WORKOUT_EDIT_REGEX =
  /\b(?:replace\s+.+\s+with\s+.+|swap\s+.+\s+for\s+.+|switch\s+.+\s+to\s+.+|add\s+.+|include\s+.+|insert\s+.+|put in\s+.+|put\s+.+|bring in\s+.+|remove\s+.+|take out\s+.+|exclude\s+.+|drop\s+.+|delete\s+.+|without\s+.+|skip\s+.+)\b/i;

const WORKOUT_RESIZE_REGEXES = [
  /\b(?:make|change|set|turn|have|keep|give)\b[\s\S]{0,50}\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:have|be|to)\b[\s\S]{0,30}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:only|just)\s+(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
];

export const shouldGenerateWorkoutFromVoice = (text: string, hasCurrentWorkoutDraft = false): boolean => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  if (/\b(didn['’]?t|do not|don['’]?t|not|never|stop|cancel)\b[\s\S]{0,60}\b(workout|routine|session|template)\b/i.test(normalized)) {
    return false;
  }

  if (/\b(i['’]?ll|i will|i can|let me|i am|i['’]?m)\b[\s\S]{0,60}\b(build|make|create|generate|plan)\b[\s\S]{0,80}\b(workout|routine|session|template)\b/i.test(normalized)) {
    return false;
  }

  if (hasCurrentWorkoutDraft && (
    WORKOUT_EDIT_REGEX.test(normalized)
    || WORKOUT_RESIZE_REGEXES.some((regex) => regex.test(normalized))
  )) {
    return true;
  }

  return /\b(make|create|build|generate|design|plan)\b[\s\S]{0,80}\b(workout|routine|session|template)\b/i.test(normalized)
    || /\bgive me\b[\s\S]{0,80}\b(workout|routine|session|template)\b/i.test(normalized);
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
