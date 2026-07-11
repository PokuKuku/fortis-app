export const AI_TEXT_CHAT_TOUR_COPY =
  'Fortify can create personalized workout templates for you.\n\nTap Add to Workouts to save this workout for future sessions.';

export const AI_CHAT_OVERVIEW_COPY =
  'Voice Coach can make workouts just like Chat and answer questions about your fitness journey.\n\nYou can customize your coach in Settings.';

// Retained for one development refresh while a stale in-app tour provider may
// still reference the former narration action. The current tour does not use it.
export const getAIChatTourNarrationVoice = (
  gender?: 'male' | 'female' | 'other' | null
): 'cedar' | 'default' => gender === 'male' ? 'cedar' : 'default';

export const shouldPromptForFeatureAccess = (
  isTourActive: boolean
): boolean => !isTourActive;
