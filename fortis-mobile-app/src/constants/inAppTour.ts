export const IN_APP_TOUR_VERSION = 6 as const;

export const GET_STARTED_TEMPLATE_ID = 'default-template-get-started' as const;
export const GET_STARTED_WORKOUT_ID = `${GET_STARTED_TEMPLATE_ID}-workout` as const;

export const TOUR_ANCHOR_IDS = {
  aiChatButton: 'tour.tabs.aiChatButton',
  quickStartFab: 'tour.tabs.quickStartFab',
  workoutsSection: 'tour.programs.workoutsSection',
  programsSection: 'tour.programs.programsSection',
  startConfigGetStarted: 'tour.startConfig.getStarted',
  aiChatClose: 'tour.ai.chatClose',
  restTimer: 'tour.workout.restTimer',
  workoutColumns: 'tour.workout.columns',
  restTimerSettings: 'tour.workout.restTimerSettings',
  addSetButton: 'tour.workout.addSetButton',
  closeWorkoutButton: 'tour.workout.closeWorkout',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
