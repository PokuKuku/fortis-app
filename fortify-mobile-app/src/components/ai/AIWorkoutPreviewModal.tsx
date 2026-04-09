import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
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
import { PlusIcon, CheckIcon } from 'react-native-heroicons/outline';

const PREVIEW_MODAL_WIDTH = Math.min(Dimensions.get('window').width - 32, 390);

interface AIWorkoutPreviewModalProps {
  visible: boolean;
  template: AIWorkoutTemplate | null;
  onClose: () => void;
  onAdd: () => void;
  isAdding?: boolean;
  isAdded?: boolean;
}

export function AIWorkoutPreviewModal({
  visible,
  template,
  onClose,
  onAdd,
  isAdding = false,
  isAdded = false,
}: AIWorkoutPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const bodyType = useWorkoutStore((state) => state.bodyType);
  const [exerciseMeta, setExerciseMeta] = useState<Record<string, Exercise | null>>({});

  useEffect(() => {
    let isMounted = true;

    const loadExerciseMeta = async () => {
      if (!template) {
        setExerciseMeta({});
        return;
      }

      const pairs = await Promise.all(
        template.exercises.map(async (exercise) => [
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
  }, [template]);

  const heatmapExercises = useMemo(
    () => template?.exercises
      .map((exercise) => exerciseMeta[exercise.exerciseId])
      .filter((exercise): exercise is Exercise => Boolean(exercise)) ?? [],
    [exerciseMeta, template]
  );

  if (!template) {
    return null;
  }

  const themedStyles = {
    subtitle: { color: colors.textSecondary },
    sectionTitle: { color: colors.textPrimary },
    sectionCount: { color: colors.textSecondary },
    focusChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    focusChipText: { color: colors.textPrimary },
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={template.name}
      width={PREVIEW_MODAL_WIDTH}
      animation="slide_from_right"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
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
          <View style={styles.heatmapWrap}>
            <MuscleHeatmap exercises={heatmapExercises} gender={bodyType} scale={0.32} compact />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Exercises</Text>
          <Text style={[styles.sectionCount, themedStyles.sectionCount]}>
            {template.exercises.length} exercises
          </Text>
        </View>

        <View style={styles.exerciseList}>
          {template.exercises.map((exercise) => {
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

      <GlassButton
        style={styles.addButton}
        onPress={onAdd}
        disabled={isAdding || isAdded}
      >
        <View style={styles.addButtonContent}>
          {isAdded ? (
            <CheckIcon color={Colors.white} size={IconSizes.md} strokeWidth={2.2} />
          ) : (
            <PlusIcon color={Colors.white} size={IconSizes.md} strokeWidth={2.2} />
          )}
          <Text style={styles.addButtonText}>
            {isAdded ? 'Added to Workouts' : isAdding ? 'Adding to Workouts...' : 'Add to Workouts'}
          </Text>
        </View>
      </GlassButton>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 560,
  },
  content: {
    paddingBottom: Spacing.lg,
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
  },
});

export default AIWorkoutPreviewModal;
