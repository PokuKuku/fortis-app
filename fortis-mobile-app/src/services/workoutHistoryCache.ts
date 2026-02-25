import type { WorkoutSession } from '@/src/types/workout';

type WorkoutHistoryCache = {
  sessions: WorkoutSession[] | null;
  cachedAt: number;
};

let cachedByUser: Record<string, WorkoutHistoryCache> = {};
let inFlightByUser: Record<string, Promise<WorkoutSession[]> | null> = {};

export const getCachedWorkoutHistory = (userId?: string | null) => {
  if (!userId) return [];
  return cachedByUser[userId]?.sessions ?? [];
};

export const getWorkoutHistoryCacheEntry = (userId?: string | null) => {
  if (!userId) return null;
  return cachedByUser[userId] ?? null;
};

export const setCachedWorkoutHistory = (userId: string, sessions: WorkoutSession[]) => {
  cachedByUser[userId] = {
    sessions,
    cachedAt: Date.now(),
  };
};

export const clearCachedWorkoutHistory = (userId: string) => {
  delete cachedByUser[userId];
  delete inFlightByUser[userId];
};

export const getInFlightWorkoutHistoryRequest = (userId: string) => inFlightByUser[userId] ?? null;

export const setInFlightWorkoutHistoryRequest = (
  userId: string,
  request: Promise<WorkoutSession[]> | null,
) => {
  inFlightByUser[userId] = request;
};
