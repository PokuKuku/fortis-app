import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { usePostHog } from 'posthog-react-native';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  useWorkoutStore,
  hasTemplateModifications,
  getRestTimerColor,
  getRestTimerBackgroundColor,
} from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { useRestTimerTick } from '@/src/hooks/useRestTimerTick';
import { useElapsedTime } from '@/src/hooks/useElapsedTime';
import { WorkoutHeaderDetails, WorkoutHeaderTopBar } from '@/src/components/workout/WorkoutHeader';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { WorkoutVoiceLogSheet } from '@/src/components/workout/WorkoutVoiceLogSheet';
import { ExerciseVoiceAddSheet } from '@/src/components/workout/ExerciseVoiceAddSheet';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { RestTimerControls } from '@/src/components/workout/modals/RestTimerControls';
import { TimerSettingsModal } from '@/src/components/workout/modals/TimerSettingsModal';
import { CancelWorkoutModal } from '@/src/components/workout/modals/CancelWorkoutModal';
import { WorkoutCompleteModal } from '@/src/components/workout/modals/WorkoutCompleteModal';
import { FinishConfirmationModal } from '@/src/components/workout/modals/FinishConfirmationModal';
import { ReplaceExerciseConfirmModal } from '@/src/components/workout/modals/ReplaceExerciseConfirmModal';
import { RestTimerCompleteModal } from '@/src/components/workout/modals/RestTimerCompleteModal';
import { SaveAsTemplateModal } from '@/src/components/workout/modals/SaveAsTemplateModal';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { WorkoutSession } from '@/src/types/workout';
import type { Exercise } from '@/src/types/exercise';
import { GlassButton } from '@/components/GlassButton';
import { getExerciseById } from '@/src/services/exerciseService';
import { ensureMicrophonePermission, openMicrophoneSettings } from '@/src/services/microphonePermissionService';
import { attributeSessionToMuscles, bucketIntensity } from '@/src/utils/muscleTaxonomy';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useAuth } from '@/src/contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { MicrophoneIcon } from 'react-native-heroicons/outline';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { resolveActiveNumberPadSetUpdates } from '@/src/utils/activeWorkoutNumberPad';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const LIST_PADDING_TOP = Math.max(0, scale(Spacing.lg) - scale(6));
const EMPTY_GAP = scale(Spacing.md);
const EMPTY_PADDING_BOTTOM = scale(100);
const EMPTY_TITLE_SIZE = moderateScale(14);
const EMPTY_DESCRIPTION_SIZE = moderateScale(14);
const BOTTOM_ACTIONS_PADDING_TOP = scale(Spacing.lg);
const BOTTOM_ACTIONS_PADDING_BOTTOM = scale(140);
const BOTTOM_ACTIONS_GAP = scale(Spacing.lg);
const SECONDARY_ACTIONS_GAP = scale(Spacing.sm);
const ADD_BUTTON_PADDING_Y = scale(Spacing.lg);
const ADD_BUTTON_TEXT_SIZE = moderateScale(14);
const FINISH_BUTTON_HEIGHT = scale(44);
const FINISH_BUTTON_TEXT_SIZE = moderateScale(14);
const DRAG_HANDLE_WIDTH = scale(36);
const DRAG_HANDLE_HEIGHT = scale(4);
const DRAG_HANDLE_RADIUS = scale(2);
const NUMBER_PAD_PADDING = scale(380);
const HEADER_COLLAPSE_THRESHOLD = scale(48);

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { colors, isDark } = useTheme();
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const addExercises = useWorkoutStore(s => s.addExercises);
  const workoutStartTime = useWorkoutStore(s => s.workoutStartTime);
  const pausedElapsedSeconds = useWorkoutStore(s => s.pausedElapsedSeconds);
  const completedSessions = useWorkoutStore(s => s.completedSessions);
  const openFirstWorkoutStreakModal = useWorkoutStore(s => s.openFirstWorkoutStreakModal);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    headerDivider: { backgroundColor: colors.borderLight },
    emptyLine: {
      backgroundColor: isDark ? 'rgba(163, 163, 163, 0.3)' : 'rgba(0, 0, 0, 0.15)',
    },
    emptyTitle: { color: colors.textSecondary },
    emptyDescription: { color: colors.textTertiary },
    finishButtonText: { color: colors.accentForegroundOnFill },
    addButton: { borderColor: colors.accentBorder },
    addButtonText: { color: colors.accent },
    finishButtonShadow: { shadowColor: colors.accent },
  };
  const cancelWorkout = useWorkoutStore(s => s.cancelWorkout);
  const finishWorkout = useWorkoutStore(s => s.finishWorkout);
  const restTimer = useWorkoutStore(s => s.restTimer);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const restTimerNextStartSeconds = useWorkoutStore(s => s.restTimerNextStartSeconds);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);
  const isNumberPadVisible = useWorkoutStore(s => s.activeNumberPad !== null);
  const numberPadInputType = useWorkoutStore(s => s.activeNumberPad?.inputType ?? 'weight');
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const { profile } = useAuth();
  const updateSet = useWorkoutStore(s => s.updateSet);
  const closeNumberPad = useWorkoutStore(s => s.closeNumberPad);
  const openNumberPad = useWorkoutStore(s => s.openNumberPad);
  const completeSet = useWorkoutStore(s => s.completeSet);
  const setNumberPadError = useWorkoutStore(s => s.setNumberPadError);
  const showRestTimerComplete = useWorkoutStore(s => s.showRestTimerComplete);
  const dismissRestTimerComplete = useWorkoutStore(s => s.dismissRestTimerComplete);
  const workoutOverlayCount = useWorkoutStore(s => s.workoutOverlayCount);
  const updateCompletedWorkoutName = useWorkoutStore(s => s.updateCompletedWorkoutName);
  const updateActiveSessionName = useWorkoutStore(s => s.updateActiveSessionName);
  const programs = useProgramsStore(s => s.programs);
  const updateWorkoutTemplate = useProgramsStore(s => s.updateWorkoutTemplate);
  const updateProgramWorkout = useProgramsStore(s => s.updateProgramWorkout);
  const { runProFeature } = useProFeatureGate();
  const elapsed = useElapsedTime();

  const templateForSession = useMemo(() => {
    if (!activeSession?.programId) return null;
    return programs.find((program) => program.id === activeSession.programId && program.isTemplate) || null;
  }, [activeSession?.programId, programs]);

  const programForSession = useMemo(() => {
    if (!activeSession?.programId) return null;
    return programs.find((program) => program.id === activeSession.programId && !program.isTemplate) || null;
  }, [activeSession?.programId, programs]);

  const programWorkoutForSession = useMemo(() => {
    if (!activeSession?.programWorkoutId) return null;
    return programForSession?.workouts.find((workout) => workout.id === activeSession.programWorkoutId) || null;
  }, [activeSession?.programWorkoutId, programForSession]);

  const hasSessionTemplateModifications = hasTemplateModifications(activeSession);
  const canUpdateTemplate = !!templateForSession && hasSessionTemplateModifications;
  const canUpdateProgramWorkout = !!programForSession && !!programWorkoutForSession && hasSessionTemplateModifications;
  const [showHeaderDetails, setShowHeaderDetails] = useState(true);
  const headerDetailsVisibleRef = useRef(true);
  const idleSeconds = restTimerNextStartSeconds ?? restTimerSettings.normalSeconds;
  const hasRestCountdown = restTimer.remainingSeconds > 0;
  const displaySeconds = hasRestCountdown ? restTimer.remainingSeconds : idleSeconds;
  const restTimerColor = hasRestCountdown
    ? getRestTimerColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : colors.textSecondary;
  const restTimerBgColor = hasRestCountdown
    ? getRestTimerBackgroundColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : 'rgba(156, 163, 175, 0.2)';

  const handleDismiss = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleListScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowDetails = offsetY < HEADER_COLLAPSE_THRESHOLD;
    if (headerDetailsVisibleRef.current !== shouldShowDetails) {
      headerDetailsVisibleRef.current = shouldShowDetails;
      setShowHeaderDetails(shouldShowDetails);
    }
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onEnd((event) => {
      const shouldDismiss = event.translationY > 120 || event.velocityY > 1200;
      if (shouldDismiss) {
        runOnJS(handleDismiss)();
      }
    });

  // Modal visibility states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimerSettingsModal, setShowTimerSettingsModal] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showVoiceAddSheet, setShowVoiceAddSheet] = useState(false);
  const [addExerciseSuspended, setAddExerciseSuspended] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [pendingSaveTemplateModalOpen, setPendingSaveTemplateModalOpen] = useState(false);
  const [showRestTimerBanner, setShowRestTimerBanner] = useState(false);
  const [restTimerCompleteVisible, setRestTimerCompleteVisible] = useState(false);
  const [voiceExerciseLocalId, setVoiceExerciseLocalId] = useState<string | null>(null);
  const [finishSnapshot, setFinishSnapshot] = useState<{
    durationSeconds: number;
    completedExercises: number;
  } | null>(null);

  // Replace exercise state
  const [replaceExerciseLocalId, setReplaceExerciseLocalId] = useState<string | null>(null);
  const [showReplaceConfirmModal, setShowReplaceConfirmModal] = useState(false);
  const [pendingReplaceExerciseLocalId, setPendingReplaceExerciseLocalId] = useState<string | null>(null);
  const isNavigating = useRef(false);
  const restTimerCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBlockingModalOpen = showAddExerciseModal
    || showVoiceAddSheet
    || showTimerSettingsModal
    || showRestTimerControls
    || showCancelModal
    || showFinishConfirmModal
    || showFinishModal
    || showReplaceConfirmModal
    || showSaveTemplateModal
    || isNumberPadVisible
    || workoutOverlayCount > 0;

  useEffect(() => {
    if (showRestTimerComplete && showAddExerciseModal) {
      setShowRestTimerBanner(true);
      dismissRestTimerComplete();
    }
  }, [showRestTimerComplete, showAddExerciseModal, dismissRestTimerComplete]);

  useEffect(() => {
    posthog.capture('workout_started', {
      from_program: Boolean(activeSession?.programId),
      exercise_count: activeSession?.exercises?.length ?? 0,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingSaveTemplateModalOpen || showFinishModal) {
      return;
    }

    const timer = setTimeout(() => {
      setPendingSaveTemplateModalOpen(false);
      setShowSaveTemplateModal(true);
    }, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [pendingSaveTemplateModalOpen, showFinishModal]);

  useEffect(() => {
    if (restTimerCompleteTimeoutRef.current) {
      clearTimeout(restTimerCompleteTimeoutRef.current);
      restTimerCompleteTimeoutRef.current = null;
    }

    if (!showRestTimerComplete) {
      setRestTimerCompleteVisible(false);
      return;
    }

    if (isBlockingModalOpen) {
      setRestTimerCompleteVisible(false);
      return;
    }

    // Defer showing to avoid iOS modal handoff freezes.
    restTimerCompleteTimeoutRef.current = setTimeout(() => {
      setRestTimerCompleteVisible(true);
    }, 200);

    return () => {
      if (restTimerCompleteTimeoutRef.current) {
        clearTimeout(restTimerCompleteTimeoutRef.current);
        restTimerCompleteTimeoutRef.current = null;
      }
    };
  }, [showRestTimerComplete, isBlockingModalOpen]);

  // Initialize rest timer tick
  useRestTimerTick();

  useFocusEffect(
    useCallback(() => {
      setAddExerciseSuspended(false);
      return undefined;
    }, [])
  );

  // Heatmap: Cache for exercise muscle data
  const [exerciseMuscleCache, setExerciseMuscleCache] = useState<Record<string, Exercise>>({});

  // Fetch muscle data for exercises when they change
  useEffect(() => {
    if (!activeSession?.exercises) return;

    const fetchMissingMuscles = async () => {
      const exerciseIds = activeSession.exercises.map(e => e.exerciseId);
      const missingIds = exerciseIds.filter(id => !exerciseMuscleCache[id]);

      if (missingIds.length === 0) return;

      const results = await Promise.all(
        missingIds.map(async id => {
          const exercise = await getExerciseById(id);
          return exercise ? { id, exercise } : null;
        })
      );

      const newCache: typeof exerciseMuscleCache = {};
      results.forEach(result => {
        if (result) {
          newCache[result.id] = result.exercise;
        }
      });

      if (Object.keys(newCache).length > 0) {
        setExerciseMuscleCache(prev => ({ ...prev, ...newCache }));
      }
    };

    fetchMissingMuscles();
  }, [activeSession?.exercises.map(e => e.exerciseId).join(',')]);

  const { bodyweightKg } = useLatestBodyweight();

  // Compute muscle intensity levels for heatmap (volume-based)
  const muscleLevels = useMemo(() => {
    if (!activeSession) return {};
    const preferredUnits = profile?.preferred_units ?? 'imperial';
    const exercisesById = new Map<string, Exercise>();
    Object.entries(exerciseMuscleCache).forEach(([id, exercise]) => {
      exercisesById.set(id, exercise);
    });
    const scores = attributeSessionToMuscles(activeSession, exercisesById, {
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
      preferredUnits,
      weightUnitByExercise: weightUnits,
    });
    return bucketIntensity(scores);
  }, [activeSession, exerciseMuscleCache, bodyweightKg, profile?.preferred_units, profile?.weight_kg, weightUnits]);

  // Handle cancel workout
  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    posthog.capture('workout_cancelled', {
      exercise_count: activeSession?.exercises?.length ?? 0,
      elapsed_seconds: elapsed,
    });
    cancelWorkout();
    setShowCancelModal(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle add exercise
  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddExerciseSuspended(false);
    setShowAddExerciseModal(true);
  };

  const handleOpenVoiceAdd = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    posthog.capture('voice_add_used');
    await runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
        params: {
          source: 'active_workout',
          action: 'open_voice_exercise_add',
          exerciseCount: activeSession?.exercises.length ?? 0,
        },
      },
      async () => {
        if (isTourActive) {
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
  };

  // Handle replace exercise (opens AddExerciseModal in replace mode)
  const handleReplaceExercise = (exerciseLocalId: string) => {
    // Check if exercise has any completed sets
    const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
    const hasCompletedSets = exercise?.sets.some(set => set.isCompleted) ?? false;

    if (hasCompletedSets) {
      // Show confirmation modal first
      setPendingReplaceExerciseLocalId(exerciseLocalId);
      setShowReplaceConfirmModal(true);
    } else {
      // No completed sets, proceed directly
      setReplaceExerciseLocalId(exerciseLocalId);
      setShowAddExerciseModal(true);
    }
  };

  // Handle confirmed replace (after user confirms in modal)
  const handleConfirmReplace = () => {
    setShowReplaceConfirmModal(false);
    if (pendingReplaceExerciseLocalId) {
      setReplaceExerciseLocalId(pendingReplaceExerciseLocalId);
      setPendingReplaceExerciseLocalId(null);
      // Small delay to allow confirmation modal to close
      setTimeout(() => {
        setShowAddExerciseModal(true);
      }, 150);
    }
  };

  // Handle view exercise details
  const handleViewExerciseDetails = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}?source=workout-modal`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleModalExerciseDetails = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setAddExerciseSuspended(true);
    router.push(`/exercise/${exerciseId}?source=workout-modal`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle close add exercise modal
  const handleCloseAddExerciseModal = () => {
    setShowAddExerciseModal(false);
    setReplaceExerciseLocalId(null);
    setShowRestTimerBanner(false);
    setAddExerciseSuspended(false);
  };

  const handleVoiceAddExercises = (exercisesToAdd: Array<{ id: string; name: string; initialSetCount?: number | null }>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addExercises(exercisesToAdd);
    exercisesToAdd.forEach(() => posthog.capture('exercise_added', { method: 'voice' }));
    setShowVoiceAddSheet(false);
  };

  // Handle finish workout
  const handleFinishWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if there are no exercises or no completed sets
    const hasExercises = (activeSession?.exercises.length ?? 0) > 0;
    const hasCompletedSets = activeSession?.exercises.some(ex =>
      ex.sets.some(set => set.isCompleted)
    ) ?? false;

    if (!hasExercises || !hasCompletedSets) {
      // Show cancel modal instead if workout has no meaningful progress
      setShowCancelModal(true);
    } else {
      // Show confirmation modal first
      setShowFinishConfirmModal(true);
    }
  };

  // Handle confirmation to finish (shows celebration modal)
  const handleConfirmFinishStep = () => {
    setShowFinishConfirmModal(false);
    // Small delay to allow confirmation modal to close before showing celebration modal
    setTimeout(() => {
      const completedExercises = activeSession?.exercises.filter(exercise =>
        exercise.sets.some(set => set.isCompleted)
      ).length ?? 0;
      const durationSeconds = workoutStartTime
        ? Math.max(0, Math.floor((Date.now() - workoutStartTime) / 1000) + pausedElapsedSeconds)
        : Math.max(0, Math.floor(pausedElapsedSeconds));
      setFinishSnapshot({ durationSeconds, completedExercises });
      setShowFinishModal(true);
    }, 150);
  };

  // Handle timer settings save
  const handleSaveTimerSettings = (normal: number, warmup: number, dropset: number) => {
    updateRestTimerSettings({
      normalSeconds: normal,
      warmupSeconds: warmup,
      dropsetSeconds: dropset,
    });
  };

  const navigateAfterWorkoutFinish = (afterNavigate?: () => void) => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
    if (afterNavigate) {
      setTimeout(afterNavigate, 260);
    }
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const finishWorkoutAndNavigate = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    posthog.capture('workout_completed', {
      exercise_count: activeSession?.exercises?.length ?? 0,
      elapsed_seconds: elapsed,
      is_first_workout: completedSessions.length === 0,
      from_program: Boolean(activeSession?.programId),
    });
    const shouldShowFirstWorkoutStreak = completedSessions.length === 0;
    const completedSession = await finishWorkout();
    setShowFinishModal(false);
    setShowSaveTemplateModal(false);
    setFinishSnapshot(null);
    if (completedSession && shouldShowFirstWorkoutStreak) {
      navigateAfterWorkoutFinish(openFirstWorkoutStreakModal);
      return;
    }
    navigateAfterWorkoutFinish();
  };

  // Handle confirm finish
  const handleConfirmFinish = async () => {
    await finishWorkoutAndNavigate();
  };

  // Handle save as template
  const handleSaveAsTemplate = () => {
    setPendingSaveTemplateModalOpen(true);
    setShowFinishModal(false);
  };

  const buildExercisesForSavedWorkout = (session: WorkoutSession) =>
    session.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      sets: exercise.sets.length,
      reps: exercise.targetReps || '8-12',
      restSeconds: 120,
      notes: exercise.notes,
      setDetails: exercise.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
      })),
    }));

  const handleUpdateTemplate = async () => {
    if (!activeSession) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const exercisesForTemplate = buildExercisesForSavedWorkout(activeSession);

    if (templateForSession) {
      const templateId = templateForSession.id;
      const templateName = templateForSession.name;

      await updateActiveSessionName(templateName);
      await finishWorkoutAndNavigate();

      void updateWorkoutTemplate(templateId, templateName, exercisesForTemplate)
        .then((updatedId) => {
          if (!updatedId) {
            console.warn('[ActiveWorkout] Background template update failed');
          }
        })
        .catch((error) => {
          console.warn('[ActiveWorkout] Background template update threw', error);
        });
      return;
    }

    if (programForSession && programWorkoutForSession) {
      const programId = programForSession.id;
      const workoutId = programWorkoutForSession.id;
      const workoutName = programWorkoutForSession.name;

      await updateActiveSessionName(workoutName);
      await finishWorkoutAndNavigate();

      void updateProgramWorkout(programId, workoutId, workoutName, exercisesForTemplate)
        .then((updated) => {
          if (!updated) {
            console.warn('[ActiveWorkout] Background program workout update failed');
          }
        })
        .catch((error) => {
          console.warn('[ActiveWorkout] Background program workout update threw', error);
        });
    }
  };

  // Handle template save success
  const handleTemplateSaveSuccess = async (templateName?: string) => {
    setShowSaveTemplateModal(false);

    // Update the active session name BEFORE finishing (so it gets the correct name when moved to completed)
    if (templateName) {
      await updateActiveSessionName(templateName);
    }

    // Finish the workout (this moves session to completedSessions with the updated name)
    await finishWorkoutAndNavigate();
  };

  // Handle number pad confirm - implements perpetuating keyboard flow with autofill
  const handleNumberPadConfirm = (value: number | null) => {
    const activeNumberPad = useWorkoutStore.getState().activeNumberPad;
    if (!activeNumberPad) return;

    const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;
    const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
    const currentSet = exercise?.sets.find(s => s.localId === setLocalId);
    const wasCompleted = currentSet?.isCompleted ?? false;

    const updates = resolveActiveNumberPadSetUpdates({
      exercise,
      inputSuggestion: activeNumberPad.inputSuggestion,
      inputType,
      setLocalId,
      value,
    });

    if (!updates) {
      setNumberPadError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    updateSet(exerciseLocalId, setLocalId, updates);

    if (inputType === 'weight') {
      // Switch to reps input (keyboard stays open)
      openNumberPad(exerciseLocalId, setLocalId, 'reps', activeNumberPad.inputSuggestion);
    } else {
      // inputType === 'reps' → complete the set and close keyboard
      if (!wasCompleted) {
        completeSet(exerciseLocalId, setLocalId);
      }
      closeNumberPad();
    }
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyTitleRow}>
        <View style={[styles.emptyLine, themedStyles.emptyLine]} />
        <Text style={[styles.emptyTitle, themedStyles.emptyTitle]}>No exercises yet</Text>
        <View style={[styles.emptyLine, themedStyles.emptyLine]} />
      </View>
      <Text style={[styles.emptyDescription, themedStyles.emptyDescription]}>
        Tap below to get started
      </Text>
    </View>
  );

  // Exercise card renderer
  const handleVoiceLog = async (exerciseLocalId: string) => {
    await runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.voiceSetLog,
        params: {
          source: 'active_workout',
          action: 'open_voice_set_log',
          exerciseLocalId,
        },
      },
      async () => {
        if (isTourActive && activeStepId === 'open_voice_log') {
          advanceStep();
          return;
        }

        const permission = await ensureMicrophonePermission();
        if (permission.granted) {
          setVoiceExerciseLocalId(exerciseLocalId);
          return;
        }

        Alert.alert(
          'Microphone access required',
          permission.canAskAgain
            ? 'Microphone access is required to use voice logging.'
            : 'Microphone access is off. Enable it in Settings to use voice logging.',
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
  };

  const renderExerciseCard = ({ item, index }: any) => {
    const card = (
      <ExerciseCard
        exerciseLocalId={item.localId}
        onReplace={handleReplaceExercise}
        onViewDetails={handleViewExerciseDetails}
        onVoiceLog={handleVoiceLog}
        completedSetTint="success"
        shouldAnchorVoiceButton={index === 0}
        shouldAnchorSetTarget={index === 0}
      />
    );

    const shouldAnchorExerciseCard =
      index === 0 &&
      isTourActive &&
      activeStepId === 'voice_log_result';

    if (!shouldAnchorExerciseCard) {
      return card;
    }

    return (
      <TourAnchor id={TOUR_ANCHOR_IDS.activeWorkoutExerciseCard}>
        {card}
      </TourAnchor>
    );
  };

  // Footer with action buttons
  const renderFooter = () => (
    <View style={styles.bottomActions}>
      <View style={styles.secondaryActionsRow}>
        <Pressable
          onPress={handleAddExercise}
          style={({ pressed }) => [
            styles.addButton,
            styles.secondaryActionButton,
            themedStyles.addButton,
            pressed && styles.pressed
          ]}
        >
          <Text
            style={[styles.addButtonText, styles.secondaryActionText, themedStyles.addButtonText]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            + Add Exercise
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void handleOpenVoiceAdd();
          }}
          style={({ pressed }) => [
            styles.addButton,
            styles.secondaryActionButton,
            themedStyles.addButton,
            pressed && styles.pressed
          ]}
        >
          <View style={styles.voiceAddButtonContent}>
            <MicrophoneIcon size={18} color={colors.accent} strokeWidth={2} />
            <Text
              style={[styles.addButtonText, styles.secondaryActionText, themedStyles.addButtonText]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              Add with Voice
            </Text>
          </View>
        </Pressable>
      </View>

      <GlassButton style={[styles.finishButton, themedStyles.finishButtonShadow]} onPress={handleFinishWorkout}>
        <Text style={[styles.finishButtonText, themedStyles.finishButtonText]}>Finish Workout</Text>
      </GlassButton>
    </View>
  );

  const handleRestTimerPress = () => setShowRestTimerControls(true);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <GestureDetector gesture={panGesture}>
          <View>
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, themedStyles.dragHandle]} />
            </View>

            {/* Header */}
            <WorkoutHeaderTopBar
              onCancelPress={handleCancelPress}
              onTimerSettingsPress={() => setShowTimerSettingsModal(true)}
              onRestTimerPress={handleRestTimerPress}
              showCompactTimers={!showHeaderDetails}
              elapsed={elapsed}
              displaySeconds={displaySeconds}
              restTimerColor={restTimerColor}
              restTimerBgColor={restTimerBgColor}
            />

            <View style={[styles.headerDivider, themedStyles.headerDivider]} />
          </View>
        </GestureDetector>

        {/* Exercise List */}
        <FlatList
          data={activeSession?.exercises || []}
          extraData={activeSession}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={[
            styles.listContent,
            isNumberPadVisible && { paddingBottom: NUMBER_PAD_PADDING }
          ]}
          ListHeaderComponent={
            <WorkoutHeaderDetails
              onRestTimerPress={handleRestTimerPress}
              muscleLevels={muscleLevels}
              elapsed={elapsed}
              displaySeconds={displaySeconds}
              restTimerColor={restTimerColor}
              restTimerBgColor={restTimerBgColor}
              workoutName={activeSession?.name ?? null}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
        />
      </KeyboardAvoidingView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={handleCloseAddExerciseModal}
        suspended={addExerciseSuspended}
        replaceMode={replaceExerciseLocalId !== null}
        exerciseLocalIdToReplace={replaceExerciseLocalId ?? undefined}
        showRestTimerBanner={showRestTimerBanner}
        onDismissRestTimerBanner={() => setShowRestTimerBanner(false)}
        onOpenExerciseDetails={handleModalExerciseDetails}
      />

      {showVoiceAddSheet ? (
        <ExerciseVoiceAddSheet
          visible
          existingExerciseIds={activeSession?.exercises.map((exercise) => exercise.exerciseId) || []}
          onClose={() => setShowVoiceAddSheet(false)}
          onAddExercises={handleVoiceAddExercises}
        />
      ) : null}

      {voiceExerciseLocalId !== null ? (
        <WorkoutVoiceLogSheet
          visible
          exerciseLocalId={voiceExerciseLocalId}
          onClose={() => setVoiceExerciseLocalId(null)}
        />
      ) : null}

      {/* Rest Timer Controls */}
      <RestTimerControls
        visible={showRestTimerControls}
        onClose={() => setShowRestTimerControls(false)}
      />

      {/* Timer Settings Modal */}
      <TimerSettingsModal
        visible={showTimerSettingsModal}
        onClose={() => setShowTimerSettingsModal(false)}
        onSave={handleSaveTimerSettings}
        initialNormalDuration={restTimerSettings.normalSeconds}
        initialWarmupDuration={restTimerSettings.warmupSeconds}
        initialDropDuration={restTimerSettings.dropsetSeconds}
      />

      {/* Cancel Workout Modal */}
      <CancelWorkoutModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* Finish Confirmation Modal */}
      <FinishConfirmationModal
        visible={showFinishConfirmModal}
        onClose={() => setShowFinishConfirmModal(false)}
        onConfirm={handleConfirmFinishStep}
      />

      {/* Replace Exercise Confirmation Modal */}
      <ReplaceExerciseConfirmModal
        visible={showReplaceConfirmModal}
        onClose={() => {
          setShowReplaceConfirmModal(false);
          setPendingReplaceExerciseLocalId(null);
        }}
        onConfirm={handleConfirmReplace}
      />

      {/* Workout Complete Modal */}
      <WorkoutCompleteModal
        visible={showFinishModal}
        onClose={() => {
          setShowFinishModal(false);
          setFinishSnapshot(null);
        }}
        onConfirm={handleConfirmFinish}
        onSaveAsTemplate={
          hasSessionTemplateModifications
            ? handleSaveAsTemplate
            : undefined
        }
        onUpdateTemplate={canUpdateTemplate || canUpdateProgramWorkout ? handleUpdateTemplate : undefined}
        saveTemplateLabel={
          activeSession?.programId
            ? 'Save as New Template'
            : undefined
        }
        updateTemplateLabel={
          canUpdateTemplate || canUpdateProgramWorkout ? 'Update Template' : undefined
        }
        session={activeSession}
        durationSecondsOverride={finishSnapshot?.durationSeconds}
        completedExercisesOverride={finishSnapshot?.completedExercises}
      />

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSuccess={handleTemplateSaveSuccess}
        session={activeSession}
      />

      {/* Number Pad */}
      <NumberPadModal
        visible={isNumberPadVisible}
        onClose={closeNumberPad}
        onConfirm={handleNumberPadConfirm}
        inputType={numberPadInputType}
      />

      {/* Rest Timer Complete Modal */}
      <RestTimerCompleteModal
        visible={restTimerCompleteVisible}
        onDismiss={dismissRestTimerComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: 0,
  },
  dragHandle: {
    width: DRAG_HANDLE_WIDTH,
    height: DRAG_HANDLE_HEIGHT,
    borderRadius: DRAG_HANDLE_RADIUS,
    backgroundColor: Colors.borderMedium,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: HORIZONTAL_PADDING,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: LIST_PADDING_TOP,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EMPTY_GAP,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: EMPTY_PADDING_BOTTOM,
  },
  emptyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EMPTY_GAP,
    width: '100%',
  },
  emptyLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(163, 163, 163, 0.3)',
  },
  emptyTitle: {
    fontSize: EMPTY_TITLE_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyDescription: {
    fontSize: EMPTY_DESCRIPTION_SIZE,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  bottomActions: {
    paddingTop: BOTTOM_ACTIONS_PADDING_TOP,
    paddingBottom: BOTTOM_ACTIONS_PADDING_BOTTOM,
    gap: BOTTOM_ACTIONS_GAP,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: SECONDARY_ACTIONS_GAP,
  },
  secondaryActionButton: {
    flex: 1,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ADD_BUTTON_PADDING_Y,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: ADD_BUTTON_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  secondaryActionText: {
    fontSize: moderateScale(12),
    letterSpacing: 0.7,
    textAlign: 'center',
    flexShrink: 1,
  },
  voiceAddButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(Spacing.xs),
    paddingHorizontal: scale(Spacing.xs),
  },
  finishButton: {
    height: FINISH_BUTTON_HEIGHT,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButtonText: {
    fontSize: FINISH_BUTTON_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
