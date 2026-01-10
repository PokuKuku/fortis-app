import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  CheckIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography, FontFamily } from '@/constants/Typography';
import { WorkoutProposalV1 } from '@/src/types/ai';
import { getExercisePreviewNames } from '@/src/utils/workoutProposal';

interface WorkoutProposalCardProps {
  proposal: WorkoutProposalV1;
  onReview: () => void;
  onEdit: () => void;
  onCreate: () => void;
}

export function WorkoutProposalCard({
  proposal,
  onReview,
  onEdit,
  onCreate,
}: WorkoutProposalCardProps) {
  const { colors, isDark } = useTheme();
  const previewExercises = getExercisePreviewNames(proposal.exercises, 5);
  const extraCount = Math.max(proposal.exercises.length - previewExercises.length, 0);

  const themedStyles = {
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    label: { color: colors.textTertiary },
    title: { color: colors.textPrimary },
    summary: { color: colors.textSecondary },
    meta: { color: colors.textSecondary },
    bullet: { backgroundColor: colors.accent },
    exerciseText: { color: colors.textPrimary },
    extraText: { color: colors.textTertiary },
    badge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
    },
    badgeText: { color: colors.textSecondary },
    secondaryButton: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    secondaryButtonText: { color: colors.textPrimary },
  };

  return (
    <View style={[styles.card, themedStyles.card]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, themedStyles.label]}>Workout proposal</Text>
        {proposal.duration_minutes ? (
          <View style={[styles.badge, themedStyles.badge]}>
            <Text style={[styles.badgeText, themedStyles.badgeText]}>
              {proposal.duration_minutes} min
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, themedStyles.title]}>{proposal.title}</Text>
      {proposal.summary ? (
        <Text style={[styles.summary, themedStyles.summary]}>{proposal.summary}</Text>
      ) : null}

      <Text style={[styles.meta, themedStyles.meta]}>
        {proposal.exercises.length} exercise{proposal.exercises.length === 1 ? '' : 's'}
        {proposal.days_per_week ? ` / ${proposal.days_per_week} days/week` : ''}
      </Text>

      <View style={styles.exerciseList}>
        {previewExercises.map((name, index) => (
          <View key={`${name}-${index}`} style={styles.exerciseRow}>
            <View style={[styles.bullet, themedStyles.bullet]} />
            <Text style={[styles.exerciseText, themedStyles.exerciseText]} numberOfLines={1}>
              {name}
            </Text>
          </View>
        ))}
        {extraCount > 0 && (
          <Text style={[styles.extraText, themedStyles.extraText]}>
            +{extraCount} more
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, themedStyles.secondaryButton]}
          onPress={onReview}
          activeOpacity={0.7}
        >
          <MagnifyingGlassIcon color={colors.textPrimary} size={IconSizes.sm} strokeWidth={2} />
          <Text style={[styles.secondaryButtonText, themedStyles.secondaryButtonText]}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, themedStyles.secondaryButton]}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <PencilIcon color={colors.textPrimary} size={IconSizes.sm} strokeWidth={2} />
          <Text style={[styles.secondaryButtonText, themedStyles.secondaryButtonText]}>Edit</Text>
        </TouchableOpacity>
        <GlassButton style={styles.primaryButton} onPress={onCreate}>
          <View style={styles.primaryButtonContent}>
            <CheckIcon color={Colors.white} size={IconSizes.sm} strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>Create workout</Text>
          </View>
        </GlassButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.h4,
  },
  summary: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  meta: {
    ...Typography.caption,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...Typography.caption,
  },
  exerciseList: {
    gap: Spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exerciseText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  extraText: {
    ...Typography.caption,
    marginLeft: Spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  secondaryButtonText: {
    ...Typography.bodySmall,
  },
  primaryButton: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  primaryButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
});
