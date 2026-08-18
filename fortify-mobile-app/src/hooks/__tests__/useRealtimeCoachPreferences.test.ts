import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useRealtimeCoachPreferences } from '@/src/hooks/useRealtimeCoachPreferences';
import type { RealtimeCoachPreferences } from '@/src/types/realtimeCoach';

let mockStoredPreferences: RealtimeCoachPreferences = {
  personality: 'direct',
  intensity: 0.55,
  voice: 'marin',
  customInstructions: '',
  interactionMode: 'push_to_talk',
};
const mockListeners = new Set<(preferences: RealtimeCoachPreferences) => void>();

jest.mock('@/src/services/realtimeCoachPreferencesService', () => ({
  getRealtimeCoachPreferences: jest.fn(() => Promise.resolve(mockStoredPreferences)),
  setRealtimeCoachPreferences: jest.fn((preferences: RealtimeCoachPreferences) => {
    mockStoredPreferences = preferences;
    mockListeners.forEach((listener) => listener(preferences));
    return Promise.resolve();
  }),
  subscribeToRealtimeCoachPreferences: jest.fn((listener: (preferences: RealtimeCoachPreferences) => void) => {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
  }),
}));

describe('useRealtimeCoachPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredPreferences = {
      personality: 'direct',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
      interactionMode: 'push_to_talk',
    };
    mockListeners.clear();
  });

  it('does not read or subscribe to preferences when disabled for a tour simulation', () => {
    const service = jest.requireMock('@/src/services/realtimeCoachPreferencesService') as {
      getRealtimeCoachPreferences: jest.Mock;
      subscribeToRealtimeCoachPreferences: jest.Mock;
    };

    const hook = renderHook(() => useRealtimeCoachPreferences({ enabled: false }));

    expect(hook.result.current.isLoaded).toBe(true);
    expect(service.getRealtimeCoachPreferences).not.toHaveBeenCalled();
    expect(service.subscribeToRealtimeCoachPreferences).not.toHaveBeenCalled();
    hook.unmount();
  });

  it('synchronizes voice changes across mounted consumers', async () => {
    const settingsHook = renderHook(() => useRealtimeCoachPreferences());
    const coachHook = renderHook(() => useRealtimeCoachPreferences());

    await waitFor(() => {
      expect(settingsHook.result.current.isLoaded).toBe(true);
      expect(coachHook.result.current.isLoaded).toBe(true);
    });

    await act(async () => {
      await settingsHook.result.current.updatePreferences({
        ...settingsHook.result.current.preferences,
        voice: 'cedar',
      });
    });

    expect(settingsHook.result.current.preferences.voice).toBe('cedar');
    expect(coachHook.result.current.preferences.voice).toBe('cedar');

    settingsHook.unmount();
    coachHook.unmount();
  });

  it('persists the selected interaction mode for future consumers', async () => {
    const settingsHook = renderHook(() => useRealtimeCoachPreferences());
    await waitFor(() => expect(settingsHook.result.current.isLoaded).toBe(true));

    await act(async () => {
      await settingsHook.result.current.updatePreferences((current) => ({
        ...current,
        interactionMode: 'realtime',
      }));
    });
    settingsHook.unmount();

    const reopenedHook = renderHook(() => useRealtimeCoachPreferences());
    await waitFor(() => expect(reopenedHook.result.current.isLoaded).toBe(true));

    expect(reopenedHook.result.current.preferences.interactionMode).toBe('realtime');
    reopenedHook.unmount();
  });
});
