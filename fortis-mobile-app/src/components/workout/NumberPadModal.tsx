import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BackspaceIcon, MinusIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { RPESelectorOverlay } from './RPESelectorOverlay';
import { RPEHelpModal } from './RPEHelpModal';
import { RpeValue } from '@/src/types/workout';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  SlideOutDown,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface NumberPadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: number | null) => void;
  onNext?: (value: number | null) => void;
  inputType: 'weight' | 'reps';
  useEditor?: boolean;
}

export function NumberPadModal({
  visible,
  onClose,
  onConfirm,
  onNext,
  inputType,
  useEditor = false,
}: NumberPadModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    padWrapper: {
      backgroundColor: colors.background,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    dragHandle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    },
    numberButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    buttonPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    numberText: { color: colors.textPrimary },
    controlButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    rpeButtonText: { color: colors.textPrimary },
    unitButtonText: { color: colors.textPrimary },
    incrementButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    // Accent-based gradient and shadow for next button
    nextButtonGradient: colors.accentGradient as unknown as string[],
    nextButtonShadow: { shadowColor: colors.accentShadow },
  };

  const activeNumberPad = useWorkoutStore(s => s.activeNumberPad);
  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const updatePendingValue = useWorkoutStore(s => s.updatePendingValue);
  const showRpeSelector = useWorkoutStore(s => s.showRpeSelector);
  const showRpeHelp = useWorkoutStore(s => s.showRpeHelp);
  const openRpeSelector = useWorkoutStore(s => s.openRpeSelector);
  const openRpeHelp = useWorkoutStore(s => s.openRpeHelp);
  const closeRpeHelp = useWorkoutStore(s => s.closeRpeHelp);
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const toggleWeightUnit = useWorkoutStore(s => s.toggleWeightUnit);

  // Get current RPE value for the active set
  const getCurrentRpe = (): RpeValue => {
    if (!activeNumberPad || !session) return null;
    const exercise = session.exercises.find(
      (e) => e.localId === activeNumberPad.exerciseLocalId
    );
    const set = exercise?.sets.find(
      (s) => s.localId === activeNumberPad.setLocalId
    );
    return set?.rpe ?? null;
  };

  const currentRpe = getCurrentRpe();

  // Get current exercise for weight unit
  const currentExercise = activeNumberPad && session
    ? session.exercises.find(e => e.localId === activeNumberPad.exerciseLocalId)
    : null;
  const currentWeightUnit = currentExercise
    ? (weightUnits[currentExercise.exerciseId] || 'lbs')
    : 'lbs';

  const displayValue = activeNumberPad?.pendingValue ?? '';
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

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
    if (onNext) {
      onNext(value);
    } else {
      onConfirm(value);
    }
  };

  const handleKeyboardToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose(); // Close the number pad
  };

  const handleRpePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openRpeSelector();
  };

  const handleWeightUnitToggle = () => {
    if (!currentExercise) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWeightUnit(currentExercise.exerciseId);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 120 || event.velocityY > 1200;
      if (shouldClose) {
        translateY.value = withTiming(200, { duration: 150 });
        runOnJS(handleKeyboardToggle)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderNumberButton = (num: string) => (
    <Pressable
      key={num}
      onPress={() => handleNumberPress(num)}
      style={({ pressed }) => [
        styles.numberButton,
        themedStyles.numberButton,
        pressed && themedStyles.buttonPressed,
      ]}
    >
      <Text style={[styles.numberText, themedStyles.numberText]}>{num}</Text>
    </Pressable>
  );

  if (!visible) return null;

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      {/* Empty space above keyboard - pointerEvents="none" allows touches to pass through to FlatList */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Keyboard */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
          style={[styles.container, containerAnimatedStyle]}
        >
          <View style={[styles.padWrapper, themedStyles.padWrapper]}>
            <StainlessSteelPattern />

          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, themedStyles.dragHandle]} />
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
                  <View style={[styles.numberButton, themedStyles.numberButton]} />
                )}
                {renderNumberButton('0')}
                <Pressable
                  onPress={handleDelete}
                  onLongPress={handleClear}
                  delayLongPress={500}
                  style={({ pressed }) => [
                    styles.numberButton,
                    themedStyles.numberButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <BackspaceIcon size={24} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Right side - Controls */}
            <View style={styles.controlsColumn}>
              {/* Close button */}
              <Pressable
                onPress={handleKeyboardToggle}
                style={({ pressed }) => [
                  styles.controlButton,
                  themedStyles.controlButton,
                  pressed && themedStyles.buttonPressed,
                ]}
              >
                <XMarkIcon size={22} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>

              {/* Context-aware button: Weight unit toggle or RPE */}
              {inputType === 'weight' ? (
                <Pressable
                  onPress={handleWeightUnitToggle}
                  style={({ pressed }) => [
                    styles.controlButton,
                    themedStyles.controlButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <Text style={[styles.unitButtonText, themedStyles.unitButtonText]}>{currentWeightUnit === 'lbs' ? 'kg' : 'lbs'}</Text>
                </Pressable>
              ) : !useEditor ? (
                <Pressable
                  onPress={handleRpePress}
                  style={({ pressed }) => [
                    styles.controlButton,
                    themedStyles.controlButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <Text style={[styles.rpeButtonText, themedStyles.rpeButtonText]}>RPE</Text>
                </Pressable>
              ) : (
                <View style={[styles.controlButton, themedStyles.controlButton]} />
              )}

              {/* Increment/Decrement buttons */}
              <View style={styles.incrementRow}>
                <Pressable
                  onPress={handleDecrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    themedStyles.incrementButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <MinusIcon size={20} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={handleIncrement}
                  style={({ pressed }) => [
                    styles.incrementButton,
                    themedStyles.incrementButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <PlusIcon size={20} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Next button with gradient */}
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.nextButton,
                  themedStyles.nextButtonShadow,
                  pressed && styles.nextButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={themedStyles.nextButtonGradient}
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

          {/* RPE Selector Overlay - rendered after padWrapper to appear on top */}
          <RPESelectorOverlay
            visible={showRpeSelector}
            currentRpe={currentRpe}
            onOpenHelp={openRpeHelp}
          />
        </Animated.View>
      </GestureDetector>

      {/* RPE Help Modal */}
      <RPEHelpModal visible={showRpeHelp} onClose={closeRpeHelp} />
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
  rpeButtonText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  unitButtonText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
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
  nextButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // shadowColor is now dynamic via themedStyles
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
    fontFamily: 'BankGothicBT-Medium',
    color: '#fff',
    textTransform: 'uppercase',
    zIndex: 10,
  },
});
