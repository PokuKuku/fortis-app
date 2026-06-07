import { AI_REALTIME_COACH_PREFERENCES_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  COACH_PERSONALITIES,
  COACH_VOICES,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import { sanitizeCustomScenarioInstructions } from '@/src/utils/realtimeCoachPrompt';

type RealtimeCoachPreferencesListener = (preferences: RealtimeCoachPreferences) => void;

const listeners = new Set<RealtimeCoachPreferencesListener>();

const isVoice = (value: unknown): value is AICoachVoice =>
  typeof value === 'string' && COACH_VOICES.includes(value as AICoachVoice);

const isPersonality = (value: unknown): value is AICoachPersonality =>
  typeof value === 'string' && COACH_PERSONALITIES.includes(value as AICoachPersonality);

export const normalizeRealtimeCoachPreferences = (
  value: unknown
): RealtimeCoachPreferences => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_REALTIME_COACH_PREFERENCES;
  }

  const candidate = value as Partial<RealtimeCoachPreferences>;
  const intensity = typeof candidate.intensity === 'number' && Number.isFinite(candidate.intensity)
    ? Math.min(1, Math.max(0, candidate.intensity))
    : DEFAULT_REALTIME_COACH_PREFERENCES.intensity;

  return {
    personality: isPersonality(candidate.personality)
      ? candidate.personality
      : DEFAULT_REALTIME_COACH_PREFERENCES.personality,
    voice: isVoice(candidate.voice)
      ? candidate.voice
      : DEFAULT_REALTIME_COACH_PREFERENCES.voice,
    intensity,
    customInstructions: sanitizeCustomScenarioInstructions(candidate.customInstructions),
  };
};

export async function getRealtimeCoachPreferences(): Promise<RealtimeCoachPreferences> {
  const raw = await getScopedItem(AI_REALTIME_COACH_PREFERENCES_KEY);
  if (!raw) {
    return DEFAULT_REALTIME_COACH_PREFERENCES;
  }

  try {
    return normalizeRealtimeCoachPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_REALTIME_COACH_PREFERENCES;
  }
}

export async function setRealtimeCoachPreferences(
  preferences: RealtimeCoachPreferences
): Promise<void> {
  const normalizedPreferences = normalizeRealtimeCoachPreferences(preferences);
  await setScopedItem(
    AI_REALTIME_COACH_PREFERENCES_KEY,
    JSON.stringify(normalizedPreferences)
  );
  listeners.forEach((listener) => listener(normalizedPreferences));
}

export function subscribeToRealtimeCoachPreferences(
  listener: RealtimeCoachPreferencesListener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
