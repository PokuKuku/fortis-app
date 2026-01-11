import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  const monoColor = colors.textPrimary;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;
  const selectionTheme = {
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    backgroundColor: isDark ? 'rgba(18,18,18,0.92)' : 'rgba(255,255,255,0.9)',
  };

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
      {selectedItem && (
        <View style={[styles.selectionPill, selectionTheme]}>
          <Text style={[styles.selectionValue, { color: colors.textPrimary }]}>
            {formatCompactNumber(selectedItem.value)}{unit ? ` ${unit}` : ''}
          </Text>
          <Text style={[styles.selectionLabel, { color: colors.textTertiary }]} numberOfLines={1}>
            {selectedItem.label}
          </Text>
        </View>
      )}
      {data.map((item, index) => {
        const widthPct = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 6) : 0;
        const isSelected = selectedIndex === index;
        return (
          <Pressable
            key={item.label}
            style={[
              styles.row,
              isSelected && {
                borderColor: colors.accentBorder,
                backgroundColor: colors.accentOverlay,
              },
            ]}
            onPress={() => setSelectedIndex(index)}
          >
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
                  styles.fillAccent,
                  { width: `${widthPct}%`, backgroundColor: colors.accent },
                ]}
              />
              <View
                style={[
                  styles.fill,
                  styles.fillMono,
                  { width: `${widthPct}%`, backgroundColor: monoColor },
                ]}
              />
            </View>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCompactNumber(item.value)}{unit ? ` ${unit}` : ''}
            </Text>
          </Pressable>
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: scale(Spacing.xs),
    paddingVertical: scale(Spacing.xs),
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
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
  },
  fillAccent: {
    opacity: 0.25,
  },
  fillMono: {
    opacity: 0.85,
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
  selectionPill: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.sm),
    paddingVertical: scale(Spacing.xs),
    marginBottom: scale(Spacing.xs),
  },
  selectionValue: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  selectionLabel: {
    fontSize: moderateScale(10),
    marginTop: scale(2),
  },
});
