export const IN_APP_TOUR_VERSION = 30 as const;

// Accounts created before this rollout are existing users and must never be
// enrolled in the new-user tour, including after reinstalling the app.
export const IN_APP_TOUR_NEW_USER_CUTOFF = '2026-07-12T20:30:00.000Z' as const;

export const TOUR_QUICK_START_TEMPLATE_ID = 'default-template-upper' as const;
export const TOUR_BACK_WORKOUT_TEMPLATE_ID = 'tour-simulation-back-workout' as const;
export const TOUR_BACK_WORKOUT_ID = 'tour-simulation-back-workout-day' as const;

// Tour workout data is intentionally static and local. It gives every screen the
// same realistic content without creating a template or reading the exercise DB.
export const TOUR_BACK_WORKOUT_EXERCISES = [
  { exerciseId: '72f240eb-44d7-437d-b610-d53e23aad520', exerciseName: 'Barbell Bent Over Row', sets: 4, reps: '8 to 10', restSeconds: 120 },
  { exerciseId: 'd4e6ab99-5b62-4ff0-9595-0263c247198f', exerciseName: 'Cable Pulldown', sets: 3, reps: '10 to 12', restSeconds: 90 },
  { exerciseId: '92d98b61-2fcc-4696-9c60-a038b5bf716e', exerciseName: 'Cable Seated Row', sets: 3, reps: '10 to 12', restSeconds: 90 },
  { exerciseId: '46ce10d3-2a2d-477a-89bd-92f6a260f419', exerciseName: 'Cable Lateral Pulldown With V Bar', sets: 3, reps: '12 to 15', restSeconds: 60 },
] as const;

export const TOUR_ANCHOR_IDS = {
  aiChatButton: 'tour.tabs.aiChatButton',
  aiChatBackWorkout: 'tour.aiChat.backWorkout',
  aiChatBackWorkoutPrompt: 'tour.aiChat.backWorkoutPrompt',
  aiChatWorkoutTemplate: 'tour.aiChat.workoutTemplate',
  aiChatVoiceMode: 'tour.aiChat.voiceMode',
  aiChatCloseButton: 'tour.aiChat.closeButton',
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
  activeWorkoutCloseButton: 'tour.workout.activeCloseButton',
  setTarget: 'tour.workout.setTarget',
  restTimerSettings: 'tour.workout.restTimerSettings',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
