import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';

type StreakMilestone = {
  percentile: number;
  badge?: string;
  headline: string;
  message: string;
};

export const STREAK_PERCENTILE_MILESTONES: Record<number, StreakMilestone> = {
  1: {
    percentile: 50,
    headline: "YOU'RE ON FIRE!",
    message: 'Your streak is officially live.',
  },
  2: {
    percentile: 58,
    headline: 'TWO FOR TWO!',
    message: 'Back-to-back scheduled workouts. Your consistency is already heating up!',
  },
  3: {
    percentile: 65,
    headline: 'THREE STRONG!',
    message: 'Three scheduled workouts without a miss. You are building real momentum!',
  },
  4: {
    percentile: 71,
    headline: 'FOUR IN A ROW!',
    message: 'You are now more consistent than 7 in 10 lifters. Keep showing up!',
  },
  5: {
    percentile: 77,
    headline: 'FIVE FOR FIVE!',
    message: 'You are now more consistent than 3 in 4 lifters. Keep the heat going!',
  },
  6: {
    percentile: 82,
    headline: 'SIX AND SURGING!',
    message: 'Your routine is becoming uncommon. Six straight workouts and counting!',
  },
  7: {
    percentile: 86,
    headline: 'SEVEN STRAIGHT!',
    message: 'No misses. No excuses. You are among the most consistent lifters!',
  },
  8: {
    percentile: 89,
    headline: 'EIGHT WITHOUT A MISS!',
    message: 'You are knocking on the door of the top 10%. This streak has serious momentum!',
  },
  9: {
    percentile: 92,
    headline: 'TOP-TIER CONSISTENCY!',
    message: 'Nine scheduled workouts in a row. Only 8% of lifters stay this locked in!',
  },
  10: {
    percentile: 94,
    headline: 'ABSOLUTELY ELITE!',
    message: 'Ten scheduled workouts without a miss. Only 6% of lifters reach this level of consistency.',
  },
};

type StreakPercentileCelebrationModalProps = {
  visible: boolean;
  streak: number;
  onContinue: () => void;
};

export function shouldUseCompactStreakLayout(width: number, height: number): boolean {
  return height / Math.max(width, 1) < 1.95;
}

const FIRE_FRAMES = [
  require('../../../assets/animations/streak-fire/frames/frame-01.png'),
  require('../../../assets/animations/streak-fire/frames/frame-02.png'),
  require('../../../assets/animations/streak-fire/frames/frame-03.png'),
  require('../../../assets/animations/streak-fire/frames/frame-04.png'),
  require('../../../assets/animations/streak-fire/frames/frame-05.png'),
  require('../../../assets/animations/streak-fire/frames/frame-06.png'),
  require('../../../assets/animations/streak-fire/frames/frame-07.png'),
  require('../../../assets/animations/streak-fire/frames/frame-08.png'),
  require('../../../assets/animations/streak-fire/frames/frame-09.png'),
  require('../../../assets/animations/streak-fire/frames/frame-10.png'),
  require('../../../assets/animations/streak-fire/frames/frame-11.png'),
  require('../../../assets/animations/streak-fire/frames/frame-12.png'),
  require('../../../assets/animations/streak-fire/frames/frame-13.png'),
  require('../../../assets/animations/streak-fire/frames/frame-14.png'),
  require('../../../assets/animations/streak-fire/frames/frame-15.png'),
  require('../../../assets/animations/streak-fire/frames/frame-16.png'),
];
const DAY_DIAL_ANIMATION_DURATION = 1250;

function LivingFlame({
  size,
  reduceMotion,
  active,
}: {
  size: number;
  reduceMotion: boolean;
  active: boolean;
}) {
  const [frameIndex, setFrameIndex] = useState(reduceMotion ? 5 : 0);

  useEffect(() => {
    if (reduceMotion || !active) {
      setFrameIndex(5);
      return;
    }

    const frameTimer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % FIRE_FRAMES.length);
    }, 110);

    return () => clearInterval(frameTimer);
  }, [active, reduceMotion]);

  return (
    <Image
      accessibilityLabel="Animated realistic workout streak flame"
      source={FIRE_FRAMES[frameIndex]}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}

