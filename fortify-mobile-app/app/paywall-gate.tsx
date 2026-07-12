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
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import {
  loadPendingOnboardingConversionContext,
  type OnboardingConversionContext,
} from '@/src/utils/onboardingConversion';
import {
  clearPendingOnboardingAuthCompletion,
  usePendingOnboardingAuthCompletion,
} from '@/src/utils/onboardingAuthCompletion';

const POST_SIGN_UP_PLACEMENT = PAYWALL_PLACEMENTS.postSignUp;
const GATE_RETRY_DELAY_MS = 2_000;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user: authUser, isAuthResolved, profile, profileResolved, needsOnboarding } = useAuth();
  const {
    isPending: hasPendingOnboardingAuthCompletion,
    isResolved: pendingOnboardingAuthCompletionResolved,
  } = usePendingOnboardingAuthCompletion();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const {
    identify,
    refresh,
    signOut,
    subscriptionStatus,
    user: superwallUser,
    getEntitlements,
    setSubscriptionStatus,
    update,
  } = useUser();
  const { isSuperwallReady, hasSuperwallError } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading,
    hasSuperwallError: state.configurationError !== null,
  }));

  const hasNavigatedRef = useRef(false);
  const lastAttemptRef = useRef(-1);
  const lastIdentityRetryRef = useRef(-1);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionStatusRef = useRef(subscriptionStatus);
  const isPaywallPresentedRef = useRef(false);
  const isVerifyingAccessRef = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [paywallContext, setPaywallContext] = useState<OnboardingConversionContext | null>(null);

  useEffect(() => {
    subscriptionStatusRef.current = subscriptionStatus;
  }, [subscriptionStatus]);

  useEffect(() => {
    let isActive = true;

    const loadContext = async () => {
      const context = await loadPendingOnboardingConversionContext();
      if (isActive) {
        setPaywallContext(context);
      }
    };

    void loadContext();

    return () => {
      isActive = false;
    };
  }, []);

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

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }
    if (!authUserId) {
      router.replace('/onboarding/welcome');
      return;
    }
    if (!profileResolved) {
      return;
    }
    if (
      !pendingOnboardingAuthCompletionResolved ||
      (hasPendingOnboardingAuthCompletion && (!profile || needsOnboarding))
    ) {
      return;
    }
    if (!profile || needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [
    authUserId,
    hasPendingOnboardingAuthCompletion,
    isAuthResolved,
    needsOnboarding,
    pendingOnboardingAuthCompletionResolved,
    profile,
    profileResolved,
    router,
  ]);

  const finishGate = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    void clearPendingOnboardingAuthCompletion()
      .catch(() => undefined)
      .finally(() => {
        queueTourStartAfterPaywallClose();
        router.replace('/(tabs)');
      });
  }, [queueTourStartAfterPaywallClose, router]);

  const scheduleRetry = useCallback(() => {
    if (
      hasNavigatedRef.current ||
      isPaywallPresentedRef.current ||
      isVerifyingAccessRef.current
    ) {
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

  const handleTransientGateFailure = useCallback(() => {
    scheduleRetry();
  }, [scheduleRetry]);

  const syncAccessOnce = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Entitlement reconciliation below is still worth attempting.
    }

    const reconciliation = await reconcileSubscriptionStatus({
      currentStatus: subscriptionStatusRef.current,
      getEntitlements,
      setSubscriptionStatus,
    });

    return reconciliation;
  }, [getEntitlements, refresh, setSubscriptionStatus]);

  const finishGateIfSubscribed = useCallback(async () => {
    if (isVerifyingAccessRef.current) {
      return;
    }

    isVerifyingAccessRef.current = true;
    try {
      const access = await syncAccessOnce();

      if (access.wasVerified && access.hasActiveSubscription) {
        finishGate();
        return;
      }
    } finally {
      isVerifyingAccessRef.current = false;
    }

    scheduleRetry();
  }, [finishGate, scheduleRetry, syncAccessOnce]);

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
    } catch (error) {
      console.warn('[Superwall] Unable to identify authenticated user before paywall', {
        attempt: attempt + 1,
        error,
      });
      return;
    }

    try {
      await refresh();
    } catch {
      // Best effort.
    }
  }, [
    authUserId,
    attempt,
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
      isPaywallPresentedRef.current = false;
      if (result.type === 'purchased' || result.type === 'restored') {
        void finishGateIfSubscribed();
        return;
      }

      scheduleRetry();
    },
    [finishGateIfSubscribed, scheduleRetry],
  );

  const handleSkip = useCallback(
    (_reason: PaywallSkippedReason) => {
      isPaywallPresentedRef.current = false;
      handleTransientGateFailure();
    },
    [handleTransientGateFailure],
  );

  const handleError = useCallback(
    (_error: string) => {
      isPaywallPresentedRef.current = false;
      handleTransientGateFailure();
    },
    [handleTransientGateFailure],
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

    if (isPaywallPresentedRef.current || isVerifyingAccessRef.current) {
      return;
    }

    if (shouldShowPaywallGateConfigError({
      hasSuperwallError,
      hasNavigated: hasNavigatedRef.current,
    })) {
      handleTransientGateFailure();
      return;
    }

    if (
      !isAuthResolved ||
      !isSuperwallReady ||
      !profileResolved ||
      !pendingOnboardingAuthCompletionResolved ||
      (hasPendingOnboardingAuthCompletion && (!profile || needsOnboarding)) ||
      !profile ||
      needsOnboarding
    ) {
      scheduleRetry();
      return;
    }

    // Never register a purchase placement for an anonymous Superwall user.
    // Purchases must be attributed to the authenticated Supabase user so the
    // Superwall appUserId remains queryable in our backend.
    if (!isIdentityReady) {
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
        handleTransientGateFailure();
        return;
      }

      try {
        if (paywallContext) {
          try {
            await update(paywallContext);
          } catch {
            // Best effort. Placement params still carry the context for paywall rules.
          }
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        isPaywallPresentedRef.current = true;
        await registerPlacement({
          placement: POST_SIGN_UP_PLACEMENT,
          params: paywallContext ?? undefined,
        });
      } catch {
        isPaywallPresentedRef.current = false;
        handleTransientGateFailure();
      }
    })();
  }, [
    attempt,
    finishGate,
    hasSuperwallError,
    handleTransientGateFailure,
    isIdentityReady,
    isSuperwallReady,
    needsOnboarding,
    paywallContext,
    pendingOnboardingAuthCompletionResolved,
    profile,
    profileResolved,
    registerPlacement,
    retryIdentitySync,
    scheduleRetry,
    syncAccessOnce,
    isAuthResolved,
    update,
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
