import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native';
import { CheckIcon, TrashIcon } from 'react-native-heroicons/outline';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { responsiveValue, moderateScale, scale } from '@/src/utils/responsive';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getAccentRgba } from '@/src/utils/accentColors';
import { getWorkoutSetInputSuggestion } from '@/src/utils/workoutSetInputSuggestion';
import type { WeightUnit } from '@/src/types/workout';
import { WorkoutSet, RPE_COLORS } from '@/src/types/workout';
import { LastPerformance } from '@/src/hooks/useLastExercisePerformance';
import { SetTypeSelector } from './SetTypeSelector';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  Easing,
} from 'react-native-reanimated';

// Responsive sizing for different screen sizes
const SET_BADGE_SIZE = responsiveValue(32, 36, 40);
const INPUT_WIDTH = responsiveValue(40, 44, 48);
const INPUT_HEIGHT = responsiveValue(32, 34, 36);
const CHECKBOX_SIZE = responsiveValue(28, 30, 32);
const CHECKBOX_MARGIN = responsiveValue(Spacing.xs, Spacing.sm, Spacing.md);
const PREV_MIN_WIDTH = responsiveValue(56, 70, 80);
const ROW_GAP = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const COLUMN_PADDING_RIGHT = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const REPS_MARGIN = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const SET_BADGE_TEXT_SIZE = moderateScale(FontSizes.sm);
const PREVIOUS_TEXT_SIZE = moderateScale(FontSizes.base);
const INPUT_TEXT_SIZE = moderateScale(FontSizes.base);
const INPUT_LETTER_SPACING = moderateScale(0.3);
const RPE_BADGE_SIZE = scale(18);
const RPE_BADGE_RADIUS = Math.round(RPE_BADGE_SIZE / 2);
const RPE_BADGE_OFFSET = -scale(6);
const RPE_BADGE_PADDING_X = scale(4);
const RPE_BADGE_TEXT_SIZE = moderateScale(10);

interface SetRowProps {
  exerciseLocalId: string;
  setLocalId: string;
  setIndex: number;
  useEditor?: boolean;
  showCheckboxes?: boolean;
  previousSet?: WorkoutSet;
  lastPerformance?: LastPerformance | null;
  baselinePerformance?: {
    sets: Array<{
      weight: number | null;
      weightUnit?: WeightUnit | null;
      reps: number | null;
      setType: string;
    }>;
  };
  suggestedPerformance?: {
    sets: Array<{
      weight: number | null;
      weightUnit?: WeightUnit | null;
      reps: number | null;
      setType: string;
    }>;
  } | null;
  completedSetTint?: 'accent' | 'success';
  shouldAnchorTourSetControls?: boolean;
}

