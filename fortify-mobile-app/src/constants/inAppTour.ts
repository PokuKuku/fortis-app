export const IN_APP_TOUR_VERSION = 30 as const;

export const TOUR_QUICK_START_TEMPLATE_ID = 'default-template-upper' as const;
export const TOUR_BACK_WORKOUT_AI_SOURCE = 'in_app_tour_back_workout' as const;

export const TOUR_ANCHOR_IDS = {
  aiChatButton: 'tour.tabs.aiChatButton',
  aiChatBackWorkout: 'tour.aiChat.backWorkout',
  aiChatBackWorkoutPrompt: 'tour.aiChat.backWorkoutPrompt',
  aiChatWorkoutTemplate: 'tour.aiChat.workoutTemplate',
  aiChatVoiceMode: 'tour.aiChat.voiceMode',
  quickStartFab: 'tour.tabs.quickStartFab',
  streakCounter: 'tour.tabs.streakCounter',
  workoutsSection: 'tour.programs.workoutsSection',
  addWorkoutRoutine: 'tour.workouts.addRoutine',
  addWithVoice: 'tour.workout.addWithVoice',
  pasteWorkout: 'tour.workout.pasteWorkout',
  voiceAddListenButton: 'tour.workout.voiceAddListenButton',
  voiceAddConfirmButton: 'tour.workout.voiceAddConfirmButton',
  workoutExerciseCard: 'tour.workout.exerciseCard',
  workoutBuilderCloseButton: 'tour.workout.builderCloseButton',
  restTimer: 'tour.workout.restTimer',
  voiceLog: 'tour.workout.voiceLog',
  workoutVoiceLogListenButton: 'tour.workout.voiceLogListenButton',
  workoutVoiceLogApplyButton: 'tour.workout.voiceLogApplyButton',
  activeWorkoutExerciseCard: 'tour.workout.activeExerciseCard',
  activeSetWeight: 'tour.workout.activeSetWeight',
  activeSetReps: 'tour.workout.activeSetReps',
  activeSetFillDown: 'tour.workout.activeSetFillDown',
  activeSetComplete: 'tour.workout.activeSetComplete',
  setTarget: 'tour.workout.setTarget',
  restTimerSettings: 'tour.workout.restTimerSettings',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
