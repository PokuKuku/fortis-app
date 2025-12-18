/**
 * Programs Store (Zustand)
 *
 * Central state management for workout programs and templates.
 * Fetches from Supabase and provides CRUD operations.
 */
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Program,
  ProgramDTO,
  ProgramWorkout,
  ProgramWorkoutDTO,
  ProgramExercise,
  ProgramExerciseDTO,
} from '../types/workout';

interface ProgramsState {
  // Data
  programs: Program[];

  // Loading states
  isLoading: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchPrograms: () => Promise<void>;
  deleteProgram: (id: string) => Promise<boolean>;
  duplicateProgram: (id: string) => Promise<string | null>;
  updateLastPerformed: (id: string) => Promise<void>;
  clearError: () => void;
}

// ============================================
// DTO Mappers
// ============================================

function mapExerciseFromDTO(dto: ProgramExerciseDTO): ProgramExercise {
  return {
    id: dto.id,
    exerciseId: dto.exercise_id,
    exerciseName: '', // Will be populated from join or cache
    sets: dto.sets,
    reps: dto.reps,
    restSeconds: dto.rest_seconds,
    notes: dto.notes,
    orderIndex: dto.order_index,
  };
}

function mapWorkoutFromDTO(dto: ProgramWorkoutDTO): ProgramWorkout {
  return {
    id: dto.id,
    name: dto.name,
    dayNumber: dto.day_number,
    exercises: (dto.program_exercises || []).map(mapExerciseFromDTO),
  };
}

function mapProgramFromDTO(dto: ProgramDTO): Program {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    difficulty: dto.difficulty,
    goal: dto.goal,
    durationWeeks: dto.duration_weeks,
    isPublic: dto.is_public,
    isDefault: dto.is_default,
    isAiCreated: dto.is_ai_created ?? false,
    lastPerformedAt: dto.last_performed_at,
    createdBy: dto.created_by,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    workouts: (dto.program_workouts || []).map(mapWorkoutFromDTO),
  };
}

// ============================================
// Store
// ============================================

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  // Initial state
  programs: [],
  isLoading: false,
  isDeleting: false,
  error: null,

  // Fetch all programs for current user
  fetchPrograms: async () => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase is not configured' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ programs: [], isLoading: false });
        return;
      }

      // Fetch programs with nested workouts and exercises
      const { data, error } = await supabase
        .from('workout_programs')
        .select(`
          *,
          program_workouts (
            *,
            program_exercises (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching programs:', error);
        set({ error: error.message, isLoading: false });
        return;
      }

      const programs = (data as ProgramDTO[]).map(mapProgramFromDTO);

      // Fetch exercise names for each program
      const exerciseIds = new Set<string>();
      programs.forEach((program) => {
        program.workouts.forEach((workout) => {
          workout.exercises.forEach((exercise) => {
            exerciseIds.add(exercise.exerciseId);
          });
        });
      });

      if (exerciseIds.size > 0) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id, name')
          .in('id', Array.from(exerciseIds));

        const exerciseMap = new Map(
          (exercises || []).map((e: { id: string; name: string }) => [e.id, e.name])
        );

        // Populate exercise names
        programs.forEach((program) => {
          program.workouts.forEach((workout) => {
            workout.exercises.forEach((exercise) => {
              exercise.exerciseName = exerciseMap.get(exercise.exerciseId) || 'Unknown Exercise';
            });
          });
        });
      }

      set({ programs, isLoading: false });
    } catch (err) {
      console.error('Error fetching programs:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch programs',
        isLoading: false,
      });
    }
  },

  // Delete a program
  deleteProgram: async (id: string) => {
    set({ isDeleting: true, error: null });

    try {
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, isDeleting: false });
        return false;
      }

      // Remove from local state
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        isDeleting: false,
      }));

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete program',
        isDeleting: false,
      });
      return false;
    }
  },

  // Duplicate a program
  duplicateProgram: async (id: string) => {
    const { programs } = get();
    const original = programs.find((p) => p.id === id);
    if (!original) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Create new program
      const { data: newProgram, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          difficulty: original.difficulty,
          goal: original.goal,
          duration_weeks: original.durationWeeks,
          is_public: false,
          is_default: false,
          is_ai_created: false,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (programError || !newProgram) {
        set({ error: programError?.message || 'Failed to duplicate program' });
        return null;
      }

      // Duplicate workouts and exercises
      for (const workout of original.workouts) {
        const { data: newWorkout, error: workoutError } = await supabase
          .from('program_workouts')
          .insert({
            program_id: newProgram.id,
            name: workout.name,
            day_number: workout.dayNumber,
          })
          .select()
          .single();

        if (workoutError || !newWorkout) continue;

        // Duplicate exercises
        const exercisesToInsert = workout.exercises.map((ex) => ({
          program_workout_id: newWorkout.id,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds,
          notes: ex.notes,
          order_index: ex.orderIndex,
        }));

        if (exercisesToInsert.length > 0) {
          await supabase.from('program_exercises').insert(exercisesToInsert);
        }
      }

      // Refresh programs list
      get().fetchPrograms();

      return newProgram.id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to duplicate program',
      });
      return null;
    }
  },

  // Update last performed timestamp
  updateLastPerformed: async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .update({ last_performed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating last performed:', error);
        return;
      }

      // Update local state
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === id ? { ...p, lastPerformedAt: new Date().toISOString() } : p
        ),
      }));
    } catch (err) {
      console.error('Error updating last performed:', err);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// ============================================
// Selectors
// ============================================

/**
 * Select AI-created programs
 */
export const selectAiPrograms = (state: ProgramsState) =>
  state.programs.filter((p) => p.isAiCreated);

/**
 * Select user-created (non-AI) programs
 */
export const selectUserPrograms = (state: ProgramsState) =>
  state.programs.filter((p) => !p.isAiCreated);

/**
 * Select recently used programs (last 30 days)
 */
export const selectRecentPrograms = (state: ProgramsState) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return state.programs.filter(
    (p) => p.lastPerformedAt && new Date(p.lastPerformedAt) > thirtyDaysAgo
  );
};
