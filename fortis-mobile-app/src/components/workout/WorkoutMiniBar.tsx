import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import { usePathname, useSegments, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useElapsedTime, formatElapsedTime } from '@/src/hooks/useElapsedTime';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CancelWorkoutModal } from '@/src/components/workout/modals/CancelWorkoutModal';

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
  const { colors, isDark } = useTheme();
  const {
    activeSession,
    isWorkoutActive,
    isWorkoutTimerPaused,
    toggleWorkoutTimer,
    cancelWorkout,
  } = useWorkoutStore();

  // Theme-aware styles
  const themedStyles = {
    bar: {
      backgroundColor: isDark ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    workoutName: { color: colors.textPrimary },
    exerciseName: { color: colors.textSecondary },
    timerTextPaused: { color: colors.textSecondary },
  };
  const elapsedSeconds = useElapsedTime();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [suppressMiniBar, setSuppressMiniBar] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const wasWorkoutActive = useRef(isWorkoutActive);
  const suppressTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if on splash screen (not inside tabs group) or on active workout screen
  const isOnSplashScreen = segments.length === 0 || (segments[0] !== '(tabs)' && pathname === '/');
  const isOnWorkoutScreen = pathname === '/workout/active';
  const isOnAIScreen = pathname === '/ai/chat';
  const isOnFullscreenRoute = isOnWorkoutScreen || isOnAIScreen;

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
  const wasOnWorkoutScreen = useRef(false); // Track if we were on workout screen (for fade-in on return)
  const mountTimer = useRef<NodeJS.Timeout | null>(null); // Timer for delayed mount fade-in

  // Update positions when route changes - but NOT while on fullscreen routes
  useEffect(() => {
    // Skip position updates while on fullscreen routes (position should stay frozen)
    if (isOnFullscreenRoute) return;

    leftPosition.value = withTiming(hasTabBar ? homeLeftPosition : centeredLeftPosition, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });
    bottomPosition.value = withTiming(hasTabBar ? bottomWithTabBar : bottomWithoutTabBar, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [hasTabBar, homeLeftPosition, centeredLeftPosition, bottomWithTabBar, bottomWithoutTabBar, isOnFullscreenRoute]);

  useEffect(() => {
    if (!isWorkoutActive || !activeSession) {
      wasWorkoutActive.current = false;
      setSuppressMiniBar(false);
      if (suppressTimer.current) {
        clearTimeout(suppressTimer.current);
        suppressTimer.current = null;
      }
      return;
    }

    if (!wasWorkoutActive.current && isWorkoutActive) {
      setSuppressMiniBar(true);
      if (suppressTimer.current) {
        clearTimeout(suppressTimer.current);
      }
      suppressTimer.current = setTimeout(() => {
        setSuppressMiniBar(false);
        suppressTimer.current = null;
      }, 600);
    }

    wasWorkoutActive.current = true;
  }, [isWorkoutActive, activeSession]);

  useEffect(() => () => {
    if (suppressTimer.current) {
      clearTimeout(suppressTimer.current);
      suppressTimer.current = null;
    }
  }, []);

  // Animate opacity: only fade in when RETURNING from fullscreen routes, not on initial mount
  // This prevents the flash when navigating TO fullscreen routes
  useEffect(() => {
    // Clear any pending mount timer
    if (mountTimer.current) {
      clearTimeout(mountTimer.current);
      mountTimer.current = null;
    }

    if (isOnFullscreenRoute) {
      // On fullscreen route - ensure hidden (no animation needed)
      opacity.value = 0;
      wasOnWorkoutScreen.current = true;
    } else if (wasOnWorkoutScreen.current) {
      // Just returned from fullscreen route - delay fade in until slide-down animation completes
      wasOnWorkoutScreen.current = false;
      mountTimer.current = setTimeout(() => {
        opacity.value = withTiming(1, { duration: 300 });
      }, 300); // Wait for navigation animation to complete
    } else if (!hasShownBefore.current) {
      // First mount, not on fullscreen route
      // Wait to ensure we're not mid-navigation to fullscreen route
      mountTimer.current = setTimeout(() => {
        opacity.value = withTiming(1, { duration: 300 });
      }, 350); // Slightly longer than nav animation (300ms)
      hasShownBefore.current = true;
    }

    return () => {
      if (mountTimer.current) {
        clearTimeout(mountTimer.current);
      }
    };
  }, [isOnFullscreenRoute]);

  // Animated style reads all shared values
  const animatedContainerStyle = useAnimatedStyle(() => ({
    left: leftPosition.value,
    bottom: bottomPosition.value,
    opacity: opacity.value,
  }));

  // Unmount completely when no workout or on splash screen
  if (!isWorkoutActive || !activeSession || isOnSplashScreen || suppressMiniBar) {
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

  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    cancelWorkout();
    setShowCancelModal(false);
  };

  const workoutName = activeSession?.name || 'Workout in progress';
  const currentExercise = getCurrentExerciseName(activeSession);
  const elapsed = formatElapsedTime(elapsedSeconds);

  return (
    <Animated.View
      exiting={FadeOut.duration(150)}
      pointerEvents={isOnFullscreenRoute ? 'none' : 'auto'}
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
          themedStyles.bar,
          pressed && styles.barPressed,
        ]}
      >
        {/* Left section: workout info */}
        <View style={styles.infoSection}>
          <Text style={[styles.workoutName, themedStyles.workoutName]} numberOfLines={1}>
            {workoutName}
          </Text>
          <Text style={[styles.exerciseName, themedStyles.exerciseName]} numberOfLines={1}>
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
              <Pause size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={[styles.timerText, isWorkoutTimerPaused && themedStyles.timerTextPaused]}>
            {elapsed}
          </Text>
          <TouchableOpacity
            onPress={handleCancelPress}
            style={styles.cancelButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={Colors.error} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </Pressable>

      <CancelWorkoutModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
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
  cancelButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
