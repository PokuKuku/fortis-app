import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BackspaceIcon, MinusIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TemplateNumberPadProps {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  inputType: 'weight' | 'reps';
}

export function TemplateNumberPad({
  visible,
  value,
  onChange,
  onClose,
  inputType,
}: TemplateNumberPadProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // Sync displayValue when value prop changes (when switching fields)
  if (value !== displayValue && !visible) {
    setDisplayValue(value);
  }

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let newValue = displayValue;
    if (num === '.') {
      // Only allow decimal for weight, and only one decimal point
      if (inputType === 'reps' || displayValue.includes('.')) return;
      newValue = displayValue === '' ? '0.' : displayValue + '.';
    } else if (num === '-') {
      // Only allow dash for reps (for ranges like "8-12"), and only one dash
      if (inputType === 'weight' || displayValue.includes('-')) return;
      if (displayValue === '') return; // Need at least one number before dash
      newValue = displayValue + '-';
    } else {
      // Limit length to prevent overflow
      if (displayValue.length >= 7) return;
      newValue = displayValue + num;
    }
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = displayValue.slice(0, -1);
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDisplayValue('');
    onChange('');
  };

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newValue: string;
    // For reps with range, increment the last number
    if (displayValue.includes('-')) {
      const parts = displayValue.split('-');
      const lastNum = parseInt(parts[1] || '0', 10);
      newValue = `${parts[0]}-${lastNum + 1}`;
    } else {
      const current = displayValue === '' ? 0 : parseFloat(displayValue);
      const increment = inputType === 'weight' ? 5 : 1;
      newValue = (current + increment).toString();
    }
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newValue: string;
    // For reps with range, decrement the last number
    if (displayValue.includes('-')) {
      const parts = displayValue.split('-');
      const lastNum = parseInt(parts[1] || '0', 10);
      const newLast = Math.max(0, lastNum - 1);
      newValue = newLast === 0 ? parts[0] : `${parts[0]}-${newLast}`;
    } else {
      const current = displayValue === '' ? 0 : parseFloat(displayValue);
      const decrement = inputType === 'weight' ? 5 : 1;
      const decremented = Math.max(0, current - decrement);
      newValue = decremented === 0 ? '' : decremented.toString();
    }
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(displayValue);
    onClose();
  };

  const handleKeyboardClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Save current value before closing
    onChange(displayValue);
    onClose();
  };

  const renderNumberButton = (num: string) => (
    <Pressable
      key={num}
      onPress={() => handleNumberPress(num)}
      style={({ pressed }) => [
        styles.numberButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.numberText}>{num}</Text>
    </Pressable>
  );

  if (!visible) return null;

  return (
    <View style={styles.absoluteContainer}>
      {/* Dismissible backdrop - tap to close */}
      <Pressable style={styles.backdrop} onPress={handleKeyboardClose} />

      {/* Keyboard */}
      <Animated.View
        entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
        style={styles.container}
      >
        <View style={styles.padWrapper}>
          <StainlessSteelPattern />

          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Number Pad Grid */}
          <View style={styles.padContainer}>
            {/* Left side - Number grid */}
            <View style={styles.numberGrid}>
              <View style={styles.row}>
                {renderNumberButton('1')}
                {renderNumberButton('2')}
                {renderNumberButton('3')}
              </View>
              <View style={styles.row}>
                {renderNumberButton('4')}
                {renderNumberButton('5')}
                {renderNumberButton('6')}
              </View>
              <View style={styles.row}>
                {renderNumberButton('7')}
                {renderNumberButton('8')}
                {renderNumberButton('9')}
              </View>
              <View style={styles.row}>
                <View style={styles.numberButton} />
                {renderNumberButton('0')}
                <Pressable
                  onPress={handleDelete}
                  onLongPress={handleClear}
                  delayLongPress={500}
                  style={({ pressed }) => [
                    styles.numberButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <BackspaceIcon size={24} color={Colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Right side - Controls */}
            <View style={styles.controlsColumn}>
              {/* Close button */}
              <Pressable
                onPress={handleKeyboardClose}
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <XMarkIcon size={22} color={Colors.textSecondary} strokeWidth={2} />
              </Pressable>

              {/* Dash button for reps (for ranges) or decimal for weight */}
              <Pressable
                onPress={() => handleNumberPress(inputType === 'reps' ? '-' : '.')}
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.dashButtonText}>{inputType === 'reps' ? '—' : '.'}</Text>
              </Pressable>

              {/* Increment/Decrement buttons */}
              <View style={styles.incrementRow}>
                <Pressable
                  onPress={handleDecrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MinusIcon size={20} color={Colors.textPrimary} strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={handleIncrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <PlusIcon size={20} color={Colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Done button with gradient */}
              <Pressable
                onPress={handleDone}
                style={({ pressed }) => [
                  styles.doneButton,
                  pressed && styles.doneButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={['rgba(140,140,140,0.45)', 'rgba(100,100,100,0.38)', 'rgba(60,60,60,0.32)', 'rgba(20,20,20,0.25)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  padWrapper: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.md,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  padContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  numberGrid: {
    flex: 1,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  numberButton: {
    flex: 1,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  numberText: {
    fontSize: 28,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  controlsColumn: {
    width: 110,
    gap: Spacing.xs,
  },
  controlButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashButtonText: {
    fontSize: 28,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  incrementRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    height: 56,
  },
  incrementButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonPressed: {
    opacity: 0.8,
  },
  doneText: {
    fontSize: 18,
    fontFamily: 'BankGothicBT-Medium',
    color: '#fff',
    textTransform: 'uppercase',
    zIndex: 10,
  },
});
