import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing } from '@/constants/Sizes';

interface OnboardingProgressBarProps {
  step: number;
  totalSteps: number;
}

export function OnboardingProgressBar({ step, totalSteps }: OnboardingProgressBarProps) {
  const { colors } = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  const progress = Math.min(Math.max(step / totalSteps, 0), 1);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [fillAnim, progress]);

  const width = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.glassBorder }]} />
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: colors.accent, width },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginLeft: Spacing.md,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
