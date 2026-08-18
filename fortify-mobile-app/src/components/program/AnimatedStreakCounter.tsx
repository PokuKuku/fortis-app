import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextStyle,
  View,
} from 'react-native';
import Reanimated, {
  cancelAnimation,
  Easing as ReanimatedEasing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FireIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ACCENT_COLORS, getAccentRgba } from '@/src/utils/accentColors';
import { scale } from '@/src/utils/responsive';

type AnimatedStreakCounterProps = {
  value: number;
  isPaused: boolean;
  textStyle?: StyleProp<TextStyle>;
  celebrationKey?: string | number | null;
  animateFromZeroOnMount?: boolean;
};

const NUMBER_ANIMATION_DURATION = 900;
const FIRE_ANIMATION_DURATION = 1250;
const STARTUP_ROLL_TARGET_DURATION = 1400;
const STARTUP_ROLL_MIN_STEP_DURATION = 22;
const STARTUP_ROLL_MAX_STEP_DURATION = 240;
const STARTUP_ROLL_MAX_STEPS = 60;
const ReanimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

export function getStartupStreakRollTiming(value: number) {
  const normalizedValue = Math.max(0, Math.floor(value));
  const steps = Math.min(normalizedValue, STARTUP_ROLL_MAX_STEPS);
  if (steps === 0) {
    return { steps: 0, stepDuration: 0 };
  }

  return {
    steps,
    stepDuration: Math.max(
      STARTUP_ROLL_MIN_STEP_DURATION,
      Math.min(STARTUP_ROLL_MAX_STEP_DURATION, STARTUP_ROLL_TARGET_DURATION / steps),
    ),
  };
}

