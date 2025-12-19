/**
 * Program Progress Service
 *
 * Handles tracking user's position within workout programs.
 * Syncs to user_program_progress table in Supabase.
 */

import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { ProgramProgress, ProgramProgressDTO } from '@/src/types/workout';

/**
 * Map DTO to domain model
 */
function mapProgressFromDTO(dto: ProgramProgressDTO): ProgramProgress {
  return {
    id: dto.id,
    userId: dto.user_id,
    programId: dto.program_id,
    currentWorkoutIndex: dto.current_workout_index,
    currentCycle: dto.current_cycle,
    startedAt: dto.started_at,
    completedAt: dto.completed_at,
    lastWorkoutId: dto.last_workout_id,
    lastWorkoutAt: dto.last_workout_at,
  };
}

/**
 * Fetch user's progress for a specific program
 */
export async function fetchProgramProgress(
  programId: string
): Promise<ProgramProgress | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_program_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .single();

    if (error) {
      // No progress found is not an error
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching program progress:', error);
      return null;
    }

    return mapProgressFromDTO(data as ProgramProgressDTO);
  } catch (err) {
    console.error('Error in fetchProgramProgress:', err);
    return null;
  }
}

/**
 * Start a program (initialize progress at workout index 0)
 */
export async function startProgram(programId: string): Promise<ProgramProgress | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  try {
    // Check if progress already exists
    const existing = await fetchProgramProgress(programId);
    if (existing) {
      return existing;
    }

    // Create new progress record
    const { data, error } = await supabase
      .from('user_program_progress')
      .insert({
        user_id: user.id,
        program_id: programId,
        current_workout_index: 0,
        current_cycle: 1,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting program:', error);
      return null;
    }

    return mapProgressFromDTO(data as ProgramProgressDTO);
  } catch (err) {
    console.error('Error in startProgram:', err);
    return null;
  }
}

/**
 * Advance progress after completing a workout
 * Increments workout index, wraps to next cycle if needed
 */
export async function advanceProgress(
  programId: string,
  completedWorkoutSessionId: string,
  totalWorkoutsInProgram: number
): Promise<ProgramProgress | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  try {
    // Get current progress
    const current = await fetchProgramProgress(programId);
    if (!current) {
      // No progress exists, start the program first
      return startProgram(programId);
    }

    // Calculate next index and cycle
    let nextIndex = current.currentWorkoutIndex + 1;
    let nextCycle = current.currentCycle;

    // Wrap around if we've completed all workouts
    if (nextIndex >= totalWorkoutsInProgram) {
      nextIndex = 0;
      nextCycle += 1;
    }

    // Update progress
    const { data, error } = await supabase
      .from('user_program_progress')
      .update({
        current_workout_index: nextIndex,
        current_cycle: nextCycle,
        last_workout_id: completedWorkoutSessionId,
        last_workout_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .select()
      .single();

    if (error) {
      console.error('Error advancing progress:', error);
      return null;
    }

    return mapProgressFromDTO(data as ProgramProgressDTO);
  } catch (err) {
    console.error('Error in advanceProgress:', err);
    return null;
  }
}

/**
 * Reset progress for a program (start over)
 */
export async function resetProgress(programId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_program_progress')
      .update({
        current_workout_index: 0,
        current_cycle: 1,
        started_at: new Date().toISOString(),
        completed_at: null,
        last_workout_id: null,
        last_workout_at: null,
      })
      .eq('user_id', user.id)
      .eq('program_id', programId);

    if (error) {
      console.error('Error resetting progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in resetProgress:', err);
    return false;
  }
}

/**
 * Mark a program as completed
 */
export async function markProgramCompleted(programId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_program_progress')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('program_id', programId);

    if (error) {
      console.error('Error marking program completed:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in markProgramCompleted:', err);
    return false;
  }
}

/**
 * Fetch all program progress for the current user
 */
export async function fetchAllProgramProgress(): Promise<ProgramProgress[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_program_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching all program progress:', error);
      return [];
    }

    return (data || []).map(dto => mapProgressFromDTO(dto as ProgramProgressDTO));
  } catch (err) {
    console.error('Error in fetchAllProgramProgress:', err);
    return [];
  }
}

/**
 * Delete progress for a program
 */
export async function deleteProgress(programId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_program_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('program_id', programId);

    if (error) {
      console.error('Error deleting progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteProgress:', err);
    return false;
  }
}
