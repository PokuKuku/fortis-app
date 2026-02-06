/**
 * Sticky Notes Sync Service
 *
 * Handles syncing exercise sticky notes to Supabase.
 * Supports offline-first: queues uploads when offline and syncs when online.
 */

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { PENDING_STICKY_NOTES_SYNC_KEY } from '@/src/constants/storageKeys';

// Types
interface StickyNoteDTO {
  id: string;
  user_id: string;
  exercise_id: string;
  set_index: number | null;
  content: string;
  show_in_workout: boolean;
  created_at: string;
  updated_at: string;
}

interface PendingStickyNoteSync {
  exerciseId: string;
  content: string | null; // null means delete
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
 * Check if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Load pending sync queue from AsyncStorage
 */
async function loadPendingQueue(): Promise<PendingStickyNoteSync[]> {
  try {
    const stored = await getScopedItem(PENDING_STICKY_NOTES_SYNC_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load pending sticky notes sync queue:', error);
  }
  return [];
}

/**
 * Save pending sync queue to AsyncStorage
 */
async function savePendingQueue(queue: PendingStickyNoteSync[]): Promise<void> {
  try {
    await setScopedItem(PENDING_STICKY_NOTES_SYNC_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to save pending sticky notes sync queue:', error);
  }
}

/**
 * Add a sticky note to the pending sync queue
 */
async function addToPendingQueue(exerciseId: string, content: string | null): Promise<void> {
  const queue = await loadPendingQueue();

  // Replace existing entry for same exercise (latest takes precedence)
  const filteredQueue = queue.filter(item => item.exerciseId !== exerciseId);

  filteredQueue.push({
    exerciseId,
    content,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  });

  await savePendingQueue(filteredQueue);
}

/**
 * Remove a sticky note from the pending sync queue
 */
async function removeFromPendingQueue(exerciseId: string): Promise<void> {
  const queue = await loadPendingQueue();
  const filtered = queue.filter(item => item.exerciseId !== exerciseId);
  await savePendingQueue(filtered);
}

async function upsertStickyNoteForUser(
  userId: string,
  exerciseId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const { data: updated, error: updateError } = await supabase
    .from('exercise_sticky_notes')
    .update({
      content,
      show_in_workout: true,
    })
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .is('set_index', null)
    .select('id');

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (updated && updated.length > 0) {
    return { success: true };
  }

  const { error: insertError } = await supabase
    .from('exercise_sticky_notes')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      set_index: null,
      content,
      show_in_workout: true,
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

/**
 * Sync a single sticky note to Supabase (upsert)
 */
export async function syncStickyNote(
  exerciseId: string,
  content: string
): Promise<{ success: boolean; queued?: boolean; error?: string }> {
  // Can't sync local exercise IDs
  if (!isValidUUID(exerciseId)) {
    return { success: false, error: 'Local exercise IDs cannot be synced' };
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await addToPendingQueue(exerciseId, content);
    return { success: true, queued: true };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    await addToPendingQueue(exerciseId, content);
    return { success: true, queued: true };
  }

  try {
    const { success, error } = await upsertStickyNoteForUser(user.id, exerciseId, content);
    if (!success) {
      console.error('Error syncing sticky note:', error);
      await addToPendingQueue(exerciseId, content);
      return { success: false, queued: true, error };
    }

    // Remove from pending queue if it was there
    await removeFromPendingQueue(exerciseId);
    return { success: true };
  } catch (err) {
    console.error('Error in syncStickyNote:', err);
    await addToPendingQueue(exerciseId, content);
    return {
      success: false,
      queued: true,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Delete a sticky note from Supabase
 */
export async function deleteStickyNoteFromCloud(
  exerciseId: string
): Promise<{ success: boolean; queued?: boolean; error?: string }> {
  // Can't sync local exercise IDs
  if (!isValidUUID(exerciseId)) {
    return { success: true }; // Nothing to delete from cloud
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await addToPendingQueue(exerciseId, null); // null = delete
    return { success: true, queued: true };
  }

  // Check if online
  const online = await isOnline();
  if (!online) {
    await addToPendingQueue(exerciseId, null);
    return { success: true, queued: true };
  }

  try {
    const { error } = await supabase
      .from('exercise_sticky_notes')
      .delete()
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId)
      .is('set_index', null);

    if (error) {
      console.error('Error deleting sticky note:', error);
      await addToPendingQueue(exerciseId, null);
      return { success: false, queued: true, error: error.message };
    }

    // Remove from pending queue
    await removeFromPendingQueue(exerciseId);
    return { success: true };
  } catch (err) {
    console.error('Error in deleteStickyNoteFromCloud:', err);
    await addToPendingQueue(exerciseId, null);
    return {
      success: false,
      queued: true,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all sticky notes from Supabase
 */
export async function fetchStickyNotesFromCloud(): Promise<Record<string, string>> {
  const notes: Record<string, string> = {};

  if (!isSupabaseConfigured()) {
    return notes;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notes;
  }

  try {
    const { data, error } = await supabase
      .from('exercise_sticky_notes')
      .select('exercise_id, content')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching sticky notes:', error);
      return notes;
    }

    for (const row of (data || [])) {
      notes[row.exercise_id] = row.content;
    }

    return notes;
  } catch (err) {
    console.error('Error in fetchStickyNotesFromCloud:', err);
    return notes;
  }
}

/**
 * Process the pending sticky notes sync queue
 */
export async function processPendingStickyNotesQueue(): Promise<{
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
  const remainingQueue: PendingStickyNoteSync[] = [];

  for (const item of queue) {
    // Skip local exercise IDs
    if (!isValidUUID(item.exerciseId)) {
      continue;
    }

    try {
      let success = false;

      if (item.content === null) {
        // Delete operation
        const { error } = await supabase
          .from('exercise_sticky_notes')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', item.exerciseId);

        success = !error;
      } else {
        // Upsert operation
        const upsertResult = await upsertStickyNoteForUser(
          user.id,
          item.exerciseId,
          item.content
        );
        success = upsertResult.success;
      }

      if (success) {
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
    } catch (err) {
      failed++;
      if (item.retryCount < 3) {
        remainingQueue.push({
          ...item,
          retryCount: item.retryCount + 1,
        });
      }
    }
  }

  await savePendingQueue(remainingQueue);

  if (processed > 0) {
    console.log(`Synced ${processed} sticky notes to cloud`);
  }

  return { processed, failed };
}

/**
 * Get the count of pending sticky note sync items
 */
export async function getPendingStickyNotesSyncCount(): Promise<number> {
  const queue = await loadPendingQueue();
  return queue.length;
}

/**
 * Clear the pending sticky notes sync queue
 */
export async function clearPendingStickyNotesQueue(): Promise<void> {
  await savePendingQueue([]);
}
