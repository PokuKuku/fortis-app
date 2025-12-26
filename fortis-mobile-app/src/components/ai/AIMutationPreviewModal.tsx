/**
 * AI Mutation Preview Modal
 *
 * Shows a preview of AI-proposed changes and allows user to confirm or reject.
 * For LOG_WORKOUT intent, provides editable workout preview with inline editing.
 * For other intents, displays exercise resolutions with justifications.
 */

import React, { useEffect, useMemo, useState } from 'react';
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
import {
  AIMutation,
  AIExerciseResolution,
  EditableExercise,
  EditableWorkoutSet,
  EditableProgramWorkout,
} from '../../types/ai';
import { buildProgramDraftFromPlan } from '../../utils/aiProgramDraft';
import { useExercises } from '../../hooks/useExercises';

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

  // Editable program draft state and actions
  const editableProgramDraft = useAIStore((state) => state.editableProgramDraft);
  const initEditableProgramDraft = useAIStore((state) => state.initEditableProgramDraft);
  const updateProgramDraft = useAIStore((state) => state.updateProgramDraft);
  const updateProgramWorkout = useAIStore((state) => state.updateProgramWorkout);
  const updateProgramExercise = useAIStore((state) => state.updateProgramExercise);
  const deleteProgramExercise = useAIStore((state) => state.deleteProgramExercise);
  const applyEditableProgramDraft = useAIStore((state) => state.applyEditableProgramDraft);
  const clearEditableProgramDraft = useAIStore((state) => state.clearEditableProgramDraft);
  const error = useAIStore((state) => state.error);
  const clearError = useAIStore((state) => state.clearError);

  // Exercise picker state
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedProgramExercise, setSelectedProgramExercise] = useState<{
    workoutId: string;
    exerciseId: string;
  } | null>(null);

  // Check if this is a LOG_WORKOUT mutation
  const isLogWorkout = currentMutationPlan?.intent === 'LOG_WORKOUT';
  const isProgramDraft =
    currentMutationPlan?.intent === 'CREATE_PROGRAM' ||
    currentMutationPlan?.intent === 'CREATE_TEMPLATE';
  const isGoalUpdate = currentMutationPlan?.intent === 'UPDATE_GOALS';

  // Initialize editable workout when modal opens with LOG_WORKOUT plan
  useEffect(() => {
    if (visible && currentMutationPlan && isLogWorkout && !editableWorkout) {
      initEditableWorkout(currentMutationPlan);
    }
  }, [visible, currentMutationPlan, isLogWorkout, editableWorkout, initEditableWorkout]);

  useEffect(() => {
    if (visible && currentMutationPlan && isProgramDraft && !editableProgramDraft) {
      initEditableProgramDraft(currentMutationPlan);
    }
  }, [visible, currentMutationPlan, isProgramDraft, editableProgramDraft, initEditableProgramDraft]);

  const originalProgramDraft = useMemo(() => {
    if (!currentMutationPlan || !isProgramDraft) return null;
    return buildProgramDraftFromPlan(currentMutationPlan);
  }, [currentMutationPlan, isProgramDraft]);

  if (!currentMutationPlan) return null;

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    let success: boolean;
    if (isLogWorkout && editableWorkout) {
      // Use edited workout for LOG_WORKOUT
      success = await applyEditableWorkout();
    } else if (isProgramDraft && editableProgramDraft) {
      // Use edited draft for CREATE_PROGRAM / CREATE_TEMPLATE
      success = await applyEditableProgramDraft();
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
    clearEditableProgramDraft();
    clearError();
    setCurrentMutationPlan(null);
    onClose();
  };

  const handleClose = () => {
    clearEditableWorkout();
    clearEditableProgramDraft();
    clearError();
    onClose();
  };

  const handleOpenExercisePicker = (exerciseLocalId: string) => {
    setSelectedProgramExercise(null);
    setSelectedExerciseId(exerciseLocalId);
    setExercisePickerVisible(true);
  };

  const handleOpenProgramExercisePicker = (workoutId: string, exerciseId: string) => {
    setSelectedExerciseId(null);
    setSelectedProgramExercise({ workoutId, exerciseId });
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

  const formatDiffValue = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' && value.trim().length === 0) return '—';
    return String(value);
  };

  const isValidUUID = (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  const renderProgramDraft = () => {
    if (!editableProgramDraft) return null;

    const originalWorkoutById = new Map<string, EditableProgramWorkout>();
    originalProgramDraft?.workouts.forEach((workout) => {
      originalWorkoutById.set(workout.id, workout);
    });

    const getOriginalExercise = (workoutId: string, exerciseId: string) => {
      const workout = originalWorkoutById.get(workoutId);
      return workout?.exercises.find((exercise) => exercise.id === exerciseId);
    };

    const newExerciseMap = new Map<string, AIExerciseResolution>();
    currentMutationPlan.exerciseResolution.forEach((resolution) => {
      if (!resolution.fromHistory) {
        newExerciseMap.set(resolution.exerciseId, resolution);
      }
    });

    return (
      <View style={styles.programDraftContainer}>
        {/* Program Metadata */}
        <View style={styles.programMetaCard}>
          <Text style={styles.inputLabel}>
            {editableProgramDraft.isTemplate ? 'Template name' : 'Program name'}
          </Text>
          <TextInput
            style={styles.metaInput}
            value={editableProgramDraft.name}
            onChangeText={(text) => updateProgramDraft({ name: text })}
            placeholder={editableProgramDraft.isTemplate ? 'Upper Body Template' : 'Strength Block'}
            placeholderTextColor={Colors.textTertiary}
          />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.metaInput, styles.metaTextarea]}
            value={editableProgramDraft.description || ''}
            onChangeText={(text) => updateProgramDraft({ description: text })}
            placeholder="Short summary of the focus and intent"
            placeholderTextColor={Colors.textTertiary}
            multiline
          />
          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <TextInput
                style={styles.metaInput}
                value={editableProgramDraft.difficulty}
                onChangeText={(text) => updateProgramDraft({ difficulty: text })}
                placeholder="beginner | intermediate | advanced"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.metaField}>
              <Text style={styles.inputLabel}>Weeks</Text>
              <TextInput
                style={styles.metaInput}
                value={editableProgramDraft.durationWeeks ? String(editableProgramDraft.durationWeeks) : ''}
                onChangeText={(text) => {
                  const weeks = parseInt(text, 10);
                  updateProgramDraft({ durationWeeks: Number.isNaN(weeks) ? undefined : weeks });
                }}
                placeholder="8"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Text style={styles.inputLabel}>Goal</Text>
          <TextInput
            style={styles.metaInput}
            value={editableProgramDraft.goal || ''}
            onChangeText={(text) => updateProgramDraft({ goal: text })}
            placeholder="strength | hypertrophy | powerlifting | general_fitness"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
          />
        </View>

        {/* Workouts */}
        {editableProgramDraft.workouts.map((workout) => {
          const originalWorkout = originalWorkoutById.get(workout.id);

          return (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <TextInput
                  style={styles.workoutNameInput}
                  value={workout.name}
                  onChangeText={(text) => updateProgramWorkout(workout.id, { name: text })}
                  placeholder="Workout name"
                  placeholderTextColor={Colors.textTertiary}
                />
                <View style={styles.workoutDayContainer}>
                  <Text style={styles.workoutDayLabel}>Day</Text>
                  <TextInput
                    style={styles.workoutDayInput}
                    value={String(workout.dayNumber)}
                    onChangeText={(text) => {
                      const dayNumber = parseInt(text, 10);
                      updateProgramWorkout(workout.id, {
                        dayNumber: Number.isNaN(dayNumber) ? workout.dayNumber : dayNumber,
                      });
                    }}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {originalWorkout && originalWorkout.name !== workout.name && (
                <Text style={styles.diffHint}>Was: {originalWorkout.name}</Text>
              )}

              {/* Exercises */}
              <View style={styles.exerciseList}>
                {workout.exercises.map((exercise) => {
                  const originalExercise = getOriginalExercise(workout.id, exercise.id);
                  const setsChanged =
                    originalExercise && originalExercise.sets !== exercise.sets;
                  const repsChanged =
                    originalExercise && originalExercise.reps !== exercise.reps;
                  const restChanged =
                    originalExercise && originalExercise.restSeconds !== exercise.restSeconds;
                  const notesChanged =
                    originalExercise && originalExercise.notes !== exercise.notes;

                  return (
                    <View key={exercise.id} style={styles.programExerciseCard}>
                      <View style={styles.programExerciseHeader}>
                        <TouchableOpacity
                          style={styles.programExerciseNameButton}
                          onPress={() => handleOpenProgramExercisePicker(workout.id, exercise.id)}
                        >
                          <Text style={styles.programExerciseName} numberOfLines={1}>
                            {exercise.exerciseName || 'Select exercise'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteExerciseButton}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                            deleteProgramExercise(workout.id, exercise.id);
                          }}
                        >
                          <Trash2 color={Colors.error} size={IconSizes.sm} />
                        </TouchableOpacity>
                      </View>

                      {!isValidUUID(exercise.exerciseId) && (
                        <View style={styles.invalidExerciseBadge}>
                          <AlertTriangle color={Colors.warning} size={12} />
                          <Text style={styles.invalidExerciseText}>Select a valid exercise</Text>
                        </View>
                      )}

                      {newExerciseMap.has(exercise.exerciseId) && (
                        <View style={styles.newExerciseInline}>
                          <AlertTriangle color={Colors.warning} size={12} />
                          <Text style={styles.newExerciseInlineText}>
                            New to you
                          </Text>
                        </View>
                      )}

                      <View style={styles.exerciseFieldRow}>
                        <View style={styles.exerciseField}>
                          <Text style={styles.exerciseFieldLabel}>Sets</Text>
                          <TextInput
                            style={styles.exerciseFieldInput}
                            value={String(exercise.sets)}
                            onChangeText={(text) => {
                              const sets = parseInt(text, 10);
                              updateProgramExercise(workout.id, exercise.id, {
                                sets: Number.isNaN(sets) ? 0 : sets,
                              });
                            }}
                            keyboardType="number-pad"
                          />
                          {setsChanged && (
                            <Text style={styles.diffHint}>
                              Was: {formatDiffValue(originalExercise?.sets)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.exerciseField}>
                          <Text style={styles.exerciseFieldLabel}>Reps</Text>
                          <TextInput
                            style={styles.exerciseFieldInput}
                            value={exercise.reps || ''}
                            onChangeText={(text) =>
                              updateProgramExercise(workout.id, exercise.id, { reps: text })
                            }
                            placeholder="8-12"
                            placeholderTextColor={Colors.textTertiary}
                          />
                          {repsChanged && (
                            <Text style={styles.diffHint}>
                              Was: {formatDiffValue(originalExercise?.reps)}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.exerciseFieldRow}>
                        <View style={styles.exerciseField}>
                          <Text style={styles.exerciseFieldLabel}>Rest (sec)</Text>
                          <TextInput
                            style={styles.exerciseFieldInput}
                            value={
                              exercise.restSeconds === undefined ? '' : String(exercise.restSeconds)
                            }
                            onChangeText={(text) => {
                              const rest = parseInt(text, 10);
                              updateProgramExercise(workout.id, exercise.id, {
                                restSeconds: Number.isNaN(rest) ? undefined : rest,
                              });
                            }}
                            keyboardType="number-pad"
                          />
                          {restChanged && (
                            <Text style={styles.diffHint}>
                              Was: {formatDiffValue(originalExercise?.restSeconds)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.exerciseField}>
                          <Text style={styles.exerciseFieldLabel}>Notes</Text>
                          <TextInput
                            style={styles.exerciseFieldInput}
                            value={exercise.notes || ''}
                            onChangeText={(text) =>
                              updateProgramExercise(workout.id, exercise.id, { notes: text })
                            }
                            placeholder="Optional"
                            placeholderTextColor={Colors.textTertiary}
                          />
                          {notesChanged && (
                            <Text style={styles.diffHint}>
                              Was: {formatDiffValue(originalExercise?.notes)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {newExerciseMap.has(exercise.exerciseId) && (
                        <View style={styles.newExerciseNotes}>
                          {newExerciseMap.get(exercise.exerciseId)?.justification && (
                            <Text style={styles.newExerciseJustification}>
                              {newExerciseMap.get(exercise.exerciseId)?.justification}
                            </Text>
                          )}
                          {newExerciseMap.get(exercise.exerciseId)?.explanation && (
                            <View style={styles.newExerciseExplanation}>
                              <Info color={Colors.textTertiary} size={12} />
                              <Text style={styles.newExerciseExplanationText}>
                                {newExerciseMap.get(exercise.exerciseId)?.explanation}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
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

  const totalSets = editableWorkout?.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  ) ??
    editableProgramDraft?.workouts.reduce(
      (sum, workout) => sum + workout.exercises.reduce((acc, ex) => acc + ex.sets, 0),
      0
    ) ??
    currentMutationPlan.mutations.filter((m) => m.entityType === 'workout_set').length;

  const totalExercises = editableWorkout?.exercises.length ??
    editableProgramDraft?.workouts.reduce((sum, workout) => sum + workout.exercises.length, 0) ??
    new Set(currentMutationPlan.mutations
      .filter((m) => m.entityType === 'workout_set')
      .map((m) => (m.proposedState as Record<string, unknown>)?.exercise_id)
    ).size;

  const totalWorkouts = editableProgramDraft?.workouts.length ?? 0;
  const draftLabel = editableProgramDraft?.isTemplate ? 'Template' : 'Program';
  const confirmLabel = isLogWorkout
    ? 'Save Workout'
    : isProgramDraft
    ? `Create ${draftLabel}`
    : isGoalUpdate
    ? 'Update Goals'
    : 'Apply Changes';

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
                {isLogWorkout
                  ? 'Review Workout'
                  : isProgramDraft
                  ? `Review ${draftLabel}`
                  : 'Review Changes'}
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
                  : isProgramDraft
                  ? `${totalWorkouts || 1} workouts • ${totalExercises} exercises`
                  : currentMutationPlan.summary
                }
              </Text>
              <Text style={styles.summaryExplanation}>
                {isLogWorkout
                  ? 'Review and edit the extracted workout before saving'
                  : isProgramDraft
                  ? 'Review and edit the draft before saving'
                  : isGoalUpdate
                  ? 'Review and confirm your goal updates before saving'
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
              {isLogWorkout
                ? renderEditableWorkout()
                : isProgramDraft
                ? renderProgramDraft()
                : (
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
                )
              }
            </ScrollView>

            {error && (
              <TouchableOpacity
                style={styles.errorBanner}
                onPress={clearError}
              >
                <Text style={styles.errorBannerText}>{error}</Text>
                <Text style={styles.errorBannerHint}>Tap to dismiss</Text>
              </TouchableOpacity>
            )}

            {isProgramDraft && (
              <View style={styles.confirmPrompt}>
                <Text style={styles.confirmPromptTitle}>
                  Add this {draftLabel.toLowerCase()} to your {draftLabel.toLowerCase()} cards?
                </Text>
                <Text style={styles.confirmPromptBody}>
                  Tap Create to add it, or Cancel to discard.
                </Text>
              </View>
            )}

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
                      {confirmLabel}
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
          if (selectedProgramExercise) {
            updateProgramExercise(selectedProgramExercise.workoutId, selectedProgramExercise.exerciseId, {
              exerciseId,
              exerciseName,
            });
            setSelectedProgramExercise(null);
          } else if (selectedExerciseId) {
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
  const { exercises, loading, error } = useExercises();

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedExercises.slice(0, 50);
    }

    return sortedExercises.filter((exercise) => {
      if (exercise.name.toLowerCase().includes(query)) return true;
      if (exercise.primaryMuscles?.some((muscle) => muscle.toLowerCase().includes(query))) {
        return true;
      }
      if (exercise.equipment?.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
  }, [sortedExercises, searchQuery]);

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
            {loading && (
              <View style={styles.loadingState}>
                <ActivityIndicator color={Colors.success} size="small" />
                <Text style={styles.loadingText}>Loading exercises...</Text>
              </View>
            )}
            {!loading && error && (
              <Text style={styles.noResultsText}>
                Unable to load exercises. Please check your connection.
              </Text>
            )}
            {!loading && !error && filteredExercises.map((exercise) => (
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
            {!loading && !error && filteredExercises.length === 0 && (
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
    height: '90%',
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
    paddingBottom: Spacing['3xl'],
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
  confirmPrompt: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.35)',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  confirmPromptTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  confirmPromptBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
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

  // Program draft styles
  programDraftContainer: {
    gap: Spacing.lg,
  },
  programMetaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metaInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaTextarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaField: {
    flex: 1,
    gap: Spacing.xs,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workoutNameInput: {
    flex: 1,
    ...Typography.label,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  workoutDayContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  workoutDayLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  workoutDayInput: {
    width: 44,
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
  },
  diffHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: -Spacing.xs,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  programExerciseCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  programExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programExerciseNameButton: {
    flex: 1,
  },
  programExerciseName: {
    ...Typography.label,
    color: Colors.textPrimary,
    flex: 1,
  },
  invalidExerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  invalidExerciseText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  exerciseFieldRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exerciseField: {
    flex: 1,
    gap: Spacing.xs,
  },
  exerciseFieldLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  exerciseFieldInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  newExerciseInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  newExerciseInlineText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  newExerciseNotes: {
    gap: Spacing.xs,
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
  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    ...Typography.body,
    color: Colors.error,
  },
  errorBannerHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});

export default AIMutationPreviewModal;
