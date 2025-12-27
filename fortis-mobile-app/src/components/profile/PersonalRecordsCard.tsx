import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrophyIcon } from 'react-native-heroicons/outline';
import { useTopPersonalRecords } from '@/src/hooks/useTopPersonalRecords';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { format } from 'date-fns';

interface PRRowProps {
  rank: number;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  unit: string;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function PRRow({ rank, exerciseName, weight, reps, date, unit, colors, isDark }: PRRowProps) {
  return (
    <View style={styles.prRow}>
      <View style={[
        styles.rankBadge,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }
      ]}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>{rank}</Text>
      </View>
      <View style={styles.prInfo}>
        <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={1}>
          {exerciseName}
        </Text>
        <Text style={[styles.prDetails, { color: colors.textSecondary }]}>
          {weight} {unit} × {reps} reps • {format(date, 'MMM d')}
        </Text>
      </View>
      {rank <= 3 && (
        <TrophyIcon
          color={rank === 1 ? '#fbbf24' : rank === 2 ? '#a3a3a3' : '#cd7f32'}
          size={18}
          strokeWidth={2}
        />
      )}
    </View>
  );
}

/**
 * PersonalRecordsCard - Displays top personal records by max weight.
 */
export function PersonalRecordsCard() {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const prs = useTopPersonalRecords(5);
  const units = profile?.preferred_units || 'imperial';
  const unitLabel = units === 'metric' ? 'kg' : 'lbs';

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const dividerStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <View style={[styles.container, cardStyle]}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Personal Records</Text>

      {prs.length === 0 ? (
        <View style={styles.emptyState}>
          <TrophyIcon color={colors.textSecondary} size={32} strokeWidth={1.5} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No PRs yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
            Complete workouts to track your heaviest lifts
          </Text>
        </View>
      ) : (
        <View style={styles.prList}>
          {prs.map((pr, index) => (
            <React.Fragment key={pr.exerciseId}>
              <PRRow
                rank={index + 1}
                exerciseName={pr.exerciseName}
                weight={pr.maxWeight}
                reps={pr.reps}
                date={pr.date}
                unit={unitLabel}
                colors={colors}
                isDark={isDark}
              />
              {index < prs.length - 1 && <View style={[styles.divider, dividerStyle]} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  prList: {
    gap: 0,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  prInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  exerciseName: {
    ...Typography.body,
    marginBottom: 2,
  },
  prDetails: {
    ...Typography.caption,
  },
  divider: {
    height: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    ...Typography.body,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
