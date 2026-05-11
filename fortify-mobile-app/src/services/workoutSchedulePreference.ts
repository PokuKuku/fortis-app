import { WORKOUT_SCHEDULE_DAYS_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { normalizeWorkoutScheduleDays } from '@/src/utils/workoutSchedule';

export async function loadLocalWorkoutScheduleDays(): Promise<number[] | null> {
  const raw = await getScopedItem(WORKOUT_SCHEDULE_DAYS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeWorkoutScheduleDays(parsed) : null;
  } catch {
    return null;
  }
}

export async function saveLocalWorkoutScheduleDays(days: number[]): Promise<number[]> {
  const normalized = normalizeWorkoutScheduleDays(days);
  await setScopedItem(WORKOUT_SCHEDULE_DAYS_KEY, JSON.stringify(normalized));
  return normalized;
}
