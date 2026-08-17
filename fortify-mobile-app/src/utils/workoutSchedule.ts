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

export type StreakPausePeriod = {
  startDateKey: string;
  endDateKey: string | null;
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

export function shouldEarnStreakFreezePass({
  currentStreak,
  latestScheduledCompletionDateKey,
  scheduledCompletionsAfterMilestone,
  streakFreezePassAvailable,
  streakFreezePassMilestoneDateKey,
}: {
  currentStreak: number;
  latestScheduledCompletionDateKey: string | null;
  scheduledCompletionsAfterMilestone: number;
  streakFreezePassAvailable: boolean;
  streakFreezePassMilestoneDateKey: string | null;
}): boolean {
  if (
    currentStreak < 5
    || !latestScheduledCompletionDateKey
    || streakFreezePassAvailable
  ) {
    return false;
  }

  // Grandfather users whose streak was already past five when freeze passes launched.
  if (!streakFreezePassMilestoneDateKey) return true;

  // Redemption resets the milestone, so progress only includes later scheduled workouts.
  return scheduledCompletionsAfterMilestone >= 5;
}

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

export function buildInitialWorkoutScheduleHistory(
  scheduleDays: number[],
  activationDate = new Date()
): WorkoutScheduleHistoryEntry[] {
  return [
    {
      effectiveDateKey: getDateKey(activationDate),
      scheduleDays: normalizeWorkoutScheduleDays(scheduleDays),
    },
  ];
}

export function clampWorkoutScheduleHistoryToActivationDate(
  value: unknown,
  activationDate?: Date | null,
  fallbackScheduleDays?: number[]
): WorkoutScheduleHistoryEntry[] {
  const history = normalizeWorkoutScheduleHistory(value);
  if (!activationDate || Number.isNaN(activationDate.getTime())) {
    return history;
  }
  if (history.length === 0) {
    return fallbackScheduleDays
      ? buildInitialWorkoutScheduleHistory(fallbackScheduleDays, activationDate)
      : history;
  }

  const activationDateKey = getDateKey(activationDate);
  const activeAtActivation = history
    .filter((entry) => entry.effectiveDateKey <= activationDateKey)
    .at(-1);

  if (!activeAtActivation) return history;

  return normalizeWorkoutScheduleHistory([
    {
      effectiveDateKey: activationDateKey,
      scheduleDays: activeAtActivation.scheduleDays,
    },
    ...history.filter((entry) => entry.effectiveDateKey > activationDateKey),
  ]);
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

export function buildWorkoutScheduleHistoryForChange({
  previousDays,
  nextDays,
  currentHistory = [],
  effectiveDate = new Date(),
}: {
  previousDays: number[];
  nextDays: number[];
  currentHistory?: WorkoutScheduleHistoryEntry[];
  effectiveDate?: Date;
}): WorkoutScheduleHistoryEntry[] {
  const normalizedPrevious = normalizeWorkoutScheduleDays(previousDays);
  const normalizedNext = normalizeWorkoutScheduleDays(nextDays);
  const normalizedHistory = normalizeWorkoutScheduleHistory(currentHistory);

  if (areWorkoutScheduleDaysEqual(normalizedPrevious, normalizedNext)) {
    if (normalizedHistory.length > 0) return normalizedHistory;
    return normalizeWorkoutScheduleHistory([
      {
        effectiveDateKey: '1970-01-01',
        scheduleDays: normalizedNext,
      },
    ]);
  }

  const effectiveDateKey = getDateKey(effectiveDate);
  const seededHistory = normalizedHistory.length > 0
    ? normalizedHistory
    : [
        {
          effectiveDateKey: '1970-01-01',
          scheduleDays: normalizedPrevious,
        },
      ];

  return normalizeWorkoutScheduleHistory([
    ...seededHistory.filter((entry) => entry.effectiveDateKey !== effectiveDateKey),
    {
      effectiveDateKey,
      scheduleDays: normalizedNext,
    },
  ]);
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

  return activeEntry ? activeEntry.scheduleDays : [];
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

export function getCompletedWeekdaysForProgram(
  sessions: WorkoutSession[],
  programId: string | undefined,
  anchorDate: Date
): number[] {
  if (!programId) return [];

  const weekDateKeys = new Set(buildSundayWeek(anchorDate).map(getDateKey));
  const completedWeekdays = new Set<number>();

  sessions.forEach((session) => {
    if (!session.completedAt || session.programId !== programId) return;
    const completedDateKey = getDateKey(session.completedAt);
    if (!weekDateKeys.has(completedDateKey)) return;
    completedWeekdays.add(session.completedAt.getDay());
  });

  return Array.from(completedWeekdays).sort((a, b) => a - b);
}

export function getWorkoutDayStreak({
  sessions,
  streakPausePeriods = [],
  today = new Date(),
}: {
  sessions: WorkoutSession[];
  streakPausePeriods?: StreakPausePeriod[];
  today?: Date;
}): number {
  const completedDateKeys = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) => getDateKey(session.completedAt as Date))
  );

  let cursor = new Date(today);
  let streak = 0;

  while (true) {
    const cursorKey = getDateKey(cursor);
    if (
      !completedDateKeys.has(cursorKey)
      && !isStreakDateProtected(cursorKey, streakPausePeriods, today)
    ) {
      return streak;
    }

    if (completedDateKeys.has(cursorKey)) {
      streak += 1;
    }
    cursor = addDays(cursor, -1);
  }
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
  streakPausePeriods = [],
  today = new Date(),
}: {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  streakPausePeriods?: StreakPausePeriod[];
  today?: Date;
}): number {
  const normalizedSchedule = normalizeWorkoutScheduleDays(scheduleDays);
  const normalizedHistory = normalizeWorkoutScheduleHistory(scheduleHistory);
  if (normalizedSchedule.length === 0 && normalizedHistory.length === 0) {
    return getWorkoutDayStreak({ sessions, streakPausePeriods, today });
  }

  const completedDateKeys = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) => getDateKey(session.completedAt as Date))
  );

  let cursor = new Date(today);
  const todayKey = getDateKey(today);
  let streak = 0;

  while (true) {
    const scheduledDays = new Set(
      getScheduleDaysForDate({
        date: cursor,
        scheduleDays: normalizedSchedule,
        scheduleHistory: normalizedHistory,
      })
    );
    const cursorKey = getDateKey(cursor);
    if (scheduledDays.size === 0) {
      if (
        normalizedHistory.length > 0
        && cursorKey < normalizedHistory[0].effectiveDateKey
      ) {
        return streak;
      }
      return getWorkoutDayStreak({ sessions, streakPausePeriods, today });
    }

    if (!scheduledDays.has(cursor.getDay())) {
      cursor = addDays(cursor, -1);
      continue;
    }

    if (!completedDateKeys.has(cursorKey)) {
      if (cursorKey === todayKey) {
        cursor = addDays(cursor, -1);
        continue;
      }
      if (isStreakDateProtected(cursorKey, streakPausePeriods, today)) {
        cursor = addDays(cursor, -1);
        continue;
      }
      return streak;
    }

    streak += 1;
    cursor = addDays(cursor, -1);
  }
}

