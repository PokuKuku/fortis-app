import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { getActiveScopedStorageUser } from '@/src/utils/scopedStorage';
import type { StreakPausePeriod } from '@/src/utils/workoutSchedule';

export type PersistedStreakPauseState = {
  isPaused: boolean;
  pausedAt: string | null;
  pausedStreakCount: number | null;
  streakPausePeriods: StreakPausePeriod[];
  streakPauseMonthKey: string;
  streakPausesUsedThisMonth: number;
  streakFreezePassAvailable: boolean;
  streakFreezePassEarnedAt: string | null;
  streakFreezePassMilestoneDateKey: string | null;
  updatedAt: string;
};

async function resolveUserId(): Promise<string | null> {
  const scopedUserId = getActiveScopedStorageUser();
  if (scopedUserId !== undefined) return scopedUserId;
  if (!isSupabaseConfigured()) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function fetchCloudStreakPauseState(): Promise<unknown | null> {
  if (!isSupabaseConfigured()) return null;
  const userId = await resolveUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('streak_pause_state')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.streak_pause_state ?? null;
}

export async function syncCloudStreakPauseState(
  state: PersistedStreakPauseState
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const userId = await resolveUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('profiles')
    .update({ streak_pause_state: state })
    .eq('id', userId);

  if (error) throw error;
}
