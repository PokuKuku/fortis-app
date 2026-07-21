import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MinusIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { TourOverlay, type AnchorRect } from '@/src/components/tour/TourOverlay';
import { DEFAULT_TARGET_REPS, parseRepRange } from '@/src/utils/workoutProgression';
import type { WeightUnit, WorkoutExercise } from '@/src/types/workout';
import * as Haptics from 'expo-haptics';

const formatExerciseTitle = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const SHEET_EXIT_DURATION_MS = 280;
const KEYPAD_REVEAL_DURATION_MS = 400;
const KEYPAD_REVEAL_HEIGHT = 292;

interface ExerciseTargetSheetProps {
  visible: boolean;
  exercise: WorkoutExercise;
  onClose: () => void;
  editorMode?: boolean;
  weightUnit?: WeightUnit;
  onToggleWeightUnit?: () => void;
  onSave: (target: { sets: number; minReps: number; maxReps: number; startingWeight?: number | null }) => void;
  showTourExplanation?: boolean;
  onTourExplanationNext?: () => void;
}

export function ExerciseTargetSheet({
  visible,
  exercise,
  onClose,
  onSave,
  editorMode = false,
  weightUnit = 'lbs',
  onToggleWeightUnit,
  showTourExplanation = false,
  onTourExplanationNext,
}: ExerciseTargetSheetProps) {
  const { colors, isDark } = useTheme();
  const initialRange = useMemo(
    () => parseRepRange(exercise.targetReps) ?? parseRepRange(DEFAULT_TARGET_REPS)!,
    [exercise.targetReps]
  );
  const [sets, setSets] = useState(String(Math.max(1, exercise.sets.length)));
  const [minReps, setMinReps] = useState(String(initialRange.min));
  const [maxReps, setMaxReps] = useState(String(initialRange.max));
  const [startingWeight, setStartingWeight] = useState(
    exercise.sets[0]?.weight == null ? '' : String(exercise.sets[0].weight)
  );
  const [weightDraft, setWeightDraft] = useState('');
  const [isEditingStartingWeight, setIsEditingStartingWeight] = useState(false);
  const [isKeypadMounted, setIsKeypadMounted] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(visible);
  const [isSheetVisible, setIsSheetVisible] = useState(visible);
  const [sheetRect, setSheetRect] = useState<AnchorRect | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWeightUnitTogglePendingRef = useRef(false);
  const translateY = useSharedValue(0);
  const keypadProgress = useSharedValue(0);
  const keypadHeight = useSharedValue(KEYPAD_REVEAL_HEIGHT);

  useEffect(() => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (visible) {
      setIsModalMounted(true);
      setIsSheetVisible(true);
      return;
    }

    if (!isModalMounted) return;
    setIsSheetVisible(false);
    exitTimeoutRef.current = setTimeout(() => {
      setIsModalMounted(false);
      exitTimeoutRef.current = null;
    }, SHEET_EXIT_DURATION_MS);
  }, [visible, isModalMounted]);

  useEffect(() => () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const range = parseRepRange(exercise.targetReps) ?? parseRepRange(DEFAULT_TARGET_REPS)!;
    setSets(String(Math.max(1, exercise.sets.length)));
    setMinReps(String(range.min));
    setMaxReps(String(range.max));
    if (isWeightUnitTogglePendingRef.current) {
      isWeightUnitTogglePendingRef.current = false;
    } else {
      setStartingWeight(exercise.sets[0]?.weight == null ? '' : String(exercise.sets[0].weight));
    setIsEditingStartingWeight(false);
    setIsKeypadMounted(false);
    setWeightDraft('');
    }
    translateY.value = 0;
  }, [visible, exercise.sets, exercise.targetReps, translateY]);

  const themedStyles = {
    sheet: {
      backgroundColor: colors.background,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    handle: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    label: { color: colors.textSecondary },
    value: { color: colors.textPrimary },
    control: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    },
    iconButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)',
    },
    buttonPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    saveButtonGradient: colors.accentGradient as unknown as string[],
    saveButtonShadow: { shadowColor: colors.accentShadow },
  };

  const parsedSets = Math.max(1, Math.min(12, Math.round(Number(sets) || 1)));
  const parsedMin = Math.max(1, Math.round(Number(minReps) || 1));
  const parsedMax = Math.max(parsedMin, Math.round(Number(maxReps) || parsedMin));

  const adjustSets = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSets(String(Math.max(1, Math.min(12, parsedSets + delta))));
  };

  const adjustRep = (field: 'min' | 'max', delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (field === 'min') {
      const nextMin = Math.max(1, parsedMin + delta);
      setMinReps(String(nextMin));
      if (parsedMax < nextMin) setMaxReps(String(nextMin));
      return;
    }

    setMaxReps(String(Math.max(parsedMin, parsedMax + delta)));
  };

  const handleWeightUnitToggle = () => {
    const currentValue = isEditingStartingWeight ? weightDraft : startingWeight;
    const currentWeight = Number(currentValue);
    if (currentValue.trim() && Number.isFinite(currentWeight)) {
      const converted = weightUnit === 'lbs' ? currentWeight * 0.45359237 : currentWeight / 0.45359237;
      const convertedWeight = String(Math.round(converted * 10) / 10);
      if (isEditingStartingWeight) {
        setWeightDraft(convertedWeight);
      } else {
        setStartingWeight(convertedWeight);
      }
    }
    // The editor session changes its weight unit immediately, while the target
    // value is intentionally local until Save. Keep this local value intact.
    isWeightUnitTogglePendingRef.current = true;
    onToggleWeightUnit?.();
  };

  const openStartingWeightEditor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeightDraft(startingWeight);
    setIsKeypadMounted(true);
    setIsEditingStartingWeight(true);
  };

  const closeStartingWeightEditor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditingStartingWeight(false);
  };

  const addWeightKey = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeightDraft((value) => {
      if (key === '.' && value.includes('.')) return value;
      if (value.length >= 7) return value;
      if (key === '.' && !value) return '0.';
      return `${value}${key}`;
    });
  };

  const deleteWeightKey = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeightDraft((value) => value.slice(0, -1));
  };

  const confirmStartingWeight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartingWeight(weightDraft);
    setIsEditingStartingWeight(false);
  };

  useEffect(() => {
    if (isEditingStartingWeight) {
      keypadProgress.value = withTiming(1, {
        duration: KEYPAD_REVEAL_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    keypadProgress.value = withTiming(0, {
      duration: KEYPAD_REVEAL_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
    }, (finished) => {
      if (finished) runOnJS(setIsKeypadMounted)(false);
    });
  }, [isEditingStartingWeight, keypadProgress]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const parsedWeight = Number(startingWeight);
    onSave({
      sets: parsedSets,
      minReps: parsedMin,
      maxReps: parsedMax,
      ...(editorMode && { startingWeight: startingWeight.trim() && Number.isFinite(parsedWeight) ? Math.max(0, parsedWeight) : null }),
    });
    onClose();
  };

  const handleDismiss = () => {
    if (showTourExplanation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const panGesture = Gesture.Pan()
    .enabled(!showTourExplanation)
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (showTourExplanation) {
        translateY.value = withTiming(0, { duration: 200 });
        return;
      }
      const shouldClose = event.translationY > 120 || event.velocityY > 1200;
      if (shouldClose) {
        runOnJS(handleDismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const keypadRevealStyle = useAnimatedStyle(() => ({
    height: keypadProgress.value * keypadHeight.value,
    marginTop: interpolate(keypadProgress.value, [0, 1], [0, Spacing.sm]),
  }));

  const keypadContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(keypadProgress.value, [0, 1], [-24, 0]) }],
  }));

  return (
    <Modal
      transparent
      visible={isModalMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} disabled={showTourExplanation} />
        {isSheetVisible && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
            exiting={SlideOutDown.duration(SHEET_EXIT_DURATION_MS).easing(Easing.inOut(Easing.cubic))}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setSheetRect({ x, y, width, height });
            }}
            style={[styles.sheet, themedStyles.sheet, containerAnimatedStyle]}
          >
            <StainlessSteelPattern />
            <View style={styles.handleContainer}>
              <View style={[styles.handle, themedStyles.handle]} />
            </View>

            <View
              style={styles.content}
              pointerEvents={showTourExplanation ? 'none' : 'auto'}
              accessibilityElementsHidden={showTourExplanation}
              importantForAccessibility={showTourExplanation ? 'no-hide-descendants' : 'auto'}
            >
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={[styles.title, themedStyles.title]}>Exercise Target</Text>
                  <Text style={[styles.subtitle, themedStyles.subtitle]} numberOfLines={2}>
                    {formatExerciseTitle(exercise.exerciseName)}
                  </Text>
                </View>
                {!showTourExplanation && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close exercise target"
                    onPress={handleDismiss}
                    style={({ pressed }) => [
                      styles.closeButton,
                      themedStyles.iconButton,
                      pressed && themedStyles.buttonPressed,
                    ]}
                  >
                    <XMarkIcon size={18} color={colors.textSecondary} strokeWidth={2.2} />
                  </Pressable>
                )}
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, themedStyles.label]}>Sets</Text>
                <View style={[styles.setControl, themedStyles.control]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease sets"
                    onPress={() => adjustSets(-1)}
                    style={({ pressed }) => [
                      styles.stepButton,
                      themedStyles.iconButton,
                      pressed && themedStyles.buttonPressed,
                    ]}
                  >
                    <MinusIcon size={18} color={colors.textPrimary} strokeWidth={2.2} />
                  </Pressable>
                  <Text style={[styles.setValue, themedStyles.value]}>{parsedSets}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase sets"
                    onPress={() => adjustSets(1)}
                    style={({ pressed }) => [
                      styles.stepButton,
                      themedStyles.iconButton,
                      pressed && themedStyles.buttonPressed,
                    ]}
                  >
                    <PlusIcon size={18} color={colors.textPrimary} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </View>

              {editorMode && (
                <View style={styles.section}>
                  <Text style={[styles.label, themedStyles.label]}>Starting Weight</Text>
                  <View style={[styles.weightControl, themedStyles.control]}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Starting weight"
                      accessibilityHint="Opens the weight keypad"
                      onPress={openStartingWeightEditor}
                      style={styles.weightValueButton}
                    >
                      <Text style={[styles.weightInput, themedStyles.value, !startingWeight && { color: colors.textTertiary }]}>
                        {startingWeight || '0'}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Switch weight unit from ${weightUnit}`}
                      onPress={handleWeightUnitToggle}
                      style={({ pressed }) => [
                        styles.unitToggle,
                        themedStyles.iconButton,
                        pressed && themedStyles.buttonPressed,
                      ]}
                    >
                      <Text style={[styles.unitToggleText, themedStyles.value]}>{weightUnit}</Text>
                    </Pressable>
                  </View>
                  {isKeypadMounted && (
                    <Animated.View
                      style={[styles.keypadReveal, keypadRevealStyle]}
                    >
                      <Animated.View style={keypadContentStyle}>
                        <View
                          onLayout={(event) => {
                            const height = event.nativeEvent.layout.height;
                            if (height > 0) keypadHeight.value = height;
                          }}
                          style={[styles.weightKeypad, themedStyles.control]}
                        >
                      <Text style={[styles.weightDraft, themedStyles.value]}>{weightDraft || '0'}</Text>
                      <View style={styles.keypadGrid}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
                          <Pressable
                            key={key}
                            accessibilityRole="button"
                            accessibilityLabel={`Enter ${key === '.' ? 'decimal' : key}`}
                            onPress={() => addWeightKey(key)}
                            style={({ pressed }) => [styles.keypadKey, themedStyles.iconButton, pressed && themedStyles.buttonPressed]}
                          >
                            <Text style={[styles.keypadKeyText, themedStyles.value]}>{key}</Text>
                          </Pressable>
                        ))}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Delete weight digit"
                          onPress={deleteWeightKey}
                          style={({ pressed }) => [styles.keypadKey, themedStyles.iconButton, pressed && themedStyles.buttonPressed]}
                        >
                          <Text style={[styles.keypadKeyText, themedStyles.value]}>⌫</Text>
                        </Pressable>
                      </View>
                      <View style={styles.keypadActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={closeStartingWeightEditor}
                          style={[styles.keypadAction, { borderColor: colors.accentBorder }]}
                        >
                          <Text style={[styles.keypadActionText, { color: colors.accent }]}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={confirmStartingWeight}
                          style={({ pressed }) => [styles.keypadAction, styles.keypadDone, pressed && styles.saveButtonPressed]}
                        >
                          <LinearGradient
                            colors={themedStyles.saveButtonGradient as any}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <Text style={[styles.keypadActionText, { color: colors.accentForegroundOnFill }]}>Done</Text>
                        </Pressable>
                      </View>
                        </View>
                      </Animated.View>
                    </Animated.View>
                  )}
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.label, themedStyles.label]}>Rep Range</Text>
                <View style={styles.repRangeRow}>
                  <RepValueControl
                    value={parsedMin}
                    label="Minimum reps"
                    onDecrease={() => adjustRep('min', -1)}
                    onIncrease={() => adjustRep('min', 1)}
                    themedStyles={themedStyles}
                    colors={colors}
                  />
                  <Text style={[styles.rangeDash, themedStyles.label]}>to</Text>
                  <RepValueControl
                    value={parsedMax}
                    label="Maximum reps"
                    onDecrease={() => adjustRep('max', -1)}
                    onIncrease={() => adjustRep('max', 1)}
                    themedStyles={themedStyles}
                    colors={colors}
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save exercise target"
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  themedStyles.saveButtonShadow,
                  pressed && styles.saveButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={themedStyles.saveButtonGradient as any}
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
                <Text style={[styles.saveText, { color: colors.accentForegroundOnFill }]}>Save Target</Text>
              </Pressable>
            </View>
          </Animated.View>
        </GestureDetector>
        )}
        <TourOverlay
          visible={showTourExplanation && Boolean(sheetRect)}
          mode="spotlight"
          anchorRect={sheetRect}
          body="You can use this control to also make and edit your workouts faster."
          primaryAction={onTourExplanationNext ? {
            label: 'Continue',
            onPress: onTourExplanationNext,
            disabled: false,
          } : null}
          showArrow={false}
          placement="above"
          holePadding={0}
          allowAnchorInteraction={false}
        />
      </View>
    </Modal>
  );
}

function RepValueControl({
  value,
  label,
  onDecrease,
  onIncrease,
  themedStyles,
  colors,
}: {
  value: number;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  themedStyles: any;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.repControl, themedStyles.control]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={onDecrease}
        style={({ pressed }) => [
          styles.repStepButton,
          pressed && themedStyles.buttonPressed,
        ]}
      >
        <MinusIcon size={15} color={colors.textSecondary} strokeWidth={2.2} />
      </Pressable>
      <Text
        accessibilityLabel={`${label}: ${value}`}
        style={[styles.repValue, themedStyles.value]}
      >
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={onIncrease}
        style={({ pressed }) => [
          styles.repStepButton,
          pressed && themedStyles.buttonPressed,
        ]}
      >
        <PlusIcon size={15} color={colors.textSecondary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '600',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  setControl: {
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  stepButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes['2xl'],
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
  },
  repRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  repControl: {
    flex: 1,
    minWidth: 0,
    height: 58,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  repStepButton: {
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.xl,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
  },
  rangeDash: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '700',
  },
  weightControl: {
    height: 58,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
  },
  weightInput: {
    fontSize: FontSizes.xl,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textAlign: 'center',
  },
  weightValueButton: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  unitToggle: {
    minWidth: 62,
    height: 40,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  unitToggleText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  weightKeypad: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  keypadReveal: {
    overflow: 'hidden',
  },
  weightDraft: {
    textAlign: 'center',
    fontSize: FontSizes.xl,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  keypadKey: {
    width: '31.8%',
    height: 38,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
  },
  keypadActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  keypadAction: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  keypadDone: {
    borderWidth: 0,
  },
  keypadActionText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
    zIndex: 1,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
    zIndex: 10,
  },
  pressed: {
    opacity: 0.72,
  },
});
