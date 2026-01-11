import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { TRAINING_INSIGHTS_CACHE_KEY } from '@/src/constants/storageKeys';
import { fetchTrainingInsights, refreshTrainingInsights, dismissInsight, snoozeInsightType } from '@/src/services/insightsService';
import { TrainingInsight, InsightType } from '@/src/types/insights';

type CachedInsights = {
  items: TrainingInsight[];
  cachedAt: string;
};

export function useTrainingInsights(options?: { skipRefresh?: boolean }) {
  const [insights, setInsights] = useState<TrainingInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const lastRefreshAtRef = useRef(0);
  const refreshingRef = useRef(false);
  const REFRESH_THROTTLE_MS = 2 * 60 * 1000;

  const persistCache = useCallback(async (items: TrainingInsight[]) => {
    const payload: CachedInsights = {
      items,
      cachedAt: new Date().toISOString(),
    };
    await setScopedItem(TRAINING_INSIGHTS_CACHE_KEY, JSON.stringify(payload));
    setCachedAt(payload.cachedAt);
  }, []);

  const loadCached = useCallback(async () => {
    const cached = await getScopedItem(TRAINING_INSIGHTS_CACHE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as CachedInsights;
      if (Array.isArray(parsed.items)) {
        setInsights(parsed.items);
        setCachedAt(parsed.cachedAt || null);
        setIsLoading(false);
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await refreshTrainingInsights();
      const remote = await fetchTrainingInsights();
      if (remote !== null) {
        setInsights(remote);
        await persistCache(remote);
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      refreshingRef.current = false;
      lastRefreshAtRef.current = Date.now();
    }
  }, [persistCache]);

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
      await loadCached();
      if (!isMounted) return;
      if (options?.skipRefresh) {
        setIsLoading(false);
        return;
      }
      await refresh();
      lastRefreshAtRef.current = Date.now();
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [loadCached, options?.skipRefresh, refresh]);

  useFocusEffect(
    useCallback(() => {
      if (options?.skipRefresh) return;
      const now = Date.now();
      if (now - lastRefreshAtRef.current < REFRESH_THROTTLE_MS) return;
      refresh();
    }, [options?.skipRefresh, refresh])
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
