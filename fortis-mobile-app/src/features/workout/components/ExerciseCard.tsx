/**
 * ExerciseCard Component
 *
 * Displays an exercise within the workout logger with its sets table.
 * Handles adding/removing sets, notes, and exercise deletion.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { TrashIcon } from 'react-native-heroicons/outline';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

import { WorkoutExercise, WorkoutSet, SetType, RPE_COLORS } from '../../../types/workout';
import { SetRow } from './SetRow';
import { useWorkoutStore } from '../../../store/workoutStore';
import { Colors } from '../../../../constants/Colors';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  onRemove: () => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  onRemove,
}: ExerciseCardProps) {
  const [showSetTypeModal, setShowSetTypeModal] = useState<string | null>(null);
  const [showRpeModal, setShowRpeModal] = useState<string | null>(null);

  const {
    addSet,
    removeSet,
    updateSet,
    completeSet,
    updateSetType,
    updateExerciseNotes,
  } = useWorkoutStore();

  const handleAddSet = useCallback(() => {
    addSet(exercise.localId);
  }, [addSet, exercise.localId]);

  const handleRemoveSet = useCallback(
    (setLocalId: string) => {
      // If this is the only set, remove the entire exercise
      if (exercise.sets.length === 1) {
        onRemove();
      } else {
        removeSet(exercise.localId, setLocalId);
      }
    },
    [removeSet, exercise.localId, exercise.sets.length, onRemove]
  );

  const handleUpdateWeight = useCallback(
    (setLocalId: string, weight: number | null) => {
      updateSet(exercise.localId, setLocalId, { weight });
    },
    [updateSet, exercise.localId]
  );

  const handleUpdateReps = useCallback(
    (setLocalId: string, reps: number | null) => {
      updateSet(exercise.localId, setLocalId, { reps });
    },
    [updateSet, exercise.localId]
  );

  const handleUpdateRpe = useCallback(
    (setLocalId: string, rpe: 6 | 7 | 8 | 9 | 10 | null) => {
      updateSet(exercise.localId, setLocalId, { rpe });
      setShowRpeModal(null);
    },
    [updateSet, exercise.localId]
  );

  const handleCompleteSet = useCallback(
    (setLocalId: string) => {
      completeSet(exercise.localId, setLocalId);
    },
    [completeSet, exercise.localId]
  );

  const handleSetTypeChange = useCallback(
    (setLocalId: string, type: SetType) => {
      updateSetType(exercise.localId, setLocalId, type);
      setShowSetTypeModal(null);
    },
    [updateSetType, exercise.localId]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      updateExerciseNotes(exercise.localId, notes);
    },
    [updateExerciseNotes, exercise.localId]
  );

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={styles.container}
    >
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Pressable
          style={styles.deleteButton}
          onPress={onRemove}
          hitSlop={8}
        >
          <TrashIcon size={20} color="#b9bec7" />
        </Pressable>
      </View>

      {/* Notes Input */}
      <TextInput
        style={styles.notesInput}
        value={exercise.notes}
        onChangeText={handleNotesChange}
        placeholder="Add notes..."
        placeholderTextColor="#979ca6"
        multiline={false}
      />

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.setCell]}>Set</Text>
        <Text style={[styles.headerCell, styles.previousCell]}>Previous</Text>
        <Text style={[styles.headerCell, styles.inputCell]}>lbs</Text>
        <Text style={[styles.headerCell, styles.inputCell]}>Reps</Text>
        <Text style={[styles.headerCell, styles.rpeCell]}>RPE</Text>
        <View style={styles.checkCell} />
      </View>

      {/* Set Rows */}
      <View style={styles.setsContainer}>
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.localId}
            set={set}
            setIndex={index}
            previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
            onUpdateWeight={(weight) => handleUpdateWeight(set.localId, weight)}
            onUpdateReps={(reps) => handleUpdateReps(set.localId, reps)}
            onUpdateRpe={(rpe) => handleUpdateRpe(set.localId, rpe)}
            onComplete={() => handleCompleteSet(set.localId)}
            onRemove={() => handleRemoveSet(set.localId)}
            onSetTypePress={() => setShowSetTypeModal(set.localId)}
            onRpePress={() => setShowRpeModal(set.localId)}
          />
        ))}
      </View>

      {/* Add Set Button */}
      <Pressable style={styles.addSetButton} onPress={handleAddSet}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </Pressable>

      {/* Set Type Modal */}
      <Modal
        visible={showSetTypeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSetTypeModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSetTypeModal(null)}
        >
          <View style={styles.setTypeModalContent}>
            <Text style={styles.modalTitle}>Select Set Type</Text>
            {(['normal', 'warmup', 'failure', 'dropset'] as SetType[]).map(
              (type) => {
                const currentSet = exercise.sets.find(
                  (s) => s.localId === showSetTypeModal
                );
                const setIndex = exercise.sets.findIndex(
                  (s) => s.localId === showSetTypeModal
                );
                const config = {
                  normal: { label: `${setIndex + 1} Normal`, color: '#ffffff' },
                  warmup: { label: 'W Warm Up', color: '#eab308' },
                  failure: { label: 'F Failure', color: '#ef4444' },
                  dropset: { label: 'D Drop Set', color: '#3b82f6' },
                };

                return (
                  <Pressable
                    key={type}
                    style={styles.setTypeOption}
                    onPress={() =>
                      showSetTypeModal && handleSetTypeChange(showSetTypeModal, type)
                    }
                  >
                    <Text style={[styles.setTypeLabel, { color: config[type].color }]}>
                      {config[type].label}
                    </Text>
                  </Pressable>
                );
              }
            )}
            <View style={styles.modalDivider} />
            <Pressable
              style={styles.setTypeOption}
              onPress={() => {
                if (showSetTypeModal) {
                  handleRemoveSet(showSetTypeModal);
                  setShowSetTypeModal(null);
                }
              }}
            >
              <Text style={[styles.setTypeLabel, { color: '#ef4444' }]}>
                Remove Set
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* RPE Modal */}
      <Modal
        visible={showRpeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRpeModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRpeModal(null)}
        >
          <View style={styles.rpeModalContent}>
            <View style={styles.rpeButtonsRow}>
              {([6, 7, 8, 9, 10] as const).map((rpe) => (
                <Pressable
                  key={rpe}
                  style={[
                    styles.rpeOptionButton,
                    { backgroundColor: RPE_COLORS[rpe] },
                  ]}
                  onPress={() => showRpeModal && handleUpdateRpe(showRpeModal, rpe)}
                >
                  <Text style={styles.rpeOptionText}>{rpe}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#303030',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22c55e',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  notesInput: {
    fontSize: 14,
    color: '#b9bec7',
    paddingVertical: 4,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 14,
    color: '#DFE2E6',
    textAlign: 'center',
  },
  setCell: {
    width: 40,
  },
  previousCell: {
    width: 65,
  },
  inputCell: {
    flex: 1,
    minWidth: 55,
    maxWidth: 65,
  },
  rpeCell: {
    width: 50,
  },
  checkCell: {
    width: 32,
  },
  setsContainer: {
    gap: 8,
  },
  addSetButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setTypeModalContent: {
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DFE2E6',
    textAlign: 'center',
    marginBottom: 16,
  },
  setTypeOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  setTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  rpeModalContent: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rpeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rpeOptionButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
