import type { WorkoutSession } from '@/src/types/workout';

export const areWorkoutSessionsEqual = (
  left: WorkoutSession[],
  right: WorkoutSession[]
): boolean => {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  return JSON.stringify(left) === JSON.stringify(right);
};

export const mergeWorkoutSessions = (
  remote: WorkoutSession[],
  local: WorkoutSession[]
): WorkoutSession[] => {
  const merged = new Map<string, WorkoutSession>();
  remote.forEach((session) => {
    merged.set(session.localId, session);
  });
  local.forEach((session) => {
    if (!merged.has(session.localId)) {
      merged.set(session.localId, session);
    }
  });
  return Array.from(merged.values())
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
};
