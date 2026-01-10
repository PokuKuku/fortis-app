import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_SESSION_TIMESTAMP_KEY } from '@/src/constants/storageKeys';
import { analytics } from '@/src/services/analyticsService';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const RETENTION_THRESHOLD_DAYS = 7;

/**
 * Tracks app session starts for retention analysis.
 *
 * Fires `app_session_started` event with:
 * - days_since_last_session: Number of days since user last opened app (null if first session)
 * - is_first_session: Whether this is the user's first ever session
 * - is_returned_user: Whether user returned after 7+ days (useful for retention cohorts)
 *
 * This allows building retention reports (Day 1/7/30, resurrected users).
 */
export function RetentionTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per app launch
    if (hasTracked.current) {
      return;
    }

    async function trackSession() {
      try {
        const now = Date.now();
        const lastSessionStr = await AsyncStorage.getItem(LAST_SESSION_TIMESTAMP_KEY);

        let daysSinceLastSession: number | null = null;
        let isFirstSession = true;
        let isReturnedUser = false;

        if (lastSessionStr) {
          const lastSession = parseInt(lastSessionStr, 10);
          if (!isNaN(lastSession)) {
            isFirstSession = false;
            daysSinceLastSession = Math.floor((now - lastSession) / MILLISECONDS_PER_DAY);
            isReturnedUser = daysSinceLastSession >= RETENTION_THRESHOLD_DAYS;
          }
        }

        // Track the session
        analytics.trackAppSessionStarted({
          daysSinceLastSession,
          isFirstSession,
          isReturnedUser,
        });

        // Update last session timestamp
        await AsyncStorage.setItem(LAST_SESSION_TIMESTAMP_KEY, now.toString());
        hasTracked.current = true;
      } catch (error) {
        // Silently fail - retention tracking should never break the app
        console.warn('[RetentionTracker] Failed to track session:', error);
      }
    }

    trackSession();
  }, []);

  return null;
}
