export const IN_APP_TOUR_VERSION = 1 as const;

export const GET_STARTED_TEMPLATE_ID = 'default-template-get-started' as const;
export const GET_STARTED_WORKOUT_ID = `${GET_STARTED_TEMPLATE_ID}-workout` as const;

export const TOUR_ANCHOR_IDS = {
  insightsHeader: 'tour.insights.header',
  startedCard: 'tour.insights.started',
  quickStartFab: 'tour.tabs.quickStartFab',
  finishWorkoutButton: 'tour.workout.finishWorkout',
  workoutRecapCard: 'tour.insights.workoutRecap',
  historyHeader: 'tour.history.header',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];

