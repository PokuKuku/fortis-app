export const IN_APP_TOUR_VERSION = 4 as const;

export const GET_STARTED_TEMPLATE_ID = 'default-template-get-started' as const;
export const GET_STARTED_WORKOUT_ID = `${GET_STARTED_TEMPLATE_ID}-workout` as const;

export const TOUR_ANCHOR_IDS = {
  quickStartFab: 'tour.tabs.quickStartFab',
  startConfigGetStarted: 'tour.startConfig.getStarted',
  restTimer: 'tour.workout.restTimer',
  workoutColumns: 'tour.workout.columns',
  restTimerSettings: 'tour.workout.restTimerSettings',
  addSetButton: 'tour.workout.addSetButton',
  closeWorkoutButton: 'tour.workout.closeWorkout',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
