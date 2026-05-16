import { addDays, format, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import type { WorkoutSession } from '@/src/types/workout';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAY_SHORT_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const DEFAULT_WORKOUT_SCHEDULE_DAYS = [1, 3, 5];

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkoutScheduleHistoryEntry = {
  effectiveDateKey: string;
  scheduleDays: number[];
};

export type WeekProgressDay = {
  date: Date;
  dateKey: string;
  weekday: number;
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
  isScheduled: boolean;
  isMissed: boolean;
  completedSessions: WorkoutSession[];
};

export function normalizeWorkoutScheduleDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
    )
  ).sort((a, b) => a - b);
}

export function areWorkoutScheduleDaysEqual(left: number[], right: number[]): boolean {
  const normalizedLeft = normalizeWorkoutScheduleDays(left);
  const normalizedRight = normalizeWorkoutScheduleDays(right);
  return normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((day, index) => day === normalizedRight[index]);
}

export function normalizeWorkoutScheduleHistory(value: unknown): WorkoutScheduleHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const candidate = entry as {
        effectiveDateKey?: unknown;
        scheduleDays?: unknown;
      };
      if (
        typeof candidate.effectiveDateKey !== 'string'
        || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.effectiveDateKey)
      ) {
        return null;
      }

      return {
        effectiveDateKey: candidate.effectiveDateKey,
        scheduleDays: normalizeWorkoutScheduleDays(candidate.scheduleDays),
      };
    })
    .filter((entry): entry is WorkoutScheduleHistoryEntry => Boolean(entry))
    .sort((left, right) => left.effectiveDateKey.localeCompare(right.effectiveDateKey))
    .reduce<WorkoutScheduleHistoryEntry[]>((entries, entry) => {
      const previous = entries[entries.length - 1];
      if (previous?.effectiveDateKey === entry.effectiveDateKey) {
        entries[entries.length - 1] = entry;
        return entries;
      }
      if (previous && areWorkoutScheduleDaysEqual(previous.scheduleDays, entry.scheduleDays)) {
        return entries;
      }
      entries.push(entry);
      return entries;
    }, []);
}

export function deriveScheduleDaysFromWorkoutsPerWeek(workoutsPerWeek?: number | null): number[] {
  const count = Math.max(0, Math.min(7, Math.round(Number(workoutsPerWeek ?? 0))));

  if (count <= 0) return DEFAULT_WORKOUT_SCHEDULE_DAYS;
  if (count === 1) return [1];
  if (count === 2) return [1, 4];
  if (count === 3) return [1, 3, 5];
  if (count === 4) return [1, 2, 4, 5];
  if (count === 5) return [1, 2, 3, 4, 5];
  if (count === 6) return [1, 2, 3, 4, 5, 6];
  return [0, 1, 2, 3, 4, 5, 6];
}

export function resolveWorkoutScheduleDays(
  profileDays?: unknown,
  localDays?: unknown,
  onboardingDays?: unknown,
  workoutsPerWeek?: number | null
): number[] {
  if (Array.isArray(profileDays)) {
    return normalizeWorkoutScheduleDays(profileDays);
  }

  if (Array.isArray(localDays)) {
    return normalizeWorkoutScheduleDays(localDays);
  }

  if (Array.isArray(onboardingDays)) {
    return normalizeWorkoutScheduleDays(onboardingDays);
  }

  return deriveScheduleDaysFromWorkoutsPerWeek(workoutsPerWeek);
}

export function getDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getScheduleDaysForDate({
  date,
  scheduleDays,
  scheduleHistory = [],
}: {
  date: Date;
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
}): number[] {
  const normalizedHistory = normalizeWorkoutScheduleHistory(scheduleHistory);
  if (normalizedHistory.length === 0) {
    return normalizeWorkoutScheduleDays(scheduleDays);
  }

  const dateKey = getDateKey(date);
  let activeEntry: WorkoutScheduleHistoryEntry | null = null;
  for (const entry of normalizedHistory) {
    if (entry.effectiveDateKey > dateKey) break;
    activeEntry = entry;
  }

  return activeEntry
    ? activeEntry.scheduleDays
    : normalizedHistory[0].scheduleDays;
}

