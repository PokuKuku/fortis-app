import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { PlayIcon, PauseIcon, ForwardIcon, ArrowUturnLeftIcon, PlusIcon, MinusIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore, getRestTimerColor } from '@/src/store/workoutStore';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';

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
    : Colors.textSecondary;
  const timeString = formatRestTime(displaySeconds);
  const timerFontSize = displaySeconds >= 600 ? 16 : 18;
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
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
        >
          <Pressable
            style={styles.container}
            onPress={(e) => e.stopPropagation()}
          >
            <StainlessSteelPattern />

            {/* Time Display - Instrument Readout */}
            <View style={styles.timeContainer}>
              <View style={styles.timeBezel}>
                <Text style={[styles.timeText, { color: timerColor, fontSize: timerFontSize }]}>
                  {timeString}
                </Text>
              </View>
            </View>

            {/* Groove Divider */}
            <View style={styles.grooveDivider}>
              <View style={styles.grooveLight} />
              <View style={styles.grooveDark} />
            </View>

            {/* Main Controls */}
            <View style={styles.mainControls}>
              {/* Minus Button - Machined Metal */}
              <Pressable
                onPress={handleSubtract10s}
                style={({ pressed }) => [
                  styles.adjustButton,
                  pressed && styles.adjustButtonPressed,
                ]}
              >
                <MinusIcon size={14} color={Colors.textPrimary} strokeWidth={2.5} />
              </Pressable>

              {/* Play/Pause - Hero Button with Metallic Ring */}
              <View style={styles.playButtonContainer}>
                <View style={styles.playButtonRing}>
                  <Pressable
                    onPress={handlePlayPause}
                    style={({ pressed }) => [
                      styles.playButton,
                      pressed && styles.playButtonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={isRunning ? ['#ff9f0a', '#e88d00'] : ['#4ade80', '#22c55e']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {/* Metallic overlay */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.2)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {isRunning ? (
                      <PauseIcon size={20} color="#fff" strokeWidth={2.5} />
                    ) : (
                      <PlayIcon size={20} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Plus Button - Machined Metal */}
              <Pressable
                onPress={handleAdd10s}
                style={({ pressed }) => [
                  styles.adjustButton,
                  pressed && styles.adjustButtonPressed,
                ]}
              >
                <PlusIcon size={14} color={Colors.textPrimary} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Groove Divider */}
            <View style={styles.grooveDivider}>
              <View style={styles.grooveLight} />
              <View style={styles.grooveDark} />
            </View>

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              {/* Reset Button */}
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <ArrowUturnLeftIcon size={18} color={Colors.textSecondary} strokeWidth={2} />
              </Pressable>

              {/* Skip Button */}
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <ForwardIcon size={18} color={Colors.textSecondary} strokeWidth={2} />
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
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    maxWidth: '90%',
    overflow: 'hidden',
    // Industrial shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },

  // Time Display - Instrument Readout
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBezel: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  timeText: {
    fontSize: 18,
    fontFamily: 'BankGothicBT-Medium',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  // Groove Dividers
  grooveDivider: {
    width: 2,
    height: 32,
    marginHorizontal: Spacing.xs,
    borderRadius: 1,
    overflow: 'hidden',
  },
  grooveLight: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    left: 0,
  },
  grooveDark: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    right: 0,
  },

  // Main Controls
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // +/- Buttons
  adjustButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonPressed: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },

  // Play/Pause Hero Button
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonRing: {
    padding: 2,
    borderRadius: BorderRadius.full,
    // Metallic ring effect
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Glow effect
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  // Secondary Controls
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // Icon Buttons - Industrial Treatment
  iconButton: {
    width: 40,
    height: 40,
    // Asymmetric chamfered corners
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.95 }],
  },
});
