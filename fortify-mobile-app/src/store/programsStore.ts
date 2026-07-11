/**
 * Programs Store (Zustand)
 *
 * Central state management for workout programs and templates.
 * Fetches from Supabase and provides CRUD operations.
 * Supports offline-first local template saving with cloud sync.
 */
import { create } from 'zustand';
import { DeviceEventEmitter } from 'react-native';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  syncLocalProgram,
  processPendingProgramQueue,
  removeFromPendingQueue,
  getPendingProgramSyncIds,
} from '../services/programSyncService';
import { resolveCustomExerciseRemoteIds } from '../services/customExerciseSync';
import { getDefaultPrograms, getDefaultTemplates, REMOVED_DEFAULT_PROGRAM_IDS } from '../data/defaultPrograms';
import { isLocalProgramId } from '../utils/localIds';
import { generateUniqueName } from '../utils/nameUtils';
import { useProgramProgressStore } from './programProgressStore';
import { useStartPresetStore } from './startPresetStore';
import { useWorkoutStore } from './workoutStore';

import {
  Program,
  ProgramDTO,
  ProgramWorkout,
  ProgramWorkoutDTO,
  ProgramExercise,
  ProgramExerciseDTO,
  TemplateSetDetail,
} from '../types/workout';
import { DELETED_DEFAULT_PROGRAM_IDS_KEY, LOCAL_TEMPLATES_KEY } from '../constants/storageKeys';
import { MAX_WORKOUTS_PER_PROGRAM } from '../constants/programs';
import type { GeneratedProgramPayload } from '../utils/onboardingProgram';

const DEFAULT_PROGRAM_IDS = new Set(
  [...getDefaultPrograms(), ...getDefaultTemplates()].map((program) => program.id)
);

const parseDeletedDefaultProgramIds = (raw: string | null): Set<string> => {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value): value is string => typeof value === 'string'));
  } catch {
    return new Set();
  }
};

const loadDeletedDefaultProgramIds = async (): Promise<Set<string>> => {
  const raw = await getScopedItem(DELETED_DEFAULT_PROGRAM_IDS_KEY);
  return parseDeletedDefaultProgramIds(raw);
};

const persistDeletedDefaultProgramIds = async (ids: Set<string>): Promise<void> => {
  await setScopedItem(DELETED_DEFAULT_PROGRAM_IDS_KEY, JSON.stringify(Array.from(ids)));
};

const isSeededDefaultProgram = (program: Program | undefined): program is Program =>
  Boolean(program?.isDefault && program?.id && DEFAULT_PROGRAM_IDS.has(program.id));

const refreshSeededDefaultProgramMetadata = (program: Program, defaultsById: Map<string, Program>): Program => {
  if (!isSeededDefaultProgram(program)) return program;

  const seededDefault = defaultsById.get(program.id);
  const seededWorkout = seededDefault?.workouts[0];
  if (!seededDefault) return program;

  return {
    ...program,
    name: seededDefault.name,
    workouts: program.workouts.map((workout, index) => (
      index === 0 && seededWorkout
        ? { ...workout, name: seededWorkout.name }
        : workout
    )),
  };
};

interface ProgramsState {
  // Data
  programs: Program[];
  pendingProgramSyncIds: string[];
  syncingProgramSyncIds: string[];

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
      notes?: string;
    }>,
    options?: {
      lastPerformedAt?: Date | string | null;
      description?: string;
      isAiCreated?: boolean;
      aiSourceChatId?: string | null;
      aiPayloadVersion?: string | null;
    }
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
  createGeneratedProgram: (payload: GeneratedProgramPayload) => Promise<string | null>;
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
  reorderProgramWorkouts: (programId: string, orderedWorkoutIds: string[]) => Promise<boolean>;
  removeWorkoutFromProgram: (programId: string, workoutId: string) => Promise<boolean>;
  removeExerciseFromProgramWorkout: (
    programId: string,
    workoutId: string,
    exerciseId: string
  ) => Promise<boolean>;
  updateProgramWorkout: (
    programId: string,
    workoutId: string,
    name: string,
    exercises: Array<{
      exerciseId: string;
      exerciseName?: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      notes?: string;
      setDetails?: TemplateSetDetail[];
    }>
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
      notes?: string;
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
  refreshPendingProgramSyncIds: () => Promise<void>;
  markProgramSyncing: (programId: string, syncing: boolean) => void;
}

