/**
 * GlassButton.tsx
 *
 * Reusable glass-style button component with gradient overlay
 * and consistent styling for action buttons.
 *
 * Supports both dark and light themes with appropriate glass effects.
 */
import { View, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
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
}: GlassButtonProps) {
  const { colors } = useTheme();

  // Use provided gradient colors or theme default
  const buttonGradient = gradientColors || (colors.buttonGradient as unknown as string[]);
  const fogOverlay = colors.buttonFog as unknown as string[];

  const buttonStyle = circular && size
    ? { width: size, height: size, borderRadius: size / 2 }
    : {};

  // Dynamic shadow color based on accent
  const accentShadow = { shadowColor: colors.accentShadow };

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
    <View
      pointerEvents={pointerEvents}
      style={[styles.container, accentShadow, buttonStyle, style, disabled && styles.disabled]}
    >
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
        activeOpacity={0.8}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    // shadowColor is now dynamic via accentShadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
