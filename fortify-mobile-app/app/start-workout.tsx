import { useEffect, useRef } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { useRootNavigationState, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useStartPresetStore } from '@/src/store/startPresetStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { startWorkoutFromStartPreset } from '@/src/services/startWorkoutFromPreset';

let widgetStartInFlight = false;
let lastWidgetStartAt = 0;
const WIDGET_START_DEBOUNCE_MS = 1800;

export default function StartWorkoutDeepLinkScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { colors } = useTheme();
  const { isAuthResolved, isAuthenticated, needsOnboarding, profileResolved } = useAuth();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    if (!rootNavigationState?.key || !isAuthResolved) return;
    if (isAuthenticated && !profileResolved) return;
    hasHandledRef.current = true;

    const start = async () => {
      if (!isAuthenticated) {
        router.replace('/onboarding/welcome');
        return;
      }

      if (needsOnboarding) {
        router.replace('/onboarding');
        return;
      }

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
        router.replace('/(tabs)');
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
              router.replace('/workout/active');
            }
            widgetStartInFlight = false;
          });
          return;
        }

        router.replace('/(tabs)');
      } finally {
        setTimeout(() => {
          widgetStartInFlight = false;
        }, WIDGET_START_DEBOUNCE_MS);
      }
    };

    void start();
  }, [isAuthResolved, isAuthenticated, needsOnboarding, profileResolved, rootNavigationState?.key, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <View style={styles.logoContainer}>
        <AnimatedFortifyLogo size="large" centered shineDurationMs={1300} />
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
