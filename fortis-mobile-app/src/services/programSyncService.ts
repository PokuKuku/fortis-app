/**
 * Program Sync Service
 *
 * Handles syncing user-created programs/templates to Supabase.
 * Supports offline-first: queues uploads when offline and syncs when online.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { Program, ProgramWorkout, ProgramExercise } from '@/src/types/workout';
import { PENDING_PROGRAM_SYNC_QUEUE_KEY } from '@/src/constants/storageKeys';

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

/**
 * Check if program has any local (non-UUID) exercise IDs
 */
function hasLocalExercises(program: Program): boolean {
  return program.workouts.some(workout =>
    workout.exercises.some(ex => !isValidUUID(ex.exerciseId))
  );
}

/**
 * Load pending sync queue from AsyncStorage
 */
async function loadPendingQueue(): Promise<PendingProgramSyncItem[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_PROGRAM_SYNC_QUEUE_KEY);
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
    await AsyncStorage.setItem(PENDING_PROGRAM_SYNC_QUEUE_KEY, JSON.stringify(queue));
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
  const exists = queue.some(item => item.program.id === program.id);
  if (exists) {
    return;
  }

  queue.push({
    program,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  });

  await savePendingQueue(queue);
}

/**
 * Remove a program from the pending sync queue
 */
async function removeFromPendingQueue(programId: string): Promise<void> {
  const queue = await loadPendingQueue();
  const filtered = queue.filter(item => item.program.id !== programId);
  await savePendingQueue(filtered);
}

/**
 * Upload a program to Supabase
 * Returns the server-assigned UUID on success
 */
async function uploadProgram(
  program: Program,
  userId: string
): Promise<{ success: boolean; serverId?: string; error?: string }> {
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
        console.warn('Failed to insert workout:', workoutError);
        continue;
      }

      // Insert exercises for this workout
      if (workout.exercises.length > 0) {
        const exercisesToInsert = workout.exercises.map((ex, index) => ({
          program_workout_id: insertedWorkout.id,
          exercise_id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds || 120,
          notes: ex.notes,
          order_index: ex.orderIndex ?? index,
        }));

        const { error: exercisesError } = await supabase
          .from('program_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.warn('Failed to insert exercises:', exercisesError);
        }
      }
    }

    return { success: true, serverId };
  } catch (error) {
    console.error('Failed to upload program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync a local program to Supabase
 * If offline or not authenticated, queues for later sync
 */
export async function syncLocalProgram(program: Program): Promise<SyncResult> {
  // Only sync programs with local- prefix
  if (!program.id.startsWith('local-')) {
    return { success: true }; // Already synced or server-created
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Programs with local exercise IDs can't be synced
  if (hasLocalExercises(program)) {
    return { success: false, error: 'Program contains local exercises' };
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
  const result = await uploadProgram(program, user.id);

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
    // Skip programs with local exercises
    if (hasLocalExercises(item.program)) {
      remainingQueue.push(item);
      continue;
    }

    const result = await uploadProgram(item.program, user.id);

    if (result.success) {
      processed++;
      if (result.serverId) {
        idMappings.set(item.program.id, result.serverId);
      }
    } else {
      failed++;
      // Keep in queue if under retry limit
      if (item.retryCount < 3) {
        remainingQueue.push({
          ...item,
          retryCount: item.retryCount + 1,
        });
      }
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

/**
 * Clear the pending program sync queue
 */
export async function clearPendingProgramQueue(): Promise<void> {
  await savePendingQueue([]);
}
