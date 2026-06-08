import {
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import type { OnboardingState } from '@/src/utils/onboardingState';

type OnboardingGender = NonNullable<OnboardingState['gender']>;

export const getCoachVoiceForOnboardingGender = (
  gender: OnboardingGender
): RealtimeCoachPreferences['voice'] => (
  gender === 'male' ? 'cedar' : DEFAULT_REALTIME_COACH_PREFERENCES.voice
);

export const applyOnboardingGenderCoachVoice = (
  preferences: RealtimeCoachPreferences,
  gender: OnboardingGender
): RealtimeCoachPreferences => ({
  ...preferences,
  voice: getCoachVoiceForOnboardingGender(gender),
});
