import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { PlayIcon, TrashIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights, IconSizes } from '@/constants/Sizes';
import { useProgram } from '@/src/hooks/usePrograms';
import { HubHeader, HubExerciseRow, HubStatsSection } from '@/src/components/hub';
import { ProgramWorkout } from '@/src/types/program';
import { DeleteKebabMenu } from '@/src/components/program/DeleteKebabMenu';
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';
import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { WorkoutStackPreview } from '@/src/components/program/WorkoutStackPreview';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';

// Difficulty badge colors - beginner uses accent from theme
const getDifficultyColors = (accentOverlay: string, accent: string): Record<string, { bg: string; text: string }> => ({
  beginner: { bg: accentOverlay, text: accent },
  intermediate: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
  advanced: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
});

// Goal badge colors
const GOAL_LABELS: Record<string, string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerlifting: 'Powerlifting',
  general_fitness: 'General Fitness',
};

const DIFFICULTY_SHORT_LABELS: Record<string, string> = {
  beginner: 'Beg',
  intermediate: 'Inter',
  advanced: 'Adv',
};

const formatShortRelativeTime = (dateString?: string | null) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Never';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y`;
};

// Collapsible workout section component
function WorkoutSection({
  workout,
  isExpanded,
  onToggle,
  onExercisePress,
  onDeleteWorkout,
  onDeleteExercise,
}: {
  workout: ProgramWorkout;
  isExpanded: boolean;
  onToggle: () => void;
  onExercisePress: (exerciseId: string) => void;
  onDeleteWorkout: (workoutId: string, workoutName: string) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string, exerciseName: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <View style={[styles.workoutSection, cardStyle]}>
      {/* Section Header */}
      <View style={styles.workoutSectionHeader}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.7}
          style={styles.workoutSectionTouchable}
        >
          <View style={styles.workoutSectionLeft}>
            <View style={[styles.dayBadge, { backgroundColor: colors.accentOverlay }]}>
              <Text style={[styles.dayBadgeText, { color: colors.accent }]}>Day {workout.dayNumber}</Text>
            </View>
            <View style={styles.workoutSectionInfo}>
              <Text style={[styles.workoutSectionTitle, { color: colors.textPrimary }]}>{workout.name}</Text>
              <Text style={[styles.workoutSectionSubtitle, { color: colors.textSecondary }]}>
                {workout.exercises.length} exercises
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <DeleteKebabMenu
          deleteLabel="Delete Workout"
          onDelete={() => onDeleteWorkout(workout.id, workout.name)}
        />
      </View>

      {/* Exercises List (collapsible) */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.workoutExercises}
        >
          {workout.exercises.map((exercise, exerciseIndex) => (
            <HubExerciseRow
              key={exercise.id}
              exerciseName={exercise.exerciseName}
              targetSets={exercise.targetSets}
              targetReps={exercise.targetReps}
              primaryMuscles={exercise.primaryMuscles}
              images={exercise.images}
              index={exerciseIndex}
              onPress={() => onExercisePress(exercise.exerciseId)}
                rightAction={
                  <DeleteKebabMenu
                    deleteLabel="Delete Exercise"
                    onDelete={() => onDeleteExercise(workout.id, exercise.id, exercise.exerciseName)}
                  />
                }
              />
            ))}
        </Animated.View>
      )}
    </View>
  );
}

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { program, loading } = useProgram(id);
  const isNavigating = useRef(false);
  const removeWorkoutFromProgram = useProgramsStore(s => s.removeWorkoutFromProgram);
  const removeExerciseFromProgramWorkout = useProgramsStore(s => s.removeExerciseFromProgramWorkout);
  const startWorkoutFromProgram = useWorkoutStore(s => s.startWorkoutFromProgram);
  const bodyType = useWorkoutStore(s => s.bodyType);
  const loadProgress = useProgramProgressStore(s => s.loadProgress);
  const progressEntry = useProgramProgressStore(
    s => (id ? s.progressByProgram[id] : undefined)
  );
  const getNextDayNumber = useProgramProgressStore(s => s.getNextDayNumber);
  const restartProgram = useProgramProgressStore(s => s.restartProgram);
  const trimCompletedDays = useProgramProgressStore(s => s.trimCompletedDays);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    step: 'confirm' | 'edit-intent';
    type: 'workout' | 'exercise';
    workoutId: string;
    exerciseId?: string;
    name: string;
  }>({ visible: false, step: 'confirm', type: 'workout', workoutId: '', name: '' });
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});

  const toggleWorkout = useCallback((workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setExpandedWorkouts({});
      return undefined;
    }, [id])
  );

  const handleBack = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id) {
      router.push(`/programs/create?mode=edit&programId=${id}`);
    }
  };

  const handleStartProgram = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const workouts = program?.workouts ? [...program.workouts] : [];
    workouts.sort((a, b) => a.dayNumber - b.dayNumber);
    const totalDays = workouts.length;
    const nextDayNumber = totalDays > 0 && id
      ? getNextDayNumber(id, totalDays)
      : 1;
    const nextWorkout = workouts.find(w => w.dayNumber === nextDayNumber) || workouts[0];

    if (id && nextWorkout) {
      startWorkoutFromProgram(id, nextWorkout.id).then((success) => {
        if (success) {
          router.push('/workout/active');
        }
      });
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
  const handleDeleteWorkout = useCallback((workoutId: string, workoutName: string) => {
    setDeleteModal({
      visible: true,
      step: 'confirm',
      type: 'workout',
      workoutId,
      name: workoutName,
    });
  }, []);

  const handleDeleteExercise = useCallback((workoutId: string, exerciseId: string, exerciseName: string) => {
    setDeleteModal({
      visible: true,
      step: 'confirm',
      type: 'exercise',
      workoutId,
      exerciseId,
      name: exerciseName,
    });
  }, []);

  const applyDelete = useCallback(async (payload: {
    type: 'workout' | 'exercise';
    workoutId: string;
    exerciseId?: string;
  }) => {
    if (!id) return false;

    let success = false;
    if (payload.type === 'workout') {
      success = await removeWorkoutFromProgram(id, payload.workoutId);
    } else if (payload.exerciseId) {
      success = await removeExerciseFromProgramWorkout(
        id,
        payload.workoutId,
        payload.exerciseId
      );
    }

    return success;
  }, [id, removeExerciseFromProgramWorkout, removeWorkoutFromProgram]);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const deletePayload = {
      type: deleteModal.type,
      workoutId: deleteModal.workoutId,
      exerciseId: deleteModal.exerciseId,
    };

    if (progressEntry) {
      setDeleteModal(prev => ({ ...prev, step: 'edit-intent' }));
      return;
    }

    setDeleteModal(prev => ({ ...prev, visible: false }));
    void applyDelete(deletePayload);
    // refreshProgram() removed - local state already updated by applyDelete via Zustand
  }, [applyDelete, deleteModal, id, progressEntry]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModal(prev => ({ ...prev, visible: false, step: 'confirm' }));
  }, []);

  const handleEditIntent = useCallback(async (intent: 'keep' | 'restart') => {
    if (!id || !program) {
      setDeleteModal(prev => ({ ...prev, visible: false, step: 'confirm' }));
      return;
    }

    const deletePayload = {
      type: deleteModal.type,
      workoutId: deleteModal.workoutId,
      exerciseId: deleteModal.exerciseId,
    };
    setDeleteModal(prev => ({ ...prev, visible: false, step: 'confirm' }));

    void (async () => {
      const success = await applyDelete(deletePayload);
      if (!success) return;

      const nextTotalDays = deletePayload.type === 'workout'
        ? Math.max(0, program.workouts.length - 1)
        : program.workouts.length;

      if (intent === 'restart') {
        restartProgram(id);
      } else {
        trimCompletedDays(id, nextTotalDays);
      }
    })();
  }, [applyDelete, deleteModal, id, program, restartProgram, trimCompletedDays]);

  const heatmapExercises = useMemo(
    () => program?.workouts.flatMap(workout => workout.exercises) ?? [],
    [program]
  );

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Theme-aware meta tag styles
  const metaTagStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  };

  // Theme-aware styles
  const themedStyles = {
    dayBadge: { backgroundColor: colors.accentOverlay },
    dayBadgeText: { color: colors.accent },
    backLinkText: { color: colors.accent },
  };

  // Get difficulty colors with dynamic accent
  const DIFFICULTY_COLORS = getDifficultyColors(colors.accentOverlay, colors.accent);

  // Not found state (avoid loading splash)
  if (!program) {
    if (loading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <StainlessSteelPattern />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Program not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={[styles.backLinkText, themedStyles.backLinkText]}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyColors = DIFFICULTY_COLORS[program.difficulty] || DIFFICULTY_COLORS.beginner;
  const completedDayNumbers = progressEntry?.completedDayNumbers || [];
  const completedIds = program.workouts
    .filter(workout => completedDayNumbers.includes(workout.dayNumber))
    .map(workout => workout.id);
  const nextDayNumber = id
    ? getNextDayNumber(id, program.workouts.length)
    : 1;
  const currentCycle = progressEntry?.currentCycle || 1;
  const completedCycles = progressEntry?.history.length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <HubHeader
        title={program.name}
        onBack={handleBack}
        rightAction={{ label: 'Edit', onPress: handleEdit }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {program.description && (
          <Animated.View
            entering={FadeIn.delay(100).duration(300)}
            style={styles.descriptionContainer}
          >
            <Text style={[styles.description, { color: colors.textSecondary }]}>{program.description}</Text>
          </Animated.View>
        )}

        {/* Meta Tags */}
        <Animated.View
          entering={FadeIn.delay(150).duration(300)}
          style={styles.metaTagsContainer}
        >
          {/* Duration */}
          {program.durationWeeks ? (
            <View style={[styles.metaTag, metaTagStyle]}>
              <Text style={[styles.metaTagText, { color: colors.textPrimary }]}>
                {program.durationWeeks} weeks
              </Text>
            </View>
          ) : null}

          {/* Goal */}
          {program.goal && (
            <View style={[styles.metaTag, metaTagStyle]}>
              <Text style={[styles.metaTagText, { color: colors.textPrimary }]}>
                {GOAL_LABELS[program.goal] || program.goal}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Creator & Last Performed */}
        <Animated.View
          entering={FadeIn.delay(200).duration(300)}
          style={styles.creatorContainer}
        >
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Cycle {currentCycle} - Next Day {nextDayNumber}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.section}
        >
          <MuscleHeatmap exercises={heatmapExercises} gender={bodyType} />
        </Animated.View>

        {/* Start Program Button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.startButtonContainer}
        >
          <GlassButton
            style={styles.startButton}
            onPress={handleStartProgram}
          >
            <View style={styles.startButtonContent}>
              <PlayIcon color={colors.white} size={IconSizes.lg} strokeWidth={2.5} />
              <Text style={[styles.startButtonText, { color: colors.white }]}>Continue program</Text>
            </View>
          </GlassButton>
        </Animated.View>

        {/* Workouts Section */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Workouts</Text>
            <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {program.workouts.reduce((sum, w) => sum + w.exercises.length, 0)} exercises
            </Text>
          </View>

          <View style={styles.workoutsList}>
            {program.workouts.map((workout) => (
              <WorkoutSection
                key={workout.id}
                workout={workout}
                isExpanded={!!expandedWorkouts[workout.id]}
                onToggle={() => toggleWorkout(workout.id)}
                onExercisePress={handleExercisePress}
                onDeleteWorkout={handleDeleteWorkout}
                onDeleteExercise={handleDeleteExercise}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Progress</Text>
            <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {completedDayNumbers.length}/{program.workouts.length} workouts
            </Text>
          </View>
          <WorkoutStackPreview
            workouts={program.workouts}
            completedIds={completedIds}
            currentDayNumber={nextDayNumber}
          />
          {completedCycles > 0 && (
            <Text style={[styles.progressHistoryText, { color: colors.textSecondary }]}>
              {completedCycles} cycle{completedCycles === 1 ? '' : 's'} completed
            </Text>
          )}
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(400)}
          style={styles.section}
        >
          <HubStatsSection
            stats={program.stats}
          />
        </Animated.View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <BaseModal
        visible={deleteModal.visible}
        onClose={handleCancelDelete}
        title={
          deleteModal.step === 'edit-intent'
            ? 'Edit Active Program?'
            : deleteModal.type === 'workout'
              ? 'Delete Workout?'
              : 'Delete Exercise?'
        }
        icon={
          deleteModal.step === 'edit-intent'
            ? <ExclamationTriangleIcon size={24} color={Colors.warning} />
            : <TrashIcon size={24} color={Colors.error} />
        }
      >
        {deleteModal.step === 'edit-intent' ? (
          <>
            <Text style={modalStyles.message}>
              This program is in progress. How should we handle your edits?
            </Text>
            <View style={[modalStyles.actions, styles.modalActions]}>
              <Pressable
                onPress={() => handleEditIntent('keep')}
                style={({ pressed }) => [
                  modalStyles.successButton,
                  styles.modalActionButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={[modalStyles.successButtonText, styles.modalActionText]}>
                  Apply to future workouts
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleEditIntent('restart')}
                style={({ pressed }) => [
                  modalStyles.warningButton,
                  styles.modalActionButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={[modalStyles.warningButtonText, styles.modalActionText]}>
                  Restart program
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCancelDelete}
                style={({ pressed }) => [
                  modalStyles.cancelButton,
                  styles.modalActionButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={[modalStyles.cancelButtonText, styles.modalActionText]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={modalStyles.message}>
              Are you sure you want to remove "{deleteModal.name}" from this program? This cannot be undone.
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
          </>
        )}
      </BaseModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    lineHeight: 22,
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  metaTagText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  creatorContainer: {
    marginBottom: Spacing.lg,
    gap: 4,
  },
  creatorText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  lastPerformedText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  progressText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  progressHistoryText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: Spacing.sm,
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
  },
  sectionCount: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  workoutsList: {
    gap: Spacing.md,
  },
  workoutSection: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  workoutSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  workoutSectionTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  workoutSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dayBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dayBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.success,
  },
  workoutSectionInfo: {
    flex: 1,
    gap: 2,
  },
  workoutSectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  workoutSectionSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  workoutExercises: {
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  modalActions: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  modalActionButton: {
    width: '100%',
    flex: 0,
  },
  modalActionText: {
    textAlign: 'center',
  },
});
