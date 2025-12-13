/**
 * SetRow Component
 *
 * Displays a single set row within an exercise card.
 * Handles weight, reps, RPE input with validation animations.
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { WorkoutSet, SetType, SET_TYPE_CONFIG, RPE_COLORS } from '../../../types/workout';
import { Colors } from '../../../../constants/Colors';

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  previousSet?: WorkoutSet;
  onUpdateWeight: (weight: number | null) => void;
  onUpdateReps: (reps: number | null) => void;
  onUpdateRpe: (rpe: 6 | 7 | 8 | 9 | 10 | null) => void;
  onComplete: () => void;
  onRemove: () => void;
  onSetTypePress: () => void;
  onRpePress: () => void;
}

export function SetRow({
  set,
  setIndex,
  previousSet,
  onUpdateWeight,
  onUpdateReps,
  onUpdateRpe,
  onComplete,
  onRemove,
  onSetTypePress,
  onRpePress,
}: SetRowProps) {
  const [weightError, setWeightError] = useState(false);
  const [repsError, setRepsError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleWeightChange = (text: string) => {
    setWeightError(false);
    if (text === '') {
      onUpdateWeight(null);
      return;
    }
    // Allow decimal numbers
    if (/^\d*\.?\d*$/.test(text)) {
      const value = parseFloat(text);
      if (!isNaN(value)) {
        onUpdateWeight(value);
      }
    }
  };

  const handleRepsChange = (text: string) => {
    setRepsError(false);
    if (text === '') {
      onUpdateReps(null);
      return;
    }
    // Allow only integers
    if (/^\d*$/.test(text)) {
      const value = parseInt(text, 10);
      if (!isNaN(value)) {
        onUpdateReps(value);
      }
    }
  };

  const handleComplete = () => {
    // Validate weight and reps
    const hasWeight = set.weight !== null || (previousSet?.isCompleted && previousSet?.weight !== null);
    const hasReps = set.reps !== null || (previousSet?.isCompleted && previousSet?.reps !== null);

    if (!hasWeight || !hasReps) {
      if (!hasWeight) setWeightError(true);
      if (!hasReps) setRepsError(true);
      triggerShake();
      return;
    }

    // Auto-fill from previous if empty
    if (set.weight === null && previousSet?.weight !== null) {
      onUpdateWeight(previousSet.weight);
    }
    if (set.reps === null && previousSet?.reps !== null) {
      onUpdateReps(previousSet.reps);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  const getSetTypeDisplay = () => {
    const config = SET_TYPE_CONFIG[set.setType];
    if (set.setType === 'normal') {
      return { label: String(setIndex + 1), color: '#ffffff' };
    }
    return { label: config.label, color: config.color };
  };

  const setTypeDisplay = getSetTypeDisplay();
  const placeholderWeight = previousSet?.isCompleted ? String(previousSet.weight || '') : '';
  const placeholderReps = previousSet?.isCompleted ? String(previousSet.reps || '') : '';

  return (
    <Animated.View
      style={[
        styles.container,
        set.isCompleted && styles.completedContainer,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {/* Set Type Indicator */}
      <Pressable style={styles.setTypeButton} onPress={onSetTypePress}>
        <View
          style={[
            styles.setTypeBadge,
            set.setType !== 'normal' && {
              backgroundColor: SET_TYPE_CONFIG[set.setType].bgColor,
            },
          ]}
        >
          <Animated.Text style={[styles.setTypeText, { color: setTypeDisplay.color }]}>
            {setTypeDisplay.label}
          </Animated.Text>
        </View>
      </Pressable>

      {/* Previous Value */}
      <View style={styles.previousCell}>
        <Animated.Text style={styles.previousText}>—</Animated.Text>
      </View>

      {/* Weight Input */}
      <View style={styles.inputCell}>
        <TextInput
          style={[
            styles.input,
            set.isCompleted && styles.completedInput,
            weightError && styles.errorInput,
          ]}
          value={set.weight !== null ? String(set.weight) : ''}
          onChangeText={handleWeightChange}
          placeholder={placeholderWeight}
          placeholderTextColor="#666"
          keyboardType="decimal-pad"
          selectTextOnFocus
        />
      </View>

      {/* Reps Input */}
      <View style={styles.inputCell}>
        <TextInput
          style={[
            styles.input,
            set.isCompleted && styles.completedInput,
            repsError && styles.errorInput,
          ]}
          value={set.reps !== null ? String(set.reps) : ''}
          onChangeText={handleRepsChange}
          placeholder={placeholderReps}
          placeholderTextColor="#666"
          keyboardType="number-pad"
          selectTextOnFocus
        />
      </View>

      {/* RPE Selector */}
      <Pressable style={styles.rpeCell} onPress={onRpePress}>
        <View
          style={[
            styles.rpeButton,
            set.isCompleted && styles.completedInput,
            set.rpe && { backgroundColor: `${RPE_COLORS[set.rpe]}20` },
          ]}
        >
          <Animated.Text
            style={[
              styles.rpeText,
              set.rpe && { color: RPE_COLORS[set.rpe] },
            ]}
          >
            {set.rpe || ''}
          </Animated.Text>
        </View>
      </Pressable>

      {/* Complete Checkmark */}
      <Pressable
        style={[
          styles.checkButton,
          set.isCompleted && styles.checkButtonCompleted,
        ]}
        onPress={handleComplete}
      >
        <Check
          size={20}
          color="#ffffff"
          strokeWidth={2.5}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  setTypeButton: {
    width: 40,
    alignItems: 'center',
  },
  setTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  setTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previousCell: {
    width: 65,
    alignItems: 'center',
  },
  previousText: {
    fontSize: 13,
    color: '#666',
  },
  inputCell: {
    flex: 1,
    minWidth: 55,
    maxWidth: 65,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#ffffff',
  },
  completedInput: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  errorInput: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  rpeCell: {
    width: 50,
  },
  rpeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rpeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#22c55e',
  },
});
