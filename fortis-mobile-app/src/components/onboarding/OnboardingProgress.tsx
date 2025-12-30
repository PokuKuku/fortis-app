/**
 * OnboardingProgress - Premium line-based progress indicator
 *
 * Displays a 4-step progress line with animated fill.
 * Designed for the "Private Fitness Club Membership" aesthetic.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing } from '@/constants/Sizes';

interface OnboardingProgressProps {
  /** Current step (1-4) */
  currentStep: number;
  /** Total number of steps */
  totalSteps?: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps = 4
}: OnboardingProgressProps) {
  const { colors, isDark } = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  // Calculate fill percentage
  const fillPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: fillPercentage,
      duration: 500,
      useNativeDriver: false, // Can't use native driver for width
    }).start();
  }, [currentStep, fillPercentage]);

  const themedStyles = {
    track: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.08)',
    },
    stepDot: {
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
    },
    stepDotActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    stepDotCompleted: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    fill: {
      backgroundColor: colors.accent,
    },
    stepNumber: {
      color: colors.textTertiary,
    },
    stepNumberActive: {
      color: colors.textPrimary,
    },
  };

  // Animated fill width
  const animatedWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Step label */}
      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        <Text style={[styles.stepLabelCurrent, { color: colors.textPrimary }]}>
          {currentStep}
        </Text>
        {' / '}{totalSteps}
      </Text>

      {/* Progress track */}
      <View style={styles.trackContainer}>
        {/* Background track */}
        <View style={[styles.track, themedStyles.track]} />

        {/* Animated fill */}
        <Animated.View
          style={[
            styles.fill,
            themedStyles.fill,
            { width: animatedWidth }
          ]}
        />

        {/* Step dots positioned along the track */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;

            return (
              <View
                key={stepNumber}
                style={[
                  styles.stepDot,
                  themedStyles.stepDot,
                  isCompleted && themedStyles.stepDotCompleted,
                  isActive && themedStyles.stepDotActive,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  stepLabelCurrent: {
    fontWeight: '700',
    fontSize: 16,
  },
  trackContainer: {
    width: 120,
    height: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

export default OnboardingProgress;
