import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useSuperwallEvents, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useEntitlementStatus } from '@/src/hooks/useEntitlementStatus';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

let gateInFlight = false;
let gateUserId: string | null = null;
let paywallIsPresenting = false;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, profile, isAuthResolved, isAuthenticated, needsOnboarding, signOut } = useAuth();
  const hasNavigatedRef = useRef(false);
  const isSigningOutRef = useRef(false);
  const configTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entitlementCheck, setEntitlementCheck] = useState<
    'idle' | 'checking' | 'active' | 'inactive'
  >('idle');
  const { isEntitled } = useEntitlementStatus();
  const { user: superwallUser, getEntitlements, setSubscriptionStatus } = useUser();
  const { isConfigured, isLoading, configurationError } = useSuperwall((state) => ({
    isConfigured: state.isConfigured,
    isLoading: state.isLoading,
    configurationError: state.configurationError,
  }));

  const signOutToAuth = useCallback(
    async (reason: string) => {
      gateInFlight = false;
      paywallIsPresenting = false;

      if (isSigningOutRef.current) {
        return;
      }
      isSigningOutRef.current = true;

      console.warn('[PaywallGate] Blocking access and signing out:', reason);

      try {
        await signOut();
      } finally {
        // Ensure we land on auth even if signOut throws.
        router.replace('/auth');
        isSigningOutRef.current = false;
      }
    },
    [router, signOut],
  );

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
    router.replace('/(tabs)');
  };

  const { registerPlacement, state: placementState } = usePlacement({
    onPresent: (info) => {
      console.log('[Superwall] Presented paywall from gate:', info.name);
    },
    onDismiss: (info, result) => {
      console.log('[Superwall] Dismissed paywall from gate:', info.name, result.type);
      gateInFlight = false;

      if (result.type === 'purchased' || result.type === 'restored') {
        finishGate();
        return;
      }

      void signOutToAuth(`paywall dismissed (${result.type})`);
    },
    onSkip: (reason) => {
      console.log('[Superwall] Skipped paywall from gate:', reason.type);
      gateInFlight = false;
      void signOutToAuth(`paywall skipped (${reason.type})`);
    },
    onError: (error) => {
      console.error('[Superwall] Gate placement error:', error);
      gateInFlight = false;
      void signOutToAuth('paywall error');
    },
  });

  useEffect(() => {
    if (gateUserId !== user?.id) {
      gateUserId = user?.id ?? null;
      gateInFlight = false;
      hasNavigatedRef.current = false;
      setEntitlementCheck('idle');
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
          void signOutToAuth('superwall not configured');
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
    signOutToAuth,
  ]);

  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated || !isConfigured) {
      return;
    }

    if (!superwallUser?.appUserId || superwallUser.appUserId !== user?.id) {
      return;
    }

    if (isEntitled) {
      if (entitlementCheck !== 'active') {
        setEntitlementCheck('active');
      }
      return;
    }

    if (entitlementCheck !== 'idle') {
      return;
    }

    let cancelled = false;
    setEntitlementCheck('checking');

    getEntitlements()
      .then((info) => {
        if (cancelled) {
          return;
        }
        const hasActive = Array.isArray(info?.active) && info.active.length > 0;
        if (hasActive) {
          setSubscriptionStatus({ status: 'ACTIVE', entitlements: info.active }).catch(() => undefined);
        }
        setEntitlementCheck(hasActive ? 'active' : 'inactive');
      })
      .catch(() => {
        if (!cancelled) {
          setEntitlementCheck('inactive');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    entitlementCheck,
    getEntitlements,
    isAuthResolved,
    isAuthenticated,
    isConfigured,
    isEntitled,
    setSubscriptionStatus,
    superwallUser?.appUserId,
    user?.id,
  ]);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    if (isSigningOutRef.current) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (configurationError) {
      console.error('[Superwall] Configuration error in gate:', configurationError);
      void signOutToAuth('superwall configuration error');
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

    if (isEntitled || entitlementCheck === 'active') {
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

    if (gateInFlight || entitlementCheck === 'checking') {
      return;
    }

    gateInFlight = true;
    console.log('[Superwall] Registering placement fortis_first from gate.');
    void registerPlacement({
      placement: 'fortis_first',
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
    entitlementCheck,
    placementState.status,
    registerPlacement,
    router,
    signOutToAuth,
    superwallUser?.appUserId,
    user?.id,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Checking access...
      </Text>
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
});
