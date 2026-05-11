import { WORKOUT_SCHEDULE_DAYS_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { normalizeWorkoutScheduleDays } from '@/src/utils/workoutSchedule';

export async function loadLocalWorkoutScheduleDays(): Promise<number[]> {
  const raw = await getScopedItem(WORKOUT_SCHEDULE_DAYS_KEY);
  if (!raw) return [];

  try {
    return normalizeWorkoutScheduleDays(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveLocalWorkoutScheduleDays(days: number[]): Promise<number[]> {
  const normalized = normalizeWorkoutScheduleDays(days);
  await setScopedItem(WORKOUT_SCHEDULE_DAYS_KEY, JSON.stringify(normalized));
  return normalized;
}
