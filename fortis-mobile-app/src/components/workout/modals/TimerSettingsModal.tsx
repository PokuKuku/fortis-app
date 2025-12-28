import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { XMarkIcon, ChevronDownIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { SetType } from '@/src/types/workout';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface TimerSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (normal: number, warmup: number, drop: number) => void;
  initialNormalDuration: number;
  initialWarmupDuration: number;
  initialDropDuration: number;
}

const ITEM_HEIGHT = 56;
const MINUTES = Array.from({ length: 11 }, (_, i) => i); // 0-10
const SECONDS = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, ..., 55

export function TimerSettingsModal({
  visible,
  onClose,
  onSave,
  initialNormalDuration,
  initialWarmupDuration,
  initialDropDuration,
}: TimerSettingsModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: colors.background,
      borderColor: isDark ? Colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    title: { color: colors.textPrimary },
    closeButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    pickerValue: { color: colors.textTertiary },
    pickerValueSelected: { color: colors.textPrimary },
    pickerUnit: { color: colors.textTertiary },
    pickerUnitSelected: { color: colors.textSecondary },
    selectionSlot: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.06)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    selectionLabel: { color: colors.textTertiary },
    typeSelectorPopover: {
      backgroundColor: colors.background,
      borderColor: isDark ? Colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    typeSelectorText: { color: colors.textPrimary },
    fadeGradient: isDark ? ['#1a1a1a', 'transparent'] : [colors.background, 'transparent'],
    // Accent-based colors for normal type
    normalTypeColor: colors.accent,
    selectionValue: { color: colors.accent },
    saveButtonGradient: colors.accentGradient as unknown as string[],
    saveButtonShadow: { shadowColor: colors.accentShadow },
  };

  const [activeType, setActiveType] = useState<SetType>('normal');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Animation values for popover
  const popoverScale = useSharedValue(0);
  const popoverOpacity = useSharedValue(0);

  const popoverAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popoverOpacity.value,
    transform: [{ scale: 0.95 + popoverScale.value * 0.05 }],
  }));

  // Store durations for all types
  const [durations, setDurations] = useState({
    normal: initialNormalDuration,
    warmup: initialWarmupDuration,
    dropset: initialDropDuration,
  });

  const getParts = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const roundedS = Math.round(s / 5) * 5;
    return {
      m: Math.min(m, 10),
      s: roundedS >= 60 ? 0 : roundedS,
    };
  };

  const initialParts = getParts(durations[activeType]);
  const [selectedMinutes, setSelectedMinutes] = useState(initialParts.m);
  const [selectedSeconds, setSelectedSeconds] = useState(initialParts.s);

  const minScrollRef = useRef<ScrollView>(null);
  const secScrollRef = useRef<ScrollView>(null);

  // Update picker when activeType changes
  useEffect(() => {
    const { m, s } = getParts(durations[activeType]);
    setSelectedMinutes(m);
    setSelectedSeconds(s);

    setTimeout(() => {
      minScrollRef.current?.scrollTo({ y: m * ITEM_HEIGHT, animated: false });
      secScrollRef.current?.scrollTo({ y: (s / 5) * ITEM_HEIGHT, animated: false });
    }, 0);
  }, [activeType, durations]);

  // Animate popover
  useEffect(() => {
    if (showTypeSelector) {
      popoverScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      popoverOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    } else {
      popoverScale.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) });
      popoverOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) });
    }
  }, [showTypeSelector]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setShowTypeSelector(false);
    }
  }, [visible]);

  const handleTypeChange = (newType: SetType) => {
    if (newType === activeType) return;

    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    setDurations((prev) => ({ ...prev, [activeType]: currentTotal }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveType(newType);
    setShowTypeSelector(false);
  };

  const handleSaveAndClose = () => {
    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    const finalDurations = { ...durations, [activeType]: currentTotal };
    setDurations(finalDurations);

    onSave(finalDurations.normal, finalDurations.warmup, finalDurations.dropset);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleMinutesScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(MINUTES.length - 1, index));
    const newValue = MINUTES[clampedIndex];

    if (newValue !== selectedMinutes) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedMinutes(newValue);
    }
  };

  const handleSecondsScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(SECONDS.length - 1, index));
    const newValue = SECONDS[clampedIndex];

    if (newValue !== selectedSeconds) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedSeconds(newValue);
    }
  };

  const getTypeLabel = () => {
    switch (activeType) {
      case 'warmup': return 'WARM UP';
      case 'dropset': return 'DROP SET';
      default: return 'NORMAL';
    }
  };

  const getTypeColor = () => {
    switch (activeType) {
      case 'warmup': return '#eab308';
      case 'dropset': return '#3b82f6';
      default: return themedStyles.normalTypeColor;
    }
  };

  const isDisabled = selectedMinutes === 0 && selectedSeconds === 0;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.centeredView} pointerEvents="box-none">
          <Animated.View
            entering={ZoomIn.duration(250).easing(Easing.out(Easing.cubic))}
            exiting={ZoomOut.duration(200).easing(Easing.in(Easing.cubic))}
            style={[styles.container, themedStyles.container]}
          >
            <StainlessSteelPattern />

            {/* Header - Type Selector, Title, Close Button on same line */}
            <View style={styles.header}>
              {/* Type Selector - Left side container */}
              <View style={styles.headerSide}>
                <Pressable
                  onPress={() => setShowTypeSelector(true)}
                  style={[styles.typeButton, { borderColor: getTypeColor() }]}
                >
                  <View style={[styles.typeDot, { backgroundColor: getTypeColor() }]} />
                  <Text style={[styles.typeButtonText, { color: getTypeColor() }]}>
                    {getTypeLabel()}
                  </Text>
                  <ChevronDownIcon size={10} color={getTypeColor()} strokeWidth={2.5} />
                </Pressable>
              </View>

              {/* Title - Centered */}
              <Text style={[styles.title, themedStyles.title]}>REST TIMER</Text>

              {/* Close Button - Right side container */}
              <View style={[styles.headerSide, styles.headerSideRight]}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    themedStyles.closeButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <XMarkIcon size={18} color={colors.textSecondary} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            {/* Picker Container */}
            <View style={styles.pickerContainer}>
              {/* Selection Slot - Recessed industrial look */}
              <View style={[styles.selectionSlot, themedStyles.selectionSlot]}>
                <View style={styles.selectionSlotInner} />
              </View>

              {/* Fade overlays */}
              <LinearGradient
                colors={themedStyles.fadeGradient as [string, string]}
                style={[styles.fadeOverlay, styles.fadeTop]}
                pointerEvents="none"
              />
              <LinearGradient
                colors={[...themedStyles.fadeGradient].reverse() as [string, string]}
                style={[styles.fadeOverlay, styles.fadeBottom]}
                pointerEvents="none"
              />

              <View style={styles.pickersRow}>
                {/* Minutes Picker */}
                <View style={styles.pickerColumn}>
                  <ScrollView
                    ref={minScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    bounces={false}
                    onScrollEndDrag={handleMinutesScrollEnd}
                    onMomentumScrollEnd={handleMinutesScrollEnd}
                    style={styles.picker}
                    contentContainerStyle={styles.pickerContent}
                  >
                    <View style={styles.pickerSpacer} />
                    {MINUTES.map((m) => (
                      <View key={m} style={styles.pickerItem}>
                        <Text style={[
                          styles.pickerValue,
                          themedStyles.pickerValue,
                          m === selectedMinutes && [styles.pickerValueSelected, themedStyles.pickerValueSelected],
                        ]}>
                          {m}
                        </Text>
                        <Text style={[
                          styles.pickerUnit,
                          themedStyles.pickerUnit,
                          m === selectedMinutes && [styles.pickerUnitSelected, themedStyles.pickerUnitSelected],
                        ]}>
                          m
                        </Text>
                      </View>
                    ))}
                    <View style={styles.pickerSpacer} />
                  </ScrollView>
                </View>

                {/* Groove Divider */}
                <View style={styles.grooveDivider}>
                  <View style={styles.grooveLight} />
                  <View style={styles.grooveDark} />
                </View>

                {/* Seconds Picker */}
                <View style={styles.pickerColumn}>
                  <ScrollView
                    ref={secScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    bounces={false}
                    onScrollEndDrag={handleSecondsScrollEnd}
                    onMomentumScrollEnd={handleSecondsScrollEnd}
                    style={styles.picker}
                    contentContainerStyle={styles.pickerContent}
                  >
                    <View style={styles.pickerSpacer} />
                    {SECONDS.map((s) => (
                      <View key={s} style={styles.pickerItem}>
                        <Text style={[
                          styles.pickerValue,
                          themedStyles.pickerValue,
                          s === selectedSeconds && [styles.pickerValueSelected, themedStyles.pickerValueSelected],
                        ]}>
                          {s.toString().padStart(2, '0')}
                        </Text>
                        <Text style={[
                          styles.pickerUnit,
                          themedStyles.pickerUnit,
                          s === selectedSeconds && [styles.pickerUnitSelected, themedStyles.pickerUnitSelected],
                        ]}>
                          s
                        </Text>
                      </View>
                    ))}
                    <View style={styles.pickerSpacer} />
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Current Selection Display */}
            <View style={styles.selectionDisplay}>
              <Text style={[styles.selectionLabel, themedStyles.selectionLabel]}>SET TO</Text>
              <Text style={[styles.selectionValue, themedStyles.selectionValue, isDisabled && styles.selectionValueDisabled]}>
                {isDisabled ? 'DISABLED' : `${selectedMinutes}:${selectedSeconds.toString().padStart(2, '0')}`}
              </Text>
            </View>

            {/* Action Button */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleSaveAndClose}
                style={({ pressed }) => [
                  styles.saveButton,
                  !isDisabled && themedStyles.saveButtonShadow,
                  isDisabled && styles.saveButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={isDisabled ? ['#ef4444', '#dc2626'] : themedStyles.saveButtonGradient}
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
                <Text style={styles.saveButtonText}>
                  {isDisabled ? 'DISABLE TIMER' : 'SAVE & CLOSE'}
                </Text>
              </Pressable>
            </View>

            {/* Type Selector Popover */}
            {showTypeSelector && (
              <>
                <Pressable
                  style={styles.typeSelectorOverlay}
                  onPress={() => setShowTypeSelector(false)}
                  activeOpacity={1}
                />
                <Animated.View style={[styles.typeSelectorPopover, themedStyles.typeSelectorPopover, popoverAnimatedStyle]}>
                  <StainlessSteelPattern />
                  {(['normal', 'warmup', 'dropset'] as SetType[]).map((type, index) => (
                    <View key={type}>
                      {index > 0 && <View style={styles.typeSelectorDivider} />}
                      <Pressable
                        onPress={() => handleTypeChange(type)}
                        style={({ pressed }) => [
                          styles.typeSelectorOption,
                          activeType === type && styles.typeSelectorOptionActive,
                          pressed && styles.buttonPressed,
                        ]}
                      >
                        <View style={[
                          styles.typeSelectorDot,
                          {
                            backgroundColor: type === 'warmup' ? '#eab308' :
                              type === 'dropset' ? '#3b82f6' : themedStyles.normalTypeColor
                          }
                        ]} />
                        <Text style={[styles.typeSelectorText, themedStyles.typeSelectorText]}>
                          {type === 'warmup' ? 'WARM UP' : type === 'dropset' ? 'DROP SET' : 'NORMAL'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </Animated.View>
              </>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  container: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerSide: {
    width: 80,
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  typeButtonText: {
    fontSize: 9,
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.2,
  },

  // Picker
  pickerContainer: {
    position: 'relative',
    marginHorizontal: Spacing.xl,
  },
  selectionSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    zIndex: 5,
    pointerEvents: 'none',
  },
  selectionSlotInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerColumn: {
    width: 100,
    alignItems: 'center',
  },
  picker: {
    height: 224,
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerSpacer: {
    height: 84,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 32,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  pickerValueSelected: {
    fontSize: 40,
    color: Colors.textPrimary,
  },
  pickerUnit: {
    fontSize: 14,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textTertiary,
    marginLeft: 4,
    marginTop: 12,
  },
  pickerUnitSelected: {
    color: Colors.textSecondary,
    marginTop: 16,
  },

  // Groove Divider
  grooveDivider: {
    width: 2,
    height: 120,
    marginHorizontal: Spacing.md,
  },
  grooveLight: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    left: 0,
  },
  grooveDark: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    right: 0,
  },

  // Selection Display
  selectionDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectionLabel: {
    fontSize: FontSizes.xs,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  selectionValue: {
    fontSize: 28,
    fontFamily: 'BankGothicBT-Medium',
    // color now applied via themedStyles.selectionValue
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  selectionValueDisabled: {
    color: Colors.error,
    fontSize: 20,
  },

  // Actions
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  saveButton: {
    height: 52,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // shadowColor now applied via themedStyles.saveButtonShadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    shadowColor: Colors.error,
  },
  saveButtonText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.white,
    letterSpacing: 1.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Type Selector Popover
  typeSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  typeSelectorPopover: {
    position: 'absolute',
    top: 100,
    left: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    padding: Spacing.xs,
    minWidth: 160,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  typeSelectorDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: Spacing.sm,
  },
  typeSelectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  typeSelectorOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeSelectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeSelectorText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});
