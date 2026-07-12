/**
 * Program Sync Service
 *
 * Handles syncing user-created programs/templates to Supabase.
 * Supports offline-first: queues uploads when offline and syncs when online.
 */

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { Program, ProgramWorkout, ProgramExercise } from '@/src/types/workout';
import { PENDING_PROGRAM_SYNC_QUEUE_KEY } from '@/src/constants/storageKeys';
import { resolveCustomExerciseRemoteIds } from '@/src/services/customExerciseSync';

// Pending sync item stored in queue
interface PendingProgramSyncItem {
  program: Program;
  queuedAt: string;
  retryCount: number;
}

// Result type for sync operations
interface SyncResult {
  success: boolean;
  serverId?: string;
  queued?: boolean;
  error?: string;
}

/**
 * Check if device is online
 */
async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function normalizeExerciseKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

async function resolveExerciseIdMap(exercises: ProgramExercise[]): Promise<Map<string, string>> {
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
}

/**
 * Load pending sync queue from AsyncStorage
 */
async function loadPendingQueue(): Promise<PendingProgramSyncItem[]> {
  try {
    const stored = await getScopedItem(PENDING_PROGRAM_SYNC_QUEUE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load pending program sync queue:', error);
  }
  return [];
}

/**
 * Save pending sync queue to AsyncStorage
 */
async function savePendingQueue(queue: PendingProgramSyncItem[]): Promise<void> {
  try {
    await setScopedItem(PENDING_PROGRAM_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to save pending program sync queue:', error);
  }
}

/**
 * Add a program to the pending sync queue
 */
async function addToPendingQueue(program: Program): Promise<void> {
  const queue = await loadPendingQueue();

  // Check if already in queue (by id)
  const existingIndex = queue.findIndex(item => item.program.id === program.id);
  if (existingIndex >= 0) {
    queue[existingIndex] = {
      ...queue[existingIndex],
      program,
      queuedAt: new Date().toISOString(),
    };
  } else {
    queue.push({
      program,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    });
  }

  await savePendingQueue(queue);
}

/**
 * Remove a program from the pending sync queue
 */
export async function removeFromPendingQueue(programId: string): Promise<void> {
  const queue = await loadPendingQueue();
  const filtered = queue.filter(item => item.program.id !== programId);
  await savePendingQueue(filtered);
}

/**
 * Create a new program in Supabase from a local-only program.
 * Returns the server-assigned UUID on success.
 */
async function uploadProgram(
  program: Program,
  userId: string
): Promise<{ success: boolean; serverId?: string; error?: string }> {
  let createdProgramId: string | null = null;

  try {
    // Insert the program
    const { data: insertedProgram, error: programError } = await supabase
      .from('workout_programs')
      .insert({
        name: program.name,
        description: program.description,
        difficulty: program.difficulty,
        goal: program.goal,
        duration_weeks: program.durationWeeks,
        is_public: program.isPublic,
        is_default: false,
        is_ai_created: program.isAiCreated,
        ai_payload_version: program.aiPayloadVersion ?? null,
        ai_source_chat_id: program.aiSourceChatId && isValidUUID(program.aiSourceChatId)
          ? program.aiSourceChatId
          : null,
        is_template: program.isTemplate,
        created_by: userId,
      })
      .select('id')
      .single();

    if (programError) {
      // Check if it's a duplicate
      if (programError.code === '23505') {
        return { success: true };
      }
      throw programError;
    }

    if (!insertedProgram?.id) {
      throw new Error('No program ID returned from insert');
    }

    const serverId = insertedProgram.id;
    createdProgramId = serverId;

    // Insert workouts
    for (const workout of program.workouts) {
      const { data: insertedWorkout, error: workoutError } = await supabase
        .from('program_workouts')
        .insert({
          program_id: serverId,
          name: workout.name,
          day_number: workout.dayNumber,
        })
        .select('id')
        .single();

      if (workoutError || !insertedWorkout?.id) {
        throw workoutError ?? new Error(`No workout ID returned for ${workout.name}`);
      }

      // Insert exercises for this workout
      if (workout.exercises.length > 0) {
        const exerciseIdMap = await resolveExerciseIdMap(workout.exercises);
        const exercisesToInsert = workout.exercises.map((ex, index) => {
          const resolvedId = isValidUUID(ex.exerciseId)
            ? ex.exerciseId
            : exerciseIdMap.get(ex.exerciseId) ||
              (ex.exerciseName ? exerciseIdMap.get(normalizeExerciseKey(ex.exerciseName)) : null);

          if (!resolvedId) {
            throw new Error(`Unable to resolve exercise: ${ex.exerciseName || ex.exerciseId}`);
          }

          return {
            program_workout_id: insertedWorkout.id,
            exercise_id: resolvedId,
            exercise_name_snapshot: ex.exerciseName ?? null,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.restSeconds || 120,
            notes: ex.notes,
            set_details: ex.setDetails ?? null,
            order_index: ex.orderIndex ?? index,
          };
        });

        const { error: exercisesError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          throw exercisesError;
        }
      }
    }

    return { success: true, serverId };
  } catch (error) {
    // A program is only valid when its full workout tree is saved. Remove a
    // partially-created parent so a later fetch cannot surface a zero-workout
    // (or partially populated) onboarding program. The local copy remains in
    // the sync queue and can be retried safely.
    if (createdProgramId) {
      const { error: cleanupError } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', createdProgramId)
        .eq('created_by', userId);

      if (cleanupError) {
        console.warn('Failed to clean up partial program upload:', cleanupError);
      }
    }

    console.error('Failed to upload program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing synced program/template in Supabase.
 * Uses program_id to find/update workouts so it does not depend on locally
 * cached workout IDs matching the real server IDs.
 */
async function updateExistingProgram(
  program: Program,
  userId: string
): Promise<{ success: boolean; serverId?: string; error?: string }> {
  try {
    const { error: programError } = await supabase
      .from('workout_programs')
      .update({
        name: program.name,
        description: program.description,
        difficulty: program.difficulty,
        goal: program.goal,
        duration_weeks: program.durationWeeks,
        is_public: program.isPublic,
        is_default: false,
        is_ai_created: program.isAiCreated,
        ai_payload_version: program.aiPayloadVersion ?? null,
        ai_source_chat_id: program.aiSourceChatId && isValidUUID(program.aiSourceChatId)
          ? program.aiSourceChatId
          : null,
        is_template: program.isTemplate,
        updated_at: program.updatedAt ?? new Date().toISOString(),
      })
      .eq('id', program.id)
      .eq('created_by', userId);

    if (programError) {
      throw programError;
    }

    const { data: existingWorkouts, error: existingWorkoutsError } = await supabase
      .from('program_workouts')
      .select('id, day_number')
      .eq('program_id', program.id)
      .order('day_number', { ascending: true });

    if (existingWorkoutsError) {
      throw existingWorkoutsError;
    }

    const sortedWorkouts = [...program.workouts].sort((a, b) => a.dayNumber - b.dayNumber);
    const existingWorkoutIds = new Set((existingWorkouts || []).map((workout) => workout.id));
    const retainedWorkoutIds = new Set<string>();

    for (const [index, workout] of sortedWorkouts.entries()) {
      let serverWorkoutId =
        (workout.id && isValidUUID(workout.id) ? workout.id : null) ||
        existingWorkouts?.[index]?.id ||
        null;

      if (serverWorkoutId && existingWorkoutIds.has(serverWorkoutId)) {
        const { error: workoutUpdateError } = await supabase
          .from('program_workouts')
          .update({
            name: workout.name,
            day_number: workout.dayNumber,
          })
          .eq('id', serverWorkoutId);

        if (workoutUpdateError) {
          throw workoutUpdateError;
        }
      } else {
        const { data: insertedWorkout, error: workoutInsertError } = await supabase
          .from('program_workouts')
          .insert({
            program_id: program.id,
            name: workout.name,
            day_number: workout.dayNumber,
          })
          .select('id')
          .single();

        if (workoutInsertError || !insertedWorkout?.id) {
          throw workoutInsertError ?? new Error('No workout ID returned from insert');
        }

        serverWorkoutId = insertedWorkout.id;
      }

      retainedWorkoutIds.add(serverWorkoutId);

      const { error: deleteExercisesError } = await supabase
        .from('program_exercises')
        .delete()
        .eq('program_workout_id', serverWorkoutId);

      if (deleteExercisesError) {
        throw deleteExercisesError;
      }

      if (workout.exercises.length > 0) {
        const exerciseIdMap = await resolveExerciseIdMap(workout.exercises);
        const exercisesToInsert = workout.exercises.map((ex, exerciseIndex) => {
          const resolvedId = isValidUUID(ex.exerciseId)
            ? ex.exerciseId
            : exerciseIdMap.get(ex.exerciseId) ||
              (ex.exerciseName ? exerciseIdMap.get(normalizeExerciseKey(ex.exerciseName)) : null);

          if (!resolvedId) {
            throw new Error(`Unable to resolve exercise: ${ex.exerciseName || ex.exerciseId}`);
          }

          return {
            program_workout_id: serverWorkoutId,
            exercise_id: resolvedId,
            exercise_name_snapshot: ex.exerciseName ?? null,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.restSeconds || 120,
            notes: ex.notes,
            set_details: ex.setDetails ?? null,
            order_index: ex.orderIndex ?? exerciseIndex,
          };
        });

        const { error: exercisesError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          throw exercisesError;
        }
      }
    }

    const workoutIdsToDelete = (existingWorkouts || [])
      .map((workout) => workout.id)
      .filter((id) => !retainedWorkoutIds.has(id));

    if (workoutIdsToDelete.length > 0) {
      const { error: deleteWorkoutsError } = await supabase
        .from('program_workouts')
        .delete()
        .in('id', workoutIdsToDelete);

      if (deleteWorkoutsError) {
        throw deleteWorkoutsError;
      }
    }

    return { success: true, serverId: program.id };
  } catch (error) {
    console.error('Failed to update program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function syncProgramToSupabase(
  program: Program,
  userId: string
): Promise<{ success: boolean; serverId?: string; error?: string }> {
  return isValidUUID(program.id)
    ? updateExistingProgram(program, userId)
    : uploadProgram(program, userId);
}

/**
 * Sync a program/template to Supabase.
 * Local programs are created remotely, existing server-backed programs are updated.
 * If offline or not authenticated, queues for later sync.
 */
export async function syncLocalProgram(program: Program): Promise<SyncResult> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await addToPendingQueue(program);
    return { success: true, queued: true };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    await addToPendingQueue(program);
    return { success: true, queued: true };
  }

  // Upload to Supabase
  const result = await syncProgramToSupabase(program, user.id);

  if (!result.success) {
    await addToPendingQueue(program);
    return { success: false, queued: true, error: result.error };
  }

  // Remove from pending queue if it was there
  await removeFromPendingQueue(program.id);

  return { success: true, serverId: result.serverId };
}

/**
 * Process the pending program sync queue
 * Returns map of localId -> serverId for successfully synced programs
 */
export async function processPendingProgramQueue(): Promise<{
  processed: number;
  failed: number;
  idMappings: Map<string, string>;
}> {
  const idMappings = new Map<string, string>();

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { processed: 0, failed: 0, idMappings };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { processed: 0, failed: 0, idMappings };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    return { processed: 0, failed: 0, idMappings };
  }

  const queue = await loadPendingQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, idMappings };
  }

  let processed = 0;
  let failed = 0;
  const remainingQueue: PendingProgramSyncItem[] = [];

  for (const item of queue) {
    const result = await syncProgramToSupabase(item.program, user.id);

    if (result.success) {
      processed++;
      if (result.serverId && item.program.id !== result.serverId) {
        idMappings.set(item.program.id, result.serverId);
      }
    } else {
      failed++;
      // Keep retrying until success. We still track retryCount for diagnostics,
      // but we do not discard queued templates/programs after a fixed limit.
      remainingQueue.push({
        ...item,
        retryCount: item.retryCount + 1,
      });
    }
  }

  await savePendingQueue(remainingQueue);

  return { processed, failed, idMappings };
}

/**
 * Get the count of pending program sync items
 */
export async function getPendingProgramSyncCount(): Promise<number> {
  const queue = await loadPendingQueue();
  return queue.length;
}

export async function getPendingProgramSyncIds(): Promise<string[]> {
  const queue = await loadPendingQueue();
  return queue.map((item) => item.program.id);
}

/**
 * Clear the pending program sync queue
 */
export async function clearPendingProgramQueue(): Promise<void> {
  await savePendingQueue([]);
}