// ============================================
// DTO Mappers
// ============================================

function mapExerciseFromDTO(dto: ProgramExerciseDTO): ProgramExercise {
  return {
    id: dto.id,
    exerciseId: dto.exercise_id,
    exerciseName: dto.exercise_name_snapshot ?? '', // Will be populated from join or cache
    sets: dto.sets,
    reps: dto.reps,
    restSeconds: dto.rest_seconds,
    notes: dto.notes,
    orderIndex: dto.order_index,
    setDetails: dto.set_details || undefined,
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
    aiSourceChatId: dto.ai_source_chat_id ?? null,
    aiPayloadVersion: dto.ai_payload_version ?? null,
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
  const customRemoteIds = await resolveCustomExerciseRemoteIds(exercises.map((ex) => ex.exerciseId));
  const map = new Map<string, string>(customRemoteIds);
  const slugKeys = new Set<string>();
  const nameKeys = new Set<string>();

  exercises.forEach((ex) => {
    if (customRemoteIds.has(ex.exerciseId)) {
      return;
    }
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

const snapshotTemplatePreviousPerformance = async (template: Program): Promise<Program> => {
  try {
    const completedSessions = useWorkoutStore.getState().completedSessions;
    const sourceWorkout = template.workouts[0];
    if (!sourceWorkout) return template;

    const matchingSessions = completedSessions
      .filter((session) => session.completedAt && (
        session.programWorkoutId === sourceWorkout.id
        || (!session.programWorkoutId && session.name === sourceWorkout.name)
      ))
      .sort((a, b) => (
        (b.completedAt ?? b.startedAt).getTime() - (a.completedAt ?? a.startedAt).getTime()
      ));

    if (matchingSessions.length === 0) return template;

    const exercises = sourceWorkout.exercises.map((exercise) => {
      const latestExercise = matchingSessions
        .map((session) => session.exercises.find((entry) => entry.exerciseId === exercise.exerciseId))
        .find(Boolean);
      if (!latestExercise) return exercise;

      const orderedSets = [...latestExercise.sets].sort((a, b) => a.orderIndex - b.orderIndex);
      const setCount = Math.max(1, exercise.setDetails?.length ?? exercise.sets);
      const hasCompletedPerformance = orderedSets.some(
        (set) => set.isCompleted || (set.weight !== null && set.reps !== null)
      );
      if (!hasCompletedPerformance) return exercise;

      return {
        ...exercise,
        setDetails: Array.from({ length: setCount }, (_, index) => {
          const set = orderedSets[index];
          const fallback = exercise.setDetails?.[index];
          const hasPerformance = set?.isCompleted || (set?.weight !== null && set?.reps !== null);
          return hasPerformance
            ? { weight: set?.weight ?? null, reps: set?.reps ?? null, setType: set?.setType }
            : fallback ?? { weight: null, reps: null, setType: set?.setType ?? 'normal' };
        }),
      };
    });

    return {
      ...template,
      workouts: [{ ...sourceWorkout, exercises }, ...template.workouts.slice(1)],
    };
  } catch (error) {
    console.warn('[ProgramsStore] Failed to snapshot source workout performance:', error);
    return template;
  }
};

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
      setDetails: exercise.setDetails,
    })),
  };
};

