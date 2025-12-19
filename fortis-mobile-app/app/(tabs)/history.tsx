import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ClockIcon, FireIcon, TrophyIcon, CloudIcon, CloudArrowUpIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { useWorkoutStore, getWorkoutSummary } from '../../src/store/workoutStore';
import { fetchWorkoutHistory, getPendingSyncCount } from '../../src/services/workoutHistoryService';
import { useAuth } from '../../src/contexts/AuthContext';
import { WorkoutSession } from '../../src/types/workout';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Sizes';
import { Typography } from '../../constants/Typography';

// Format duration as "Xh Ym" or "Xm"
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Format volume with unit
function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

// Workout History Card Component
function WorkoutHistoryCard({ session }: { session: WorkoutSession }) {
  const summary = getWorkoutSummary(session);
  const formattedDate = format(session.startedAt, 'MMM d, yyyy');
  const formattedTime = format(session.startedAt, 'h:mm a');

  return (
    <View style={styles.card}>
      {/* Header with name and date */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {session.name}
          </Text>
          {session.isSynced && (
            <CloudIcon color={Colors.success} size={14} strokeWidth={2} />
          )}
        </View>
        <Text style={styles.workoutDate}>{formattedDate}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ClockIcon color={Colors.success} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>{formatDuration(summary.durationSeconds)}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <FireIcon color={Colors.success} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>{summary.totalSets} sets</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <TrophyIcon color={Colors.success} size={16} strokeWidth={2} />
          <Text style={styles.statValue}>{formatVolume(summary.totalVolume)} lbs</Text>
        </View>
      </View>

      {/* Exercise count */}
      <Text style={styles.exerciseCount}>
        {summary.totalExercises} exercise{summary.totalExercises !== 1 ? 's' : ''} • Started at {formattedTime}
      </Text>
    </View>
  );
}

// Empty state component
function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <TrophyIcon color={Colors.textSecondary} size={48} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No workouts yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete your first workout to see it here
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const localSessions = useWorkoutStore((s) => s.completedSessions);
  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Merge local and remote sessions, avoiding duplicates
  const allSessions = useCallback(() => {
    const sessionMap = new Map<string, WorkoutSession>();

    // Add local sessions first
    for (const session of localSessions) {
      sessionMap.set(session.localId, session);
    }

    // Add remote sessions (may override local if same localId)
    for (const session of remoteSessions) {
      if (!sessionMap.has(session.localId)) {
        sessionMap.set(session.localId, session);
      }
    }

    // Sort by startedAt descending
    return Array.from(sessionMap.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }, [localSessions, remoteSessions]);

  const sessions = allSessions();

  // Fetch remote sessions and pending count
  const loadData = useCallback(async () => {
    // Get pending sync count
    const count = await getPendingSyncCount();
    setPendingCount(count);

    // Fetch from Supabase if authenticated
    if (isAuthenticated) {
      const { sessions: remote } = await fetchWorkoutHistory();
      setRemoteSessions(remote);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>History</Text>
            {pendingCount > 0 && (
              <View style={styles.pendingBadge}>
                <CloudArrowUpIcon color={Colors.warning} size={14} strokeWidth={2} />
                <Text style={styles.pendingText}>{pendingCount}</Text>
              </View>
            )}
          </View>
          {sessions.length > 0 && (
            <Text style={styles.workoutCount}>
              {sessions.length} workout{sessions.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {isLoading && sessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.success} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.localId}
            renderItem={({ item }) => <WorkoutHistoryCard session={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={Colors.success}
                colors={[Colors.success]}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontFamily: 'BankGothicMediumBT',
  },
  workoutCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  pendingText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  separator: {
    height: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
  workoutName: {
    ...Typography.h5,
    color: Colors.textPrimary,
    flex: 1,
  },
  workoutDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.labelSmall,
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
  exerciseCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
