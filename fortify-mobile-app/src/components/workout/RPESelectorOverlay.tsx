import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
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

const OVERLAY_SCALE = 1.15;
const CONTAINER_PADDING_X = Math.round(Spacing.lg * OVERLAY_SCALE);
const CONTAINER_PADDING_TOP = Math.round(Spacing.md * OVERLAY_SCALE);
const CONTAINER_PADDING_BOTTOM = Math.round(Spacing.lg * OVERLAY_SCALE);
const HEADER_MARGIN_BOTTOM = Math.round(Spacing.md * OVERLAY_SCALE);
const DESCRIPTION_MARGIN_BOTTOM = Math.round(Spacing.lg * OVERLAY_SCALE);
const VALUES_GAP = Math.round(Spacing.xs * OVERLAY_SCALE);
const HEADER_BUTTON_PADDING_X = Math.round(Spacing.lg * OVERLAY_SCALE);
const HEADER_BUTTON_PADDING_Y = Math.round(Spacing.sm * OVERLAY_SCALE);
const HEADER_BUTTON_SIZE = Math.round(36 * OVERLAY_SCALE);
const VALUE_BUTTON_HEIGHT = Math.round(44 * OVERLAY_SCALE);
const DESCRIPTION_MIN_HEIGHT = Math.round(44 * OVERLAY_SCALE);
const DESCRIPTION_LINE_HEIGHT = Math.round(20 * OVERLAY_SCALE);
const HEADER_ICON_SIZE = Math.round(20 * OVERLAY_SCALE);
const HEADER_TEXT_SIZE = Math.round(FontSizes.base * OVERLAY_SCALE);
const DESCRIPTION_TEXT_SIZE = Math.round(FontSizes.sm * OVERLAY_SCALE);
const VALUE_TEXT_SIZE = Math.round(FontSizes.sm * OVERLAY_SCALE);
const BUTTON_RADIUS = Math.round(BorderRadius.md * OVERLAY_SCALE);

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
  const { colors, isDark } = useTheme();
  const selectRpe = useWorkoutStore((s) => s.selectRpe);
  const closeRpeSelector = useWorkoutStore((s) => s.closeRpeSelector);

  // Track which value is being hovered/pressed for description
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.92)' : 'rgba(255, 255, 255, 0.96)',
    },
    whatsRpeButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    whatsRpeText: { color: colors.textSecondary },
    closeButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    descriptionText: { color: colors.textSecondary },
    valueButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    valueButtonSelected: {
      backgroundColor: colors.textPrimary,
    },
  };

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
      style={[styles.container, themedStyles.container]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <Pressable
          onPress={handleHelpPress}
          style={({ pressed }) => [
            styles.whatsRpeButton,
            themedStyles.whatsRpeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.whatsRpeText, themedStyles.whatsRpeText]}>What's RPE?</Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            themedStyles.closeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <XMarkIcon size={HEADER_ICON_SIZE} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Description text */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionText, themedStyles.descriptionText]}>{description}</Text>
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
                themedStyles.valueButton,
                isSelected && [styles.valueButtonSelected, themedStyles.valueButtonSelected],
                pressed && styles.valueButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.valueText,
                  isSelected && styles.valueTextSelected,
                  { color: isSelected ? colors.background : color },
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
    paddingHorizontal: CONTAINER_PADDING_X,
    paddingTop: CONTAINER_PADDING_TOP,
    paddingBottom: CONTAINER_PADDING_BOTTOM,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  whatsRpeButton: {
    paddingHorizontal: HEADER_BUTTON_PADDING_X,
    paddingVertical: HEADER_BUTTON_PADDING_Y,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  whatsRpeText: {
    fontSize: HEADER_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
  },
  closeButton: {
    width: HEADER_BUTTON_SIZE,
    height: HEADER_BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
    minHeight: DESCRIPTION_MIN_HEIGHT,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: DESCRIPTION_TEXT_SIZE,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: DESCRIPTION_LINE_HEIGHT,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: VALUES_GAP,
  },
  valueButton: {
    flex: 1,
    height: VALUE_BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
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
    fontSize: VALUE_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
  },
  valueTextSelected: {
    color: Colors.background,
  },
});
