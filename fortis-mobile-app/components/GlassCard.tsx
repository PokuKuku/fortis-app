/**
 * GlassCard.tsx
 *
 * Reusable glass-style card component with fog overlay, state overlay,
 * and consistent styling for Program and Workout cards.
 *
 * Supports both dark and light themes with appropriate glass effects.
 */
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { useTheme } from '@/src/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  width?: string | number;
  style?: ViewStyle;
  padding?: number;
}

export function GlassCard({ children, onPress, width = '100%', style, padding = 16 }: GlassCardProps) {
  const { colors, isDark } = useTheme();

  const fogOverlay = colors.glassFog as unknown as string[];

  // Theme-aware card styling
  const cardStyle = {
    borderColor: colors.glassBorder,
    backgroundColor: isDark ? colors.glassBackground : 'rgba(255,255,255,0.85)',
  };

  return (
    <View style={[styles.card, cardStyle, { width, padding }, style]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
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
