import {
  WORKOUT_SCHEDULE_DAYS_KEY,
  WORKOUT_SCHEDULE_HISTORY_KEY,
} from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  areWorkoutScheduleDaysEqual,
  getDateKey,
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
  effectiveDate = new Date(),
}: {
  previousDays: number[];
  nextDays: number[];
  effectiveDate?: Date;
}): Promise<WorkoutScheduleHistoryEntry[]> {
  const normalizedPrevious = normalizeWorkoutScheduleDays(previousDays);
  const normalizedNext = normalizeWorkoutScheduleDays(nextDays);
  const currentHistory = await loadLocalWorkoutScheduleHistory();

  if (areWorkoutScheduleDaysEqual(normalizedPrevious, normalizedNext)) {
    if (currentHistory.length > 0) return currentHistory;
    return saveLocalWorkoutScheduleHistory([
      {
        effectiveDateKey: '1970-01-01',
        scheduleDays: normalizedNext,
      },
    ]);
  }

  const effectiveDateKey = getDateKey(effectiveDate);
  const seededHistory = currentHistory.length > 0
    ? currentHistory
    : [
        {
          effectiveDateKey: '1970-01-01',
          scheduleDays: normalizedPrevious,
        },
      ];

  return saveLocalWorkoutScheduleHistory([
    ...seededHistory.filter((entry) => entry.effectiveDateKey !== effectiveDateKey),
    {
      effectiveDateKey,
      scheduleDays: normalizedNext,
    },
  ]);
}
