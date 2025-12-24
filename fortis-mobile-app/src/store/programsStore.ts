/**
 * Programs Store (Zustand)
 *
 * Central state management for workout programs and templates.
 * Fetches from Supabase and provides CRUD operations.
 * Supports offline-first local template saving with cloud sync.
 */
import { create } from 'zustand';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { syncLocalProgram, processPendingProgramQueue, removeFromPendingQueue } from '../services/programSyncService';
import { getDefaultPrograms, getDefaultTemplates } from '../data/defaultPrograms';
import { isLocalProgramId } from '../utils/localIds';

import {
  Program,
  ProgramDTO,
  ProgramWorkout,
  ProgramWorkoutDTO,
  ProgramExercise,
  ProgramExerciseDTO,
  TemplateSetDetail,
} from '../types/workout';
import { LOCAL_TEMPLATES_KEY } from '../constants/storageKeys';

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
      setDetails?: TemplateSetDetail[];
    }>
  ) => Promise<string | null>;
  createProgram: (
    name: string,
    workouts: Array<{
      name: string;
      exercises: Array<{
        exerciseId: string;
        exerciseName?: string;
        sets: number;
        reps: string;
        restSeconds?: number;
      }>;
    }>,
    options?: {
      description?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    }
  ) => Promise<string | null>;
  updateWorkoutTemplate: (
    templateId: string,
    name: string,
    exercises: Array<{
      exerciseId: string;
      exerciseName?: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      setDetails?: TemplateSetDetail[];
    }>
  ) => Promise<string | null>;
  updateLastPerformed: (id: string) => Promise<void>;
  clearError: () => void;

  // Local persistence
  loadLocalPrograms: () => Promise<void>;
  persistLocalPrograms: () => Promise<void>;
  resetStore: () => void;

  // Cloud sync
  syncPendingPrograms: () => Promise<void>;
  replaceLocalIdWithServerId: (localId: string, serverId: string) => void;
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

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const hasLocalExerciseIds = (
  exercises: Array<{ exerciseId: string }>
): boolean => exercises.some(ex => !isValidUUID(ex.exerciseId));

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
    // Always load local programs first (fast)
    await get().loadLocalPrograms();

    if (!isSupabaseConfigured()) {
      // If Supabase not configured, just use local programs
      return;
    }

    // Set loading only after local data is loaded
    set({ isLoading: true, error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Keep local programs when not authenticated
        set({ isLoading: false });
        return;
      }

      // Fetch programs with nested workouts and exercises (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const { data, error } = await supabase
        .from('workout_programs')
        .select(`
          *,
          program_workouts (
            *,
            program_exercises (*)
          )
        `)
        .or(`created_by.eq.${session.user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

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
  const localPrograms = state.programs.filter((p) => isLocalProgramId(p.id));
        return { programs: [...programs, ...localPrograms], isLoading: false };
      });
    } catch (err: any) {
      // Don't show error for timeout/abort - just stop loading
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn('Programs fetch timed out');
        set({ isLoading: false });
        return;
      }
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
    if (isLocalProgramId(id)) {
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        isDeleting: false,
      }));
      get().persistLocalPrograms();

      // Also remove from pending sync queue to prevent resurrection
      removeFromPendingQueue(id).catch(err => {
        console.warn('Failed to remove from pending queue:', err);
      });

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
    // Helper to save locally and attempt cloud sync
    const saveLocally = async () => {
      const localId = `local-${Date.now()}`;
      const now = new Date().toISOString();

      // Create a proper Program object with workouts array
      const localProgram: Program = {
        id: localId,
        name,
        description: undefined,
        difficulty: 'intermediate',
        goal: undefined,
        durationWeeks: undefined,
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
            notes: undefined,
            orderIndex: index,
            setDetails: ex.setDetails,
          })),
        }],
      };

      // Add to store and persist locally
      set((state) => ({
        programs: [localProgram, ...state.programs],
      }));
      get().persistLocalPrograms();

      // Attempt cloud sync in background (don't await, don't block)
      syncLocalProgram(localProgram).then((result) => {
        if (result.success && result.serverId) {
          // Check if program still exists (wasn't deleted during sync)
          const stillExists = get().programs.some(p => p.id === localId);
          if (stillExists) {
            // Replace local ID with server ID
            get().replaceLocalIdWithServerId(localId, result.serverId);
          } else {
            // Program was deleted during sync - clean up from Supabase
            supabase
              .from('workout_programs')
              .delete()
              .eq('id', result.serverId)
              .then(() => console.log('Cleaned up orphaned synced program'))
              .catch(err => console.warn('Failed to clean up orphaned program:', err));
          }
        }
      }).catch((err) => {
        console.warn('Background program sync failed:', err);
      });

      return localId;
    };

    // Check if any exercises have non-UUID IDs (local exercises)
    const hasLocalExercises = hasLocalExerciseIds(exercises);

    // Try Supabase first if configured
    if (!isSupabaseConfigured()) {
      // Save locally when Supabase is not configured
      return await saveLocally();
    }

    // If exercises have local (non-UUID) IDs, save locally
    if (hasLocalExercises) {
      return await saveLocally();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Save locally when not authenticated
        return await saveLocally();
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

  updateWorkoutTemplate: async (templateId, name, exercises) => {
    set({ error: null });

    const template = get().programs.find(p => p.id === templateId && p.isTemplate);
    if (!template) {
      set({ error: 'Template not found' });
      return null;
    }

    const workout = template.workouts[0];
    if (!workout) {
      set({ error: 'Template workout not found' });
      return null;
    }

    const now = new Date().toISOString();
    const workoutId = workout.id || `${templateId}-workout`;

    const buildExercises = (idsByOrder?: Map<number, string>) => exercises.map((ex, index) => ({
      id: idsByOrder?.get(index)
        || (isLocalProgramId(templateId)
          ? `${templateId}-ex-${index}`
          : `${workoutId}-ex-${index}`),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName || 'Unknown Exercise',
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds ?? 120,
      notes: undefined,
      orderIndex: index,
      setDetails: ex.setDetails,
    }));

    const applyLocalUpdate = (idsByOrder?: Map<number, string>) => {
      const updatedProgram: Program = {
        ...template,
        name,
        updatedAt: now,
        workouts: [{
          ...workout,
          id: workoutId,
          name,
          exercises: buildExercises(idsByOrder),
        }],
      };

      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === templateId ? updatedProgram : p
        ),
      }));

      return updatedProgram;
    };

    const hasLocalExercises = hasLocalExerciseIds(exercises);

    if (isLocalProgramId(templateId) || hasLocalExercises || !isSupabaseConfigured()) {
      const updatedProgram = applyLocalUpdate();

      if (isLocalProgramId(templateId)) {
        get().persistLocalPrograms();
        await removeFromPendingQueue(templateId);

        // Attempt cloud sync in background (don't await, don't block)
        syncLocalProgram(updatedProgram).then((result) => {
          if (result.success && result.serverId) {
            const stillExists = get().programs.some(p => p.id === templateId);
            if (stillExists) {
              get().replaceLocalIdWithServerId(templateId, result.serverId);
            }
          }
        }).catch((err) => {
          console.warn('Background program sync failed:', err);
        });
      }

      return templateId;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        applyLocalUpdate();
        return templateId;
      }

      const { error: programError } = await supabase
        .from('workout_programs')
        .update({ name, updated_at: now })
        .eq('id', templateId);

      if (programError) {
        set({ error: programError.message });
        return null;
      }

      const { error: workoutError } = await supabase
        .from('program_workouts')
        .update({ name, day_number: workout.dayNumber ?? 1 })
        .eq('id', workoutId);

      if (workoutError) {
        set({ error: workoutError.message });
        return null;
      }

      const { error: deleteError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('program_workout_id', workoutId);

      if (deleteError) {
        set({ error: deleteError.message });
        return null;
      }

      let idsByOrder: Map<number, string> | undefined;
      if (exercises.length > 0) {
        const exercisesToInsert = exercises.map((ex, index) => ({
          program_workout_id: workoutId,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds ?? 120,
          order_index: index,
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert)
          .select();

        if (insertError) {
          console.error('Error inserting exercises:', insertError);
          set({ error: insertError.message });
          return null;
        }

        if (inserted) {
          idsByOrder = new Map(
            inserted.map((ex: { id: string; order_index: number }) => [ex.order_index, ex.id])
          );
        }
      }

      applyLocalUpdate(idsByOrder);
      return templateId;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update template',
      });
      return null;
    }
  },

  // Update last performed timestamp
  updateLastPerformed: async (id: string) => {
    // Skip Supabase update for local templates (they don't exist in the database yet)
    if (!isLocalProgramId(id)) {
      try {
        const { error } = await supabase
          .from('workout_programs')
          .update({ last_performed_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Error updating last performed:', error);
        }
      } catch (err) {
        console.error('Error updating last performed:', err);
      }
    }

    // Always update local state
    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === id ? { ...p, lastPerformedAt: new Date().toISOString() } : p
      ),
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Load local programs from AsyncStorage
  loadLocalPrograms: async () => {
    try {
      const stored = await getScopedItem(LOCAL_TEMPLATES_KEY);
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
      const localPrograms = programs.filter((p) => isLocalProgramId(p.id));
      await setScopedItem(LOCAL_TEMPLATES_KEY, JSON.stringify(localPrograms));
    } catch (err) {
      console.warn('Failed to persist local programs:', err);
    }
  },

  // Process pending program sync queue (called on sign-in or when coming online)
  syncPendingPrograms: async () => {
    try {
      const result = await processPendingProgramQueue();

      // Update local IDs with server IDs for successfully synced programs
      for (const [localId, serverId] of result.idMappings) {
        get().replaceLocalIdWithServerId(localId, serverId);
      }

      if (result.processed > 0) {
        console.log(`Synced ${result.processed} programs to cloud`);
      }
    } catch (err) {
      console.warn('Failed to sync pending programs:', err);
    }
  },

  // Replace a local program ID with server-assigned ID after successful sync
  replaceLocalIdWithServerId: (localId: string, serverId: string) => {
    set((state) => ({
      programs: state.programs.map((p) => {
        if (p.id === localId) {
          // Create new program with server ID
          return {
            ...p,
            id: serverId,
            // Also update workout IDs if they contain the local ID
            workouts: p.workouts.map((w) => ({
              ...w,
              id: w.id.replace(localId, serverId),
              exercises: w.exercises.map((ex) => ({
                ...ex,
                id: ex.id.replace(localId, serverId),
              })),
            })),
          };
        }
        return p;
      }),
    }));
    // Re-persist to remove from local storage (no longer has local- prefix)
    get().persistLocalPrograms();
  },

  resetStore: () => {
    set({
      programs: [],
      isLoading: false,
      isDeleting: false,
      error: null,
    });
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
