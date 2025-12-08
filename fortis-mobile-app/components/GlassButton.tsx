/**
 * GlassButton.tsx
 *
 * Reusable glass-style button component with gradient overlay
 * and consistent styling for action buttons.
 */
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  gradientColors?: string[];
  circular?: boolean;
  size?: number;
}

export function GlassButton({
  children,
  onPress,
  style,
  gradientColors = ['#4ade80', '#22c55e'],
  circular = false,
  size,
}: GlassButtonProps) {
  const buttonStyle = circular && size
    ? { width: size, height: size, borderRadius: size / 2 }
    : {};

  return (
    <View style={[styles.container, buttonStyle, style]}>
      {/* Gradient background - render first */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Glass fog overlay on top - matching card opacity */}
      <LinearGradient
        colors={['rgba(140,140,140,0.45)', 'rgba(100,100,100,0.38)', 'rgba(60,60,60,0.32)', 'rgba(20,20,20,0.25)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Content */}
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.8}
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
});
