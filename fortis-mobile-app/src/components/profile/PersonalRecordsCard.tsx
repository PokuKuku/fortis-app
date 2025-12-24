import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrophyIcon } from 'react-native-heroicons/outline';
import { useTopPersonalRecords } from '@/src/hooks/useTopPersonalRecords';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
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
}

function PRRow({ rank, exerciseName, weight, reps, date, unit }: PRRowProps) {
  return (
    <View style={styles.prRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.prInfo}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exerciseName}
        </Text>
        <Text style={styles.prDetails}>
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
  const prs = useTopPersonalRecords(5);
  const units = profile?.preferred_units || 'imperial';
  const unitLabel = units === 'metric' ? 'kg' : 'lbs';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Personal Records</Text>

      {prs.length === 0 ? (
        <View style={styles.emptyState}>
          <TrophyIcon color={Colors.textSecondary} size={32} strokeWidth={1.5} />
          <Text style={styles.emptyStateText}>No PRs yet</Text>
          <Text style={styles.emptyStateSubtext}>
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
              />
              {index < prs.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  prInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  exerciseName: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  prDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
