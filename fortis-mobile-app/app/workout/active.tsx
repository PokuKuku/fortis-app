import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWorkoutStore, hasTemplateModifications } from '@/src/store/workoutStore';
import { useRestTimerTick } from '@/src/hooks/useRestTimerTick';
import { WorkoutHeader } from '@/src/components/workout/WorkoutHeader';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { RestTimerControls } from '@/src/components/workout/modals/RestTimerControls';
import { TimerSettingsModal } from '@/src/components/workout/modals/TimerSettingsModal';
import { CancelWorkoutModal } from '@/src/components/workout/modals/CancelWorkoutModal';
import { WorkoutCompleteModal } from '@/src/components/workout/modals/WorkoutCompleteModal';
import { FinishConfirmationModal } from '@/src/components/workout/modals/FinishConfirmationModal';
import { ReplaceExerciseConfirmModal } from '@/src/components/workout/modals/ReplaceExerciseConfirmModal';
import { RestTimerCompleteModal } from '@/src/components/workout/modals/RestTimerCompleteModal';
import { SaveAsTemplateModal } from '@/src/components/workout/modals/SaveAsTemplateModal';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { WorkoutSession } from '@/src/types/workout';
import { GlassButton } from '@/components/GlassButton';
import { getExerciseById } from '@/src/services/exerciseService';
import * as Haptics from 'expo-haptics';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const LIST_PADDING_TOP = scale(Spacing.lg);
const EMPTY_GAP = scale(Spacing.md);
const EMPTY_PADDING_BOTTOM = scale(100);
const EMPTY_TITLE_SIZE = moderateScale(14);
const EMPTY_DESCRIPTION_SIZE = moderateScale(14);
const BOTTOM_ACTIONS_PADDING_TOP = scale(Spacing.lg);
const BOTTOM_ACTIONS_PADDING_BOTTOM = scale(140);
const BOTTOM_ACTIONS_GAP = scale(Spacing.lg);
const ADD_BUTTON_PADDING_Y = scale(Spacing.lg);
const ADD_BUTTON_TEXT_SIZE = moderateScale(14);
const FINISH_BUTTON_HEIGHT = scale(44);
const FINISH_BUTTON_TEXT_SIZE = moderateScale(14);
const DRAG_HANDLE_WIDTH = scale(36);
const DRAG_HANDLE_HEIGHT = scale(4);
const DRAG_HANDLE_RADIUS = scale(2);
const NUMBER_PAD_PADDING = scale(380);

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const workoutStartTime = useWorkoutStore(s => s.workoutStartTime);
  const pausedElapsedSeconds = useWorkoutStore(s => s.pausedElapsedSeconds);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    emptyLine: {
      backgroundColor: isDark ? 'rgba(163, 163, 163, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    emptyTitle: { color: colors.textSecondary },
    emptyDescription: { color: colors.textTertiary },
    finishButtonText: { color: colors.white },
    addButton: { borderColor: colors.accentBorder },
    addButtonText: { color: colors.accent },
    finishButtonShadow: { shadowColor: colors.accent },
  };
  const cancelWorkout = useWorkoutStore(s => s.cancelWorkout);
  const finishWorkout = useWorkoutStore(s => s.finishWorkout);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);
  const updateSet = useWorkoutStore(s => s.updateSet);
  const closeNumberPad = useWorkoutStore(s => s.closeNumberPad);
  const openNumberPad = useWorkoutStore(s => s.openNumberPad);
  const completeSet = useWorkoutStore(s => s.completeSet);
  const setNumberPadError = useWorkoutStore(s => s.setNumberPadError);
  const showRestTimerComplete = useWorkoutStore(s => s.showRestTimerComplete);
  const dismissRestTimerComplete = useWorkoutStore(s => s.dismissRestTimerComplete);
  const updateCompletedWorkoutName = useWorkoutStore(s => s.updateCompletedWorkoutName);

  const handleDismiss = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onEnd((event) => {
      const shouldDismiss = event.translationY > 120 || event.velocityY > 1200;
      if (shouldDismiss) {
        runOnJS(handleDismiss)();
      }
    });

  // Modal visibility states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimerSettingsModal, setShowTimerSettingsModal] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addExerciseSuspended, setAddExerciseSuspended] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showRestTimerBanner, setShowRestTimerBanner] = useState(false);
  const [finishSnapshot, setFinishSnapshot] = useState<{
    durationSeconds: number;
    completedExercises: number;
  } | null>(null);

  // Replace exercise state
  const [replaceExerciseLocalId, setReplaceExerciseLocalId] = useState<string | null>(null);
  const [showReplaceConfirmModal, setShowReplaceConfirmModal] = useState(false);
  const [pendingReplaceExerciseLocalId, setPendingReplaceExerciseLocalId] = useState<string | null>(null);
  const isNavigating = useRef(false);

  const isBlockingModalOpen = showAddExerciseModal
    || showTimerSettingsModal
    || showRestTimerControls
    || showCancelModal
    || showFinishConfirmModal
    || showFinishModal
    || showReplaceConfirmModal
    || showSaveTemplateModal
    || activeNumberPad !== null;

  useEffect(() => {
    if (showRestTimerComplete && showAddExerciseModal) {
      setShowRestTimerBanner(true);
      dismissRestTimerComplete();
    }
  }, [showRestTimerComplete, showAddExerciseModal, dismissRestTimerComplete]);

  // Initialize rest timer tick
  useRestTimerTick();

  useFocusEffect(
    useCallback(() => {
      setAddExerciseSuspended(false);
      return undefined;
    }, [])
  );

  // Heatmap: Cache for exercise muscle data
  const [exerciseMuscleCache, setExerciseMuscleCache] = useState<
    Record<string, { primaryMuscles: string[]; secondaryMuscles: string[] }>
  >({});

  // Fetch muscle data for exercises when they change
  useEffect(() => {
    if (!activeSession?.exercises) return;

    const fetchMissingMuscles = async () => {
      const exerciseIds = activeSession.exercises.map(e => e.exerciseId);
      const missingIds = exerciseIds.filter(id => !exerciseMuscleCache[id]);

      if (missingIds.length === 0) return;

      const results = await Promise.all(
        missingIds.map(async id => {
          const exercise = await getExerciseById(id);
          return exercise
            ? { id, primaryMuscles: exercise.primaryMuscles, secondaryMuscles: exercise.secondaryMuscles }
            : null;
        })
      );

      const newCache: typeof exerciseMuscleCache = {};
      results.forEach(result => {
        if (result) {
          newCache[result.id] = {
            primaryMuscles: result.primaryMuscles,
            secondaryMuscles: result.secondaryMuscles,
          };
        }
      });

      if (Object.keys(newCache).length > 0) {
        setExerciseMuscleCache(prev => ({ ...prev, ...newCache }));
      }
    };

    fetchMissingMuscles();
  }, [activeSession?.exercises.map(e => e.exerciseId).join(',')]);

  // Compute muscle weights for heatmap (only completed sets)
  const muscleWeights = useMemo(() => {
    if (!activeSession?.exercises) return [];

    const exercisesWithCompletedSets = activeSession.exercises.filter(ex => ex.sets.some(s => s.isCompleted));

    return exercisesWithCompletedSets
      .map(ex => {
        const muscleData = exerciseMuscleCache[ex.exerciseId];
        const completedSets = ex.sets.filter(s => s.isCompleted).length;

        return {
          primaryMuscles: muscleData?.primaryMuscles || [],
          secondaryMuscles: muscleData?.secondaryMuscles || [],
          weight: completedSets,
        };
      })
      .filter(mw => mw.primaryMuscles.length > 0 || (mw.secondaryMuscles?.length || 0) > 0);
  }, [activeSession?.exercises, exerciseMuscleCache]);

  // Handle cancel workout
  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    cancelWorkout();
    setShowCancelModal(false);
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle add exercise
  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddExerciseSuspended(false);
    setShowAddExerciseModal(true);
  };

  // Handle replace exercise (opens AddExerciseModal in replace mode)
  const handleReplaceExercise = (exerciseLocalId: string) => {
    // Check if exercise has any completed sets
    const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
    const hasCompletedSets = exercise?.sets.some(set => set.isCompleted) ?? false;

    if (hasCompletedSets) {
      // Show confirmation modal first
      setPendingReplaceExerciseLocalId(exerciseLocalId);
      setShowReplaceConfirmModal(true);
    } else {
      // No completed sets, proceed directly
      setReplaceExerciseLocalId(exerciseLocalId);
      setShowAddExerciseModal(true);
    }
  };

  // Handle confirmed replace (after user confirms in modal)
  const handleConfirmReplace = () => {
    setShowReplaceConfirmModal(false);
    if (pendingReplaceExerciseLocalId) {
      setReplaceExerciseLocalId(pendingReplaceExerciseLocalId);
      setPendingReplaceExerciseLocalId(null);
      // Small delay to allow confirmation modal to close
      setTimeout(() => {
        setShowAddExerciseModal(true);
      }, 150);
    }
  };

  // Handle view exercise details
  const handleViewExerciseDetails = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}?source=workout-modal`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleModalExerciseDetails = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setAddExerciseSuspended(true);
    router.push(`/exercise/${exerciseId}?source=workout-modal`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle close add exercise modal
  const handleCloseAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setReplaceExerciseLocalId(null);
    setShowRestTimerBanner(false);
    setAddExerciseSuspended(false);
  };

  // Handle finish workout
  const handleFinishWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if there are no exercises or no completed sets
    const hasExercises = (activeSession?.exercises.length ?? 0) > 0;
    const hasCompletedSets = activeSession?.exercises.some(ex =>
      ex.sets.some(set => set.isCompleted)
    ) ?? false;

    if (!hasExercises || !hasCompletedSets) {
      // Show cancel modal instead if workout has no meaningful progress
      setShowCancelModal(true);
    } else {
      // Show confirmation modal first
      setShowFinishConfirmModal(true);
    }
  };

  // Handle confirmation to finish (shows celebration modal)
  const handleConfirmFinishStep = () => {
    setShowFinishConfirmModal(false);
    // Small delay to allow confirmation modal to close before showing celebration modal
    setTimeout(() => {
      const completedExercises = activeSession?.exercises.filter(exercise =>
        exercise.sets.some(set => set.isCompleted)
      ).length ?? 0;
      const durationSeconds = workoutStartTime
        ? Math.max(0, Math.floor((Date.now() - workoutStartTime) / 1000) + pausedElapsedSeconds)
        : Math.max(0, Math.floor(pausedElapsedSeconds));
      setFinishSnapshot({ durationSeconds, completedExercises });
      setShowFinishModal(true);
    }, 150);
  };

  // Handle timer settings save
  const handleSaveTimerSettings = (normal: number, warmup: number, dropset: number) => {
    updateRestTimerSettings({
      normalSeconds: normal,
      warmupSeconds: warmup,
      dropsetSeconds: dropset,
    });
  };

  // Handle confirm finish
  const handleConfirmFinish = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    await finishWorkout();
    setShowFinishModal(false);
    setFinishSnapshot(null);
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle save as template
  const handleSaveAsTemplate = () => {
    setShowFinishModal(false);
    setTimeout(() => {
      setShowSaveTemplateModal(true);
    }, 150);
  };

  // Handle template save success
  // Must update the completed workout name AFTER finishWorkout() moves it to completedSessions
  const handleTemplateSaveSuccess = async (templateName?: string) => {
    setShowSaveTemplateModal(false);

    // Capture localId BEFORE finishWorkout() clears activeSession
    const sessionLocalId = activeSession?.localId;

    // Finish the workout (this moves session to completedSessions)
    if (isNavigating.current) return;
    isNavigating.current = true;
    await finishWorkout();

    // NOW update the completed workout's name (session exists in completedSessions)
    if (templateName && sessionLocalId) {
      await updateCompletedWorkoutName(sessionLocalId, templateName);
    }

    setShowFinishModal(false);
    setFinishSnapshot(null);
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle number pad confirm - implements perpetuating keyboard flow with autofill
  const handleNumberPadConfirm = (value: number | null) => {
    if (!activeNumberPad) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;

    // If no value entered, try to autofill from previous set
    let finalValue = value;
    if (finalValue === null) {
      const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
      if (exercise) {
        const setIndex = exercise.sets.findIndex(s => s.localId === setLocalId);
        if (setIndex > 0) {
          const previousSet = exercise.sets[setIndex - 1];
          finalValue = previousSet[inputType];
        }
      }
    }

    // Allow empty weight to default to zero
    if (finalValue === null && inputType === 'weight') {
      finalValue = 0;
    }

    // Validate: reps still require a value (either typed or autofilled)
    if (finalValue === null) {
      setNumberPadError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Save the value (and default weight to 0 when logging reps)
    const updates: { weight?: number; reps?: number } = inputType === 'weight'
      ? { weight: finalValue }
      : { reps: finalValue };
    if (inputType === 'reps') {
      const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
      const setIndex = exercise?.sets.findIndex(s => s.localId === setLocalId) ?? -1;
      const set = setIndex >= 0 ? exercise?.sets[setIndex] : undefined;
      const previousSet = setIndex > 0 ? exercise?.sets[setIndex - 1] : undefined;
      if (set && set.weight === null && previousSet?.weight == null) {
        updates.weight = 0;
      }
    }
    updateSet(exerciseLocalId, setLocalId, updates);

    if (inputType === 'weight') {
      // Switch to reps input (keyboard stays open)
      openNumberPad(exerciseLocalId, setLocalId, 'reps');
    } else {
      // inputType === 'reps' → complete the set and close keyboard
      completeSet(exerciseLocalId, setLocalId);
      closeNumberPad();
    }
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyTitleRow}>
        <View style={[styles.emptyLine, themedStyles.emptyLine]} />
        <Text style={[styles.emptyTitle, themedStyles.emptyTitle]}>No exercises yet</Text>
        <View style={[styles.emptyLine, themedStyles.emptyLine]} />
      </View>
      <Text style={[styles.emptyDescription, themedStyles.emptyDescription]}>
        Tap below to get started
      </Text>
    </View>
  );

  // Exercise card renderer
  const renderExerciseCard = ({ item }: any) => (
    <ExerciseCard
      exerciseLocalId={item.localId}
      onReplace={handleReplaceExercise}
      onViewDetails={handleViewExerciseDetails}
      completedSetTint="success"
    />
  );

  // Footer with action buttons
  const renderFooter = () => (
    <View style={styles.bottomActions}>
      <Pressable
        onPress={handleAddExercise}
        style={({ pressed }) => [
          styles.addButton,
          themedStyles.addButton,
          pressed && styles.pressed
        ]}
      >
        <Text style={[styles.addButtonText, themedStyles.addButtonText]}>+ Add Exercise</Text>
      </Pressable>

      <GlassButton style={[styles.finishButton, themedStyles.finishButtonShadow]} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </GlassButton>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <GestureDetector gesture={panGesture}>
          <View>
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, themedStyles.dragHandle]} />
            </View>

            {/* Header */}
            <WorkoutHeader
              onCancelPress={handleCancelPress}
              onTimerSettingsPress={() => setShowTimerSettingsModal(true)}
              onRestTimerPress={() => setShowRestTimerControls(true)}
              muscleWeights={muscleWeights}
            />
          </View>
        </GestureDetector>

        {/* Exercise List */}
        <FlatList
          data={activeSession?.exercises || []}
          extraData={activeSession}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={[
            styles.listContent,
            activeNumberPad && { paddingBottom: NUMBER_PAD_PADDING }
          ]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={handleCloseAddExerciseModal}
        suspended={addExerciseSuspended}
        replaceMode={replaceExerciseLocalId !== null}
        exerciseLocalIdToReplace={replaceExerciseLocalId ?? undefined}
        showRestTimerBanner={showRestTimerBanner}
        onDismissRestTimerBanner={() => setShowRestTimerBanner(false)}
        onOpenExerciseDetails={handleModalExerciseDetails}
      />

      {/* Rest Timer Controls */}
      <RestTimerControls
        visible={showRestTimerControls}
        onClose={() => setShowRestTimerControls(false)}
      />

      {/* Timer Settings Modal */}
      <TimerSettingsModal
        visible={showTimerSettingsModal}
        onClose={() => setShowTimerSettingsModal(false)}
        onSave={handleSaveTimerSettings}
        initialNormalDuration={restTimerSettings.normalSeconds}
        initialWarmupDuration={restTimerSettings.warmupSeconds}
        initialDropDuration={restTimerSettings.dropsetSeconds}
      />

      {/* Cancel Workout Modal */}
      <CancelWorkoutModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* Finish Confirmation Modal */}
      <FinishConfirmationModal
        visible={showFinishConfirmModal}
        onClose={() => setShowFinishConfirmModal(false)}
        onConfirm={handleConfirmFinishStep}
      />

      {/* Replace Exercise Confirmation Modal */}
      <ReplaceExerciseConfirmModal
        visible={showReplaceConfirmModal}
        onClose={() => {
          setShowReplaceConfirmModal(false);
          setPendingReplaceExerciseLocalId(null);
        }}
        onConfirm={handleConfirmReplace}
      />

      {/* Workout Complete Modal */}
      <WorkoutCompleteModal
        visible={showFinishModal}
        onClose={() => {
          setShowFinishModal(false);
          setFinishSnapshot(null);
        }}
        onConfirm={handleConfirmFinish}
        onSaveAsTemplate={
          hasTemplateModifications(activeSession)
            ? handleSaveAsTemplate
            : undefined
        }
        saveTemplateLabel={
          activeSession?.programId
            ? 'Save as New Template'
            : undefined
        }
        session={activeSession}
        durationSecondsOverride={finishSnapshot?.durationSeconds}
        completedExercisesOverride={finishSnapshot?.completedExercises}
      />

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSuccess={handleTemplateSaveSuccess}
        session={activeSession}
      />

      {/* Number Pad */}
      <NumberPadModal
        visible={activeNumberPad !== null}
        onClose={closeNumberPad}
        onConfirm={handleNumberPadConfirm}
        inputType={activeNumberPad?.inputType ?? 'weight'}
      />

      {/* Rest Timer Complete Modal */}
      <RestTimerCompleteModal
        visible={showRestTimerComplete && !isBlockingModalOpen}
        onDismiss={dismissRestTimerComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: 0,
  },
  dragHandle: {
    width: DRAG_HANDLE_WIDTH,
    height: DRAG_HANDLE_HEIGHT,
    borderRadius: DRAG_HANDLE_RADIUS,
    backgroundColor: Colors.borderMedium,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: LIST_PADDING_TOP,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EMPTY_GAP,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: EMPTY_PADDING_BOTTOM,
  },
  emptyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EMPTY_GAP,
    width: '100%',
  },
  emptyLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(163, 163, 163, 0.3)',
  },
  emptyTitle: {
    fontSize: EMPTY_TITLE_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyDescription: {
    fontSize: EMPTY_DESCRIPTION_SIZE,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomActions: {
    paddingTop: BOTTOM_ACTIONS_PADDING_TOP,
    paddingBottom: BOTTOM_ACTIONS_PADDING_BOTTOM,
    gap: BOTTOM_ACTIONS_GAP,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ADD_BUTTON_PADDING_Y,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: ADD_BUTTON_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  finishButton: {
    height: FINISH_BUTTON_HEIGHT,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButtonText: {
    fontSize: FINISH_BUTTON_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
