import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { PlayIcon, PauseIcon, ForwardIcon, ArrowUturnLeftIcon, PlusIcon, MinusIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore, getRestTimerColor } from '@/src/store/workoutStore';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { scale, moderateScale } from '@/src/utils/responsive';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';

interface RestTimerControlsProps {
  visible: boolean;
  onClose: () => void;
}

const CONTROL_PADDING = scale(Spacing.sm);
const GROOVE_HEIGHT = scale(32);
const GROOVE_WIDTH = scale(2);
const GROOVE_MARGIN = scale(Spacing.xs);
const MAIN_GAP = scale(Spacing.sm);
const SECONDARY_GAP = scale(Spacing.xs);
const ADJUST_BUTTON_SIZE = scale(40);
const PLAY_BUTTON_SIZE = scale(44);
const PLAY_RING_PADDING = scale(2);
const ICON_BUTTON_SIZE = scale(40);
const TIME_BEZEL_PADDING_X = scale(Spacing.sm);
const TIME_BEZEL_PADDING_Y = scale(Spacing.xs);
const ADJUST_ICON_SIZE = scale(14);
const PLAY_ICON_SIZE = scale(20);
const ICON_SIZE = scale(18);
const PLAY_ICON_OFFSET = scale(2);

export function RestTimerControls({ visible, onClose }: RestTimerControlsProps) {
  const { colors, isDark } = useTheme();
  const restTimer = useWorkoutStore(s => s.restTimer);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const pauseRestTimer = useWorkoutStore(s => s.pauseRestTimer);
  const resumeRestTimer = useWorkoutStore(s => s.resumeRestTimer);
  const skipRestTimer = useWorkoutStore(s => s.skipRestTimer);
  const startRestTimer = useWorkoutStore(s => s.startRestTimer);
  const adjustRestTimer = useWorkoutStore(s => s.adjustRestTimer);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: colors.background,
      borderColor: isDark ? colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    grooveLight: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    grooveDark: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)',
    },
    playButtonRing: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
      borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
      borderRightColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.06)',
      borderBottomColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.08)',
    },
    iconButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    iconButtonPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    // Accent-based gradient and shadow for play button
    playButtonGradient: colors.accentGradient as unknown as string[],
    playButtonShadow: { shadowColor: colors.accent },
  };

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
    : colors.textSecondary;
  const timeString = formatRestTime(displaySeconds);
  const timerFontSize = moderateScale(displaySeconds >= 600 ? 16 : 18);
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
            style={[styles.container, themedStyles.container]}
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
              <View style={[styles.grooveLight, themedStyles.grooveLight]} />
              <View style={[styles.grooveDark, themedStyles.grooveDark]} />
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
                <MinusIcon size={ADJUST_ICON_SIZE} color={colors.textPrimary} strokeWidth={2.5} />
              </Pressable>

              {/* Play/Pause - Hero Button with Metallic Ring */}
              <View style={styles.playButtonContainer}>
                <View style={[styles.playButtonRing, themedStyles.playButtonRing]}>
                  <Pressable
                    onPress={handlePlayPause}
                    style={({ pressed }) => [
                      styles.playButton,
                      !isRunning && themedStyles.playButtonShadow,
                      pressed && styles.playButtonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={isRunning ? ['#ff9f0a', '#e88d00'] : themedStyles.playButtonGradient}
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
                      <PauseIcon size={PLAY_ICON_SIZE} color="#fff" strokeWidth={2.5} />
                    ) : (
                      <PlayIcon size={PLAY_ICON_SIZE} color="#fff" strokeWidth={2.5} style={{ marginLeft: PLAY_ICON_OFFSET }} />
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
                <PlusIcon size={ADJUST_ICON_SIZE} color={colors.textPrimary} strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Groove Divider */}
            <View style={styles.grooveDivider}>
              <View style={[styles.grooveLight, themedStyles.grooveLight]} />
              <View style={[styles.grooveDark, themedStyles.grooveDark]} />
            </View>

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              {/* Reset Button */}
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.iconButton,
                  themedStyles.iconButton,
                  pressed && themedStyles.iconButtonPressed,
                ]}
              >
                <ArrowUturnLeftIcon size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>

              {/* Skip Button */}
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => [
                  styles.iconButton,
                  themedStyles.iconButton,
                  pressed && themedStyles.iconButtonPressed,
                ]}
              >
                <ForwardIcon size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2} />
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
    paddingBottom: scale(24),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: CONTROL_PADDING,
    paddingVertical: CONTROL_PADDING,
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
    paddingHorizontal: TIME_BEZEL_PADDING_X,
    paddingVertical: TIME_BEZEL_PADDING_Y,
  },
  timeText: {
    fontSize: 18,
    fontFamily: 'BankGothicBT-Medium',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },

  // Groove Dividers
  grooveDivider: {
    width: GROOVE_WIDTH,
    height: GROOVE_HEIGHT,
    marginHorizontal: GROOVE_MARGIN,
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
    gap: MAIN_GAP,
  },

  // +/- Buttons
  adjustButton: {
    width: ADJUST_BUTTON_SIZE,
    height: ADJUST_BUTTON_SIZE,
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
    padding: PLAY_RING_PADDING,
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
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Glow effect - shadowColor is now dynamic via themedStyles
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
    gap: SECONDARY_GAP,
  },

  // Icon Buttons - Industrial Treatment
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
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