function ConsistencyArc({
  progress,
  percentile,
  fillColor,
  trackColor,
  compact,
}: {
  progress: Animated.Value;
  percentile: number;
  fillColor: string;
  trackColor: string;
  compact: boolean;
}) {
  const arcWidth = scale(compact ? 230 : 270);
  const finalFillWidth = arcWidth * (24 + 202 * percentile / 100) / 250;
  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, finalFillWidth],
  });

  return (
    <View
      style={[styles.arcWrap, compact && styles.arcWrapCompact, { width: arcWidth }]}
      testID="streak-percentile-arc"
    >
      <Svg width="100%" height="100%" viewBox="0 0 250 96">
        <Path
          d="M24 82 Q125 4 226 82"
          fill="none"
          stroke={trackColor}
          strokeLinecap="butt"
          strokeWidth="9"
          strokeDasharray="16 10"
        />
      </Svg>
      <Animated.View style={[styles.arcFillClip, { width: fillWidth }]}>
        <Svg width={arcWidth} height="100%" viewBox="0 0 250 96">
          <Path
            d="M24 82 Q125 4 226 82"
            fill="none"
            stroke={fillColor}
            strokeLinecap="butt"
            strokeWidth="9"
            strokeDasharray="16 10"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function AnimatedStreakDayCount({
  value,
  visible,
  reduceMotion,
  compact,
  textColor,
  glowColor,
}: {
  value: number;
  visible: boolean;
  reduceMotion: boolean;
  compact: boolean;
  textColor: string;
  glowColor: string;
}) {
  const progress = useRef(new Animated.Value(1)).current;
  const previousValue = Math.max(0, value - 1);

  useEffect(() => {
    progress.stopAnimation();

    if (!visible || reduceMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DAY_DIAL_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [progress, reduceMotion, value, visible]);

  const outgoingStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.58, 1],
      outputRange: [1, 0.18, 0],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -scale(13)],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        }),
      },
    ],
  };
  const incomingStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.32, 1],
      outputRange: [0, 0.35, 1],
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [scale(13), 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 0.68, 0.84, 1],
          outputRange: [0.9, 1.13, 1.08, 1],
        }),
      },
    ],
  };
  const textStyles = [
    styles.streakValue,
    compact && styles.streakValueCompact,
    { color: textColor },
  ];

  return (
    <View
      accessible
      accessibilityLabel={`${value} day streak`}
      style={[
        styles.streakValueContainer,
        compact && styles.streakValueContainerCompact,
      ]}
    >
      <View style={styles.streakValueRow}>
        <View style={styles.streakNumberViewport}>
          <Animated.Text
            accessible={false}
            style={[textStyles, reduceMotion ? undefined : incomingStyle]}
            testID="streak-day-current"
          >
            {value}
          </Animated.Text>
          {!reduceMotion ? (
            <Animated.Text
              accessible={false}
              style={[
                textStyles,
                styles.streakNumberOutgoing,
                { textShadowColor: glowColor },
                outgoingStyle,
              ]}
              testID="streak-day-outgoing"
            >
              {previousValue}
            </Animated.Text>
          ) : null}
        </View>
        <Text accessible={false} style={textStyles}>
          {' '}{value === 1 ? 'DAY' : 'DAYS'}
        </Text>
      </View>
    </View>
  );
}

