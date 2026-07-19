import { useEffect, useRef } from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { DragDropProvider } from '@/src/contexts/DragDropContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { InAppTourProvider } from '@/src/contexts/InAppTourContext';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { ThemeAuthSync } from '@/src/components/theme/ThemeAuthSync';
import { SuperwallProvider, useSuperwall } from 'expo-superwall';
import type { PartialSuperwallOptions } from 'expo-superwall';
import { SuperwallAuthSync } from '@/src/components/superwall/SuperwallAuthSync';
import { SuperwallDebugEvents } from '@/src/components/superwall/SuperwallDebugEvents';
import { SuperwallPurchaseRecovery } from '@/src/components/superwall/SuperwallPurchaseRecovery';
import { SubscriptionAccessGuard } from '@/src/components/superwall/SubscriptionAccessGuard';
import { PostHogAuthSync } from '@/src/components/analytics/PostHogAuthSync';
import { PostHogRouteTracker } from '@/src/components/analytics/PostHogRouteTracker';
import { AppUpdatePromptCoordinator } from '@/src/components/app/AppUpdatePromptCoordinator';
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/src/config/posthog';
import { WorkoutRetentionCoordinator } from '@/src/components/retention/WorkoutRetentionCoordinator';
import { OnboardingProgramCoordinator } from '@/src/components/onboarding/OnboardingProgramCoordinator';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';

const PAGE_TRANSITION = {
  animation: 'fade' as const,
  animationDuration: 220,
};

const ONBOARDING_TRANSITION = {
  animation: 'slide_from_right' as const,
  animationDuration: 340,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function PostSignUpPaywallPreloader() {
  const { isConfigured, isLoading, preloadPaywalls } = useSuperwall((state) => ({
    isConfigured: state.isConfigured,
    isLoading: state.isLoading,
    preloadPaywalls: state.preloadPaywalls,
  }));
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    if (hasPreloadedRef.current || !isConfigured || isLoading) return;

    hasPreloadedRef.current = true;
    void preloadPaywalls([PAYWALL_PLACEMENTS.postSignUp]).catch(() => {
      // Preloading is an optimization; the paywall gate still handles presentation failures.
    });
  }, [isConfigured, isLoading, preloadPaywalls]);

  return null;
}

function RootErrorFallback() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        Something went wrong.
      </Text>
      <Text style={{ marginTop: 8, color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
        Please close and reopen Fortify.
      </Text>
    </View>
  );
}

/**
 * Themed content wrapper - uses theme context for StatusBar and Stack styling
 */
