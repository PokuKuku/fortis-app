import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Spacing, FontSizes, BorderRadius, ButtonHeights, Sizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useProgramsStore } from '@/src/store/programsStore';
import { AddExerciseModal } from './AddExerciseModal';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Program } from '@/src/types/workout';
import { generateSecureUUID as generateLocalId } from '@/src/utils/uuid';
import { scale } from '@/src/utils/responsive';

const HEADER_COLLAPSE_THRESHOLD = scale(48);

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
  const { colors, isDark } = useTheme();

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    headerTitle: { color: colors.textPrimary },
    closeButton: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' },
    nameInput: {
      color: colors.textPrimary,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    headerDivider: { backgroundColor: colors.borderLight },
    compactStatLabel: { color: colors.textSecondary },
    compactStatValue: { color: colors.textPrimary },
    compactStatDivider: { backgroundColor: colors.borderLight },
    exerciseCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    exerciseName: { color: colors.accent },
    setsLabel: { color: colors.textSecondary },
    setsButton: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' },
    setsButtonText: { color: colors.textPrimary },
    setsValue: { color: colors.textPrimary },
    setsRowBorder: { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
    repsValue: { color: colors.textPrimary },
    restValue: { color: colors.textPrimary },
    emptyStateText: { color: colors.textSecondary },
    addButtonContainer: { backgroundColor: colors.background },
    addExercisesButton: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    addExercisesButtonPressed: {
      backgroundColor: colors.accentOverlayMedium,
    },
    addExercisesText: { color: colors.accent },
  };

  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);
  const updateWorkoutTemplate = useProgramsStore(s => s.updateWorkoutTemplate);
  const bodyType = useWorkoutStore((s) => s.bodyType);

  const isEditing = !!templateToEdit;
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHeaderDetails, setShowHeaderDetails] = useState(true);
  const headerDetailsVisibleRef = useRef(true);
  const exerciseIds = useMemo(() => exercises.map(ex => ex.exerciseId), [exercises]);
  const exercisesWithMuscles = useExercisesWithMuscles(exerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;
  const totalExercises = exercises.length;
  const totalSets = useMemo(
    () => exercises.reduce((sum, exercise) => sum + (exercise.sets || 0), 0),
    [exercises]
  );

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
  const showCompactStats = !showHeaderDetails && totalExercises > 0;

  const handleListScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowDetails = offsetY < HEADER_COLLAPSE_THRESHOLD;
    if (headerDetailsVisibleRef.current !== shouldShowDetails) {
      headerDetailsVisibleRef.current = shouldShowDetails;
      setShowHeaderDetails(shouldShowDetails);
    }
  }, []);

  // Handle adding exercises from the exercise modal
  const handleAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string; initialSetCount?: number | null }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newExercises: TemplateExercise[] = exercisesToAdd.map((ex, index) => ({
      localId: generateLocalId(),
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: Math.max(1, Math.min(12, Math.round(ex.initialSetCount ?? 3))),
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
      style={[styles.exerciseCard, themedStyles.exerciseCard]}
    >
      {/* Exercise Header */}
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, themedStyles.exerciseName]} numberOfLines={1}>
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
      <View style={[styles.setsRow, themedStyles.setsRowBorder]}>
        <Text style={[styles.setsLabel, themedStyles.setsLabel]}>Sets</Text>
        <View style={styles.setsControls}>
          <Pressable
            onPress={() => handleUpdateSets(item.localId, -1)}
            style={({ pressed }) => [
              styles.setsButton,
              themedStyles.setsButton,
              pressed && styles.setsButtonPressed,
            ]}
          >
            <Text style={[styles.setsButtonText, themedStyles.setsButtonText]}>-</Text>
          </Pressable>
          <Text style={[styles.setsValue, themedStyles.setsValue]}>{item.sets}</Text>
          <Pressable
            onPress={() => handleUpdateSets(item.localId, 1)}
            style={({ pressed }) => [
              styles.setsButton,
              themedStyles.setsButton,
              pressed && styles.setsButtonPressed,
            ]}
          >
            <Text style={[styles.setsButtonText, themedStyles.setsButtonText]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Reps Display */}
      <View style={[styles.repsRow, themedStyles.setsRowBorder]}>
        <Text style={[styles.repsLabel, themedStyles.setsLabel]}>Reps</Text>
        <Text style={[styles.repsValue, themedStyles.repsValue]}>{item.reps}</Text>
      </View>

      {/* Rest Timer Display */}
      <View style={styles.restRow}>
        <Text style={[styles.restLabel, themedStyles.setsLabel]}>Rest</Text>
        <Text style={[styles.restValue, themedStyles.restValue]}>{Math.floor(item.restSeconds / 60)}:{(item.restSeconds % 60).toString().padStart(2, '0')}</Text>
      </View>
    </Animated.View>
  ), [handleRemoveExercise, handleUpdateSets, themedStyles]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, themedStyles.emptyStateText]}>No exercises added yet</Text>
      <Text style={[styles.emptyStateSubtext, themedStyles.emptyStateText]}>
        Tap "Add Exercises" to get started
      </Text>
    </View>
  );

  if (!visible) return null;

  const headerTitle = isEditing ? 'Edit Template' : 'New Template';
  const saveButtonText = isEditing ? 'Update' : 'Save';

  const listHeader = (
    <>
      {/* Template Name Input */}
      <View style={styles.nameInputContainer}>
        <TextInput
          style={[styles.nameInput, themedStyles.nameInput]}
          placeholder="Template Name"
          placeholderTextColor={colors.textSecondary}
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
    </>
  );

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
        style={[styles.container, themedStyles.container]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  themedStyles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <XMarkIcon size={24} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
              <Text style={[styles.headerTitle, themedStyles.headerTitle]}>{headerTitle}</Text>
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
            {showCompactStats && (
              <View style={styles.compactStatsRow}>
                <View style={styles.compactStat}>
                  <Text style={[styles.compactStatLabel, themedStyles.compactStatLabel]}>Exercises</Text>
                  <Text style={[styles.compactStatValue, themedStyles.compactStatValue]}>{totalExercises}</Text>
                </View>
                <View style={[styles.compactStatDivider, themedStyles.compactStatDivider]} />
                <View style={styles.compactStat}>
                  <Text style={[styles.compactStatLabel, themedStyles.compactStatLabel]}>Sets</Text>
                  <Text style={[styles.compactStatValue, themedStyles.compactStatValue]}>{totalSets}</Text>
                </View>
              </View>
            )}
          </View>
          <View style={[styles.headerDivider, themedStyles.headerDivider]} />

          {/* Exercise List */}
          <FlatList
            data={exercises}
            renderItem={renderExerciseCard}
            keyExtractor={item => item.localId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={listHeader}
            onScroll={handleListScroll}
            scrollEventThrottle={16}
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
                themedStyles.addExercisesButton,
                pressed && themedStyles.addExercisesButtonPressed,
              ]}
            >
              <PlusIcon size={20} color={colors.accent} strokeWidth={2} />
              <Text style={[styles.addExercisesText, themedStyles.addExercisesText]}>Add Exercises</Text>
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing['2xl'],
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  compactStat: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  compactStatLabel: {
    fontSize: FontSizes.xs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  compactStatValue: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  compactStatDivider: {
    width: 1,
    height: 24,
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
    minHeight: Sizes.minTouchTarget,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
    // color now applied via themedStyles.exerciseName
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
    // borderColor and backgroundColor now applied via themedStyles.addExercisesButton
    borderStyle: 'dashed',
  },
  addExercisesButtonPressed: {
    opacity: 0.7,
    // backgroundColor now applied via themedStyles.addExercisesButtonPressed
  },
  addExercisesText: {
    ...Typography.button,
    // color now applied via themedStyles.addExercisesText
  },
});