export function StreakPercentileCelebrationModal({
  visible,
  streak,
  onContinue,
}: StreakPercentileCelebrationModalProps) {
  const { colors, isDark } = useTheme();
  const { height, width } = useWindowDimensions();
  const milestone = STREAK_PERCENTILE_MILESTONES[streak] ?? STREAK_PERCENTILE_MILESTONES[10];
  const topLifterPercent = 100 - milestone.percentile;
  const fireEntrance = useRef(new Animated.Value(0)).current;
  const barProgress = useRef(new Animated.Value(0)).current;
  const [displayedTopPercent, setDisplayedTopPercent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const isCompact = shouldUseCompactStreakLayout(width, height);
  const flameSize = scale(isCompact ? 154 : 186);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    fireEntrance.stopAnimation();
    barProgress.stopAnimation();
    fireEntrance.setValue(reduceMotion ? 1 : 0);
    barProgress.setValue(reduceMotion ? 1 : 0);
    setDisplayedTopPercent(reduceMotion ? topLifterPercent : 0);

    if (reduceMotion) return;

    const countListener = barProgress.addListener(({ value }) => {
      setDisplayedTopPercent(Math.round(topLifterPercent * value));
    });
    const entranceAnimation = Animated.parallel([
      Animated.timing(fireEntrance, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.35)),
        useNativeDriver: true,
      }),
      Animated.timing(barProgress, {
        toValue: 1,
        delay: 280,
        duration: 1350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);
    entranceAnimation.start();

    return () => {
      entranceAnimation.stop();
      barProgress.removeListener(countListener);
    };
  }, [barProgress, fireEntrance, milestone.percentile, reduceMotion, topLifterPercent, visible]);

  const fireStyle = useMemo(() => ({
    opacity: fireEntrance,
    transform: [
      {
        translateY: fireEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [scale(22), 0],
        }),
      },
      {
        scale: fireEntrance.interpolate({ inputRange: [0, 0.72, 1], outputRange: [0.45, 1.08, 1] }),
      },
    ],
  }), [fireEntrance]);
  const copyStyle = {
    opacity: barProgress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.3, 1] }),
    transform: [
      { translateY: barProgress.interpolate({ inputRange: [0, 1], outputRange: [scale(10), 0] }) },
    ],
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    onContinue();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleContinue}
      testID="streak-percentile-modal"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.content, isCompact && styles.contentCompact]}>
            <View style={[styles.celebrationStack, isCompact && styles.celebrationStackCompact]}>
              <View style={[styles.flameStage, isCompact && styles.flameStageCompact]}>
                <Animated.View style={fireStyle} testID="streak-percentile-flame">
                  <LivingFlame size={flameSize} reduceMotion={reduceMotion} active={visible} />
                </Animated.View>
              </View>

              <AnimatedStreakDayCount
                value={streak}
                visible={visible}
                reduceMotion={reduceMotion}
                compact={isCompact}
                textColor={colors.textPrimary}
                glowColor={colors.accent}
              />

              <View style={[styles.percentileMeter, isCompact && styles.percentileMeterCompact]}>
                <ConsistencyArc
                  progress={barProgress}
                  percentile={milestone.percentile}
                  fillColor={colors.accent}
                  trackColor={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}
                  compact={isCompact}
                />
                <View
                  accessible
                  accessibilityLabel={`Top ${topLifterPercent}% of lifters`}
                  style={styles.percentileValueWrap}
                >
                  <Text
                    style={[
                      styles.percentileNumber,
                      isCompact && styles.percentileNumberCompact,
                      { color: colors.textPrimary },
                    ]}
                  >
                    <Text style={[styles.topPercentPrefix, isCompact && styles.topPercentPrefixCompact]}>
                      TOP{' '}
                    </Text>
                    {displayedTopPercent}%
                  </Text>
                  <Text
                    style={[
                      styles.percentileLabel,
                      isCompact && styles.percentileLabelCompact,
                      { color: colors.textSecondary },
                    ]}
                  >
                    OF LIFTERS
                  </Text>
                </View>
              </View>

              <Animated.View
                style={[styles.copyBlock, isCompact && styles.copyBlockCompact, copyStyle]}
              >
                <View style={[styles.badgeSlot, isCompact && styles.badgeSlotCompact]}>
                  {milestone.badge ? (
                    <Text style={[styles.badge, { color: colors.textPrimary }]}>{milestone.badge}</Text>
                  ) : null}
                </View>
                <View style={[styles.headlineSlot, isCompact && styles.headlineSlotCompact]}>
                  <Text
                    style={[
                      styles.headline,
                      isCompact && styles.headlineCompact,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {milestone.headline}
                  </Text>
                </View>
                <View style={[styles.messageSlot, isCompact && styles.messageSlotCompact]}>
                  <Text
                    style={[
                      styles.message,
                      isCompact && styles.messageCompact,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {milestone.message}
                  </Text>
                </View>
              </Animated.View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue from streak celebration"
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: colors.accent },
                isCompact && styles.continueButtonCompact,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text style={[styles.continueText, { color: colors.accentForegroundOnFill }]}>CONTINUE</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: scale(75),
    paddingBottom: Spacing.lg,
  },
  contentCompact: {
    paddingTop: scale(32),
  },
  celebrationStack: {
    width: '100%',
    alignItems: 'center',
    transform: [{ translateY: scale(60) }],
  },
  celebrationStackCompact: {
    transform: [{ translateY: scale(25) }],
  },
  flameStage: {
    width: scale(210),
    height: scale(190),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flameStageCompact: {
    height: scale(145),
  },
  streakValueContainer: {
    width: '100%',
    height: moderateScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(8),
    marginBottom: scale(14),
  },
  streakValueContainerCompact: {
    height: moderateScale(45),
    marginTop: scale(5),
    marginBottom: scale(9),
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumberViewport: {
    position: 'relative',
    overflow: 'hidden',
  },
  streakValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(45),
    letterSpacing: 1.4,
  },
  streakValueCompact: {
    fontSize: moderateScale(38),
  },
  streakNumberOutgoing: {
    position: 'absolute',
    right: 0,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scale(6),
  },
  percentileMeter: {
    width: '100%',
    maxWidth: scale(330),
    height: scale(132),
    alignItems: 'center',
    marginTop: scale(2),
  },
  percentileMeterCompact: {
    height: scale(110),
    marginTop: 0,
  },
  percentileValueWrap: {
    alignItems: 'center',
    marginTop: scale(-5),
  },
  percentileNumber: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(32),
    lineHeight: moderateScale(35),
  },
  percentileNumberCompact: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(31),
  },
  topPercentPrefix: {
    fontSize: moderateScale(20),
    letterSpacing: 0.8,
  },
  topPercentPrefixCompact: {
    fontSize: moderateScale(18),
  },
  percentileLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(13),
    letterSpacing: 1.1,
  },
  percentileLabelCompact: {
    fontSize: moderateScale(12),
  },
  arcWrap: {
    height: scale(86),
    overflow: 'hidden',
  },
  arcWrapCompact: {
    height: scale(72),
  },
  arcFillClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  copyBlock: {
    width: '100%',
    maxWidth: scale(340),
    height: scale(130),
    alignItems: 'center',
    marginTop: scale(26),
  },
  copyBlockCompact: {
    height: scale(112),
    marginTop: scale(16),
  },
  badgeSlot: {
    width: '100%',
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSlotCompact: {
    height: scale(20),
  },
  headlineSlot: {
    width: '100%',
    height: scale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineSlotCompact: {
    height: scale(32),
  },
  messageSlot: {
    width: '100%',
    height: scale(68),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: scale(8),
  },
  messageSlotCompact: {
    height: scale(60),
    paddingTop: scale(6),
  },
  badge: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(18),
    letterSpacing: 1.1,
  },
  headline: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(23),
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headlineCompact: {
    fontSize: moderateScale(20),
    letterSpacing: 0.6,
  },
  message: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    lineHeight: moderateScale(22),
    textAlign: 'center',
  },
  messageCompact: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  continueButton: {
    width: '100%',
    maxWidth: scale(350),
    minHeight: scale(56),
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: scale(38),
  },
  continueButtonCompact: {
    minHeight: scale(50),
    marginBottom: scale(24),
  },
  continueButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  continueText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(15),
    letterSpacing: 1.2,
  },
});
