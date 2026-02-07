import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useUser } from 'expo-superwall';
import type { PaywallResult, PaywallSkippedReason } from 'expo-superwall';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user: authUser, isAuthResolved } = useAuth();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const { refresh, subscriptionStatus, user: superwallUser } = useUser();
  const { isSuperwallReady, hasSuperwallError } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading,
    hasSuperwallError: state.configurationError !== null,
  }));
  const lastAttemptRef = useRef(-1);
  const hasNavigatedRef = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [gateError, setGateError] = useState<string | null>(null);

  const authUserId = authUser?.id ?? null;
  const superwallUserId =
    typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
      ? superwallUser.appUserId
      : null;
  const hasActiveSubscription = subscriptionStatus.status === 'ACTIVE';
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

  const handleDismiss = useCallback(
    (_paywallInfo: unknown, result: PaywallResult) => {
      if (result.type === 'purchased' || result.type === 'restored' || hasActiveSubscription) {
        finishGate();
        return;
      }
      setGateError('Subscription required to continue.');
    },
    [finishGate, hasActiveSubscription],
  );

  const handleSkip = useCallback(
    (reason: PaywallSkippedReason) => {
      if (__DEV__) {
        console.log(
          '[Superwall] paywall gate skipped:',
          reason.type,
          'subscription:',
          subscriptionStatus.status,
        );
      }
      if (hasActiveSubscription) {
        finishGate();
        return;
      }
      setGateError('Unable to verify access. Please try again.');
    },
    [finishGate, hasActiveSubscription, subscriptionStatus.status],
  );

  const handleError = useCallback(
    (error: string) => {
      if (__DEV__) {
        console.warn('[Superwall] paywall gate error:', error);
      }
      if (hasActiveSubscription) {
        finishGate();
        return;
      }
      setGateError('Unable to load paywall. Check connection and try again.');
    },
    [finishGate, hasActiveSubscription],
  );

  const { registerPlacement } = usePlacement({
    onDismiss: handleDismiss,
    onSkip: handleSkip,
    onError: handleError,
  });

  useEffect(() => {
    if (hasActiveSubscription) {
      finishGate();
    }
  }, [finishGate, hasActiveSubscription]);

  useEffect(() => {
    if (!isIdentityReady || hasNavigatedRef.current) {
      return;
    }
    if (lastAttemptRef.current === attempt) {
      return;
    }
    lastAttemptRef.current = attempt;

    void (async () => {
      setGateError(null);

      try {
        await refresh();
      } catch (error) {
        console.warn('[Superwall] Failed to refresh before paywall gate:', error);
        if (!hasActiveSubscription) {
          setGateError('Unable to refresh subscription state. Please try again.');
          return;
        }
        finishGate();
        return;
      }

      try {
        await registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] registerPlacement failed:', error);
        }
        if (!hasActiveSubscription) {
          setGateError('Unable to load paywall. Please try again.');
          return;
        }
        finishGate();
      }
    })();
  }, [attempt, finishGate, hasActiveSubscription, isIdentityReady, refresh, registerPlacement]);

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
