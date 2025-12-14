import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { WorkoutSet, SetType } from '@/src/types/workout';
import { SetTypeSelector } from './SetTypeSelector';
import { RPESelector } from './RPESelector';
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

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showRPESelector, setShowRPESelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    weight?: boolean;
    reps?: boolean;
  }>({});

  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);

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

  // Find the current set
  const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
  const set = exercise?.sets.find(s => s.localId === setLocalId);

  if (!set) return null;

  const handleWeightChange = (text: string) => {
    // Allow numbers and one decimal point
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      const value = text === '' ? null : parseFloat(text);
      updateSet(exerciseLocalId, setLocalId, { weight: value });

      // Clear error
      if (validationErrors.weight) {
        setValidationErrors(prev => ({ ...prev, weight: false }));
      }
    }
  };

  const handleRepsChange = (text: string) => {
    // Allow integers only
    if (text === '' || /^\d+$/.test(text)) {
      const value = text === '' ? null : parseInt(text, 10);
      updateSet(exerciseLocalId, setLocalId, { reps: value });

      // Clear error
      if (validationErrors.reps) {
        setValidationErrors(prev => ({ ...prev, reps: false }));
      }
    }
  };

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
      <Animated.View style={[styles.inputWrapper, weightAnimatedStyle]}>
        <TextInput
          ref={weightInputRef}
          value={set.weight !== null ? set.weight.toString() : ''}
          onChangeText={handleWeightChange}
          placeholder={previousSet?.weight?.toString() || ''}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="decimal-pad"
          returnKeyType="next"
          onSubmitEditing={() => repsInputRef.current?.focus()}
          style={getInputStyle('weight')}
        />
      </Animated.View>

      {/* Reps input */}
      <Animated.View style={[styles.inputWrapper, repsAnimatedStyle]}>
        <TextInput
          ref={repsInputRef}
          value={set.reps !== null ? set.reps.toString() : ''}
          onChangeText={handleRepsChange}
          placeholder={previousSet?.reps?.toString() || ''}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={() => setShowRPESelector(true)}
          style={getInputStyle('reps')}
        />
      </Animated.View>

      {/* RPE input */}
      <Pressable
        onPress={() => setShowRPESelector(true)}
        style={styles.rpeButton}
      >
        <Text style={[styles.rpeText, set.isCompleted && styles.rpeTextCompleted]}>
          {set.rpe ?? previousSet?.rpe ?? ''}
        </Text>
      </Pressable>

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

      <RPESelector
        visible={showRPESelector}
        onClose={() => setShowRPESelector(false)}
        onSelect={(rpe) => updateSet(exerciseLocalId, setLocalId, { rpe })}
        currentValue={set.rpe}
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
  input: {
    width: 60,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xs,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  inputError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: Colors.error,
  },
  inputCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  rpeButton: {
    width: 50,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  rpeTextCompleted: {
    color: Colors.textPrimary,
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
