/**
 * Workout History Service
 *
 * Handles syncing completed workout sessions to Supabase.
 * Supports offline-first: queues uploads when offline and syncs when online.
 */

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { WorkoutSession, WorkoutExercise, WorkoutSet } from '@/src/types/workout';
import { isLocalId } from '@/src/utils/localIds';
import { PENDING_SYNC_QUEUE_KEY } from '@/src/constants/storageKeys';

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
  weight_unit: 'lbs' | 'kg' | null;
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
      program_id: isLocalId(session.programId) ? null : session.programId,
      program_workout_id: isLocalId(session.programWorkoutId) ? null : session.programWorkoutId,
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

    // Insert all sets for each exercise
    const setsToInsert: WorkoutSetInsert[] = [];
    let globalOrderIndex = 0;

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (!set.isCompleted) continue; // Only sync completed sets

        setsToInsert.push({
          session_id: insertedSession.id,
          exercise_id: exercise.exerciseId,
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

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert);

      if (setsError) {
        console.warn('Failed to insert workout sets:', setsError);
        // Don't fail the whole sync if sets fail - session is already saved
      }
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
}> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { processed: 0, failed: 0 };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { processed: 0, failed: 0 };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    return { processed: 0, failed: 0 };
  }

  const queue = await loadPendingQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;
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

  return { processed, failed };
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

    if (error) throw error;

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
          exerciseName: exerciseId, // Would need to look up name from exercise library
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
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      console.warn('Workout history fetch timed out');
      return { sessions: [] };
    }
    console.error('Failed to fetch workout history:', error);
    return {
      sessions: [],
      error: error instanceof Error ? error.message : 'Unknown error'
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
