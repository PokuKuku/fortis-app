import { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
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
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const activeSession = useWorkoutStore(s => s.activeSession);
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

  // Modal visibility states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimerSettingsModal, setShowTimerSettingsModal] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Replace exercise state
  const [replaceExerciseLocalId, setReplaceExerciseLocalId] = useState<string | null>(null);
  const [showReplaceConfirmModal, setShowReplaceConfirmModal] = useState(false);
  const [pendingReplaceExerciseLocalId, setPendingReplaceExerciseLocalId] = useState<string | null>(null);
  const isNavigating = useRef(false);

  // Initialize rest timer tick
  useRestTimerTick();

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
    router.push(`/exercise/${exerciseId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle close add exercise modal
  const handleCloseAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setReplaceExerciseLocalId(null);
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

    // Validate: must have a value (either typed or autofilled)
    if (finalValue === null) {
      setNumberPadError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Save the value
    updateSet(exerciseLocalId, setLocalId, { [inputType]: finalValue });

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
        <View style={styles.emptyLine} />
        <Text style={styles.emptyTitle}>No exercises yet</Text>
        <View style={styles.emptyLine} />
      </View>
      <Text style={styles.emptyDescription}>
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
    />
  );

  // Footer with action buttons
  const renderFooter = () => (
    <View style={styles.bottomActions}>
      <Pressable
        onPress={handleAddExercise}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.pressed
        ]}
      >
        <Text style={styles.addButtonText}>+ Add Exercise</Text>
      </Pressable>

      <GlassButton style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </GlassButton>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StainlessSteelPattern />

      {/* Drag Handle Indicator */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <WorkoutHeader
          onCancelPress={handleCancelPress}
          onTimerSettingsPress={() => setShowTimerSettingsModal(true)}
          onRestTimerPress={() => setShowRestTimerControls(true)}
        />

        {/* Exercise List */}
        <FlatList
          data={activeSession?.exercises || []}
          extraData={activeSession}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={handleCloseAddExerciseModal}
        replaceMode={replaceExerciseLocalId !== null}
        exerciseLocalIdToReplace={replaceExerciseLocalId ?? undefined}
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
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleConfirmFinish}
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
        visible={showRestTimerComplete}
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
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  emptyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  emptyLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(163, 163, 163, 0.3)',
  },
  emptyTitle: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothic',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyDescription: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomActions: {
    paddingTop: Spacing.lg,
    paddingBottom: 140,
    gap: Spacing.md,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothic',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finishButton: {
    height: 40,
    borderRadius: 16,
  },
  finishButtonText: {
    fontSize: 15,
    fontFamily: 'BankGothic',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
