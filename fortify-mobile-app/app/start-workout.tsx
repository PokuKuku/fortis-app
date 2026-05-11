import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useStartPresetStore } from '@/src/store/startPresetStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { startWorkoutFromStartPreset } from '@/src/services/startWorkoutFromPreset';

let widgetStartInFlight = false;
let lastWidgetStartAt = 0;
const WIDGET_START_DEBOUNCE_MS = 1800;

export default function StartWorkoutDeepLinkScreen() {
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;

    const start = async () => {
      router.replace('/(tabs)');

      await useWorkoutStore.getState().loadActiveSession();

      const now = Date.now();
      const isDuplicateTap = widgetStartInFlight || now - lastWidgetStartAt < WIDGET_START_DEBOUNCE_MS;
      if (useWorkoutStore.getState().isWorkoutActive) {
        InteractionManager.runAfterInteractions(() => {
          router.push('/workout/active');
        });
        return;
      }

      if (isDuplicateTap) {
        return;
      }

      widgetStartInFlight = true;
      lastWidgetStartAt = now;

      try {
        await useStartPresetStore.getState().loadPreset();
        const result = await startWorkoutFromStartPreset(useStartPresetStore.getState().preset);

        if (result === 'started') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          InteractionManager.runAfterInteractions(() => {
            if (useWorkoutStore.getState().isWorkoutActive) {
              router.push('/workout/active');
            }
            widgetStartInFlight = false;
          });
          return;
        }
      } finally {
        setTimeout(() => {
          widgetStartInFlight = false;
        }, WIDGET_START_DEBOUNCE_MS);
      }
    };

    void start();
  }, []);

  return null;
}
