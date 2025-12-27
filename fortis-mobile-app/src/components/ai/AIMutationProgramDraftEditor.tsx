import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AlertTriangle, Info, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { IconSizes } from '../../../constants/Sizes';
import { AIMutationPlan, AIExerciseResolution, EditableProgramDraft, EditableProgramWorkout } from '../../types/ai';
import { styles } from './AIMutationPreviewModal.styles';

interface AIMutationProgramDraftEditorProps {
  editableProgramDraft: EditableProgramDraft | null;
  originalProgramDraft: EditableProgramDraft | null;
  mutationPlan: AIMutationPlan;
  onUpdateProgramDraft: (updates: Partial<EditableProgramDraft>) => void;
  onUpdateProgramWorkout: (workoutId: string, updates: Partial<EditableProgramWorkout>) => void;
  onUpdateProgramExercise: (
    workoutId: string,
    exerciseId: string,
    updates: {
      exerciseId?: string;
      exerciseName?: string;
      sets?: number;
      reps?: string;
      restSeconds?: number;
      notes?: string;
    }
  ) => void;
  onDeleteProgramExercise: (workoutId: string, exerciseId: string) => void;
  onOpenExercisePicker: (workoutId: string, exerciseId: string) => void;
}

const formatDiffValue = (value: unknown) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.trim().length === 0) return '—';
  return String(value);
};

const isValidUUID = (value: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export function AIMutationProgramDraftEditor({
  editableProgramDraft,
  originalProgramDraft,
  mutationPlan,
  onUpdateProgramDraft,
  onUpdateProgramWorkout,
  onUpdateProgramExercise,
  onDeleteProgramExercise,
  onOpenExercisePicker,
}: AIMutationProgramDraftEditorProps) {
  const { colors } = useTheme();

  if (!editableProgramDraft) return null;

  const originalWorkoutById = useMemo(() => {
    const map = new Map<string, EditableProgramWorkout>();
    originalProgramDraft?.workouts.forEach((workout) => {
      map.set(workout.id, workout);
    });
    return map;
  }, [originalProgramDraft]);

  const newExerciseMap = useMemo(() => {
    const map = new Map<string, AIExerciseResolution>();
    mutationPlan.exerciseResolution.forEach((resolution) => {
      if (!resolution.fromHistory) {
        map.set(resolution.exerciseId, resolution);
      }
    });
    return map;
  }, [mutationPlan.exerciseResolution]);

  const getOriginalExercise = (workoutId: string, exerciseId: string) => {
    const workout = originalWorkoutById.get(workoutId);
    return workout?.exercises.find((exercise) => exercise.id === exerciseId);
  };

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
          onChangeText={(text) => onUpdateProgramDraft({ name: text })}
          placeholder={editableProgramDraft.isTemplate ? 'Upper Body Template' : 'Strength Block'}
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.metaInput, styles.metaTextarea]}
          value={editableProgramDraft.description || ''}
          onChangeText={(text) => onUpdateProgramDraft({ description: text })}
          placeholder="Short summary of the focus and intent"
          placeholderTextColor={colors.textTertiary}
          multiline
        />
        <View style={styles.metaRow}>
          <View style={styles.metaField}>
            <Text style={styles.inputLabel}>Difficulty</Text>
            <TextInput
              style={styles.metaInput}
              value={editableProgramDraft.difficulty}
              onChangeText={(text) => onUpdateProgramDraft({ difficulty: text })}
              placeholder="beginner | intermediate | advanced"
              placeholderTextColor={colors.textTertiary}
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
                onUpdateProgramDraft({ durationWeeks: Number.isNaN(weeks) ? undefined : weeks });
              }}
              placeholder="8"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Text style={styles.inputLabel}>Goal</Text>
        <TextInput
          style={styles.metaInput}
          value={editableProgramDraft.goal || ''}
          onChangeText={(text) => onUpdateProgramDraft({ goal: text })}
          placeholder="strength | hypertrophy | powerlifting | general_fitness"
          placeholderTextColor={colors.textTertiary}
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
                onChangeText={(text) => onUpdateProgramWorkout(workout.id, { name: text })}
                placeholder="Workout name"
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.workoutDayContainer}>
                <Text style={styles.workoutDayLabel}>Day</Text>
                <TextInput
                  style={styles.workoutDayInput}
                  value={String(workout.dayNumber)}
                  onChangeText={(text) => {
                    const dayNumber = parseInt(text, 10);
                    onUpdateProgramWorkout(workout.id, {
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
                        onPress={() => onOpenExercisePicker(workout.id, exercise.id)}
                      >
                        <Text style={styles.programExerciseName} numberOfLines={1}>
                          {exercise.exerciseName || 'Select exercise'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteExerciseButton}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                          onDeleteProgramExercise(workout.id, exercise.id);
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
                            onUpdateProgramExercise(workout.id, exercise.id, {
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
                            onUpdateProgramExercise(workout.id, exercise.id, { reps: text })
                          }
                          placeholder="8-12"
                          placeholderTextColor={colors.textTertiary}
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
                            onUpdateProgramExercise(workout.id, exercise.id, {
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
                            onUpdateProgramExercise(workout.id, exercise.id, { notes: text })
                          }
                          placeholder="Optional"
                          placeholderTextColor={colors.textTertiary}
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
}
