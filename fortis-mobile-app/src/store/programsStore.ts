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
import { useProgramProgressStore } from './programProgressStore';
import { useStartPresetStore } from './startPresetStore';

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
import { MAX_WORKOUTS_PER_PROGRAM } from '../constants/programs';

interface ProgramsState {
  // Data
  programs: Program[];

  // Loading states
  isLoading: boolean;
  isDeleting: boolean;
  hasFetchedPrograms: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchPrograms: (options?: { force?: boolean }) => Promise<void>;
  deleteProgram: (id: string) => Promise<boolean>;
  duplicateProgram: (id: string) => Promise<string | null>;
  duplicateWorkoutTemplate: (id: string) => Promise<string | null>;
  appendTemplateToProgram: (programId: string, templateId: string) => Promise<boolean>;
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
      templateId: string;
      name?: string;
    }>,
    options?: {
      description?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      goal?: 'strength' | 'hypertrophy' | 'powerlifting' | 'general_fitness';
      durationWeeks?: number;
    }
  ) => Promise<string | null>;
  updateProgram: (
    programId: string,
    name: string,
    workouts: Array<{
      templateId: string;
      name?: string;
      workoutId?: string;
    }>,
    options?: {
      description?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      goal?: 'strength' | 'hypertrophy' | 'powerlifting' | 'general_fitness';
      durationWeeks?: number;
    }
  ) => Promise<string | null>;
  removeWorkoutFromProgram: (programId: string, workoutId: string) => Promise<boolean>;
  removeExerciseFromProgramWorkout: (
    programId: string,
    workoutId: string,
    exerciseId: string
  ) => Promise<boolean>;
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

const normalizeExerciseKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