export function isStreakDateProtected(
  dateKey: string,
  periods: StreakPausePeriod[],
  today: Date
): boolean {
  const todayKey = getDateKey(today);

  return periods.some((period) => {
    const endDateKey = period.endDateKey ?? todayKey;
    return dateKey >= period.startDateKey && dateKey <= endDateKey;
  });
}

export function getLatestScheduledCompletionDateKey({
  scheduleDays,
  scheduleHistory = [],
  sessions,
}: {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
}): string | null {
  let latestDateKey: string | null = null;

  sessions.forEach((session) => {
    if (!session.completedAt) return;
    const activeSchedule = new Set(getScheduleDaysForDate({
      date: session.completedAt,
      scheduleDays,
      scheduleHistory,
    }));
    if (activeSchedule.size === 0 || !activeSchedule.has(session.completedAt.getDay())) return;

    const dateKey = getDateKey(session.completedAt);
    if (!latestDateKey || dateKey > latestDateKey) {
      latestDateKey = dateKey;
    }
  });

  return latestDateKey;
}

export function getScheduledWorkoutCompletionCountAfterDateKey({
  afterDateKey,
  scheduleDays,
  scheduleHistory = [],
  sessions,
}: {
  afterDateKey: string;
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
}): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(afterDateKey)) return 0;

  const completedScheduledDateKeys = new Set<string>();
  sessions.forEach((session) => {
    if (!session.completedAt) return;
    const dateKey = getDateKey(session.completedAt);
    if (dateKey <= afterDateKey) return;

    const activeSchedule = new Set(getScheduleDaysForDate({
      date: session.completedAt,
      scheduleDays,
      scheduleHistory,
    }));
    if (activeSchedule.size === 0 || !activeSchedule.has(session.completedAt.getDay())) return;
    completedScheduledDateKeys.add(dateKey);
  });

  return completedScheduledDateKeys.size;
}

export function getFirstMissedScheduledWorkoutDateKey({
  afterDateKey,
  scheduleDays,
  scheduleHistory = [],
  sessions,
  streakPausePeriods = [],
  today = new Date(),
}: {
  afterDateKey: string;
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  streakPausePeriods?: StreakPausePeriod[];
  today?: Date;
}): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(afterDateKey)) return null;
  const completedDateKeys = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) => getDateKey(session.completedAt as Date))
  );
  const cursor = addDays(new Date(`${afterDateKey}T12:00:00`), 1);
  const todayStart = startOfDay(today);

  while (cursor < todayStart) {
    const dateKey = getDateKey(cursor);
    const activeSchedule = new Set(getScheduleDaysForDate({
      date: cursor,
      scheduleDays,
      scheduleHistory,
    }));
    if (
      activeSchedule.size > 0
      && activeSchedule.has(cursor.getDay())
      && !completedDateKeys.has(dateKey)
      && !isStreakDateProtected(dateKey, streakPausePeriods, today)
    ) {
      return dateKey;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
}
