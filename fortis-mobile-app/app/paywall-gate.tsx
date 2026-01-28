import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useSuperwallEvents, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useEntitlementStatus } from '@/src/hooks/useEntitlementStatus';
import { GlassButton } from '@/components/GlassButton';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';
const POST_SIGN_UP_ATTRIBUTE = 'hasShownPostSignupPaywall';

let gateInFlight = false;
let gateUserId: string | null = null;
let paywallIsPresenting = false;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, profile, isAuthResolved, isAuthenticated, needsOnboarding } = useAuth();
  const hasNavigatedRef = useRef(false);
  const configTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postSignupAttemptedRef = useRef(false);
  const postSignupMarkedRef = useRef(false);
  const [entitlementTimeoutReached, setEntitlementTimeoutReached] = useState(false);
  const [gateStatus, setGateStatus] = useState<'checking' | 'blocked' | 'error'>('checking');
  const { isEntitled, status: subscriptionStatus, refresh } = useEntitlementStatus();
  const { user: superwallUser, update } = useUser();
  const { isConfigured, isLoading, configurationError } = useSuperwall((state) => ({
    isConfigured: state.isConfigured,
    isLoading: state.isLoading,
    configurationError: state.configurationError,
  }));

  const hasShownPostSignupPaywall = Boolean(
    superwallUser?.[POST_SIGN_UP_ATTRIBUTE] ?? false
  );

  const markPostSignupPaywallSeen = useCallback(() => {
    if (postSignupMarkedRef.current) {
      return;
    }
    postSignupMarkedRef.current = true;
    if (!superwallUser?.appUserId || superwallUser.appUserId !== user?.id) {
      return;
    }
    update({ [POST_SIGN_UP_ATTRIBUTE]: true }).catch(() => undefined);
  }, [superwallUser?.appUserId, update, user?.id]);

  useSuperwallEvents({
    willPresentPaywall: () => {
      paywallIsPresenting = true;
    },
    onPaywallPresent: () => {
      paywallIsPresenting = true;
    },
    willDismissPaywall: () => {
      paywallIsPresenting = false;
    },
    didDismissPaywall: () => {
      paywallIsPresenting = false;
    },
    onPaywallDismiss: () => {
      paywallIsPresenting = false;
    },
    onPaywallSkip: () => {
      paywallIsPresenting = false;
    },
    onPaywallError: () => {
      paywallIsPresenting = false;
    },
  });

  const finishGate = () => {
    gateInFlight = false;
    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;
    router.replace('/(tabs)/index');
  };

  const { registerPlacement, state: placementState } = usePlacement({
    onPresent: (info) => {
      console.log('[Superwall] Presented paywall from gate:', info.name);
      markPostSignupPaywallSeen();
    },
    onDismiss: (info, result) => {
      console.log('[Superwall] Dismissed paywall from gate:', info.name, result.type);
      gateInFlight = false;

      if (result.type === 'purchased' || result.type === 'restored') {
        finishGate();
        return;
      }

      setGateStatus('blocked');
    },
    onSkip: (reason) => {
      console.log('[Superwall] Skipped paywall from gate:', reason.type);
      gateInFlight = false;
      setGateStatus('blocked');
    },
    onError: (error) => {
      console.error('[Superwall] Gate placement error:', error);
      gateInFlight = false;
      setGateStatus('error');
    },
  });

  useEffect(() => {
    if (gateUserId !== user?.id) {
      gateUserId = user?.id ?? null;
      gateInFlight = false;
      hasNavigatedRef.current = false;
      postSignupAttemptedRef.current = false;
      postSignupMarkedRef.current = false;
      setEntitlementTimeoutReached(false);
      setGateStatus('checking');
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated) {
      if (configTimeoutRef.current) {
        clearTimeout(configTimeoutRef.current);
        configTimeoutRef.current = null;
      }
      return;
    }

    if (isConfigured || isLoading || configurationError) {
      if (configTimeoutRef.current) {
        clearTimeout(configTimeoutRef.current);
        configTimeoutRef.current = null;
      }
      return;
    }

    if (!configTimeoutRef.current) {
      configTimeoutRef.current = setTimeout(() => {
        if (!isConfigured && !isLoading && !configurationError) {
          setGateStatus('error');
        }
      }, 2000);
    }

    return () => {
      if (configTimeoutRef.current) {
        clearTimeout(configTimeoutRef.current);
        configTimeoutRef.current = null;
      }
    };
  }, [
    configurationError,
    isAuthResolved,
    isAuthenticated,
    isConfigured,
    isLoading,
  ]);

  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated || !isConfigured) {
      return;
    }

    if (!superwallUser?.appUserId || superwallUser.appUserId !== user?.id) {
      return;
    }

    if (subscriptionStatus !== 'UNKNOWN') {
      setEntitlementTimeoutReached(false);
      return;
    }

    let cancelled = false;
    refresh().catch(() => undefined);

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setEntitlementTimeoutReached(true);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    isAuthResolved,
    isAuthenticated,
    isConfigured,
    refresh,
    subscriptionStatus,
    superwallUser?.appUserId,
    user?.id,
  ]);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (configurationError) {
      console.error('[Superwall] Configuration error in gate:', configurationError);
      setGateStatus('error');
      return;
    }

    if (!isConfigured) {
      return;
    }

    if (!superwallUser?.appUserId || superwallUser.appUserId !== user?.id) {
      return;
    }

    if (paywallIsPresenting || placementState.status === 'presented') {
      return;
    }

    if (isEntitled) {
      finishGate();
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }

    if (needsOnboarding || profile?.onboarding_completed === false) {
      router.replace('/onboarding/welcome');
      return;
    }

    if (gateInFlight) {
      return;
    }

    if (subscriptionStatus === 'UNKNOWN' && !entitlementTimeoutReached) {
      return;
    }

    if (hasShownPostSignupPaywall || postSignupAttemptedRef.current) {
      if (gateStatus !== 'blocked') {
        setGateStatus('blocked');
      }
      return;
    }

    gateInFlight = true;
    postSignupAttemptedRef.current = true;
    setGateStatus('checking');
    console.log(`[Superwall] Registering placement ${POST_SIGN_UP_PLACEMENT} from gate.`);
    void registerPlacement({
      placement: POST_SIGN_UP_PLACEMENT,
    });
  }, [
    isAuthResolved,
    isAuthenticated,
    needsOnboarding,
    profile,
    profile?.onboarding_completed,
    configurationError,
    isConfigured,
    isLoading,
    isEntitled,
    placementState.status,
    registerPlacement,
    router,
    superwallUser?.appUserId,
    user?.id,
    gateStatus,
    hasShownPostSignupPaywall,
    entitlementTimeoutReached,
    subscriptionStatus,
  ]);

  const handleShowPaywall = useCallback(() => {
    if (paywallIsPresenting || placementState.status === 'presented') {
      return;
    }
    if (gateInFlight) {
      return;
    }
    gateInFlight = true;
    postSignupAttemptedRef.current = true;
    setGateStatus('checking');
    console.log(`[Superwall] Manually registering placement ${POST_SIGN_UP_PLACEMENT} from gate.`);
    void registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
  }, [placementState.status, registerPlacement]);

  const renderStatus = () => {
    if (gateStatus === 'checking') {
      return (
        <>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Checking access...
          </Text>
        </>
      );
    }

    const title =
      gateStatus === 'blocked' ? 'Subscription required' : 'Unable to load paywall';
    const message =
      gateStatus === 'blocked'
        ? 'Subscribe to unlock Programs.'
        : 'We could not load subscription options. Please try again.';
    const buttonLabel = gateStatus === 'blocked' ? 'View plans' : 'Try again';

    return (
      <View style={[styles.card, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        <GlassButton style={styles.ctaButton} onPress={handleShowPaywall} hapticFeedback="impactMedium">
          <Text style={[styles.ctaText, { color: colors.white }]}>{buttonLabel}</Text>
        </GlassButton>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderStatus()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  text: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  title: {
    ...Typography.title3,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  ctaButton: {
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: 16,
  },
  ctaText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
  },
});
