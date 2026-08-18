import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTrainingInsights } from '@/src/hooks/useTrainingInsights';
import {
  clearTrainingInsightsRefreshState,
  fetchTrainingInsights,
  getTrainingInsightsRefreshState,
  refreshTrainingInsights,
} from '@/src/services/insightsService';
import { getScopedItem } from '@/src/utils/scopedStorage';
import type { TrainingInsight } from '@/src/types/insights';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(callback, [callback]);
  },
}));

jest.mock('@/src/services/insightsService', () => ({
  fetchTrainingInsights: jest.fn(),
  refreshTrainingInsights: jest.fn(),
  dismissInsight: jest.fn(),
  snoozeInsightType: jest.fn(),
  getTrainingInsightsRefreshState: jest.fn(async () => null),
  clearTrainingInsightsRefreshState: jest.fn(async () => undefined),
  subscribeToTrainingInsightsRefresh: jest.fn(() => () => undefined),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(async () => undefined),
}));

const cachedInsight = {
  id: 'insight-1',
  type: 'POSITIVE_TREND_V1',
  updatedAt: '2026-07-19T12:00:00.000Z',
} as unknown as TrainingInsight;

describe('useTrainingInsights', () => {
  const mockGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
  const mockFetch = fetchTrainingInsights as jest.MockedFunction<typeof fetchTrainingInsights>;
  const mockRefresh = refreshTrainingInsights as jest.MockedFunction<typeof refreshTrainingInsights>;
  const mockGetRefreshState = getTrainingInsightsRefreshState as jest.MockedFunction<
    typeof getTrainingInsightsRefreshState
  >;
  const mockClearRefreshState = clearTrainingInsightsRefreshState as jest.MockedFunction<
    typeof clearTrainingInsightsRefreshState
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue([]);
    mockRefresh.mockResolvedValue({ success: true });
    mockGetRefreshState.mockResolvedValue(null);
  });

  it('does not read cache or fetch insights when disabled for the tour', async () => {
    const { result } = renderHook(() => useTrainingInsights({ enabled: false }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.insights).toEqual([]);
    expect(mockGetScopedItem).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows a recent cache without regenerating or fetching again', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      items: [cachedInsight],
      cachedAt: new Date().toISOString(),
    }));

    const { result } = renderHook(() => useTrainingInsights());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.insights).toEqual([cachedInsight]);
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches existing insight rows on a cache miss without regenerating', async () => {
    mockGetScopedItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue([cachedInsight]);

    const { result } = renderHook(() => useTrainingInsights());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.insights).toEqual([cachedInsight]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('bypasses the cache throttle when a post-workout recap is ready', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      items: [cachedInsight],
      cachedAt: new Date().toISOString(),
    }));
    mockGetRefreshState.mockResolvedValueOnce('ready').mockResolvedValueOnce('ready');
    mockFetch.mockResolvedValue([cachedInsight]);

    const { result } = renderHook(() => useTrainingInsights());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockClearRefreshState).toHaveBeenCalledTimes(1);
  });

  it('regenerates only for an explicit refresh while retaining current data', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      items: [cachedInsight],
      cachedAt: new Date().toISOString(),
    }));
    mockFetch.mockResolvedValue([cachedInsight]);

    const { result } = renderHook(() => useTrainingInsights());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.insights).toEqual([cachedInsight]);
    expect(result.current.isRefreshing).toBe(false);
  });
});
