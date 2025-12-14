import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSet } from '@/src/types/workout';
import { SetTypeSelector } from './SetTypeSelector';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SetRowProps {
  exerciseLocalId: string;
  setLocalId: string;
  setIndex: number;
  previousSet?: WorkoutSet;
}

export function SetRow({ exerciseLocalId, setLocalId, setIndex, previousSet }: SetRowProps) {
  const activeSession = useWorkoutStore(s => s.activeSession);
  const updateSet = useWorkoutStore(s => s.updateSet);
  const completeSet = useWorkoutStore(s => s.completeSet);
  const updateSetType = useWorkoutStore(s => s.updateSetType);
  const removeSet = useWorkoutStore(s => s.removeSet);
  const openNumberPad = useWorkoutStore(s => s.openNumberPad);
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);

  // Check if this input is currently active
  const isWeightActive = activeNumberPad?.exerciseLocalId === exerciseLocalId &&
    activeNumberPad?.setLocalId === setLocalId &&
    activeNumberPad?.inputType === 'weight';
  const isRepsActive = activeNumberPad?.exerciseLocalId === exerciseLocalId &&
    activeNumberPad?.setLocalId === setLocalId &&
    activeNumberPad?.inputType === 'reps';

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    weight?: boolean;
    reps?: boolean;
  }>({});

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

  // Find the current set
  const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
  const set = exercise?.sets.find(s => s.localId === setLocalId);

  if (!set) return null;

  const handleComplete = () => {
    const missingFields: ('weight' | 'reps')[] = [];

    if (set.weight === null) missingFields.push('weight');
    if (set.reps === null) missingFields.push('reps');

    if (missingFields.length > 0) {
      // Show validation errors
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errors: { weight?: boolean; reps?: boolean } = {};
      missingFields.forEach(field => {
        errors[field] = true;
        triggerShake(field);
      });
      setValidationErrors(errors);
      return;
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

  const setDisplay = getSetDisplay();

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

  return (
    <View style={[styles.container, set.isCompleted && styles.containerCompleted]}>
      {/* Set number/type badge */}
      <Pressable
        onPress={() => setShowTypeSelector(true)}
        style={styles.setBadge}
      >
        <Text style={[styles.setBadgeText, { color: setDisplay.color }]}>
          {setDisplay.label}
        </Text>
      </Pressable>

      {/* Previous set indicator */}
      <View style={styles.previousCol}>
        <Text style={styles.previousText}>—</Text>
      </View>

      {/* Weight input */}
      <Animated.View style={[styles.inputWrapper, styles.weightWrapper, weightAnimatedStyle]}>
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
            !isWeightActive && set.weight === null && styles.placeholderText
          ]}>
            {isWeightActive
              ? activeNumberPad?.pendingValue || ''
              : (set.weight !== null ? set.weight.toString() : (previousSet?.weight?.toString() || ''))}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Reps input */}
      <Animated.View style={[styles.inputWrapper, repsAnimatedStyle]}>
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
            !isRepsActive && set.reps === null && styles.placeholderText
          ]}>
            {isRepsActive
              ? activeNumberPad?.pendingValue || ''
              : (set.reps !== null ? set.reps.toString() : (previousSet?.reps?.toString() || ''))}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Completion checkbox */}
      <Pressable
        onPress={handleComplete}
        style={[styles.checkbox, set.isCompleted && styles.checkboxCompleted]}
      >
        <Check
          size={20}
          color={Colors.textPrimary}
          strokeWidth={2.5}
        />
      </Pressable>

      {/* Modals */}
      <SetTypeSelector
        visible={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={(type) => updateSetType(exerciseLocalId, setLocalId, type)}
        onRemove={() => removeSet(exerciseLocalId, setLocalId)}
        currentType={set.setType}
        setIndex={setIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  containerCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xs,
  },
  setBadge: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  previousCol: {
    width: 65,
    alignItems: 'center',
  },
  previousText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
  inputWrapper: {
    // Wrapper for animated shake
  },
  weightWrapper: {
    marginRight: Spacing.sm,
  },
  input: {
    width: 70,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  inputError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: Colors.error,
  },
  inputCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  inputActive: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
  },
});
