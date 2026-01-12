import { useEffect, useMemo, useState } from 'react';
import { startOfDay } from 'date-fns';
import { fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import type { WorkoutSession } from '@/src/types/workout';

type WorkoutHistoryRangeOptions = {
  dateFrom: Date;
  dateTo?: Date;
  localSessions?: WorkoutSession[];
  limit?: number;
  enabled?: boolean;
};

const mergeSessions = (remote: WorkoutSession[], local: WorkoutSession[]) => {
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

export function useWorkoutHistoryRange({
  dateFrom,
  dateTo,
  localSessions = [],
  limit,
  enabled = true,
}: WorkoutHistoryRangeOptions): { sessions: WorkoutSession[]; isLoading: boolean } {
  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const rangeStartKey = startOfDay(dateFrom).getTime();
  const rangeEndKey = startOfDay(dateTo ?? new Date()).getTime();
  const rangeStartDate = useMemo(() => new Date(rangeStartKey), [rangeStartKey]);
  const rangeEndDate = useMemo(() => new Date(rangeEndKey), [rangeEndKey]);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setRemoteSessions([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadSessions = async () => {
      setIsLoading(true);
      const { sessions } = await fetchWorkoutHistory({
        dateFrom: rangeStartDate,
        dateTo: rangeEndDate,
        limit,
      });

      if (!isMounted) return;
      setRemoteSessions(sessions);
      setIsLoading(false);
    };

    loadSessions().catch((error) => {
      if (!isMounted) return;
      console.warn('[WorkoutHistoryRange] Failed to load sessions:', error);
      setRemoteSessions([]);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [rangeStartDate, rangeEndDate, limit, enabled]);

  const sessions = useMemo(() => {
    if (localSessions.length === 0) return remoteSessions;
    const filteredLocal = localSessions.filter((session) => {
      const sessionDateKey = startOfDay(
        new Date(session.completedAt ?? session.startedAt)
      ).getTime();
      return sessionDateKey >= rangeStartKey && sessionDateKey <= rangeEndKey;
    });
    return mergeSessions(remoteSessions, filteredLocal);
  }, [remoteSessions, localSessions, rangeStartKey, rangeEndKey]);

  return { sessions, isLoading };
}
