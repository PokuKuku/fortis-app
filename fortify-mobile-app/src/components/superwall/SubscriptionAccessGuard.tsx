import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSuperwall, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';
import { reconcileSubscriptionStatus } from '@/src/components/superwall/subscriptionStatusSync';

const UNPROTECTED_ROOT_SEGMENTS = new Set([
  '(tabs)',
  'auth',
  'index',
  'onboarding',
  'paywall-gate',
]);

export function SubscriptionAccessGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, profile, profileResolved, user: authUser } = useAuth();
  const { getEntitlements, setSubscriptionStatus, subscriptionStatus, user: superwallUser } = useUser();
  const { isSuperwallReady } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading && state.configurationError === null,
  }));
  const inFlightRef = useRef(false);
  const subscriptionStatusRef = useRef(subscriptionStatus);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    subscriptionStatusRef.current = subscriptionStatus;
  }, [subscriptionStatus]);

  const rootSegment = segments[0];
  const isProtectedRoute =
    typeof rootSegment === 'string' &&
    !UNPROTECTED_ROOT_SEGMENTS.has(rootSegment);
  const authUserId = authUser?.id ?? null;
  const superwallUserId =
    typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
      ? superwallUser.appUserId
      : null;
  const isIdentityReady = authUserId !== null && superwallUserId === authUserId;

  const verifyAccess = useCallback(async () => {
    if (
      inFlightRef.current ||
      !isProtectedRoute ||
      isLoading ||
      !isAuthenticated ||
      !profileResolved ||
      profile?.onboarding_completed !== true ||
      !isSuperwallReady ||
      !isIdentityReady
    ) {
      return;
    }

    inFlightRef.current = true;
    try {
      const access = await reconcileSubscriptionStatus({
        currentStatus: subscriptionStatusRef.current,
        getEntitlements,
        setSubscriptionStatus,
      });

      if (access.wasVerified && !access.hasActiveSubscription) {
        router.replace('/paywall-gate');
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [
    getEntitlements,
    isAuthenticated,
    isIdentityReady,
    isLoading,
    isProtectedRoute,
    isSuperwallReady,
    profile?.onboarding_completed,
    profileResolved,
    router,
    setSubscriptionStatus,
  ]);

  useEffect(() => {
    void verifyAccess();
  }, [verifyAccess]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active'
      ) {
        void verifyAccess();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [verifyAccess]);

  return null;
}
