import {
  addDays,
  addWeeks,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
} from 'date-fns';
import type { WorkoutSession, WeightUnit } from '@/src/types/workout';
import type { Exercise } from '@/src/types/exercise';
import {
  getDateKey,
  getScheduleDaysForDate,
  getSundayWeekStart,
  normalizeWorkoutScheduleDays,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';
import {
  attributeSessionSetsToMuscles,
  getMuscleDisplayName,
  type MuscleKey,
} from '@/src/utils/muscleTaxonomy';

export const SCHEDULED_WORKOUT_REMINDER_KIND = 'scheduled-workout-reminder';
export const WEEKLY_RECAP_KIND = 'weekly-recap';

export type RetentionNotificationKind =
  | typeof SCHEDULED_WORKOUT_REMINDER_KIND
  | typeof WEEKLY_RECAP_KIND;

export type ReminderTime = {
  hour: number;
  minute: number;
};

export const DEFAULT_WORKOUT_REMINDER_TIME: ReminderTime = { hour: 8, minute: 0 };
export const WEEKLY_RECAP_TIME: ReminderTime = { hour: 18, minute: 0 };
export const SCHEDULED_WORKOUT_REMINDER_BODIES = [
  'Let’s keep that workout streak alive.',
  'Training day is here. Let’s make it count.',
  'Your goals called. They want reps today.',
  'Time to stack another win.',
  'Strong starts with showing up. Let’s go!',
  'Workout day energy. Bring it.',
  'You planned it. Now go own it.',
  'Another session, another step forward.',
  'Your streak is waiting for you.',
  'Today’s a great day to get stronger.',
  'No overthinking. Just start.',
  'Let’s put another workout in the books.',
  'Progress is built today. Time to train.',
  'Your future self is already cheering.',
  'One workout closer. Let’s get after it.',
  'Training day unlocked.',
  'A little sweat, a lot of momentum.',
  'The plan says train. Let’s execute.',
  'Your checkmark is waiting. Go earn it.',
  'Big energy today. Move something heavy.',
  'Let’s turn today into progress.',
  'Another chance to prove consistency wins.',
  'Workout scheduled. Beast mode optional, showing up required.',
  'Keep the rhythm. Keep the streak. Keep going.',
  'Today is not a rest day. Let’s move.',
  'Tiny start, strong finish. Open the app and begin.',
  'You’re one session away from feeling better.',
  'Time to train like you mean it.',
  'The streak survives if you show up today.',
  'Let’s get stronger, one set at a time.',
] as const;

export type WeeklyRecap = {
  weekKey: string;
  weekStart: Date;
  weekEnd: Date;
  workoutsCompleted: number;
  scheduledDays: number;
  scheduledDaysHit: number;
  scheduledDaysMissed: number;
  streak: number;
  totalSets: number;
  totalVolume: number;
  volumeUnit: 'lbs' | 'kg';
  totalDurationSeconds: number;
  prCount: number;
  prHighlights: Array<{
    exerciseName: string;
    reps: number | null;
    weight: number | null;
    weightUnit: WeightUnit | null;
    date: Date;
    sessionName: string;
  }>;
  bestLifts: Array<{
    exerciseName: string;
    reps: number | null;
    weight: number | null;
    weightUnit: WeightUnit | null;
    volume: number;
  }>;
  muscleScores: Array<{ label: string; score: number }>;
  topMuscles: Array<{ label: string; score: number }>;
  notableExercises: Array<{ name: string; sets: number; volume: number }>;
};

export function normalizeReminderTime(value: unknown): ReminderTime {
  if (!value || typeof value !== 'object') return DEFAULT_WORKOUT_REMINDER_TIME;
  const candidate = value as Partial<ReminderTime>;
  const hour = Number(candidate.hour);
  const minute = Number(candidate.minute);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return DEFAULT_WORKOUT_REMINDER_TIME;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return DEFAULT_WORKOUT_REMINDER_TIME;
  return { hour, minute };
}

export function formatReminderTime(time: ReminderTime): string {
  const date = new Date();
  date.setHours(time.hour, time.minute, 0, 0);
  return format(date, 'h:mm a');
}

export function setTimeOnDate(date: Date, time: ReminderTime): Date {
  const next = new Date(date);
  next.setHours(time.hour, time.minute, 0, 0);
  return next;
}

export function getScheduledWorkoutReminderBody(date: Date): string {
  const dateKey = getDateKey(date);
  const hash = Array.from(dateKey).reduce((total, character) => total + character.charCodeAt(0), 0);
  return SCHEDULED_WORKOUT_REMINDER_BODIES[hash % SCHEDULED_WORKOUT_REMINDER_BODIES.length];
}

export function getScheduledReminderDates({
  scheduleDays,
  time,
  from = new Date(),
  maxCount = 21,
}: {
  scheduleDays: number[];
  time: ReminderTime;
  from?: Date;
  maxCount?: number;
}): Date[] {
  const normalized = new Set(normalizeWorkoutScheduleDays(scheduleDays));
  if (normalized.size === 0) return [];

  const dates: Date[] = [];
  let cursor = startOfDay(from);
  let inspected = 0;
  while (dates.length < maxCount && inspected < 90) {
    if (normalized.has(cursor.getDay())) {
      const candidate = setTimeOnDate(cursor, time);
      if (candidate.getTime() > from.getTime()) {
        dates.push(candidate);
      }
    }
    cursor = addDays(cursor, 1);
    inspected += 1;
  }
  return dates;
}

export function getWeeklyRecapNotificationDates({
  from = new Date(),
  maxCount = 3,
}: {
  from?: Date;
  maxCount?: number;
} = {}): Date[] {
  const dates: Date[] = [];
  let weekStart = getSundayWeekStart(from);
  let candidate = setTimeOnDate(weekStart, WEEKLY_RECAP_TIME);
  if (candidate.getTime() <= from.getTime()) {
    weekStart = addWeeks(weekStart, 1);
    candidate = setTimeOnDate(weekStart, WEEKLY_RECAP_TIME);
  }

  for (let index = 0; index < maxCount; index += 1) {
    dates.push(addWeeks(candidate, index));
  }
  return dates;
}

export function getDueWeeklyRecapWeekStart(now = new Date()): Date | null {
  if (now.getDay() !== 0) return null;
  const dueAt = setTimeOnDate(getSundayWeekStart(now), WEEKLY_RECAP_TIME);
  return now.getTime() >= dueAt.getTime() ? addDays(getSundayWeekStart(now), -7) : null;
}

export function isWeeklyRecapEligible({
  weekStart,
  accountCreatedAt,
}: {
  weekStart: Date;
  accountCreatedAt?: Date | string | null;
}): boolean {
  if (!accountCreatedAt) return true;

  const createdAt = accountCreatedAt instanceof Date
    ? accountCreatedAt
    : new Date(accountCreatedAt);
  if (Number.isNaN(createdAt.getTime())) return true;

  // A recap is only meaningful if the account existed when that recap week began.
  // This prevents a Sunday sign-up from immediately receiving a recap for the
  // week that ended before they joined, while allowing the following Sunday.
  return startOfDay(createdAt).getTime() <= startOfDay(weekStart).getTime();
}

export function buildWeeklyRecap({
  weekStart,
  scheduleDays,
  scheduleHistory,
  sessions,
  exercisesById,
  preferredUnits = 'imperial',
  weightUnits,
}: {
  weekStart: Date;
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  exercisesById?: Map<string, Exercise>;
  preferredUnits?: 'imperial' | 'metric';
  weightUnits?: Record<string, WeightUnit>;
}): WeeklyRecap {
  const start = startOfDay(weekStart);
  const end = endOfDay(addDays(start, 6));
  const weekSessions = sessions.filter((session) => {
    const completedAt = session.completedAt ?? null;
    return completedAt ? isWithinInterval(completedAt, { start, end }) : false;
  });
  const normalizedSchedule = normalizeWorkoutScheduleDays(scheduleDays);
  const completedDateKeys = new Set(weekSessions.map((session) => getDateKey(session.completedAt as Date)));
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const scheduledDates = weekDays.filter((date) => {
    const activeSchedule = getScheduleDaysForDate({
      date,
      scheduleDays: normalizedSchedule,
      scheduleHistory,
    });
    return activeSchedule.includes(date.getDay());
  });
  const scheduledDaysHit = scheduledDates.filter((date) => completedDateKeys.has(getDateKey(date))).length;

  const volumeContext: VolumeContext = {
    preferredUnits,
    weightUnits,
  };
  const exerciseSummary = new Map<string, { name: string; sets: number; volume: number }>();
  const muscleScores = {} as Record<MuscleKey, number>;
  let totalSets = 0;
  let totalVolume = 0;
  let totalDurationSeconds = 0;
  let prCount = 0;
  const prHighlights: WeeklyRecap['prHighlights'] = [];
  const bestLiftsByExercise = new Map<string, WeeklyRecap['bestLifts'][number]>();

  weekSessions.forEach((session) => {
    totalDurationSeconds += session.durationSeconds ?? 0;
    session.exercises.forEach((exercise) => {
      const exerciseMeta = exercisesById?.get(exercise.exerciseId);
      let exerciseSets = 0;
      let exerciseVolume = 0;
      exercise.sets.forEach((set) => {
        if (!set.isCompleted || set.setType === 'warmup') return;
        if ((set.reps ?? 0) <= 0) return;
        exerciseSets += 1;
        totalSets += 1;
        const volume = getSetVolume(set, volumeContext, {
          exerciseMeta,
          fallbackUnit: weightUnits?.[exercise.exerciseId],
          exerciseName: exercise.exerciseName,
        });
        exerciseVolume += volume;
        totalVolume += volume;
        const existingBestLift = bestLiftsByExercise.get(exercise.exerciseName);
        if (!existingBestLift || volume > existingBestLift.volume) {
          bestLiftsByExercise.set(exercise.exerciseName, {
            exerciseName: exercise.exerciseName,
            reps: set.reps,
            weight: set.weight,
            weightUnit: set.weightUnit ?? weightUnits?.[exercise.exerciseId] ?? null,
            volume,
          });
        }
        if (set.notes?.toLowerCase().includes('pr')) {
          prCount += 1;
          prHighlights.push({
            exerciseName: exercise.exerciseName,
            reps: set.reps,
            weight: set.weight,
            weightUnit: set.weightUnit ?? weightUnits?.[exercise.exerciseId] ?? null,
            date: session.completedAt as Date,
            sessionName: session.name,
          });
        }
      });
      if (exerciseSets > 0) {
        const existing = exerciseSummary.get(exercise.exerciseName) ?? {
          name: exercise.exerciseName,
          sets: 0,
          volume: 0,
        };
        existing.sets += exerciseSets;
        existing.volume += exerciseVolume;
        exerciseSummary.set(exercise.exerciseName, existing);
      }
    });

    if (exercisesById) {
      const sessionScores = attributeSessionSetsToMuscles(session, exercisesById);
      Object.entries(sessionScores).forEach(([muscle, score]) => {
        const key = muscle as MuscleKey;
        muscleScores[key] = (muscleScores[key] ?? 0) + score;
      });
    }
  });

  const sortedMuscleScores = Object.entries(muscleScores)
    .sort(([, left], [, right]) => right - left)
    .map(([muscle, score]) => ({ label: getMuscleDisplayName(muscle as MuscleKey), score }));

  return {
    weekKey: getDateKey(start),
    weekStart: start,
    weekEnd: end,
    workoutsCompleted: weekSessions.length,
    scheduledDays: scheduledDates.length,
    scheduledDaysHit,
    scheduledDaysMissed: Math.max(0, scheduledDates.length - scheduledDaysHit),
    streak: scheduledDaysHit,
    totalSets,
    totalVolume,
    volumeUnit: preferredUnits === 'metric' ? 'kg' : 'lbs',
    totalDurationSeconds,
    prCount,
    prHighlights,
    bestLifts: Array.from(bestLiftsByExercise.values())
      .sort((left, right) => right.volume - left.volume)
      .slice(0, 5),
    muscleScores: sortedMuscleScores,
    topMuscles: sortedMuscleScores.slice(0, 4),
    notableExercises: Array.from(exerciseSummary.values())
      .sort((left, right) => right.sets - left.sets || right.volume - left.volume)
      .slice(0, 5),
  };
}
