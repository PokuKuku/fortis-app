import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { PROGRAM_PROGRESS_SEED_KEY } from '@/src/constants/storageKeys';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { syncWorkoutSession } from '@/src/services/workoutHistoryService';
import { generateSecureUUID } from '@/src/utils/uuid';
import type { ProgramDetail } from '@/src/types/program';
import type { WorkoutExercise, WorkoutSession, WorkoutSet, WeightUnit } from '@/src/types/workout';

type SeedResult = {
  seeded: boolean;
  sessionsCreated: number;
  reason?: string;
};

const DEFAULT_SESSIONS = 6;
const MIN_SESSIONS = 3;
const SESSION_DAY_GAP = 2;
const BASE_DURATION_SECONDS = 34 * 60;

const parseRepTarget = (target: string): { min: number; max: number } => {
  const matches = target.match(/\d+/g)?.map((value) => Number(value)) ?? [];
  if (matches.length === 0) {
    return { min: 8, max: 12 };
  }
  if (matches.length === 1) {
    return { min: matches[0], max: matches[0] };
  }
  const min = Math.min(matches[0], matches[1]);
  const max = Math.max(matches[0], matches[1]);
  return { min, max };
};

const buildRepValue = (target: string, sessionIndex: number, exerciseIndex: number): number => {
  const { min, max } = parseRepTarget(target);
  if (min === max) return min;
  const span = Math.max(1, max - min);
  return min + ((sessionIndex + exerciseIndex) % (span + 1));
};

const buildBaseWeight = (
  unit: WeightUnit,
  exerciseIndex: number,
  reps: number,
  sessionIndex: number
): number => {
  if (unit === 'kg') {
    return 18 + exerciseIndex * 4 + reps + sessionIndex * 1.5;
  }
  return 45 + exerciseIndex * 10 + reps * 2 + sessionIndex * 2.5;
};

const buildSeedSessions = (
  program: ProgramDetail,
  weightUnits: Record<string, WeightUnit>
): WorkoutSession[] => {
  const orderedWorkouts = [...program.workouts].sort((a, b) => a.dayNumber - b.dayNumber);
  const totalDays = orderedWorkouts.length;
  if (totalDays === 0) return [];

  const sessionCount = Math.min(DEFAULT_SESSIONS, Math.max(MIN_SESSIONS, totalDays * 2));
  const now = new Date();
  const sessions: WorkoutSession[] = [];

  for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex += 1) {
    const workout = orderedWorkouts[sessionIndex % totalDays];
    const completedAt = new Date(now);
    completedAt.setDate(
      completedAt.getDate() - (sessionCount - 1 - sessionIndex) * SESSION_DAY_GAP
    );

    const exercises: WorkoutExercise[] = workout.exercises.map((exercise, exerciseIndex) => {
      const unit = weightUnits[exercise.exerciseId] ?? 'lbs';
      const repValue = buildRepValue(exercise.targetReps, sessionIndex, exerciseIndex);
      const baseWeight = buildBaseWeight(unit, exerciseIndex, repValue, sessionIndex);
      const setCount = Math.max(1, exercise.targetSets);
      const sets: WorkoutSet[] = Array.from({ length: setCount }, (_, setIndex) => {
        const setWeight = Math.max(
          0,
          Math.round(baseWeight - setIndex * (unit === 'kg' ? 1 : 2.5))
        );
        return {
          localId: generateSecureUUID(),
          setNumber: setIndex + 1,
          setType: 'normal',
          weight: setWeight,
          weightUnit: unit,
          reps: repValue,
          rpe: null,
          restSeconds: exercise.restSeconds ?? null,
          notes: '',
          isCompleted: true,
          orderIndex: setIndex,
        };
      });

      return {
        localId: generateSecureUUID(),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets,
        notes: '',
        orderIndex: exerciseIndex,
      };
    });

    const durationSeconds =
      BASE_DURATION_SECONDS + exercises.length * 110 + sessionIndex * 140;
    const startedAt = new Date(completedAt.getTime() - durationSeconds * 1000);

    sessions.push({
      localId: generateSecureUUID(),
      name: workout.name,
      notes: '',
      startedAt,
      completedAt,
      durationSeconds,
      programName: program.name,
      programId: program.id,
      programWorkoutId: workout.id,
      originalExerciseIds: exercises.map((exercise) => exercise.exerciseId),
      originalSetCounts: exercises.map((exercise) => exercise.sets.length),
      exercises,
      isSynced: false,
    });
  }

  return sessions;
};

const loadSeededProgramIds = async (): Promise<Set<string>> => {
  const stored = await getScopedItem(PROGRAM_PROGRESS_SEED_KEY);
  if (!stored) return new Set();
  try {
    const parsed = JSON.parse(stored) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
};

const persistSeededProgramIds = async (ids: Set<string>): Promise<void> => {
  await setScopedItem(PROGRAM_PROGRESS_SEED_KEY, JSON.stringify(Array.from(ids)));
};

export const seedProgramProgress = async (program: ProgramDetail): Promise<SeedResult> => {
  const workoutStore = useWorkoutStore.getState();
  const existingSessions = workoutStore.completedSessions.filter(
    (session) => session.programId === program.id
  );

  if (existingSessions.length > 0) {
    return { seeded: false, sessionsCreated: 0, reason: 'existing-sessions' };
  }

  const seededPrograms = await loadSeededProgramIds();
  if (seededPrograms.has(program.id)) {
    return { seeded: false, sessionsCreated: 0, reason: 'already-seeded' };
  }

  const sessions = buildSeedSessions(program, workoutStore.weightUnits);
  if (sessions.length === 0) {
    return { seeded: false, sessionsCreated: 0, reason: 'no-workouts' };
  }

  const existingIds = new Set(workoutStore.completedSessions.map((session) => session.localId));
  const newSessions = sessions.filter((session) => !existingIds.has(session.localId));
  if (newSessions.length === 0) {
    return { seeded: false, sessionsCreated: 0, reason: 'no-new-sessions' };
  }

  const mergedSessions = [...newSessions, ...workoutStore.completedSessions].sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  );
  await workoutStore.replaceCompletedSessions(mergedSessions);

  const progressStore = useProgramProgressStore.getState();
  progressStore.startProgram(program.id);

  const workoutDayMap = new Map(program.workouts.map((workout) => [workout.id, workout.dayNumber]));
  const totalDays = program.workouts.length;
  [...newSessions]
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
    .forEach((session) => {
      const dayNumber = workoutDayMap.get(session.programWorkoutId ?? '') ?? 1;
      progressStore.markWorkoutComplete(
        program.id,
        dayNumber,
        totalDays,
        session.completedAt?.toISOString()
      );
    });

  const syncIds = newSessions.map((session) => session.localId);
  if (syncIds.length > 0) {
    workoutStore.markSessionsSyncing(syncIds);
    await Promise.all(
      newSessions.map(async (session) => {
        try {
          const result = await syncWorkoutSession(session);
          if (result.success && !result.queued) {
            await workoutStore.markSessionsSynced([session.localId]);
          }
        } catch (error) {
          console.warn('Failed to sync seeded workout session:', error);
        } finally {
          workoutStore.clearSessionsSyncing([session.localId]);
        }
      })
    );
  }

  seededPrograms.add(program.id);
  await persistSeededProgramIds(seededPrograms);

  useProgramsStore.getState().updateLastPerformed(program.id).catch((error) => {
    console.warn('Failed to update last performed after seeding:', error);
  });

  return { seeded: true, sessionsCreated: newSessions.length };
};
