// Temporarily bypass feature-level paywalls while preserving their placements.
// The post-sign-up onboarding paywall remains enabled.
export const FEATURE_PAYWALLS_ENABLED = false;

export const PAYWALL_PLACEMENTS = {
  postSignUp: 'fortis_first',
  aiVoiceCoach: 'fortis_ai_voice_coach',
  aiChat: 'fortis_ai_chat',
  insightAskFortify: 'fortis_insight_ask_fortify',
  voiceExerciseAdd: 'fortis_voice_exercise_add',
  voiceSetLog: 'fortis_voice_set_log',
  voiceWorkoutCreate: 'fortis_voice_workout_create',
  programLimit: 'fortis_program_limit',
  workoutLimit: 'fortis_workout_limit',
  workoutStreak: 'fortis_workout_streak',
} as const;

export type PaywallPlacement =
  typeof PAYWALL_PLACEMENTS[keyof typeof PAYWALL_PLACEMENTS];
