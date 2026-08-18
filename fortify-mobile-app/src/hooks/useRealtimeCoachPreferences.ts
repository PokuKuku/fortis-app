import { useCallback, useEffect, useState } from 'react';
import {
  getRealtimeCoachPreferences,
  setRealtimeCoachPreferences,
  subscribeToRealtimeCoachPreferences,
} from '@/src/services/realtimeCoachPreferencesService';
import {
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';

export function useRealtimeCoachPreferences(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [preferences, setPreferencesState] = useState<RealtimeCoachPreferences>(
    DEFAULT_REALTIME_COACH_PREFERENCES
  );
  const [isLoaded, setIsLoaded] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    let mounted = true;
    const unsubscribe = subscribeToRealtimeCoachPreferences((nextPreferences) => {
      if (mounted) {
        setPreferencesState(nextPreferences);
      }
    });

    void getRealtimeCoachPreferences()
      .then((loaded) => {
        if (mounted) {
          setPreferencesState(loaded);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [enabled]);

  const updatePreferences = useCallback(async (
    next:
      | RealtimeCoachPreferences
      | ((current: RealtimeCoachPreferences) => RealtimeCoachPreferences)
  ) => {
    const resolved = typeof next === 'function' ? next(preferences) : next;
    setPreferencesState(resolved);
    if (!enabled) return;
    try {
      await setRealtimeCoachPreferences(resolved);
    } catch (error) {
      setPreferencesState(preferences);
      throw error;
    }
  }, [enabled, preferences]);

  return {
    preferences,
    isLoaded,
    updatePreferences,
  };
}
