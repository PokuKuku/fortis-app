/**
 * Workout History Service
 *
 * Handles syncing completed workout sessions to Supabase.
 * Supports offline-first: queues uploads when offline and syncs when online.
 */

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { WorkoutSession, WorkoutExercise, WorkoutSet, WeightUnit } from '@/src/types/workout';
import { isLocalId } from '@/src/utils/localIds';
import { PENDING_SYNC_QUEUE_KEY } from '@/src/constants/storageKeys';
import { isCustomExercise, getCustomExercises, getAllExercises } from '@/src/services/exerciseService';

// Types for Supabase DTOs
interface WorkoutSessionInsert {
  user_id: string;
  local_id: string;
  name: string;
  notes: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  program_id?: string;
  program_workout_id?: string;
  is_synced: boolean;
}

interface WorkoutSetInsert {
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit | null;
  rpe: number | null;
  rest_seconds: number | null;
  notes: string;
  is_warmup: boolean;
  is_dropset: boolean;
  is_failure: boolean;
  order_index: number;
  local_id: string;
}

// Pending sync item stored in queue
interface PendingSyncItem {
  session: WorkoutSession;
  queuedAt: string;
  retryCount: number;
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
 * Load pending sync queue from AsyncStorage
 */
async function loadPendingQueue(): Promise<PendingSyncItem[]> {
  try {
    const stored = await getScopedItem(PENDING_SYNC_QUEUE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load pending sync queue:', error);
  }
  return [];
}

/**
 * Save pending sync queue to AsyncStorage
 */
async function savePendingQueue(queue: PendingSyncItem[]): Promise<void> {
  try {
    await setScopedItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to save pending sync queue:', error);
  }
}

/**
 * Add a session to the pending sync queue
 */
async function addToPendingQueue(session: WorkoutSession): Promise<void> {
  const queue = await loadPendingQueue();

  // Check if already in queue (by localId)
  const exists = queue.some(item => item.session.localId === session.localId);
  if (exists) {
    return;
  }

  queue.push({
    session,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  });

  await savePendingQueue(queue);
}

/**
 * Remove a session from the pending sync queue
 */
async function removeFromPendingQueue(localId: string): Promise<void> {
  const queue = await loadPendingQueue();
  const filtered = queue.filter(item => item.session.localId !== localId);
  await savePendingQueue(filtered);
}

/**
 * Sync custom exercises to Supabase before inserting workout sets
 * This ensures FK constraints on exercise_id are satisfied
 */
async function syncCustomExercisesToSupabase(
  exerciseIds: string[],
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Filter to only custom exercise IDs
  const customIds = exerciseIds.filter(isCustomExercise);
  if (customIds.length === 0) {
    return { success: true };
  }

  try {
    // Get custom exercises from local storage
    const customExercises = await getCustomExercises();
    const exercisesToSync = customExercises.filter(ex => customIds.includes(ex.id));

    if (exercisesToSync.length === 0) {
      console.warn('Custom exercise IDs found but no matching exercises in local storage:', customIds);
      return { success: false, error: 'Custom exercises not found in local storage' };
    }

    // Upsert custom exercises to Supabase
    for (const exercise of exercisesToSync) {
      // Generate slug from name if not provided
      const slug = exercise.slug || exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('exercises')
        .upsert({
          id: exercise.id,
          name: exercise.name,
          slug: slug,
          level: 'intermediate', // Default level for custom exercises
          equipment: exercise.equipment || 'body only',
          category: exercise.category || 'strength',
          primary_muscles: exercise.primaryMuscles || ['unknown'],
          secondary_muscles: exercise.secondaryMuscles || [],
          instructions: exercise.instructions || ['Custom exercise'],
          images: exercise.images || [],
          is_custom: true,
          created_by: userId,
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Failed to sync custom exercise:', exercise.name, error);
        return { success: false, error: `Failed to sync custom exercise: ${exercise.name}` };
      }
    }

    console.log(`Synced ${exercisesToSync.length} custom exercises to Supabase`);
    return { success: true };
  } catch (error) {
    console.error('Error syncing custom exercises:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error syncing custom exercises'
    };
  }
}

/**
 * Resolve exercise IDs from local format (RapidAPI short IDs) to Supabase UUIDs.
 *
 * This handles the data source mapping between RapidAPI ExerciseDB and Supabase:
 * 1. First tries to match by exercise NAME (case-insensitive)
 * 2. Falls back to matching by SLUG (which stores the RapidAPI ID like "72BC5Za")
 *
 * For custom exercises, we use the local ID directly since they're synced to Supabase
 * with the same ID format.
 */
async function resolveExerciseIds(
  exercises: WorkoutExercise[]
): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();

  // Collect exercise names and IDs for non-custom exercises
  const exerciseNames: string[] = [];
  const exerciseLocalIds: string[] = [];
  const customExerciseIds: string[] = [];

  for (const exercise of exercises) {
    if (isCustomExercise(exercise.exerciseId)) {
      // Custom exercises use their local ID directly in Supabase
      customExerciseIds.push(exercise.exerciseId);
      idMap.set(exercise.exerciseId, exercise.exerciseId);
    } else {
      exerciseNames.push(exercise.exerciseName);
      exerciseLocalIds.push(exercise.exerciseId);
    }
  }

  if (exerciseNames.length === 0) {
    return idMap;
  }

  try {
    // Query Supabase for exercises by name OR slug (RapidAPI ID)
    // Slug contains the RapidAPI ID, so we can match by that as a fallback
    const { data: supabaseExercises, error } = await supabase
      .from('exercises')
      .select('id, name, slug')
      .or(`name.in.(${exerciseNames.map(n => `"${n}"`).join(',')}),slug.in.(${exerciseLocalIds.map(id => `"${id}"`).join(',')})`);

    if (error) {
      console.error('[ResolveExerciseIds] Failed to query exercises:', error);
      // Return what we have - custom exercises at least
      return idMap;
    }

    if (!supabaseExercises || supabaseExercises.length === 0) {
      console.warn('[ResolveExerciseIds] No matching exercises found for names:', exerciseNames.slice(0, 5));
      return idMap;
    }

    // Build lookup maps (case-insensitive for name, exact for slug)
    const nameToUuid = new Map<string, string>();
    const slugToUuid = new Map<string, string>();
    for (const ex of supabaseExercises) {
      nameToUuid.set(ex.name.toLowerCase(), ex.id);
      if (ex.slug) {
        slugToUuid.set(ex.slug, ex.id);
      }
    }

    // Map local exercise IDs to Supabase UUIDs
    for (const exercise of exercises) {
      if (isCustomExercise(exercise.exerciseId)) {
        continue; // Already handled
      }

      // Try matching by name first
      let supabaseId = nameToUuid.get(exercise.exerciseName.toLowerCase());

      // Fallback to matching by slug (RapidAPI ID)
      if (!supabaseId) {
        supabaseId = slugToUuid.get(exercise.exerciseId);
      }

      if (supabaseId) {
        idMap.set(exercise.exerciseId, supabaseId);
      } else {
        console.warn(`[ResolveExerciseIds] No Supabase match for exercise: "${exercise.exerciseName}" (local ID: ${exercise.exerciseId})`);
      }
    }

    console.log(`[ResolveExerciseIds] Resolved ${idMap.size}/${exercises.length} exercise IDs`);
    return idMap;
  } catch (error) {
    console.error('[ResolveExerciseIds] Error resolving exercise IDs:', error);
    return idMap;
  }
}

/**
 * Calculate workout duration in seconds
 */
function calculateDuration(session: WorkoutSession): number | null {
  if (!session.completedAt) return null;
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.completedAt).getTime();
  return Math.floor((end - start) / 1000);
}

/**
 * Upload a workout session to Supabase
 */
async function uploadSession(
  session: WorkoutSession,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert the workout session
    const sessionInsert: WorkoutSessionInsert = {
      user_id: userId,
      local_id: session.localId,
      name: session.name,
      notes: session.notes || '',
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt?.toISOString() || null,
      duration_seconds: calculateDuration(session),
      program_id: isLocalId(session.programId) ? undefined : session.programId ?? undefined,
      program_workout_id: isLocalId(session.programWorkoutId) ? undefined : session.programWorkoutId ?? undefined,
      is_synced: true,
    };

    const { data: insertedSession, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert(sessionInsert)
      .select('id')
      .single();

    if (sessionError) {
      // Check if it's a duplicate (already synced)
      if (sessionError.code === '23505') {
        // Unique constraint violation - already exists
        return { success: true };
      }
      throw sessionError;
    }

    if (!insertedSession?.id) {
      throw new Error('No session ID returned from insert');
    }

    // Collect exercise IDs and sync custom exercises first
    const exerciseIds = session.exercises.map(ex => ex.exerciseId);
    const customSyncResult = await syncCustomExercisesToSupabase(exerciseIds, userId);
    if (!customSyncResult.success) {
      console.error('Failed to sync custom exercises:', customSyncResult.error);
      // Continue anyway - standard exercises should still work
    }

    // Resolve exercise IDs to Supabase UUIDs (handles RapidAPI ID → UUID mapping)
    const exerciseIdMap = await resolveExerciseIds(session.exercises);

    // Insert all sets for each exercise
    const setsToInsert: WorkoutSetInsert[] = [];
    let globalOrderIndex = 0;
    let skippedIncomplete = 0;
    let skippedUnresolved = 0;

    for (const exercise of session.exercises) {
      // Get the Supabase UUID for this exercise
      const resolvedExerciseId = exerciseIdMap.get(exercise.exerciseId);
      if (!resolvedExerciseId) {
        console.warn(`[WorkoutSync] Skipping sets for unresolved exercise: "${exercise.exerciseName}" (local ID: ${exercise.exerciseId})`);
        skippedUnresolved += exercise.sets.filter(s => s.isCompleted).length;
        continue;
      }

      for (const set of exercise.sets) {
        if (!set.isCompleted) {
          skippedIncomplete++;
          continue; // Only sync completed sets
        }

        setsToInsert.push({
          session_id: insertedSession.id,
          exercise_id: resolvedExerciseId,
          set_number: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          weight_unit: set.weightUnit ?? null,
          rpe: set.rpe,
          rest_seconds: set.restSeconds,
          notes: set.notes || '',
          is_warmup: set.setType === 'warmup',
          is_dropset: set.setType === 'dropset',
          is_failure: set.setType === 'failure',
          order_index: globalOrderIndex++,
          local_id: set.localId,
        });
      }
    }

    // Log diagnostic info
    console.log(`[WorkoutSync] Session "${session.name}": ${setsToInsert.length} completed sets to sync, ${skippedIncomplete} incomplete skipped, ${skippedUnresolved} unresolved exercises skipped`);
    if (setsToInsert.length > 0) {
      console.log(`[WorkoutSync] Exercise IDs: ${[...new Set(setsToInsert.map(s => s.exercise_id))].join(', ')}`);
    }

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert);

      if (setsError) {
        console.error('[WorkoutSync] Failed to insert workout sets:', {
          error: setsError,
          code: setsError.code,
          message: setsError.message,
          details: setsError.details,
          hint: setsError.hint,
          sampleExerciseIds: setsToInsert.slice(0, 3).map(s => s.exercise_id),
        });
        // Don't fail the whole sync if sets fail - session is already saved
        // But log the error clearly so we can diagnose issues
      } else {
        console.log(`[WorkoutSync] Successfully synced ${setsToInsert.length} sets for session "${session.name}"`);
      }
    } else {
      console.warn(`[WorkoutSync] No completed sets to sync for session "${session.name}"`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to upload session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

const isAbortError = (error: unknown): boolean => {
  if (!error) return false;

  const details = [
    (error as { name?: string }).name,
    (error as { message?: string }).message,
    (error as { details?: string }).details,
    (error as { hint?: string }).hint,
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  return /abort/i.test(details);
};

/**
 * Sync a completed workout session to Supabase
 * If offline or not authenticated, queues for later sync
 */
export async function syncWorkoutSession(
  session: WorkoutSession
): Promise<{ success: boolean; queued?: boolean; error?: string }> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Not authenticated - queue for later
    await addToPendingQueue(session);
    return { success: true, queued: true };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    await addToPendingQueue(session);
    return { success: true, queued: true };
  }

  // Upload to Supabase
  const result = await uploadSession(session, user.id);

  if (!result.success) {
    // Failed - queue for later retry
    await addToPendingQueue(session);
    return { success: false, queued: true, error: result.error };
  }

  return { success: true };
}

/**
 * Process the pending sync queue
 * Should be called when app comes online or user signs in
 */
export async function processPendingQueue(): Promise<{
  processed: number;
  failed: number;
  syncedLocalIds: string[];
}> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { processed: 0, failed: 0, syncedLocalIds: [] };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { processed: 0, failed: 0, syncedLocalIds: [] };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    return { processed: 0, failed: 0, syncedLocalIds: [] };
  }

