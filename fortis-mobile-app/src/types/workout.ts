/**
 * Workout Domain Types
 *
 * TypeScript interfaces for the workout logging feature.
 * These types match the Supabase schema with offline-first adaptations.
 */

// Set Types - matches database set_type enum
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

// RPE values (6-10 scale as per design, null if not tracked)
export type RpeValue = 6 | 7 | 8 | 9 | 10 | null;

/**
 * Individual set within an exercise
 */
export interface WorkoutSet {
  localId: string;           // UUID for offline-first
  setNumber: number;         // Display order (1, 2, 3...)
  setType: SetType;
  weight: number | null;     // Decimal (e.g., 135.5) in user's preferred unit
  reps: number | null;       // Integer
  rpe: RpeValue;
  restSeconds: number | null;
  notes: string;
  isCompleted: boolean;      // Checkmark state
  orderIndex: number;        // For reordering
}

/**
 * Exercise within a workout session
 */
export interface WorkoutExercise {
  localId: string;
  exerciseId: string;        // Reference to exercise library
  exerciseName: string;      // Denormalized for offline access
  sets: WorkoutSet[];
  notes: string;
  orderIndex: number;
}

/**
 * Rest timer configuration
 */
export interface RestTimerSettings {
  normalSeconds: number;     // Default 120s (2 min)
  warmupSeconds: number;     // Default 90s
  dropsetSeconds: number;    // Default 60s
}

/**
 * Active workout session state
 */
export interface WorkoutSession {
  localId: string;           // Client-generated UUID
  userId?: string;           // null when offline/anonymous
  name: string;
  notes: string;
  startedAt: Date;
  completedAt: Date | null;
  programId?: string;        // Optional program reference
  programWorkoutId?: string; // Optional template reference
  exercises: WorkoutExercise[];
  isSynced: boolean;
}

/**
 * Rest timer state for the store
 */
export interface RestTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  setType: SetType;
}

/**
 * Workout summary for completion modal
 */
export interface WorkoutSummary {
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;       // weight * reps sum
  durationSeconds: number;
}

// ============================================
// DTOs for Supabase sync
// ============================================

/**
 * workout_sessions table DTO
 */
export interface WorkoutSessionDTO {
  id?: string;               // Server-assigned UUID
  local_id: string;
  user_id: string;
  name: string;
  notes: string;
  started_at: string;        // ISO timestamp
  completed_at: string | null;
  duration_seconds: number | null;
  program_id?: string;
  program_workout_id?: string;
  is_synced: boolean;
}

/**
 * workout_sets table DTO
 */
export interface WorkoutSetDTO {
  id?: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  rest_seconds: number | null;
  notes: string;
  is_warmup: boolean;
  is_dropset: boolean;
  is_failure: boolean;
  order_index: number;
  local_id: string;
  set_type: SetType;
}

// ============================================
// UI Helper Types
// ============================================

/**
 * RPE color configuration
 */
export const RPE_COLORS: Record<number, string> = {
  6: '#22c55e',  // Green
  7: '#84cc16',  // Lime
  8: '#eab308',  // Yellow
  9: '#f97316',  // Orange
  10: '#ef4444', // Red
};

/**
 * Set type display configuration
 */
export const SET_TYPE_CONFIG: Record<SetType, { label: string; color: string; bgColor: string }> = {
  normal: { label: '', color: '#ffffff', bgColor: 'transparent' },
  warmup: { label: 'W', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.2)' },
  failure: { label: 'F', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  dropset: { label: 'D', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
};

/**
 * Default rest timer settings
 */
export const DEFAULT_REST_TIMER_SETTINGS: RestTimerSettings = {
  normalSeconds: 120,  // 2 minutes
  warmupSeconds: 90,   // 1.5 minutes
  dropsetSeconds: 60,  // 1 minute
};
