import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
} from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';

type AnimatedDayCompletionProps = {
  isComplete: boolean;
  dateLabel: string;
  dateColor: string;
  celebrationKey?: string | number | null;
};

const CHECK_ANIMATION_DURATION = 1400;

export function AnimatedDayCompletion({
  isComplete,
  dateLabel,
  dateColor,
  celebrationKey = null,
}: AnimatedDayCompletionProps) {
  const { colors } = useTheme();
  const previousCompleteRef = useRef(isComplete);
  const previousCelebrationKeyRef = useRef<string | number | null>(null);
  const progress = useRef(new Animated.Value(isComplete ? 1 : 0)).current;
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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
    const wasComplete = previousCompleteRef.current;
    previousCompleteRef.current = isComplete;
    const shouldForceCelebration = celebrationKey !== null
      && previousCelebrationKeyRef.current !== celebrationKey;
    previousCelebrationKeyRef.current = celebrationKey;
    progress.stopAnimation();
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }

    if (!isComplete) {
      progress.setValue(0);
      setIsCelebrating(false);
      return;
    }

    if ((wasComplete && !shouldForceCelebration) || reduceMotion) {
      progress.setValue(1);
      setIsCelebrating(false);
      return;
    }

    progress.setValue(0);
    setIsCelebrating(true);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: CHECK_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    celebrationTimeoutRef.current = setTimeout(() => {
      celebrationTimeoutRef.current = null;
      setIsCelebrating(false);
    }, CHECK_ANIMATION_DURATION);

    return () => {
      animation.stop();
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
    };
  }, [celebrationKey, isComplete, progress, reduceMotion]);

  if (!isComplete) {
    return <Text style={[styles.dateLabel, { color: dateColor }]}>{dateLabel}</Text>;
  }

  const checkStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.18, 1],
      outputRange: [0, 0.45, 1],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 0.58, 0.78, 1],
          outputRange: [0.25, 1.48, 1.18, 1],
        }),
      },
      {
        rotate: progress.interpolate({
          inputRange: [0, 0.55, 0.8, 1],
          outputRange: ['-18deg', '7deg', '-3deg', '0deg'],
        }),
      },
    ],
  };
  const glowStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.22, 0.58, 0.82, 1],
      outputRange: [0, 0.25, 0.68, 0.36, 0],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 0.4, 0.72, 1],
          outputRange: [0.4, 1.05, 1.45, 1.3],
        }),
      },
    ],
  };

  return (
    <Animated.View style={styles.checkStage} testID="completed-day-check">
      {isCelebrating ? (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: colors.accentForegroundOnFill,
              shadowColor: colors.accentForegroundOnFill,
            },
            glowStyle,
          ]}
          testID="completed-day-check-glow"
        />
      ) : null}
      <Animated.View style={checkStyle} testID="completed-day-check-icon">
        <CheckIcon color={colors.accentForegroundOnFill} size={18} strokeWidth={3} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dateLabel: {
    fontSize: moderateScale(12),
    fontWeight: '800',
  },
  checkStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(22),
    height: scale(22),
  },
  glow: {
    position: 'absolute',
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: scale(3),
    elevation: 3,
  },
});
