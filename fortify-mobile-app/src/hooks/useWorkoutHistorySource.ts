import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import {
  getInFlightWorkoutHistoryRequest,
  getWorkoutHistoryCacheEntry,
  setCachedWorkoutHistory,
  setInFlightWorkoutHistoryRequest,
} from '@/src/services/workoutHistoryCache';
import { supabase } from '@/src/lib/supabase';
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
  refreshKey?: number;
};

const DEFAULT_LIMIT = 10000;
const DEFAULT_STALE_MS = 5 * 60 * 1000;

export function useWorkoutHistorySource(options: WorkoutHistorySourceOptions = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const {
    limit = DEFAULT_LIMIT,
    enabled = true,
    localSessions,
    staleTimeMs = DEFAULT_STALE_MS,
    syncToStore = limit === DEFAULT_LIMIT,
    refreshKey = 0,
  } = options;
  const fallbackLocal = useWorkoutStore((state) => state.completedSessions);
  const replaceCompletedSessions = useWorkoutStore((state) => state.replaceCompletedSessions);
  const local = localSessions ?? fallbackLocal;
  const cachedForUser = getWorkoutHistoryCacheEntry(userId)?.sessions ?? null;
  const cachedAt = getWorkoutHistoryCacheEntry(userId)?.cachedAt ?? 0;
  const lastHandledRefreshKey = useRef(0);

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
    const shouldForceRefresh = refreshKey > lastHandledRefreshKey.current;
    const isStale = shouldForceRefresh || !cachedForUser || now - cachedAt > staleTimeMs;
    if (!isStale) {
      setRemoteSessions(cachedForUser ?? []);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!getInFlightWorkoutHistoryRequest(userId)) {
      if (shouldForceRefresh) {
        lastHandledRefreshKey.current = refreshKey;
      }
      const expectedUserId = userId;
      setInFlightWorkoutHistoryRequest(
        userId,
        fetchWorkoutHistory({ limit })
          .then(async ({ sessions, error }) => {
            if (error) {
              return cachedForUser ?? [];
            }
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession?.user || currentSession.user.id !== expectedUserId) {
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
            setInFlightWorkoutHistoryRequest(userId, null);
          }),
      );
    }

    const inFlightRequest = getInFlightWorkoutHistoryRequest(userId);
    if (!inFlightRequest) {
      setRemoteSessions(cachedForUser ?? []);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    inFlightRequest
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
  }, [enabled, limit, refreshKey, staleTimeMs, syncToStore, userId, cachedAt, cachedForUser]);

  const sessions = useMemo(
    () => mergeWorkoutSessions(remoteSessions, local),
    [remoteSessions, local]
  );

  return { sessions, isLoading };
}
