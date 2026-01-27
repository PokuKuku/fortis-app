// Exercise library
export const CUSTOM_EXERCISES_KEY = 'custom_exercises_v1';
export const EXERCISE_CACHE_KEY = 'exercise_cache_v6';
export const EXERCISE_CACHE_TIMESTAMP_KEY = 'exercise_cache_timestamp_v6';
export const EXERCISE_LIBRARY_VERSION_KEY = 'exercise_library_version_v2';

// Programs
export const PROGRAMS_KEY = 'fortis_programs_v1';
export const LOCAL_TEMPLATES_KEY = 'fortis_local_templates_v5';
export const PROGRAM_PROGRESS_KEY = 'program_progress_v1';

// Workout templates
export const WORKOUTS_KEY = 'fortis_workouts_v1';

// Workout logging
export const ACTIVE_WORKOUT_KEY = 'active_workout_v1';
export const COMPLETED_WORKOUTS_KEY = 'completed_workouts_v1';
export const PENDING_SYNC_QUEUE_KEY = 'pending_sync_queue_v1';
export const PENDING_PROGRAM_SYNC_QUEUE_KEY = 'pending_program_sync_queue_v1';
export const PENDING_STICKY_NOTES_SYNC_KEY = 'pending_sticky_notes_sync_v1';
export const REST_TIMER_SETTINGS_KEY = 'rest_timer_settings_v1';
export const EXERCISE_ORDER_KEY = 'exercise_order_v1';
export const EXERCISE_STICKY_NOTES_KEY = 'exercise_sticky_notes_v1';
export const EXERCISE_WEIGHT_UNITS_KEY = 'exercise_weight_units_v1';
export const BODY_TYPE_KEY = 'body_type_v1';
export const START_BUTTON_PRESET_KEY = 'start_button_preset_v1';
export const ONBOARDING_STATE_KEY = 'onboarding_state_v1';
export const PROGRAM_PROGRESS_SEED_KEY = 'program_progress_seed_v1';

// In-app tour
export const IN_APP_TOUR_STATE_KEY = 'in_app_tour_state_v1';
export const HAS_AUTO_SET_GET_STARTED_PRESET_KEY = 'has_auto_set_get_started_preset_v1';

// AI assistant
export const AI_CONVERSATION_KEY = 'ai_conversation_v1';

// Appearance
export const THEME_MODE_KEY = 'theme_mode_v1';
export const ACCENT_COLOR_KEY = 'accent_color_v1';

// Analytics / Retention
export const LAST_SESSION_TIMESTAMP_KEY = 'last_session_timestamp_v1';
export const PROFILE_STATS_CACHE_KEY = 'profile_stats_cache_v1';
export const TRAINING_INSIGHTS_CACHE_KEY = 'training_insights_cache_v1';
export const INSIGHT_CHARTS_CACHE_KEY = 'training_insight_charts_cache_v1';

// Keys that should be scoped per user and cleared on sign-out
export const USER_SCOPED_STORAGE_KEYS = [
  CUSTOM_EXERCISES_KEY,
  PROGRAMS_KEY,
  WORKOUTS_KEY,
  LOCAL_TEMPLATES_KEY,
  PROGRAM_PROGRESS_KEY,
  ACTIVE_WORKOUT_KEY,
  COMPLETED_WORKOUTS_KEY,
  PENDING_SYNC_QUEUE_KEY,
  PENDING_PROGRAM_SYNC_QUEUE_KEY,
  PENDING_STICKY_NOTES_SYNC_KEY,
  REST_TIMER_SETTINGS_KEY,
  EXERCISE_ORDER_KEY,
  EXERCISE_STICKY_NOTES_KEY,
  EXERCISE_WEIGHT_UNITS_KEY,
  BODY_TYPE_KEY,
  START_BUTTON_PRESET_KEY,
  ONBOARDING_STATE_KEY,
  PROGRAM_PROGRESS_SEED_KEY,
  IN_APP_TOUR_STATE_KEY,
  HAS_AUTO_SET_GET_STARTED_PRESET_KEY,
  AI_CONVERSATION_KEY,
  PROFILE_STATS_CACHE_KEY,
  TRAINING_INSIGHTS_CACHE_KEY,
  INSIGHT_CHARTS_CACHE_KEY,
  // Appearance (cleared on sign-out to prevent leakage between users)
  THEME_MODE_KEY,
  ACCENT_COLOR_KEY,
] as const;
