import {
  COACH_PERSONALITIES,
  COACH_VOICES,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPhase,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import {
  sanitizeConversationPersonaInstructions,
  sanitizeCustomScenarioInstructions,
} from '@/src/utils/realtimeCoachPrompt';

const WORKOUT_EDIT_REGEX =
  /\b(?:replace\s+.+\s+with\s+.+|swap\s+.+\s+for\s+.+|switch\s+.+\s+to\s+.+|add\s+.+|include\s+.+|insert\s+.+|put in\s+.+|put\s+.+|bring in\s+.+|remove\s+.+|take out\s+.+|take away\s+.+|get rid of\s+.+|cut\s+.+|exclude\s+.+|drop\s+.+|delete\s+.+|without\s+.+|skip\s+.+)\b/i;

const WORKOUT_NOUN_PATTERN = String.raw`(?:work\s*out|workout|routine|session|template|training(?:\s+(?:day|session|workout))?|lift|day)`;
const WORKOUT_FOCUS_PATTERN = String.raw`(?:full\s+body|upper\s+body|lower\s+body|push|pull|legs?|chest|back|shoulders?|arms?|biceps|triceps|glutes?|hamstrings?|quads?|calves|core|abs|cardio|conditioning|mobility|strength|hypertrophy)`;
const WORKOUT_CREATE_VERB_PATTERN = String.raw`(?:make|create|build|generate|design|plan|craft|write)`;
const EXERCISE_COUNT_PATTERN = String.raw`(?:\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)`;

const WORKOUT_RESIZE_REGEXES = [
  /\b(?:make|change|set|turn|have|keep|give)\b[\s\S]{0,50}\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:have|be|to)\b[\s\S]{0,30}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:only|just)\s+(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
];

const WORKOUT_CREATE_REGEXES = [
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,100}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\bgive\s+me\b[\s\S]{0,100}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,80}\b${WORKOUT_FOCUS_PATTERN}\b[\s\S]{0,40}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,60}\b${WORKOUT_FOCUS_PATTERN}\b\s+(?:day|lift|session|routine)\b`, 'i'),
  new RegExp(String.raw`\bgive\s+me\b[\s\S]{0,60}\b${WORKOUT_FOCUS_PATTERN}\b\s+(?:day|lift|session|routine)\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,100}\b${EXERCISE_COUNT_PATTERN}\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b[\s\S]{0,80}\b${WORKOUT_FOCUS_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,100}\b${WORKOUT_FOCUS_PATTERN}\b[\s\S]{0,80}\b${EXERCISE_COUNT_PATTERN}\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b`, 'i'),
];

export const shouldGenerateWorkoutFromVoice = (text: string, hasCurrentWorkoutDraft = false): boolean => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  if (/\b(didn['’]?t|do not|don['’]?t|not|never|stop|cancel)\b[\s\S]{0,60}\b(work\s*out|workout|routine|session|template)\b/i.test(normalized)) {
    return false;
  }

  if (new RegExp(String.raw`\b(i['’]?ll|i will|i can|let me|i am|i['’]?m)\b[\s\S]{0,60}\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,80}\b${WORKOUT_NOUN_PATTERN}\b`, 'i').test(normalized)) {
    return false;
  }

  if (hasCurrentWorkoutDraft && (
    WORKOUT_EDIT_REGEX.test(normalized)
    || WORKOUT_RESIZE_REGEXES.some((regex) => regex.test(normalized))
  )) {
    return true;
  }

  return WORKOUT_CREATE_REGEXES.some((regex) => regex.test(normalized));
};

export const shouldEditWorkoutFromVoice = (text: string, hasCurrentWorkoutDraft = false): boolean => {
  const normalized = text.trim().toLowerCase();
  if (!normalized || !hasCurrentWorkoutDraft) return false;

  return WORKOUT_EDIT_REGEX.test(normalized)
    || WORKOUT_RESIZE_REGEXES.some((regex) => regex.test(normalized));
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

  return {
    personality,
    voice,
    intensity,
    customInstructions: sanitizeCustomScenarioInstructions(value.customInstructions),
    interactionMode: value.interactionMode === 'realtime' ? 'realtime' : 'push_to_talk',
    experienceMode: value.experienceMode === 'conversation' ? 'conversation' : 'coach',
    conversationPersonaInstructions: sanitizeConversationPersonaInstructions(
      value.conversationPersonaInstructions
    ),
  };
};

export const getIntensityLabel = (intensity: number): string => {
  if (intensity < 0.34) return 'Calm';
  if (intensity < 0.67) return 'Sharp';
  return 'Hard';
};

export const isCreatorVoiceScriptsEnabled = (email?: string | null): boolean => {
  if (process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS !== 'true') {
    return false;
  }

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const allowedEmails = (process.env.EXPO_PUBLIC_CREATOR_VOICE_SCRIPT_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes('*') || allowedEmails.includes(normalizedEmail);
};
