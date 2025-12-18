import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import { usePathname, useSegments, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronUp, Pause, Play } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useElapsedTime, formatElapsedTime } from '@/src/hooks/useElapsedTime';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export const MINI_BAR_HEIGHT = 60;

/**
 * Get the current exercise (first with incomplete sets, or last exercise)
 */
function getCurrentExerciseName(session: ReturnType<typeof useWorkoutStore>['activeSession']): string {
  if (!session?.exercises?.length) return 'No exercises';

  const currentExercise = session.exercises.find(ex =>
    ex.sets.some(set => !set.isCompleted)
  ) || session.exercises[session.exercises.length - 1];

  return currentExercise?.exerciseName || 'Unknown exercise';
}

export function WorkoutMiniBar() {
  const pathname = usePathname();
  const segments = useSegments();
  const { activeSession, isWorkoutActive, isWorkoutTimerPaused, toggleWorkoutTimer } = useWorkoutStore();
  const elapsedSeconds = useElapsedTime();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Check if on splash screen (not inside tabs group) or on active workout screen
  const isOnSplashScreen = segments.length === 0 || (segments[0] !== '(tabs)' && pathname === '/');
  const isOnWorkoutScreen = pathname === '/workout/active';

  // Check if on main programs page (tabs home)
  const isOnMainProgramsPage = segments[0] === '(tabs)' && (pathname === '/' || segments[1] === 'index');

  // Check if on a page with tab bar (inside tabs group)
  const hasTabBar = segments[0] === '(tabs)';

  // Calculate bar width and positions
  const barWidth = Math.min(screenWidth * 0.7, 300); // 70% width, max 300
  const homeLeftPosition = screenWidth * 0.05; // 5% from left on home
  const centeredLeftPosition = (screenWidth - barWidth) / 2; // Centered on other pages

  // Bottom offsets: match FAB positioning (88px from bottom on tab pages)
  const bottomWithTabBar = 56 + 12 + 20; // 88px - matches FAB exactly
  const bottomWithoutTabBar = Math.max(24, insets.bottom + 12); // safe area + gap

  // Use shared values for position and opacity
  const leftPosition = useSharedValue(hasTabBar ? homeLeftPosition : centeredLeftPosition);
  const bottomPosition = useSharedValue(hasTabBar ? bottomWithTabBar : bottomWithoutTabBar);
  const opacity = useSharedValue(0); // Start at 0 for fade-in on first appearance
  const hasShownBefore = useRef(false); // Track if we've shown before (for instant return from workout)

  // Update positions when route changes - but NOT while on workout screen
  useEffect(() => {
    // Skip position updates while on workout screen (position should stay frozen)
    if (isOnWorkoutScreen) return;

    leftPosition.value = withTiming(hasTabBar ? homeLeftPosition : centeredLeftPosition, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });
    bottomPosition.value = withTiming(hasTabBar ? bottomWithTabBar : bottomWithoutTabBar, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [hasTabBar, homeLeftPosition, centeredLeftPosition, bottomWithTabBar, bottomWithoutTabBar, isOnWorkoutScreen]);

  // Animate opacity: fade in ONLY on first appearance, instant for workout screen transitions
  useEffect(() => {
    if (isOnWorkoutScreen) {
      // Going to workout - fade out
      opacity.value = withTiming(0, { duration: 150 });
    } else if (!hasShownBefore.current) {
      // First appearance - fade in
      opacity.value = withTiming(1, { duration: 300 });
      hasShownBefore.current = true;
    } else {
      // Returning from workout - fade in
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isOnWorkoutScreen]);

  // Animated style reads all shared values
  const animatedContainerStyle = useAnimatedStyle(() => ({
    left: leftPosition.value,
    bottom: bottomPosition.value,
    opacity: opacity.value,
  }));

  // Unmount completely when no workout or on splash screen
  if (!isWorkoutActive || isOnSplashScreen) {
    return null;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/workout/active');
  };

  const handlePausePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWorkoutTimer();
  };

  const workoutName = activeSession?.name || 'Workout in progress';
  const currentExercise = getCurrentExerciseName(activeSession);
  const elapsed = formatElapsedTime(elapsedSeconds);

  return (
    <Animated.View
      exiting={FadeOut.duration(150)}
      pointerEvents={isOnWorkoutScreen ? 'none' : 'auto'}
      style={[
        styles.container,
        { width: barWidth },
        animatedContainerStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.bar,
          pressed && styles.barPressed,
        ]}
      >
        {/* Left section: workout info */}
        <View style={styles.infoSection}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workoutName}
          </Text>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {currentExercise}
          </Text>
        </View>

        {/* Right section: pause button, timer, and expand hint */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={handlePausePress}
            style={styles.pauseButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isWorkoutTimerPaused ? (
              <Play size={18} color={Colors.success} fill={Colors.success} />
            ) : (
              <Pause size={18} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.timerText, isWorkoutTimerPaused && styles.timerTextPaused]}>
            {elapsed}
          </Text>
          <ChevronUp size={20} color={Colors.textSecondary} strokeWidth={2} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '5%', // Initial left position for tab pages
    bottom: 88, // Match FAB position - animated style will adjust
    zIndex: 900,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: MINI_BAR_HEIGHT,
    backgroundColor: 'rgba(36, 36, 36, 0.9)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  barPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  infoSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    fontVariant: ['tabular-nums'],
  },
  timerTextPaused: {
    color: Colors.textSecondary,
  },
  pauseButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
