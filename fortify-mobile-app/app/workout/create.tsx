import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  DeviceEventEmitter,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XMarkIcon, CalendarDaysIcon, PencilIcon, ClockIcon, MicrophoneIcon, PlusIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { ExerciseVoiceAddSheet } from '@/src/components/workout/ExerciseVoiceAddSheet';
import { PasteWorkoutSheet, TOUR_PASTE_WORKOUT_EXAMPLE } from '@/src/components/workout/PasteWorkoutSheet';
import { PasteWorkoutMatchResolver } from '@/src/components/workout/PasteWorkoutMatchResolver';
import type { UnresolvedPastedExercise } from '@/src/components/workout/PasteWorkoutSheet';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { DateSelector } from '@/src/components/ui/DateSelector';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { attributeSessionToMuscles, bucketIntensity } from '@/src/utils/muscleTaxonomy';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useAuth } from '@/src/contexts/AuthContext';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import type { Exercise } from '@/src/types/exercise';
import { responsiveValue, scale } from '@/src/utils/responsive';
import { format } from 'date-fns';
import { runOnJS } from 'react-native-reanimated';
import { TimerSettingsModal } from '@/src/components/workout/modals/TimerSettingsModal';
import { ensureMicrophonePermission, openMicrophoneSettings } from '@/src/services/microphonePermissionService';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { posthog } from '@/src/config/posthog';
import { completeNewUserChecklistTask } from '@/src/utils/newUserChecklist';

