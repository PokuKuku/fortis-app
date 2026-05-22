import { useCallback, useEffect, useState } from 'react';
import {
  getRealtimeCoachPreferences,
  setRealtimeCoachPreferences,
} from '@/src/services/realtimeCoachPreferencesService';
import {
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';

export function useRealtimeCoachPreferences() {
  const [preferences, setPreferencesState] = useState<RealtimeCoachPreferences>(
    DEFAULT_REALTIME_COACH_PREFERENCES
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
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
    };
  }, []);

  const updatePreferences = useCallback(async (
    next:
      | RealtimeCoachPreferences
      | ((current: RealtimeCoachPreferences) => RealtimeCoachPreferences)
  ) => {
    const resolved = typeof next === 'function' ? next(preferences) : next;
    setPreferencesState(resolved);
    await setRealtimeCoachPreferences(resolved);
  }, [preferences]);

  return {
    preferences,
    isLoaded,
    updatePreferences,
  };
}
