import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { TRAINING_INSIGHTS_CACHE_KEY } from '@/src/constants/storageKeys';
import {
  fetchTrainingInsights,
  refreshTrainingInsights,
  dismissInsight,
  snoozeInsightType,
  subscribeToTrainingInsightsRefresh,
} from '@/src/services/insightsService';
import { TrainingInsight, InsightType } from '@/src/types/insights';

type CachedInsights = {
  items: TrainingInsight[];
  cachedAt: string;
};

const REFRESH_THROTTLE_MS = 2 * 60 * 1000;
let activeRemoteFetch: Promise<TrainingInsight[] | null> | null = null;

function fetchTrainingInsightsDeduped(): Promise<TrainingInsight[] | null> {
  if (activeRemoteFetch) return activeRemoteFetch;
  activeRemoteFetch = fetchTrainingInsights().finally(() => {
    activeRemoteFetch = null;
  });
  return activeRemoteFetch;
}

export function useTrainingInsights(options?: { skipRefresh?: boolean }) {
  const [insights, setInsights] = useState<TrainingInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const lastFetchAtRef = useRef(0);
  const refreshingRef = useRef(false);
  const initializedRef = useRef(false);

  const persistCache = useCallback(async (items: TrainingInsight[]) => {
    const payload: CachedInsights = {
      items,
      cachedAt: new Date().toISOString(),
    };
    await setScopedItem(TRAINING_INSIGHTS_CACHE_KEY, JSON.stringify(payload));
    setCachedAt(payload.cachedAt);
  }, []);

  const loadCached = useCallback(async (): Promise<number | null> => {
    const cached = await getScopedItem(TRAINING_INSIGHTS_CACHE_KEY);
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached) as CachedInsights;
      if (Array.isArray(parsed.items)) {
        setInsights(parsed.items);
        setCachedAt(parsed.cachedAt || null);
        setIsLoading(false);
        const cachedAtMs = Date.parse(parsed.cachedAt);
        return Number.isFinite(cachedAtMs) ? cachedAtMs : 0;
      }
    } catch {
      // ignore cache errors
    }
    return null;
  }, []);

  const fetchLatest = useCallback(async () => {
    try {
      const remote = await fetchTrainingInsightsDeduped();
      if (remote !== null) {
        setInsights(remote);
        await persistCache(remote);
      }
    } finally {
      lastFetchAtRef.current = Date.now();
      setIsLoading(false);
    }
  }, [persistCache]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await refreshTrainingInsights();
      await fetchLatest();
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      refreshingRef.current = false;
      lastFetchAtRef.current = Date.now();
    }
  }, [fetchLatest]);

  const dismiss = useCallback(async (insightId: string) => {
    const previous = insights;
    const nextInsights = insights.filter((item) => item.id !== insightId);
    setInsights(nextInsights);
    await persistCache(nextInsights);
    const result = await dismissInsight(insightId);
    if (!result.success) {
      setInsights(previous);
      await persistCache(previous);
    }
  }, [insights, persistCache]);

  const snoozeType = useCallback(async (type: InsightType, days: number = 14) => {
    const previous = insights;
    const nextInsights = insights.filter((item) => item.type !== type);
    setInsights(nextInsights);
    await persistCache(nextInsights);
    const result = await snoozeInsightType(type, days);
    if (!result.success) {
      setInsights(previous);
      await persistCache(previous);
    }
  }, [insights, persistCache]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      const cachedAtMs = await loadCached();
      if (!isMounted) return;
      if (cachedAtMs !== null) {
        lastFetchAtRef.current = cachedAtMs;
      }
      if (options?.skipRefresh) {
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }
      if (cachedAtMs === null || Date.now() - cachedAtMs >= REFRESH_THROTTLE_MS) {
        await fetchLatest();
      }
      initializedRef.current = true;
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [fetchLatest, loadCached, options?.skipRefresh]);

  useEffect(() => {
    return subscribeToTrainingInsightsRefresh(() => {
      void fetchLatest();
    });
  }, [fetchLatest]);

  useFocusEffect(
    useCallback(() => {
      if (options?.skipRefresh) return;
      if (!initializedRef.current) return;
      const now = Date.now();
      if (now - lastFetchAtRef.current < REFRESH_THROTTLE_MS) return;
      void fetchLatest();
    }, [fetchLatest, options?.skipRefresh])
  );

  return {
    insights,
    isLoading,
    isRefreshing,
    cachedAt,
    refresh,
    dismissInsight: dismiss,
    snoozeInsightType: snoozeType,
  };
}
