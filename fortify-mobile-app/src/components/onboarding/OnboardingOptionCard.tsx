import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { moderateScale, scale } from '@/src/utils/responsive';

interface OnboardingOptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  rank?: number | null;
  onSelect: () => void;
}

export function OnboardingOptionCard({
  title,
  description,
  selected,
  rank,
  onSelect,
}: OnboardingOptionCardProps) {
  const { colors } = useTheme();
  const cardPadding = scale(Spacing.lg);

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

  const showRank = rank !== undefined;
  const rankStyle = {
    borderColor: selected ? colors.accent : colors.textTertiary,
    backgroundColor: selected ? colors.accent : 'transparent',
  };

  return (
    <GlassCard onPress={handlePress} padding={cardPadding} style={[styles.card, cardStyle]}>
      <View style={styles.row}>
        <View style={styles.textStack}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
        {showRank ? (
          <View style={[styles.rank, rankStyle]}>
            {selected ? (
              <Text style={[styles.rankText, { color: colors.white }]}>{rank}</Text>
            ) : null}
          </View>
        ) : (
          <View style={[styles.radio, radioStyle]} />
        )}
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
    gap: scale(Spacing.lg),
  },
  textStack: {
    flex: 1,
    gap: scale(Spacing.xs),
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(18),
    letterSpacing: moderateScale(0.5),
  },
  description: {
    ...Typography.bodySmall,
    fontSize: moderateScale(15),
  },
  radio: {
    width: scale(18),
    height: scale(18),
    borderRadius: BorderRadius.full,
    borderWidth: Math.max(1, scale(2)),
  },
  rank: {
    width: scale(24),
    height: scale(24),
    borderRadius: BorderRadius.full,
    borderWidth: Math.max(1, scale(2)),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(12),
    letterSpacing: 0.3,
  },
});
