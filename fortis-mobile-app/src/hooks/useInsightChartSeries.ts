import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { INSIGHT_CHARTS_CACHE_KEY } from '@/src/constants/storageKeys';
import { fetchInsightChartSeries } from '@/src/services/insightChartsService';
import type { TrainingInsight } from '@/src/types/insights';
import type { InsightChartSeries } from '@/src/types/insightCharts';

type CachedChartEntry = {
  cachedAt: string;
  series: InsightChartSeries;
  insightUpdatedAt?: string;
};

type CachedCharts = Record<string, CachedChartEntry>;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FOCUS_REFRESH_THROTTLE_MS = 2 * 60 * 1000;

const nowIso = (): string => new Date().toISOString();

const isFresh = (cachedAt?: string): boolean => {
  if (!cachedAt) return false;
  const cachedTime = new Date(cachedAt).getTime();
  return Date.now() - cachedTime < CACHE_TTL_MS;
};

const isSameVersion = (entry: CachedChartEntry | undefined, insight?: TrainingInsight | null): boolean => {
  if (!insight?.updatedAt) return true;
  return entry?.insightUpdatedAt === insight.updatedAt;
};

export function useInsightChartSeries(insight?: TrainingInsight | null) {
  const [series, setSeries] = useState<InsightChartSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastRefreshAtRef = useRef(0);
  const refreshingRef = useRef(false);

  const readCache = useCallback(async (): Promise<CachedCharts> => {
    const cached = await getScopedItem(INSIGHT_CHARTS_CACHE_KEY);
    if (!cached) return {};
    try {
      return JSON.parse(cached) as CachedCharts;
    } catch {
      return {};
    }
  }, []);

  const writeCache = useCallback(async (next: CachedCharts) => {
    await setScopedItem(INSIGHT_CHARTS_CACHE_KEY, JSON.stringify(next));
  }, []);

  const refresh = useCallback(async () => {
    if (!insight) {
      setSeries(null);
      setIsLoading(false);
      return;
    }

    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsLoading(true);
    const fetched = await fetchInsightChartSeries(insight);
    if (fetched) {
      setSeries(fetched);
      const cached = await readCache();
      cached[insight.id] = { cachedAt: nowIso(), series: fetched, insightUpdatedAt: insight.updatedAt };
      await writeCache(cached);
    }
    setIsLoading(false);
    refreshingRef.current = false;
    lastRefreshAtRef.current = Date.now();
  }, [insight, readCache, writeCache]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!insight) {
        if (isMounted) {
          setSeries(null);
          setIsLoading(false);
        }
        return;
      }

      const cached = await readCache();
      const entry = cached[insight.id];
      if (entry?.series && isFresh(entry.cachedAt) && isSameVersion(entry, insight)) {
        if (isMounted) {
          setSeries(entry.series);
          setIsLoading(false);
        }
        const now = Date.now();
        if (now - lastRefreshAtRef.current > FOCUS_REFRESH_THROTTLE_MS) {
          refresh();
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }
      const fetched = await fetchInsightChartSeries(insight);
      if (fetched) {
        cached[insight.id] = { cachedAt: nowIso(), series: fetched, insightUpdatedAt: insight.updatedAt };
        await writeCache(cached);
        if (isMounted) {
          setSeries(fetched);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [insight, readCache, writeCache]);

  useFocusEffect(
    useCallback(() => {
      if (!insight) return;
      const now = Date.now();
      if (now - lastRefreshAtRef.current < FOCUS_REFRESH_THROTTLE_MS) return;
      refresh();
    }, [insight, refresh])
  );

  return {
    series,
    isLoading,
    refresh,
  };
}
