import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExclamationTriangleIcon, PlayIcon, TrashIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights, IconSizes } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWorkout } from '@/src/hooks/usePrograms';
import { HubHeader, HubExerciseRow } from '@/src/components/hub';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { DeleteKebabMenu } from '@/src/components/program/DeleteKebabMenu';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { getDefaultTemplates } from '@/src/data/defaultPrograms';

const DEFAULT_TEMPLATE_NAME_BY_ID = new Map(
  getDefaultTemplates().map((program) => [program.id, program.name])
);

export default function WorkoutDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const modalStyles = useModalStyles();
  const { workout, loading, refresh: refreshWorkout } = useWorkout(id);
  const isNavigating = useRef(false);
  const isReadOnlyFromProgramEdit = source === 'program-edit';
  const storePrograms = useProgramsStore(s => s.programs);
  const [isRedirectingReplacement, setIsRedirectingReplacement] = useState(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    loadingText: { color: colors.textSecondary },
    notFoundCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    notFoundIconWrap: {
      backgroundColor: isDark ? colors.accentOverlay : colors.accentOverlayMedium,
      borderColor: colors.accentBorder,
    },
    notFoundText: { color: colors.textPrimary },
    notFoundSubtext: { color: colors.textSecondary },
    secondaryActionText: { color: colors.accent },
    description: { color: colors.textSecondary },
    metaText: { color: colors.textTertiary },
    sectionTitle: { color: colors.textPrimary },
    sectionCount: { color: colors.textSecondary },
  };
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const template = storePrograms.find(p => p.id === id && p.isTemplate);
  const canEditTemplate = !!template && !isReadOnlyFromProgramEdit;
  const updateWorkoutTemplate = useProgramsStore(s => s.updateWorkoutTemplate);

  const replacementTemplateId = useMemo(() => {
    if (!id || Array.isArray(id)) return null;
    const defaultTemplateName = DEFAULT_TEMPLATE_NAME_BY_ID.get(id);
    if (!defaultTemplateName) return null;

    const matches = storePrograms.filter((program) => (
      program.isTemplate && !program.isDefault && program.name === defaultTemplateName
    ));

    return matches.length === 1 ? matches[0].id : null;
  }, [id, storePrograms]);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    exerciseId: string;
    name: string;
  }>({ visible: false, exerciseId: '', name: '' });

  const handleBack = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleGoToPrograms = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.replace('/(tabs)');
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleOpenReplacement = () => {
    if (!replacementTemplateId || isNavigating.current) return;
    isNavigating.current = true;
    setIsRedirectingReplacement(true);
    router.replace(`/workouts/${replacementTemplateId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'workout-template-replaced',
      (payload: { fromId?: string; toId?: string } | undefined) => {
        if (!payload?.fromId || !payload?.toId) return;
        if (payload.fromId !== id || isNavigating.current) return;
        isNavigating.current = true;
        setIsRedirectingReplacement(true);
        router.replace(`/workouts/${payload.toId}`);
        setTimeout(() => { isNavigating.current = false; }, 500);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [id, router]);

  useEffect(() => {
    if (loading || workout || !replacementTemplateId || isNavigating.current) return;
    isNavigating.current = true;
    setIsRedirectingReplacement(true);
    router.replace(`/workouts/${replacementTemplateId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  }, [loading, replacementTemplateId, router, workout]);

  const handleEdit = () => {
    if (!id || !canEditTemplate || isNavigating.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isNavigating.current = true;
    router.push(`/workout/create?templateId=${id}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };


  const startWorkoutFromTemplate = useWorkoutStore(s => s.startWorkoutFromTemplate);

  const handleStartWorkout = async () => {
    if (isNavigating.current || !id) return;
    isNavigating.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const success = await startWorkoutFromTemplate(id);
    if (success) {
      router.replace('/workout/active');
    }
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleExercisePress = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Delete handlers
  const handleDeleteExercise = useCallback((exerciseId: string, exerciseName: string) => {
    setDeleteModal({
      visible: true,
      exerciseId,
      name: exerciseName,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;
    if (!template || !template.workouts[0]) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const workout = template.workouts[0];
    const updatedExercises = workout.exercises
      .filter((exercise) => exercise.id !== deleteModal.exerciseId)
      .map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        setDetails: exercise.setDetails,
      }));

    const updatedTemplateId = await updateWorkoutTemplate(template.id, template.name, updatedExercises);

    // Close modal and refresh
    setDeleteModal({ ...deleteModal, visible: false });
    if (updatedTemplateId && updatedTemplateId !== template.id) {
      router.replace(`/workouts/${updatedTemplateId}`);
      return;
    }
    refreshWorkout();
  }, [id, deleteModal, refreshWorkout, router, template, updateWorkoutTemplate]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModal({ ...deleteModal, visible: false });
  }, [deleteModal]);

  // Not found state (avoid loading splash)
  if (!workout) {
    if (loading || isRedirectingReplacement) {
      return (
        <SafeAreaView style={[styles.container, themedStyles.container]} edges={['top']}>
          <StainlessSteelPattern />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, themedStyles.container]} edges={['top']}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <View style={[styles.notFoundCard, themedStyles.notFoundCard]}>
            <View style={[styles.notFoundIconWrap, themedStyles.notFoundIconWrap]}>
              <ExclamationTriangleIcon color={colors.accent} size={20} strokeWidth={2.2} />
            </View>
            <Text style={[styles.notFoundText, themedStyles.notFoundText]}>
              {replacementTemplateId ? 'Workout moved' : 'Workout not found'}
            </Text>
            <Text style={[styles.notFoundSubtext, themedStyles.notFoundSubtext]}>
              {replacementTemplateId
                ? 'This default workout was turned into your personal copy after you edited it.'
                : 'This workout is no longer available. You can return to your workouts and keep going.'}
            </Text>
            {replacementTemplateId ? (
              <GlassButton style={styles.notFoundPrimaryButton} onPress={handleOpenReplacement}>
                <Text style={styles.notFoundPrimaryButtonText}>Open updated workout</Text>
              </GlassButton>
            ) : (
              <GlassButton style={styles.notFoundPrimaryButton} onPress={handleGoToPrograms}>
                <Text style={styles.notFoundPrimaryButtonText}>Back to workouts</Text>
              </GlassButton>
            )}
            <Pressable onPress={handleBack} style={styles.notFoundSecondaryAction}>
              <Text style={[styles.notFoundSecondaryActionText, themedStyles.secondaryActionText]}>
                Go back
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themedStyles.container]} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <HubHeader
        title={workout.name}
        onBack={handleBack}
        rightAction={canEditTemplate ? { label: 'Edit', onPress: handleEdit } : undefined}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {workout.description && (
          <Animated.View
            entering={FadeIn.delay(100).duration(300)}
            style={styles.descriptionContainer}
          >
            <Text style={[styles.description, themedStyles.description]}>{workout.description}</Text>
          </Animated.View>
        )}

        {/* Muscle Heatmap Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.section}
        >
          <MuscleHeatmap exercises={workout.exercises} gender={bodyType} />
        </Animated.View>

        {/* Start Workout Button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.startButtonContainer}
        >
          <GlassButton
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <View style={styles.startButtonContent}>
              <PlayIcon color={Colors.white} size={IconSizes.lg} strokeWidth={2.5} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </View>
          </GlassButton>
        </Animated.View>

        {/* Exercises Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Exercises</Text>
            <Text style={[styles.sectionCount, themedStyles.sectionCount]}>
              {workout.exercises.length} exercises
            </Text>
          </View>

          <View style={styles.exercisesList}>
            {workout.exercises.map((exercise) => (
              <HubExerciseRow
                key={exercise.id}
                exerciseName={exercise.exerciseName}
                primaryMuscles={exercise.primaryMuscles}
                images={exercise.images}
                onPress={() => handleExercisePress(exercise.exerciseId)}
                rightAction={
                  canEditTemplate ? (
                    <DeleteKebabMenu
                      deleteLabel="Delete Exercise"
                      onDelete={() => handleDeleteExercise(exercise.id, exercise.exerciseName)}
                    />
                  ) : undefined
                }
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <BaseModal
        visible={deleteModal.visible}
        onClose={handleCancelDelete}
        title="Delete Exercise?"
        icon={<TrashIcon size={24} color={Colors.error} />}
      >
        <Text style={modalStyles.message}>
          Are you sure you want to remove "{deleteModal.name}" from this workout? This cannot be undone.
        </Text>
        <View style={modalStyles.actions}>
          <Pressable
            onPress={handleCancelDelete}
            style={({ pressed }) => [
              modalStyles.cancelButton,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirmDelete}
            style={({ pressed }) => [
              modalStyles.errorButton,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text style={modalStyles.errorButtonText}>Delete</Text>
          </Pressable>
        </View>
      </BaseModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['6xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  notFoundCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
  },
  notFoundIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  notFoundSubtext: {
    fontSize: FontSizes.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  notFoundPrimaryButton: {
    width: '100%',
    height: ButtonHeights.xl,
    borderRadius: BorderRadius.xl,
  },
  notFoundPrimaryButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
  },
  notFoundSecondaryAction: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  notFoundSecondaryActionText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaContainer: {
    marginBottom: Spacing.lg,
  },
  metaText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: 'rgba(163, 163, 163, 0.7)',
  },
  startButtonContainer: {
    marginBottom: Spacing['2xl'],
  },
  startButton: {
    height: ButtonHeights.xl,
    borderRadius: BorderRadius.xl,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  exercisesList: {
    gap: Spacing.md,
  },
});
