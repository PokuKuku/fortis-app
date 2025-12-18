import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { WorkoutMiniBar } from '@/src/components/workout/WorkoutMiniBar';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { DragDropProvider } from '@/src/contexts/DragDropContext';

export default function RootLayout() {
  const loadStickyNotes = useWorkoutStore((s) => s.loadStickyNotes);
  const loadWeightUnits = useWorkoutStore((s) => s.loadWeightUnits);

  const [fontsLoaded] = useFonts({
    'BankGothic': require('../assets/fonts/BankGothicMediumBT.ttf'),
  });

  // Load persisted preferences on app start
  useEffect(() => {
    loadStickyNotes();
    loadWeightUnits();
  }, [loadStickyNotes, loadWeightUnits]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider>
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
          <Stack.Screen
            name="workouts/[id]"
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
          <Stack.Screen
            name="programs/[id]"
            options={{
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
        </Stack>
        <WorkoutMiniBar />
      </DragDropProvider>
    </GestureHandlerRootView>
  );
}