export function SetRow({
  exerciseLocalId,
  setLocalId,
  setIndex,
  useEditor = false,
  showCheckboxes,
  previousSet,
  lastPerformance,
  baselinePerformance,
  suggestedPerformance,
  completedSetTint = 'accent',
  shouldAnchorTourSetControls = false,
}: SetRowProps) {
  const { colors, isDark } = useTheme();
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();

  const completedOverlay = completedSetTint === 'success'
    ? getAccentRgba('green', isDark ? 0.1 : 0.08)
    : colors.accentOverlay;
  const completedOverlayMedium = completedSetTint === 'success'
    ? getAccentRgba('green', isDark ? 0.15 : 0.12)
    : colors.accentOverlayMedium;
  const completedBorder = completedSetTint === 'success'
    ? getAccentRgba('green', isDark ? 0.3 : 0.25)
    : colors.accentBorder;
  const completedShadow = completedSetTint === 'success' ? Colors.success : colors.accent;
  const completedCheckColor = completedSetTint === 'success' ? Colors.success : colors.accent;

  // Dynamic theme-aware styles
  const themedStyles = {
    input: {
      backgroundColor: isDark ? Colors.surfaceOverlay : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? Colors.borderLight : 'rgba(0, 0, 0, 0.15)',
    },
    inputText: {
      color: colors.textPrimary,
    },
    placeholderText: {
      color: isDark ? Colors.textTertiary : 'rgba(0, 0, 0, 0.35)',
    },
    previousText: {
      color: isDark ? colors.textPrimary : colors.textSecondary,
    },
    setBadge: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.08)',
      borderTopColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)',
      borderLeftColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
    },
    checkbox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    // Accent-based styles for completed/active states
    inputCompleted: {
      backgroundColor: completedOverlayMedium,
      borderColor: completedBorder,
    },
    inputActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentOverlay,
    },
    checkboxCompleted: {
      backgroundColor: completedOverlayMedium,
      borderColor: completedBorder,
      shadowColor: completedShadow,
    },
    containerCompleted: {
      backgroundColor: completedOverlay,
      borderColor: completedBorder,
    },
  };

  // Determine if checkboxes should be shown (defaults to !useEditor for backwards compatibility)
  const shouldShowCheckboxes = showCheckboxes ?? !useEditor;
  // Allow previous-set autofill when logging a workout (active session or log mode),
  // but keep template creation rows empty.
  const allowAutoFill = !useEditor || shouldShowCheckboxes;
  const allowApplyToRemaining = true;
  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const updateSet = useWorkoutStore(s => useEditor ? s.updateEditorSet : s.updateSet);
  const completeSet = useWorkoutStore(s => useEditor ? s.completeEditorSet : s.completeSet);
  const updateSetType = useWorkoutStore(s => useEditor ? s.updateEditorSetType : s.updateSetType);
  const removeSet = useWorkoutStore(s => useEditor ? s.removeEditorSet : s.removeSet);
  const openNumberPad = useWorkoutStore(s => useEditor ? s.openEditorNumberPad : s.openNumberPad);
  const closeNumberPad = useWorkoutStore(s => useEditor ? s.closeEditorNumberPad : s.closeNumberPad);
  const activeInputType = useWorkoutStore((s) => {
    const active = s.activeNumberPad;
    if (!active) return null;
    if (active.exerciseLocalId !== exerciseLocalId || active.setLocalId !== setLocalId) return null;
    return active.inputType;
  });
  const activePendingValue = useWorkoutStore((s) => {
    const active = s.activeNumberPad;
    if (!active) return null;
    if (active.exerciseLocalId !== exerciseLocalId || active.setLocalId !== setLocalId) return null;
    return active.pendingValue;
  });
  const activeHasError = useWorkoutStore((s) => {
    const active = s.activeNumberPad;
    if (!active) return false;
    if (active.exerciseLocalId !== exerciseLocalId || active.setLocalId !== setLocalId) return false;
    return active.hasError;
  });
  const validationErrorsBySet = useWorkoutStore(s => s.validationErrorsBySet);
  const validationErrorsTrigger = useWorkoutStore(s => s.validationErrorsTrigger);
  const setValidationErrorsBySet = useWorkoutStore(s => s.setValidationErrorsBySet);
  const registerWorkoutOverlay = useWorkoutStore(s => s.registerWorkoutOverlay);
  const unregisterWorkoutOverlay = useWorkoutStore(s => s.unregisterWorkoutOverlay);

  // Check if this input is currently active
  const isWeightActive = activeInputType === 'weight';
  const isRepsActive = activeInputType === 'reps';

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | undefined>();
  const [validationErrors, setValidationErrors] = useState<{
    weight?: boolean;
    reps?: boolean;
  }>({});
  const badgeRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);
  const longPressHandledRef = useRef<'weight' | 'reps' | 'check' | null>(null);
  const isTypeSelectorOpenRef = useRef(false);

  // Shake animation
  const weightShake = useSharedValue(0);
  const repsShake = useSharedValue(0);

  const weightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: weightShake.value }],
  }));

  const repsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: repsShake.value }],
  }));

  const triggerShake = (field: 'weight' | 'reps') => {
    const shakeValue = field === 'weight' ? weightShake : repsShake;
    shakeValue.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // Trigger shake when hasError becomes true
  useEffect(() => {
    if (activeHasError) {
      if (isWeightActive) {
        triggerShake('weight');
      }
      if (isRepsActive) {
        triggerShake('reps');
      }
    }
  }, [activeHasError, isWeightActive, isRepsActive]);

  useEffect(() => {
    if (showTypeSelector && !isTypeSelectorOpenRef.current) {
      registerWorkoutOverlay();
      isTypeSelectorOpenRef.current = true;
    } else if (!showTypeSelector && isTypeSelectorOpenRef.current) {
      unregisterWorkoutOverlay();
      isTypeSelectorOpenRef.current = false;
    }

    return () => {
      if (isTypeSelectorOpenRef.current) {
        unregisterWorkoutOverlay();
        isTypeSelectorOpenRef.current = false;
      }
    };
  }, [showTypeSelector, registerWorkoutOverlay, unregisterWorkoutOverlay]);

  useEffect(() => {
    if (!validationErrorsTrigger) return;
    const errors = validationErrorsBySet[setLocalId];
    if (!errors) {
      setValidationErrors({});
      return;
    }
    if (errors.weight) {
      triggerShake('weight');
    }
    if (errors.reps) {
      triggerShake('reps');
    }
    setValidationErrors(prev => ({ ...prev, ...errors }));
  }, [setLocalId, validationErrorsBySet, validationErrorsTrigger]);

  // Clear validation errors when user starts entering values
  useEffect(() => {
    if (isWeightActive) {
      setValidationErrors(prev => ({ ...prev, weight: false }));
    }
  }, [isWeightActive]);

  useEffect(() => {
    if (isRepsActive) {
      setValidationErrors(prev => ({ ...prev, reps: false }));
    }
  }, [isRepsActive]);

  // Find the current set
  const exercise = session?.exercises.find(e => e.localId === exerciseLocalId);
  const set = exercise?.sets.find(s => s.localId === setLocalId);


  if (!exercise || !set) return null;

  const applyValueToRemainingSets = (field: 'weight' | 'reps') => {
    if (!allowApplyToRemaining || !exercise) return false;
    const value = set[field];
    if (value === null || value === undefined) return false;

    const remainingSets = exercise.sets.slice(setIndex + 1);
    const setsToUpdate = remainingSets.filter(
      (s) => !s.isCompleted && s[field] !== value
    );
    if (setsToUpdate.length === 0) return false;

    setsToUpdate.forEach((s) => {
      updateSet(exerciseLocalId, s.localId, { [field]: value });
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return true;
  };

  const handleApplyToRemaining = (field: 'weight' | 'reps') => {
    const applied = applyValueToRemainingSets(field);
    if (applied) {
      longPressHandledRef.current = field;
      setTimeout(() => {
        if (longPressHandledRef.current === field) {
          longPressHandledRef.current = null;
        }
      }, 500);
      if (isTourActive && activeStepId === 'fill_weight_column' && field === 'weight') {
        void advanceStep();
      }
    }
  };

  const handleInputPress = (field: 'weight' | 'reps') => {
    if (longPressHandledRef.current === field) {
      longPressHandledRef.current = null;
      return;
    }
    openNumberPad(exerciseLocalId, setLocalId, field, inputSuggestion);
  };

  const applyCompletionToRemainingSets = () => {
    if (!shouldShowCheckboxes || !exercise) return false;
    const remainingSets = exercise.sets.slice(setIndex);
    const incompleteSets = remainingSets.filter((s) => !s.isCompleted);
    if (incompleteSets.length === 0) return false;

    const updates: Array<{ setLocalId: string; weight: number | null; reps: number | null }> = [];
    const errorsBySet: Record<string, { weight?: boolean; reps?: boolean }> = {};

    remainingSets.forEach((s, offset) => {
      if (s.isCompleted) {
        return;
      }
      const absoluteIndex = setIndex + offset;
      const previousSetForRow = absoluteIndex > 0 ? exercise.sets[absoluteIndex - 1] : undefined;
      const inputSuggestionForRow = allowAutoFill
        ? getWorkoutSetInputSuggestion({
            exercise,
            previousSet: previousSetForRow,
            setIndex: absoluteIndex,
            setType: s.setType,
            preferredWeightPerformance: baselinePerformance,
            suggestedPerformance,
            fallbackPerformance: lastPerformance,
            secondaryFallbackPerformance: baselinePerformance,
          })
        : undefined;
      let pendingWeight: number | null = null;
      let pendingReps: number | null = null;

      const activeNumberPad = useWorkoutStore.getState().activeNumberPad;
      if (
        activeNumberPad
        && activeNumberPad.exerciseLocalId === exerciseLocalId
        && activeNumberPad.setLocalId === s.localId
      ) {
        const pendingValue = activeNumberPad.pendingValue.trim();
        if (pendingValue) {
          const parsedValue = Number(pendingValue);
          if (!Number.isNaN(parsedValue)) {
            if (activeNumberPad.inputType === 'weight') {
              pendingWeight = parsedValue;
            } else {
              pendingReps = parsedValue;
            }
          }
        }
      }

      const resolvedWeight = pendingWeight ?? s.weight ?? inputSuggestionForRow?.weight ?? null;
      const resolvedReps = pendingReps ?? s.reps ?? inputSuggestionForRow?.reps ?? null;
      const finalWeight = resolvedWeight ?? 0;

      const missingReps = resolvedReps == null;
      if (missingReps) {
        errorsBySet[s.localId] = { reps: true };
      }

      updates.push({ setLocalId: s.localId, weight: finalWeight, reps: resolvedReps });
    });

    if (Object.keys(errorsBySet).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setValidationErrorsBySet(errorsBySet);
      return false;
    }

    setValidationErrorsBySet({});

    updates.forEach((update) => {
      updateSet(exerciseLocalId, update.setLocalId, {
        weight: update.weight,
        reps: update.reps,
        isCompleted: true,
      });
    });

    const activeNumberPad = useWorkoutStore.getState().activeNumberPad;
    if (
      activeNumberPad
      && activeNumberPad.exerciseLocalId === exerciseLocalId
      && incompleteSets.some((s) => s.localId === activeNumberPad.setLocalId)
    ) {
      closeNumberPad();
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return true;
  };

  const handleCheckboxPress = () => {
    if (longPressHandledRef.current === 'check') {
      longPressHandledRef.current = null;
      return;
    }
    handleComplete();
  };

  const handleCheckboxLongPress = () => {
    const applied = applyCompletionToRemainingSets();
    if (applied) {
      longPressHandledRef.current = 'check';
      setTimeout(() => {
        if (longPressHandledRef.current === 'check') {
          longPressHandledRef.current = null;
        }
      }, 500);
    }
  };

  const handleComplete = () => {
    // Check if number pad is open for this set (to grab pending value)
    const activeNumberPad = useWorkoutStore.getState().activeNumberPad;
    const isThisSetActive = activeNumberPad?.exerciseLocalId === exerciseLocalId &&
      activeNumberPad?.setLocalId === setLocalId;
    const pendingField = isThisSetActive ? activeNumberPad?.inputType : null;
    const pendingValue = isThisSetActive && activeNumberPad?.pendingValue
      ? parseFloat(activeNumberPad.pendingValue)
      : null;

    // Start with saved values
    let finalWeight = set.weight;
    let finalReps = set.reps;

    // Use pending value if number pad is open for this field
    if (pendingField === 'weight' && pendingValue !== null && !isNaN(pendingValue)) {
      finalWeight = pendingValue;
    }
    if (pendingField === 'reps' && pendingValue !== null && !isNaN(pendingValue)) {
      finalReps = pendingValue;
    }

    // Autofill from previous set if still null
    if (allowAutoFill && finalWeight === null && inputSuggestion?.weight != null) {
      finalWeight = inputSuggestion.weight;
    }
    if (allowAutoFill && finalReps === null && inputSuggestion?.reps != null) {
      finalReps = inputSuggestion.reps;
    }

    if (finalWeight === null) {
      finalWeight = 0;
    }

    const missingReps = finalReps === null;
    if (set.weight !== finalWeight || set.reps !== finalReps) {
      updateSet(exerciseLocalId, setLocalId, {
        weight: finalWeight,
        reps: finalReps
      });
    }

    if (missingReps) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setValidationErrors({ reps: true });
      triggerShake('reps');
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    // Save values (including any pending value from number pad)
    // Close the number pad if it was open for this set
    if (isThisSetActive) {
      closeNumberPad();
    }

    // Complete the set
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeSet(exerciseLocalId, setLocalId);
  };

  const normalSetNumber = exercise
    ? exercise.sets
      .slice(0, setIndex + 1)
      .filter((s) => s.setType === 'normal')
      .length
    : setIndex + 1;

  const getSetDisplay = () => {
    switch (set.setType) {
      case 'warmup':
        return { label: 'W', color: '#eab308' };
      case 'failure':
        return { label: 'F', color: Colors.error };
      case 'dropset':
        return { label: 'D', color: '#3b82f6' };
      default:
        return { label: normalSetNumber.toString(), color: colors.textPrimary };
    }
  };

  // Get set type background color for row tinting (disabled - all sets have transparent backgrounds)
  const getSetTypeStyle = () => {
    return null;
  };

  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const currentWeightUnit = exercise
    ? (weightUnits[exercise.exerciseId] || 'lbs')
    : 'lbs';
  const setDisplay = getSetDisplay();
  const previousUnitRef = useRef<WeightUnit | null>(null);
  const previousExerciseRef = useRef<string | null>(null);
  const performanceUnit = lastPerformance?.weightUnit
    ?? lastPerformance?.sets.find((entry) => entry.weightUnit)?.weightUnit
    ?? null;
  useEffect(() => {
    if (!lastPerformance) return;
    if (previousExerciseRef.current !== lastPerformance.exerciseId) {
      previousExerciseRef.current = lastPerformance.exerciseId;
      previousUnitRef.current = null;
    }
    if (performanceUnit) {
      previousUnitRef.current = performanceUnit;
      return;
    }
    if (!previousUnitRef.current) {
      previousUnitRef.current = currentWeightUnit;
    }
  }, [currentWeightUnit, lastPerformance?.exerciseId, performanceUnit]);

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return '';
    const stringValue = value.toString();
    return stringValue.includes('.')
      ? stringValue.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
      : stringValue;
  };

  // Type-aware previous matching: Warmup 1 → prev Warmup 1, Normal 1 → prev Normal 1
  const typeIndex = exercise?.sets
    .slice(0, setIndex)
    .filter(s => s.setType === set?.setType)
    .length ?? 0;
  const previousSetsOfType = lastPerformance?.sets
    ?.filter(s => s.setType === set?.setType) ?? [];
  const previousSetPerformance = previousSetsOfType[typeIndex];

  // Fall back to baseline performance if no workout history exists
  const baselineSetsOfType = baselinePerformance?.sets
    ?.filter(s => s.setType === set?.setType) ?? [];
  const baselineSetPerformance = baselineSetsOfType[typeIndex];

  // Use last performance if available, otherwise fall back to baseline
  const effectivePerformance = previousSetPerformance || baselineSetPerformance;
  const inputSuggestion = getWorkoutSetInputSuggestion({
    exercise,
    previousSet,
    setIndex,
    setType: set.setType,
    preferredWeightPerformance: baselinePerformance,
    suggestedPerformance,
    fallbackPerformance: lastPerformance,
    secondaryFallbackPerformance: baselinePerformance,
  });

  const recordedWeightUnit = effectivePerformance?.weightUnit
    || previousUnitRef.current
    || currentWeightUnit;
  const previousText = (() => {
    if (!effectivePerformance) return '—';
    if (effectivePerformance.weight == null || effectivePerformance.reps == null) return '—';
    const weightText = formatValue(effectivePerformance.weight);
    const repsText = effectivePerformance.reps.toString();
    if (!weightText || !repsText) return '—';
    const unitLabel = recordedWeightUnit ? ` ${recordedWeightUnit.toLowerCase()}` : '';
    return `${repsText} × ${weightText}${unitLabel}`;
  })();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    removeSet(exerciseLocalId, setLocalId);
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <RNAnimated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Pressable onPress={handleDelete} style={styles.deleteActionInner}>
          <TrashIcon size={18} color={Colors.white} strokeWidth={2} />
        </Pressable>
      </RNAnimated.View>
    );
  };

  const getInputStyle = (field: 'weight' | 'reps' | 'rpe') => {
    const hasError = validationErrors[field as 'weight' | 'reps'];

    if (hasError) {
      return [styles.input, themedStyles.input, styles.inputError];
    }

    if (set.isCompleted) {
      return [styles.input, themedStyles.input, themedStyles.inputCompleted];
    }

    return [styles.input, themedStyles.input];
  };

  const setTypeStyle = getSetTypeStyle();
  const setNumberLabel = `Set ${setIndex + 1}`;
  const setTypeLabel = set.setType === 'normal' ? 'normal' : set.setType;
  const isFirstTourSet = shouldAnchorTourSetControls && setIndex === 0;
  const shouldAnchorWeight = isFirstTourSet && isTourActive && activeStepId === 'fill_weight_column';
  const shouldAnchorReps = isFirstTourSet && isTourActive && activeStepId === 'fill_reps_column';
  const shouldAnchorComplete = isFirstTourSet && isTourActive && activeStepId === 'complete_remaining_sets';
  const isRestrictedLongPressTourStep = shouldAnchorTourSetControls && isTourActive && (
    activeStepId === 'fill_weight_column' || activeStepId === 'complete_remaining_sets'
  );

  return (
    <Animated.View
      entering={FadeIn.delay(setIndex * 40).duration(200).easing(Easing.out(Easing.cubic))}
    >
      <Swipeable
        ref={swipeableRef}
        enabled={!isRestrictedLongPressTourStep}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        containerStyle={{ overflow: 'visible' }}
      >
        <View style={[
          styles.container,
          set.isCompleted && [styles.containerCompleted, themedStyles.containerCompleted],
          setTypeStyle && styles.containerSetType,
          setTypeStyle,
        ]}>
        {/* Set number/type badge */}
        <View ref={badgeRef} collapsable={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${setNumberLabel} type: ${setTypeLabel}`}
            accessibilityHint="Double tap to change set type"
            disabled={isRestrictedLongPressTourStep}
            onPress={() => {
              if (isRestrictedLongPressTourStep) return;
              badgeRef.current?.measureInWindow((x, y, width, height) => {
                setPopoverPosition({ x: x, y: y + height + 4 });
                setShowTypeSelector(true);
              });
            }}
            style={[styles.setBadge, themedStyles.setBadge]}
          >
            <Text style={[styles.setBadgeText, { color: setDisplay.color }]}>
              {setDisplay.label}
            </Text>
          </Pressable>
        </View>

        {/* Previous set indicator - shows last session performance */}
        <View style={styles.previousCol}>
          <Text
            style={[styles.previousText, themedStyles.previousText]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {previousText}
          </Text>
        </View>

        {/* Weight input */}
        <Animated.View style={[styles.inputWrapper, styles.weightWrapper, !shouldShowCheckboxes && styles.flexCol, weightAnimatedStyle]}>
          <TourAnchor
            id={shouldAnchorWeight ? TOUR_ANCHOR_IDS.activeSetWeight : `${TOUR_ANCHOR_IDS.activeSetWeight}.${setLocalId}`}
            disabled={!shouldAnchorWeight}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${setNumberLabel} weight`}
              accessibilityHint="Double tap to edit. Long press to apply to remaining sets"
              disabled={isRestrictedLongPressTourStep && !shouldAnchorWeight}
              onPress={() => {
                if (isRestrictedLongPressTourStep) return;
                handleInputPress('weight');
              }}
              onLongPress={() => {
                if (isRestrictedLongPressTourStep && !shouldAnchorWeight) return;
                handleApplyToRemaining('weight');
              }}
              delayLongPress={350}
              style={[
                getInputStyle('weight'),
                isWeightActive && [styles.inputActive, themedStyles.inputActive],
                isWeightActive && activeHasError && styles.inputError
              ]}
            >
              <Text style={[
                styles.inputText,
                themedStyles.inputText,
                (isWeightActive && !activePendingValue && allowAutoFill && inputSuggestion?.weight != null) && themedStyles.placeholderText,
                (!isWeightActive && set.weight === null && allowAutoFill) && themedStyles.placeholderText
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              >
                {isWeightActive
                  ? (activePendingValue || (allowAutoFill ? inputSuggestion?.weight?.toString() : '') || '')
                  : (set.weight !== null ? set.weight.toString() : (allowAutoFill ? inputSuggestion?.weight?.toString() || '' : ''))}
              </Text>
            </Pressable>
          </TourAnchor>
        </Animated.View>

        {/* Reps input with RPE badge */}
        <Animated.View style={[styles.inputWrapper, styles.repsWrapper, !shouldShowCheckboxes && styles.flexCol, repsAnimatedStyle]}>
          <View style={styles.repsContainer}>
            <TourAnchor id={TOUR_ANCHOR_IDS.activeSetReps} disabled={!shouldAnchorReps}>
              <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${setNumberLabel} reps`}
              accessibilityHint="Double tap to edit. Long press to apply to remaining sets"
              disabled={isRestrictedLongPressTourStep}
              onPress={() => {
                if (isRestrictedLongPressTourStep) return;
                handleInputPress('reps');
              }}
              onLongPress={() => {
                if (isRestrictedLongPressTourStep) return;
                handleApplyToRemaining('reps');
              }}
              delayLongPress={350}
              style={[
                getInputStyle('reps'),
                isRepsActive && [styles.inputActive, themedStyles.inputActive],
                isRepsActive && activeHasError && styles.inputError
              ]}
              >
                <Text style={[
                  styles.inputText,
                  themedStyles.inputText,
                  (isRepsActive && !activePendingValue && allowAutoFill && inputSuggestion?.reps != null) && themedStyles.placeholderText,
                  (!isRepsActive && set.reps === null && allowAutoFill) && themedStyles.placeholderText
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                >
                  {isRepsActive
                    ? (activePendingValue || (allowAutoFill ? inputSuggestion?.reps?.toString() : '') || '')
                    : (set.reps !== null ? set.reps.toString() : (allowAutoFill ? inputSuggestion?.reps?.toString() || '' : ''))}
                </Text>
              </Pressable>
            </TourAnchor>
            {/* RPE Badge */}
            {set.rpe !== null && (
              <View
                style={[
                  styles.rpeBadge,
                  { backgroundColor: RPE_COLORS[set.rpe] || Colors.textSecondary },
                ]}
              >
                <Text style={styles.rpeBadgeText}>{set.rpe}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Completion checkbox */}
        {shouldShowCheckboxes && (
          <TourAnchor id={TOUR_ANCHOR_IDS.activeSetComplete} disabled={!shouldAnchorComplete}>
            <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={`${setNumberLabel} completed`}
            accessibilityHint="Double tap to toggle. Long press to complete remaining sets"
            accessibilityState={{ checked: set.isCompleted }}
            disabled={isRestrictedLongPressTourStep && !shouldAnchorComplete}
            onPress={() => {
              if (isRestrictedLongPressTourStep) return;
              handleCheckboxPress();
            }}
            onLongPress={() => {
              if (isRestrictedLongPressTourStep && !shouldAnchorComplete) return;
              handleCheckboxLongPress();
            }}
            delayLongPress={350}
            style={[styles.checkbox, themedStyles.checkbox, set.isCompleted && [styles.checkboxCompleted, themedStyles.checkboxCompleted]]}
          >
            {set.isCompleted ? (
              <CheckIcon
                size={16}
                color={completedCheckColor}
                strokeWidth={2.5}
              />
            ) : (
              <CheckIcon
                size={16}
                color={colors.textTertiary}
                strokeWidth={2}
              />
            )}
            </Pressable>
          </TourAnchor>
        )}

        {/* Set Type Popover */}
        <SetTypeSelector
          visible={showTypeSelector}
          onClose={() => setShowTypeSelector(false)}
          onSelect={(type) => updateSetType(exerciseLocalId, setLocalId, type)}
          hideFailure={!shouldShowCheckboxes}
          onRemove={() => removeSet(exerciseLocalId, setLocalId)}
          currentType={set.setType}
          setIndex={setIndex}
          anchorPosition={popoverPosition}
        />
      </View>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_GAP,
    paddingVertical: Spacing.sm,
    paddingRight: COLUMN_PADDING_RIGHT,
    paddingLeft: COLUMN_PADDING_RIGHT,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
  },
  deleteActionInner: {
    width: 44,
    height: 44,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerCompleted: {
    // backgroundColor and borderColor are now dynamic via themedStyles
  },
  containerSetType: {
  },
  setBadge: {
    width: SET_BADGE_SIZE,
    height: SET_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    // Stamped/embossed industrial look
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    borderLeftColor: 'rgba(0, 0, 0, 0.3)',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  setBadgeText: {
    fontSize: SET_BADGE_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: INPUT_LETTER_SPACING,
  },
  previousCol: {
    flex: 1,
    minWidth: PREV_MIN_WIDTH,
    alignItems: 'center',
  },
  previousText: {
    fontSize: PREVIOUS_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: INPUT_LETTER_SPACING,
  },
  inputWrapper: {
    // Wrapper for animated shake
    overflow: 'visible',
    zIndex: 1,
  },
  weightWrapper: {
    // Gap handles spacing
  },
  repsWrapper: {
    marginLeft: REPS_MARGIN,
  },
  flexCol: {
    flex: 1,
    marginLeft: 0,
    alignItems: 'center',
  },
  input: {
    width: INPUT_WIDTH,
    height: INPUT_HEIGHT,
    backgroundColor: Colors.surfaceOverlay,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    // Asymmetric chamfered corners - industrial aesthetic
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: INPUT_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: INPUT_LETTER_SPACING,
    fontVariant: ['tabular-nums'],
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  inputError: {
    backgroundColor: Colors.errorOverlay,
    borderColor: Colors.error,
    borderWidth: 2,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inputCompleted: {
    // backgroundColor and borderColor are now dynamic via themedStyles
  },
  inputActive: {
    // borderColor and backgroundColor are now dynamic via themedStyles
    borderWidth: 2.5,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    // Asymmetric chamfered corners - matches inputs
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: CHECKBOX_MARGIN,
    overflow: 'hidden',
  },
  checkboxCompleted: {
    // shadowColor is now dynamic via themedStyles
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  repsContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  rpeBadge: {
    position: 'absolute',
    top: RPE_BADGE_OFFSET,
    right: RPE_BADGE_OFFSET,
    minWidth: RPE_BADGE_SIZE,
    height: RPE_BADGE_SIZE,
    borderRadius: RPE_BADGE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RPE_BADGE_PADDING_X,
    zIndex: 10,
  },
  rpeBadgeText: {
    fontSize: RPE_BADGE_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.background,
    letterSpacing: INPUT_LETTER_SPACING,
  },
});
