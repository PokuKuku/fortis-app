import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { InsightBarPoint } from '@/src/types/insightCharts';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';

type InsightBarChartProps = {
  data: InsightBarPoint[];
  unit?: string;
};

const trimTrailingZero = (value: string): string => value.replace(/\.0$/, '');

const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return trimTrailingZero((value / 1_000_000).toFixed(1)) + 'm';
  }
  if (absValue >= 1000) {
    return trimTrailingZero((value / 1000).toFixed(1)) + 'k';
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return trimTrailingZero(value.toFixed(1));
};

export function InsightBarChart({ data, unit }: InsightBarChartProps) {
  const { colors, isDark } = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (data.length === 0) {
    return (
      <View
        style={[
          styles.emptyState,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          Not enough data yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
          Log a few sets to unlock the breakdown.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const widthPct = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 6) : 0;
        return (
          <View key={item.label} style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.label}
            </Text>
            <View
              style={[
                styles.track,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
              ]}
            >
              <View
                style={[
                  styles.fill,
                  { width: `${widthPct}%`, backgroundColor: colors.accent },
                ]}
              />
            </View>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCompactNumber(item.value)}{unit ? ` ${unit}` : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: scale(Spacing.sm),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  label: {
    flex: 1,
    fontSize: moderateScale(12),
  },
  track: {
    flex: 1.4,
    height: scale(8),
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  value: {
    minWidth: scale(64),
    textAlign: 'right',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: 11,
    textAlign: 'center',
  },
});
