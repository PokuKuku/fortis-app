import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusIcon, EyeIcon, CheckIcon, PlayIcon, ArrowPathIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { normalizeAIWorkoutTemplateMetadata } from '@/src/utils/aiWorkoutTemplateMetadata';
import type { AIWorkoutTemplate } from '@/src/types/ai';

interface ChatWorkoutTemplateCardProps {
  template: AIWorkoutTemplate;
  onView: () => void;
  onAdd: () => void;
  onStart: () => void;
  onUpdate?: () => void;
  isAdding?: boolean;
  isAdded?: boolean;
  isUpdating?: boolean;
  isUpdateMode?: boolean;
  isStarting?: boolean;
  isStartDisabled?: boolean;
  startDisabledLabel?: string;
  displayScale?: number;
}

export function ChatWorkoutTemplateCard({
  template,
  onView,
  onAdd,
  onStart,
  onUpdate,
  isAdding = false,
  isAdded = false,
  isUpdating = false,
  isUpdateMode = false,
  isStarting = false,
  isStartDisabled = false,
  startDisabledLabel = 'Workout Active',
  displayScale = 1,
}: ChatWorkoutTemplateCardProps) {
  const { colors, isDark } = useTheme();
  const displayTemplate = normalizeAIWorkoutTemplateMetadata(template);
  const isBusy = isAdding || isStarting || isUpdating;
  const isStartBusy = isBusy || isStartDisabled;
  const exercises = Array.isArray(displayTemplate.exercises) ? displayTemplate.exercises : [];
  const primaryButtonForeground = isAdded ? Colors.white : colors.accentForegroundOnFill;
  const cardScale = Math.max(0.86, Math.min(1, displayScale));
  const iconSize = Math.max(14, Math.round(16 * cardScale));

  const themedStyles = {
    card: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
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
    displayTemplate.focus,
    `${exercises.length} exercises`,
  ].filter(Boolean);

  return (
    <View style={[
      styles.card,
      {
        padding: Math.round(Spacing.md * cardScale),
        gap: Math.round(Spacing.md * cardScale),
        marginTop: Math.round(Spacing.sm * cardScale),
      },
      themedStyles.card,
    ]}>
      <View style={[styles.header, { gap: Math.max(3, Math.round(4 * cardScale)) }]}>
        <Text
          style={[styles.title, { fontSize: FontSizes.base * cardScale }, themedStyles.title]}
          numberOfLines={1}
        >
          {displayTemplate.name}
        </Text>
        {metaParts.length > 0 && (
          <Text
            style={[styles.meta, { fontSize: FontSizes.sm * cardScale }, themedStyles.meta]}
            numberOfLines={1}
          >
            {metaParts.join(' • ')}
          </Text>
        )}
      </View>

      <View style={[styles.topActions, { gap: Math.round(Spacing.sm * cardScale) }]}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              minHeight: Math.max(34, Math.round(38 * cardScale)),
              gap: Math.max(5, Math.round(6 * cardScale)),
            },
            themedStyles.secondaryButton,
          ]}
          onPress={onView}
          activeOpacity={0.75}
        >
          <EyeIcon size={iconSize} color={colors.textPrimary} strokeWidth={2} />
          <Text
            style={[styles.secondaryButtonText, { fontSize: FontSizes.sm * cardScale }, themedStyles.secondaryButtonText]}
          >
            View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.startButton,
            {
              minHeight: Math.max(34, Math.round(38 * cardScale)),
              gap: Math.max(5, Math.round(6 * cardScale)),
            },
            themedStyles.startButton,
            isStartBusy && styles.buttonDisabled,
          ]}
          onPress={onStart}
          activeOpacity={0.8}
          disabled={isStartBusy}
        >
          <PlayIcon size={iconSize} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={[styles.startButtonText, { fontSize: FontSizes.sm * cardScale }, themedStyles.startButtonText]}>
            {isStarting ? 'Starting...' : isStartDisabled ? startDisabledLabel : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          {
            minHeight: Math.max(36, Math.round(40 * cardScale)),
            gap: Math.max(5, Math.round(6 * cardScale)),
          },
          themedStyles.primaryButton,
          (isBusy || isAdded) && styles.buttonDisabled,
        ]}
        onPress={isUpdateMode ? onUpdate : onAdd}
        activeOpacity={0.8}
        disabled={isBusy || isAdded}
      >
        {isAdded ? (
          <CheckIcon size={iconSize} color={primaryButtonForeground} strokeWidth={2.2} />
        ) : isUpdateMode ? (
          <ArrowPathIcon size={iconSize} color={primaryButtonForeground} strokeWidth={2.2} />
        ) : (
          <PlusIcon size={iconSize} color={primaryButtonForeground} strokeWidth={2.2} />
        )}
        <Text style={[styles.primaryButtonText, { fontSize: FontSizes.sm * cardScale }, themedStyles.primaryButtonText]}>
          {isAdded
            ? isUpdateMode ? 'Updated' : 'Added'
            : isUpdateMode
              ? isUpdating ? 'Updating...' : 'Update Workout'
              : isAdding ? 'Adding...' : 'Add to Workouts'}
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
    fontFamily: 'BankGothicBT-Medium',
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