function ThemedAppContent({
  disableThemeSync = false,
}: {
  disableThemeSync?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const isEarlyRoute =
    typeof segments[0] === 'undefined' ||
    segments[0] === 'onboarding' ||
    segments[0] === 'auth';

  return (
    <PostHogProvider
      client={posthog}
      debug={__DEV__}
      autocapture={{
        captureScreens: false,
        // Touch autocapture adds avoidable instrumentation to every press in
        // simulator/dev builds. Production analytics behavior is unchanged.
        captureTouches: !__DEV__,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
    >
    <PostHogErrorBoundary fallback={RootErrorFallback}>
      <AuthProvider>
        <SuperwallAuthSync />
        <SuperwallDebugEvents />
        <SuperwallPurchaseRecovery />
        <SubscriptionAccessGuard />
        <PostHogAuthSync />
        <PostHogRouteTracker />
        <AppUpdatePromptCoordinator />
        {!disableThemeSync && <ThemeAuthSync />}
        <InAppTourProvider>
          <DragDropProvider>
            {!isEarlyRoute ? <WorkoutRetentionCoordinator /> : null}
            {!isEarlyRoute ? <OnboardingProgramCoordinator /> : null}
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                ...PAGE_TRANSITION,
              }}
            >
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen
              name="(tabs)"
              options={{
                // TabLayout owns the branded startup wipe so the native stack must
                // not add a competing fade underneath it.
                animation: 'none',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="paywall-gate"
              options={{
                ...PAGE_TRANSITION,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="auth/index"
              options={{
                ...ONBOARDING_TRANSITION,
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen
              name="auth/email"
              options={{
                ...ONBOARDING_TRANSITION,
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen
              name="auth/callback"
              options={{
                ...PAGE_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/welcome"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/index"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/greeting"
              options={{
                ...ONBOARDING_TRANSITION,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="onboarding/gender"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/birthdate"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/height"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/weight"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/source"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/fitness-background"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/experience"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/training-environment"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/other-apps"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/progress-blocker"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/six-month-preview"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/program-setup-intro"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/coach-personality"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/goal"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/muscle-focus"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/motivation"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/insights"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/thank-you"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/social-proof"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/rating"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/notifications"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/challenge"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/consistency"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/workout-schedule"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/session-duration"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/goal-pace"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/program-name"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/metrics-intro"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/complete"
              options={{
                ...ONBOARDING_TRANSITION,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="workout/active"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 400,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="workout/create"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 400,
                gestureEnabled: false,
                gestureDirection: 'vertical',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ai/chat"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 500,
                gestureEnabled: false, // Custom gesture handler in chat.tsx
                gestureDirection: 'vertical',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="exercise/[id]"
              options={{
                animation: 'slide_from_right',
                animationDuration: 220,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen
            name="exercises/index"
            options={{
              animation: 'slide_from_right',
              animationDuration: 140,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="insights/[id]"
            options={{
              animation: 'slide_from_right',
              animationDuration: 220,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="insights/share"
            options={{
              animation: 'slide_from_right',
              animationDuration: 220,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="workouts/[id]"
            options={{
              animation: 'slide_from_right',
              animationDuration: 140,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="programs/[id]"
            options={{
              animation: 'slide_from_right',
              animationDuration: 140,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="programs/create"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 400,
              gestureEnabled: false,
              gestureDirection: 'vertical',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              animation: 'slide_from_right',
              animationDuration: 140,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="settings/preferences"
            options={{
              animation: 'slide_from_right',
              animationDuration: 220,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="profile/share"
            options={{
              animation: 'slide_from_right',
              animationDuration: 220,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="goals"
            options={{
              ...PAGE_TRANSITION,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
            </Stack>
            {!isEarlyRoute ? <WorkoutMiniBar /> : null}
          </DragDropProvider>
        </InAppTourProvider>
      </AuthProvider>
    </PostHogErrorBoundary>
    </PostHogProvider>
  );
}

export default function RootLayout() {
  const segments = useSegments();
  const isOnboarding = segments[0] === 'onboarding';
  const isAuth = segments[0] === 'auth';
  const isSplash = typeof segments[0] === 'undefined';
  const shouldForceTheme = isOnboarding || isAuth || isSplash;

  const [fontsLoaded] = useFonts({
    'BankGothicBT-Medium': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const appContent = (
    <ThemeProvider
      forceTheme={
        shouldForceTheme
          ? { resolvedTheme: 'light', accentColor: 'midnight' }
          : undefined
      }
    >
      <ThemedAppContent
        disableThemeSync={shouldForceTheme}
      />
    </ThemeProvider>
  );

  const shouldBypassAppTransactionCheck =
    Platform.OS === 'ios' &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_BYPASS_APP_TRANSACTION_CHECK === 'true';

  const superwallOptions: PartialSuperwallOptions = {
    // Enable this only for local iOS StoreKit testing in development.
    shouldBypassAppTransactionCheck,
    // Observe purchases that might complete outside of Superwall's paywall UI.
    shouldObservePurchases: true,
    logging: {
      level: __DEV__ ? 'debug' : 'warn',
      scopes: [
        'configManager',
        'network',
        'productsManager',
        'storeKitManager',
        'placements',
        'paywallPresentation',
      ],
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SuperwallProvider
        apiKeys={{ ios: 'pk_xnIb2AL4geeYhrACppkqM' }}
        options={superwallOptions}
        onConfigurationError={(error) => {
          console.error('[Superwall] Configuration error:', error);
        }}
      >
        <PostSignUpPaywallPreloader />
        {appContent}
      </SuperwallProvider>
    </GestureHandlerRootView>
  );
}
