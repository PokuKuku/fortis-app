import { AI_COACH_LAST_MODE_KEY } from '@/src/constants/storageKeys';
import type { AIVoiceMode } from '@/src/types/realtimeCoach';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

const DEFAULT_AI_COACH_MODE: AIVoiceMode = 'voice';

export async function getLastAICoachMode(): Promise<AIVoiceMode> {
  try {
    const storedMode = await getScopedItem(AI_COACH_LAST_MODE_KEY);
    return storedMode === 'chat' || storedMode === 'voice'
      ? storedMode
      : DEFAULT_AI_COACH_MODE;
  } catch {
    return DEFAULT_AI_COACH_MODE;
  }
}

export async function setLastAICoachMode(mode: AIVoiceMode): Promise<void> {
  await setScopedItem(AI_COACH_LAST_MODE_KEY, mode);
}
