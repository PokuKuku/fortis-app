/**
 * Workout Domain Types
 *
 * TypeScript interfaces for the workout logging feature.
 * These types match the Supabase schema with offline-first adaptations.
 */

// Set Types - matches database set_type enum
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

// RPE values (6-10 scale with half values, null if not tracked)
export type RpeValue = 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 | 9.5 | 10 | null;

// Weight unit for per-exercise preference
export type WeightUnit = 'lbs' | 'kg';

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
  programName?: string;
  programId?: string;        // Optional program reference
  programWorkoutId?: string; // Optional template reference
  originalExerciseIds?: string[]; // Exercise IDs at start (for modification detection)
  originalSetCounts?: number[];   // Set counts at start (for template change detection)
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
 * RPE color configuration (includes half values)
 */
export const RPE_COLORS: Record<number, string> = {
  6: '#22c55e',    // Green
  6.5: '#65d439',  // Green-Lime
  7: '#84cc16',    // Lime
  7.5: '#b7d10f',  // Lime-Yellow
  8: '#eab308',    // Yellow
  8.5: '#f29b0e',  // Yellow-Orange
  9: '#f97316',    // Orange
  9.5: '#fc5b41',  // Orange-Red
  10: '#ef4444',   // Red
};

/**
 * RPE descriptions for user guidance
 */
export const RPE_DESCRIPTIONS: Record<number, string> = {
  6: '4+ more reps',
  6.5: '3-4 more reps',
  7: '3 more reps',
  7.5: '2-3 more reps',
  8: '2 more reps',
  8.5: '1-2 more reps',
  9: '1 more rep',
  9.5: 'Maybe 1 more rep',
  10: 'No more reps',
};

/**
 * RPE to RIR (Reps in Reserve) mapping
 */
export const RPE_TO_RIR: Record<number, string> = {
  6: '4 RIR',
  6.5: '3-4 RIR',
  7: '3 RIR',
  7.5: '2-3 RIR',
  8: '2 RIR',
  8.5: '1-2 RIR',
  9: '1 RIR',
  9.5: '0-1 RIR',
  10: '0 RIR',
};

/**
 * RPE values array for iteration
 */
export const RPE_VALUES: (6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 | 9.5 | 10)[] = [
  6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10
];

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

// ============================================
// Program Types (for Programs/Templates screen)
// ============================================

/**
 * Difficulty levels for programs
 */
export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Program goals
 */
export type ProgramGoal = 'strength' | 'hypertrophy' | 'powerlifting' | 'general_fitness';

/**
 * Set details for template exercises (stores weight/reps per set)
 */
export interface TemplateSetDetail {
  weight: number | null;
  reps: number | null;
}

/**
 * Exercise prescription within a program workout
 */
export interface ProgramExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;           // Can be "8-12" or "5"
  restSeconds?: number;
  notes?: string;
  orderIndex: number;
  setDetails?: TemplateSetDetail[];  // Per-set weight/reps for templates
}

/**
 * Single workout day within a program
 */
export interface ProgramWorkout {
  id: string;
  name: string;           // e.g., "Push Day A"
  dayNumber: number;
  exercises: ProgramExercise[];
}

/**
 * Workout program (multi-day training plan)
 */
export interface Program {
  id: string;
  name: string;
  description?: string;
  difficulty: ProgramDifficulty;
  goal?: ProgramGoal;
  durationWeeks?: number;
  isPublic: boolean;
  isDefault: boolean;
  isAiCreated: boolean;
  isTemplate: boolean;
  lastPerformedAt: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  workouts: ProgramWorkout[];
}

/**
 * Program DTO (snake_case for Supabase)
 */
export interface ProgramDTO {
  id: string;
  name: string;
  description?: string;
  difficulty: ProgramDifficulty;
  goal?: ProgramGoal;
  duration_weeks?: number;
  is_public: boolean;
  is_default: boolean;
  is_ai_created: boolean;
  is_template?: boolean;
  last_performed_at: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
  program_workouts?: ProgramWorkoutDTO[];
}

/**
 * Program workout DTO
 */
export interface ProgramWorkoutDTO {
  id: string;
  program_id: string;
  name: string;
  day_number: number;
  program_exercises?: ProgramExerciseDTO[];
}

/**
 * Program exercise DTO
 */
export interface ProgramExerciseDTO {
  id: string;
  program_workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
}

// ============================================
// Program Progress Types
// ============================================

/**
 * User's progress within a program
 */
export interface ProgramProgress {
  id: string;
  userId: string;
  programId: string;
  currentWorkoutIndex: number;
  currentCycle: number;
  startedAt: string;
  completedAt: string | null;
  lastWorkoutId: string | null;
  lastWorkoutAt: string | null;
}

/**
 * Program progress DTO (snake_case for Supabase)
 */
export interface ProgramProgressDTO {
  id: string;
  user_id: string;
  program_id: string;
  current_workout_index: number;
  current_cycle: number;
  started_at: string;
  completed_at: string | null;
  last_workout_id: string | null;
  last_workout_at: string | null;
}
