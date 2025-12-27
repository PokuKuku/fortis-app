/**
 * QuickReplies Component
 *
 * Horizontal scrollable chips showing contextual follow-up suggestions
 * after AI responses. Tapping a chip sends that message as user input.
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ suggestions, onSelect, disabled = false }: QuickRepliesProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    chip: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    chipText: { color: colors.textSecondary },
    chipTextDisabled: { color: colors.textTertiary },
  };

  if (!suggestions.length) return null;

  const handleSelect = (suggestion: string) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(suggestion);
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.chip, themedStyles.chip, disabled && styles.chipDisabled]}
            onPress={() => handleSelect(suggestion)}
            activeOpacity={0.7}
            disabled={disabled}
            accessibilityLabel={`Quick reply: ${suggestion}`}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
          >
            <Text style={[styles.chipText, themedStyles.chipText, disabled && themedStyles.chipTextDisabled]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: Spacing.sm,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextDisabled: {
    color: Colors.textTertiary,
  },
});

export default QuickReplies;
