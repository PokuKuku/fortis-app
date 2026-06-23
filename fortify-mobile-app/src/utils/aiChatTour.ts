export const AI_TEXT_CHAT_TOUR_COPY =
  'Fortify can create personalized workout templates for you.\n\nThe more specific your request, the better the output.';

export const AI_CHAT_OVERVIEW_COPY =
  'Voice Coach can make workouts just like Chat and answer questions about your fitness journey.\n\nYou can customize Voice Coach in Settings. Open Profile, tap Settings, then choose Voice Coach.';

export const getAIChatTourNarrationVoice = (
  gender?: 'male' | 'female' | 'other' | null
): 'cedar' | 'default' => gender === 'male' ? 'cedar' : 'default';

export const shouldPromptForFeatureAccess = (
  isTourActive: boolean
): boolean => !isTourActive;
