import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useRealtimeCoachPreferences } from '@/src/hooks/useRealtimeCoachPreferences';
import type { RealtimeCoachPreferences } from '@/src/types/realtimeCoach';

let mockStoredPreferences: RealtimeCoachPreferences = {
  personality: 'direct',
  intensity: 0.55,
  voice: 'marin',
  customInstructions: '',
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
    mockStoredPreferences = {
      personality: 'direct',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    };
    mockListeners.clear();
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
});
