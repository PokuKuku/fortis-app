import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import type { ProgramProgressDTO, ProgramProgressHistoryEntry } from '@/src/types/workout';

export interface SyncedProgramProgressEntry {
  programId: string;
  currentCycle: number;
  completedDayNumbers: number[];
  history: ProgramProgressHistoryEntry[];
  startedAt: string | null;
  completedAt: string | null;
  lastWorkoutId: string | null;
  lastWorkoutAt: string | null;
  updatedAt: string | null;
}

const isValidUUID = (value: string): boolean => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
);

const normalizeCompletedDayNumbers = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  ).sort((a, b) => a - b);
};

const normalizeHistory = (value: unknown): ProgramProgressHistoryEntry[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const rawCycle = Number((item as { cycle?: unknown }).cycle);
      const completedAt = typeof (item as { completedAt?: unknown }).completedAt === 'string'
        ? (item as { completedAt: string }).completedAt
        : null;
      if (!Number.isInteger(rawCycle) || rawCycle < 1 || !completedAt) {
        return null;
      }
      return {
        cycle: rawCycle,
        completedDayNumbers: normalizeCompletedDayNumbers(
          (item as { completedDayNumbers?: unknown }).completedDayNumbers
        ),
        completedAt,
      };
    })
    .filter((item): item is ProgramProgressHistoryEntry => Boolean(item))
    .sort((a, b) => a.cycle - b.cycle);
};

const deriveCompletedDayNumbers = (dto: ProgramProgressDTO): number[] => {
  if (Array.isArray(dto.completed_day_numbers)) {
    return normalizeCompletedDayNumbers(dto.completed_day_numbers);
  }

  if (!Number.isInteger(dto.current_workout_index) || dto.current_workout_index <= 0) {
    return [];
  }

  return Array.from({ length: dto.current_workout_index }, (_, index) => index + 1);
};

const computeCurrentWorkoutIndex = (completedDayNumbers: number[]): number => {
  const completed = new Set(normalizeCompletedDayNumbers(completedDayNumbers));
  let dayNumber = 1;

  while (completed.has(dayNumber)) {
    dayNumber += 1;
  }

  return Math.max(0, dayNumber - 1);
};

const mapProgressFromDTO = (dto: ProgramProgressDTO): SyncedProgramProgressEntry => ({
  programId: dto.program_id,
  currentCycle: Math.max(1, Number(dto.current_cycle ?? 1)),
  completedDayNumbers: deriveCompletedDayNumbers(dto),
  history: normalizeHistory(dto.history),
  startedAt: dto.started_at ?? null,
  completedAt: dto.completed_at ?? null,
  lastWorkoutId: dto.last_workout_id ?? null,
  lastWorkoutAt: dto.last_workout_at ?? null,
  updatedAt: dto.updated_at ?? null,
});

const getAuthenticatedUserId = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

export async function fetchAllProgramProgressEntries(): Promise<SyncedProgramProgressEntry[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('user_program_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Failed to fetch program progress:', error.message);
      return [];
    }

    return (data ?? []).map((row) => mapProgressFromDTO(row as ProgramProgressDTO));
  } catch (error) {
    console.warn('Failed to fetch program progress:', error);
    return [];
  }
}

export async function upsertProgramProgressEntry(
  entry: SyncedProgramProgressEntry
): Promise<SyncedProgramProgressEntry | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId || !isValidUUID(entry.programId)) {
    return null;
  }

  const completedDayNumbers = normalizeCompletedDayNumbers(entry.completedDayNumbers);
  const history = normalizeHistory(entry.history);
  const startedAt = entry.startedAt ?? entry.lastWorkoutAt ?? new Date().toISOString();
  const completedAt = entry.completedAt ?? history[history.length - 1]?.completedAt ?? null;

  try {
    const { data, error } = await supabase
      .from('user_program_progress')
      .upsert({
        user_id: userId,
        program_id: entry.programId,
        current_workout_index: computeCurrentWorkoutIndex(completedDayNumbers),
        current_cycle: Math.max(1, Number(entry.currentCycle ?? 1)),
        started_at: startedAt,
        completed_at: completedAt,
        last_workout_id: entry.lastWorkoutId ?? null,
        last_workout_at: entry.lastWorkoutAt ?? null,
        completed_day_numbers: completedDayNumbers,
        history,
      }, {
        onConflict: 'user_id,program_id',
      })
      .select('*')
      .single();

    if (error) {
      console.warn('Failed to upsert program progress:', error.message);
      return null;
    }

    return mapProgressFromDTO(data as ProgramProgressDTO);
  } catch (error) {
    console.warn('Failed to upsert program progress:', error);
    return null;
  }
}

export async function deleteProgramProgress(programId: string): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  if (!userId || !isValidUUID(programId)) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_program_progress')
      .delete()
      .eq('user_id', userId)
      .eq('program_id', programId);

    if (error) {
      console.warn('Failed to delete program progress:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to delete program progress:', error);
    return false;
  }
}
