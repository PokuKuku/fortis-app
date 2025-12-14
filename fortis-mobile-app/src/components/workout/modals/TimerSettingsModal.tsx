import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { SetType } from '@/src/types/workout';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
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

const ITEM_HEIGHT = 60;
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
  const [activeType, setActiveType] = useState<SetType>('normal');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Animation values for popover
  const popoverScale = useSharedValue(0);
  const popoverOpacity = useSharedValue(0);

  const popoverAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popoverOpacity.value,
    transform: [{ scale: 0.95 + popoverScale.value * 0.05 }], // Scale from 0.95 to 1
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

    // Scroll to position
    setTimeout(() => {
      minScrollRef.current?.scrollTo({ y: m * ITEM_HEIGHT, animated: false });
      secScrollRef.current?.scrollTo({ y: (s / 5) * ITEM_HEIGHT, animated: false });
    }, 0);
  }, [activeType, durations]);

  // Animate popover
  useEffect(() => {
    if (showTypeSelector) {
      popoverScale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
      popoverOpacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      popoverScale.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.cubic),
      });
      popoverOpacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [showTypeSelector]);

  const handleTypeChange = (newType: SetType) => {
    if (newType === activeType) return;

    // Save current picker value to current type
    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    setDurations((prev) => ({ ...prev, [activeType]: currentTotal }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveType(newType);
    setShowTypeSelector(false);
  };

  const handleSave = () => {
    // Save current picker value
    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    const finalDurations = { ...durations, [activeType]: currentTotal };
    setDurations(finalDurations);

    onSave(finalDurations.normal, finalDurations.warmup, finalDurations.dropset);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleSaveAndClose = () => {
    handleSave();
    setTimeout(onClose, 300);
  };

  const handleMinutesScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(MINUTES.length - 1, index));
    const newValue = MINUTES[clampedIndex];

    if (newValue !== selectedMinutes) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedMinutes(newValue);
    }
  };

  const handleSecondsScroll = (event: any) => {
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
      case 'warmup': return 'Warm Up';
      case 'dropset': return 'Drop Set';
      default: return 'Normal';
    }
  };

  const getTypeColor = () => {
    switch (activeType) {
      case 'warmup': return '#eab308';
      case 'dropset': return '#3b82f6';
      default: return Colors.success;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.centeredView} pointerEvents="box-none">
          <View style={styles.container}>
            <StainlessSteelPattern />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pressable
                  onPress={() => setShowTypeSelector(true)}
                  style={[styles.typeButton, { backgroundColor: `${getTypeColor()}33` }]}
                >
                  <Text style={[styles.typeButtonText, { color: getTypeColor() }]}>
                    {getTypeLabel()}
                  </Text>
                  <ChevronDown size={12} color={getTypeColor()} strokeWidth={3} />
                </Pressable>
              </View>

              <View style={styles.headerCenter}>
                <Text style={styles.title}>Rest Timer</Text>
              </View>

              <View style={styles.headerRight}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <X size={20} color={Colors.error} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            {/* Picker Container */}
            <View style={styles.pickerContainer}>
              {/* Selection Indicator */}
              <View style={styles.selectionIndicator} />

              {/* Gradients */}
              <View style={[styles.gradient, styles.gradientTop]} />
              <View style={[styles.gradient, styles.gradientBottom]} />

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
                    onScroll={handleMinutesScroll}
                    onScrollEndDrag={handleMinutesScroll}
                    onMomentumScrollEnd={handleMinutesScroll}
                    style={styles.picker}
                    contentContainerStyle={styles.pickerContent}
                  >
                    <View style={styles.pickerSpacer} />
                    {MINUTES.map((m) => (
                      <View key={m} style={styles.pickerItem}>
                        <Text
                          style={[
                            styles.pickerValue,
                            m === selectedMinutes && styles.pickerValueSelected,
                          ]}
                        >
                          {m}
                        </Text>
                        <Text
                          style={[
                            styles.pickerUnit,
                            m === selectedMinutes && styles.pickerUnitSelected,
                          ]}
                        >
                          m
                        </Text>
                      </View>
                    ))}
                    <View style={styles.pickerSpacer} />
                  </ScrollView>
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
                    onScroll={handleSecondsScroll}
                    onScrollEndDrag={handleSecondsScroll}
                    onMomentumScrollEnd={handleSecondsScroll}
                    style={styles.picker}
                    contentContainerStyle={styles.pickerContent}
                  >
                    <View style={styles.pickerSpacer} />
                    {SECONDS.map((s) => (
                      <View key={s} style={styles.pickerItem}>
                        <Text
                          style={[
                            styles.pickerValue,
                            s === selectedSeconds && styles.pickerValueSelected,
                          ]}
                        >
                          {s.toString().padStart(2, '0')}
                        </Text>
                        <Text
                          style={[
                            styles.pickerUnit,
                            s === selectedSeconds && styles.pickerUnitSelected,
                          ]}
                        >
                          s
                        </Text>
                      </View>
                    ))}
                    <View style={styles.pickerSpacer} />
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  isSaved && styles.saveButtonSaved,
                  (selectedMinutes === 0 && selectedSeconds === 0) && styles.saveButtonDisable,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={[
                  styles.saveButtonText,
                  isSaved && styles.saveButtonTextSaved,
                  (selectedMinutes === 0 && selectedSeconds === 0) && styles.saveButtonTextDisable,
                ]}>
                  {isSaved
                    ? 'Saved!'
                    : selectedMinutes === 0 && selectedSeconds === 0
                      ? 'Disable Timer'
                      : `Set ${selectedMinutes}m ${selectedSeconds}s`}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveAndClose}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.confirmButtonText}>Save Changes</Text>
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
                <Animated.View
                  style={[
                    styles.typeSelectorPopover,
                    {
                      top: 58, // Directly below header
                      left: 16, // Match header padding
                    },
                    popoverAnimatedStyle,
                  ]}
                >
                  <Pressable
                    onPress={() => handleTypeChange('normal')}
                    style={styles.typeSelectorOption}
                  >
                    <View style={[styles.typeSelectorDot, { backgroundColor: Colors.success }]} />
                    <Text style={styles.typeSelectorText}>Normal Set</Text>
                  </Pressable>
                  <View style={styles.typeSelectorDivider} />
                  <Pressable
                    onPress={() => handleTypeChange('warmup')}
                    style={styles.typeSelectorOption}
                  >
                    <View style={[styles.typeSelectorDot, { backgroundColor: '#eab308' }]} />
                    <Text style={styles.typeSelectorText}>Warm Up Set</Text>
                  </Pressable>
                  <View style={styles.typeSelectorDivider} />
                  <Pressable
                    onPress={() => handleTypeChange('dropset')}
                    style={styles.typeSelectorOption}
                  >
                    <View style={[styles.typeSelectorDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.typeSelectorText}>Drop Set</Text>
                  </Pressable>
                </Animated.View>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    width: '98%',
    backgroundColor: '#222222',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
  },
  typeButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  pickerContainer: {
    paddingTop: 0,
    paddingBottom: 16,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -30,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: BorderRadius['2xl'],
    zIndex: 10,
    pointerEvents: 'none',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 96,
    zIndex: 20,
    pointerEvents: 'none',
  },
  gradientTop: {
    top: 0,
    backgroundColor: 'linear-gradient(to bottom, #161616, transparent)',
  },
  gradientBottom: {
    bottom: 0,
    backgroundColor: 'linear-gradient(to top, #161616, transparent)',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pickerColumn: {
    width: 150,
    alignItems: 'center',
    position: 'relative',
  },
  picker: {
    height: 240,
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerSpacer: {
    height: 90,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 28,
    color: '#979ca6',
    transform: [{ scale: 0.9 }],
  },
  pickerValueSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
    transform: [{ scale: 1.1 }],
  },
  pickerUnit: {
    fontSize: 12,
    color: '#979ca6',
    marginLeft: 2,
    marginTop: 8,
  },
  pickerUnitSelected: {
    color: Colors.textPrimary,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
    zIndex: 1,
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  saveButtonSaved: {
    backgroundColor: Colors.success,
  },
  saveButtonDisable: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  saveButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.success,
  },
  saveButtonTextSaved: {
    color: Colors.textPrimary,
  },
  saveButtonTextDisable: {
    color: Colors.error,
  },
  confirmButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    backgroundColor: Colors.success,
  },
  confirmButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
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
    backgroundColor: '#1c1c1e',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
  },
  typeSelectorDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 2,
  },
  typeSelectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  typeSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeSelectorText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
