import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, IconSizes, Spacing } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { HubExerciseRow } from '@/src/components/hub';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import type { Exercise } from '@/src/types/exercise';
import type { AIWorkoutTemplate } from '@/src/types/ai';
import { PlusIcon, CheckIcon, PlayIcon } from 'react-native-heroicons/outline';

const PREVIEW_MODAL_MAX_WIDTH = 390;
const MODAL_HORIZONTAL_MARGIN = 32;
const MODAL_VERTICAL_MARGIN = Spacing['2xl'] * 2;
const BASE_MODAL_HEADER_HEIGHT = 68;
const BASE_MODAL_CONTENT_BOTTOM_PADDING = Spacing['2xl'];
const FOOTER_ACTIONS_HEIGHT = 50 * 2 + Spacing.sm + Spacing.md;

interface AIWorkoutPreviewModalProps {
  visible: boolean;
  template: AIWorkoutTemplate | null;
  onClose: () => void;
  onStart: () => void;
  onAdd: () => void;
  isStarting?: boolean;
  isAdding?: boolean;
  isAdded?: boolean;
  isStartDisabled?: boolean;
}

export function AIWorkoutPreviewModal({
  visible,
  template,
  onClose,
  onStart,
  onAdd,
  isStarting = false,
  isAdding = false,
  isAdded = false,
  isStartDisabled = false,
}: AIWorkoutPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bodyType = useWorkoutStore((state) => state.bodyType);
  const [exerciseMeta, setExerciseMeta] = useState<Record<string, Exercise | null>>({});
  const templateExercises = useMemo(
    () => (Array.isArray(template?.exercises) ? template.exercises : []),
    [template]
  );

  useEffect(() => {
    let isMounted = true;

    const loadExerciseMeta = async () => {
      if (!template || templateExercises.length === 0) {
        setExerciseMeta({});
        return;
      }

      const pairs = await Promise.all(
        templateExercises.map(async (exercise) => [
          exercise.exerciseId,
          await getExerciseById(exercise.exerciseId),
        ] as const)
      );

      if (!isMounted) {
        return;
      }

      setExerciseMeta(Object.fromEntries(pairs));
    };

    void loadExerciseMeta();

    return () => {
      isMounted = false;
    };
  }, [template, templateExercises]);

  const heatmapExercises = useMemo(
    () => templateExercises
      .map((exercise) => exerciseMeta[exercise.exerciseId])
      .filter((exercise): exercise is Exercise => Boolean(exercise)),
    [exerciseMeta, templateExercises]
  );

  if (!template) {
    return null;
  }

  const modalWidth = Math.min(
    Math.max(1, windowWidth - MODAL_HORIZONTAL_MARGIN),
    PREVIEW_MODAL_MAX_WIDTH
  );
  const safeModalHeight = Math.max(
    360,
    windowHeight - insets.top - insets.bottom - MODAL_VERTICAL_MARGIN
  );
  const scrollMaxHeight = Math.max(
    260,
    safeModalHeight
      - BASE_MODAL_HEADER_HEIGHT
      - BASE_MODAL_CONTENT_BOTTOM_PADDING
      - FOOTER_ACTIONS_HEIGHT
  );
  const isCompactHeight = windowHeight < 760;
  const heatmapScale = isCompactHeight ? 0.24 : 0.32;

  const themedStyles = {
    subtitle: { color: colors.textSecondary },
    sectionTitle: { color: colors.textPrimary },
    sectionCount: { color: colors.textSecondary },
    focusChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    focusChipText: { color: colors.textPrimary },
    startButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    startButtonText: { color: Colors.white },
    addButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    addButtonText: { color: colors.textPrimary },
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={template.name}
      width={modalWidth}
      animation="zoom"
    >
      <ScrollView
        style={[styles.scrollView, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={[styles.content, isCompactHeight && styles.contentCompact]}
        showsVerticalScrollIndicator={false}
      >
        {(template.description || template.focus || template.estimatedDurationMinutes) && (
          <View style={styles.summaryBlock}>
            {template.description ? (
              <Text style={[styles.subtitle, themedStyles.subtitle]}>{template.description}</Text>
            ) : null}
            <View style={styles.metaRow}>
              {template.focus ? (
                <View style={[styles.focusChip, themedStyles.focusChip]}>
                  <Text style={[styles.focusChipText, themedStyles.focusChipText]}>{template.focus}</Text>
                </View>
              ) : null}
              {template.estimatedDurationMinutes ? (
                <View style={[styles.focusChip, themedStyles.focusChip]}>
                  <Text style={[styles.focusChipText, themedStyles.focusChipText]}>
                    {template.estimatedDurationMinutes} min
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {heatmapExercises.length > 0 && (
          <View style={[styles.heatmapWrap, isCompactHeight && styles.heatmapWrapCompact]}>
            <MuscleHeatmap exercises={heatmapExercises} gender={bodyType} scale={heatmapScale} compact />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Exercises</Text>
          <Text style={[styles.sectionCount, themedStyles.sectionCount]}>
            {templateExercises.length} exercises
          </Text>
        </View>

        <View style={styles.exerciseList}>
          {templateExercises.map((exercise) => {
            const meta = exerciseMeta[exercise.exerciseId];
            return (
              <View key={exercise.exerciseId} style={styles.exerciseRowWrap}>
                <HubExerciseRow
                  exerciseName={meta?.name ?? exercise.exerciseName}
                  primaryMuscles={meta?.primaryMuscles ?? []}
                  images={meta?.images ?? []}
                />
                <Text style={[styles.setPrescription, themedStyles.subtitle]}>
                  {exercise.sets} sets • {exercise.reps} reps • {exercise.restSeconds ?? 90}s rest
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <GlassButton
          style={StyleSheet.flatten([styles.startButton, themedStyles.startButton])}
          onPress={onStart}
          disabled={isStarting || isAdding || isStartDisabled}
        >
          <View style={styles.addButtonContent}>
            <PlayIcon color={Colors.white} size={IconSizes.md} strokeWidth={2.2} />
            <Text style={[styles.startButtonText, themedStyles.startButtonText]} numberOfLines={1}>
              {isStarting ? 'Starting Workout...' : isStartDisabled ? 'Workout Active' : 'Start Workout'}
            </Text>
          </View>
        </GlassButton>

        <GlassButton
          style={StyleSheet.flatten([styles.addButton, themedStyles.addButton])}
          gradientColors={
            isDark
              ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.04)']
              : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.035)']
          }
          onPress={onAdd}
          disabled={isAdding || isAdded || isStarting}
        >
          <View style={styles.addButtonContent}>
            {isAdded ? (
              <CheckIcon color={colors.textPrimary} size={IconSizes.md} strokeWidth={2.2} />
            ) : (
              <PlusIcon color={colors.textPrimary} size={IconSizes.md} strokeWidth={2.2} />
            )}
            <Text style={[styles.addButtonText, themedStyles.addButtonText]} numberOfLines={1}>
              {isAdded ? 'Added to Workouts' : isAdding ? 'Adding to Workouts...' : 'Add to Workouts'}
            </Text>
          </View>
        </GlassButton>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  content: {
    paddingBottom: Spacing.lg,
  },
  contentCompact: {
    paddingBottom: Spacing.md,
  },
  summaryBlock: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  focusChip: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  focusChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  heatmapWrap: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  heatmapWrapCompact: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseRowWrap: {
    gap: 6,
  },
  setPrescription: {
    paddingHorizontal: Spacing.sm,
  },
  addButton: {
    height: 50,
    borderRadius: BorderRadius.xl,
  },
  startButton: {
    height: 50,
    borderRadius: BorderRadius.xl,
  },
  footerActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
    flexShrink: 1,
  },
  startButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default AIWorkoutPreviewModal;
