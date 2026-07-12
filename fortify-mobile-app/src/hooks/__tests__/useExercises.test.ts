import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useExercises } from '@/src/hooks/useExercises';
import * as ExerciseService from '@/src/services/exerciseService';

jest.mock('@/src/services/exerciseService', () => ({
  getInitialExercisesSync: jest.fn(() => [{ id: 'initial', name: 'Initial' }]),
  getAllExercises: jest.fn(async () => [{ id: 'loaded', name: 'Loaded' }]),
  invalidateCustomCache: jest.fn(),
}));

describe('useExercises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not initialize or load the exercise library while disabled', () => {
    const { result } = renderHook(() => useExercises({ enabled: false }));

    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(ExerciseService.getInitialExercisesSync).not.toHaveBeenCalled();
    expect(ExerciseService.getAllExercises).not.toHaveBeenCalled();
  });

  it('loads exercises after becoming enabled', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useExercises({ enabled }),
      { initialProps: { enabled: false } },
    );

    act(() => {
      rerender({ enabled: true });
    });

    await waitFor(() => {
      expect(result.current.exercises).toEqual([{ id: 'loaded', name: 'Loaded' }]);
    });
    expect(ExerciseService.getAllExercises).toHaveBeenCalledTimes(1);
  });
});