const HEATMAP_SCALE = responsiveValue(0.16, 0.18, 0.2);
const HEADER_COLLAPSE_THRESHOLD = scale(48);

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    mode = 'template',
    date,
    templateId: templateIdParam,
    programId: programIdParam,
    workoutId: workoutIdParam,
  } = useLocalSearchParams<{
    mode?: 'template' | 'log' | 'program';
    date?: string | string[];
    templateId?: string | string[];
    programId?: string | string[];
    workoutId?: string | string[];
  }>();
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam;
  const programId = Array.isArray(programIdParam) ? programIdParam[0] : programIdParam;
  const workoutId = Array.isArray(workoutIdParam) ? workoutIdParam[0] : workoutIdParam;
  const dateValue = Array.isArray(date) ? date[0] : date;
  const isEditingTemplate = mode === 'template' && !!templateId;
  const isEditingProgramWorkout = mode === 'program' && !!programId && !!workoutId;
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();
  const programs = useProgramsStore(s => s.programs);
  const { canCreateWorkoutTemplate, runProFeature } = useProFeatureGate();
  const shouldAnchorAddWithVoice = isTourActive && activeStepId === 'open_add_with_voice';
  const shouldAdvanceVoiceTutorial =
    isTourActive &&
    (activeStepId === 'add_with_voice' || activeStepId === 'confirm_add_with_voice');
  const shouldAnchorWorkoutBuilderClose = isTourActive && activeStepId === 'close_workout_builder';
  const shouldAnchorVoiceAddMultiple = isTourActive && activeStepId === 'voice_add_multiple';
  const shouldAnchorPasteWorkout = isTourActive && activeStepId === 'paste_workout_tip';
  const shouldRunPasteWorkoutDemo = isTourActive && activeStepId === 'paste_workout_demo';

  const normalizeText = useCallback((value: string) => (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  ), []);

  const isTutorialVoiceExercise = useCallback((name: string, setCount: number | null | undefined) => {
    const normalizedName = normalizeText(name);
    return (
      setCount === 3 &&
      normalizedName.includes(normalizeText('barbell')) &&
      normalizedName.includes(normalizeText('bench')) &&
      normalizedName.includes(normalizeText('press'))
    );
  }, [normalizeText]);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    clockButton: {
      backgroundColor: isDark ? 'rgba(163, 163, 163, 0.2)' : 'rgba(0, 0, 0, 0.06)',
    },
    closeButton: {
      backgroundColor: isDark ? colors.errorOverlay : 'rgba(239, 68, 68, 0.1)',
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
    statValue: { color: colors.accent },
    headerDivider: { backgroundColor: colors.borderLight },
    addExercisesButton: {
      borderColor: colors.accentBorder,
    },
    addExercisesText: { color: colors.accent },
    primaryActionText: { color: colors.accentForegroundOnFill },
    compactStatLabel: { color: colors.textTertiary },
    compactStatValue: { color: colors.accent },
  };

  // Editor store actions
  const editorSession = useWorkoutStore(s => s.editorSession);
  const editorDate = useWorkoutStore(s => s.editorDate);
  const initEditorSession = useWorkoutStore(s => s.initEditorSession);
  const initEditorSessionFromTemplate = useWorkoutStore(s => s.initEditorSessionFromTemplate);
  const initEditorSessionFromProgramWorkout = useWorkoutStore(s => s.initEditorSessionFromProgramWorkout);
  const setEditorWorkoutName = useWorkoutStore(s => s.setEditorWorkoutName);
  const setEditorDate = useWorkoutStore(s => s.setEditorDate);
  const addEditorExercises = useWorkoutStore(s => s.addEditorExercises);
  const replaceEditorExercise = useWorkoutStore(s => s.replaceEditorExercise);
  const reorderEditorExercises = useWorkoutStore(s => s.reorderEditorExercises);
  const saveEditorAsTemplate = useWorkoutStore(s => s.saveEditorAsTemplate);
  const saveEditorAsProgramWorkout = useWorkoutStore(s => s.saveEditorAsProgramWorkout);
  const saveEditorAsWorkout = useWorkoutStore(s => s.saveEditorAsWorkout);
  const commitEditorStickyNotesDraft = useWorkoutStore(s => s.commitEditorStickyNotesDraft);
  const clearEditorSession = useWorkoutStore(s => s.clearEditorSession);
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);
  const closeNumberPad = useWorkoutStore(s => s.closeNumberPad);
  const updateEditorSet = useWorkoutStore(s => s.updateEditorSet);
  const openEditorNumberPad = useWorkoutStore(s => s.openEditorNumberPad);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const { profile, user } = useAuth();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showVoiceAddSheet, setShowVoiceAddSheet] = useState(false);
  const [showPasteWorkoutSheet, setShowPasteWorkoutSheet] = useState(false);
  const [unresolvedPastedExercises, setUnresolvedPastedExercises] = useState<UnresolvedPastedExercise[]>([]);
  const [addExerciseSuspended, setAddExerciseSuspended] = useState(false);
  const [replaceExerciseLocalId, setReplaceExerciseLocalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimerSettingsModal, setShowTimerSettingsModal] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [showHeaderDetails, setShowHeaderDetails] = useState(true);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'voice' | 'paste_template'>('manual');
  const didUsePasteTemplateRef = useRef(false);
  const headerDetailsVisibleRef = useRef(true);
  const isNavigating = useRef(false);

  const handleOpenVoiceAdd = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    posthog.capture('voice_add_used');
    await runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
        params: {
          source: 'workout_builder',
          action: 'open_voice_exercise_add',
          mode,
          exerciseCount: editorSession?.exercises.length ?? 0,
        },
      },
      async () => {
        if (isTourActive && activeStepId === 'open_add_with_voice') {
          setShowVoiceAddSheet(true);
          return;
        }

        const permission = await ensureMicrophonePermission();
        if (permission.granted) {
          setShowVoiceAddSheet(true);
          return;
        }

        Alert.alert(
          'Microphone access required',
          permission.canAskAgain
            ? 'Microphone access is required to add exercises by voice.'
            : 'Microphone access is off. Enable it in Settings to add exercises by voice.',
          permission.canAskAgain
            ? [{ text: 'OK' }]
            : [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    void openMicrophoneSettings();
                  },
                },
              ]
        );
      },
    );
  }, [activeStepId, editorSession?.exercises.length, isTourActive, mode, runProFeature]);

  useEffect(() => {
    if (!shouldAnchorAddWithVoice) return;
    if (!showVoiceAddSheet) return;
    setShowVoiceAddSheet(false);
    void advanceStep();
  }, [advanceStep, shouldAnchorAddWithVoice, showVoiceAddSheet]);

  useEffect(() => {
    if (!shouldAnchorPasteWorkout || !showPasteWorkoutSheet) return;
    void advanceStep();
  }, [advanceStep, shouldAnchorPasteWorkout, showPasteWorkoutSheet]);

  // Get exercise IDs and fetch muscle data for heatmap
  const exerciseIds = useMemo(
    () => editorSession?.exercises.map(e => e.exerciseId) || [],
    [editorSession?.exercises]
  );
  const exercisesWithMuscles = useExercisesWithMuscles(exerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;
  const { bodyweightKg } = useLatestBodyweight();

  const heatmapLevels = useMemo(() => {
    if (!editorSession || exercisesWithMuscles.length === 0) return null;
    const hasCompletedSets = editorSession.exercises.some((exercise) =>
      exercise.sets.some((set) => set.isCompleted)
    );
    if (!hasCompletedSets) return null;
    const preferredUnits = profile?.preferred_units ?? 'imperial';

    const exercisesById = new Map<string, Exercise>();
    exercisesWithMuscles.forEach((exercise) => {
      exercisesById.set(exercise.id, exercise);
    });

    const scores = attributeSessionToMuscles(editorSession, exercisesById, {
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
      preferredUnits,
      weightUnitByExercise: weightUnits,
    });
    const levels = bucketIntensity(scores);
    const hasIntensity = Object.values(levels).some((value) => value > 0);
    return hasIntensity ? levels : null;
  }, [editorSession, exercisesWithMuscles, bodyweightKg, profile?.preferred_units, profile?.weight_kg, weightUnits]);

  // Calculate stats for the stats row
  const exerciseCount = editorSession?.exercises.length || 0;
  const totalSets = useMemo(
    () => editorSession?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) || 0,
    [editorSession?.exercises]
  );
  const hasLoggedSets = useMemo(
    () =>
      editorSession?.exercises.some(ex =>
        ex.sets.some(set => set.weight !== null && set.reps !== null)
      ) ?? false,
    [editorSession?.exercises]
  );

  // Initialize editor session on mount
  useEffect(() => {
    if (isEditingProgramWorkout && programId && workoutId) {
      initEditorSessionFromProgramWorkout(programId, workoutId);
    } else if (isEditingTemplate && templateId) {
      initEditorSessionFromTemplate(templateId);
    } else {
      initEditorSession();
    }
    return () => {
      clearEditorSession();
    };
  }, [
    clearEditorSession,
    initEditorSession,
    initEditorSessionFromProgramWorkout,
    initEditorSessionFromTemplate,
    isEditingProgramWorkout,
    isEditingTemplate,
    programId,
    templateId,
    workoutId,
  ]);

  useFocusEffect(
    useCallback(() => {
      setAddExerciseSuspended(false);
      return undefined;
    }, [])
  );

  // Set date from URL parameter when logging past workout
  useEffect(() => {
    if (!isTourActive) return;
    if (activeStepId !== 'add_workout_routine') return;
    void advanceStep();
  }, [activeStepId, advanceStep, isTourActive]);

  useEffect(() => {
    if (mode === 'log' && dateValue) {
      setEditorDate(new Date(dateValue));
    }
  }, [mode, dateValue, setEditorDate]);

  // Check if we can save
  const canSave = (editorSession?.name?.trim()?.length ?? 0) > 0 &&
    (editorSession?.exercises?.length ?? 0) > 0 &&
    (mode !== 'log' || hasLoggedSets) &&
    !isSaving;
  const savedWorkoutTemplateCount = useMemo(
    () => programs.filter((program) => program.isTemplate).length,
    [programs],
  );
  const useScrollableHeaderDetails = mode !== 'log';
  const showCompactStats = !showHeaderDetails && mode !== 'log' && exerciseCount > 0;

  const handleListScroll = useCallback((event: any) => {
    if (mode === 'log') {
      return;
    }
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowDetails = offsetY < HEADER_COLLAPSE_THRESHOLD;
    if (headerDetailsVisibleRef.current !== shouldShowDetails) {
      headerDetailsVisibleRef.current = shouldShowDetails;
      setShowHeaderDetails(shouldShowDetails);
    }
  }, [mode]);

  // Handle close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeNumberPad();
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

  // Handle adding exercises from the exercise modal
  const handleAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string; initialSetCount?: number | null }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addEditorExercises(exercisesToAdd);
    exercisesToAdd.forEach(() => posthog.capture('exercise_added', { method: 'search' }));
    setReplaceExerciseLocalId(null);
    setShowAddExerciseModal(false);
    setAddExerciseSuspended(false);
  }, [addEditorExercises]);

  const handleVoiceAddExercises = useCallback((exercisesToAdd: Array<{ id: string; name: string; initialSetCount?: number | null }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addEditorExercises(exercisesToAdd);
    setCreationMethod('voice');
    exercisesToAdd.forEach(() => posthog.capture('exercise_added', { method: 'voice' }));
    setShowVoiceAddSheet(false);

    if (shouldAdvanceVoiceTutorial) {
      const didAddTargetExercise = exercisesToAdd.some((exercise) => (
        isTutorialVoiceExercise(exercise.name, exercise.initialSetCount)
      ));

      if (didAddTargetExercise) {
        void advanceStep();
      }
    }
  }, [addEditorExercises, advanceStep, isTutorialVoiceExercise, shouldAdvanceVoiceTutorial]);

  const handleReplaceExercise = useCallback((exerciseLocalId: string) => {
    setReplaceExerciseLocalId(exerciseLocalId);
    setAddExerciseSuspended(false);
    setShowAddExerciseModal(true);
  }, []);

  const handleMoveExercise = useCallback((exerciseLocalId: string, direction: 'up' | 'down') => {
    const exercises = editorSession?.exercises ?? [];
    const index = exercises.findIndex((exercise) => exercise.localId === exerciseLocalId);
    if (index < 0) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= exercises.length) return;
    reorderEditorExercises(index, nextIndex);
  }, [editorSession?.exercises, reorderEditorExercises]);

  const handleModalExerciseDetails = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setAddExerciseSuspended(true);
    router.push(`/exercise/${exerciseId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleViewExerciseDetails = useCallback((exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}?source=workout-modal`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  }, [router]);

  // Handle save
  const performSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      if (mode === 'log') {
        await saveEditorAsWorkout();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        DeviceEventEmitter.emit('workout-updated');
        router.back();
      } else if (isEditingProgramWorkout && programId && workoutId) {
        const didSave = await saveEditorAsProgramWorkout(programId, workoutId);
        if (didSave) {
          await commitEditorStickyNotesDraft();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          DeviceEventEmitter.emit('workout-updated');
          router.back();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setIsSaving(false);
        }
      } else {
        const updatedTemplateId = isEditingTemplate && templateId
          ? await saveEditorAsTemplate(templateId)
          : await saveEditorAsTemplate();
        if (updatedTemplateId) {
          if (creationMethod === 'paste_template' || didUsePasteTemplateRef.current) {
            await completeNewUserChecklistTask('make_workout_template_from_text', user?.id ?? null);
          }
          if (!isEditingTemplate && !isEditingProgramWorkout) {
            posthog.capture('workout_created', {
              method: creationMethod,
              exercise_count: editorSession?.exercises.length ?? 0,
              is_first_workout: savedWorkoutTemplateCount === 0,
            });
          }
          await commitEditorStickyNotesDraft();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          DeviceEventEmitter.emit('workout-updated');
          if (isEditingTemplate && templateId && updatedTemplateId !== templateId) {
            // A seeded/default template is forked to a new ID when edited. Return
            // to the existing detail screen, then replace its now-stale route
            // directly. Relying on a DeviceEventEmitter redirect here races the
            // back transition and can leave the old detail route blank forever.
            router.back();
            setTimeout(() => {
              router.replace(`/workouts/${updatedTemplateId}`);
            }, 0);
          } else {
            router.back();
          }
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

  const handleSave = async () => {
    if (!canSave) return;

    const isCreatingSavedWorkoutTemplate = mode !== 'log' && !isEditingTemplate && !isEditingProgramWorkout;
    if (isCreatingSavedWorkoutTemplate && !canCreateWorkoutTemplate(savedWorkoutTemplateCount)) {
      await runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.workoutLimit,
          params: {
            source: 'workout_builder',
            action: 'create_workout_template',
            workoutTemplateCount: savedWorkoutTemplateCount,
          },
        },
        performSave,
      );
      return;
    }

    await performSave();
  };

  const handleSaveTimerSettings = (normal: number, warmup: number, dropset: number) => {
    updateRestTimerSettings({
      normalSeconds: normal,
      warmupSeconds: warmup,
      dropsetSeconds: dropset,
    });
  };

  // Handle number pad confirm
  const handleNumberPadConfirm = useCallback((value: number | null) => {
    if (!activeNumberPad) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;
    const resolvedValue = value ?? activeNumberPad.inputSuggestion?.[inputType] ?? null;
    updateEditorSet(exerciseLocalId, setLocalId, { [inputType]: resolvedValue });
    closeNumberPad();
  }, [activeNumberPad, updateEditorSet, closeNumberPad]);

  // Handle number pad next - navigate to next input
  const handleNumberPadNext = useCallback((value: number | null) => {
    if (!activeNumberPad || !editorSession) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;
    const resolvedValue = value ?? activeNumberPad.inputSuggestion?.[inputType] ?? null;

    // Save current value
    updateEditorSet(exerciseLocalId, setLocalId, { [inputType]: resolvedValue });

    // Find current exercise and set
    const exercise = editorSession.exercises.find(e => e.localId === exerciseLocalId);
    const setIndex = exercise?.sets.findIndex(s => s.localId === setLocalId) ?? -1;

    if (inputType === 'weight') {
      // Go to reps (same set)
      openEditorNumberPad(exerciseLocalId, setLocalId, 'reps', activeNumberPad.inputSuggestion);
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

  const replaceExerciseIdToAllow = useMemo(() => {
    if (!replaceExerciseLocalId) return null;
    return editorSession?.exercises.find((exercise) => exercise.localId === replaceExerciseLocalId)?.exerciseId ?? null;
  }, [editorSession, replaceExerciseLocalId]);

  const handleModalReplaceExercise = useCallback((exerciseId: string, exerciseName: string) => {
    if (!replaceExerciseLocalId) return;
    replaceEditorExercise(replaceExerciseLocalId, exerciseId, exerciseName);
    setReplaceExerciseLocalId(null);
  }, [replaceEditorExercise, replaceExerciseLocalId]);

  // Render exercise card
  const firstExerciseLocalId = editorSession?.exercises[0]?.localId ?? null;

  const renderExerciseCard = useCallback(({ item, index }: { item: { localId: string }; index: number }) => {
    const exerciseTotal = editorSession?.exercises.length ?? 0;
    const card = (
      <ExerciseCard
        exerciseLocalId={item.localId}
        onReplace={handleReplaceExercise}
        onViewDetails={handleViewExerciseDetails}
        onMoveUp={(exerciseLocalId) => handleMoveExercise(exerciseLocalId, 'up')}
        onMoveDown={(exerciseLocalId) => handleMoveExercise(exerciseLocalId, 'down')}
        canMoveUp={index > 0}
        canMoveDown={index < exerciseTotal - 1}
        useEditor={true}
        deferStickyNoteSave={mode !== 'log'}
        showCheckboxes={mode === 'log'}
      />
    );

    if (shouldAnchorVoiceAddMultiple && item.localId === firstExerciseLocalId) {
      return (
        <TourAnchor id={TOUR_ANCHOR_IDS.workoutExerciseCard}>
          {card}
        </TourAnchor>
      );
    }

    return card;
  }, [
    editorSession?.exercises.length,
    firstExerciseLocalId,
    handleMoveExercise,
    handleReplaceExercise,
    handleViewExerciseDetails,
    mode,
    shouldAnchorVoiceAddMultiple,
  ]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, themedStyles.emptyStateText]}>No exercises added yet</Text>
      <Text style={[styles.emptyStateSubtext, themedStyles.emptyStateSubtext]}>
        Add exercises using one of{'\n'}the three options below
      </Text>
    </View>
  );

  const saveButtonText = mode === 'log'
    ? 'Log'
    : (isEditingTemplate || isEditingProgramWorkout ? 'Finish edit' : 'Create Workout');
  const isFinishEdit = saveButtonText === 'Finish edit';
  const headerDetailsContent = (
    <View style={[styles.headerContentRow, useScrollableHeaderDetails && styles.listHeaderContentRow]}>
      <View style={styles.headerLeftColumn}>
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
        {mode !== 'log' && exerciseCount > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, themedStyles.statLabel]}>Exercises</Text>
              <Text style={[styles.statValue, themedStyles.statValue]}>{exerciseCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, themedStyles.statLabel]}>Sets</Text>
              <Text style={[styles.statValue, themedStyles.statValue]}>{totalSets}</Text>
            </View>
          </View>
        )}
      </View>
      {mode !== 'log' && hasMuscles && (
        <View style={styles.headerHeatmap}>
          <MuscleHeatmap
            muscleLevels={heatmapLevels ?? undefined}
            exercises={!heatmapLevels ? exercisesWithMuscles : undefined}
            scale={HEATMAP_SCALE}
            compact
          />
        </View>
      )}
    </View>
  );

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
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowTimerSettingsModal(true);
                  }}
                  style={({ pressed }) => [
                    styles.iconButton,
                    themedStyles.clockButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <ClockIcon size={20} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
                <View style={styles.headerTopCenter}>
                  {showCompactStats && (
                    <View style={[styles.compactStatsRow, styles.compactStatsRowOffset]}>
                      <View style={styles.compactStat}>
                        <Text style={[styles.compactStatLabel, themedStyles.compactStatLabel]}>Exercises</Text>
                        <Text style={[styles.compactStatValue, themedStyles.compactStatValue]}>{exerciseCount}</Text>
                      </View>
                      <View style={styles.compactStat}>
                        <Text style={[styles.compactStatLabel, themedStyles.compactStatLabel]}>Sets</Text>
                        <Text style={[styles.compactStatValue, themedStyles.compactStatValue]}>{totalSets}</Text>
                      </View>
                    </View>
                  )}
                </View>
                {shouldAnchorWorkoutBuilderClose ? (
                  <TourAnchor id={TOUR_ANCHOR_IDS.workoutBuilderCloseButton}>
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
                  </TourAnchor>
                ) : (
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
                )}
              </View>
              {!useScrollableHeaderDetails && showHeaderDetails && (
                <>
                  <View style={[styles.headerDivider, themedStyles.headerDivider]} />
                  {headerDetailsContent}
                </>
              )}
            </View>
            {useScrollableHeaderDetails && (
              <View style={[styles.headerDivider, themedStyles.headerDivider]} />
            )}
          </View>
        </GestureDetector>

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

        {/* Exercise List */}
        <FlatList
          data={editorSession?.exercises || []}
          renderItem={renderExerciseCard}
          keyExtractor={item => item.localId}
          extraData={canSave}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            useScrollableHeaderDetails ? (
              <View style={styles.listHeaderDetails}>
                {headerDetailsContent}
              </View>
            ) : null
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={(
            <View style={styles.bottomActions}>
              <View style={styles.secondaryActionsRow}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReplaceExerciseLocalId(null);
                    setShowAddExerciseModal(true);
                  }}
                  style={({ pressed }) => [
                    styles.addExercisesButton,
                    styles.secondaryActionButton,
                    themedStyles.addExercisesButton,
                    pressed && styles.addExercisesButtonPressed,
                  ]}
                >
                  <Text
                    style={[styles.secondaryActionText, themedStyles.addExercisesText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    + Add Exercises
                  </Text>
                </Pressable>

                {shouldAnchorAddWithVoice ? (
                  <TourAnchor id={TOUR_ANCHOR_IDS.addWithVoice}>
                    <Pressable
                      onPress={() => {
                        void handleOpenVoiceAdd();
                      }}
                      style={({ pressed }) => [
                        styles.addExercisesButton,
                        styles.secondaryActionButton,
                        themedStyles.addExercisesButton,
                        styles.voiceAddButton,
                        pressed && styles.addExercisesButtonPressed,
                      ]}
                    >
                      <View style={styles.voiceAddButtonContent}>
                        <MicrophoneIcon size={18} color={colors.accent} strokeWidth={2} />
                        <Text
                          style={[styles.secondaryActionText, themedStyles.addExercisesText]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.72}
                        >
                          Add with Voice
                        </Text>
                      </View>
                    </Pressable>
                  </TourAnchor>
                ) : (
                  <Pressable
                    onPress={() => {
                      void handleOpenVoiceAdd();
                    }}
                    style={({ pressed }) => [
                      styles.addExercisesButton,
                      styles.secondaryActionButton,
                      themedStyles.addExercisesButton,
                      styles.voiceAddButton,
                      pressed && styles.addExercisesButtonPressed,
                    ]}
                  >
                    <View style={styles.voiceAddButtonContent}>
                      <MicrophoneIcon size={18} color={colors.accent} strokeWidth={2} />
                      <Text
                        style={[styles.secondaryActionText, themedStyles.addExercisesText]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                      >
                        Add with Voice
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
              {shouldAnchorPasteWorkout ? (
                <TourAnchor id={TOUR_ANCHOR_IDS.pasteWorkout}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPasteWorkoutSheet(true);
                    }}
                    style={({ pressed }) => [
                      styles.addExercisesButton,
                      styles.pasteWorkoutButton,
                      themedStyles.addExercisesButton,
                      pressed && styles.addExercisesButtonPressed,
                    ]}
                  >
                    <View style={styles.pasteWorkoutButtonContent}>
                      <PlusIcon size={18} color={colors.accent} strokeWidth={2.4} />
                      <Text
                        style={[styles.secondaryActionText, themedStyles.addExercisesText]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                      >
                        Add Exercises by Text
                      </Text>
                    </View>
                  </Pressable>
                </TourAnchor>
              ) : (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPasteWorkoutSheet(true);
                  }}
                  style={({ pressed }) => [
                    styles.addExercisesButton,
                    styles.pasteWorkoutButton,
                    themedStyles.addExercisesButton,
                    pressed && styles.addExercisesButtonPressed,
                  ]}
                >
                  <View style={styles.pasteWorkoutButtonContent}>
                    <PlusIcon size={18} color={colors.accent} strokeWidth={2.4} />
                    <Text
                      style={[styles.secondaryActionText, themedStyles.addExercisesText]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.72}
                    >
                      Add Exercises by Text
                    </Text>
                  </View>
                </Pressable>
              )}

              <GlassButton
                style={styles.primaryActionButton}
                onPress={handleSave}
                disabled={!canSave}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.accentForegroundOnFill} />
                ) : (
                  <Text
                    style={[
                      styles.primaryActionText,
                      themedStyles.primaryActionText,
                      isFinishEdit && styles.finishEditText,
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
          onScroll={handleListScroll}
          scrollEventThrottle={16}
        />
      </SafeAreaView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => {
          setShowAddExerciseModal(false);
          setReplaceExerciseLocalId(null);
          setAddExerciseSuspended(false);
        }}
        suspended={addExerciseSuspended}
        replaceMode={replaceExerciseLocalId !== null}
        exerciseLocalIdToReplace={replaceExerciseLocalId ?? undefined}
        replaceExerciseIdToAllow={replaceExerciseIdToAllow}
        onReplaceExerciseCallback={handleModalReplaceExercise}
        onAddExercisesCallback={handleAddExercises}
        existingExerciseIds={editorSession?.exercises.map(ex => ex.exerciseId) || []}
        onOpenExerciseDetails={handleModalExerciseDetails}
      />

      {showVoiceAddSheet ? (
      <ExerciseVoiceAddSheet
          visible
          existingExerciseIds={editorSession?.exercises.map(ex => ex.exerciseId) || []}
          onAddExercises={handleVoiceAddExercises}
          onClose={() => setShowVoiceAddSheet(false)}
        />
      ) : null}

      {/* Number Pad Modal */}
      <NumberPadModal
        visible={!!activeNumberPad}
        onConfirm={handleNumberPadConfirm}
        onNext={handleNumberPadNext}
        onClose={closeNumberPad}
        inputType={activeNumberPad?.inputType || 'weight'}
        useEditor={true}
      />
      <PasteWorkoutSheet
        visible={showPasteWorkoutSheet}
        onClose={() => {
          if (!shouldRunPasteWorkoutDemo) setShowPasteWorkoutSheet(false);
        }}
        onAdd={(entries, workoutName) => {
          didUsePasteTemplateRef.current = true;
          addEditorExercises(entries);
          setCreationMethod('paste_template');
          posthog.capture('notes_to_template_used');
          entries.forEach(() => posthog.capture('exercise_added', { method: 'paste' }));
          if (workoutName && !editorSession?.name.trim()) {
            setEditorWorkoutName(workoutName);
          }
        }}
        onResolve={(entries) => {
          didUsePasteTemplateRef.current = true;
          setCreationMethod('paste_template');
          setUnresolvedPastedExercises(entries);
        }}
        tourExampleText={shouldRunPasteWorkoutDemo ? TOUR_PASTE_WORKOUT_EXAMPLE : undefined}
        onTourExampleImported={() => {
          setShowPasteWorkoutSheet(false);
          void advanceStep();
        }}
      />
      <PasteWorkoutMatchResolver
        entries={unresolvedPastedExercises}
        onDismiss={() => setUnresolvedPastedExercises([])}
        onComplete={(entries) => {
          didUsePasteTemplateRef.current = true;
          setCreationMethod('paste_template');
          addEditorExercises(entries);
          setUnresolvedPastedExercises([]);
        }}
      />

      <TimerSettingsModal
        visible={showTimerSettingsModal}
        onClose={() => setShowTimerSettingsModal(false)}
        onSave={handleSaveTimerSettings}
        initialNormalDuration={restTimerSettings.normalSeconds}
        initialWarmupDuration={restTimerSettings.warmupSeconds}
        initialDropDuration={restTimerSettings.dropsetSeconds}
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
  headerTopCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  compactStatsRowOffset: {
    marginTop: scale(6),
  },
  compactStat: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactStatLabel: {
    fontSize: FontSizes.xs,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  compactStatValue: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    lineHeight: FontSizes.base + 2,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  listHeaderContentRow: {
    marginTop: 0,
  },
  listHeaderDetails: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
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
    width: '100%',
    minHeight: ButtonHeights.md,
    backgroundColor: 'transparent',
    borderWidth: 0,
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
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: ButtonHeights.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xl'],
    marginTop: -Spacing.md,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    color: Colors.success,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'BankGothicBT-Medium',
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
    paddingBottom: Spacing.lg,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    width: '100%',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  bottomActions: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.lg,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.md,
  },
  addExercisesButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  addExercisesButtonPressed: {
    opacity: 0.75,
  },
  secondaryActionButton: {
    flex: 1,
    width: undefined,
    minHeight: ButtonHeights.xl,
    paddingHorizontal: Spacing.md,
  },
  pasteWorkoutButton: {
    minHeight: ButtonHeights.xl,
  },
  pasteWorkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  voiceAddButton: {
    gap: Spacing.xs,
  },
  voiceAddButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  secondaryActionText: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    letterSpacing: 0.6,
  },
  addExercisesText: {
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
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  finishEditText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FontSizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
