import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { scale } from '@/src/utils/responsive';

interface AccentShadowCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  shadowInset?: number;
  shadowOpacity?: number;
  pressable?: boolean;
}

const DEFAULT_RADIUS = BorderRadius.xl;
const SHADOW_HEIGHT = scale(8);
const SHADOW_VISIBLE_HEIGHT = scale(5);
const SHADOW_LIFT = scale(2);
const SHADOW_CLIP_TOP = SHADOW_HEIGHT - SHADOW_VISIBLE_HEIGHT;
const PRESS_DEPTH = scale(2);

export function AccentShadowCard({
  children,
  style,
  radius = DEFAULT_RADIUS,
  shadowInset,
  shadowOpacity,
  pressable = true,
}: AccentShadowCardProps) {
  const { colors, isDark } = useTheme();
  const inset = shadowInset ?? radius;
  const pressDepth = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pressDepth.value },
      { scale: pressDepth.value > 0 ? 0.985 : 1 },
    ],
  }));

  const handleTouchStart = () => {
    if (!pressable) return;
    pressDepth.value = withTiming(PRESS_DEPTH, {
      duration: 70,
      easing: Easing.out(Easing.quad),
    });
  };

  const handleTouchEnd = () => {
    if (!pressable) return;
    pressDepth.value = withTiming(0, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
  };

  return (
    <Animated.View
      style={[styles.frame, style, pressStyle]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <View
        pointerEvents="none"
        style={[
          styles.shadowViewport,
          {
            bottom: -(SHADOW_VISIBLE_HEIGHT - SHADOW_LIFT),
            height: SHADOW_VISIBLE_HEIGHT,
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
          },
        ]}
      >
        <View
          style={[
            styles.shadow,
            {
              left: inset,
              right: inset,
              top: -SHADOW_CLIP_TOP,
              height: SHADOW_HEIGHT,
              backgroundColor: colors.accent,
              opacity: shadowOpacity ?? (isDark ? 0.44 : 0.26),
            },
          ]}
        />
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    overflow: 'visible',
  },
  shadowViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  shadow: {
    position: 'absolute',
    borderRadius: 999,
  },
});
