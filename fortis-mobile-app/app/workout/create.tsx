import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { XMarkIcon, PlusIcon, TrashIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout, Easing } from 'react-native-reanimated';
import { useProgramsStore } from '@/src/store/programsStore';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { TemplateNumberPad } from '@/src/components/workout/TemplateNumberPad';

// Simple UUID generator for local IDs
const generateLocalId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Template set type
interface TemplateSet {
  localId: string;
  targetWeight: string;
  targetReps: string;
}

// Template exercise type for local state
interface TemplateExercise {
  localId: string;
  exerciseId: string;
  exerciseName: string;
  sets: TemplateSet[];
  restSeconds: number;
}

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);

  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Number pad state
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [editingField, setEditingField] = useState<{
    exerciseLocalId: string;
    setLocalId: string;
    field: 'targetWeight' | 'targetReps';
  } | null>(null);

  // Check if we can save
  const canSave = templateName.trim().length > 0 && exercises.length > 0 && !isSaving;

  // Handle close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle adding exercises from the exercise modal
  const handleAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newExercises: TemplateExercise[] = exercisesToAdd.map((ex) => ({
      localId: generateLocalId(),
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [],
      restSeconds: 120,
    }));

    setExercises(prev => [...prev, ...newExercises]);
    setShowAddExerciseModal(false);
  }, []);

  // Handle removing an exercise
  const handleRemoveExercise = useCallback((localId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExercises(prev => prev.filter(ex => ex.localId !== localId));
  }, []);

  // Handle adding a set to an exercise
  const handleAddSet = useCallback((exerciseLocalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseLocalId) {
        return {
          ...ex,
          sets: [...ex.sets, { localId: generateLocalId(), targetWeight: '', targetReps: '8-12' }],
        };
      }
      return ex;
    }));
  }, []);

  // Handle removing a set from an exercise
  const handleRemoveSet = useCallback((exerciseLocalId: string, setLocalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseLocalId && ex.sets.length > 1) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.localId !== setLocalId),
        };
      }
      return ex;
    }));
  }, []);

  // Handle updating set values
  const handleUpdateSet = useCallback((exerciseLocalId: string, setLocalId: string, field: 'targetWeight' | 'targetReps', value: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseLocalId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.localId === setLocalId) {
              return { ...s, [field]: value };
            }
            return s;
          }),
        };
      }
      return ex;
    }));
  }, []);

  // Handle opening the number pad for a specific field
  const handleInputPress = useCallback((exerciseLocalId: string, setLocalId: string, field: 'targetWeight' | 'targetReps') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField({ exerciseLocalId, setLocalId, field });
    setShowNumberPad(true);
  }, []);

  // Get current value for the number pad
  const getCurrentValue = () => {
    if (!editingField) return '';
    const exercise = exercises.find(ex => ex.localId === editingField.exerciseLocalId);
    if (!exercise) return '';
    const set = exercise.sets.find(s => s.localId === editingField.setLocalId);
    if (!set) return '';
    return set[editingField.field];
  };

  // Handle number pad value change
  const handleNumberPadChange = useCallback((value: string) => {
    if (!editingField) return;
    handleUpdateSet(editingField.exerciseLocalId, editingField.setLocalId, editingField.field, value);
  }, [editingField, handleUpdateSet]);

  // Handle closing the number pad
  const handleNumberPadClose = useCallback(() => {
    setShowNumberPad(false);
    setEditingField(null);
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!canSave) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      const exercisesToSave = exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.length,
        reps: ex.sets[0]?.targetReps || '8-12',
        restSeconds: ex.restSeconds,
      }));

      const templateId = await createWorkoutTemplate(templateName.trim(), exercisesToSave);

      if (templateId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        DeviceEventEmitter.emit('workout-updated');
        router.back();
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

  // Render set row
  const renderSetRow = (exercise: TemplateExercise, set: TemplateSet, index: number) => (
    <View key={set.localId} style={styles.setRow}>
      {/* Set Number */}
      <Pressable
        onLongPress={() => handleRemoveSet(exercise.localId, set.localId)}
        style={styles.setNumberBox}
      >
        <Text style={styles.setNumber}>{index + 1}</Text>
      </Pressable>

      {/* Target Weight Input */}
      <Pressable
        onPress={() => handleInputPress(exercise.localId, set.localId, 'targetWeight')}
        style={({ pressed }) => [
          styles.inputBox,
          pressed && styles.inputBoxPressed,
        ]}
      >
        <Text style={[styles.inputText, !set.targetWeight && styles.inputPlaceholder]}>
          {set.targetWeight || '—'}
        </Text>
      </Pressable>

      {/* Target Reps Input */}
      <Pressable
        onPress={() => handleInputPress(exercise.localId, set.localId, 'targetReps')}
        style={({ pressed }) => [
          styles.inputBox,
          pressed && styles.inputBoxPressed,
        ]}
      >
        <Text style={[styles.inputText, !set.targetReps && styles.inputPlaceholder]}>
          {set.targetReps || '—'}
        </Text>
      </Pressable>
    </View>
  );

  // Render exercise card
  const renderExerciseCard = useCallback(({ item }: { item: TemplateExercise }) => (
    <Animated.View
      entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic)).delay(50)}
      exiting={FadeOut.duration(250).easing(Easing.in(Easing.cubic))}
      layout={Layout.duration(300).easing(Easing.inOut(Easing.cubic))}
      style={styles.exerciseCard}
    >
      <View style={styles.cardContent}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {item.exerciseName}
          </Text>
          <Pressable
            onPress={() => handleRemoveExercise(item.localId)}
            style={({ pressed }) => [
              styles.trashButton,
              pressed && styles.pressed,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <TrashIcon size={18} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Sets Table */}
        <View style={styles.setsTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.setCol]}>Set</Text>
            <Text style={[styles.headerText, styles.weightCol]}>LBS</Text>
            <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
          </View>

          {/* Header Divider */}
          <View style={styles.headerDivider} />

          {/* Set Rows */}
          {item.sets.map((set, index) => renderSetRow(item, set, index))}
        </View>

        {/* Add Set Button */}
        <Pressable
          onPress={() => handleAddSet(item.localId)}
          style={({ pressed }) => [
            styles.addSetButton,
            pressed && styles.pressed
          ]}
        >
          <View style={styles.addSetLine} />
          <Text style={styles.addSetText}>+ Add Set</Text>
          <View style={styles.addSetLine} />
        </Pressable>
      </View>
    </Animated.View>
  ), [handleRemoveExercise, handleAddSet, handleRemoveSet, handleInputPress]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No exercises added yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap "Add Exercises" to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <XMarkIcon size={24} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>New Workout</Text>
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
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </GlassButton>
        </View>

        {/* Template Name Input */}
        <View style={styles.nameInputContainer}>
          <TextInput
            style={styles.nameInput}
            placeholder="Workout Name"
            placeholderTextColor={Colors.textSecondary}
            value={templateName}
            onChangeText={setTemplateName}
            autoCorrect={false}
            maxLength={50}
          />
        </View>

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

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onAddExercisesCallback={handleAddExercises}
        existingExerciseIds={exercises.map(ex => ex.exerciseId)}
      />

      {/* Number Pad */}
      <TemplateNumberPad
        visible={showNumberPad}
        value={getCurrentValue()}
        onChange={handleNumberPadChange}
        onClose={handleNumberPadClose}
        inputType={editingField?.field === 'targetWeight' ? 'weight' : 'reps'}
      />
    </View>
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
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
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
    height: 40,
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
  // Exercise Card Styles (matching ExerciseCard)
  exerciseCard: {
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    overflow: 'visible',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  cardContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trashButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  // Sets Table
  setsTable: {
    gap: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: Spacing.xs,
  },
  headerText: {
    fontSize: 13,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setCol: {
    width: 50,
  },
  weightCol: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  repsCol: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  // Set Row
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  setNumberBox: {
    width: 50,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  setNumber: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputBox: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputBoxPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  inputText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  inputPlaceholder: {
    color: Colors.textTertiary,
  },
  // Add Set Button
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  addSetLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.successBorder,
  },
  addSetText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Bottom Add Button
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
    height: 56,
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