export function getSundayWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

export function buildSundayWeek(anchorDate: Date): Date[] {
  const start = getSundayWeekStart(anchorDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getSessionsForDate(
  sessions: WorkoutSession[],
  date: Date
): WorkoutSession[] {
  return sessions.filter((session) => {
    if (!session.completedAt) return false;
    return isSameDay(session.completedAt, date);
  });
}

export function getWorkoutDayStreak({
  sessions,
  today = new Date(),
}: {
  sessions: WorkoutSession[];
  today?: Date;
}): number {
  const completedDateKeys = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) => getDateKey(session.completedAt as Date))
  );

  let cursor = new Date(today);
  let streak = 0;
  let inspectedDays = 0;
  const maxLookbackDays = 370;

  while (inspectedDays < maxLookbackDays) {
    if (!completedDateKeys.has(getDateKey(cursor))) {
      return streak;
    }

    streak += 1;
    cursor = addDays(cursor, -1);
    inspectedDays += 1;
  }

  return streak;
}

export function buildWeekProgressDays({
  anchorDate,
  scheduleDays,
  scheduleHistory,
  sessions,
  today = new Date(),
}: {
  anchorDate: Date;
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  today?: Date;
}): WeekProgressDay[] {
  return buildSundayWeek(anchorDate).map((date) => {
    const weekday = date.getDay();
    const completedSessions = getSessionsForDate(sessions, date);
    const activeSchedule = new Set(getScheduleDaysForDate({ date, scheduleDays, scheduleHistory }));
    const isScheduled = activeSchedule.has(weekday);
    return {
      date,
      dateKey: getDateKey(date),
      weekday,
      dayLabel: WEEKDAY_SHORT_LABELS[weekday],
      dateLabel: format(date, 'd'),
      isToday: isSameDay(date, today),
      isScheduled,
      isMissed: isScheduled && completedSessions.length === 0 && date < startOfDay(today),
      completedSessions,
    };
  });
}

export function formatWeekRange(anchorDate: Date): string {
  const days = buildSundayWeek(anchorDate);
  const start = days[0];
  const end = days[6];

  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'MMM d')} - ${format(end, 'd')}`;
  }

  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
}

export function getScheduledWorkoutDayStreak({
  scheduleDays,
  scheduleHistory,
  sessions,
  today = new Date(),
}: {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  today?: Date;
}): number {
  const normalizedSchedule = normalizeWorkoutScheduleDays(scheduleDays);
  const normalizedHistory = normalizeWorkoutScheduleHistory(scheduleHistory);
  if (normalizedSchedule.length === 0 && normalizedHistory.length === 0) {
    return getWorkoutDayStreak({ sessions, today });
  }

  const completedDateKeys = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) => getDateKey(session.completedAt as Date))
  );

  let cursor = new Date(today);
  const todayKey = getDateKey(today);
  let streak = 0;
  let inspectedDays = 0;
  const maxLookbackDays = 370;

  while (inspectedDays < maxLookbackDays) {
    const scheduledDays = new Set(
      getScheduleDaysForDate({
        date: cursor,
        scheduleDays: normalizedSchedule,
        scheduleHistory: normalizedHistory,
      })
    );
    if (scheduledDays.size === 0) {
      return getWorkoutDayStreak({ sessions, today });
    }

    if (!scheduledDays.has(cursor.getDay())) {
      cursor = addDays(cursor, -1);
      inspectedDays += 1;
      continue;
    }

    const cursorKey = getDateKey(cursor);
    if (!completedDateKeys.has(cursorKey)) {
      if (cursorKey === todayKey) {
        cursor = addDays(cursor, -1);
        inspectedDays += 1;
        continue;
      }
      return streak;
    }

    streak += 1;
    cursor = addDays(cursor, -1);
    inspectedDays += 1;
  }

  return streak;
}
