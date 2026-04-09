import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusIcon, EyeIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import type { AIWorkoutTemplate } from '@/src/types/ai';

interface ChatWorkoutTemplateCardProps {
  template: AIWorkoutTemplate;
  onView: () => void;
  onAdd: () => void;
  isAdding?: boolean;
  isAdded?: boolean;
}

export function ChatWorkoutTemplateCard({
  template,
  onView,
  onAdd,
  isAdding = false,
  isAdded = false,
}: ChatWorkoutTemplateCardProps) {
  const { colors, isDark } = useTheme();

  const themedStyles = {
    card: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    title: { color: colors.textPrimary },
    meta: { color: colors.textSecondary },
    secondaryButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    secondaryButtonText: { color: colors.textPrimary },
    primaryButton: {
      backgroundColor: isAdded ? Colors.success : colors.accent,
    },
  };

  const metaParts = [
    template.focus,
    `${template.exercises.length} exercises`,
    template.estimatedDurationMinutes ? `${template.estimatedDurationMinutes} min` : null,
  ].filter(Boolean);

  return (
    <View style={[styles.card, themedStyles.card]}>
      <View style={styles.header}>
        <Text style={[styles.title, themedStyles.title]} numberOfLines={1}>
          {template.name}
        </Text>
        {metaParts.length > 0 && (
          <Text style={[styles.meta, themedStyles.meta]} numberOfLines={1}>
            {metaParts.join(' • ')}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.secondaryButton, themedStyles.secondaryButton]}
          onPress={onView}
          activeOpacity={0.75}
        >
          <EyeIcon size={16} color={colors.textPrimary} strokeWidth={2} />
          <Text style={[styles.secondaryButtonText, themedStyles.secondaryButtonText]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, themedStyles.primaryButton, (isAdding || isAdded) && styles.buttonDisabled]}
          onPress={onAdd}
          activeOpacity={0.8}
          disabled={isAdding || isAdded}
        >
          {isAdded ? (
            <CheckIcon size={16} color={Colors.white} strokeWidth={2.2} />
          ) : (
            <PlusIcon size={16} color={Colors.white} strokeWidth={2.2} />
          )}
          <Text style={styles.primaryButtonText}>
            {isAdded ? 'Added' : isAdding ? 'Adding...' : 'Add to Workouts'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  meta: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.4,
    minHeight: 38,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});

export default ChatWorkoutTemplateCard;
