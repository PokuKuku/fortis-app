import { useEffect, useMemo, useState } from 'react';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { mergeWorkoutSessions } from '@/src/utils/workoutHistory';
import type { WorkoutSession } from '@/src/types/workout';

type WorkoutHistorySourceOptions = {
  limit?: number;
  enabled?: boolean;
  localSessions?: WorkoutSession[];
  staleTimeMs?: number;
  syncToStore?: boolean;
};

let cachedSessions: WorkoutSession[] | null = null;
let cachedAt = 0;
let inFlight: Promise<WorkoutSession[]> | null = null;

const DEFAULT_LIMIT = 10000;
const DEFAULT_STALE_MS = 5 * 60 * 1000;

export const getCachedWorkoutHistory = () => cachedSessions ?? [];

export const setCachedWorkoutHistory = (sessions: WorkoutSession[]) => {
  cachedSessions = sessions;
  cachedAt = Date.now();
};

export function useWorkoutHistorySource(options: WorkoutHistorySourceOptions = {}) {
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

  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>(
    cachedSessions ?? []
  );
  const [isLoading, setIsLoading] = useState(enabled && !cachedSessions);

  useEffect(() => {
    let isMounted = true;
    if (!enabled) {
      setRemoteSessions([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const now = Date.now();
    const isStale = !cachedSessions || now - cachedAt > staleTimeMs;
    if (!isStale) {
      setRemoteSessions(cachedSessions ?? []);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!inFlight) {
      inFlight = fetchWorkoutHistory({ limit })
        .then(({ sessions, error }) => {
          if (error) {
            return cachedSessions ?? [];
          }
          const latestLocal = localSessions ?? useWorkoutStore.getState().completedSessions;
          const merged = mergeWorkoutSessions(sessions, latestLocal);
          setCachedWorkoutHistory(merged);
          if (syncToStore && sessions.length > 0) {
            replaceCompletedSessions(merged).catch((storeError) => {
              console.warn('[WorkoutHistorySource] Failed to persist merged sessions:', storeError);
            });
          }
          return merged;
        })
        .finally(() => {
          inFlight = null;
        });
    }

    setIsLoading(true);
    inFlight
      .then((sessions) => {
        if (!isMounted) return;
        setRemoteSessions(sessions);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn('[WorkoutHistorySource] Failed to fetch history:', error);
        if (!isMounted) return;
        setRemoteSessions(cachedSessions ?? []);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled, limit, staleTimeMs, syncToStore]);

  const sessions = useMemo(
    () => mergeWorkoutSessions(remoteSessions, local),
    [remoteSessions, local]
  );

  return { sessions, isLoading };
}
