import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { ClockIcon, ScaleIcon, TrophyIcon } from 'react-native-heroicons/outline';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { WorkoutSession } from '@/src/types/workout';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';

interface WorkoutHistoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

export function WorkoutHistoryDetailModal({
  visible,
  onClose,
  session,
}: WorkoutHistoryDetailModalProps) {
  if (!session) return null;

  const summary = getWorkoutSummary(session);
  const formattedDateTime = format(session.startedAt, "HH:mm, EEEE, MMM d yyyy");

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={session.name}
      width={350}
    >
      {/* Date/Time */}
      <Text style={styles.dateTime}>{formattedDateTime}</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ClockIcon color={Colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>{formatDuration(summary.durationSeconds)}</Text>
        </View>

        <View style={styles.stat}>
          <ScaleIcon color={Colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>{formatVolume(summary.totalVolume)} lb</Text>
        </View>

        <View style={styles.stat}>
          <TrophyIcon color={Colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>0 PR</Text>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {session.exercises.map((exercise) => {
          const completedSets = exercise.sets.filter(s => s.isCompleted);
          if (completedSets.length === 0) return null;

          return (
            <View key={exercise.localId} style={styles.exerciseSection}>
              {/* Exercise Name */}
              <Text style={styles.exerciseName} numberOfLines={1}>
                {exercise.exerciseName}
              </Text>

              {/* Sets */}
              {completedSets.map((set, idx) => (
                <View key={set.localId} style={styles.setRow}>
                  <Text style={styles.setNumber}>{idx + 1}</Text>
                  <Text style={styles.setDetails}>
                    {set.weight ?? 0} × {set.reps ?? 0}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  dateTime: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseSection: {
    marginBottom: Spacing.lg,
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  setNumber: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 20,
  },
  setDetails: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
