import { renderHook, waitFor } from '@testing-library/react-native';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';

const mockLimit = jest.fn();
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

describe('useLatestBodyweight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares an in-flight request across simultaneous consumers', async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    mockLimit.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    const first = renderHook(() => useLatestBodyweight());
    const second = renderHook(() => useLatestBodyweight());

    expect(mockFrom).toHaveBeenCalledTimes(1);
    resolveRequest({ data: [{ weight: 220.462, unit: 'lb' }], error: null });

    await waitFor(() => {
      expect(first.result.current.loading).toBe(false);
      expect(second.result.current.loading).toBe(false);
    });
    expect(first.result.current.bodyweightKg).toBeCloseTo(100, 4);
    expect(second.result.current.bodyweightKg).toBeCloseTo(100, 4);
  });
});
