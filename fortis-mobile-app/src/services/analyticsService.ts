/**
 * Analytics Service
 *
 * Provides typed event tracking functions for PostHog analytics.
 * All tracking is no-op when PostHog is not configured.
 *
 * Usage in stores/services (non-component code):
 *   import { analytics } from '@/src/services/analyticsService';
 *   analytics.trackWorkoutStarted({ source: 'blank', exerciseCount: 3 });
 *
 * Usage in components (with hook):
 *   import { useAnalytics } from '@/src/services/analyticsService';
 *   const { trackWorkoutStarted } = useAnalytics();
 */

import { PostHog } from 'posthog-react-native';
import { isPostHogConfigured } from '@/src/lib/posthog';
import type { AIIntent } from '@/src/types/ai';

// PostHog instance singleton - set by PostHogProvider via setPostHogInstance
let posthogInstance: PostHog | null = null;

/**
 * Set the PostHog instance (called from PostHogAuthSync or similar)
 */
export function setPostHogInstance(instance: PostHog | null) {
  posthogInstance = instance;
}

/**
 * Get the PostHog instance for direct access if needed
 */
export function getPostHogInstance(): PostHog | null {
  return posthogInstance;
}

// ============================================================================
// Event Types
// ============================================================================

/** Source of workout start */
export type WorkoutSource = 'blank' | 'template' | 'program';

/** Workout started event properties */
interface WorkoutStartedProps {
  source: WorkoutSource;
  exerciseCount: number;
  templateId?: string;
  programId?: string;
}

/** Workout completed event properties */
interface WorkoutCompletedProps {
  durationSeconds: number;
  setsCompleted: number;
  exerciseCount: number;
  source: WorkoutSource;
}

/** Set logged event properties */
interface SetLoggedProps {
  exerciseName: string;
  hasWeight: boolean;
  hasReps: boolean;
  setNumber: number;
}

/** AI message sent event properties */
interface AIMessageSentProps {
  intent: AIIntent;
  hasImage: boolean;
}

/** AI chat opened event properties */
interface AIChatOpenedProps {
  entrypoint: 'tab' | 'button' | 'deeplink' | 'unknown';
}

/** Template created event properties */
interface TemplateCreatedProps {
  exerciseCount: number;
}

/** Program created event properties */
interface ProgramCreatedProps {
  workoutCount: number;
  weekCount: number;
}

/** Theme changed event properties */
interface ThemeChangedProps {
  mode: 'system' | 'light' | 'dark';
  accentColor: string;
}

/** Insights viewed event properties */
interface InsightsViewedProps {
  has_weekly_verdict: boolean;
  watchlist_count: number;
  watchlist_eligible: number;
}

/** Verdict why tapped event properties */
interface VerdictWhyTappedProps {
  insight_id: string;
}

/** Watchlist item opened event properties */
interface WatchlistItemOpenedProps {
  insight_id: string;
  exercise_id?: string;
  severity: string;
}

/** Chat opened from insight event properties */
interface ChatOpenedFromInsightProps {
  insight_id: string;
  insight_type: string;
}

/** Insight dismissed event properties */
interface InsightDismissedProps {
  insight_id: string;
  insight_type: string;
}

/** Insight type snoozed event properties */
interface InsightTypeSnoozedProps {
  insight_type: string;
  snooze_days: number;
}

/** Insight feedback submitted event properties */
interface InsightFeedbackSubmittedProps {
  insight_id: string;
  insight_type: string;
  rating: string;
}

// ============================================================================
// Error/Failure Event Types
// ============================================================================

/** Sync type for sync failures */
export type SyncType = 'workout' | 'program' | 'exercise';

/** Sync failed event properties */
interface SyncFailedProps {
  syncType: SyncType;
  errorMessage: string;
  willRetry: boolean;
  retryCount?: number;
}