// ============================================
// Store
// ============================================

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  // Initial state
  programs: [],
  pendingProgramSyncIds: [],
  syncingProgramSyncIds: [],
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
        const message = String(error.message || '');
        const isAbort =
          error.name === 'AbortError' ||
          message.includes('AbortError') ||
          message.toLowerCase().includes('aborted');
        if (isAbort) {
          console.warn('Programs fetch timed out');
          set({ isLoading: false, hasFetchedPrograms: true });
          return;
        }

        console.error('Error fetching programs:', error);
        set({ error: error.message, isLoading: false, hasFetchedPrograms: true });
        return;
      }

      const deletedDefaultIds = await loadDeletedDefaultProgramIds();
      const programs = (data as ProgramDTO[])
        .map(mapProgramFromDTO)
        .filter((program) => !(program.isDefault && deletedDefaultIds.has(program.id)));
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
              exercise.exerciseName = exerciseMap.get(exercise.exerciseId) ||
                exercise.exerciseName ||
                'Unknown Exercise';
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
    const program = get().programs.find((p) => p.id === id);

    if (isSeededDefaultProgram(program)) {
      try {
        const deletedDefaultIds = await loadDeletedDefaultProgramIds();
        deletedDefaultIds.add(id);
        await persistDeletedDefaultProgramIds(deletedDefaultIds);
      } catch (err) {
        console.warn('Failed to persist deleted default program IDs:', err);
      }

      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        isDeleting: false,
      }));

      return true;
    }

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

    const previousPrograms = get().programs;
    const previousStartPreset = useStartPresetStore.getState().preset;
    const shouldClearStartPreset = previousStartPreset?.type === 'program' && previousStartPreset.programId === id;

    if (shouldClearStartPreset) {
      await useStartPresetStore.getState().setPreset(null);
    }

    set((state) => ({
      programs: state.programs.filter((p) => p.id !== id),
    }));

    // Handle Supabase programs
    try {
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', id);

      if (error) {
        if (shouldClearStartPreset) {
          void useStartPresetStore.getState().setPreset(previousStartPreset);
        }
        set({ programs: previousPrograms, error: error.message, isDeleting: false });
        return false;
      }

      set({ isDeleting: false });

      return true;
    } catch (err) {
      if (shouldClearStartPreset) {
        void useStartPresetStore.getState().setPreset(previousStartPreset);
      }
      set({
        programs: previousPrograms,
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
          exercise_name_snapshot: ex.exerciseName ?? null,
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

    const storedTemplate = get().programs.find((p) => p.id === templateId && p.isTemplate);
    const template = storedTemplate
      ? await snapshotTemplatePreviousPerformance(storedTemplate)
      : undefined;
    const templateWorkout = template?.workouts[0];
    if (!template || !templateWorkout) {
      set({ error: 'Template not found' });
      return false;
    }

    if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      set({ error: `Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts` });
      return false;
    }

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

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
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
          exercise_name_snapshot: exercise.exerciseName ?? null,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds ?? 120,
          notes: exercise.notes,
          set_details: exercise.setDetails ?? null,
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
  createWorkoutTemplate: async (name, exercises, options) => {
    // Generate unique name to avoid duplicates
    const { programs } = get();
    const templateNames = programs.filter((p) => p.isTemplate).map((p) => p.name);
    const uniqueName = generateUniqueName(name, templateNames);

    // Convert lastPerformedAt to ISO string if it's a Date object
    const lastPerformedAtISO = options?.lastPerformedAt
      ? (options?.lastPerformedAt instanceof Date
        ? options.lastPerformedAt.toISOString()
        : options.lastPerformedAt)
      : null;
    const templateDescription = options?.description?.trim() || undefined;
    const isAiCreated = options?.isAiCreated ?? false;
    const aiPayloadVersion = options?.aiPayloadVersion ?? null;
    const aiSourceChatId = options?.aiSourceChatId ?? null;

    // Helper to save locally and attempt cloud sync
    const saveLocally = async () => {
      const localId = `local-${Date.now()}`;
      const now = new Date().toISOString();

      // Create a proper Program object with workouts array
      const localProgram: Program = {
        id: localId,
        name: uniqueName,
        description: templateDescription,
        difficulty: 'intermediate',
        goal: undefined,
        durationWeeks: undefined,
        isPublic: false,
        isDefault: false,
        isAiCreated,
        isTemplate: true,
        aiSourceChatId,
        aiPayloadVersion,
        lastPerformedAt: lastPerformedAtISO,
        createdBy: 'local',
        createdAt: now,
        updatedAt: now,
        workouts: [{
          id: `${localId}-workout`,
          name: uniqueName,
          dayNumber: 1,
          exercises: exercises.map((ex, index) => ({
            id: `${localId}-ex-${index}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName || 'Unknown Exercise',
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds || 120,
            notes: ex.notes,
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
      get().markProgramSyncing(localId, true);

      // Attempt cloud sync in background (don't await, don't block)
      void (async () => {
        try {
          const result = await syncLocalProgram(localProgram);
          if (result.success && result.serverId) {
            // Check if program still exists (wasn't deleted during sync)
            const stillExists = get().programs.some((p) => p.id === localId);
            if (stillExists) {
              // Replace local ID with server ID
              get().replaceLocalIdWithServerId(localId, result.serverId);
            } else {
              // Program was deleted during sync - clean up from Supabase
              void (async () => {
                try {
                  await supabase
                    .from('workout_programs')
                    .delete()
                    .eq('id', result.serverId);
                  console.log('Cleaned up orphaned synced program');
                } catch (err) {
                  console.warn('Failed to clean up orphaned program:', err);
                }
              })();
            }
          }
        } catch (err) {
          console.warn('Background program sync failed:', err);
        } finally {
          get().markProgramSyncing(localId, false);
          void get().refreshPendingProgramSyncIds();
        }
      })();

      return localId;
    };

    // Save immediately to local state and let syncLocalProgram push it to the
    // backend in the background. The previous synchronous Supabase path scaled
    // with exercise count and made "Save as Template" appear frozen for larger
    // workouts.
    return await saveLocally();
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

    // Generate unique name to avoid duplicates
    const { programs } = get();
    const programNames = programs.filter((p) => !p.isTemplate).map((p) => p.name);
    const uniqueName = generateUniqueName(name, programNames);

    const templates = await Promise.all(workouts.map(async (workout) => {
      const template = get().programs.find(
        (program) => program.id === workout.templateId && program.isTemplate
      );
      return {
        template: template ? await snapshotTemplatePreviousPerformance(template) : undefined,
        nameOverride: workout.name,
      };
    }));

    if (templates.some((entry) => !entry.template || !entry.template?.workouts[0])) {
      set({ error: 'One or more templates could not be found' });
      return null;
    }

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
        name: uniqueName,
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

      return localId;
    };

    if (!isSupabaseConfigured()) {
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
          name: uniqueName,
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
            exercise_name_snapshot: exercise.exerciseName ?? null,
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

  createGeneratedProgram: async (payload) => {
    set({ error: null });

    if (payload.workouts.length === 0) {
      set({ error: 'Generated program must include at least one workout' });
      return null;
    }

    if (payload.workouts.length > MAX_WORKOUTS_PER_PROGRAM) {
      set({ error: `Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts` });
      return null;
    }

    const programNames = get().programs.filter((p) => !p.isTemplate).map((p) => p.name);
    const uniqueName = generateUniqueName(payload.name, programNames);
    const localId = `local-ai-program-${Date.now()}`;
    const now = new Date().toISOString();

    const programWorkouts: ProgramWorkout[] = payload.workouts.map((workout, workoutIndex) => {
      const workoutId = `${localId}-day-${workoutIndex + 1}`;
      return {
        id: workoutId,
        name: workout.name,
        dayNumber: workoutIndex + 1,
        exercises: workout.exercises.map((exercise, exerciseIndex) => ({
          id: `${workoutId}-ex-${exerciseIndex + 1}`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds ?? 120,
          notes: exercise.notes ?? '',
          orderIndex: exerciseIndex,
        })),
      };
    });

    const localProgram: Program = {
      id: localId,
      name: uniqueName,
      description: payload.description,
      difficulty: payload.difficulty,
      goal: payload.goal,
      durationWeeks: payload.durationWeeks,
      isPublic: false,
      isDefault: false,
      isAiCreated: true,
      isTemplate: false,
      aiSourceChatId: null,
      aiPayloadVersion: `onboarding-program:${payload.sourceSpecId}`,
      lastPerformedAt: null,
      createdBy: 'local',
      createdAt: now,
      updatedAt: now,
      workouts: programWorkouts,
    };

    set((state) => ({
      programs: [localProgram, ...state.programs],
    }));
    await get().persistLocalPrograms();

    if (!isSupabaseConfigured()) {
      return localId;
    }

    get().markProgramSyncing(localId, true);
    syncLocalProgram(localProgram)
      .then((result) => {
        if (result.success && result.serverId) {
          const stillExists = get().programs.some((p) => p.id === localId);
          if (stillExists) {
            get().replaceLocalIdWithServerId(localId, result.serverId);
          }
        }
        if (!result.success && !result.queued) {
          console.warn('[ProgramsStore] Generated program sync failed:', result.error);
        }
      })
      .catch((err) => {
        console.warn('[ProgramsStore] Generated program sync failed:', err);
      })
      .finally(() => {
        get().markProgramSyncing(localId, false);
        void get().refreshPendingProgramSyncIds();
      });

    return localId;
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

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
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
              exercise_name_snapshot: exercise.exerciseName ?? null,
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
              exercise_name_snapshot: exercise.exerciseName ?? null,
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

  reorderProgramWorkouts: async (programId, orderedWorkoutIds) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return false;
    }

    const workoutMap = new Map(program.workouts.map((workout) => [workout.id, workout]));
    if (orderedWorkoutIds.length !== program.workouts.length) {
      set({ error: 'Invalid workout order' });
      return false;
    }

    const nextWorkouts: ProgramWorkout[] = [];
    for (const workoutId of orderedWorkoutIds) {
      const workout = workoutMap.get(workoutId);
      if (!workout) {
        set({ error: 'Invalid workout order' });
        return false;
      }
      nextWorkouts.push(workout);
    }

    const now = new Date().toISOString();
    const previousProgram = program;
    const updatedWorkouts = nextWorkouts.map((workout, index) => ({
      ...workout,
      dayNumber: index + 1,
    }));
    const updatedProgram = {
      ...program,
      workouts: updatedWorkouts,
      updatedAt: now,
    };

    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === programId ? updatedProgram : p
      ),
    }));

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      get().persistLocalPrograms();
      if (programId.startsWith('local-')) {
        syncLocalProgram(updatedProgram).catch((err) => {
          console.warn('Background program sync failed:', err);
        });
      }
      return true;
    }

    try {
      const tempResults = await Promise.all(
        updatedWorkouts.map((workout, index) =>
          supabase
            .from('program_workouts')
            .update({ day_number: 1000 + index + 1 })
            .eq('id', workout.id)
        )
      );
      const tempError = tempResults.find((r) => r.error)?.error;
      if (tempError) {
        set({ error: tempError.message });
        throw new Error(tempError.message);
      }

      const finalResults = await Promise.all(
        updatedWorkouts.map((workout, index) =>
          supabase
            .from('program_workouts')
            .update({ day_number: index + 1 })
            .eq('id', workout.id)
        )
      );
      const finalError = finalResults.find((r) => r.error)?.error;
      if (finalError) {
        set({ error: finalError.message });
        throw new Error(finalError.message);
      }

      const { error: programError } = await supabase
        .from('workout_programs')
        .update({ updated_at: now })
        .eq('id', programId);
      if (programError) {
        set({ error: programError.message });
      }

      return true;
    } catch (err) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? previousProgram : p
        ),
        error: err instanceof Error ? err.message : 'Failed to reorder program workouts',
      }));
      return false;
    }
  },

  removeWorkoutFromProgram: async (programId, workoutId) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    if (!program) {
      set({ error: 'Program not found' });
      return false;
    }

    const previousWorkouts = program.workouts;
    const remainingWorkouts = program.workouts
      .filter((workout) => workout.id !== workoutId)
      .map((workout, index) => ({ ...workout, dayNumber: index + 1 }));

    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === programId ? { ...p, workouts: remainingWorkouts } : p
      ),
    }));

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      get().persistLocalPrograms();
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('program_workouts')
        .delete()
        .eq('id', workoutId);
      if (deleteError) {
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId ? { ...p, workouts: previousWorkouts } : p
          ),
          error: deleteError.message,
        }));
        return false;
      }

      // Reorder day numbers on the server to keep them sequential
      // First move all to temp day numbers (1000+) to avoid conflicts
      const tempResults = await Promise.all(
        remainingWorkouts.map((workout, index) =>
          supabase
            .from('program_workouts')
            .update({ day_number: 1000 + index + 1 })
            .eq('id', workout.id)
        )
      );
      const tempError = tempResults.find((r) => r.error)?.error;
      if (tempError) {
        set({ error: tempError.message });
        return false;
      }

      // Then move to final sequential day numbers
      const finalResults = await Promise.all(
        remainingWorkouts.map((workout, index) =>
          supabase
            .from('program_workouts')
            .update({ day_number: index + 1 })
            .eq('id', workout.id)
        )
      );
      const finalError = finalResults.find((r) => r.error)?.error;
      if (finalError) {
        set({ error: finalError.message });
        return false;
      }

      return true;
    } catch (err) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: previousWorkouts } : p
        ),
        error: err instanceof Error ? err.message : 'Failed to update program workouts',
      }));
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

    const previousWorkouts = program.workouts;
    const updatedWorkouts = program.workouts.map((workout) => {
      if (workout.id !== workoutId) return workout;

      const remainingExercises = workout.exercises
        .filter((exercise) => exercise.id !== exerciseId)
        .map((exercise, index) => ({ ...exercise, orderIndex: index }));

      return { ...workout, exercises: remainingExercises };
    });

    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === programId ? { ...p, workouts: updatedWorkouts } : p
      ),
    }));

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      get().persistLocalPrograms();
      return true;
    }

    try {
      // Delete the specific exercise by its primary key (much faster than delete-all-reinsert)
      const { error: deleteError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('id', exerciseId);

      if (deleteError) {
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId ? { ...p, workouts: previousWorkouts } : p
          ),
          error: deleteError.message,
        }));
        return false;
      }

      return true;
    } catch (err) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId ? { ...p, workouts: previousWorkouts } : p
        ),
        error: err instanceof Error ? err.message : 'Failed to update program exercises',
      }));
      return false;
    }
  },

  updateProgramWorkout: async (programId, workoutId, name, exercises) => {
    set({ error: null });

    const program = get().programs.find((p) => p.id === programId && !p.isTemplate);
    const workout = program?.workouts.find((entry) => entry.id === workoutId);
    if (!program || !workout) {
      set({ error: 'Program workout not found' });
      return false;
    }

    const previousProgram = program;
    const normalizedName = name.trim() || workout.name;
    const buildLocalExercises = (source: typeof exercises): ProgramExercise[] =>
      source.map((exercise, index) => ({
        id: `${workoutId}-exercise-${Date.now()}-${index}`,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName ?? '',
        sets: Math.max(1, exercise.sets),
        reps: exercise.reps || '8-12',
        restSeconds: exercise.restSeconds ?? 120,
        notes: exercise.notes,
        setDetails: exercise.setDetails,
        orderIndex: index,
      }));

    const optimisticWorkout: ProgramWorkout = {
      ...workout,
      name: normalizedName,
      exercises: buildLocalExercises(exercises),
    };

    set((state) => ({
      programs: state.programs.map((entry) =>
        entry.id === programId
          ? {
            ...entry,
            workouts: entry.workouts.map((candidate) =>
              candidate.id === workoutId ? optimisticWorkout : candidate
            ),
          }
          : entry
      ),
    }));

    if (isLocalProgramId(programId) || !isSupabaseConfigured()) {
      get().persistLocalPrograms();
      return true;
    }

    try {
      const { error: workoutError } = await supabase
        .from('program_workouts')
        .update({ name: normalizedName })
        .eq('id', workoutId);
      if (workoutError) {
        throw new Error(workoutError.message);
      }

      const { error: deleteError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('program_workout_id', workoutId);
      if (deleteError) {
        throw new Error(deleteError.message);
      }

      let persistedExercises: ProgramExercise[] = [];
      if (exercises.length > 0) {
        const resolvedExercises = await resolveExerciseIdsForSupabase(
          exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds,
            notes: exercise.notes,
            setDetails: exercise.setDetails,
            orderIndex: 0,
          }))
        );

        const exercisesToInsert = resolvedExercises.map((exercise, index) => ({
          program_workout_id: workoutId,
          exercise_id: exercise.resolvedExerciseId,
          exercise_name_snapshot: exercise.exerciseName ?? null,
          sets: Math.max(1, exercise.sets),
          reps: exercise.reps || '8-12',
          rest_seconds: exercise.restSeconds ?? 120,
          notes: exercise.notes,
          set_details: exercise.setDetails ?? null,
          order_index: index,
        }));

        const { data, error: insertError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert)
          .select('*');
        if (insertError) {
          throw new Error(insertError.message);
        }

        persistedExercises = (data ?? []).map(mapExerciseFromDTO);
      }

      set((state) => ({
        programs: state.programs.map((entry) =>
          entry.id === programId
            ? {
              ...entry,
              workouts: entry.workouts.map((candidate) =>
                candidate.id === workoutId
                  ? {
                    ...candidate,
                    name: normalizedName,
                    exercises: persistedExercises,
                  }
                  : candidate
              ),
            }
            : entry
        ),
      }));

      return true;
    } catch (err) {
      set((state) => ({
        programs: state.programs.map((entry) =>
          entry.id === programId ? previousProgram : entry
        ),
        error: err instanceof Error ? err.message : 'Failed to update program workout',
      }));
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
      notes: ex.notes,
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

    const isSeededDefaultTemplate = isSeededDefaultProgram(template);

    if (isSeededDefaultTemplate) {
      const localId = `local-${Date.now()}`;
      const copiedTemplate: Program = {
        ...template,
        id: localId,
        name,
        isDefault: false,
        isPublic: false,
        createdBy: 'local',
        createdAt: now,
        updatedAt: now,
        workouts: [{
          ...workout,
          id: `${localId}-workout`,
          name,
          exercises: exercises.map((ex, index) => ({
            id: `${localId}-ex-${index}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName || 'Unknown Exercise',
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds ?? 120,
            notes: ex.notes,
            orderIndex: index,
            setDetails: ex.setDetails,
          })),
        }],
      };

      const replaceSeededTemplate = (nextTemplate: Program) => {
        set((state) => ({
          programs: state.programs.map((p) => (p.id === templateId ? nextTemplate : p)),
          pendingProgramSyncIds: state.pendingProgramSyncIds.filter((id) => id !== templateId),
          syncingProgramSyncIds: state.syncingProgramSyncIds.filter(
            (id) => id !== templateId && id !== localId
          ),
        }));
      };

      const persistForkLocally = async () => {
        replaceSeededTemplate(copiedTemplate);
        get().persistLocalPrograms();
        await removeFromPendingQueue(templateId);
        await get().refreshPendingProgramSyncIds();
        return localId;
      };

      try {
        const deletedDefaultIds = await loadDeletedDefaultProgramIds();
        deletedDefaultIds.add(templateId);
        await persistDeletedDefaultProgramIds(deletedDefaultIds);
      } catch (err) {
        console.warn('Failed to persist deleted default program IDs:', err);
      }

      if (!isSupabaseConfigured()) {
        return await persistForkLocally();
      }

      get().markProgramSyncing(localId, true);
      try {
        const result = await syncLocalProgram(copiedTemplate);

        if (result.success && result.serverId) {
          const serverId = result.serverId;
          const syncedTemplate: Program = {
            ...copiedTemplate,
            id: serverId,
            workouts: copiedTemplate.workouts.map((w) => ({
              ...w,
              id: w.id.replace(localId, serverId),
              exercises: w.exercises.map((ex) => ({
                ...ex,
                id: ex.id.replace(localId, serverId),
              })),
            })),
          };

          replaceSeededTemplate(syncedTemplate);
          await removeFromPendingQueue(localId);
          await get().refreshPendingProgramSyncIds();
          return result.serverId;
        }

        if (!result.success && !result.queued) {
          console.warn('[ProgramsStore] Template copy sync failed:', result.error);
        }

        return await persistForkLocally();
      } catch (err) {
        console.warn('[ProgramsStore] Template copy sync failed:', err);
        return await persistForkLocally();
      } finally {
        get().markProgramSyncing(localId, false);
        await get().refreshPendingProgramSyncIds();
      }
    }

    const updatedProgram = applyLocalUpdate();

    if (isLocalProgramId(templateId)) {
      get().persistLocalPrograms();
      await removeFromPendingQueue(templateId);
      await get().refreshPendingProgramSyncIds();
    }

    if (!isSupabaseConfigured()) {
      return templateId;
    }

    get().markProgramSyncing(templateId, true);
    syncLocalProgram(updatedProgram)
      .then((result) => {
        if (isLocalProgramId(templateId) && result.success && result.serverId) {
          const stillExists = get().programs.some((p) => p.id === templateId);
          if (stillExists) {
            get().replaceLocalIdWithServerId(templateId, result.serverId);
          }
        }
        if (!result.success && !result.queued) {
          console.warn('[ProgramsStore] Background template update failed:', result.error);
        }
      })
      .catch((err) => {
        console.warn('[ProgramsStore] Background template update failed:', err);
      })
      .finally(() => {
        get().markProgramSyncing(templateId, false);
        void get().refreshPendingProgramSyncIds();
      });

    return templateId;
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

  refreshPendingProgramSyncIds: async () => {
    try {
      const pendingIds = await getPendingProgramSyncIds();
      set({ pendingProgramSyncIds: pendingIds });
    } catch (err) {
      console.warn('Failed to refresh pending program sync IDs:', err);
    }
  },

  markProgramSyncing: (programId, syncing) => {
    set((state) => ({
      syncingProgramSyncIds: syncing
        ? Array.from(new Set([...state.syncingProgramSyncIds, programId]))
        : state.syncingProgramSyncIds.filter((id) => id !== programId),
    }));
  },

  // Load local programs from AsyncStorage
  loadLocalPrograms: async () => {
    try {
      const stored = await getScopedItem(LOCAL_TEMPLATES_KEY);
      const deletedDefaultIds = await loadDeletedDefaultProgramIds();
      const defaults = [...getDefaultPrograms(), ...getDefaultTemplates()].filter(
        (program) => !deletedDefaultIds.has(program.id)
      );
      const defaultsById = new Map(defaults.map((program) => [program.id, program]));
      let localPrograms = stored ? (JSON.parse(stored) as Program[]) : defaults;
      let didChangeStoredPrograms = false;

      if (stored) {
        const refreshedPrograms = localPrograms.map((program) =>
          refreshSeededDefaultProgramMetadata(program, defaultsById)
        );
        didChangeStoredPrograms = JSON.stringify(refreshedPrograms) !== JSON.stringify(localPrograms);
        localPrograms = refreshedPrograms;

        const beforePrune = localPrograms.length;
        localPrograms = localPrograms.filter(
          (program) => !(
            program.isDefault &&
            (deletedDefaultIds.has(program.id) || REMOVED_DEFAULT_PROGRAM_IDS.has(program.id))
          )
        );
        didChangeStoredPrograms = beforePrune !== localPrograms.length;

        const existingIds = new Set(localPrograms.map((program) => program.id));
        const missingDefaults = defaults.filter((program) => !existingIds.has(program.id));
        if (missingDefaults.length > 0) {
          localPrograms = [...localPrograms, ...missingDefaults];
          didChangeStoredPrograms = true;
        }

        if (didChangeStoredPrograms) {
          await setScopedItem(LOCAL_TEMPLATES_KEY, JSON.stringify(localPrograms));
        }
      } else if (localPrograms.length > 0) {
        await setScopedItem(LOCAL_TEMPLATES_KEY, JSON.stringify(localPrograms));
      }

      // Merge with existing programs (avoid duplicates)
      set((state) => {
        const nonLocalPrograms = state.programs.filter(
          (p) => !isLocalProgramId(p.id) && !REMOVED_DEFAULT_PROGRAM_IDS.has(p.id)
        );
        return { programs: [...nonLocalPrograms, ...localPrograms] };
      });
      await get().refreshPendingProgramSyncIds();
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
    const pendingIds = await getPendingProgramSyncIds();
    if (pendingIds.length > 0) {
      set((state) => ({
        syncingProgramSyncIds: Array.from(new Set([...state.syncingProgramSyncIds, ...pendingIds])),
      }));
    }

    try {
      const result = await processPendingProgramQueue();

      // Update local IDs with server IDs for successfully synced programs
      for (const [localId, serverId] of result.idMappings) {
        get().replaceLocalIdWithServerId(localId, serverId);
      }

      if (result.processed > 0) {
        console.log(`Synced ${result.processed} programs to cloud`);
        void get().fetchPrograms({ force: true });
      }
    } catch (err) {
      console.warn('Failed to sync pending programs:', err);
    } finally {
      set((state) => ({
        syncingProgramSyncIds: state.syncingProgramSyncIds.filter((id) => !pendingIds.includes(id)),
      }));
      await get().refreshPendingProgramSyncIds();
    }
  },

  // Replace a local program ID with server-assigned ID after successful sync
  replaceLocalIdWithServerId: (localId: string, serverId: string) => {
    set((state) => {
      const nextPrograms = state.programs.map((p) => {
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
      });

      // A server fetch can land before this remap finishes, which would leave
      // both the fetched server row and the remapped local row in state.
      const dedupedPrograms = Array.from(
        new Map(nextPrograms.map((program) => [program.id, program])).values()
      );

      return {
        programs: dedupedPrograms,
        pendingProgramSyncIds: state.pendingProgramSyncIds.filter((id) => id !== localId),
        syncingProgramSyncIds: state.syncingProgramSyncIds.filter((id) => id !== localId),
      };
    });
    // Re-persist to remove from local storage (no longer has local- prefix)
    get().persistLocalPrograms();
    DeviceEventEmitter.emit('workout-template-replaced', {
      fromId: localId,
      toId: serverId,
    });
    useProgramProgressStore.getState().migrateProgramId(localId, serverId);
    useStartPresetStore.getState().migrateLocalId(localId, serverId);
  },

  resetStore: () => {
    set({
      programs: [],
      pendingProgramSyncIds: [],
      syncingProgramSyncIds: [],
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
