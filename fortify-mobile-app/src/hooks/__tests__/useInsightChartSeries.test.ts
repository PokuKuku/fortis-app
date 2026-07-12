import { renderHook, waitFor } from '@testing-library/react-native';
import { useInsightChartSeries } from '@/src/hooks/useInsightChartSeries';
import { fetchInsightChartSeries } from '@/src/services/insightChartsService';
import { getScopedItem } from '@/src/utils/scopedStorage';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(callback, [callback]);
  },
}));

jest.mock('@/src/services/insightChartsService', () => ({
  fetchInsightChartSeries: jest.fn(),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(async () => undefined),
}));

const insight = {
  id: 'insight-1',
  type: 'POSITIVE_TREND_V1',
  updatedAt: '2026-07-11T12:00:00.000Z',
} as Parameters<typeof useInsightChartSeries>[0];

const series = {
  progress: [],
  volume: [],
  frequency: [],
} as NonNullable<ReturnType<typeof useInsightChartSeries>['series']>;

describe('useInsightChartSeries', () => {
  const mockFetch = fetchInsightChartSeries as jest.MockedFunction<typeof fetchInsightChartSeries>;
  const mockGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses a recent matching cache without an immediate network refresh', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      'insight-1': {
        cachedAt: new Date().toISOString(),
        insightUpdatedAt: insight?.updatedAt,
        series,
      },
    }));

    const { result } = renderHook(() => useInsightChartSeries(insight));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.series).toEqual(series);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('performs only one request for an initial cache miss', async () => {
    mockGetScopedItem.mockResolvedValue(null);
    mockFetch.mockResolvedValue(series);

    const { result } = renderHook(() => useInsightChartSeries(insight));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.series).toEqual(series);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
