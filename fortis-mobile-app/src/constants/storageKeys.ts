// Exercise library
export const CUSTOM_EXERCISES_KEY = 'custom_exercises_v1';
export const EXERCISE_CACHE_KEY = 'exercise_cache_v5';
export const EXERCISE_CACHE_TIMESTAMP_KEY = 'exercise_cache_timestamp_v5';
export const EXERCISE_LIBRARY_VERSION_KEY = 'exercise_library_version_v1';

// Programs
export const PROGRAMS_KEY = 'fortis_programs_v1';
export const LOCAL_TEMPLATES_KEY = 'fortis_local_templates';
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

// AI assistant
export const AI_CONVERSATION_KEY = 'ai_conversation_v1';
export const AI_PENDING_ACTIONS_KEY = 'ai_pending_actions_v1';
export const AI_MUTATION_PLAN_KEY = 'ai_mutation_plan_v1';

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
  AI_CONVERSATION_KEY,
  AI_PENDING_ACTIONS_KEY,
  AI_MUTATION_PLAN_KEY,
] as const;
