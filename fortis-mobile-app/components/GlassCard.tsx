/**
 * GlassCard.tsx
 *
 * Reusable glass-style card component with fog overlay, state overlay,
 * and consistent styling for Program and Workout cards.
 */
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  width?: string | number;
  style?: ViewStyle;
  padding?: number;
}

export function GlassCard({ children, onPress, width = '100%', style, padding = 16 }: GlassCardProps) {
  return (
    <View style={[styles.card, { width, padding }, style]}>
      {/* Enhanced Fog Overlay with gradient */}
      <LinearGradient
        colors={['rgba(140,140,140,0.45)', 'rgba(100,100,100,0.38)', 'rgba(60,60,60,0.32)', 'rgba(20,20,20,0.25)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* State Overlay */}
      <View style={styles.stateOverlay} pointerEvents="none" />

      {/* Content */}
      <TouchableOpacity style={styles.cardInner} onPress={onPress} disabled={!onPress}>
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
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  cardInner: {
    position: 'relative',
    zIndex: 10,
  },
  cardContent: {
    gap: 8,
  },
});
