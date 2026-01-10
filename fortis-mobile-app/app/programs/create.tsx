import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights, Sizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import { useProgramsStore } from '@/src/store/programsStore';
import { ProgramLimitModal } from '@/src/components/workout/modals/ProgramLimitModal';
import { MAX_WORKOUTS_PER_PROGRAM } from '@/src/constants/programs';
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { runOnJS } from 'react-native-reanimated';
import { responsiveValue } from '@/src/utils/responsive';

const HEATMAP_SCALE = responsiveValue(0.16, 0.18, 0.2);

// Editor workout type for local state
interface EditorWorkout {
  id: string;
  templateId: string | null;
  name: string;
  programWorkoutId?: string;
}

export default function CreateProgramScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    closeButton: {
      backgroundColor: isDark ? colors.errorOverlay : 'rgba(239, 68, 68, 0.1)',
    },
    headerTitleInput: { color: colors.textPrimary },
    descriptionInput: {
      color: colors.textPrimary,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    },
    statLabel: { color: colors.textTertiary },
    workoutCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    workoutNameInput: { color: colors.textPrimary },
    reorderButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    workoutExerciseCount: { color: colors.textSecondary },
    emptyStateText: { color: colors.textSecondary },
    emptyStateSubtext: { color: colors.textSecondary },
    modalOverlay: { backgroundColor: colors.overlayHeavy },
    modalCard: { backgroundColor: colors.background },
    modalTitle: { color: colors.textPrimary },
    modalCloseButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    modalOption: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    },
    modalOptionTitle: { color: colors.textPrimary },
    modalOptionSubtitle: { color: colors.textSecondary },
    modalEmptyText: { color: colors.textSecondary },
    accentButtonBorder: { borderColor: colors.accentBorder },
    accentButtonBg: { backgroundColor: colors.accentOverlay },
    accentButtonBgPressed: { backgroundColor: colors.accentOverlayMedium },
    addWorkoutButton: { borderColor: colors.accentBorder },
    addWorkoutText: { color: colors.accent },
    statValue: { color: colors.accent },
    primaryActionText: { color: colors.white },
    dayBadge: { backgroundColor: colors.accentOverlay },
    dayBadgeText: { color: colors.accent },
  };
  const {
    mode,
    programId: programIdParam,
  } = useLocalSearchParams<{
    mode?: 'edit';
    programId?: string | string[];
  }>();
  const programId = Array.isArray(programIdParam) ? programIdParam[0] : programIdParam;
  const isEditing = mode === 'edit' && !!programId;

  // Store actions/data
  const createProgram = useProgramsStore(s => s.createProgram);
  const updateProgram = useProgramsStore(s => s.updateProgram);
  const fetchPrograms = useProgramsStore(s => s.fetchPrograms);
  const programs = useProgramsStore(s => s.programs);
  const templates = useMemo(() => programs.filter(p => p.isTemplate), [programs]);
  const templateMap = useMemo(
    () => new Map(templates.map(template => [template.id, template])),
    [templates]
  );
  const editingProgram = programs.find(p => p.id === programId && !p.isTemplate);
  const loadProgress = useProgramProgressStore(s => s.loadProgress);
  const progressEntry = useProgramProgressStore(s => (programId ? s.progressByProgram[programId] : undefined));
  const restartProgram = useProgramProgressStore(s => s.restartProgram);
  const trimCompletedDays = useProgramProgressStore(s => s.trimCompletedDays);

  // Local editor state
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [workouts, setWorkouts] = useState<EditorWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showEditIntentModal, setShowEditIntentModal] = useState(false);
  const [showCancelEditModal, setShowCancelEditModal] = useState(false);
  const [headerLeftWidth, setHeaderLeftWidth] = useState(0);
  const [titleTextWidth, setTitleTextWidth] = useState(0);
  const isNavigating = useRef(false);
  const hasInitializedEdit = useRef(false);
  const initialSnapshotRef = useRef<{
    name: string;
    description: string;
    workouts: Array<{ templateId: string | null }>;
  } | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    if (!isEditing || !editingProgram) return;
    if (hasInitializedEdit.current) return;

    setProgramName(editingProgram.name);
    setProgramDescription(editingProgram.description || '');

    const mappedWorkouts = editingProgram.workouts.flatMap((workout) => {
      const matchingTemplate = templates.find((template) => {
        const templateWorkout = template.workouts[0];
        if (!templateWorkout) return false;
        const templateIds = templateWorkout.exercises.map(ex => ex.exerciseId).join(',');
        const workoutIds = workout.exercises.map(ex => ex.exerciseId).join(',');
        if (templateIds === workoutIds) return true;
        return template.name.toLowerCase() === workout.name.toLowerCase();
      });

      if (!matchingTemplate) return [];

      return [{
        id: `workout-${workout.id}`,
        templateId: matchingTemplate.id,
        name: workout.name,
        programWorkoutId: workout.id,
      } as EditorWorkout];
    });

    setWorkouts(mappedWorkouts);
    initialSnapshotRef.current = {
      name: editingProgram.name,
      description: editingProgram.description || '',
      workouts: mappedWorkouts.map((workout) => ({ templateId: workout.templateId })),
    };
    hasInitializedEdit.current = true;
  }, [editingProgram, isEditing, templates]);

  // Stats
  const workoutCount = workouts.length;
  const totalExercises = useMemo(
    () => workouts.reduce((sum, workout) => {
      if (!workout.templateId) return sum;
      const template = templateMap.get(workout.templateId);
      return sum + (template?.workouts[0]?.exercises.length || 0);
    }, 0),
    [templateMap, workouts]
  );
  const programExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    workouts.forEach((workout) => {
      if (!workout.templateId) return;
      const template = templateMap.get(workout.templateId);
      if (!template) return;
      template.workouts.forEach((templateWorkout) => {
        templateWorkout.exercises.forEach((exercise) => {
          if (exercise.exerciseId) {
            ids.add(exercise.exerciseId);
          }
        });
      });
    });
    return Array.from(ids);
  }, [templateMap, workouts]);
  const exercisesWithMuscles = useExercisesWithMuscles(programExerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;
  // Check if we can save
  const canSave = programName.trim().length > 0 && workouts.length > 0 && !isSaving;

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing || !hasInitializedEdit.current || !initialSnapshotRef.current) return false;

    const initialSnapshot = initialSnapshotRef.current;
    const normalizedName = programName.trim();
    const normalizedDescription = programDescription.trim();
    const initialName = initialSnapshot.name.trim();
    const initialDescription = initialSnapshot.description.trim();

    if (normalizedName !== initialName) return true;
    if (normalizedDescription !== initialDescription) return true;
    if (workouts.length !== initialSnapshot.workouts.length) return true;

    for (let i = 0; i < workouts.length; i += 1) {
      if (workouts[i]?.templateId !== initialSnapshot.workouts[i]?.templateId) return true;
    }

    return false;
  }, [isEditing, programDescription, programName, workouts]);

  // Handle close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isEditing && hasUnsavedChanges) {
      setShowCancelEditModal(true);
      return;
    }
    router.back();
  };

  const handleDiscardChanges = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelEditModal(false);
    router.back();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onEnd((event) => {
      const shouldDismiss = event.translationY > 120 || event.velocityY > 1200;
      if (shouldDismiss) {
        runOnJS(handleClose)();
      }
    });

  // Handle add workout
  const handleAddWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      setShowLimitModal(true);
      return;
    }
    setActiveWorkoutId(null);
    setShowTemplatePicker(true);
  }, [workouts.length]);

  // Handle remove workout
  const handleRemoveWorkout = useCallback((workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  }, []);

  // Handle update workout name
  const handleUpdateWorkoutName = useCallback((workoutId: string, name: string) => {
    setWorkouts(prev => prev.map(w =>
      w.id === workoutId ? { ...w, name } : w
    ));
  }, []);

  const handleMoveWorkout = useCallback((workoutId: string, direction: 'up' | 'down') => {
    setWorkouts((prev) => {
      const index = prev.findIndex((workout) => workout.id === workoutId);
      if (index < 0) return prev;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, moved);
      return updated;
    });
  }, []);

  const handleSelectTemplate = useCallback((templateId: string) => {
    const template = templateMap.get(templateId);
    if (!template) return;

    setWorkouts((prev) => {
      if (activeWorkoutId) {
        return prev.map((workout) =>
          workout.id === activeWorkoutId
            ? {
              ...workout,
              templateId,
              name: template.name,
            }
            : workout
        );
      }

      return [
        ...prev,
        {
          id: `workout-${Date.now()}`,
          templateId,
          name: template.name,
        },
      ];
    });

    setActiveWorkoutId(null);
    setShowTemplatePicker(false);
  }, [activeWorkoutId, templateMap]);

  const handleViewWorkoutDetails = useCallback((templateId?: string | null) => {
    if (!templateId || isNavigating.current) return;
    isNavigating.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workouts/${templateId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  }, [router]);

  // Handle save
  const performSave = async (editIntent?: 'keep' | 'restart') => {
    if (!canSave) return false;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      const payload = workouts
        .filter((workout) => !!workout.templateId)
        .map((workout) => ({
          templateId: workout.templateId as string,
          name: workout.name,
          workoutId: workout.programWorkoutId,
        }));

      const options = {
        description: programDescription.trim() || undefined,
      };

      const result = isEditing && programId
        ? await updateProgram(programId, programName.trim(), payload, options)
        : await createProgram(programName.trim(), payload, options);

      if (result) {
        if (isEditing && programId && editIntent === 'restart') {
          restartProgram(programId);
        }
        if (isEditing && programId && editIntent === 'keep') {
          trimCompletedDays(programId, payload.length);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
        return true;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSaving(false);
      return false;
    } catch (error) {
      console.error('Failed to save program:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSaving(false);
      return false;
    }
  };

  const handleSave = () => {
    if (!canSave) return;

    if (isEditing && programId && progressEntry) {
      setShowEditIntentModal(true);
      return;
    }

    performSave();
  };

  // Render workout card
  const renderWorkoutCard = useCallback(({ item, index }: { item: EditorWorkout; index: number }) => {
    const template = item.templateId ? templateMap.get(item.templateId) : null;
    const exerciseCount = template?.workouts[0]?.exercises.length || 0;
    const dayNumber = index + 1;
    const canMoveUp = index > 0;
    const canMoveDown = index < workouts.length - 1;

    return (
      <View style={[styles.workoutCard, themedStyles.workoutCard]}>
        <View style={styles.workoutCardHeader}>
          <Pressable
            onPress={() => handleViewWorkoutDetails(item.templateId)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveWorkoutId(item.id);
              setShowTemplatePicker(true);
            }}
            delayLongPress={200}
            style={styles.workoutCardPressable}
          >
            <View style={[styles.dayBadge, themedStyles.dayBadge]}>
              <Text style={[styles.dayBadgeText, themedStyles.dayBadgeText]}>Day {dayNumber}</Text>
            </View>
            <View style={styles.workoutCardInfo}>
              <Text style={[styles.workoutNameText, themedStyles.workoutNameInput]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.workoutExerciseCount, themedStyles.workoutExerciseCount]} numberOfLines={1}>
                {template ? `${exerciseCount} exercises` : 'Template not selected'}
              </Text>
            </View>
          </Pressable>
          <View style={styles.workoutActions}>
            <Pressable
              onPress={() => handleMoveWorkout(item.id, 'up')}
              disabled={!canMoveUp}
              style={({ pressed }) => [
                styles.reorderButton,
                themedStyles.reorderButton,
                !canMoveUp && styles.reorderButtonDisabled,
                pressed && canMoveUp && styles.reorderButtonPressed,
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <ChevronUpIcon size={16} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => handleMoveWorkout(item.id, 'down')}
              disabled={!canMoveDown}
              style={({ pressed }) => [
                styles.reorderButton,
                themedStyles.reorderButton,
                !canMoveDown && styles.reorderButtonDisabled,
                pressed && canMoveDown && styles.reorderButtonPressed,
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <ChevronDownIcon size={16} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => handleRemoveWorkout(item.id)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <TrashIcon size={18} color={Colors.error} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }, [handleMoveWorkout, handleRemoveWorkout, handleViewWorkoutDetails, templateMap, workouts.length, colors, themedStyles]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, themedStyles.emptyStateText]}>No workouts added yet</Text>
      <Text style={[styles.emptyStateSubtext, themedStyles.emptyStateSubtext]}>
        {templates.length > 0
          ? 'Tap "Add Workout" to choose from your templates'
          : 'Create a workout template to build programs'}
      </Text>
      {templates.length === 0 && (
        <Pressable
          onPress={() => router.push('/workout/create')}
          style={({ pressed }) => [
            styles.createTemplateButton,
            themedStyles.accentButtonBorder,
            themedStyles.accentButtonBg,
            pressed && themedStyles.accentButtonBgPressed,
          ]}
        >
          <PlusIcon size={16} color={colors.accent} strokeWidth={2} />
          <Text style={[styles.createTemplateText, { color: colors.accent }]}>Create Workout Template</Text>
        </Pressable>
      )}
    </View>
  );

  const saveButtonText = isEditing ? 'Finish edit' : 'Save';
  const titleMeasureText = programName || 'Program Name';
  const titleRowWidth = headerLeftWidth && titleTextWidth
    ? Math.min(titleTextWidth + Spacing.xs + 14, headerLeftWidth)
    : undefined;

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <GestureDetector gesture={panGesture}>
          <View>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, themedStyles.dragHandle]} />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerTopSpacer} />
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.iconButton,
                    themedStyles.closeButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <XMarkIcon size={20} color={colors.error} strokeWidth={2} />
                </Pressable>
              </View>
              <View style={styles.headerContentRow}>
                <View
                  style={styles.headerLeftColumn}
                  onLayout={(event) => setHeaderLeftWidth(event.nativeEvent.layout.width)}
                >
                  <View style={[styles.titleInputWrapper, titleRowWidth ? { width: titleRowWidth } : null]}>
                    <TextInput
                      style={[styles.headerTitleInput, themedStyles.headerTitleInput]}
                      placeholder="Program Name"
                      placeholderTextColor={colors.textSecondary}
                      value={programName}
                      onChangeText={setProgramName}
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
                  <View style={styles.titleMeasureContainer} pointerEvents="none">
                    <Text style={styles.titleMeasureText} onLayout={(event) => setTitleTextWidth(event.nativeEvent.layout.width)}>
                      {titleMeasureText}
                    </Text>
                  </View>
                  {workoutCount > 0 && (
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, themedStyles.statLabel]}>Workouts</Text>
                        <Text style={[styles.statValue, themedStyles.statValue]}>{workoutCount}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, themedStyles.statLabel]}>Exercises</Text>
                        <Text style={[styles.statValue, themedStyles.statValue]}>{totalExercises}</Text>
                      </View>
                    </View>
                  )}
                </View>
                {hasMuscles && workoutCount > 0 && (
                  <View style={styles.headerHeatmap}>
                    <MuscleHeatmap exercises={exercisesWithMuscles} scale={HEATMAP_SCALE} compact />
                  </View>
                )}
              </View>
            </View>
          </View>
        </GestureDetector>

        {/* Workouts List */}
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={(
            <View style={styles.descriptionWrapper}>
              <TextInput
                style={[styles.descriptionInput, themedStyles.descriptionInput]}
                placeholder="Program Description (optional)"
                placeholderTextColor={colors.textSecondary}
                value={programDescription}
                onChangeText={setProgramDescription}
                multiline
                maxLength={180}
                textAlignVertical="top"
              />
            </View>
          )}
          ListFooterComponent={(
            <View style={styles.bottomActions}>
              <Pressable
                onPress={handleAddWorkout}
                style={({ pressed }) => [
                  styles.addWorkoutButton,
                  themedStyles.addWorkoutButton,
                  pressed && styles.addWorkoutButtonPressed,
                ]}
              >
                <Text style={[styles.addWorkoutText, themedStyles.addWorkoutText]}>+ Add Workout</Text>
              </Pressable>

              <GlassButton
                style={styles.primaryActionButton}
                onPress={handleSave}
                disabled={!canSave}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.primaryActionText,
                      themedStyles.primaryActionText,
                      saveButtonText === 'Finish edit' && styles.finishEditText,
                    ]}
                  >
                    {saveButtonText}
                  </Text>
                )}
              </GlassButton>
            </View>
          )}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />

        <Modal
          transparent
          visible={showTemplatePicker}
          animationType="fade"
          onRequestClose={() => {
            setShowTemplatePicker(false);
            setActiveWorkoutId(null);
          }}
        >
          <View style={[styles.modalOverlay, themedStyles.modalOverlay]}>
            <View style={[styles.modalCard, themedStyles.modalCard]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, themedStyles.modalTitle]}>Select a workout template</Text>
                <Pressable
                  onPress={() => {
                    setShowTemplatePicker(false);
                    setActiveWorkoutId(null);
                  }}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    themedStyles.modalCloseButton,
                    pressed && styles.modalCloseButtonPressed,
                  ]}
                >
                  <XMarkIcon size={18} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
              </View>
              <FlatList
                data={templates}
                keyExtractor={(template) => template.id}
                contentContainerStyle={styles.modalList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectTemplate(item.id)}
                    style={({ pressed }) => [
                      styles.modalOption,
                      themedStyles.modalOption,
                      pressed && styles.modalOptionPressed,
                    ]}
                  >
                    <View>
                      <Text style={[styles.modalOptionTitle, themedStyles.modalOptionTitle]}>{item.name}</Text>
                      <Text style={[styles.modalOptionSubtitle, themedStyles.modalOptionSubtitle]}>
                        {item.workouts[0]?.exercises.length || 0} exercises
                      </Text>
                    </View>
                    <PlusIcon size={16} color={colors.accent} strokeWidth={2} />
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={[styles.modalEmptyText, themedStyles.modalEmptyText]}>
                    No templates available yet.
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        <ProgramLimitModal
          visible={showLimitModal}
          programName={programName || 'This program'}
          onClose={() => setShowLimitModal(false)}
        />
        <BaseModal
          visible={showEditIntentModal}
          onClose={() => setShowEditIntentModal(false)}
          title="Edit Active Program?"
          icon={<ExclamationTriangleIcon size={24} color={Colors.warning} />}
        >
          <Text style={modalStyles.message}>
            This program is in progress. How should we handle your edits?
          </Text>
          <View style={[modalStyles.actions, styles.modalActions]}>
            <Pressable
              onPress={async () => {
                setShowEditIntentModal(false);
                await performSave('keep');
              }}
              style={({ pressed }) => [
                modalStyles.successButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.successButtonText, styles.modalActionText]}>
                Apply to future workouts
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                setShowEditIntentModal(false);
                await performSave('restart');
              }}
              style={({ pressed }) => [
                modalStyles.warningButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.warningButtonText, styles.modalActionText]}>
                Restart program
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowEditIntentModal(false)}
              style={({ pressed }) => [
                modalStyles.cancelButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.cancelButtonText, styles.modalActionText]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </BaseModal>

        <BaseModal
          visible={showCancelEditModal}
          onClose={() => setShowCancelEditModal(false)}
          title="Discard edits?"
          icon={<ExclamationTriangleIcon size={24} color={Colors.warning} />}
        >
          <Text style={modalStyles.message}>
            You have unsaved changes. Are you sure you want to discard them?
          </Text>
          <View style={[modalStyles.actions, styles.modalActions]}>
            <Pressable
              onPress={() => setShowCancelEditModal(false)}
              style={({ pressed }) => [
                modalStyles.cancelButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.cancelButtonText, styles.modalActionText]}>
                Keep editing
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDiscardChanges}
              style={({ pressed }) => [
                modalStyles.errorButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.errorButtonText, styles.modalActionText]}>
                Discard
              </Text>
            </Pressable>
          </View>
        </BaseModal>
      </SafeAreaView>
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
    paddingTop: Spacing.xs,
    paddingBottom: 0,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  headerContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  headerTopSpacer: {
    width: 36,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  headerLeftColumn: {
    flex: 1,
    gap: Spacing.sm,
    marginTop: 0,
    paddingRight: Spacing.md,
  },
  headerHeatmap: {
    alignItems: 'flex-end',
  },
  titleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  editIconSlot: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleInput: {
    ...Typography.h4,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textAlign: 'left',
    flex: 1,
    minWidth: 0,
    lineHeight: FontSizes.xl,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    minHeight: ButtonHeights.md,
  },
  titleMeasureContainer: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  titleMeasureText: {
    ...Typography.h4,
    fontFamily: 'BankGothicBT-Medium',
    lineHeight: FontSizes.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xl'],
    marginTop: -Spacing.md,
  },
  descriptionWrapper: {
    paddingBottom: Spacing.md,
  },
  descriptionInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 72,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    color: Colors.success,
    lineHeight: 26,
    paddingBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
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
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  workoutCardPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dayBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.success,
  },
  workoutNameText: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  reorderButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reorderButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  reorderButtonDisabled: {
    opacity: 0.4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  workoutCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  workoutExerciseCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  createTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  createTemplateButtonPressed: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  createTemplateText: {
    ...Typography.bodySmall,
    color: Colors.success,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalList: {
    paddingBottom: Spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: Spacing.sm,
  },
  modalOptionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalOptionTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  modalOptionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalEmptyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  bottomActions: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.lg,
  },
  addWorkoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  addWorkoutButtonPressed: {
    opacity: 0.75,
  },
  addWorkoutText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.success,
  },
  primaryActionButton: {
    height: ButtonHeights.xl,
    borderRadius: BorderRadius.xl,
    width: '100%',
  },
  primaryActionText: {
    ...Typography.button,
  },
  finishEditText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FontSizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalActions: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  modalActionButton: {
    width: '100%',
    flex: 0,
  },
  modalActionText: {
    textAlign: 'center',
  },
});
