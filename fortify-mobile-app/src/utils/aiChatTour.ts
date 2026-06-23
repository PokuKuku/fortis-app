export const AI_TEXT_CHAT_TOUR_COPY =
  'Fortify created a personalized back workout program for you.\n\nChat returns a workout card like this so you can review it, save it to your library, or start it when ready.';

export const AI_CHAT_OVERVIEW_COPY =
  'Voice Coach can make workouts just like Chat and answer questions about your fitness journey.\n\nYou can customize Voice Coach in Settings. Open Profile, tap Settings, then choose Voice Coach.';

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
