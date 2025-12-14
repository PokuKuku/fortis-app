import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { useWorkoutStore } from '@/src/store/workoutStore';

export default function RootLayout() {
  const loadStickyNotes = useWorkoutStore((s) => s.loadStickyNotes);

  const [fontsLoaded] = useFonts({
    'BankGothic': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  // Load sticky notes on app start
  useEffect(() => {
    loadStickyNotes();
  }, [loadStickyNotes]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0a0a' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="workout/active"
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
            }}
          />
          <Stack.Screen
            name="exercise/[id]"
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
        </Stack>
        <WorkoutMiniBar />
    </GestureHandlerRootView>
  );
}
