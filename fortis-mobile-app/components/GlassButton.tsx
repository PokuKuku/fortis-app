/**
 * GlassButton.tsx
 *
 * Reusable glass-style button component with gradient overlay
 * and consistent styling for action buttons.
 *
 * Supports both dark and light themes with appropriate glass effects.
 */
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { useTheme } from '@/src/contexts/ThemeContext';

interface GlassButtonProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  gradientColors?: string[];
  circular?: boolean;
  size?: number;
  disabled?: boolean;
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
}: GlassButtonProps) {
  const { colors } = useTheme();

  // Use provided gradient colors or theme default
  const buttonGradient = gradientColors || (colors.buttonGradient as unknown as string[]);
  const fogOverlay = colors.buttonFog as unknown as string[];

  const buttonStyle = circular && size
    ? { width: size, height: size, borderRadius: size / 2 }
    : {};

  return (
    <View style={[styles.container, buttonStyle, style, disabled && styles.disabled]}>
      {/* Gradient background - render first */}
      <LinearGradient
        colors={buttonGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Glass fog overlay on top - theme-aware */}
      <LinearGradient
        colors={fogOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Content */}
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onLongPress={onLongPress}
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
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});
