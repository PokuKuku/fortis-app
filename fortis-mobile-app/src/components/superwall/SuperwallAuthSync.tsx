import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSuperwall, useSuperwallEvents, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';

const MIN_REFRESH_INTERVAL_MS = 5_000;
const POST_PAYWALL_SYNC_COOLDOWN_MS = 2_000;

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
  const isPaywallVisibleRef = useRef(false);
  const isPurchaseInProgressRef = useRef(false);
  const suppressSyncUntilRef = useRef(0);

  useSuperwallEvents({
    onPaywallPresent: () => {
      isPaywallVisibleRef.current = true;
    },
    onPaywallDismiss: () => {
      isPaywallVisibleRef.current = false;
      isPurchaseInProgressRef.current = false;
      suppressSyncUntilRef.current = Date.now() + POST_PAYWALL_SYNC_COOLDOWN_MS;
    },
    onPaywallSkip: () => {
      isPaywallVisibleRef.current = false;
      isPurchaseInProgressRef.current = false;
      suppressSyncUntilRef.current = Date.now() + POST_PAYWALL_SYNC_COOLDOWN_MS;
    },
    onPaywallError: () => {
      isPaywallVisibleRef.current = false;
      isPurchaseInProgressRef.current = false;
      suppressSyncUntilRef.current = Date.now() + POST_PAYWALL_SYNC_COOLDOWN_MS;
    },
    onPurchase: () => {
      isPurchaseInProgressRef.current = true;
    },
  });

  const syncSuperwall = useCallback(async (forceRefresh = false) => {
    // Superwall can take a moment to configure; avoid syncing too early.
    if (!isLoaded || hasError || !isAuthResolved) {
      return;
    }
    // Avoid identity/refresh churn while a paywall or purchase flow is active.
    if (
      isPaywallVisibleRef.current ||
      isPurchaseInProgressRef.current ||
      Date.now() < suppressSyncUntilRef.current
    ) {
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
        // Returning from the App Store sheet can trigger this transition.
        // Keep it non-forced so we don't interrupt transaction reconciliation.
        void syncSuperwall(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncSuperwall]);

  return null;
}
