import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useSuperwallEvents, useUser } from 'expo-superwall';
import type { PaywallResult, PaywallSkippedReason } from 'expo-superwall';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { shouldShowPaywallGateConfigError } from '@/src/components/superwall/superwallGuards';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';
const ENTITLEMENT_RETRY_INTERVAL_MS = 1_000;
const ENTITLEMENT_RETRY_WINDOW_MS = 12_000;
const CHECKOUT_RECOVERY_INITIAL_DELAY_MS = 1_200;
const CHECKOUT_RECOVERY_INTERVAL_MS = 1_000;
const CHECKOUT_RECOVERY_WINDOW_MS = 90_000;
const PAYWALL_CONFIG_ERROR_MESSAGE = 'Unable to load paywall. Check connection and try again.';
const IDENTITY_SYNC_ERROR_MESSAGE = 'Unable to sync account. Please try again.';

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user: authUser, isAuthResolved } = useAuth();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const {
    refresh,
    subscriptionStatus,
    user: superwallUser,
    getEntitlements,
    setSubscriptionStatus,
    identify,
    signOut,
  } = useUser();
  const { isSuperwallReady, hasSuperwallError } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading,
    hasSuperwallError: state.configurationError !== null,
  }));
  const lastAttemptRef = useRef(-1);
  const hasNavigatedRef = useRef(false);
  const identitySyncAttemptRef = useRef<string | null>(null);
  const identitySyncInFlightRef = useRef<Promise<void> | null>(null);
  const checkoutRecoveryStartedAtRef = useRef<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [checkoutRecoveryAttempt, setCheckoutRecoveryAttempt] = useState(0);
  const [gateError, setGateError] = useState<string | null>(null);

  const authUserId = authUser?.id ?? null;
  const superwallUserId =
    typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
      ? superwallUser.appUserId
      : null;
  const hasActiveSubscription = subscriptionStatus.status === 'ACTIVE';
  const hasActiveSubscriptionRef = useRef(hasActiveSubscription);
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
    if (__DEV__) {
      console.log('[Superwall] finishGate -> /(tabs)', {
        status: subscriptionStatus.status,
        hasActiveSubscription: hasActiveSubscriptionRef.current,
      });
    }
    hasNavigatedRef.current = true;
    queueTourStartAfterPaywallClose();
    router.replace('/(tabs)');
  }, [queueTourStartAfterPaywallClose, router, subscriptionStatus.status]);

  const reconcileSubscriptionAccess = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Best effort: entitlement check below can still recover ACTIVE access.
    }

    if (hasActiveSubscriptionRef.current) {
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
    } catch (error) {
      if (__DEV__) {
        console.warn('[Superwall] entitlement reconciliation failed:', error);
      }
    }

    return hasActiveSubscriptionRef.current;
  }, [getEntitlements, refresh, setSubscriptionStatus]);

  const waitForAccessAfterCheckout = useCallback(
    async (trigger: string) => {
      const startedAt = Date.now();

      while (Date.now() - startedAt <= ENTITLEMENT_RETRY_WINDOW_MS) {
        const hasAccess = await reconcileSubscriptionAccess();
        if (hasAccess) {
          if (__DEV__) {
            console.log('[Superwall] access recovered after checkout', {
              trigger,
              elapsedMs: Date.now() - startedAt,
            });
          }
          return true;
        }

        await new Promise<void>((resolve) => {
          setTimeout(resolve, ENTITLEMENT_RETRY_INTERVAL_MS);
        });
      }

      if (__DEV__) {
        console.warn('[Superwall] access did not recover after retry window', {
          trigger,
          retryWindowMs: ENTITLEMENT_RETRY_WINDOW_MS,
        });
      }

      return false;
    },
    [reconcileSubscriptionAccess],
  );

  const handleDismiss = useCallback(
    (_paywallInfo: unknown, result: PaywallResult) => {
      void (async () => {
        if (__DEV__) {
          console.log('[Superwall] paywall dismissed:', {
            resultType: result.type,
            status: subscriptionStatus.status,
            hasActiveSubscription: hasActiveSubscriptionRef.current,
          });
        }
        if (
          result.type === 'purchased' ||
          result.type === 'restored' ||
          hasActiveSubscriptionRef.current
        ) {
          finishGate();
          return;
        }

        const hasAccess = await waitForAccessAfterCheckout(`dismiss:${result.type}`);
        if (hasAccess) {
          finishGate();
          return;
        }

        setGateError('Subscription required to continue.');
      })();
    },
    [finishGate, subscriptionStatus.status, waitForAccessAfterCheckout],
  );

  const handleSkip = useCallback(
    (reason: PaywallSkippedReason) => {
      void (async () => {
        if (__DEV__) {
          console.log(
            '[Superwall] paywall gate skipped:',
            reason.type,
            'subscription:',
            subscriptionStatus.status,
          );
        }
        if (hasActiveSubscriptionRef.current) {
          finishGate();
          return;
        }

        const hasAccess = await waitForAccessAfterCheckout(`skip:${reason.type}`);
        if (hasAccess) {
          finishGate();
          return;
        }

        setGateError('Unable to verify access. Please try again.');
      })();
    },
    [finishGate, subscriptionStatus.status, waitForAccessAfterCheckout],
  );

  const handleError = useCallback(
    (error: string) => {
      void (async () => {
        if (__DEV__) {
          console.warn('[Superwall] paywall gate error:', error);
        }
        if (hasActiveSubscriptionRef.current) {
          finishGate();
          return;
        }

        const hasAccess = await waitForAccessAfterCheckout(`error:${error}`);
        if (hasAccess) {
          finishGate();
          return;
        }

        setGateError('Unable to load paywall. Check connection and try again.');
      })();
    },
    [finishGate, waitForAccessAfterCheckout],
  );

  const { registerPlacement } = usePlacement({
    onDismiss: handleDismiss,
    onSkip: handleSkip,
    onError: handleError,
  });

  const startCheckoutRecovery = useCallback((trigger: string, productId?: string) => {
    checkoutRecoveryStartedAtRef.current = Date.now();
    setCheckoutRecoveryAttempt((value) => value + 1);
    if (__DEV__) {
      console.log('[Superwall] checkout recovery armed', {
        trigger,
        productId: productId ?? null,
      });
    }
  }, []);

  const forceActivateFromTransaction = useCallback(
    async (trigger: string) => {
      try {
        const entitlements = await getEntitlements();
        const activeEntitlements = entitlements.active;

        if (activeEntitlements.length === 0) {
          if (__DEV__) {
            console.warn('[Superwall] transaction completed but no active entitlements yet', { trigger });
          }
          return;
        }

        await setSubscriptionStatus({
          status: 'ACTIVE',
          entitlements: activeEntitlements,
        });
        hasActiveSubscriptionRef.current = true;
        if (__DEV__) {
          console.log('[Superwall] force-activated from transaction event', { trigger });
        }
        finishGate();
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] failed to force-activate from transaction event', {
            trigger,
            error,
          });
        }
      }
    },
    [finishGate, getEntitlements, setSubscriptionStatus],
  );

  useSuperwallEvents({
    onPurchase: (params: { productId?: string }) => {
      startCheckoutRecovery('purchase-start', params.productId);
    },
    onPurchaseRestore: () => {
      startCheckoutRecovery('restore-start');
    },
    onSuperwallEvent: (eventInfo: { event?: { event?: string } }) => {
      const eventType = eventInfo?.event?.event;
      if (eventType === 'transactionStart') {
        startCheckoutRecovery(`event:${eventType}`);
      }
      if (
        eventType === 'transactionComplete' ||
        eventType === 'subscriptionStart' ||
        eventType === 'freeTrialStart'
      ) {
        startCheckoutRecovery(`event:${eventType}`);
        void forceActivateFromTransaction(`event:${eventType}`);
      }
    },
  });

  useEffect(() => {
    hasActiveSubscriptionRef.current = hasActiveSubscription;
    if (__DEV__) {
      console.log('[Superwall] subscription status changed:', subscriptionStatus.status);
    }
    if (hasActiveSubscription) {
      finishGate();
    }
  }, [finishGate, hasActiveSubscription, subscriptionStatus.status]);

  useEffect(() => {
    if (checkoutRecoveryAttempt === 0 || hasNavigatedRef.current) {
      return;
    }

    const startedAt = checkoutRecoveryStartedAtRef.current;
    if (!startedAt) {
      return;
    }

    let cancelled = false;
    let activeTimeout: ReturnType<typeof setTimeout> | null = null;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        activeTimeout = setTimeout(() => {
          resolve();
        }, ms);
      });

    void (async () => {
      await sleep(CHECKOUT_RECOVERY_INITIAL_DELAY_MS);

      while (
        !cancelled &&
        !hasNavigatedRef.current &&
        Date.now() - startedAt <= CHECKOUT_RECOVERY_WINDOW_MS
      ) {
        const hasAccess = await reconcileSubscriptionAccess();
        if (hasAccess) {
          if (__DEV__) {
            console.log('[Superwall] checkout recovery granted access');
          }
          finishGate();
          return;
        }

        await sleep(CHECKOUT_RECOVERY_INTERVAL_MS);
      }

      if (__DEV__ && !cancelled && !hasNavigatedRef.current) {
        console.warn('[Superwall] checkout recovery timed out without access');
      }
    })();

    return () => {
      cancelled = true;
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
    };
  }, [checkoutRecoveryAttempt, finishGate, reconcileSubscriptionAccess]);

  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (!isAuthResolved || !isSuperwallReady || hasSuperwallError) {
      identitySyncAttemptRef.current = null;
      return;
    }

    if (isIdentityReady) {
      identitySyncAttemptRef.current = null;
      if (gateError === IDENTITY_SYNC_ERROR_MESSAGE) {
        setGateError(null);
      }
      return;
    }

    const syncKey = `${authUserId ?? 'anon'}:${superwallUserId ?? 'anon'}:${attempt}`;
    if (identitySyncAttemptRef.current === syncKey || identitySyncInFlightRef.current) {
      return;
    }
    identitySyncAttemptRef.current = syncKey;

    const syncIdentity = (async () => {
      try {
        if (authUserId) {
          if (superwallUserId !== authUserId) {
            if (__DEV__) {
              console.log('[Superwall] forcing identity sync in paywall gate', {
                authUserId,
                superwallUserId,
              });
            }
            await identify(authUserId, { restorePaywallAssignments: true });
          }
        } else if (superwallUserId) {
          await signOut();
        }

        await refresh();
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] paywall gate identity sync failed:', error);
        }
        if (!hasNavigatedRef.current) {
          setGateError(IDENTITY_SYNC_ERROR_MESSAGE);
        }
      } finally {
        identitySyncInFlightRef.current = null;
      }
    })();

    identitySyncInFlightRef.current = syncIdentity;
  }, [
    authUserId,
    gateError,
    hasSuperwallError,
    identify,
    isAuthResolved,
    isIdentityReady,
    isSuperwallReady,
    refresh,
    signOut,
    superwallUserId,
    attempt,
  ]);

  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (shouldShowPaywallGateConfigError({
      hasSuperwallError,
      hasNavigated: hasNavigatedRef.current,
    })) {
      setGateError(PAYWALL_CONFIG_ERROR_MESSAGE);
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
      setGateError(null);

      const hasAccess = await reconcileSubscriptionAccess();
      if (hasAccess || hasNavigatedRef.current) {
        if (__DEV__) {
          console.log('[Superwall] gate resolved before registerPlacement', {
            hasNavigated: hasNavigatedRef.current,
            status: subscriptionStatus.status,
          });
        }
        finishGate();
        return;
      }

      if (hasNavigatedRef.current || hasActiveSubscriptionRef.current) {
        if (__DEV__) {
          console.log('[Superwall] skipping registerPlacement: already active/navigated', {
            hasNavigated: hasNavigatedRef.current,
            status: subscriptionStatus.status,
          });
        }
        finishGate();
        return;
      }

      try {
        if (__DEV__) {
          console.log('[Superwall] registerPlacement start', {
            placement: POST_SIGN_UP_PLACEMENT,
            status: subscriptionStatus.status,
          });
        }
        await registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] registerPlacement failed:', error);
        }
        if (!hasActiveSubscriptionRef.current) {
          setGateError(PAYWALL_CONFIG_ERROR_MESSAGE);
          return;
        }
        finishGate();
      }
    })();
  }, [
    attempt,
    finishGate,
    hasActiveSubscription,
    hasSuperwallError,
    isIdentityReady,
    reconcileSubscriptionAccess,
    registerPlacement,
    startCheckoutRecovery,
    subscriptionStatus.status,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {gateError ? (
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Subscription Required</Text>
          <Text style={[styles.errorBody, { color: colors.textSecondary }]}>{gateError}</Text>
          <Pressable
            style={[
              styles.retryButton,
              {
                backgroundColor: colors.textPrimary,
              },
            ]}
            onPress={() => {
              identitySyncAttemptRef.current = null;
              setGateError(null);
              setAttempt((value) => value + 1);
            }}
          >
            <Text style={[styles.retryText, { color: colors.background }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <StainlessSteelPattern />
          <View style={styles.logoContainer}>
            <AnimatedLogo size="large" centered animate={false} />
          </View>
        </>
      )}
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
  errorCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
