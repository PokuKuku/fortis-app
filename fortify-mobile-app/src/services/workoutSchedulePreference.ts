import {
  WORKOUT_SCHEDULE_DAYS_KEY,
  WORKOUT_SCHEDULE_HISTORY_KEY,
} from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  buildWorkoutScheduleHistoryForChange,
  normalizeWorkoutScheduleDays,
  normalizeWorkoutScheduleHistory,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';

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

export async function loadLocalWorkoutScheduleHistory(): Promise<WorkoutScheduleHistoryEntry[]> {
  const raw = await getScopedItem(WORKOUT_SCHEDULE_HISTORY_KEY);
  if (!raw) return [];

  try {
    return normalizeWorkoutScheduleHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveLocalWorkoutScheduleHistory(
  history: WorkoutScheduleHistoryEntry[]
): Promise<WorkoutScheduleHistoryEntry[]> {
  const normalized = normalizeWorkoutScheduleHistory(history);
  await setScopedItem(WORKOUT_SCHEDULE_HISTORY_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function recordWorkoutScheduleChange({
  previousDays,
  nextDays,
  currentHistory,
  effectiveDate = new Date(),
}: {
  previousDays: number[];
  nextDays: number[];
  currentHistory?: WorkoutScheduleHistoryEntry[];
  effectiveDate?: Date;
}): Promise<WorkoutScheduleHistoryEntry[]> {
  const sourceHistory = currentHistory ?? await loadLocalWorkoutScheduleHistory();
  return saveLocalWorkoutScheduleHistory(
    buildWorkoutScheduleHistoryForChange({
      previousDays,
      nextDays,
      currentHistory: sourceHistory,
      effectiveDate,
    })
  );
}