const resolveExerciseIdMap = async (
  exercises: Array<{ exerciseId: string; exerciseName?: string | null }>
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();
  const slugKeys = new Set<string>();
  const nameKeys = new Set<string>();

  exercises.forEach((ex) => {
    if (isValidUUID(ex.exerciseId)) {
      map.set(ex.exerciseId, ex.exerciseId);
      return;
    }
    slugKeys.add(ex.exerciseId);
    if (ex.exerciseName) {
      nameKeys.add(ex.exerciseName);
    }
  });

  if (slugKeys.size === 0 && nameKeys.size === 0) {
    return map;
  }

  const [slugResult, nameResult] = await Promise.all([
    slugKeys.size > 0
      ? supabase
          .from('exercises')
          .select('id, slug, name')
          .in('slug', Array.from(slugKeys))
      : Promise.resolve({ data: [], error: null }),
    nameKeys.size > 0
      ? supabase
          .from('exercises')
          .select('id, slug, name')
          .in('name', Array.from(nameKeys))
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (slugResult.error) {
    throw new Error(slugResult.error.message);
  }
  if (nameResult.error) {
    throw new Error(nameResult.error.message);
  }

  const rows = [...(slugResult.data || []), ...(nameResult.data || [])];
  rows.forEach((row: { id: string; slug?: string | null; name?: string | null }) => {
    if (row.slug) {
      map.set(row.slug, row.id);
    }
    if (row.name) {
      map.set(normalizeExerciseKey(row.name), row.id);
    }
  });

  return map;
};

const resolveExerciseIdsForSupabase = async <
  T extends { exerciseId: string; exerciseName?: string | null }
>(
  exercises: T[]
): Promise<Array<T & { resolvedExerciseId: string }>> => {
  if (exercises.length === 0) return [];
  const idMap = await resolveExerciseIdMap(exercises);

  return exercises.map((exercise) => {
    const resolvedId = isValidUUID(exercise.exerciseId)
      ? exercise.exerciseId
      : idMap.get(exercise.exerciseId) ||
        (exercise.exerciseName ? idMap.get(normalizeExerciseKey(exercise.exerciseName)) : null);

    if (!resolvedId) {
      throw new Error(`Unable to resolve exercise: ${exercise.exerciseName || exercise.exerciseId}`);
    }

    return { ...exercise, resolvedExerciseId: resolvedId };
  });
};

const hasLocalExerciseIds = (
  exercises: Array<{ exerciseId: string }>
): boolean =>
  exercises.some(
    (ex) =>
      ex.exerciseId.startsWith('custom-') ||
      ex.exerciseId.startsWith('local-') ||
      ex.exerciseId.trim().length === 0
  );

const buildProgramWorkoutFromTemplate = (
  template: Program,
  dayNumber: number,
  nameOverride?: string,
  workoutId?: string
): ProgramWorkout => {
  const sourceWorkout = template.workouts[0];
  const resolvedWorkoutId = workoutId || `${template.id}-day-${dayNumber}-${Date.now()}`;
  const workoutName = nameOverride?.trim() || sourceWorkout?.name || template.name;

  return {
    id: resolvedWorkoutId,
    name: workoutName,
    dayNumber,
    exercises: (sourceWorkout?.exercises || []).map((exercise, index) => ({
      id: `${resolvedWorkoutId}-ex-${index + 1}`,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
      orderIndex: index,
    })),
  };
};

// ============================================
// Store
// ============================================

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  // Initial state
  programs: [],
  isLoading: false,
  isDeleting: false,
  hasFetchedPrograms: false,
  error: null,

  // Fetch all programs for current user (includes local templates)
  fetchPrograms: async (options) => {
    const { isLoading, hasFetchedPrograms } = get();
    const shouldForce = options?.force === true;
    if (isLoading) return;
    if (hasFetchedPrograms && !shouldForce) return;

    // Lock fetch early to prevent duplicate calls in quick succession.
    set({ isLoading: true, error: null });

    // Always load local programs first (fast)
    await get().loadLocalPrograms();

    if (!isSupabaseConfigured()) {
      // If Supabase not configured, just use local programs
      set({ isLoading: false, hasFetchedPrograms: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Keep local programs when not authenticated
        set({ isLoading: false, hasFetchedPrograms: true });
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
        set({ error: error.message, isLoading: false, hasFetchedPrograms: true });
        return;
      }

      const programs = (data as ProgramDTO[]).map(mapProgramFromDTO);
      const hasServerDefaults = programs.some((program) => program.isDefault);

      // Fetch exercise names for each program
      const exerciseIds = new Set<string>();
      programs.forEach((program) => {
        program.workouts.forEach((workout) => {
          workout.exercises.forEach((exercise) => {
            exerciseIds.add(exercise.exerciseId);
          });
        });
      });

      const uuidExerciseIds = Array.from(exerciseIds).filter(isValidUUID);
      if (uuidExerciseIds.length > 0) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id, name')
          .in('id', uuidExerciseIds);

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
        const filteredLocalPrograms = hasServerDefaults
          ? localPrograms.filter((p) => p.isTemplate || !p.isDefault)
          : localPrograms;
        return {
          programs: [...programs, ...filteredLocalPrograms],
          isLoading: false,
          hasFetchedPrograms: true,
        };
      });
    } catch (err: any) {
      // Don't show error for timeout/abort - just stop loading
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn('Programs fetch timed out');
        set({ isLoading: false, hasFetchedPrograms: true });
        return;
      }
      console.error('Error fetching programs:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch programs',
        isLoading: false,
        hasFetchedPrograms: true,
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
        const resolvedExercises = await resolveExerciseIdsForSupabase(workout.exercises);
        const exercisesToInsert = resolvedExercises.map((ex) => ({
          program_workout_id: newWorkout.id,
          exercise_id: ex.resolvedExerciseId,
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
      get().fetchPrograms({ force: true });

      return newProgram.id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to duplicate program',
      });
      return null;
    }
  },

  duplicateWorkoutTemplate: async (id: string) => {
    const { programs } = get();
    const template = programs.find((p) => p.id === id && p.isTemplate);
    const workout = template?.workouts[0];
    if (!template || !workout) return null;

    const sortedExercises = [...workout.exercises].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
    );
    const exercises = sortedExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: exercise.restSeconds,
      setDetails: exercise.setDetails,
    }));

    return get().createWorkoutTemplate(`${template.name} (Copy)`, exercises);
  },

  appendTemplateToProgram: async (programId, templateId) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return false;
    }

    const template = get().programs.find((p) => p.id === templateId && p.isTemplate);
    const templateWorkout = template?.workouts[0];
    if (!template || !templateWorkout) {
      set({ error: 'Template not found' });
      return false;
    }

    if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      set({ error: `Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts` });
      return false;
    }

    const hasLocalExercises = hasLocalExerciseIds(templateWorkout.exercises || []);
    const now = new Date().toISOString();
    const nextDayNumber = program.workouts.length + 1;

    const applyLocalUpdate = (workoutId?: string) => {
      const appendedWorkout = buildProgramWorkoutFromTemplate(
        template,
        nextDayNumber,
        template.name,
        workoutId
      );
      const updatedProgram: Program = {
        ...program,
        updatedAt: now,
        workouts: [...program.workouts, appendedWorkout],
      };

      set((state) => ({
        programs: state.programs.map((p) => (p.id === programId ? updatedProgram : p)),
      }));

      return updatedProgram;
    };

    if (isLocalProgramId(programId) || hasLocalExercises || !isSupabaseConfigured()) {
      const updatedProgram = applyLocalUpdate();

      if (isLocalProgramId(programId)) {
        get().persistLocalPrograms();
        syncLocalProgram(updatedProgram).catch((err) => {
          console.warn('Background program sync failed:', err);
        });
      } else {
        get().persistLocalPrograms();
      }

      return true;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        applyLocalUpdate();
        return true;
      }

      const { error: programError } = await supabase
        .from('workout_programs')
        .update({ updated_at: now })
        .eq('id', programId);

      if (programError) {
        set({ error: programError.message });
        return false;
      }

      const { data: workout, error: workoutError } = await supabase
        .from('program_workouts')
        .insert({
          program_id: programId,
          name: template.name,
          day_number: nextDayNumber,
        })
        .select()
        .single();

      if (workoutError || !workout) {
        set({ error: workoutError?.message || 'Failed to add workout' });
        return false;
      }

      if (templateWorkout.exercises.length > 0) {
        const resolvedExercises = await resolveExerciseIdsForSupabase(templateWorkout.exercises);
        const exercisesToInsert = resolvedExercises.map((exercise, index) => ({
          program_workout_id: workout.id,
          exercise_id: exercise.resolvedExerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds ?? 120,
          notes: exercise.notes,
          order_index: index,
        }));

        const { error: insertError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);

        if (insertError) {
          set({ error: insertError.message });
          return false;
        }
      }

      applyLocalUpdate(workout.id);
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add workout',
      });
      return false;
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
        const resolvedExercises = await resolveExerciseIdsForSupabase(exercises);
        const exercisesToInsert = resolvedExercises.map((ex, index) => ({
          program_workout_id: workout.id,
          exercise_id: ex.resolvedExerciseId,
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

      const createdTemplate: Program = {
        id: program.id,
        name: program.name,
        description: program.description ?? undefined,
        difficulty: program.difficulty,
        goal: program.goal ?? undefined,
        durationWeeks: program.duration_weeks ?? undefined,
        isPublic: program.is_public,
        isDefault: program.is_default,
        isAiCreated: program.is_ai_created ?? false,
        isTemplate: program.is_template ?? true,
        lastPerformedAt: program.last_performed_at,
        createdBy: program.created_by,
        createdAt: program.created_at,
        updatedAt: program.updated_at,
        workouts: [{
          id: workout.id,
          name: workout.name,
          dayNumber: workout.day_number,
          exercises: exercises.map((ex, index) => ({
            id: `${workout.id}-ex-${index + 1}`,
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

      set((state) => {
        if (state.programs.some((p) => p.id === program.id)) {
          return state;
        }
        return { programs: [createdTemplate, ...state.programs] };
      });

      // Refresh programs list to include the new template
      get().fetchPrograms({ force: true });

      return program.id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create template',
      });
      return null;
    }
  },

  // Create a new program from existing workout templates
  createProgram: async (name, workouts, options) => {
    set({ error: null });

    if (workouts.length === 0) {
      set({ error: 'Program must include at least one workout' });
      return null;
    }

    if (workouts.length > MAX_WORKOUTS_PER_PROGRAM) {
      set({ error: `Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts` });
      return null;
    }

    const templates = workouts.map((workout) => {
      const template = get().programs.find(
        (program) => program.id === workout.templateId && program.isTemplate
      );
      return { template, nameOverride: workout.name };
    });

    if (templates.some((entry) => !entry.template || !entry.template?.workouts[0])) {
      set({ error: 'One or more templates could not be found' });
      return null;
    }

    const hasLocalExercises = templates.some((entry) =>
      hasLocalExerciseIds(entry.template?.workouts[0].exercises || [])
    );

    const saveLocally = async () => {
      const localId = `local-${Date.now()}`;
      const now = new Date().toISOString();

      const programWorkouts = templates.map((entry, index) =>
        buildProgramWorkoutFromTemplate(
          entry.template as Program,
          index + 1,
          entry.nameOverride,
          `${localId}-day-${index + 1}`
        )
      );

      const localProgram: Program = {
        id: localId,
        name,
        description: options?.description,
        difficulty: options?.difficulty ?? 'intermediate',
        goal: options?.goal,
        durationWeeks: options?.durationWeeks,
        isPublic: false,
        isDefault: false,
        isAiCreated: false,
        isTemplate: false,
        lastPerformedAt: null,
        createdBy: 'local',
        createdAt: now,
        updatedAt: now,
        workouts: programWorkouts,
      };

      set((state) => ({
        programs: [localProgram, ...state.programs],
      }));
      get().persistLocalPrograms();

      if (!hasLocalExercises) {
        syncLocalProgram(localProgram)
          .then((result) => {
            if (result.success && result.serverId) {
              const stillExists = get().programs.some((p) => p.id === localId);
              if (stillExists) {
                get().replaceLocalIdWithServerId(localId, result.serverId);
              }
            }
          })
          .catch((err) => {
            console.warn('Background program sync failed:', err);
          });
      }

      return localId;
    };

    if (!isSupabaseConfigured() || hasLocalExercises) {
      return await saveLocally();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return await saveLocally();
      }

      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name,
          description: options?.description,
          difficulty: options?.difficulty ?? 'intermediate',
          goal: options?.goal,
          duration_weeks: options?.durationWeeks,
          is_public: false,
          is_default: false,
          is_ai_created: false,
          is_template: false,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (programError || !program) {
        set({ error: programError?.message || 'Failed to create program' });
        return null;
      }

      for (let index = 0; index < templates.length; index += 1) {
        const entry = templates[index];
        const template = entry.template as Program;
        const dayNumber = index + 1;
        const workoutName = entry.nameOverride?.trim() || template.workouts[0]?.name || template.name;

        const { data: workout, error: workoutError } = await supabase
          .from('program_workouts')
          .insert({
            program_id: program.id,
            name: workoutName,
            day_number: dayNumber,
          })
          .select()
          .single();

        if (workoutError || !workout) {
          await supabase.from('workout_programs').delete().eq('id', program.id);
          set({ error: workoutError?.message || 'Failed to create program workouts' });
          return null;
        }

        const exercises = template.workouts[0]?.exercises || [];
        if (exercises.length > 0) {
          const resolvedExercises = await resolveExerciseIdsForSupabase(exercises);
          const exercisesToInsert = resolvedExercises.map((exercise, exerciseIndex) => ({
            program_workout_id: workout.id,
            exercise_id: exercise.resolvedExerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.restSeconds ?? 120,
            notes: exercise.notes,
            order_index: exerciseIndex,
          }));

          const { error: exercisesError } = await supabase
            .from('program_exercises')
            .insert(exercisesToInsert);

          if (exercisesError) {
            console.warn('Failed to insert program exercises:', exercisesError);
          }
        }
      }

      get().fetchPrograms({ force: true });
      return program.id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create program',
      });
      return null;
    }
  },

  updateProgram: async (programId, name, workouts, options) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return null;
    }

    if (workouts.length === 0) {
      set({ error: 'Program must include at least one workout' });
      return null;
    }

    if (workouts.length > MAX_WORKOUTS_PER_PROGRAM) {
      set({ error: `Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts` });
      return null;
    }

    const templates = workouts.map((workout) => {
      const template = get().programs.find(
        (candidate) => candidate.id === workout.templateId && candidate.isTemplate
      );
      return { template, nameOverride: workout.name, workoutId: workout.workoutId };
    });

    if (templates.some((entry) => !entry.template || !entry.template?.workouts[0])) {
      set({ error: 'One or more templates could not be found' });
      return null;
    }

    const hasLocalExercises = templates.some((entry) =>
      hasLocalExerciseIds(entry.template?.workouts[0].exercises || [])
    );

    const now = new Date().toISOString();

    const buildUpdatedProgram = (workoutIds?: Map<number, string>) => {
      const updatedWorkouts = templates.map((entry, index) =>
        buildProgramWorkoutFromTemplate(
          entry.template as Program,
          index + 1,
          entry.nameOverride,
          entry.workoutId || workoutIds?.get(index)
        )
      );

      return {
        ...program,
        name,
        description: options?.description ?? program.description,
        difficulty: options?.difficulty ?? program.difficulty,
        goal: options?.goal ?? program.goal,
        durationWeeks: options?.durationWeeks ?? program.durationWeeks,
        updatedAt: now,
        workouts: updatedWorkouts,
      };
    };

    const applyLocalUpdate = (workoutIds?: Map<number, string>) => {
      const updatedProgram = buildUpdatedProgram(workoutIds);

      set((state) => ({
        programs: state.programs.map((p) => (p.id === programId ? updatedProgram : p)),
      }));

      return updatedProgram;
    };

    if (isLocalProgramId(programId) || hasLocalExercises || !isSupabaseConfigured()) {
      const updatedProgram = applyLocalUpdate();

      if (programId.startsWith('local-')) {
        get().persistLocalPrograms();
        syncLocalProgram(updatedProgram).catch((err) => {
          console.warn('Background program sync failed:', err);
        });
      } else {
        get().persistLocalPrograms();
      }

      return programId;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        applyLocalUpdate();
        return programId;
      }

      const { error: programError } = await supabase
        .from('workout_programs')
        .update({
          name,
          description: options?.description ?? program.description ?? null,
          difficulty: options?.difficulty ?? program.difficulty,
          goal: options?.goal ?? program.goal ?? null,
          duration_weeks: options?.durationWeeks ?? program.durationWeeks ?? null,
          updated_at: now,
        })
        .eq('id', programId);

      if (programError) {
        set({ error: programError.message });
        return null;
      }

      const existingIds = new Set(program.workouts.map((workout) => workout.id));
      const incomingIds = templates
        .map((entry) => entry.workoutId)
        .filter((id): id is string => !!id && existingIds.has(id));

      // Move existing workouts to temporary day numbers to avoid collisions
      for (const [index, entry] of templates.entries()) {
        if (!entry.workoutId || !existingIds.has(entry.workoutId)) continue;
        const tempDayNumber = 1000 + index + 1;
        const { error: tempUpdateError } = await supabase
          .from('program_workouts')
          .update({ day_number: tempDayNumber })
          .eq('id', entry.workoutId);
        if (tempUpdateError) {
          set({ error: tempUpdateError.message });
          return null;
        }
      }

      // Delete removed workouts
      const removedWorkouts = program.workouts.filter(
        (workout) => !incomingIds.includes(workout.id)
      );
      if (removedWorkouts.length > 0) {
        const { error: removeError } = await supabase
          .from('program_workouts')
          .delete()
          .in('id', removedWorkouts.map((workout) => workout.id));
        if (removeError) {
          set({ error: removeError.message });
          return null;
        }
      }

      const insertedWorkoutIds = new Map<number, string>();

      for (const [index, entry] of templates.entries()) {
        const template = entry.template as Program;
        const dayNumber = index + 1;
        const workoutName = entry.nameOverride?.trim() || template.workouts[0]?.name || template.name;

        if (entry.workoutId && existingIds.has(entry.workoutId)) {
          const { error: workoutUpdateError } = await supabase
            .from('program_workouts')
            .update({ name: workoutName, day_number: dayNumber })
            .eq('id', entry.workoutId);
          if (workoutUpdateError) {
            set({ error: workoutUpdateError.message });
            return null;
          }

          const { error: deleteExercisesError } = await supabase
            .from('program_exercises')
            .delete()
            .eq('program_workout_id', entry.workoutId);
          if (deleteExercisesError) {
            set({ error: deleteExercisesError.message });
            return null;
          }

          const exercises = template.workouts[0]?.exercises || [];
          if (exercises.length > 0) {
            const resolvedExercises = await resolveExerciseIdsForSupabase(exercises);
            const exercisesToInsert = resolvedExercises.map((exercise, exerciseIndex) => ({
              program_workout_id: entry.workoutId,
              exercise_id: exercise.resolvedExerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.restSeconds ?? 120,
              notes: exercise.notes,
              order_index: exerciseIndex,
            }));

            const { error: insertExercisesError } = await supabase
              .from('program_exercises')
              .insert(exercisesToInsert);
            if (insertExercisesError) {
              set({ error: insertExercisesError.message });
              return null;
            }
          }
        } else {
          const { data: workout, error: workoutError } = await supabase
            .from('program_workouts')
            .insert({
              program_id: programId,
              name: workoutName,
              day_number: dayNumber,
            })
            .select()
            .single();

          if (workoutError || !workout) {
            set({ error: workoutError?.message || 'Failed to update program workouts' });
            return null;
          }

          insertedWorkoutIds.set(index, workout.id);

          const exercises = template.workouts[0]?.exercises || [];
          if (exercises.length > 0) {
            const resolvedExercises = await resolveExerciseIdsForSupabase(exercises);
            const exercisesToInsert = resolvedExercises.map((exercise, exerciseIndex) => ({
              program_workout_id: workout.id,
              exercise_id: exercise.resolvedExerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.restSeconds ?? 120,
              notes: exercise.notes,
              order_index: exerciseIndex,
            }));

            const { error: insertExercisesError } = await supabase
              .from('program_exercises')
              .insert(exercisesToInsert);
            if (insertExercisesError) {
              set({ error: insertExercisesError.message });
              return null;
            }
          }
        }
      }

      applyLocalUpdate(insertedWorkoutIds);
      return programId;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update program',
      });
      return null;
    }
  },

  removeWorkoutFromProgram: async (programId, workoutId) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return false;
    }

    const remainingWorkouts = program.workouts
      .filter((workout) => workout.id !== workoutId)
      .map((workout, index) => ({ ...workout, dayNumber: index + 1 }));

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: remainingWorkouts } : p
        ),
      }));
      get().persistLocalPrograms();
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('program_workouts')
        .delete()
        .eq('id', workoutId);
      if (deleteError) {
        set({ error: deleteError.message });
        return false;
      }

      // Reorder day numbers on the server to keep them sequential
      for (const [index, workout] of remainingWorkouts.entries()) {
        const { error: tempUpdateError } = await supabase
          .from('program_workouts')
          .update({ day_number: 1000 + index + 1 })
          .eq('id', workout.id);
        if (tempUpdateError) {
          set({ error: tempUpdateError.message });
          return false;
        }
      }

      for (const [index, workout] of remainingWorkouts.entries()) {
        const { error: updateError } = await supabase
          .from('program_workouts')
          .update({ day_number: index + 1 })
          .eq('id', workout.id);
        if (updateError) {
          set({ error: updateError.message });
          return false;
        }
      }

      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: remainingWorkouts } : p
        ),
      }));

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update program workouts',
      });
      return false;
    }
  },

  removeExerciseFromProgramWorkout: async (programId, workoutId, exerciseId) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return false;
    }

    const updatedWorkouts = program.workouts.map((workout) => {
      if (workout.id !== workoutId) return workout;

      const remainingExercises = workout.exercises
        .filter((exercise) => exercise.id !== exerciseId)
        .map((exercise, index) => ({ ...exercise, orderIndex: index }));

      return { ...workout, exercises: remainingExercises };
    });

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: updatedWorkouts } : p
        ),
      }));
      get().persistLocalPrograms();
      return true;
    }

    try {
      const targetWorkout = updatedWorkouts.find((workout) => workout.id === workoutId);
      if (!targetWorkout) {
        set({ error: 'Workout not found' });
        return false;
      }

      const { error: deleteError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('program_workout_id', workoutId);
      if (deleteError) {
        set({ error: deleteError.message });
        return false;
      }

      if (targetWorkout.exercises.length > 0) {
        const resolvedExercises = await resolveExerciseIdsForSupabase(targetWorkout.exercises);
        const exercisesToInsert = resolvedExercises.map((exercise, index) => ({
          program_workout_id: workoutId,
          exercise_id: exercise.resolvedExerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds ?? 120,
          notes: exercise.notes,
          order_index: index,
        }));

        const { error: insertError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);
        if (insertError) {
          set({ error: insertError.message });
          return false;
        }
      }

      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: updatedWorkouts } : p
        ),
      }));

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update program exercises',
      });
      return false;
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
        const resolvedExercises = await resolveExerciseIdsForSupabase(exercises);
        const exercisesToInsert = resolvedExercises.map((ex, index) => ({
          program_workout_id: workoutId,
          exercise_id: ex.resolvedExerciseId,
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
      const localPrograms = stored
        ? (JSON.parse(stored) as Program[])
        : [...getDefaultPrograms(), ...getDefaultTemplates()];

      if (!stored && localPrograms.length > 0) {
        await setScopedItem(LOCAL_TEMPLATES_KEY, JSON.stringify(localPrograms));
      }

      // Merge with existing programs (avoid duplicates)
      set((state) => {
        const existingIds = new Set(state.programs.map((p) => p.id));
        const newLocalPrograms = localPrograms.filter((p) => !existingIds.has(p.id));
        return { programs: [...state.programs, ...newLocalPrograms] };
      });
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
    useProgramProgressStore.getState().migrateProgramId(localId, serverId);
    useStartPresetStore.getState().migrateLocalId(localId, serverId);
  },

  resetStore: () => {
    set({
      programs: [],
      isLoading: false,
      isDeleting: false,
      hasFetchedPrograms: false,
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
