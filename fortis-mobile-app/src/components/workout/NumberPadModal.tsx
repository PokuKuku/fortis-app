import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Delete, Minus, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useWorkoutStore } from '@/src/store/workoutStore';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface NumberPadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: number | null) => void;
  inputType: 'weight' | 'reps';
}

export function NumberPadModal({
  visible,
  onClose,
  onConfirm,
  inputType,
}: NumberPadModalProps) {
  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);
  const updatePendingValue = useWorkoutStore(s => s.updatePendingValue);

  const displayValue = activeNumberPad?.pendingValue ?? '';

  const setDisplayValue = (updater: string | ((prev: string) => string)) => {
    const newValue = typeof updater === 'function' ? updater(displayValue) : updater;
    updatePendingValue(newValue);
  };

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (num === '.') {
      // Only allow decimal for weight, and only one decimal point
      if (inputType === 'reps' || displayValue.includes('.')) return;
      // Add leading zero if starting with decimal
      setDisplayValue(prev => prev === '' ? '0.' : prev + '.');
    } else {
      // Limit length to prevent overflow
      if (displayValue.length >= 6) return;
      setDisplayValue(prev => prev + num);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisplayValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDisplayValue('');
  };

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = displayValue === '' ? 0 : parseFloat(displayValue);
    const increment = inputType === 'weight' ? 5 : 1;
    setDisplayValue((current + increment).toString());
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = displayValue === '' ? 0 : parseFloat(displayValue);
    const decrement = inputType === 'weight' ? 5 : 1;
    const newValue = Math.max(0, current - decrement);
    setDisplayValue(newValue === 0 ? '' : newValue.toString());
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const value = displayValue === '' ? null : parseFloat(displayValue);
    onConfirm(value);
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
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      {/* Keyboard */}
      <Animated.View
        entering={SlideInDown.duration(200)}
        exiting={SlideOutDown.duration(200)}
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
                {inputType === 'weight' ? (
                  renderNumberButton('.')
                ) : (
                  <View style={styles.numberButton} />
                )}
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
                  <Delete size={24} color={Colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Right side - Controls */}
            <View style={styles.controlsColumn}>
              {/* Increment/Decrement buttons */}
              <View style={styles.incrementRow}>
                <Pressable
                  onPress={handleDecrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Minus size={20} color={Colors.textPrimary} strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  onPress={handleIncrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Plus size={20} color={Colors.textPrimary} strokeWidth={2.5} />
                </Pressable>
              </View>

              {/* Next button with gradient */}
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && styles.nextButtonPressed,
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
                <Text style={styles.nextText}>Next</Text>
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
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  controlsColumn: {
    width: 110,
    gap: Spacing.xs,
  },
  incrementRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  incrementButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
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
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    zIndex: 10,
  },
});
