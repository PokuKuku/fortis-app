import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XMarkIcon, PlusIcon, CalendarDaysIcon, PencilIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { DateSelector } from '@/src/components/ui/DateSelector';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { format } from 'date-fns';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    mode = 'template',
    date,
    templateId: templateIdParam,
  } = useLocalSearchParams<{
    mode?: 'template' | 'log';
    date?: string | string[];
    templateId?: string | string[];
  }>();
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam;
  const dateValue = Array.isArray(date) ? date[0] : date;
  const isEditingTemplate = mode !== 'log' && !!templateId;

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    closeButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    headerTitleInput: { color: colors.textPrimary },
    statLabel: { color: colors.textTertiary },
    dateRow: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    dateRowPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    dateText: { color: colors.textPrimary },
    emptyStateText: { color: colors.textSecondary },
    emptyStateSubtext: { color: colors.textSecondary },
    addButtonContainer: { backgroundColor: colors.background },
  };

  // Editor store actions
  const editorSession = useWorkoutStore(s => s.editorSession);
  const editorDate = useWorkoutStore(s => s.editorDate);
  const initEditorSession = useWorkoutStore(s => s.initEditorSession);
  const initEditorSessionFromTemplate = useWorkoutStore(s => s.initEditorSessionFromTemplate);
  const setEditorWorkoutName = useWorkoutStore(s => s.setEditorWorkoutName);
  const setEditorDate = useWorkoutStore(s => s.setEditorDate);
  const addEditorExercises = useWorkoutStore(s => s.addEditorExercises);
  const saveEditorAsTemplate = useWorkoutStore(s => s.saveEditorAsTemplate);
  const saveEditorAsWorkout = useWorkoutStore(s => s.saveEditorAsWorkout);
  const clearEditorSession = useWorkoutStore(s => s.clearEditorSession);
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);
  const closeNumberPad = useWorkoutStore(s => s.closeNumberPad);
  const updateEditorSet = useWorkoutStore(s => s.updateEditorSet);
  const openEditorNumberPad = useWorkoutStore(s => s.openEditorNumberPad);

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

  // Get exercise IDs and fetch muscle data for heatmap
  const exerciseIds = useMemo(
    () => editorSession?.exercises.map(e => e.exerciseId) || [],
    [editorSession?.exercises]
  );
  const exercisesWithMuscles = useExercisesWithMuscles(exerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;

  // Calculate stats for the stats row
  const exerciseCount = editorSession?.exercises.length || 0;
  const totalSets = useMemo(
    () => editorSession?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) || 0,
    [editorSession?.exercises]
  );

  // Initialize editor session on mount
  useEffect(() => {
    if (isEditingTemplate && templateId) {
      initEditorSessionFromTemplate(templateId);
    } else {
      initEditorSession();
    }
    return () => {
      clearEditorSession();
    };
  }, [clearEditorSession, initEditorSession, initEditorSessionFromTemplate, isEditingTemplate, templateId]);

  // Set date from URL parameter when logging past workout
  useEffect(() => {
    if (mode === 'log' && dateValue) {
      setEditorDate(new Date(dateValue));
    }
  }, [mode, dateValue, setEditorDate]);

  // Check if we can save
  const canSave = (editorSession?.name?.trim()?.length ?? 0) > 0 &&
    (editorSession?.exercises?.length ?? 0) > 0 &&
    !isSaving;

  // Handle close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeNumberPad();
    router.back();
  };

  // Handle adding exercises from the exercise modal
  const handleAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addEditorExercises(exercisesToAdd);
    setShowAddExerciseModal(false);
  }, [addEditorExercises]);

  // Handle save
  const handleSave = async () => {
    if (!canSave) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      if (mode === 'log') {
        await saveEditorAsWorkout();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        DeviceEventEmitter.emit('workout-updated');
        router.back();
      } else {
        const updatedTemplateId = isEditingTemplate && templateId
          ? await saveEditorAsTemplate(templateId)
          : await saveEditorAsTemplate();
        if (updatedTemplateId) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          DeviceEventEmitter.emit('workout-updated');
          router.back();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSaving(false);
    }
  };

  // Handle number pad confirm
  const handleNumberPadConfirm = useCallback((value: number | null) => {
    if (!activeNumberPad) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;
    updateEditorSet(exerciseLocalId, setLocalId, { [inputType]: value });
    closeNumberPad();
  }, [activeNumberPad, updateEditorSet, closeNumberPad]);

  // Handle number pad next - navigate to next input
  const handleNumberPadNext = useCallback((value: number | null) => {
    if (!activeNumberPad || !editorSession) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;

    // Save current value
    updateEditorSet(exerciseLocalId, setLocalId, { [inputType]: value });

    // Find current exercise and set
    const exercise = editorSession.exercises.find(e => e.localId === exerciseLocalId);
    const setIndex = exercise?.sets.findIndex(s => s.localId === setLocalId) ?? -1;

    if (inputType === 'weight') {
      // Go to reps (same set)
      openEditorNumberPad(exerciseLocalId, setLocalId, 'reps');
    } else {
      // inputType === 'reps' - go to weight of next set
      const nextSet = exercise?.sets[setIndex + 1];
      if (nextSet) {
        openEditorNumberPad(exerciseLocalId, nextSet.localId, 'weight');
      } else {
        // No more sets - close
        closeNumberPad();
      }
    }
  }, [activeNumberPad, editorSession, updateEditorSet, openEditorNumberPad, closeNumberPad]);

  // Handle date selection
  const handleDateSelect = (selectedDate: Date) => {
    setEditorDate(selectedDate);
  };

  // Render exercise card
  const renderExerciseCard = useCallback(({ item }: { item: { localId: string } }) => (
    <ExerciseCard
      exerciseLocalId={item.localId}
      useEditor={true}
      showCheckboxes={mode === 'log'}
    />
  ), [mode]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, themedStyles.emptyStateText]}>No exercises added yet</Text>
      <Text style={[styles.emptyStateSubtext, themedStyles.emptyStateSubtext]}>
        Tap "Add Exercises" to get started
      </Text>
    </View>
  );

  const saveButtonText = mode === 'log' ? 'Log' : (isEditingTemplate ? 'Update' : 'Save');

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, themedStyles.dragHandle]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              themedStyles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <XMarkIcon size={24} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <View style={styles.titleInputWrapper}>
            <TextInput
              style={[styles.headerTitleInput, themedStyles.headerTitleInput]}
              placeholder="Workout Name"
              placeholderTextColor={colors.textSecondary}
              value={editorSession?.name || ''}
              onChangeText={setEditorWorkoutName}
              autoCorrect={false}
              autoCapitalize="words"
              autoComplete="off"
              editable={true}
              maxLength={50}
              returnKeyType="done"
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
            <View style={styles.editIconSlot}>
              {!isNameFocused && (
                <PencilIcon size={14} color={colors.textTertiary} strokeWidth={2} />
              )}
            </View>
          </View>
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

        {/* Date Picker (Log Mode Only) */}
        {mode === 'log' && (
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              styles.dateRow,
              themedStyles.dateRow,
              pressed && themedStyles.dateRowPressed,
            ]}
          >
            <CalendarDaysIcon size={20} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.dateText, themedStyles.dateText]}>
              {format(editorDate, 'MMMM d, yyyy')}
            </Text>
          </Pressable>
        )}

        {/* Stats Row - Fixed above list (hidden in log mode) */}
        {mode !== 'log' && exerciseCount > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statsLeft}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, themedStyles.statLabel]}>Exercises</Text>
                <Text style={styles.statValue}>{exerciseCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, themedStyles.statLabel]}>Sets</Text>
                <Text style={styles.statValue}>{totalSets}</Text>
              </View>
            </View>
            {hasMuscles && (
              <MuscleHeatmap exercises={exercisesWithMuscles} scale={0.22} compact />
            )}
          </View>
        )}

        {/* Exercise List */}
        <FlatList
          data={editorSession?.exercises || []}
          renderItem={renderExerciseCard}
          keyExtractor={item => item.localId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />

        {/* Add Exercises Button */}
        <View style={[styles.addButtonContainer, themedStyles.addButtonContainer]}>
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
        existingExerciseIds={editorSession?.exercises.map(ex => ex.exerciseId) || []}
      />

      {/* Number Pad Modal */}
      <NumberPadModal
        visible={!!activeNumberPad}
        onConfirm={handleNumberPadConfirm}
        onNext={handleNumberPadNext}
        onClose={closeNumberPad}
        inputType={activeNumberPad?.inputType || 'weight'}
        useEditor={true}
      />

      {/* Date Picker */}
      <DateSelector
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelect}
        currentDate={editorDate}
        selectedDate={editorDate}
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
  titleInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  editIconSlot: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleInput: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    flex: 1,
    minWidth: 100,
    paddingVertical: Spacing.xs,
    textAlignVertical: 'center',
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statsLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing['4xl'],
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    color: Colors.success,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    ...Typography.body,
    color: Colors.textPrimary,
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