/** API error event properties */
interface ApiErrorProps {
  service: string;
  operation: string;
  errorCode?: string;
  errorMessage: string;
}

// ============================================================================
// Retention Event Types
// ============================================================================

/** App session started event properties */
interface AppSessionStartedProps {
  daysSinceLastSession: number | null;
  isFirstSession: boolean;
  isReturnedUser: boolean; // true if 7+ days since last session
}

// ============================================================================
// Event Names (snake_case per PostHog convention)
// ============================================================================

const Events = {
  // Workout events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  SET_LOGGED: 'set_logged',
  // AI events
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_CHAT_OPENED: 'ai_chat_opened',
  // Program/template events
  TEMPLATE_CREATED: 'template_created',
  PROGRAM_CREATED: 'program_created',
  // Settings events
  THEME_CHANGED: 'theme_changed',
  // Insights events
  INSIGHTS_VIEWED: 'insights_viewed',
  VERDICT_WHY_TAPPED: 'verdict_why_tapped',
  WATCHLIST_ITEM_OPENED: 'watchlist_item_opened',
  CHAT_OPENED_FROM_INSIGHT: 'chat_opened_from_insight',
  INSIGHT_DISMISSED: 'insight_dismissed',
  TYPE_SNOOZED: 'type_snoozed',
  INSIGHT_FEEDBACK_SUBMITTED: 'insight_feedback_submitted',
  // Error/failure events
  SYNC_FAILED: 'sync_failed',
  API_ERROR: 'api_error',
  // Retention events
  APP_SESSION_STARTED: 'app_session_started',
} as const;

// ============================================================================
// Core Capture Function
// ============================================================================

/**
 * Safely capture an event - no-op if PostHog not configured or initialized
 */
function capture(eventName: string, properties?: Record<string, unknown>) {
  if (!isPostHogConfigured() || !posthogInstance) {
    return;
  }

  try {
    posthogInstance.capture(eventName, properties);
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.warn('[Analytics] Failed to capture event:', eventName, error);
  }
}

// ============================================================================
// Typed Event Functions
// ============================================================================

/**
 * Analytics service for use in stores and services (non-component code)
 */
