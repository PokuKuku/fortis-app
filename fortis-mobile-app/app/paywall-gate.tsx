import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwall, useSuperwallEvents } from 'expo-superwall';
import { GlassButton } from '@/components/GlassButton';
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
  const { user, profile, isAuthResolved, isAuthenticated, needsOnboarding } = useAuth();
  const hasNavigatedRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const { isLoaded: isEntitlementLoaded, isEntitled, refresh: refreshEntitlements } =
    useEntitlementStatus();
  const { isConfigured, isLoading, configurationError } = useSuperwall((state) => ({
    isConfigured: state.isConfigured,
    isLoading: state.isLoading,
    configurationError: state.configurationError,
  }));

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
      setIsLocked(true);
      void refreshEntitlements();
    },
    onSkip: (reason) => {
      console.log('[Superwall] Skipped paywall from gate:', reason.type);
      gateInFlight = false;
      setIsLocked(true);
    },
    onError: (error) => {
      console.error('[Superwall] Gate placement error:', error);
      gateInFlight = false;
      setIsLocked(true);
    },
  });

  useEffect(() => {
    if (gateUserId !== user?.id) {
      gateUserId = user?.id ?? null;
      gateInFlight = false;
      hasNavigatedRef.current = false;
      setIsLocked(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (configurationError) {
      console.error('[Superwall] Configuration error in gate:', configurationError);
      finishGate();
      return;
    }

    if (!isConfigured) {
      return;
    }

    if (paywallIsPresenting || placementState.status === 'presented') {
      return;
    }

    if (isEntitlementLoaded && isEntitled) {
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

    if (!profile || gateInFlight || isLocked || !isEntitlementLoaded) {
      return;
    }

    gateInFlight = true;
    console.log('[Superwall] Registering placement fortis_first from gate.');
    void registerPlacement({
      placement: 'fortis_first',
      feature: () => {
        finishGate();
      },
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
    isEntitlementLoaded,
    isEntitled,
    isLocked,
    placementState.status,
    registerPlacement,
    router,
    refreshEntitlements,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLocked ? (
        <>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Subscription required
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Please subscribe to continue.
          </Text>
          <GlassButton
            style={styles.button}
            onPress={() => {
              if (paywallIsPresenting || gateInFlight) {
                return;
              }
              setIsLocked(false);
              gateInFlight = true;
              console.log('[Superwall] Re-opening paywall from gate.');
              void registerPlacement({
                placement: 'fortis_first',
                feature: () => {
                  finishGate();
                },
              });
            }}
          >
            Subscribe
          </GlassButton>
        </>
      ) : (
        <>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Checking access...
          </Text>
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
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  text: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  title: {
    ...Typography.titleSmall,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.md,
    minWidth: 180,
  },
});
