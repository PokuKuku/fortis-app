import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';

interface OnboardingOptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export function OnboardingOptionCard({
  title,
  description,
  selected,
  onSelect,
}: OnboardingOptionCardProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  const cardStyle = {
    borderColor: selected ? colors.accent : colors.glassBorder,
    backgroundColor: colors.surfaceElevated,
  };

  const radioStyle = {
    borderColor: selected ? colors.accent : colors.textTertiary,
    backgroundColor: selected ? colors.accent : 'transparent',
  };

  return (
    <GlassCard onPress={handlePress} padding={Spacing.lg} style={[styles.card, cardStyle]}>
      <View style={styles.row}>
        <View style={styles.textStack}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
        <View style={[styles.radio, radioStyle]} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  textStack: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  description: {
    ...Typography.bodySmall,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
});
