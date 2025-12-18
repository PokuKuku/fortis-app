/**
 * AI Mutation Preview Modal
 *
 * Shows a preview of AI-proposed changes and allows user to confirm or reject.
 * For LOG_WORKOUT intent, provides editable workout preview with inline editing.
 * For other intents, displays exercise resolutions with justifications.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import {
  X,
  Check,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  ChevronDown,
  Dumbbell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '../../../constants/Sizes';
import { Typography } from '../../../constants/Typography';
import { StainlessSteelPattern } from '../../../components/StainlessSteelPattern';
import { GlassButton } from '../../../components/GlassButton';
import { useAIStore } from '../../store/aiStore';
import { AIMutation, AIExerciseResolution, EditableExercise, EditableWorkoutSet } from '../../types/ai';

interface AIMutationPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const OPERATION_ICONS = {
  INSERT: Plus,
  UPDATE: Edit2,
  DELETE: Trash2,
};

const OPERATION_COLORS = {
  INSERT: Colors.success,
  UPDATE: Colors.warning,
  DELETE: Colors.error,
};

export function AIMutationPreviewModal({
  visible,
  onClose,
  onConfirm,
}: AIMutationPreviewModalProps) {
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const isApplyingMutation = useAIStore((state) => state.isApplyingMutation);
  const applyCurrentMutationPlan = useAIStore((state) => state.applyCurrentMutationPlan);
  const setCurrentMutationPlan = useAIStore((state) => state.setCurrentMutationPlan);

  // Editable workout state and actions
  const editableWorkout = useAIStore((state) => state.editableWorkout);
  const initEditableWorkout = useAIStore((state) => state.initEditableWorkout);
  const updateSet = useAIStore((state) => state.updateSet);
  const deleteSet = useAIStore((state) => state.deleteSet);
  const addSet = useAIStore((state) => state.addSet);
  const deleteExercise = useAIStore((state) => state.deleteExercise);
  const applyEditableWorkout = useAIStore((state) => state.applyEditableWorkout);
  const clearEditableWorkout = useAIStore((state) => state.clearEditableWorkout);

  // Exercise picker state
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Check if this is a LOG_WORKOUT mutation
  const isLogWorkout = currentMutationPlan?.intent === 'LOG_WORKOUT';

  // Initialize editable workout when modal opens with LOG_WORKOUT plan
  useEffect(() => {
    if (visible && currentMutationPlan && isLogWorkout && !editableWorkout) {
      initEditableWorkout(currentMutationPlan);
    }
  }, [visible, currentMutationPlan, isLogWorkout, editableWorkout, initEditableWorkout]);

  if (!currentMutationPlan) return null;

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    let success: boolean;
    if (isLogWorkout && editableWorkout) {
      // Use edited workout for LOG_WORKOUT
      success = await applyEditableWorkout();
    } else {
      // Use original plan for other intents
      success = await applyCurrentMutationPlan();
    }

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      onConfirm();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    }
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    clearEditableWorkout();
    setCurrentMutationPlan(null);
    onClose();
  };

  const handleClose = () => {
    clearEditableWorkout();
    onClose();
  };

  const handleOpenExercisePicker = (exerciseLocalId: string) => {
    setSelectedExerciseId(exerciseLocalId);
    setExercisePickerVisible(true);
  };

  const newExercises = currentMutationPlan.exerciseResolution.filter(
    (e) => !e.fromHistory
  );

  // Render editable workout view for LOG_WORKOUT
  const renderEditableWorkout = () => {
    if (!editableWorkout) return null;

    return (
      <View style={styles.editableContainer}>
        {editableWorkout.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            {/* Exercise Header */}
            <View style={styles.exerciseHeader}>
              <TouchableOpacity
                style={styles.exerciseNameButton}
                onPress={() => handleOpenExercisePicker(exercise.id)}
              >
                <Dumbbell color={Colors.success} size={IconSizes.sm} />
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {exercise.exerciseName}
                </Text>
                <ChevronDown color={Colors.textSecondary} size={IconSizes.sm} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteExerciseButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  deleteExercise(exercise.id);
                }}
              >
                <Trash2 color={Colors.error} size={IconSizes.sm} />
              </TouchableOpacity>
            </View>

            {/* Set Table Header */}
            <View style={styles.setTableHeader}>
              <Text style={[styles.setHeaderText, styles.setColumn]}>Set</Text>
              <Text style={[styles.setHeaderText, styles.repsColumn]}>Reps</Text>
              <Text style={[styles.setHeaderText, styles.weightColumn]}>Weight</Text>
              <View style={styles.deleteColumn} />
            </View>

            {/* Set Rows */}
            {exercise.sets.map((set, setIndex) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setText, styles.setColumn]}>{setIndex + 1}</Text>
                <TextInput
                  style={[styles.setInput, styles.repsColumn]}
                  value={set.reps > 0 ? String(set.reps) : ''}
                  onChangeText={(text) => {
                    const reps = parseInt(text, 10);
                    updateSet(exercise.id, set.id, { reps: isNaN(reps) ? 0 : reps });
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  selectTextOnFocus
                />
                <TextInput
                  style={[styles.setInput, styles.weightColumn]}
                  value={set.weight > 0 ? String(set.weight) : ''}
                  onChangeText={(text) => {
                    const weight = parseFloat(text);
                    updateSet(exercise.id, set.id, { weight: isNaN(weight) ? 0 : weight });
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.deleteColumn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                    deleteSet(exercise.id, set.id);
                  }}
                >
                  <Trash2 color={Colors.textTertiary} size={IconSizes.xs} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                addSet(exercise.id);
              }}
            >
              <Plus color={Colors.textSecondary} size={IconSizes.sm} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => {
            setSelectedExerciseId(null);
            setExercisePickerVisible(true);
          }}
        >
          <Plus color={Colors.success} size={IconSizes.md} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render generic mutation view for other intents
  const renderMutation = (mutation: AIMutation, index: number) => {
    const Icon = OPERATION_ICONS[mutation.operation];
    const color = OPERATION_COLORS[mutation.operation];

    return (
      <View key={mutation.mutationId} style={styles.mutationItem}>
        <View style={[styles.mutationIcon, { backgroundColor: `${color}20` }]}>
          <Icon color={color} size={IconSizes.sm} />
        </View>
        <View style={styles.mutationContent}>
          <Text style={styles.mutationDescription}>{mutation.description}</Text>
          <Text style={styles.mutationMeta}>
            {mutation.operation} {mutation.entityType.replace('_', ' ')}
          </Text>
        </View>
      </View>
    );
  };

  const renderExerciseResolution = (exercise: AIExerciseResolution) => {
    if (exercise.fromHistory) return null;

    return (
      <View key={exercise.exerciseId} style={styles.newExercise}>
        <View style={styles.newExerciseHeader}>
          <AlertTriangle color={Colors.warning} size={IconSizes.sm} />
          <Text style={styles.newExerciseTitle}>New: {exercise.exerciseName}</Text>
        </View>
        {exercise.justification && (
          <Text style={styles.newExerciseJustification}>
            {exercise.justification}
          </Text>
        )}
        {exercise.explanation && (
          <View style={styles.newExerciseExplanation}>
            <Info color={Colors.textTertiary} size={12} />
            <Text style={styles.newExerciseExplanationText}>
              {exercise.explanation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Calculate total sets for summary
  const totalSets = editableWorkout?.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  ) ?? currentMutationPlan.mutations.filter((m) => m.entityType === 'workout_set').length;

  const totalExercises = editableWorkout?.exercises.length ??
    new Set(currentMutationPlan.mutations
      .filter((m) => m.entityType === 'workout_set')
      .map((m) => (m.proposedState as Record<string, unknown>)?.exercise_id)
    ).size;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
          <Animated.View
            entering={ZoomIn.duration(250)}
            exiting={ZoomOut.duration(200)}
            style={styles.modalContainer}
          >
            <StainlessSteelPattern />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Sparkles color={Colors.success} size={IconSizes.lg} />
              </View>
              <Text style={styles.headerTitle}>
                {isLogWorkout ? 'Review Workout' : 'Review Changes'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X color={Colors.textSecondary} size={IconSizes.md} />
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>
                {isLogWorkout
                  ? `${totalExercises} exercises • ${totalSets} sets`
                  : currentMutationPlan.summary
                }
              </Text>
              <Text style={styles.summaryExplanation}>
                {isLogWorkout
                  ? 'Review and edit the extracted workout before saving'
                  : currentMutationPlan.explanation
                }
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isLogWorkout ? (
                renderEditableWorkout()
              ) : (
                <>
                  {/* New Exercises Warning */}
                  {newExercises.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        New Exercises ({newExercises.length})
                      </Text>
                      {currentMutationPlan.exerciseResolution.map(
                        renderExerciseResolution
                      )}
                    </View>
                  )}

                  {/* Mutations */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Changes ({currentMutationPlan.mutations.length})
                    </Text>
                    {currentMutationPlan.mutations.map(renderMutation)}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleReject}
                disabled={isApplyingMutation}
              >
                <X color={Colors.textSecondary} size={IconSizes.md} />
                <Text style={styles.rejectButtonText}>Cancel</Text>
              </TouchableOpacity>

              <GlassButton
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={isApplyingMutation}
              >
                {isApplyingMutation ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Check color={Colors.white} size={IconSizes.md} />
                    <Text style={styles.confirmButtonText}>
                      {isLogWorkout ? 'Save Workout' : 'Apply Changes'}
                    </Text>
                  </>
                )}
              </GlassButton>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onSelect={(exerciseId, exerciseName) => {
          if (selectedExerciseId) {
            // Updating existing exercise
            const { updateExerciseName } = useAIStore.getState();
            updateExerciseName(selectedExerciseId, exerciseId, exerciseName);
          } else {
            // Adding new exercise
            const { addExercise } = useAIStore.getState();
            addExercise(exerciseId, exerciseName);
          }
          setExercisePickerVisible(false);
        }}
      />
    </Modal>
  );
}

// Simple Exercise Picker Modal
interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string, exerciseName: string) => void;
}

