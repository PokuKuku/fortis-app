import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useUser } from 'expo-superwall';
import type { PaywallResult, PaywallSkippedReason } from 'expo-superwall';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { shouldShowPaywallGateConfigError } from '@/src/components/superwall/superwallGuards';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';
const GATE_RETRY_DELAY_MS = 2_000;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user: authUser, isAuthResolved } = useAuth();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const {
    refresh,
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
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasActiveSubscriptionRef = useRef(subscriptionStatus.status === 'ACTIVE');
  const [attempt, setAttempt] = useState(0);

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

    if (hasActiveSubscriptionRef.current || subscriptionStatus.status === 'ACTIVE') {
      hasActiveSubscriptionRef.current = true;
      return true;
    }

    try {
      const entitlements = await getEntitlements();
      if (entitlements.active.length > 0) {
        await setSubscriptionStatus({
          status: 'ACTIVE',
          entitlements: entitlements.active,
        });
        hasActiveSubscriptionRef.current = true;
        return true;
      }
    } catch {
      // Best effort.
    }

    return false;
  }, [getEntitlements, refresh, setSubscriptionStatus, subscriptionStatus.status]);

  const handleDismiss = useCallback(
    (_paywallInfo: unknown, result: PaywallResult) => {
      if (
        result.type === 'purchased' ||
        result.type === 'restored' ||
        hasActiveSubscriptionRef.current
      ) {
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
    hasActiveSubscriptionRef.current = subscriptionStatus.status === 'ACTIVE';

    if (hasActiveSubscriptionRef.current) {
      finishGate();
    }
  }, [finishGate, subscriptionStatus.status]);

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

    if (!isIdentityReady) {
      return;
    }

    if (lastAttemptRef.current === attempt) {
      return;
    }
    lastAttemptRef.current = attempt;

    void (async () => {
      const hasAccess = await syncAccessOnce();
      if (hasAccess || hasNavigatedRef.current) {
        finishGate();
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
    registerPlacement,
    scheduleRetry,
    syncAccessOnce,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <View style={styles.logoContainer}>
        <AnimatedLogo size="large" centered animate={false} />
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
