import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useUser } from 'expo-superwall';
import type { PaywallResult, PaywallSkippedReason } from 'expo-superwall';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { shouldShowPaywallGateConfigError } from '@/src/components/superwall/superwallGuards';
import { reconcileSubscriptionStatus } from '@/src/components/superwall/subscriptionStatusSync';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';
const GATE_RETRY_DELAY_MS = 2_000;
const IDENTITY_SYNC_MAX_RETRIES = 3;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user: authUser, isAuthResolved } = useAuth();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const {
    identify,
    refresh,
    signOut,
    subscriptionStatus,
    user: superwallUser,
    getEntitlements,
    setSubscriptionStatus,
  } = useUser();
  const { isSuperwallReady, hasSuperwallError } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading,
    hasSuperwallError: state.configurationError !== null,
  }));

  const hasNavigatedRef = useRef(false);
  const lastAttemptRef = useRef(-1);
  const lastIdentityRetryRef = useRef(-1);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasActiveSubscriptionRef = useRef(false);
  const subscriptionStatusRef = useRef(subscriptionStatus);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    subscriptionStatusRef.current = subscriptionStatus;
  }, [subscriptionStatus]);

  const authUserId = authUser?.id ?? null;
  const superwallUserId =
    typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
      ? superwallUser.appUserId
      : null;

  const isIdentityReady = useMemo(() => {
    if (!isAuthResolved || !isSuperwallReady || hasSuperwallError) {
      return false;
    }

    if (authUserId) {
      return superwallUserId === authUserId;
    }

    return superwallUserId === null;
  }, [authUserId, hasSuperwallError, isAuthResolved, isSuperwallReady, superwallUserId]);

  const canBypassIdentityGate =
    isAuthResolved &&
    isSuperwallReady &&
    !hasSuperwallError &&
    authUserId !== null &&
    superwallUserId === null &&
    attempt >= IDENTITY_SYNC_MAX_RETRIES;

  const finishGate = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    queueTourStartAfterPaywallClose();
    router.replace('/(tabs)');
  }, [queueTourStartAfterPaywallClose, router]);

  const scheduleRetry = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null;
      if (!hasNavigatedRef.current) {
        setAttempt((value) => value + 1);
      }
    }, GATE_RETRY_DELAY_MS);
  }, []);

  const syncAccessOnce = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Best effort.
    }

    const reconciliation = await reconcileSubscriptionStatus({
      currentStatus: subscriptionStatusRef.current,
      getEntitlements,
      setSubscriptionStatus,
    });

    if (reconciliation.wasVerified) {
      hasActiveSubscriptionRef.current = reconciliation.hasActiveSubscription;
    }

    return reconciliation;
  }, [getEntitlements, refresh, setSubscriptionStatus]);

  const retryIdentitySync = useCallback(async () => {
    if (!isAuthResolved || !isSuperwallReady || hasSuperwallError) {
      return;
    }

    try {
      if (authUserId) {
        await identify(authUserId, { restorePaywallAssignments: true });
      } else if (superwallUserId) {
        await signOut();
      }
    } catch {
      // Best effort.
    }

    try {
      await refresh();
    } catch {
      // Best effort.
    }
  }, [
    authUserId,
    hasSuperwallError,
    identify,
    isAuthResolved,
    isSuperwallReady,
    refresh,
    signOut,
    superwallUserId,
  ]);

  const handleDismiss = useCallback(
    (_paywallInfo: { name?: string } | unknown, result: PaywallResult) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        hasActiveSubscriptionRef.current = true;
        finishGate();
        return;
      }

      if (hasActiveSubscriptionRef.current) {
        finishGate();
        return;
      }

      scheduleRetry();
    },
    [finishGate, scheduleRetry],
  );

  const handleSkip = useCallback(
    (_reason: PaywallSkippedReason) => {
      if (hasActiveSubscriptionRef.current) {
        finishGate();
        return;
      }

      scheduleRetry();
    },
    [finishGate, scheduleRetry],
  );

  const handleError = useCallback(
    (_error: string) => {
      if (hasActiveSubscriptionRef.current) {
        finishGate();
        return;
      }

      scheduleRetry();
    },
    [finishGate, scheduleRetry],
  );

  const { registerPlacement } = usePlacement({
    onDismiss: handleDismiss,
    onSkip: handleSkip,
    onError: handleError,
  });

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (shouldShowPaywallGateConfigError({
      hasSuperwallError,
      hasNavigated: hasNavigatedRef.current,
    })) {
      scheduleRetry();
      return;
    }

    if (!isAuthResolved || !isSuperwallReady) {
      scheduleRetry();
      return;
    }

    if (!isIdentityReady && !canBypassIdentityGate) {
      if (lastIdentityRetryRef.current !== attempt) {
        lastIdentityRetryRef.current = attempt;
        void retryIdentitySync();
      }
      scheduleRetry();
      return;
    }

    if (lastAttemptRef.current === attempt) {
      return;
    }
    lastAttemptRef.current = attempt;

    void (async () => {
      const access = await syncAccessOnce();
      if (
        (access.wasVerified && access.hasActiveSubscription) ||
        hasNavigatedRef.current
      ) {
        finishGate();
        return;
      }

      if (!access.wasVerified) {
        scheduleRetry();
        return;
      }

      try {
        await registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
      } catch {
        scheduleRetry();
      }
    })();
  }, [
    attempt,
    finishGate,
    hasSuperwallError,
    isIdentityReady,
    isSuperwallReady,
    registerPlacement,
    retryIdentitySync,
    scheduleRetry,
    syncAccessOnce,
    canBypassIdentityGate,
    isAuthResolved,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <View style={styles.logoContainer}>
        <AnimatedFortifyLogo size="large" centered animate />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
