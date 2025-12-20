import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native';
import { CheckIcon, TrashIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSet, RPE_COLORS } from '@/src/types/workout';
import { LastPerformance } from '@/src/hooks/useLastExercisePerformance';
import { SetTypeSelector } from './SetTypeSelector';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  Easing,
} from 'react-native-reanimated';

interface SetRowProps {
  exerciseLocalId: string;
  setLocalId: string;
  setIndex: number;
  useEditor?: boolean;
  previousSet?: WorkoutSet;
  lastPerformance?: LastPerformance | null;
}

export function SetRow({ exerciseLocalId, setLocalId, setIndex, useEditor = false, previousSet, lastPerformance }: SetRowProps) {
  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const updateSet = useWorkoutStore(s => useEditor ? s.updateEditorSet : s.updateSet);
  const completeSet = useWorkoutStore(s => useEditor ? s.completeEditorSet : s.completeSet);
  const updateSetType = useWorkoutStore(s => useEditor ? s.updateEditorSetType : s.updateSetType);
  const removeSet = useWorkoutStore(s => useEditor ? s.removeEditorSet : s.removeSet);
  const openNumberPad = useWorkoutStore(s => useEditor ? s.openEditorNumberPad : s.openNumberPad);
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);

  // Check if this input is currently active
  const isWeightActive = activeNumberPad?.exerciseLocalId === exerciseLocalId &&
    activeNumberPad?.setLocalId === setLocalId &&
    activeNumberPad?.inputType === 'weight';
  const isRepsActive = activeNumberPad?.exerciseLocalId === exerciseLocalId &&
    activeNumberPad?.setLocalId === setLocalId &&
    activeNumberPad?.inputType === 'reps';

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | undefined>();
  const [validationErrors, setValidationErrors] = useState<{
    weight?: boolean;
    reps?: boolean;
  }>({});
  const badgeRef = useRef<View>(null);
  const swipeableRef = useRef<Swipeable>(null);

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
    if (activeNumberPad?.hasError) {
      if (isWeightActive) {
        triggerShake('weight');
      }
      if (isRepsActive) {
        triggerShake('reps');
      }
    }
  }, [activeNumberPad?.hasError]);

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

  if (!set) return null;

  const handleComplete = () => {
    // Try to use autofill values from previous set if current values are null
    let finalWeight = set.weight;
    let finalReps = set.reps;

    if (finalWeight === null && previousSet?.weight != null) {
      finalWeight = previousSet.weight;
    }
    if (finalReps === null && previousSet?.reps != null) {
      finalReps = previousSet.reps;
    }

    // Validate - only error if still missing after autofill attempt
    const missingFields: ('weight' | 'reps')[] = [];
    if (finalWeight === null) missingFields.push('weight');
    if (finalReps === null) missingFields.push('reps');

    if (missingFields.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errors: { weight?: boolean; reps?: boolean } = {};
      missingFields.forEach(field => {
        errors[field] = true;
        triggerShake(field);
      });
      setValidationErrors(errors);
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    // Save autofilled values if they were used
    if (set.weight === null || set.reps === null) {
      updateSet(exerciseLocalId, setLocalId, {
        weight: finalWeight,
        reps: finalReps
      });
    }

    // Complete the set
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeSet(exerciseLocalId, setLocalId);
  };

  const getSetDisplay = () => {
    switch (set.setType) {
      case 'warmup':
        return { label: 'W', color: '#eab308' };
      case 'failure':
        return { label: 'F', color: Colors.error };
      case 'dropset':
        return { label: 'D', color: '#3b82f6' };
      default:
        return { label: (setIndex + 1).toString(), color: Colors.textPrimary };
    }
  };

  // Get set type background color for row tinting
  const getSetTypeStyle = () => {
    if (set.isCompleted) return null; // Completed state takes priority
    switch (set.setType) {
      case 'warmup':
        return { backgroundColor: Colors.warmupOverlay };
      case 'dropset':
        return { backgroundColor: Colors.dropsetOverlay };
      case 'failure':
        return { backgroundColor: Colors.failureOverlay };
      default:
        return null;
    }
  };

  const setDisplay = getSetDisplay();

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
      return [styles.input, styles.inputError];
    }

    if (set.isCompleted) {
      return [styles.input, styles.inputCompleted];
    }

    return styles.input;
  };

  const setTypeStyle = getSetTypeStyle();

  return (
    <Animated.View
      entering={FadeIn.delay(setIndex * 40).duration(200).easing(Easing.out(Easing.cubic))}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        containerStyle={{ overflow: 'visible' }}
      >
        <View style={[
          styles.container,
          set.isCompleted && styles.containerCompleted,
          setTypeStyle && styles.containerSetType,
          setTypeStyle,
        ]}>
        {/* Set number/type badge */}
        <View ref={badgeRef} collapsable={false}>
          <Pressable
            onPress={() => {
              badgeRef.current?.measureInWindow((x, y, width, height) => {
                setPopoverPosition({ x: x, y: y + height + 4 });
                setShowTypeSelector(true);
              });
            }}
            style={styles.setBadge}
          >
            <Text style={[styles.setBadgeText, { color: setDisplay.color }]}>
              {setDisplay.label}
            </Text>
          </Pressable>
        </View>

        {/* Previous set indicator - shows last session performance */}
        <View style={styles.previousCol}>
          <Text style={styles.previousText}>
            {lastPerformance
              ? `${lastPerformance.setCount}x${lastPerformance.weight}`
              : '—'}
          </Text>
        </View>

        {/* Weight input */}
        <Animated.View style={[styles.inputWrapper, styles.weightWrapper, useEditor && styles.flexCol, weightAnimatedStyle]}>
          <Pressable
            onPress={() => openNumberPad(exerciseLocalId, setLocalId, 'weight')}
            style={[
              getInputStyle('weight'),
              isWeightActive && styles.inputActive,
              isWeightActive && activeNumberPad?.hasError && styles.inputError
            ]}
          >
            <Text style={[
              styles.inputText,
              (isWeightActive && !activeNumberPad?.pendingValue && previousSet?.weight != null) && styles.placeholderText,
              (!isWeightActive && set.weight === null) && styles.placeholderText
            ]}>
              {isWeightActive
                ? (activeNumberPad?.pendingValue || previousSet?.weight?.toString() || '')
                : (set.weight !== null ? set.weight.toString() : (previousSet?.weight?.toString() || ''))}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Reps input with RPE badge */}
        <Animated.View style={[styles.inputWrapper, styles.repsWrapper, useEditor && styles.flexCol, repsAnimatedStyle]}>
          <View style={styles.repsContainer}>
            <Pressable
              onPress={() => openNumberPad(exerciseLocalId, setLocalId, 'reps')}
              style={[
                getInputStyle('reps'),
                isRepsActive && styles.inputActive,
                isRepsActive && activeNumberPad?.hasError && styles.inputError
              ]}
            >
              <Text style={[
                styles.inputText,
                (isRepsActive && !activeNumberPad?.pendingValue && previousSet?.reps != null) && styles.placeholderText,
                (!isRepsActive && set.reps === null) && styles.placeholderText
              ]}>
                {isRepsActive
                  ? (activeNumberPad?.pendingValue || previousSet?.reps?.toString() || '')
                  : (set.reps !== null ? set.reps.toString() : (previousSet?.reps?.toString() || ''))}
              </Text>
            </Pressable>
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

        {/* Completion checkbox - hidden in editor mode */}
        {!useEditor && (
          <Pressable
            onPress={handleComplete}
            style={[styles.checkbox, set.isCompleted && styles.checkboxCompleted]}
          >
            {set.isCompleted ? (
              <>
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <CheckIcon
                  size={18}
                  color={Colors.white}
                  strokeWidth={3}
                />
              </>
            ) : (
              <CheckIcon
                size={16}
                color={Colors.textTertiary}
                strokeWidth={2}
              />
            )}
          </Pressable>
        )}

        {/* Set Type Popover */}
        <SetTypeSelector
          visible={showTypeSelector}
          onClose={() => setShowTypeSelector(false)}
          onSelect={(type) => updateSetType(exerciseLocalId, setLocalId, type)}
          hideFailure={useEditor}
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
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
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
    backgroundColor: Colors.successOverlay,
    borderRadius: BorderRadius.lg,
    marginLeft: -Spacing.md,
    paddingLeft: Spacing.md,
    marginRight: -Spacing.sm,
    paddingRight: Spacing.sm,
  },
  containerSetType: {
    borderRadius: BorderRadius.md,
    marginLeft: -Spacing.sm,
    paddingLeft: Spacing.sm,
    marginRight: -Spacing.xs,
    paddingRight: Spacing.xs,
  },
  setBadge: {
    width: 40,
    height: 40,
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
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.3,
  },
  previousCol: {
    width: 56,
    alignItems: 'center',
  },
  previousText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textTertiary,
    letterSpacing: 0.3,
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
    marginLeft: Spacing.sm,
  },
  flexCol: {
    flex: 1,
    marginLeft: 0,
    alignItems: 'center',
  },
  input: {
    width: 40,
    height: 32,
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
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  inputActive: {
    borderColor: Colors.success,
    borderWidth: 2.5,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  checkbox: {
    width: 32,
    height: 32,
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
    marginLeft: Spacing.md,
    overflow: 'hidden',
  },
  checkboxCompleted: {
    borderWidth: 0,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  repsContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  rpeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  rpeBadgeText: {
    fontSize: 10,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.background,
    letterSpacing: 0.3,
  },
});
