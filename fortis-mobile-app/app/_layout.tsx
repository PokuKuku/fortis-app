import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { PostHogProvider } from 'posthog-react-native';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { DragDropProvider } from '@/src/contexts/DragDropContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { AIContainer } from '@/src/components/ai';
import { PostHogScreenTracker } from '@/src/components/analytics/PostHogScreenTracker';
import { PostHogAuthSync } from '@/src/components/analytics/PostHogAuthSync';
import { isPostHogConfigured, posthogApiKey, posthogHost } from '@/src/lib/posthog';

const PAGE_TRANSITION = {
  animation: 'fade_from_bottom' as const,
  animationDuration: 220,
};

/**
 * Themed content wrapper - uses theme context for StatusBar and Stack styling
 */
function ThemedAppContent({ posthogEnabled }: { posthogEnabled: boolean }) {
  const { colors, isDark } = useTheme();

  return (
    <AuthProvider>
      <DragDropProvider>
        {posthogEnabled && <PostHogAuthSync />}
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            ...PAGE_TRANSITION,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="auth/index"
            options={{
              ...PAGE_TRANSITION,
            }}
          />
          <Stack.Screen
            name="auth/email"
            options={{
              ...PAGE_TRANSITION,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="onboarding/index"
            options={{
              ...PAGE_TRANSITION,
            }}
          />
          <Stack.Screen
            name="onboarding/units"
            options={{
              animation: 'slide_from_right',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="onboarding/complete"
            options={{
              animation: 'slide_from_right',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="workout/active"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 500,
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="workout/create"
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ai/chat"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 500,
              gestureEnabled: true,
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
              gestureEnabled: true,
              gestureDirection: 'vertical',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              ...PAGE_TRANSITION,
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
        {posthogEnabled && <PostHogScreenTracker />}
        <WorkoutMiniBar />
        <AIContainer />
      </DragDropProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const loadStickyNotes = useWorkoutStore((s) => s.loadStickyNotes);
  const loadWeightUnits = useWorkoutStore((s) => s.loadWeightUnits);
  const loadCompletedSessions = useWorkoutStore((s) => s.loadCompletedSessions);
  const loadBodyType = useWorkoutStore((s) => s.loadBodyType);

  const [fontsLoaded] = useFonts({
    'BankGothicBT-Medium': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  // Load persisted preferences on app start
  useEffect(() => {
    loadStickyNotes();
    loadWeightUnits();
    loadCompletedSessions();
    loadBodyType();
  }, [loadStickyNotes, loadWeightUnits, loadCompletedSessions, loadBodyType]);

  if (!fontsLoaded) {
    return null;
  }

  const posthogEnabled = isPostHogConfigured();
  const appContent = (
    <ThemeProvider>
      <ThemedAppContent posthogEnabled={posthogEnabled} />
    </ThemeProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {posthogEnabled ? (
        <PostHogProvider
          apiKey={posthogApiKey}
          options={{
            host: posthogHost,
            captureApplicationLifecycleEvents: true,
          }}
        >
          {appContent}
        </PostHogProvider>
      ) : (
        appContent
      )}
    </GestureHandlerRootView>
  );
}
