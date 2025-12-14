import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { usePathname, useSegments, router } from 'expo-router';
import { ChevronUp, Pause, Play } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useElapsedTime, formatElapsedTime } from '@/src/hooks/useElapsedTime';
import Animated, { SlideInDown, FadeOut } from 'react-native-reanimated';
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

  // Check if on splash screen (not inside tabs group) or on active workout screen
  const isOnSplashScreen = segments.length === 0 || (segments[0] !== '(tabs)' && pathname === '/');
  const isOnWorkoutScreen = pathname === '/workout/active';

  // Hide if no workout active, on splash screen, or already on workout screen
  if (!isWorkoutActive || isOnSplashScreen || isOnWorkoutScreen) {
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

  // Position above tab bar with spacing (56 height + 12 bottom margin + 20 gap)
  const bottomOffset = 56 + 12 + 20; // tab bar + margin + larger gap

  return (
    <Animated.View
      entering={SlideInDown.duration(250)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.container,
        { bottom: bottomOffset },
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
    left: '5%',
    width: '70%',
    maxWidth: 300,
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
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 12,
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
