import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSuperwall, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';

const MIN_REFRESH_INTERVAL_MS = 5_000;

export function SuperwallAuthSync() {
  const { user: authUser, isAuthResolved } = useAuth();
  const { identify, refresh, signOut, user: superwallUser } = useUser();
  const { isLoaded, hasError } = useSuperwall((state) => ({
    isLoaded: !state.isLoading && state.isConfigured,
    hasError: state.configurationError !== null,
  }));
  const identifiedUserIdRef = useRef<string | null>(null);
  const inFlightSyncRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const syncSuperwall = useCallback(async (forceRefresh = false) => {
    // Superwall can take a moment to configure; avoid syncing too early.
    if (!isLoaded || hasError || !isAuthResolved) {
      return;
    }

    if (inFlightSyncRef.current) {
      return inFlightSyncRef.current;
    }

    const now = Date.now();
    const shouldRefresh =
      forceRefresh ||
      !lastRefreshAtRef.current ||
      now - lastRefreshAtRef.current >= MIN_REFRESH_INTERVAL_MS;

    const task = (async () => {
      try {
        const authUserId = authUser?.id ?? null;
        const superwallUserId =
          typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
            ? superwallUser.appUserId
            : null;

        if (authUserId) {
          if (superwallUserId !== authUserId || identifiedUserIdRef.current !== authUserId) {
            await identify(authUserId, { restorePaywallAssignments: true });
            identifiedUserIdRef.current = authUserId;
          }
        } else if (identifiedUserIdRef.current || superwallUserId) {
          await signOut();
          identifiedUserIdRef.current = null;
        }

        if (shouldRefresh) {
          await refresh();
          lastRefreshAtRef.current = Date.now();
        }
      } catch (error) {
        console.warn('[Superwall] Failed to sync user:', error);
      } finally {
        inFlightSyncRef.current = null;
      }
    })();

    inFlightSyncRef.current = task;
    return task;
  }, [
    authUser?.id,
    hasError,
    identify,
    isAuthResolved,
    isLoaded,
    refresh,
    signOut,
    superwallUser?.appUserId,
  ]);

  useEffect(() => {
    void syncSuperwall(true);
  }, [syncSuperwall]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active'
      ) {
        void syncSuperwall(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncSuperwall]);

  return null;
}
