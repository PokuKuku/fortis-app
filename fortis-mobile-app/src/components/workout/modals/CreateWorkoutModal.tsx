import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XMarkIcon, PlusIcon, TrashIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius, ButtonHeights } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useProgramsStore } from '@/src/store/programsStore';
import { AddExerciseModal } from './AddExerciseModal';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Program } from '@/src/types/workout';

// Simple UUID generator for local IDs
const generateLocalId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Template exercise type for local state
interface TemplateExercise {
  localId: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  orderIndex: number;
}

interface CreateWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (templateId: string) => void;
  templateToEdit?: Program;
}

export function CreateWorkoutModal({
  visible,
  onClose,
  onSave,
  templateToEdit,
}: CreateWorkoutModalProps) {
  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);
  const updateWorkoutTemplate = useProgramsStore(s => s.updateWorkoutTemplate);
  const bodyType = useWorkoutStore((s) => s.bodyType);

  const isEditing = !!templateToEdit;
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const exerciseIds = useMemo(() => exercises.map(ex => ex.exerciseId), [exercises]);
  const exercisesWithMuscles = useExercisesWithMuscles(exerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;

  // Reset or prefill state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setTemplateName('');
      setExercises([]);
      setIsSaving(false);
      return;
    }

    if (templateToEdit) {
      const workout = templateToEdit.workouts[0];
      const sortedExercises = workout
        ? [...workout.exercises].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        )
        : [];

      setTemplateName(templateToEdit.name);
      setExercises(sortedExercises.map((ex, index) => ({
        localId: generateLocalId(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: Math.max(1, ex.setDetails?.length ?? ex.sets ?? 1),
        reps: ex.reps,
        restSeconds: ex.restSeconds ?? 120,
        orderIndex: index,
      })));
      setIsSaving(false);
      return;
    }

    setTemplateName('');
    setExercises([]);
    setIsSaving(false);
  }, [visible, templateToEdit]);

  // Check if we can save
  const canSave = templateName.trim().length > 0 && exercises.length > 0 && !isSaving;

  // Handle adding exercises from the exercise modal
  const handleAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newExercises: TemplateExercise[] = exercisesToAdd.map((ex, index) => ({
      localId: generateLocalId(),
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: 3,
      reps: '8-12',
      restSeconds: 120,
      orderIndex: exercises.length + index,
    }));

    setExercises(prev => [...prev, ...newExercises]);
    setShowAddExerciseModal(false);
  }, [exercises.length]);

  // Handle removing an exercise
  const handleRemoveExercise = useCallback((localId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.filter(ex => ex.localId !== localId));
  }, []);

  // Handle updating sets count
  const handleUpdateSets = useCallback((localId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.map(ex => {
      if (ex.localId === localId) {
        const newSets = Math.max(1, Math.min(10, ex.sets + delta));
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!canSave) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      const exercisesToSave = exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
      }));

      if (isEditing && templateToEdit?.id) {
        const updatedId = await updateWorkoutTemplate(
          templateToEdit.id,
          templateName.trim(),
          exercisesToSave
        );
        if (updatedId) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onSave?.(updatedId);
          onClose();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setIsSaving(false);
        }
        return;
      }

      const templateId = await createWorkoutTemplate(templateName.trim(), exercisesToSave);

      if (templateId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave?.(templateId);
        onClose();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Failed to save workout template:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSaving(false);
    }
  };

  // Render exercise card
  const renderExerciseCard = useCallback(({ item }: { item: TemplateExercise }) => (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.exerciseCard}
    >
      {/* Exercise Header */}
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {item.exerciseName}
        </Text>
        <Pressable
          onPress={() => handleRemoveExercise(item.localId)}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <TrashIcon size={18} color={Colors.error} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Sets Configuration */}
      <View style={styles.setsRow}>
        <Text style={styles.setsLabel}>Sets</Text>
        <View style={styles.setsControls}>
          <Pressable
            onPress={() => handleUpdateSets(item.localId, -1)}
            style={({ pressed }) => [
              styles.setsButton,
              pressed && styles.setsButtonPressed,
            ]}
          >
            <Text style={styles.setsButtonText}>-</Text>
          </Pressable>
          <Text style={styles.setsValue}>{item.sets}</Text>
          <Pressable
            onPress={() => handleUpdateSets(item.localId, 1)}
            style={({ pressed }) => [
              styles.setsButton,
              pressed && styles.setsButtonPressed,
            ]}
          >
            <Text style={styles.setsButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Reps Display */}
      <View style={styles.repsRow}>
        <Text style={styles.repsLabel}>Reps</Text>
        <Text style={styles.repsValue}>{item.reps}</Text>
      </View>

      {/* Rest Timer Display */}
      <View style={styles.restRow}>
        <Text style={styles.restLabel}>Rest</Text>
        <Text style={styles.restValue}>{Math.floor(item.restSeconds / 60)}:{(item.restSeconds % 60).toString().padStart(2, '0')}</Text>
      </View>
    </Animated.View>
  ), [handleRemoveExercise, handleUpdateSets]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No exercises added yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap "Add Exercises" to get started
      </Text>
    </View>
  );

  if (!visible) return null;

  const headerTitle = isEditing ? 'Edit Template' : 'New Template';
  const saveButtonText = isEditing ? 'Update' : 'Save';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <XMarkIcon size={24} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <GlassButton
              style={{
                ...styles.saveButton,
                ...(!canSave ? styles.saveButtonDisabled : {}),
              }}
              onPress={handleSave}
              disabled={!canSave}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{saveButtonText}</Text>
              )}
            </GlassButton>
          </View>

          {/* Template Name Input */}
          <View style={styles.nameInputContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Template Name"
              placeholderTextColor={Colors.textSecondary}
              value={templateName}
              onChangeText={setTemplateName}
              autoCorrect={false}
              maxLength={50}
            />
          </View>

          {hasMuscles && (
            <View style={styles.heatmapContainer}>
              <MuscleHeatmap
                exercises={exercisesWithMuscles}
                gender={bodyType}
                scale={0.22}
                compact
              />
            </View>
          )}

          {/* Exercise List */}
          <FlatList
            data={exercises}
            renderItem={renderExerciseCard}
            keyExtractor={item => item.localId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />

          {/* Add Exercises Button */}
          <View style={styles.addButtonContainer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddExerciseModal(true);
              }}
              style={({ pressed }) => [
                styles.addExercisesButton,
                pressed && styles.addExercisesButtonPressed,
              ]}
            >
              <PlusIcon size={20} color={Colors.success} strokeWidth={2} />
              <Text style={styles.addExercisesText}>Add Exercises</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onAddExercisesCallback={handleAddExercises}
        existingExerciseIds={exercises.map(ex => ex.exerciseId)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  saveButton: {
    height: ButtonHeights.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  nameInputContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    zIndex: 1,
  },
  heatmapContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  nameInput: {
    ...Typography.h2,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  exerciseName: {
    ...Typography.h4,
    color: Colors.success,
    flex: 1,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  removeButtonPressed: {
    opacity: 0.6,
  },
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  setsLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  setsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  setsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
  },
  setsButtonPressed: {
    opacity: 0.6,
  },
  setsButtonText: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  setsValue: {
    ...Typography.number,
    color: Colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  repsLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  repsValue: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  restLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  restValue: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.background,
    zIndex: 2,
  },
  addExercisesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: ButtonHeights.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  addExercisesButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  addExercisesText: {
    ...Typography.button,
    color: Colors.success,
  },
});
