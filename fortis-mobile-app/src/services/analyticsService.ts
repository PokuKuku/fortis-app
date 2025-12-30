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
 *   const { trackAIChatOpened } = useAnalytics();
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
  muscleGroup?: string;
  hasWeight: boolean;
  hasReps: boolean;
  setNumber: number;
}

/** AI message sent event properties */
interface AIMessageSentProps {
  intent: AIIntent;
  hasImage: boolean;
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

// ============================================================================
// Onboarding Event Types
// ============================================================================

/** Onboarding step names */
export type OnboardingStepName = 'welcome' | 'units' | 'body-type' | 'complete';

/** Onboarding started event properties */
interface OnboardingStartedProps {
  source: 'fresh_install' | 'signup';
}

/** Onboarding step event properties */
interface OnboardingStepProps {
  step: 1 | 2 | 3 | 4;
  stepName: OnboardingStepName;
  durationSeconds?: number;
}

/** Onboarding units selected event properties */
interface OnboardingUnitsSelectedProps {
  units: 'imperial' | 'metric';
  bodyType: 'male' | 'female';
}

/** Onboarding completed event properties */
interface OnboardingCompletedProps {
  totalDurationSeconds: number;
  createdAccount: boolean;
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
// Event Names (snake_case per PostHog convention)
// ============================================================================

const Events = {
  // Workout events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  SET_LOGGED: 'set_logged',
  // AI events
  AI_CHAT_OPENED: 'ai_chat_opened',
  AI_MESSAGE_SENT: 'ai_message_sent',
  // Program/template events
  TEMPLATE_CREATED: 'template_created',
  PROGRAM_CREATED: 'program_created',
  // Settings events
  THEME_CHANGED: 'theme_changed',
  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_UNITS_SELECTED: 'onboarding_units_selected',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  // Error/failure events
  SYNC_FAILED: 'sync_failed',
  API_ERROR: 'api_error',
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
   * Track when a set is logged/completed
   */
  trackSetLogged(props: SetLoggedProps) {
    capture(Events.SET_LOGGED, {
      exercise_name: props.exerciseName,
      muscle_group: props.muscleGroup,
      has_weight: props.hasWeight,
      has_reps: props.hasReps,
      set_number: props.setNumber,
    });
  },

  /**
   * Track when AI chat is opened
   */
  trackAIChatOpened() {
    capture(Events.AI_CHAT_OPENED);
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

  // ==========================================================================
  // Onboarding Events
  // ==========================================================================

  /**
   * Track when onboarding flow is started
   */
  trackOnboardingStarted(props: OnboardingStartedProps) {
    capture(Events.ONBOARDING_STARTED, {
      source: props.source,
    });
  },

  /**
   * Track when an onboarding step is viewed
   */
  trackOnboardingStepViewed(props: OnboardingStepProps) {
    capture(Events.ONBOARDING_STEP_VIEWED, {
      step: props.step,
      step_name: props.stepName,
    });
  },

  /**
   * Track when an onboarding step is completed
   */
  trackOnboardingStepCompleted(props: OnboardingStepProps) {
    capture(Events.ONBOARDING_STEP_COMPLETED, {
      step: props.step,
      step_name: props.stepName,
      duration_seconds: props.durationSeconds,
    });
  },

  /**
   * Track when user selects units and body type in onboarding
   */
  trackOnboardingUnitsSelected(props: OnboardingUnitsSelectedProps) {
    capture(Events.ONBOARDING_UNITS_SELECTED, {
      units: props.units,
      body_type: props.bodyType,
    });
  },

  /**
   * Track when onboarding is fully completed
   */
  trackOnboardingCompleted(props: OnboardingCompletedProps) {
    capture(Events.ONBOARDING_COMPLETED, {
      total_duration_seconds: props.totalDurationSeconds,
      created_account: props.createdAccount,
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
