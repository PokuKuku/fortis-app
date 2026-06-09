export const AI_CHAT_OVERVIEW_COPY =
  'Make Voice Coach your own in Settings. Open Profile, tap Settings, then choose Voice Coach to customize its voice, coaching style, intensity, or create a Custom Coach.';

export const getAIChatTourNarrationVoice = (
  gender?: 'male' | 'female' | 'other' | null
): 'cedar' | 'default' => gender === 'male' ? 'cedar' : 'default';

export const shouldAutoStartVoiceCoach = (
  isTourActive: boolean,
  _activeStepId: string | null
): boolean => !isTourActive;

export const shouldPromptForFeatureAccess = (
  isTourActive: boolean
): boolean => !isTourActive;
