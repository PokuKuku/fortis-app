import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { usePlacement, useSuperwall, useUser } from 'expo-superwall';
import type { PaywallResult, PaywallSkippedReason, SubscriptionStatus } from 'expo-superwall';
import {
  FEATURE_PAYWALLS_ENABLED,
  type PaywallPlacement,
} from '@/src/components/superwall/paywallPlacements';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import {
  activeEntitlementsFromInfo,
  canCreateFreeProgram,
  canCreateFreeWorkoutTemplate,
  entitlementsInfoHasProAccess,
  isUserSubscribedSkipReason,
  subscriptionHasProAccess,
} from '@/src/components/superwall/proFeatureAccess';

type ProFeatureGateParams = Record<string, string | number | boolean | null | undefined>;
type ProFeatureAction = () => void | boolean | Promise<void | boolean>;

type RunProFeatureOptions = {
  placement: PaywallPlacement;
  params?: ProFeatureGateParams;
};

type PendingProFeature = {
  action: ProFeatureAction;
  resolve: (allowed: boolean) => void;
};

const inactiveStatus: SubscriptionStatus = { status: 'INACTIVE' };

const canUseLocalStoreKitProFallback = () => (
  __DEV__ &&
  Platform.OS === 'ios' &&
  process.env.EXPO_PUBLIC_BYPASS_APP_TRANSACTION_CHECK === 'true'
);

const hasLocalStoreKitActiveSubscription = (
  status: SubscriptionStatus | null | undefined,
) => canUseLocalStoreKitProFallback() && status?.status === 'ACTIVE';

export function useProFeatureGate() {
  const {
    refresh,
    subscriptionStatus,
    getEntitlements,
    setSubscriptionStatus,
  } = useUser();
  const { isReady, hasError } = useSuperwall((state) => ({
    isReady: state.isConfigured && !state.isLoading,
    hasError: state.configurationError !== null,
  }));
  const { shouldBypassProGateForTour } = useInAppTour();

  const subscriptionStatusRef = useRef(subscriptionStatus);
  const pendingRef = useRef<PendingProFeature | null>(null);
  const isCompletingRef = useRef(false);

  useEffect(() => {
    subscriptionStatusRef.current = subscriptionStatus;
  }, [subscriptionStatus]);

  const isPro = useMemo(
    () => !FEATURE_PAYWALLS_ENABLED ||
      subscriptionHasProAccess(subscriptionStatus) ||
      hasLocalStoreKitActiveSubscription(subscriptionStatus),
    [subscriptionStatus],
  );

  const verifyProAccess = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Best effort; entitlement fetch below is the source of truth.
    }

    try {
      const entitlementsInfo = await getEntitlements();
      const activeEntitlements = activeEntitlementsFromInfo(entitlementsInfo);
      const hasProEntitlement = entitlementsInfoHasProAccess(entitlementsInfo);

      if (!hasProEntitlement && hasLocalStoreKitActiveSubscription(subscriptionStatusRef.current)) {
        return true;
      }

      const nextStatus: SubscriptionStatus = activeEntitlements.length > 0
        ? { status: 'ACTIVE', entitlements: activeEntitlements }
        : inactiveStatus;

      await setSubscriptionStatus(nextStatus);
      subscriptionStatusRef.current = nextStatus;
      return hasProEntitlement;
    } catch (error) {
      if (__DEV__) {
        console.warn('[Superwall] Pro entitlement verification failed', error);
      }
      return subscriptionHasProAccess(subscriptionStatusRef.current) ||
        hasLocalStoreKitActiveSubscription(subscriptionStatusRef.current);
    }
  }, [getEntitlements, refresh, setSubscriptionStatus]);

  const clearPending = useCallback((allowed: boolean) => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.resolve(allowed);
  }, []);

  const completeIfPro = useCallback(async (allowLocalStoreKitFallback = false) => {
    if (isCompletingRef.current) {
      return;
    }

    isCompletingRef.current = true;
    try {
      const hasAccess = await verifyProAccess();
      const pending = pendingRef.current;

      if (!pending) {
        return;
      }

      if (!hasAccess && !(allowLocalStoreKitFallback && canUseLocalStoreKitProFallback())) {
        clearPending(false);
        return;
      }

      pendingRef.current = null;
      try {
        const result = await pending.action();
        pending.resolve(result !== false);
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] Pro feature action failed', error);
        }
        pending.resolve(false);
      }
    } finally {
      isCompletingRef.current = false;
    }
  }, [clearPending, verifyProAccess]);

  const handleDismiss = useCallback(
    (_paywallInfo: unknown, result: PaywallResult) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        void completeIfPro(true);
        return;
      }

      clearPending(false);
    },
    [clearPending, completeIfPro],
  );

  const handleSkip = useCallback(
    (reason: PaywallSkippedReason) => {
      console.warn('[Superwall] Pro placement skipped:', reason.type);
      if (isUserSubscribedSkipReason(reason)) {
        void completeIfPro(true);
        return;
      }

      clearPending(false);
    },
    [clearPending, completeIfPro],
  );

  const handleError = useCallback(
    (error: string) => {
      if (FEATURE_PAYWALLS_ENABLED) {
        console.error('[Superwall] Pro placement error:', error);
      }
      clearPending(false);
    },
    [clearPending],
  );

  const { registerPlacement } = usePlacement({
    onDismiss: handleDismiss,
    onSkip: handleSkip,
    onError: handleError,
  });

  useEffect(() => () => {
    clearPending(false);
  }, [clearPending]);

  const runProFeature = useCallback(async (
    options: RunProFeatureOptions,
    action: ProFeatureAction,
  ): Promise<boolean> => {
    if (!FEATURE_PAYWALLS_ENABLED) {
      const result = await action();
      return result !== false;
    }

    if (shouldBypassProGateForTour(options.placement)) {
      const result = await action();
      return result !== false;
    }

    if (
      subscriptionHasProAccess(subscriptionStatusRef.current) ||
      hasLocalStoreKitActiveSubscription(subscriptionStatusRef.current)
    ) {
      const result = await action();
      return result !== false;
    }

    if (!isReady || hasError || pendingRef.current) {
      console.warn('[Superwall] Pro placement blocked before registration:', {
        placement: options.placement,
        isReady,
        hasError,
        hasPendingPlacement: pendingRef.current !== null,
      });
      return false;
    }

    return new Promise<boolean>((resolve) => {
      pendingRef.current = { action, resolve };

      registerPlacement({
        placement: options.placement,
        params: options.params,
        feature: () => {
          void completeIfPro(canUseLocalStoreKitProFallback());
        },
      }).catch((error: unknown) => {
        console.warn('[Superwall] Pro placement failed', {
          placement: options.placement,
          error,
        });
        clearPending(false);
      });
    });
  }, [clearPending, completeIfPro, hasError, isReady, registerPlacement, shouldBypassProGateForTour]);

  return {
    isPro,
    runProFeature,
    canCreateProgram: (programCount: number) => canCreateFreeProgram(programCount, isPro),
    canCreateWorkoutTemplate: (templateCount: number) => canCreateFreeWorkoutTemplate(templateCount, isPro),
  };
}
