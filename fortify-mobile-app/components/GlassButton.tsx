/**
 * GlassButton.tsx
 *
 * Reusable glass-style button component with gradient overlay
 * and consistent styling for action buttons.
 *
 * Supports both dark and light themes with appropriate glass effects.
 */
import { Animated, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';

type GlassButtonHapticFeedback =
  | 'none'
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy';

interface GlassButtonProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  gradientColors?: string[];
  circular?: boolean;
  size?: number;
  disabled?: boolean;
  hapticFeedback?: GlassButtonHapticFeedback;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  shadow?: boolean;
  glow?: boolean;
}

export function GlassButton({
  children,
  onPress,
  onLongPress,
  style,
  gradientColors,
  circular = false,
  size,
  disabled = false,
  hapticFeedback = 'none',
  pointerEvents,
  shadow = true,
  glow = true,
}: GlassButtonProps) {
  const { colors } = useTheme();
  const pressProgress = useRef(new Animated.Value(0)).current;
  const flattenedStyle = StyleSheet.flatten(style);
  const resolvedBorderRadius = typeof flattenedStyle?.borderRadius === 'number'
    ? flattenedStyle.borderRadius
    : circular && size
      ? size / 2
      : styles.surface.borderRadius;

  // Use provided gradient colors or theme default
  const buttonGradient = gradientColors || (colors.buttonGradient as unknown as string[]);
  const fogOverlay = colors.buttonFog as unknown as string[];

  const buttonStyle = circular && size
    ? { width: size, height: size, borderRadius: size / 2 }
    : {};

  const bottomShadowStyle = { backgroundColor: colors.accentShadow };
  const animatedPressStyle = {
    transform: [
      {
        translateY: pressProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
      {
        scale: pressProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.985],
        }),
      },
    ],
  };

  const animatePress = (toValue: 0 | 1) => {
    if (disabled) {
      pressProgress.setValue(0);
      return;
    }

    Animated.timing(pressProgress, {
      toValue,
      duration: toValue === 1 ? 80 : 120,
      useNativeDriver: true,
    }).start();
  };

  const fireHaptic = () => {
    if (disabled || hapticFeedback === 'none') return;

    switch (hapticFeedback) {
      case 'selection':
        Haptics.selectionAsync();
        break;
      case 'impactLight':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'impactMedium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'impactHeavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      default:
        break;
    }
  };

  const handlePress = () => {
    if (!onPress || disabled) return;
    fireHaptic();
    onPress();
  };

  const handleLongPress = () => {
    if (!onLongPress || disabled) return;
    fireHaptic();
    onLongPress();
  };

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[
        styles.container,
        buttonStyle,
        style,
        shadow && glow ? [styles.shadow, { shadowColor: colors.accentShadow }] : styles.noShadow,
        animatedPressStyle,
        disabled && styles.disabled,
      ]}
    >
      {shadow ? (
        <View style={[styles.bottomShadow, bottomShadowStyle]} pointerEvents="none" />
      ) : null}
      <View style={[styles.surface, { borderRadius: resolvedBorderRadius }]}>
        {/* Gradient background - render first */}
        <LinearGradient
          colors={buttonGradient as any}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Glass fog overlay on top - theme-aware */}
        <LinearGradient
          colors={fogOverlay as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Content */}
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={() => animatePress(1)}
          onPressOut={() => animatePress(0)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          {children}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
  },
  shadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 12,
  },
  noShadow: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  bottomShadow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -6,
    height: 12,
    borderRadius: 999,
    opacity: 0.32,
  },
  surface: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 16,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});
