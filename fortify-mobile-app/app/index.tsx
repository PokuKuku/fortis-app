import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { usePendingOnboardingAuthCompletion } from '@/src/utils/onboardingAuthCompletion';
type StartupRoute = '/onboarding/welcome' | '/onboarding' | '/paywall-gate' | '/(tabs)';
const ONBOARDING_DEMO_VIDEO = require('../assets/videos/FortisDemoFinal888.mov');

const resolveStartupRoute = ({
  isAuthenticated,
  needsOnboarding,
  hasProfile,
  hasPendingOnboardingCompletion,
}: {
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  hasProfile: boolean;
  hasPendingOnboardingCompletion: boolean;
}): StartupRoute => {
  if (!isAuthenticated) {
    return '/onboarding/welcome';
  }

  if (hasPendingOnboardingCompletion) {
    return '/paywall-gate';
  }

  if (!hasProfile || needsOnboarding) {
    return '/onboarding';
  }

  return '/(tabs)';
};

export default function SplashScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { colors, isLoading: isThemeLoading } = useTheme();
  const { isAuthResolved, isAuthenticated, needsOnboarding, profile, profileResolved } = useAuth();
  const {
    isPending: hasPendingOnboardingAuthCompletion,
    isResolved: pendingOnboardingAuthCompletionResolved,
  } = usePendingOnboardingAuthCompletion();
  const splashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const [onboardingWarmupReady, setOnboardingWarmupReady] = useState(false);

  useEffect(() => {
    splashTimeoutRef.current = setTimeout(() => {
      setMinDelayPassed(true);
    }, 600);

    return () => {
      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
        splashTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    let isActive = true;

    const warmOnboardingRoute = async () => {
      try {
        await Asset.fromModule(ONBOARDING_DEMO_VIDEO).downloadAsync();
      } finally {
        if (isActive) {
          setOnboardingWarmupReady(true);
        }
      }
    };

    void warmOnboardingRoute();

    return () => {
      isActive = false;
    };
  }, [router, rootNavigationState?.key]);

  useEffect(() => {
    const profileStateReady = !isAuthenticated || profileResolved;
    const isWaitingForOnboardingCompletion =
      isAuthenticated &&
      profileStateReady &&
      pendingOnboardingAuthCompletionResolved &&
      hasPendingOnboardingAuthCompletion &&
      (!profile || needsOnboarding);
    if (
      !minDelayPassed ||
      isThemeLoading ||
      !isAuthResolved ||
      !profileStateReady ||
      !pendingOnboardingAuthCompletionResolved ||
      isWaitingForOnboardingCompletion ||
      hasNavigatedRef.current
    ) {
      return;
    }

    const nextRoute = resolveStartupRoute({
      isAuthenticated,
      needsOnboarding,
      hasProfile: Boolean(profile),
      hasPendingOnboardingCompletion: hasPendingOnboardingAuthCompletion,
    });
    const requiresOnboardingWarmup = nextRoute === '/onboarding/welcome' || nextRoute === '/onboarding';
    if (requiresOnboardingWarmup && !onboardingWarmupReady) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(nextRoute);
  }, [
    minDelayPassed,
    isThemeLoading,
    isAuthResolved,
    isAuthenticated,
    needsOnboarding,
    profile,
    profileResolved,
    pendingOnboardingAuthCompletionResolved,
    hasPendingOnboardingAuthCompletion,
    onboardingWarmupReady,
    pathname,
    router,
  ]);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      {/* FORTIS Text */}
      <View style={styles.logoContainer}>
        {!isThemeLoading ? (
          <AnimatedFortifyLogo size="large" centered shineDurationMs={1300} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
