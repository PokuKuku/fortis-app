import { useEffect } from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { InteractionManager, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { DragDropProvider } from '@/src/contexts/DragDropContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { InAppTourProvider } from '@/src/contexts/InAppTourContext';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { ThemeAuthSync } from '@/src/components/theme/ThemeAuthSync';
import { SuperwallProvider } from 'expo-superwall';
import { SuperwallAuthSync } from '@/src/components/superwall/SuperwallAuthSync';
import { SuperwallPurchaseRecovery } from '@/src/components/superwall/SuperwallPurchaseRecovery';
import { PostHogAuthSync } from '@/src/components/analytics/PostHogAuthSync';
import { PostHogRouteTracker } from '@/src/components/analytics/PostHogRouteTracker';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/src/config/posthog';
import { WorkoutRetentionCoordinator } from '@/src/components/retention/WorkoutRetentionCoordinator';
import { OnboardingProgramCoordinator } from '@/src/components/onboarding/OnboardingProgramCoordinator';

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
        captureTouches: true,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
    >
    <AuthProvider>
      <SuperwallAuthSync />
      <SuperwallPurchaseRecovery />
      <PostHogAuthSync />
      <PostHogRouteTracker />
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
                ...ONBOARDING_TRANSITION,
                animationTypeForReplace: 'push',
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
              animationDuration: 220,
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
              animationDuration: 220,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="programs/[id]"
            options={{
              animation: 'slide_from_right',
              animationDuration: 220,
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
    </PostHogProvider>
  );
}

export default function RootLayout() {
  const loadStickyNotes = useWorkoutStore((s) => s.loadStickyNotes);
  const loadWeightUnits = useWorkoutStore((s) => s.loadWeightUnits);
  const loadCompletedSessions = useWorkoutStore((s) => s.loadCompletedSessions);
  const loadBodyType = useWorkoutStore((s) => s.loadBodyType);
  const loadActiveSession = useWorkoutStore((s) => s.loadActiveSession);
  const loadRestTimerSettings = useWorkoutStore((s) => s.loadRestTimerSettings);
  const segments = useSegments();
  const isOnboarding = segments[0] === 'onboarding';
  const isAuth = segments[0] === 'auth';
  const isSplash = typeof segments[0] === 'undefined';
  const shouldForceTheme = isOnboarding || isAuth || isSplash;

  const [fontsLoaded] = useFonts({
    'BankGothicBT-Medium': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  // Load persisted preferences on app start
  useEffect(() => {
    if (shouldForceTheme) {
      return;
    }

    let isActive = true;
    let deferredTimer: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      deferredTimer = setTimeout(() => {
        if (!isActive) return;
        void Promise.allSettled([
          loadStickyNotes(),
          loadWeightUnits(),
          loadCompletedSessions(),
          loadBodyType(),
          loadActiveSession(),
          loadRestTimerSettings(),
        ]);
      }, 250);
    });

    return () => {
      isActive = false;
      if (deferredTimer) {
        clearTimeout(deferredTimer);
      }
      task.cancel();
    };
  }, [
    loadStickyNotes,
    loadWeightUnits,
    loadCompletedSessions,
    loadBodyType,
    loadActiveSession,
    loadRestTimerSettings,
    shouldForceTheme,
  ]);

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

  const superwallOptions = {
    // Enable this only for local iOS StoreKit testing in development.
    shouldBypassAppTransactionCheck,
    // Observe purchases that might complete outside of Superwall's paywall UI.
    shouldObservePurchases: true,
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
        {appContent}
      </SuperwallProvider>
    </GestureHandlerRootView>
  );
}