function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Common exercises for quick selection
  const commonExercises = [
    { id: 'bench-press', name: 'Bench Press' },
    { id: 'squat', name: 'Squat' },
    { id: 'deadlift', name: 'Deadlift' },
    { id: 'overhead-press', name: 'Overhead Press' },
    { id: 'barbell-row', name: 'Barbell Row' },
    { id: 'pull-up', name: 'Pull-up' },
    { id: 'dumbbell-curl', name: 'Dumbbell Curl' },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown' },
    { id: 'leg-press', name: 'Leg Press' },
    { id: 'lat-pulldown', name: 'Lat Pulldown' },
    { id: 'incline-bench-press', name: 'Incline Bench Press' },
    { id: 'romanian-deadlift', name: 'Romanian Deadlift' },
    { id: 'leg-curl', name: 'Leg Curl' },
    { id: 'leg-extension', name: 'Leg Extension' },
    { id: 'cable-fly', name: 'Cable Fly' },
    { id: 'face-pull', name: 'Face Pull' },
  ];

  const filteredExercises = searchQuery
    ? commonExercises.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commonExercises;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(100)}
        style={styles.pickerOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          entering={ZoomIn.duration(200)}
          exiting={ZoomOut.duration(150)}
          style={styles.pickerContainer}
        >
          <StainlessSteelPattern />

          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Exercise</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={Colors.textSecondary} size={IconSizes.md} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView
            style={styles.exerciseList}
            contentContainerStyle={styles.exerciseListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  onSelect(exercise.id, exercise.name);
                  setSearchQuery('');
                }}
              >
                <Dumbbell color={Colors.textSecondary} size={IconSizes.sm} />
                <Text style={styles.exerciseOptionText}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
            {filteredExercises.length === 0 && (
              <Text style={styles.noResultsText}>No exercises found</Text>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  summary: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryTitle: {
    ...Typography.h5,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  summaryExplanation: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  mutationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  mutationIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutationContent: {
    flex: 1,
  },
  mutationDescription: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  mutationMeta: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  newExercise: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: Spacing.md,
  },
  newExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  newExerciseTitle: {
    ...Typography.label,
    color: Colors.warning,
  },
  newExerciseJustification: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  newExerciseExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  newExerciseExplanationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: Spacing.md,
  },
  rejectButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.white,
  },

  // Editable workout styles
  editableContainer: {
    gap: Spacing.lg,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: Spacing.sm,
  },
  exerciseNameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseName: {
    ...Typography.label,
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteExerciseButton: {
    padding: Spacing.xs,
  },
  setTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  setHeaderText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  setColumn: {
    width: 36,
    textAlign: 'center',
  },
  repsColumn: {
    flex: 1,
    textAlign: 'center',
  },
  weightColumn: {
    flex: 1.5,
    textAlign: 'center',
  },
  deleteColumn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  setText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  setInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    textAlign: 'center',
    marginHorizontal: Spacing.xs,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  addSetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
  },
  addExerciseText: {
    ...Typography.button,
    color: Colors.success,
  },

  // Exercise Picker Modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: Spacing.sm,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  exerciseOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});

export default AIMutationPreviewModal;
