import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRootNavigationState, useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { usePendingOnboardingAuthCompletion } from '@/src/utils/onboardingAuthCompletion';
import { resetStartupReveal } from '@/src/utils/startupReveal';
type StartupRoute = '/onboarding/welcome' | '/onboarding' | '/paywall-gate' | '/(tabs)';
const ONBOARDING_DEMO_VIDEO = require('../assets/videos/FortifyDemo.mov');
const SPLASH_LOGO_SHINE_DURATION_MS = 600;

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
  const rootNavigationState = useRootNavigationState();
  const { colors, isLoading: isThemeLoading } = useTheme();
  const { isAuthResolved, isAuthenticated, needsOnboarding, profile, profileResolved } = useAuth();
  const {
    isPending: hasPendingOnboardingAuthCompletion,
    isResolved: pendingOnboardingAuthCompletionResolved,
  } = usePendingOnboardingAuthCompletion();
  const hasNavigatedRef = useRef(false);
  const [logoShineComplete, setLogoShineComplete] = useState(false);

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    // Warm the onboarding media opportunistically. A large video should never
    // hold the startup route; the onboarding screen can finish loading it.
    void Asset.fromModule(ONBOARDING_DEMO_VIDEO).downloadAsync().catch(() => undefined);
  }, [rootNavigationState?.key]);

  useEffect(() => {
    const profileStateReady = !isAuthenticated || profileResolved;
    if (
      !logoShineComplete ||
      isThemeLoading ||
      !isAuthResolved ||
      !profileStateReady ||
      !pendingOnboardingAuthCompletionResolved ||
      hasNavigatedRef.current
    ) {
      return;
    }

    if (isAuthenticated && hasPendingOnboardingAuthCompletion) {
      hasNavigatedRef.current = true;
      if (profile?.onboarding_completed === true) {
        router.replace('/paywall-gate');
      } else {
        router.replace({ pathname: '/auth', params: { onboarding: 'complete' } });
      }
      return;
    }

    const nextRoute = resolveStartupRoute({
      isAuthenticated,
      needsOnboarding,
      hasProfile: Boolean(profile),
      hasPendingOnboardingCompletion: false,
    });
    hasNavigatedRef.current = true;
    if (nextRoute === '/(tabs)') {
      // Arm the landing veil only for the cold-start handoff into the app.
      // Later tab-layout mounts (including tour route changes) must not replay it.
      resetStartupReveal();
    }
    router.replace(nextRoute);
  }, [
    logoShineComplete,
    isThemeLoading,
    isAuthResolved,
    isAuthenticated,
    needsOnboarding,
    profile,
    profileResolved,
    pendingOnboardingAuthCompletionResolved,
    hasPendingOnboardingAuthCompletion,
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
          <AnimatedFortifyLogo
            size="large"
            centered
            shineDurationMs={SPLASH_LOGO_SHINE_DURATION_MS}
            loopShine={false}
            onShineComplete={() => setLogoShineComplete(true)}
          />
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
