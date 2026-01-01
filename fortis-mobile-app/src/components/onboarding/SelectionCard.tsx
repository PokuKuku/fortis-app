/**
 * SelectionCard - Premium glass selection card with animations
 *
 * Used for onboarding preference selections (units, body type).
 * Features scale animation, green border on selection, and haptic feedback.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/Sizes';
import { responsiveValue } from '@/src/utils/responsive';
import { Typography } from '@/constants/Typography';

interface SelectionCardProps {
  /** Card title (e.g., "IMPERIAL", "MALE") */
  title: string;
  /** Subtitle or unit label (e.g., "lbs", "kg") */
  subtitle?: string;
  /** Icon component to render */
  icon?: React.ReactNode;
  /** Whether this card is selected */
  isSelected: boolean;
  /** Callback when card is pressed */
  onSelect: () => void;
  /** Optional test ID */
  testID?: string;
}

export function SelectionCard({
  title,
  subtitle,
  icon,
  isSelected,
  onSelect,
  testID,
}: SelectionCardProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  // Animate selection state
  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  // Theme-aware styles
  const themedStyles = {
    card: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.03)',
      borderColor: isSelected
        ? colors.accent
        : isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.08)',
    },
    title: {
      color: colors.textPrimary,
    },
    subtitle: {
      color: isSelected ? colors.accent : colors.textSecondary,
    },
    iconContainer: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
    },
  };

  // Fog overlay gradient colors
  const fogColors = isDark
    ? ['rgba(140, 140, 140, 0.08)', 'rgba(60, 60, 60, 0.03)', 'rgba(20, 20, 20, 0.05)']
    : ['rgba(255, 255, 255, 0.4)', 'rgba(240, 240, 240, 0.2)', 'rgba(220, 220, 220, 0.1)'];

  // Check icon animation interpolations
  const checkScale = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  const checkOpacity = checkAnim;

  const minCardHeight = responsiveValue(120, 160, 180);
  const iconContainerSize = responsiveValue(48, 56, 64);
  const cardPadding = responsiveValue(Spacing.lg, Spacing.xl, Spacing['2xl']);
  const titleSize = responsiveValue(16, 18, 20);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Pressable
        style={[
          styles.card,
          { minHeight: minCardHeight },
          themedStyles.card,
          isSelected && styles.cardSelected,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        testID={testID}
      >
        {/* Fog overlay for glass effect */}
        <LinearGradient
          colors={fogColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fogOverlay}
        />

        {/* Content */}
        <View style={[styles.content, { padding: cardPadding }]}>
          {/* Icon */}
          {icon && (
            <View
              style={[
                styles.iconContainer,
                themedStyles.iconContainer,
                { minWidth: iconContainerSize, minHeight: iconContainerSize },
              ]}
            >
              {icon}
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, themedStyles.title, { fontSize: titleSize }]}>
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle && (
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Selection checkmark */}
        <Animated.View
          style={[
            styles.checkContainer,
            {
              opacity: checkOpacity,
              transform: [{ scale: checkScale }],
            }
          ]}
        >
          <CheckCircleIcon
            size={24}
            color={colors.accent}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.lg,
  },
  cardSelected: {
    borderWidth: 2,
  },
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    minWidth: 56,
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkContainer: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
});

export default SelectionCard;
