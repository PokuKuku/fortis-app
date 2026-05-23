import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BackspaceIcon, ChevronDoubleDownIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { BorderRadius } from '@/constants/Sizes';
import { scale } from '@/src/utils/responsive';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { RPESelectorOverlay } from './RPESelectorOverlay';
import { RPEHelpModal } from './RPEHelpModal';
import { RpeValue } from '@/src/types/workout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

// Scaled sizing to keep proportions consistent across devices
const PAD_SCALE = 0.9;
const TEXT_SCALE = 1.08;
const NUMBER_COLUMNS = 3;
const BUTTON_SIZE = Math.round(scale(52) * PAD_SCALE);
const CONTROLS_WIDTH = Math.round(scale(90) * PAD_SCALE);
const PAD_GAP = Math.round(scale(4) * PAD_SCALE);
const PAD_HORIZONTAL = Math.round(scale(10) * PAD_SCALE);
const PAD_TOP = Math.round(scale(6) * PAD_SCALE);
const PAD_BOTTOM = Math.round(scale(24) * PAD_SCALE);
const EXTRA_BOTTOM_PADDING = 0;
const DRAG_HANDLE_WIDTH = Math.round(scale(32) * PAD_SCALE);
const DRAG_HANDLE_HEIGHT = Math.max(2, Math.round(scale(3) * PAD_SCALE));
const PAD_RADIUS = Math.round(scale(18) * PAD_SCALE);
const BUTTON_RADIUS = Math.round(scale(BorderRadius.md) * PAD_SCALE);
const NUMBER_TEXT_SIZE = Math.round(scale(26) * PAD_SCALE * TEXT_SCALE);
const CONTROL_TEXT_SIZE = Math.round(scale(15) * PAD_SCALE * TEXT_SCALE);
const NEXT_TEXT_SIZE = Math.round(scale(17) * PAD_SCALE * TEXT_SCALE);
const BACKSPACE_ICON_SIZE = Math.round(scale(24) * PAD_SCALE);
const CLOSE_ICON_SIZE = Math.round(scale(22) * PAD_SCALE);
const FILL_ICON_SIZE = Math.round(scale(20) * PAD_SCALE);
const NUMBER_GRID_WIDTH = Math.round((BUTTON_SIZE * NUMBER_COLUMNS) + (PAD_GAP * (NUMBER_COLUMNS - 1)));
const PAD_CONTAINER_WIDTH = Math.round(NUMBER_GRID_WIDTH + PAD_GAP + CONTROLS_WIDTH);
const PAD_WIDTH = Math.round(PAD_CONTAINER_WIDTH + (PAD_HORIZONTAL * 2));

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
  const insets = useSafeAreaInsets();

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
    // Accent-based gradient and shadow for next button
    nextButtonGradient: colors.accentGradient as unknown as string[],
    nextButtonShadow: { shadowColor: colors.accentShadow },
  };

  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const activeExerciseLocalId = useWorkoutStore((s) => s.activeNumberPad?.exerciseLocalId ?? null);
  const activeSetLocalId = useWorkoutStore((s) => s.activeNumberPad?.setLocalId ?? null);
  const updatePendingValue = useWorkoutStore(s => s.updatePendingValue);
  const showRpeSelector = useWorkoutStore(s => s.showRpeSelector);
  const showRpeHelp = useWorkoutStore(s => s.showRpeHelp);
  const openRpeSelector = useWorkoutStore(s => s.openRpeSelector);
  const openRpeHelp = useWorkoutStore(s => s.openRpeHelp);
  const closeRpeHelp = useWorkoutStore(s => s.closeRpeHelp);
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const toggleWeightUnit = useWorkoutStore(s => s.toggleWeightUnit);
  const updateSet = useWorkoutStore(s => s.updateSet);
  const updateEditorSet = useWorkoutStore(s => s.updateEditorSet);
  const applyPendingValueToRemainingSets = useWorkoutStore(s => s.applyPendingValueToRemainingSets);

  const getActiveNumberPadSnapshot = () => useWorkoutStore.getState().activeNumberPad;

  const getPendingValue = () => getActiveNumberPadSnapshot()?.pendingValue ?? '';

  // Get current set context for RPE and weight unit controls
  const currentExercise = activeExerciseLocalId && session
    ? session.exercises.find((e) => e.localId === activeExerciseLocalId)
    : null;
  const currentSet = currentExercise && activeSetLocalId
    ? currentExercise.sets.find((s) => s.localId === activeSetLocalId)
    : null;
  const currentRpe: RpeValue = currentSet?.rpe ?? null;
  const currentWeightUnit = currentExercise
    ? (weightUnits[currentExercise.exerciseId] || 'lbs')
    : 'lbs';

  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const setDisplayValue = (updater: string | ((prev: string) => string)) => {
    const currentValue = getPendingValue();
    const newValue = typeof updater === 'function' ? updater(currentValue) : updater;
    updatePendingValue(newValue);
  };

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const activeNumberPad = getActiveNumberPadSnapshot();
    if (!activeNumberPad) return;
    const baseValue = activeNumberPad.shouldReplaceOnNextInput
      ? ''
      : activeNumberPad.pendingValue;

    if (num === '.') {
      // Only allow decimal for weight, and only one decimal point
      if (inputType === 'reps' || baseValue.includes('.')) return;
      // Add leading zero if starting with decimal
      setDisplayValue(baseValue === '' ? '0.' : baseValue + '.');
    } else {
      // Limit length to prevent overflow
      if (baseValue.length >= 6) return;
      setDisplayValue(baseValue + num);
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

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const displayValue = getPendingValue();
    const value = displayValue === '' ? null : parseFloat(displayValue);
    if (onNext) {
      onNext(value);
    } else {
      onConfirm(value);
    }
  };

  const handleKeyboardToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const activeNumberPad = getActiveNumberPadSnapshot();
    if (activeNumberPad) {
      const displayValue = activeNumberPad.pendingValue;
      const trimmedValue = displayValue.trim();
      if (trimmedValue.length > 0) {
        const parsedValue = Number(trimmedValue);
        if (!Number.isNaN(parsedValue)) {
          const { exerciseLocalId, setLocalId, inputType } = activeNumberPad;
          if (useEditor) {
            updateEditorSet(exerciseLocalId, setLocalId, { [inputType]: parsedValue });
          } else {
            updateSet(exerciseLocalId, setLocalId, { [inputType]: parsedValue });
          }
        }
      }
    }
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

  const handleFillDown = () => {
    if (useEditor) return; // Only available during active workout
    const applied = applyPendingValueToRemainingSets();
    if (applied) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
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

  const padBottomPadding = PAD_BOTTOM + EXTRA_BOTTOM_PADDING + Math.round(insets.bottom);

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      {/* Keyboard */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
          style={[styles.container, containerAnimatedStyle]}
        >
          <View
            style={[
              styles.padWrapper,
              themedStyles.padWrapper,
              { paddingBottom: padBottomPadding },
            ]}
          >
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
                  <BackspaceIcon size={BACKSPACE_ICON_SIZE} color={colors.textPrimary} strokeWidth={2} />
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
                <XMarkIcon size={CLOSE_ICON_SIZE} color={colors.textSecondary} strokeWidth={2} />
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

              {/* Fill Down button - only in active workout mode */}
              {!useEditor && (
                <Pressable
                  onPress={handleFillDown}
                  style={({ pressed }) => [
                    styles.controlButton,
                    themedStyles.controlButton,
                    pressed && themedStyles.buttonPressed,
                  ]}
                >
                  <ChevronDoubleDownIcon size={FILL_ICON_SIZE} color={colors.textPrimary} strokeWidth={2} />
                </Pressable>
              )}

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
                <Text style={[styles.nextText, { color: colors.accentForegroundOnFill }]}>Next</Text>
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
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  padWrapper: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: PAD_RADIUS,
    borderTopRightRadius: PAD_RADIUS,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    paddingTop: PAD_TOP,
    paddingBottom: 0,
    paddingHorizontal: PAD_HORIZONTAL,
    width: '100%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: PAD_TOP,
  },
  dragHandle: {
    width: DRAG_HANDLE_WIDTH,
    height: DRAG_HANDLE_HEIGHT,
    borderRadius: DRAG_HANDLE_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  padContainer: {
    flexDirection: 'row',
    gap: PAD_GAP,
    width: '100%',
  },
  numberGrid: {
    gap: PAD_GAP,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: PAD_GAP,
  },
  numberButton: {
    flex: 1,
    height: BUTTON_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  numberText: {
    fontSize: NUMBER_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  controlsColumn: {
    width: CONTROLS_WIDTH,
    gap: PAD_GAP,
  },
  controlButton: {
    height: BUTTON_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeButtonText: {
    fontSize: CONTROL_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  unitButtonText: {
    fontSize: CONTROL_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  nextButton: {
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
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
    fontSize: NEXT_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    zIndex: 10,
  },
});
