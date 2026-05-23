import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusIcon, EyeIcon, CheckIcon, PlayIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import type { AIWorkoutTemplate } from '@/src/types/ai';

interface ChatWorkoutTemplateCardProps {
  template: AIWorkoutTemplate;
  onView: () => void;
  onAdd: () => void;
  onStart: () => void;
  isAdding?: boolean;
  isAdded?: boolean;
  isStarting?: boolean;
  isStartDisabled?: boolean;
}

export function ChatWorkoutTemplateCard({
  template,
  onView,
  onAdd,
  onStart,
  isAdding = false,
  isAdded = false,
  isStarting = false,
  isStartDisabled = false,
}: ChatWorkoutTemplateCardProps) {
  const { colors, isDark } = useTheme();
  const isBusy = isAdding || isStarting;
  const isStartBusy = isBusy || isStartDisabled;
  const exercises = Array.isArray(template.exercises) ? template.exercises : [];
  const primaryButtonForeground = isAdded ? Colors.white : colors.accentForegroundOnFill;

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
    primaryButtonText: { color: primaryButtonForeground },
    startButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    startButtonText: { color: colors.textPrimary },
  };

  const metaParts = [
    template.focus,
    `${exercises.length} exercises`,
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

      <View style={styles.topActions}>
        <TouchableOpacity
          style={[styles.secondaryButton, themedStyles.secondaryButton]}
          onPress={onView}
          activeOpacity={0.75}
        >
          <EyeIcon size={16} color={colors.textPrimary} strokeWidth={2} />
          <Text style={[styles.secondaryButtonText, themedStyles.secondaryButtonText]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, themedStyles.startButton, isStartBusy && styles.buttonDisabled]}
          onPress={onStart}
          activeOpacity={0.8}
          disabled={isStartBusy}
        >
          <PlayIcon size={16} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={[styles.startButtonText, themedStyles.startButtonText]}>
            {isStarting ? 'Starting...' : isStartDisabled ? 'Workout Active' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, themedStyles.primaryButton, (isBusy || isAdded) && styles.buttonDisabled]}
        onPress={onAdd}
        activeOpacity={0.8}
        disabled={isBusy || isAdded}
      >
        {isAdded ? (
          <CheckIcon size={16} color={primaryButtonForeground} strokeWidth={2.2} />
        ) : (
          <PlusIcon size={16} color={primaryButtonForeground} strokeWidth={2.2} />
        )}
        <Text style={[styles.primaryButtonText, themedStyles.primaryButtonText]}>
          {isAdded ? 'Added' : isAdding ? 'Adding...' : 'Add to Workouts'}
        </Text>
      </TouchableOpacity>
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
  topActions: {
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
  startButton: {
    flex: 0.95,
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
  startButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});

export default ChatWorkoutTemplateCard;
