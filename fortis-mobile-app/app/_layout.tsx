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
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { ThemeAuthSync } from '@/src/components/theme/ThemeAuthSync';
import { MixpanelAuthSync } from '@/src/components/analytics/MixpanelAuthSync';
import { MixpanelScreenTracker } from '@/src/components/analytics/MixpanelScreenTracker';
import { RetentionTracker } from '@/src/components/analytics/RetentionTracker';
import { RouteChangeHaptics } from '@/src/components/haptics/RouteChangeHaptics';
import { initMixpanel, isMixpanelConfigured } from '@/src/lib/mixpanel';

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
function ThemedAppContent({ mixpanelEnabled }: { mixpanelEnabled: boolean }) {
  const { colors, isDark } = useTheme();

  return (
    <AuthProvider>
      <ThemeAuthSync />
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
          <Stack.Screen name="boot" options={{ animation: 'none' }} />
          <Stack.Screen name="(tabs)" />
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
              animationDuration: 500,
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
      forceTheme={isOnboarding ? { resolvedTheme: 'light', accentColor: 'green' } : undefined}
    >
      <ThemedAppContent mixpanelEnabled={mixpanelEnabled} />
    </ThemeProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {appContent}
    </GestureHandlerRootView>
  );
}
