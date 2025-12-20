import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import {
  RpeValue,
  RPE_VALUES,
  RPE_COLORS,
  RPE_DESCRIPTIONS,
} from '@/src/types/workout';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface RPESelectorOverlayProps {
  visible: boolean;
  currentRpe: RpeValue;
  onOpenHelp: () => void;
}

export function RPESelectorOverlay({
  visible,
  currentRpe,
  onOpenHelp,
}: RPESelectorOverlayProps) {
  const selectRpe = useWorkoutStore((s) => s.selectRpe);
  const closeRpeSelector = useWorkoutStore((s) => s.closeRpeSelector);

  // Track which value is being hovered/pressed for description
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Determine which description to show
  const displayValue = hoveredValue ?? currentRpe;
  const description = displayValue !== null
    ? RPE_DESCRIPTIONS[displayValue]
    : 'Select an RPE value';

  const handleSelect = (rpe: RpeValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectRpe(rpe);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeRpeSelector();
  };

  const handleHelpPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenHelp();
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      {/* Header row */}
      <View style={styles.header}>
        <Pressable
          onPress={handleHelpPress}
          style={({ pressed }) => [
            styles.whatsRpeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.whatsRpeText}>What's RPE?</Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <XMarkIcon size={20} color={Colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Description text */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      {/* RPE value buttons */}
      <View style={styles.valuesRow}>
        {RPE_VALUES.map((value) => {
          const isSelected = currentRpe === value;
          const color = RPE_COLORS[value];

          return (
            <Pressable
              key={value}
              onPress={() => handleSelect(value)}
              onPressIn={() => setHoveredValue(value)}
              onPressOut={() => setHoveredValue(null)}
              style={({ pressed }) => [
                styles.valueButton,
                isSelected && styles.valueButtonSelected,
                pressed && styles.valueButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.valueText,
                  isSelected && styles.valueTextSelected,
                  { color: isSelected ? Colors.background : color },
                ]}
              >
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  whatsRpeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  whatsRpeText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  valueButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueButtonSelected: {
    backgroundColor: Colors.textPrimary,
  },
  valueButtonPressed: {
    opacity: 0.8,
  },
  valueText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
  },
  valueTextSelected: {
    color: Colors.background,
  },
});