export function AnimatedStreakCounter({
  value,
  isPaused,
  textStyle,
  celebrationKey = null,
  animateFromZeroOnMount = false,
}: AnimatedStreakCounterProps) {
  const { colors, isDark } = useTheme();
  const previousValueRef = useRef(value);
  const displayedValueRef = useRef(
    animateFromZeroOnMount && value > 0 && !isPaused ? 0 : value
  );
  const previousCelebrationKeyRef = useRef<string | number | null>(null);
  const startupAnimationActiveRef = useRef(
    animateFromZeroOnMount && value > 0 && !isPaused
  );
  const hasHandledStartupAnimationRef = useRef(false);
  const numberProgress = useRef(new Animated.Value(1)).current;
  const fireProgress = useRef(new Animated.Value(1)).current;
  const startupCountValue = useSharedValue(0);
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startupCountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayedValue, setDisplayedValue] = useState(displayedValueRef.current);
  const [outgoingValue, setOutgoingValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const [isStartupCounting, setIsStartupCounting] = useState(
    animateFromZeroOnMount && value > 0 && !isPaused
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const startupAnimatedProps = useAnimatedProps(() => ({
    text: `${Math.max(0, Math.floor(startupCountValue.value))}`,
  } as any));

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
    if (reduceMotion && hasHandledStartupAnimationRef.current) {
      cancelAnimation(startupCountValue);
      startupCountValue.value = value;
      if (startupCountTimeoutRef.current) {
        clearTimeout(startupCountTimeoutRef.current);
        startupCountTimeoutRef.current = null;
      }
      startupAnimationActiveRef.current = false;
      displayedValueRef.current = value;
      numberProgress.setValue(1);
      setDisplayedValue(value);
      setIsStartupCounting(false);
      setIsRolling(false);
      return;
    }
    if (hasHandledStartupAnimationRef.current) return;
    hasHandledStartupAnimationRef.current = true;

    const shouldAnimate = animateFromZeroOnMount
      && value > 0
      && !isPaused
      && !reduceMotion;
    if (!shouldAnimate) {
      startupAnimationActiveRef.current = false;
      displayedValueRef.current = value;
      setDisplayedValue(value);
      setIsStartupCounting(false);
      return;
    }

    const { steps, stepDuration } = getStartupStreakRollTiming(value);
    const duration = steps * stepDuration;
    startupAnimationActiveRef.current = true;
    displayedValueRef.current = 0;
    setDisplayedValue(0);
    setIsStartupCounting(true);
    setIsRolling(false);
    fireProgress.setValue(1);
    startupCountValue.value = 0;
    startupCountValue.value = withTiming(value, {
      duration,
      easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
    });
    startupCountTimeoutRef.current = setTimeout(() => {
      startupCountTimeoutRef.current = null;
      startupAnimationActiveRef.current = false;
      displayedValueRef.current = value;
      setDisplayedValue(value);
      setIsStartupCounting(false);
    }, duration);

    return () => {
      cancelAnimation(startupCountValue);
      if (startupCountTimeoutRef.current) {
        clearTimeout(startupCountTimeoutRef.current);
        startupCountTimeoutRef.current = null;
      }
      startupAnimationActiveRef.current = false;
    };
  }, [
    animateFromZeroOnMount,
    fireProgress,
    isPaused,
    numberProgress,
    reduceMotion,
    startupCountValue,
    value,
  ]);

  useEffect(() => {
    const shouldForceCelebration = celebrationKey !== null
      && previousCelebrationKeyRef.current !== celebrationKey;
    previousCelebrationKeyRef.current = celebrationKey;
    const previousValue = shouldForceCelebration
      ? Math.max(0, value - 1)
      : previousValueRef.current;
    previousValueRef.current = value;

    if (startupAnimationActiveRef.current) {
      return;
    }

    numberProgress.stopAnimation();
    fireProgress.stopAnimation();
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
      rollTimeoutRef.current = null;
    }

    if (isPaused || reduceMotion || value <= previousValue) {
      numberProgress.setValue(1);
      fireProgress.setValue(1);
      displayedValueRef.current = value;
      setDisplayedValue(value);
      setIsRolling(false);
      return;
    }

    setOutgoingValue(previousValue);
    displayedValueRef.current = value;
    setDisplayedValue(value);
    setIsRolling(true);
    numberProgress.setValue(0);
    fireProgress.setValue(0);

    const numberAnimation = Animated.timing(numberProgress, {
      toValue: 1,
      duration: NUMBER_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const fireAnimation = Animated.timing(fireProgress, {
      toValue: 1,
      duration: FIRE_ANIMATION_DURATION,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.parallel([numberAnimation, fireAnimation]).start();
    rollTimeoutRef.current = setTimeout(() => {
      rollTimeoutRef.current = null;
      setIsRolling(false);
    }, FIRE_ANIMATION_DURATION);

    return () => {
      numberAnimation.stop();
      fireAnimation.stop();
      if (rollTimeoutRef.current) {
        clearTimeout(rollTimeoutRef.current);
        rollTimeoutRef.current = null;
      }
    };
  }, [celebrationKey, fireProgress, isPaused, numberProgress, reduceMotion, value]);

  const outgoingStyle = {
    opacity: numberProgress.interpolate({
      inputRange: [0, 0.58, 1],
      outputRange: [1, 0.18, 0],
    }),
    transform: [
      {
        translateY: numberProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -scale(13)],
        }),
      },
      {
        scale: numberProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.9],
        }),
      },
    ],
  };
  const incomingStyle = {
    opacity: numberProgress.interpolate({
      inputRange: [0, 0.32, 1],
      outputRange: [0, 0.35, 1],
    }),
    transform: [
      {
        translateY: numberProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [scale(13), 0],
        }),
      },
      {
        scale: numberProgress.interpolate({
          inputRange: [0, 0.68, 0.84, 1],
          outputRange: [0.9, 1.13, 1.08, 1],
        }),
      },
    ],
  };
  const flameStyle = {
    transform: [
      {
        translateY: fireProgress.interpolate({
          inputRange: [0, 0.2, 0.4, 0.62, 0.82, 1],
          outputRange: [0, -scale(3), scale(1), -scale(2), 0, 0],
        }),
      },
      {
        rotate: fireProgress.interpolate({
          inputRange: [0, 0.2, 0.4, 0.62, 0.82, 1],
          outputRange: ['0deg', '-7deg', '6deg', '-4deg', '2deg', '0deg'],
        }),
      },
      {
        scale: fireProgress.interpolate({
          inputRange: [0, 0.22, 0.46, 0.7, 0.84, 1],
          outputRange: [1, 1.58, 1.35, 1.5, 1.22, 1],
        }),
      },
    ],
  };
  const glowStyle = {
    opacity: fireProgress.interpolate({
      inputRange: [0, 0.18, 0.5, 0.78, 1],
      outputRange: [0.16, 0.9, 0.4, 0.68, 0.12],
    }),
    transform: [
      {
        scale: fireProgress.interpolate({
          inputRange: [0, 0.22, 0.58, 0.8, 1],
          outputRange: [0.65, 1.85, 1.38, 1.6, 0.72],
        }),
      },
    ],
  };
  const flameColor = isPaused
    ? colors.textTertiary
    : isDark
      ? ACCENT_COLORS.red.light
      : ACCENT_COLORS.red.base;
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.numberViewport}>
        {isStartupCounting ? (
          <>
            <Animated.Text
              accessible={false}
              style={[textStyle, styles.startupSizingNumber]}
            >
              {value}
            </Animated.Text>
            <ReanimatedTextInput
              accessible={false}
              animatedProps={startupAnimatedProps}
              caretHidden
              contextMenuHidden
              defaultValue="0"
              editable={false}
              style={[
                textStyle,
                styles.startupCountNumber,
                { color: colors.textPrimary },
              ]}
              testID="streak-number-current"
              underlineColorAndroid="transparent"
            />
          </>
        ) : (
          <>
            <Animated.Text
              accessible={false}
              style={[
                textStyle,
                { color: colors.textPrimary },
                isRolling ? incomingStyle : undefined,
              ]}
              testID="streak-number-current"
            >
              {displayedValue}
            </Animated.Text>
            {isRolling ? (
              <Animated.Text
                accessible={false}
                style={[
                  textStyle,
                  styles.outgoingNumber,
                  {
                    color: colors.textPrimary,
                    textShadowColor: getAccentRgba('orange', isDark ? 0.62 : 0.38),
                  },
                  outgoingStyle,
                ]}
                testID="streak-number-outgoing"
              >
                {outgoingValue}
              </Animated.Text>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.fireStage}>
        {!isPaused ? (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: getAccentRgba('orange', isDark ? 0.52 : 0.32),
                shadowColor: ACCENT_COLORS.amber.base,
              },
              glowStyle,
            ]}
            testID="streak-fire-glow"
          />
        ) : null}
        <Animated.View style={isPaused ? undefined : flameStyle} testID="streak-fire-icon">
          <FireIcon color={flameColor} size={20} strokeWidth={2.4} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  numberViewport: {
    overflow: 'hidden',
    position: 'relative',
  },
  startupSizingNumber: {
    color: 'transparent',
  },
  startupCountNumber: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    bottom: 0,
    left: 0,
    margin: 0,
    padding: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  outgoingNumber: {
    position: 'absolute',
    right: 0,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scale(6),
  },
  fireStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(21),
    height: scale(25),
  },
  glow: {
    position: 'absolute',
    width: scale(15),
    height: scale(15),
    borderRadius: scale(8),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: scale(7),
    elevation: 5,
  },
});
