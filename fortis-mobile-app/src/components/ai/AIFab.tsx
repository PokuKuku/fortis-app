/**
 * AI FAB (Floating Action Button)
 *
 * The main entry point for AI features.
 * Appears on all screens except during active workouts.
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '../../../constants/Sizes';
import { useAIStore, selectHasPendingActions } from '../../store/aiStore';
import { useTheme } from '../../contexts/ThemeContext';

interface AIFabProps {
  /** Position from bottom of screen */
  bottom?: number;
  /** Whether to hide the FAB */
  hidden?: boolean;
  /** Called when FAB is pressed */
  onPress?: () => void;
}

export function AIFab({ bottom = 88, hidden = false, onPress }: AIFabProps) {
  const { colors } = useTheme();
  const openConversation = useAIStore((state) => state.openConversation);
  const hasPendingActions = useAIStore(selectHasPendingActions);
  const isLoading = useAIStore((state) => state.isSendingMessage);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate visibility
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: hidden ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: hidden ? 0.8 : 1,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hidden, opacityAnim, scaleAnim]);

  // Pulse animation when there are pending actions
  useEffect(() => {
    if (hasPendingActions) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasPendingActions, pulseAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (onPress) {
      onPress();
    } else {
      openConversation();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
      pointerEvents={hidden ? 'none' : 'auto'}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          hasPendingActions && [styles.fabWithBadge, { borderColor: colors.accent }],
          isLoading && styles.fabLoading,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.accentOverlay }]}>
          <Sparkles
            color={Colors.white}
            size={IconSizes.lg}
            strokeWidth={2}
          />
        </View>
        {hasPendingActions && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>!</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 900,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabWithBadge: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  fabLoading: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default AIFab;
