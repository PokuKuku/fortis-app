/**
 * AccentColorPicker
 *
 * Modal component for selecting the app's accent color.
 * Displays a grid of color swatches with the current selection highlighted.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CheckIcon, MoonIcon, SunIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseModal } from './BaseModal';
import {
  useTheme,
  type AccentColorName,
  ACCENT_COLOR_LABELS,
} from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { getAccentPalette } from '@/src/utils/accentColors';

interface AccentColorPickerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSelectColor?: (colorName: AccentColorName) => void;
  closeOnSelect?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  confirmButtonLabel?: string;
  onConfirm?: () => void;
  showThemeToggle?: boolean;
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

export function AccentColorPicker({
  visible,
  onClose,
  title = 'Accent Color',
  description = 'Choose your preferred accent color for buttons and highlights.',
  onSelectColor,
  closeOnSelect = true,
  showCloseButton = true,
  closeOnBackdropPress = true,
  confirmButtonLabel,
  onConfirm,
  showThemeToggle = false,
}: AccentColorPickerProps) {
  const { colors, isDark, accentColor, setAccentColor, setMode } = useTheme();
  const [displayIsDark, setDisplayIsDark] = useState(isDark);

  useEffect(() => {
    setDisplayIsDark(isDark);
  }, [isDark]);

  const handleSelectColor = async (colorName: AccentColorName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setAccentColor(colorName);
    onSelectColor?.(colorName);
    if (closeOnSelect) {
      onClose();
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
      width={300}
      showCloseButton={showCloseButton}
      closeOnBackdropPress={closeOnBackdropPress}
      titleStyle={showThemeToggle ? styles.tourTitle : undefined}
    >
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {showThemeToggle && (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Toggle light and dark appearance"
          accessibilityState={{ checked: displayIsDark }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const nextIsDark = !displayIsDark;
            // Apply the palette in the same interaction as the toggle. Theme
            // persistence remains asynchronous inside the theme context.
            setDisplayIsDark(nextIsDark);
            void setMode(nextIsDark ? 'dark' : 'light');
          }}
          style={({ pressed }) => [
            styles.themeToggle,
            {
              backgroundColor: displayIsDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              borderColor: displayIsDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
            },
            pressed && styles.themeTogglePressed,
          ]}
        >
          <View style={styles.themeOption}>
            <SunIcon size={16} color={!displayIsDark ? colors.accent : colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.themeOptionText, { color: !displayIsDark ? colors.textPrimary : colors.textSecondary }]}>Light</Text>
          </View>
          <View style={[styles.themeTrack, { backgroundColor: colors.accent }]}>
            <View style={[styles.themeThumb, displayIsDark ? styles.themeThumbDark : styles.themeThumbLight]} />
          </View>
          <View style={styles.themeOption}>
            <MoonIcon size={16} color={displayIsDark ? colors.accent : colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.themeOptionText, { color: displayIsDark ? colors.textPrimary : colors.textSecondary }]}>Dark</Text>
          </View>
        </Pressable>
      )}

      <View style={styles.grid}>
        {COLOR_ORDER.map((colorName) => {
          const palette = getAccentPalette(colorName, isDark);
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

      {confirmButtonLabel && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onConfirm?.();
          }}
          style={({ pressed }) => [
            styles.confirmButton,
            { borderBottomColor: colors.accentShadow },
            pressed && styles.confirmButtonPressed,
          ]}
        >
          <LinearGradient
            colors={colors.accentGradient as any}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={[styles.confirmButtonText, { color: colors.accentForegroundOnFill }]}>{confirmButtonLabel}</Text>
        </Pressable>
      )}
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
  tourTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  themeToggle: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeTogglePressed: {
    opacity: 0.8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  themeOptionText: {
    fontSize: 13,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '600',
  },
  themeTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 3,
  },
  themeThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  themeThumbLight: {
    alignSelf: 'flex-start',
  },
  themeThumbDark: {
    alignSelf: 'flex-end',
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
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: {
    fontWeight: '700',
  },
  confirmButton: {
    marginTop: Spacing.lg,
    minHeight: 48,
    borderRadius: BorderRadius.xl,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  confirmButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    zIndex: 1,
  },
});
