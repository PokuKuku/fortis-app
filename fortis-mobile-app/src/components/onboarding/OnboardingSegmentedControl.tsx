import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { moderateScale, scale } from '@/src/utils/responsive';

interface SegmentOption {
  label: string;
  value: string;
}

interface OnboardingSegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function OnboardingSegmentedControl({
  options,
  value,
  onChange,
}: OnboardingSegmentedControlProps) {
  const { colors } = useTheme();

  const handlePress = (nextValue: string) => {
    Haptics.selectionAsync();
    onChange(nextValue);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.segment,
              index === 0 && styles.segmentLeft,
              index === options.length - 1 && styles.segmentRight,
              isSelected && {
                backgroundColor: colors.accentOverlay,
                borderColor: colors.accentBorderLight,
              },
              pressed && !isSelected && { opacity: 0.85 },
            ]}
            onPress={() => handlePress(option.value)}
          >
            <Text
              style={{
                color: isSelected ? colors.textPrimary : colors.textSecondary,
                fontFamily: 'BankGothicBT-Medium',
                letterSpacing: moderateScale(1),
                fontSize: moderateScale(14),
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(Spacing.sm),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentLeft: {
    borderTopLeftRadius: BorderRadius.full,
    borderBottomLeftRadius: BorderRadius.full,
  },
  segmentRight: {
    borderTopRightRadius: BorderRadius.full,
    borderBottomRightRadius: BorderRadius.full,
  },
});
