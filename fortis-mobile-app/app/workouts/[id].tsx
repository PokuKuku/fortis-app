import { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlayIcon, TrashIcon } from 'react-native-heroicons/outline';
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
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { workout, loading, refresh: refreshWorkout } = useWorkout(id);
  const isNavigating = useRef(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    loadingText: { color: colors.textSecondary },
    notFoundText: { color: colors.textSecondary },
    description: { color: colors.textSecondary },
    metaText: { color: colors.textTertiary },
    sectionTitle: { color: colors.textPrimary },
    sectionCount: { color: colors.textSecondary },
  };
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const template = useProgramsStore(s => s.programs.find(p => p.id === id && p.isTemplate));
  const canEditTemplate = !!template;
  const updateWorkoutTemplate = useProgramsStore(s => s.updateWorkoutTemplate);

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

    await updateWorkoutTemplate(template.id, template.name, updatedExercises);

    // Close modal and refresh
    setDeleteModal({ ...deleteModal, visible: false });
    refreshWorkout();
  }, [id, deleteModal, refreshWorkout, template, updateWorkoutTemplate]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModal({ ...deleteModal, visible: false });
  }, [deleteModal]);

  // Not found state (avoid loading splash)
  if (!workout) {
    if (loading) {
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
          <Text style={[styles.notFoundText, themedStyles.notFoundText]}>Workout not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
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
            {workout.exercises.map((exercise, index) => (
              <HubExerciseRow
                key={exercise.id}
                exerciseName={exercise.exerciseName}
                targetSets={exercise.targetSets}
                targetReps={exercise.targetReps}
                primaryMuscles={exercise.primaryMuscles}
                images={exercise.images}
                index={index}
                onPress={() => handleExercisePress(exercise.exerciseId)}
                rightAction={
                  <DeleteKebabMenu
                    deleteLabel="Delete Exercise"
                    onDelete={() => handleDeleteExercise(exercise.id, exercise.exerciseName)}
                  />
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
    gap: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.success,
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
