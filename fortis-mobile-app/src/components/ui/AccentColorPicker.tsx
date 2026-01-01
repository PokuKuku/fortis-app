/**
 * AccentColorPicker
 *
 * Modal component for selecting the app's accent color.
 * Displays a grid of color swatches with the current selection highlighted.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { BaseModal } from './BaseModal';
import {
  useTheme,
  type AccentColorName,
  ACCENT_COLORS,
  ACCENT_COLOR_LABELS,
} from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';

interface AccentColorPickerProps {
  visible: boolean;
  onClose: () => void;
}

const COLOR_ORDER: AccentColorName[] = [
  'green',
  'midnight',
  'purple',
  'teal',
  'orange',
  'pink',
  'amber',
  'copper',
  'indigo',
  'red',
  'slate',
  'cyan',
];

export function AccentColorPicker({ visible, onClose }: AccentColorPickerProps) {
  const { colors, isDark, accentColor, setAccentColor } = useTheme();

  const handleSelectColor = async (colorName: AccentColorName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setAccentColor(colorName);
    onClose();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Accent Color"
      width={300}
    >
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Choose your preferred accent color for buttons and highlights.
      </Text>

      <View style={styles.grid}>
        {COLOR_ORDER.map((colorName) => {
          const palette = ACCENT_COLORS[colorName];
          const isSelected = colorName === accentColor;

          return (
            <Pressable
              key={colorName}
              onPress={() => handleSelectColor(colorName)}
              style={({ pressed }) => [
                styles.swatchContainer,
                pressed && styles.swatchPressed,
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: palette.base },
                  isSelected && styles.swatchSelected,
                  isSelected && {
                    borderColor: isDark ? '#ffffff' : '#000000',
                  },
                ]}
              >
                {isSelected && (
                  <CheckIcon
                    size={20}
                    color="#ffffff"
                    strokeWidth={3}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isSelected ? colors.textPrimary : colors.textSecondary },
                  isSelected && styles.labelSelected,
                ]}
              >
                {ACCENT_COLOR_LABELS[colorName]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  swatchContainer: {
    alignItems: 'center',
    width: '22%', // 4 columns with gap
    marginBottom: Spacing.sm,
  },
  swatchPressed: {
    opacity: 0.7,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  swatchSelected: {
    borderWidth: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: {
    fontWeight: '700',
  },
});
