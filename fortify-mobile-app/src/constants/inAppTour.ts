export const IN_APP_TOUR_VERSION = 16 as const;

export const TOUR_QUICK_START_TEMPLATE_ID = 'default-template-upper' as const;

export const TOUR_ANCHOR_IDS = {
  aiChatButton: 'tour.tabs.aiChatButton',
  aiChatBackWorkout: 'tour.aiChat.backWorkout',
  aiChatBackWorkoutPrompt: 'tour.aiChat.backWorkoutPrompt',
  aiChatWorkoutTemplate: 'tour.aiChat.workoutTemplate',
  aiChatVoiceMode: 'tour.aiChat.voiceMode',
  quickStartFab: 'tour.tabs.quickStartFab',
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
  setTarget: 'tour.workout.setTarget',
  restTimerSettings: 'tour.workout.restTimerSettings',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
