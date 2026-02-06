export const IN_APP_TOUR_VERSION = 7 as const;

export const GET_STARTED_TEMPLATE_ID = 'default-template-get-started' as const;

export const TOUR_ANCHOR_IDS = {
  aiChatButton: 'tour.tabs.aiChatButton',
  quickStartFab: 'tour.tabs.quickStartFab',
  workoutsSection: 'tour.programs.workoutsSection',
  restTimer: 'tour.workout.restTimer',
  restTimerSettings: 'tour.workout.restTimerSettings',
  insightsTab: 'tour.tabs.insightsTab',
} as const;

export type TourAnchorId = typeof TOUR_ANCHOR_IDS[keyof typeof TOUR_ANCHOR_IDS];
