/**
 * GlassCard.tsx
 *
 * Reusable glass-style card component with fog overlay, state overlay,
 * and consistent styling for Program and Workout cards.
 *
 * Supports both dark and light themes with appropriate glass effects.
 */
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ColorValue,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { scale } from '@/src/utils/responsive';

const CARD_RADIUS = scale(16);
const PRESS_DEPTH = scale(2);
const BOTTOM_GLOW_INSET = scale(14);
const BOTTOM_GLOW_OFFSET = scale(3);
const BOTTOM_GLOW_HEIGHT = scale(10);
const SHELL_SHADOW_HEIGHT = scale(10);
const SHELL_SHADOW_RADIUS = scale(20);

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shellShadow?: boolean;
}

export function GlassCard({
  children,
  onPress,
  width = '100%',
  style,
  padding = 16,
  shellShadow = true,
}: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const pressDepth = useSharedValue(0);

  const fogOverlay = colors.glassFog as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]];
  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pressDepth.value },
      { scale: pressDepth.value > 0 ? 0.985 : 1 },
    ],
  }));
  const handlePressIn = () => {
    if (!onPress) return;
    pressDepth.value = withTiming(PRESS_DEPTH, {
      duration: 70,
      easing: Easing.out(Easing.quad),
    });
  };
  const handlePressOut = () => {
    if (!onPress) return;
    pressDepth.value = withTiming(0, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
  };

  // Theme-aware card styling
  const cardStyle = {
    borderColor: colors.glassBorder,
    backgroundColor: isDark ? colors.glassBackground : 'rgba(255,255,255,0.85)',
  };
  const shellShadowStyle = shellShadow ? {
    shadowColor: colors.accentShadow,
  } : styles.noShellShadow;
  const bottomGlowStyle = {
    backgroundColor: colors.accent,
    opacity: isDark ? 0.44 : 0.24,
  };

  return (
    <Animated.View style={[styles.glowShell, shellShadowStyle, { width }, pressStyle]}>
      <View style={[styles.bottomGlow, bottomGlowStyle]} pointerEvents="none" />
      <View style={[styles.card, cardStyle, { padding }, style]}>
        {/* Enhanced Fog Overlay with gradient - theme-aware */}
        <LinearGradient
          colors={fogOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* State Overlay */}
        <View style={styles.stateOverlay} pointerEvents="none" />

        {/* Content */}
        <TouchableOpacity
          style={styles.cardInner}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress}
          activeOpacity={0.85}
          delayPressIn={0}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <View style={styles.cardContent}>
            {children}
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowShell: {
    position: 'relative',
    borderRadius: CARD_RADIUS,
    shadowOffset: { width: 0, height: SHELL_SHADOW_HEIGHT },
    shadowOpacity: 0.46,
    shadowRadius: SHELL_SHADOW_RADIUS,
    elevation: 12,
  },
  noShellShadow: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  bottomGlow: {
    position: 'absolute',
    left: BOTTOM_GLOW_INSET,
    right: BOTTOM_GLOW_INSET,
    bottom: -BOTTOM_GLOW_OFFSET,
    height: BOTTOM_GLOW_HEIGHT,
    borderRadius: 999,
  },
  card: {
    position: 'relative',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  cardInner: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
  },
  cardContent: {
    gap: 8,
    width: '100%',
  },
});
