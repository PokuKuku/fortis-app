import { useEffect, useMemo, useState } from 'react';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { mergeWorkoutSessions } from '@/src/utils/workoutHistory';
import type { WorkoutSession } from '@/src/types/workout';
import { useAuth } from '@/src/contexts/AuthContext';

type WorkoutHistorySourceOptions = {
  limit?: number;
  enabled?: boolean;
  localSessions?: WorkoutSession[];
  staleTimeMs?: number;
  syncToStore?: boolean;
};

type WorkoutHistoryCache = {
  sessions: WorkoutSession[] | null;
  cachedAt: number;
};

let cachedByUser: Record<string, WorkoutHistoryCache> = {};
let inFlightByUser: Record<string, Promise<WorkoutSession[]> | null> = {};

const DEFAULT_LIMIT = 10000;
const DEFAULT_STALE_MS = 5 * 60 * 1000;

export const getCachedWorkoutHistory = (userId?: string | null) => {
  if (!userId) return [];
  return cachedByUser[userId]?.sessions ?? [];
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

export function useWorkoutHistorySource(options: WorkoutHistorySourceOptions = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const {
    limit = DEFAULT_LIMIT,
    enabled = true,
    localSessions,
    staleTimeMs = DEFAULT_STALE_MS,
    syncToStore = limit === DEFAULT_LIMIT,
  } = options;
  const fallbackLocal = useWorkoutStore((state) => state.completedSessions);
  const replaceCompletedSessions = useWorkoutStore((state) => state.replaceCompletedSessions);
  const local = localSessions ?? fallbackLocal;
  const cachedForUser = userId ? cachedByUser[userId]?.sessions ?? null : null;
  const cachedAt = userId ? cachedByUser[userId]?.cachedAt ?? 0 : 0;

  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>(
    cachedForUser ?? []
  );
  const [isLoading, setIsLoading] = useState(enabled && !cachedForUser);

  useEffect(() => {
    if (!userId) {
      setRemoteSessions([]);
      setIsLoading(false);
      return;
    }
    setRemoteSessions(cachedForUser ?? []);
    setIsLoading(enabled && !cachedForUser);
  }, [userId, cachedForUser, enabled]);

  useEffect(() => {
    let isMounted = true;
    if (!enabled || !userId) {
      setRemoteSessions([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const now = Date.now();
    const isStale = !cachedForUser || now - cachedAt > staleTimeMs;
    if (!isStale) {
      setRemoteSessions(cachedForUser ?? []);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!inFlightByUser[userId]) {
      inFlightByUser[userId] = fetchWorkoutHistory({ limit })
        .then(({ sessions, error }) => {
          if (error) {
            return cachedForUser ?? [];
          }
          const latestLocal = localSessions ?? useWorkoutStore.getState().completedSessions;
          const merged = mergeWorkoutSessions(sessions, latestLocal);
          setCachedWorkoutHistory(userId, merged);
          if (syncToStore && sessions.length > 0) {
            replaceCompletedSessions(merged).catch((storeError) => {
              console.warn('[WorkoutHistorySource] Failed to persist merged sessions:', storeError);
            });
          }
          return merged;
        })
        .finally(() => {
          inFlightByUser[userId] = null;
        });
    }

    setIsLoading(true);
    inFlightByUser[userId]
      .then((sessions) => {
        if (!isMounted) return;
        setRemoteSessions(sessions);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn('[WorkoutHistorySource] Failed to fetch history:', error);
        if (!isMounted) return;
        setRemoteSessions(cachedForUser ?? []);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled, limit, staleTimeMs, syncToStore, userId, cachedAt, cachedForUser]);

  const sessions = useMemo(
    () => mergeWorkoutSessions(remoteSessions, local),
    [remoteSessions, local]
  );

  return { sessions, isLoading };
}
