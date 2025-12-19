/**
 * Programs Store (Zustand)
 *
 * Central state management for workout programs and templates.
 * Fetches from Supabase and provides CRUD operations.
 * Supports offline-first local template saving.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_TEMPLATES_KEY = 'fortis_local_templates';
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
  createWorkoutTemplate: (
    name: string,
    exercises: Array<{
      exerciseId: string;
      exerciseName?: string;
      sets: number;
      reps: string;
      restSeconds?: number;
    }>
  ) => Promise<string | null>;
  updateLastPerformed: (id: string) => Promise<void>;
  clearError: () => void;

  // Local persistence
  loadLocalPrograms: () => Promise<void>;
  persistLocalPrograms: () => Promise<void>;
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
    isTemplate: dto.is_template ?? false,
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

  // Fetch all programs for current user (includes local templates)
  fetchPrograms: async () => {
    set({ isLoading: true, error: null });

    // Always load local programs first
    await get().loadLocalPrograms();

    if (!isSupabaseConfigured()) {
      // If Supabase not configured, just use local programs
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Keep local programs when not authenticated
        set({ isLoading: false });
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

      // Merge Supabase programs with local programs
      set((state) => {
        const localPrograms = state.programs.filter((p) => p.id.startsWith('local-'));
        return { programs: [...programs, ...localPrograms], isLoading: false };
      });
    } catch (err) {
      console.error('Error fetching programs:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch programs',
        isLoading: false,
      });
    }
  },

  // Delete a program (handles both Supabase and local programs)
  deleteProgram: async (id: string) => {
    set({ isDeleting: true, error: null });

    // Handle local programs (delete from AsyncStorage only)
    if (id.startsWith('local-')) {
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        isDeleting: false,
      }));
      get().persistLocalPrograms();
      return true;
    }

    // Handle Supabase programs
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

  // Create a new workout template (saved as a single-workout program)
  // Falls back to local storage if Supabase is unavailable
  createWorkoutTemplate: async (name, exercises) => {
    // Helper to save locally
    const saveLocally = () => {
      const localId = `local-${Date.now()}`;
      const now = new Date().toISOString();

      // Create a proper Program object with workouts array
      const localProgram: Program = {
        id: localId,
        name,
        description: null,
        difficulty: 'intermediate',
        goal: null,
        durationWeeks: null,
        isPublic: false,
        isDefault: false,
        isAiCreated: false,
        isTemplate: true,
        lastPerformedAt: null,
        createdBy: 'local',
        createdAt: now,
        updatedAt: now,
        workouts: [{
          id: `${localId}-workout`,
          name,
          dayNumber: 1,
          exercises: exercises.map((ex, index) => ({
            id: `${localId}-ex-${index}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName || 'Unknown Exercise',
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds || 120,
            notes: null,
            orderIndex: index,
          })),
        }],
      };

      // Add to store and persist
      set((state) => ({
        programs: [localProgram, ...state.programs],
      }));
      get().persistLocalPrograms();

      return localId;
    };

    // Try Supabase first if configured
    if (!isSupabaseConfigured()) {
      // Save locally when Supabase is not configured
      return saveLocally();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Save locally when not authenticated
        return saveLocally();
      }

      // Create program container for the template
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name,
          difficulty: 'intermediate',
          is_public: false,
          is_default: false,
          is_ai_created: false,
          is_template: true,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (programError || !program) {
        set({ error: programError?.message || 'Failed to create template' });
        return null;
      }

      // Create single workout entry
      const { data: workout, error: workoutError } = await supabase
        .from('program_workouts')
        .insert({
          program_id: program.id,
          name,
          day_number: 1,
        })
        .select()
        .single();

      if (workoutError || !workout) {
        // Cleanup: delete the program if workout creation fails
        await supabase.from('workout_programs').delete().eq('id', program.id);
        set({ error: workoutError?.message || 'Failed to create workout' });
        return null;
      }

      // Insert exercises
      if (exercises.length > 0) {
        const exercisesToInsert = exercises.map((ex, index) => ({
          program_workout_id: workout.id,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds || 120,
          order_index: index,
        }));

        const { error: exercisesError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.error('Error inserting exercises:', exercisesError);
          // Don't fail completely - template is still created
        }
      }

      // Refresh programs list to include the new template
      get().fetchPrograms();

      return program.id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create template',
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

  // Load local programs from AsyncStorage
  loadLocalPrograms: async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_TEMPLATES_KEY);
      if (stored) {
        const localPrograms = JSON.parse(stored) as Program[];
        // Merge with existing programs (avoid duplicates)
        set((state) => {
          const existingIds = new Set(state.programs.map((p) => p.id));
          const newLocalPrograms = localPrograms.filter((p) => !existingIds.has(p.id));
          return { programs: [...state.programs, ...newLocalPrograms] };
        });
      }
    } catch (err) {
      console.warn('Failed to load local programs:', err);
    }
  },

  // Persist local programs to AsyncStorage
  persistLocalPrograms: async () => {
    try {
      const { programs } = get();
      // Only persist programs with local IDs (not synced to Supabase)
      const localPrograms = programs.filter((p) => p.id.startsWith('local-'));
      await AsyncStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(localPrograms));
    } catch (err) {
      console.warn('Failed to persist local programs:', err);
    }
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

/**
 * Select workout templates (single-workout programs marked as templates)
 */
export const selectTemplates = (state: ProgramsState) =>
  state.programs.filter((p) => p.isTemplate);

/**
 * Select multi-week programs (not templates)
 */
export const selectPrograms = (state: ProgramsState) =>
  state.programs.filter((p) => !p.isTemplate);
