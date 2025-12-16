import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { PlayIcon, PauseIcon, ForwardIcon, ArrowUturnLeftIcon, PlusIcon, MinusIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore, getRestTimerColor } from '@/src/store/workoutStore';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface RestTimerControlsProps {
  visible: boolean;
  onClose: () => void;
}

export function RestTimerControls({ visible, onClose }: RestTimerControlsProps) {
  const restTimer = useWorkoutStore(s => s.restTimer);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const pauseRestTimer = useWorkoutStore(s => s.pauseRestTimer);
  const resumeRestTimer = useWorkoutStore(s => s.resumeRestTimer);
  const skipRestTimer = useWorkoutStore(s => s.skipRestTimer);
  const startRestTimer = useWorkoutStore(s => s.startRestTimer);
  const adjustRestTimer = useWorkoutStore(s => s.adjustRestTimer);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);

  if (!visible) return null;

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!restTimer.isActive) {
      // If no time remaining, start fresh timer
      if (restTimer.remainingSeconds <= 0) {
        startRestTimer('normal');
      } else {
        resumeRestTimer();
      }
    } else {
      pauseRestTimer();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    skipRestTimer();
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startRestTimer(restTimer.setType);
  };

  const handleAdd10s = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (restTimer.isActive) {
      adjustRestTimer(10);
    } else {
      // When idle, adjust the default settings
      updateRestTimerSettings({ normalSeconds: restTimerSettings.normalSeconds + 10 });
    }
  };

  const handleSubtract10s = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (restTimer.isActive) {
      adjustRestTimer(-10);
    } else {
      // When idle, adjust the default settings (min 10 seconds)
      updateRestTimerSettings({ normalSeconds: Math.max(10, restTimerSettings.normalSeconds - 10) });
    }
  };

  // Display configured duration when idle (sync with header)
  const displaySeconds = restTimer.isActive
    ? restTimer.remainingSeconds
    : restTimerSettings.normalSeconds;

  const timerColor = restTimer.isActive
    ? getRestTimerColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : '#b9bec7';
  const timeString = formatRestTime(displaySeconds);
  const timerFontSize = displaySeconds >= 600 ? 22 : 28; // Shrink font for 10+ min
  const isRunning = restTimer.isActive;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <Animated.View
          entering={SlideInDown.duration(400)}
          exiting={SlideOutDown.duration(300)}
        >
          <Pressable
            style={styles.container}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: timerColor, fontSize: timerFontSize }]}>
                {timeString}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Main Controls */}
            <View style={styles.mainControls}>
              <Pressable
                onPress={handleSubtract10s}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <MinusIcon size={16} color={Colors.textPrimary} strokeWidth={2} />
              </Pressable>

              <GlassButton
                circular
                size={48}
                gradientColors={isRunning ? ['#ff9f0a', '#ff9f0a'] : undefined}
                onPress={handlePlayPause}
              >
                {isRunning ? (
                  <PauseIcon size={20} color="#fff" strokeWidth={2} />
                ) : (
                  <PlayIcon size={20} color="#fff" strokeWidth={2} style={{ marginLeft: 2 }} />
                )}
              </GlassButton>

              <Pressable
                onPress={handleAdd10s}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <PlusIcon size={16} color={Colors.textPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ArrowUturnLeftIcon size={20} color={Colors.textSecondary} strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ForwardIcon size={20} color={Colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    width: 360,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  timeContainer: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 28,
    fontFamily: 'BankGothic',
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: Spacing.xs,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  secondaryButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#2c2c2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
  },
});
