import { useEffect } from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { DragDropProvider } from '@/src/contexts/DragDropContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { InAppTourProvider } from '@/src/contexts/InAppTourContext';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { ThemeAuthSync } from '@/src/components/theme/ThemeAuthSync';
import { MixpanelAuthSync } from '@/src/components/analytics/MixpanelAuthSync';
import { MixpanelScreenTracker } from '@/src/components/analytics/MixpanelScreenTracker';
import { RetentionTracker } from '@/src/components/analytics/RetentionTracker';
import { RouteChangeHaptics } from '@/src/components/haptics/RouteChangeHaptics';
import { initMixpanel, isMixpanelConfigured } from '@/src/lib/mixpanel';
import { SuperwallProvider } from 'expo-superwall';
import { SuperwallAuthSync } from '@/src/components/superwall/SuperwallAuthSync';
import { SuperwallDebugEvents } from '@/src/components/superwall/SuperwallDebugEvents';

const PAGE_TRANSITION = {
  animation: 'fade_from_bottom' as const,
  animationDuration: 220,
};

const ONBOARDING_TRANSITION = {
  animation: 'slide_from_right' as const,
  animationDuration: 340,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Themed content wrapper - uses theme context for StatusBar and Stack styling
 */
function ThemedAppContent({
  mixpanelEnabled,
  disableThemeSync = false,
}: {
  mixpanelEnabled: boolean;
  disableThemeSync?: boolean;
}) {
  const { colors, isDark } = useTheme();

  return (
    <AuthProvider>
      <SuperwallAuthSync />
      <SuperwallDebugEvents />
      {!disableThemeSync && <ThemeAuthSync />}
      <InAppTourProvider>
        <DragDropProvider>
          {mixpanelEnabled && <MixpanelAuthSync />}
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              ...PAGE_TRANSITION,
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="(tabs)" />
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
              name="onboarding/other-apps"
              options={{
                ...ONBOARDING_TRANSITION,
              }}
            />
            <Stack.Screen
              name="onboarding/clarity"
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
              animationDuration: 300,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="workout/create"
            options={{
              animation: 'slide_from_bottom',
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
          <RouteChangeHaptics />
          {mixpanelEnabled && <MixpanelScreenTracker />}
          {mixpanelEnabled && <RetentionTracker />}
          <WorkoutMiniBar />
        </DragDropProvider>
      </InAppTourProvider>
    </AuthProvider>
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
  const isSplash = segments.length === 0;
  const shouldForceTheme = isOnboarding || isAuth || isSplash;

  const [fontsLoaded] = useFonts({
    'BankGothicBT-Medium': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  const mixpanelEnabled = isMixpanelConfigured();

  // Load persisted preferences on app start
  useEffect(() => {
    loadStickyNotes();
    loadWeightUnits();
    loadCompletedSessions();
    loadBodyType();
    loadActiveSession();
    loadRestTimerSettings();
  }, [
    loadStickyNotes,
    loadWeightUnits,
    loadCompletedSessions,
    loadBodyType,
    loadActiveSession,
    loadRestTimerSettings,
  ]);

  useEffect(() => {
    if (!mixpanelEnabled) {
      return;
    }

    void initMixpanel();
  }, [mixpanelEnabled]);

  if (!fontsLoaded) {
    return null;
  }

  const appContent = (
    <ThemeProvider
      forceTheme={
        shouldForceTheme
          ? { resolvedTheme: 'light', accentColor: 'green' }
          : undefined
      }
    >
      <ThemedAppContent
        mixpanelEnabled={mixpanelEnabled}
        disableThemeSync={shouldForceTheme}
      />
    </ThemeProvider>
  );

  const superwallOptions = __DEV__
    ? {
        // The Superwall app transaction check can block purchases in dev builds.
        shouldBypassAppTransactionCheck: true,
        // StoreKit 2 can be flaky in the simulator; prefer StoreKit 1 for local testing.
        storeKitVersion: 'STOREKIT1' as const,
        // Emit detailed SDK logs to help diagnose purchase issues locally.
        logging: {
          level: 'debug' as const,
          scopes: ['all' as const],
        },
        // Observe purchases that might complete outside of Superwall's paywall UI.
        shouldObservePurchases: true,
      }
    : undefined;

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
