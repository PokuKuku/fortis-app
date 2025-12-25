/**
 * Program & Workout Hub Types
 *
 * TypeScript interfaces for the program/workout detail hub screens.
 * These types support the hub UI with exercise lists and statistics.
 */

// Difficulty levels for programs
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Program goals
export type ProgramGoal = 'strength' | 'hypertrophy' | 'powerlifting' | 'general_fitness';

/**
 * Chart data point for statistics visualization
 */
export interface ChartDataPoint {
  date: string;       // ISO date string
  value: number;
}

/**
 * Statistics for programs/workouts
 */
export interface HubStats {
  timesCompleted: number;
  volumeHistory: ChartDataPoint[];
  repsHistory: ChartDataPoint[];
  durationHistory: ChartDataPoint[];  // in seconds
}

/**
 * Exercise within a program workout template
 */
export interface ProgramExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  targetSets: number;
  targetReps: string;       // e.g., "8-12" or "5"
  restSeconds?: number;
  notes?: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  images: string[];
}

/**
 * Workout within a program (e.g., "Day 1: Push")
 */
export interface ProgramWorkout {
  id: string;
  name: string;
  description?: string;
  dayNumber: number;
  exercises: ProgramExercise[];
}

/**
 * Full program detail for hub screen
 */
export interface ProgramDetail {
  id: string;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  durationWeeks: number;
  goal?: ProgramGoal;
  createdBy?: string;
  isPublic: boolean;
  workouts: ProgramWorkout[];
  stats: HubStats;
  lastPerformed?: string;
}

/**
 * Exercise within a standalone workout template
 */
export interface WorkoutExerciseDetail {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  targetSets: number;
  targetReps: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  images: string[];
}

/**
 * Full workout detail for hub screen
 */
export interface WorkoutDetail {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExerciseDetail[];
  stats: HubStats;
  lastPerformed?: string;
}

/**
 * Tab types for stats section
 */
export type StatsTabType = 'Volume' | 'Reps' | 'Duration';