  const queue = await loadPendingQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, syncedLocalIds: [] };
  }

  let processed = 0;
  let failed = 0;
  const syncedLocalIds: string[] = [];
  const remainingQueue: PendingSyncItem[] = [];

  for (const item of queue) {
    // Rehydrate dates
    const session: WorkoutSession = {
      ...item.session,
      startedAt: new Date(item.session.startedAt),
      completedAt: item.session.completedAt
        ? new Date(item.session.completedAt)
        : null,
    };

    const result = await uploadSession(session, user.id);

    if (result.success) {
      processed++;
      syncedLocalIds.push(session.localId);
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

  return { processed, failed, syncedLocalIds };
}

/**
 * Fetch workout history from Supabase
 */
export async function fetchWorkoutHistory(
  limit: number = 50
): Promise<{ sessions: WorkoutSession[]; error?: string }> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { sessions: [], error: 'Supabase not configured' };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { sessions: [], error: 'Not authenticated' };
  }

  // Build exercise name lookup map
  const exercises = await getAllExercises();
  const exerciseNameById = new Map<string, string>();
  exercises.forEach(ex => {
    exerciseNameById.set(ex.id, ex.name);
    if (ex.slug) {
      exerciseNameById.set(ex.slug, ex.name);
    }
  });

  try {
    // Fetch sessions with their sets (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        local_id,
        name,
        notes,
        started_at,
        completed_at,
        duration_seconds,
        program_id,
        program_workout_id,
        workout_sets (
          id,
          local_id,
          exercise_id,
          set_number,
          reps,
          weight,
          weight_unit,
          rpe,
          rest_seconds,
          notes,
          is_warmup,
          is_dropset,
          is_failure,
          order_index
        )
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      if (isAbortError(error)) {
        console.warn('Workout history fetch aborted');
        return { sessions: [] };
      }
      throw error;
    }

    // Transform to WorkoutSession format
    const workoutSessions: WorkoutSession[] = (sessions || []).map(session => {
      // Group sets by exercise_id
      const exerciseMap = new Map<string, WorkoutSet[]>();

      for (const set of session.workout_sets || []) {
        const exerciseId = set.exercise_id;
        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, []);
        }

        exerciseMap.get(exerciseId)!.push({
          localId: set.local_id || set.id,
          setNumber: set.set_number,
          setType: set.is_warmup ? 'warmup'
            : set.is_dropset ? 'dropset'
            : set.is_failure ? 'failure'
            : 'normal',
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe,
          restSeconds: set.rest_seconds,
          notes: set.notes || '',
          isCompleted: true, // All synced sets are completed
          orderIndex: set.order_index,
          weightUnit: set.weight_unit ?? null,
        });
      }

      // Convert to WorkoutExercise array
      const exercises: WorkoutExercise[] = Array.from(exerciseMap.entries())
        .map(([exerciseId, sets], index) => ({
          localId: `${session.local_id}-ex-${index}`,
          exerciseId,
          exerciseName: exerciseNameById.get(exerciseId) || exerciseId,
          sets: sets.sort((a, b) => a.orderIndex - b.orderIndex),
          notes: '',
          orderIndex: index,
        }));

      return {
        localId: session.local_id || session.id,
        userId: user.id,
        name: session.name || '',
        notes: session.notes || '',
        startedAt: new Date(session.started_at),
        completedAt: session.completed_at ? new Date(session.completed_at) : null,
        programId: session.program_id,
        programWorkoutId: session.program_workout_id,
        exercises,
        isSynced: true,
      };
    });

    return { sessions: workoutSessions };
  } catch (error: any) {
    // Don't show error for timeout/abort - just return empty
    if (isAbortError(error)) {
      console.warn('Workout history fetch aborted');
      return { sessions: [] };
    }
    console.warn('Failed to fetch workout history:', error);
    return {
      sessions: [],
      error: typeof error?.message === 'string' ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  const queue = await loadPendingQueue();
  return queue.length;
}

/**
 * Clear the pending sync queue
 */
export async function clearPendingQueue(): Promise<void> {
  await savePendingQueue([]);
}

/**
 * Re-sync workout sets for sessions that exist in Supabase but have no sets.
 * This is a recovery function for historical data where sessions synced but sets failed.
 *
 * @param localSessions - Array of completed sessions from local storage
 * @returns Summary of the resync operation
 */
export async function resyncMissingSets(
  localSessions: WorkoutSession[]
): Promise<{
  checked: number;
  resynced: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    checked: 0,
    resynced: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    result.errors.push('Supabase not configured');
    return result;
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    result.errors.push('Not authenticated');
    return result;
  }

  console.log(`[ResyncSets] Starting resync for ${localSessions.length} local sessions`);

  for (const session of localSessions) {
    result.checked++;

    try {
      // Look up the Supabase session by local_id
      const { data: dbSession, error: lookupError } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('local_id', session.localId)
        .eq('user_id', user.id)
        .single();

      if (lookupError || !dbSession) {
        // Session doesn't exist in Supabase - skip (will be handled by normal sync)
        continue;
      }

      // Check if sets already exist for this session
      const { count: setCount, error: countError } = await supabase
        .from('workout_sets')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', dbSession.id);

      if (countError) {
        console.warn(`[ResyncSets] Failed to count sets for session ${session.localId}:`, countError);
        continue;
      }

      // If sets already exist, skip
      if (setCount && setCount > 0) {
        continue;
      }

      // Count completed sets in local session
      const completedSets = session.exercises.flatMap(ex =>
        ex.sets.filter(s => s.isCompleted)
      );

      if (completedSets.length === 0) {
        console.log(`[ResyncSets] Session "${session.name}" has no completed sets locally`);
        continue;
      }

      console.log(`[ResyncSets] Session "${session.name}" needs resync: ${completedSets.length} completed sets`);

      // Sync custom exercises first
      const exerciseIds = session.exercises.map(ex => ex.exerciseId);
      const customSyncResult = await syncCustomExercisesToSupabase(exerciseIds, user.id);
      if (!customSyncResult.success) {
        console.warn(`[ResyncSets] Failed to sync custom exercises for session ${session.localId}:`, customSyncResult.error);
        // Continue anyway - standard exercises should still work
      }

      // Resolve exercise IDs to Supabase UUIDs (handles RapidAPI ID → UUID mapping)
      const exerciseIdMap = await resolveExerciseIds(session.exercises);

      // Build sets to insert
      const setsToInsert: WorkoutSetInsert[] = [];
      let globalOrderIndex = 0;
      let skippedUnresolved = 0;

      for (const exercise of session.exercises) {
        // Get the Supabase UUID for this exercise
        const resolvedExerciseId = exerciseIdMap.get(exercise.exerciseId);
        if (!resolvedExerciseId) {
          console.warn(`[ResyncSets] Skipping sets for unresolved exercise: "${exercise.exerciseName}" (local ID: ${exercise.exerciseId})`);
          skippedUnresolved += exercise.sets.filter(s => s.isCompleted).length;
          continue;
        }

        for (const set of exercise.sets) {
          if (!set.isCompleted) continue;

          setsToInsert.push({
            session_id: dbSession.id,
            exercise_id: resolvedExerciseId,
            set_number: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            weight_unit: set.weightUnit ?? null,
            rpe: set.rpe,
            rest_seconds: set.restSeconds,
            notes: set.notes || '',
            is_warmup: set.setType === 'warmup',
            is_dropset: set.setType === 'dropset',
            is_failure: set.setType === 'failure',
            order_index: globalOrderIndex++,
            local_id: set.localId,
          });
        }
      }

      // Check if we have any sets to insert after resolution
      if (setsToInsert.length === 0) {
        if (skippedUnresolved > 0) {
          console.warn(`[ResyncSets] All ${skippedUnresolved} sets for session "${session.name}" had unresolved exercises - skipping`);
          result.failed++;
          result.errors.push(`${session.name}: All exercises could not be matched to database`);
        }
        continue;
      }

      // Insert sets
      const { error: insertError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert);

      if (insertError) {
        console.error(`[ResyncSets] Failed to insert sets for session "${session.name}":`, {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
        });
        result.failed++;
        result.errors.push(`${session.name}: ${insertError.message}`);
      } else {
        const unresolvedMsg = skippedUnresolved > 0 ? ` (${skippedUnresolved} sets skipped due to unresolved exercises)` : '';
        console.log(`[ResyncSets] Successfully resynced ${setsToInsert.length} sets for session "${session.name}"${unresolvedMsg}`);
        result.resynced++;
      }
    } catch (error) {
      console.error(`[ResyncSets] Error processing session ${session.localId}:`, error);
      result.failed++;
      result.errors.push(
        `${session.name || session.localId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  console.log(`[ResyncSets] Complete: checked=${result.checked}, resynced=${result.resynced}, failed=${result.failed}`);
  return result;
}