export const analytics = {
  /**
   * Track when a workout session is started
   */
  trackWorkoutStarted(props: WorkoutStartedProps) {
    capture(Events.WORKOUT_STARTED, {
      source: props.source,
      exercise_count: props.exerciseCount,
      template_id: props.templateId,
      program_id: props.programId,
    });
  },

  /**
   * Track when a workout session is completed
   */
  trackWorkoutCompleted(props: WorkoutCompletedProps) {
    capture(Events.WORKOUT_COMPLETED, {
      duration_seconds: props.durationSeconds,
      duration_minutes: Math.round(props.durationSeconds / 60),
      sets_completed: props.setsCompleted,
      exercise_count: props.exerciseCount,
      source: props.source,
    });
  },

  /**
   * Track when a set is logged
   */
  trackSetLogged(props: SetLoggedProps) {
    capture(Events.SET_LOGGED, {
      exercise_name: props.exerciseName,
      has_weight: props.hasWeight,
      has_reps: props.hasReps,
      set_number: props.setNumber,
    });
  },

  /**
   * Track when an AI message is sent
   */
  trackAIMessageSent(props: AIMessageSentProps) {
    capture(Events.AI_MESSAGE_SENT, {
      intent: props.intent,
      has_image: props.hasImage,
    });
  },

  /**
   * Track when the AI chat screen is opened
   */
  trackAIChatOpened(props: AIChatOpenedProps = { entrypoint: 'unknown' }) {
    capture(Events.AI_CHAT_OPENED, {
      entrypoint: props.entrypoint,
    });
  },

  /**
   * Track when a workout template is created
   */
  trackTemplateCreated(props: TemplateCreatedProps) {
    capture(Events.TEMPLATE_CREATED, {
      exercise_count: props.exerciseCount,
    });
  },

  /**
   * Track when a program is created
   */
  trackProgramCreated(props: ProgramCreatedProps) {
    capture(Events.PROGRAM_CREATED, {
      workout_count: props.workoutCount,
      week_count: props.weekCount,
    });
  },

  /**
   * Track when theme settings are changed
   */
  trackThemeChanged(props: ThemeChangedProps) {
    capture(Events.THEME_CHANGED, {
      mode: props.mode,
      accent_color: props.accentColor,
    });
  },

  /**
   * Track when the Insights screen is viewed
   */
  trackInsightsViewed(props: InsightsViewedProps) {
    capture(Events.INSIGHTS_VIEWED, {
      has_weekly_verdict: props.has_weekly_verdict,
      watchlist_count: props.watchlist_count,
      watchlist_eligible: props.watchlist_eligible,
    });
  },

  /**
   * Track when the Weekly Verdict why CTA is tapped
   */
  trackVerdictWhyTapped(props: VerdictWhyTappedProps) {
    capture(Events.VERDICT_WHY_TAPPED, {
      insight_id: props.insight_id,
    });
  },

  /**
   * Track when a watchlist item is opened
   */
  trackWatchlistItemOpened(props: WatchlistItemOpenedProps) {
    capture(Events.WATCHLIST_ITEM_OPENED, {
      insight_id: props.insight_id,
      exercise_id: props.exercise_id,
      severity: props.severity,
    });
  },

  /**
   * Track when chat is opened from an insight
   */
  trackChatOpenedFromInsight(props: ChatOpenedFromInsightProps) {
    capture(Events.CHAT_OPENED_FROM_INSIGHT, {
      insight_id: props.insight_id,
      insight_type: props.insight_type,
    });
  },

  /**
   * Track when an insight is dismissed
   */
  trackInsightDismissed(props: InsightDismissedProps) {
    capture(Events.INSIGHT_DISMISSED, {
      insight_id: props.insight_id,
      insight_type: props.insight_type,
    });
  },

  /**
   * Track when an insight type is snoozed
   */
  trackInsightTypeSnoozed(props: InsightTypeSnoozedProps) {
    capture(Events.TYPE_SNOOZED, {
      insight_type: props.insight_type,
      snooze_days: props.snooze_days,
    });
  },

  /**
   * Track when insight feedback is submitted
   */
  trackInsightFeedbackSubmitted(props: InsightFeedbackSubmittedProps) {
    capture(Events.INSIGHT_FEEDBACK_SUBMITTED, {
      insight_id: props.insight_id,
      insight_type: props.insight_type,
      rating: props.rating,
    });
  },

  // ==========================================================================
  // Error/Failure Events
  // ==========================================================================

  /**
   * Track when a sync operation fails
   */
  trackSyncFailed(props: SyncFailedProps) {
    capture(Events.SYNC_FAILED, {
      sync_type: props.syncType,
      error_message: props.errorMessage,
      will_retry: props.willRetry,
      retry_count: props.retryCount,
    });
  },

  /**
   * Track when an API error occurs
   */
  trackApiError(props: ApiErrorProps) {
    capture(Events.API_ERROR, {
      service: props.service,
      operation: props.operation,
      error_code: props.errorCode,
      error_message: props.errorMessage,
    });
  },

  // ==========================================================================
  // Retention Events
  // ==========================================================================

  /**
   * Track app session start for retention analysis
   */
  trackAppSessionStarted(props: AppSessionStartedProps) {
    capture(Events.APP_SESSION_STARTED, {
      days_since_last_session: props.daysSinceLastSession,
      is_first_session: props.isFirstSession,
      is_returned_user: props.isReturnedUser,
    });
  },
};

// ============================================================================
// React Hook for Components
// ============================================================================

/**
 * Hook for tracking analytics in React components
 * Returns the same functions as the analytics object
 */
export function useAnalytics() {
  return analytics;
}
