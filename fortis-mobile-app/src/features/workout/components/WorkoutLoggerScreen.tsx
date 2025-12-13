/**
 * WorkoutLoggerScreen Component
 *
 * Main container for the active workout session.
 * Coordinates all sub-components and modals.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useWorkoutStore, getWorkoutSummary, hasIncompleteSets } from '../../../store/workoutStore';
import { WorkoutExercise, WorkoutSummary } from '../../../types/workout';
import { WorkoutHeader } from './WorkoutHeader';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from '../modals/AddExerciseModal';
import { CancelWorkoutModal } from '../modals/CancelWorkoutModal';
import { RestTimerModal } from '../modals/RestTimerModal';
import { IncompleteSetsModal } from '../modals/IncompleteSetsModal';
import { WorkoutCompleteModal } from '../modals/WorkoutCompleteModal';
import { TimeUpModal } from '../modals/TimeUpModal';
import { RestTimerControls } from './RestTimerControls';

interface WorkoutLoggerScreenProps {
  onClose: () => void;
}

export function WorkoutLoggerScreen({ onClose }: WorkoutLoggerScreenProps) {
  const insets = useSafeAreaInsets();

  // Modal states
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [showIncompleteSets, setShowIncompleteSets] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);

  const {
    activeSession,
    restTimer,
    removeExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  // Watch for rest timer completion
  useEffect(() => {
    if (restTimer.remainingSeconds === 0 && restTimer.totalSeconds > 0 && !restTimer.isActive) {
      // Timer just completed
      setShowTimeUp(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [restTimer.remainingSeconds, restTimer.totalSeconds, restTimer.isActive]);

  const handleRemoveExercise = useCallback(
    (localId: string) => {
      removeExercise(localId);
    },
    [removeExercise]
  );

  const handleFinishWorkout = useCallback(() => {
    if (!activeSession) return;

    // Check if any exercises exist
    if (activeSession.exercises.length === 0) {
      setShowCancelModal(true);
      return;
    }

    // Check for completed sets
    const summary = getWorkoutSummary(activeSession);
    if (summary.totalSets === 0) {
      setShowCancelModal(true);
      return;
    }

    // Check for incomplete sets
    if (hasIncompleteSets(activeSession)) {
      setShowIncompleteSets(true);
      return;
    }

    // All sets complete - show completion modal
    setWorkoutSummary(summary);
    setShowWorkoutComplete(true);
  }, [activeSession]);

  const handleConfirmComplete = useCallback(async () => {
    await finishWorkout();
    setShowWorkoutComplete(false);
    onClose();
  }, [finishWorkout, onClose]);

  const handleCancelWorkout = useCallback(() => {
    cancelWorkout();
    setShowCancelModal(false);
    onClose();
  }, [cancelWorkout, onClose]);

  const handleDiscardIncomplete = useCallback(async () => {
    // Finish anyway with current sets
    const summary = getWorkoutSummary(activeSession);
    setWorkoutSummary(summary);
    setShowIncompleteSets(false);
    setShowWorkoutComplete(true);
  }, [activeSession]);

  const renderExercise = useCallback(
    ({ item, index }: { item: WorkoutExercise; index: number }) => (
      <ExerciseCard
        exercise={item}
        exerciseIndex={index}
        onRemove={() => handleRemoveExercise(item.localId)}
      />
    ),
    [handleRemoveExercise]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Dumbbell size={64} color="#818692" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No exercises added yet</Text>
      <Text style={styles.emptySubtitle}>Tap the button below to get started</Text>
    </View>
  );

  if (!activeSession) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <WorkoutHeader
        onTimerSettingsPress={() => setShowRestTimerModal(true)}
        onCancelPress={() => setShowCancelModal(true)}
        onRestTimerPress={() => setShowRestTimerControls(true)}
      />

      {/* Exercise List */}
      <FlatList
        data={activeSession.exercises}
        keyExtractor={(item) => item.localId}
        renderItem={renderExercise}
        contentContainerStyle={[
          styles.listContent,
          activeSession.exercises.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Buttons */}
      <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={styles.addExerciseButton}
          onPress={() => setShowAddExercise(true)}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </Pressable>

        <Pressable
          style={styles.finishButton}
          onPress={handleFinishWorkout}
        >
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </Pressable>
      </View>

      {/* Rest Timer Controls (overlay when timer is active) */}
      <RestTimerControls
        visible={showRestTimerControls}
        onClose={() => setShowRestTimerControls(false)}
      />

      {/* Modals */}
      <AddExerciseModal
        visible={showAddExercise}
        onClose={() => setShowAddExercise(false)}
      />

      <CancelWorkoutModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelWorkout}
      />

      <RestTimerModal
        visible={showRestTimerModal}
        onClose={() => setShowRestTimerModal(false)}
      />

      <IncompleteSetsModal
        visible={showIncompleteSets}
        onClose={() => setShowIncompleteSets(false)}
        onDiscard={handleDiscardIncomplete}
      />

      <WorkoutCompleteModal
        visible={showWorkoutComplete}
        summary={workoutSummary}
        onClose={() => setShowWorkoutComplete(false)}
        onConfirm={handleConfirmComplete}
      />

      <TimeUpModal
        visible={showTimeUp}
        onClose={() => setShowTimeUp(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  listContent: {
    padding: 16,
    paddingBottom: 200,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#b9bec7',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#b9bec7',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addExerciseButton: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  finishButton: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
