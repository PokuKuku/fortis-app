import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useExercises } from '@/src/hooks/useExercises';
import * as ExerciseService from '@/src/services/exerciseService';

jest.mock('@/src/services/exerciseService', () => ({
  getInitialExercisesSync: jest.fn(() => [{ id: 'initial', name: 'Initial' }]),
  getCachedInitialExercisesSync: jest.fn(() => null),
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

  it('can defer the large synchronous snapshot until after the first render', async () => {
    let resolveRemote: ((value: Array<{ id: string; name: string }>) => void) | undefined;
    (ExerciseService.getAllExercises as jest.Mock).mockReturnValueOnce(new Promise((resolve) => {
      resolveRemote = resolve;
    }));
    const { result } = renderHook(() => useExercises({ deferInitialSnapshot: true }));

    await waitFor(() => {
      expect(result.current.exercises).toEqual([{ id: 'initial', name: 'Initial' }]);
    });
    expect(ExerciseService.getInitialExercisesSync).toHaveBeenCalledTimes(1);

    act(() => {
      resolveRemote?.([{ id: 'loaded', name: 'Loaded' }]);
    });
    await waitFor(() => {
      expect(result.current.exercises).toEqual([{ id: 'loaded', name: 'Loaded' }]);
    });
    expect(ExerciseService.getAllExercises).toHaveBeenCalledTimes(1);
  });

  it('uses an already-warmed snapshot immediately without reparsing it', async () => {
    (ExerciseService.getCachedInitialExercisesSync as jest.Mock).mockReturnValueOnce([
      { id: 'cached', name: 'Cached' },
    ]);

    const { result } = renderHook(() => useExercises({ deferInitialSnapshot: true }));

    expect(result.current.exercises).toEqual([{ id: 'cached', name: 'Cached' }]);
    expect(ExerciseService.getInitialExercisesSync).not.toHaveBeenCalled();
    await waitFor(() => expect(ExerciseService.getAllExercises).toHaveBeenCalledTimes(1));
  });
});
