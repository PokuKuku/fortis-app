import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { format, isSameDay } from 'date-fns';
import { ClockIcon, FireIcon, TrophyIcon, CloudIcon, CalendarDaysIcon, ChevronDownIcon } from 'react-native-heroicons/outline';
import { DateSelector } from '../../src/components/ui/DateSelector';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  Layout,
  Easing,
} from 'react-native-reanimated';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { GlassCard } from '../../components/GlassCard';
import { useWorkoutStore, getWorkoutSummary } from '../../src/store/workoutStore';
import { fetchWorkoutHistory, getPendingSyncCount } from '../../src/services/workoutHistoryService';
import { useAuth } from '../../src/contexts/AuthContext';
import { WorkoutSession } from '../../src/types/workout';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Sizes';
import { Typography } from '../../constants/Typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Intensity colors for heatmap
const INTENSITY_COLORS = {
  level1: 'rgba(34, 197, 94, 0.25)',
  level2: 'rgba(34, 197, 94, 0.45)',
  level3: 'rgba(34, 197, 94, 0.65)',
  level4: 'rgba(34, 197, 94, 0.85)',
};

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

// Get volume by date for heatmap
function getVolumeByDate(sessions: WorkoutSession[]): Record<string, number> {
  const volumeMap: Record<string, number> = {};

  sessions.forEach(session => {
    const dateKey = format(session.startedAt, 'yyyy-MM-dd');
    const summary = getWorkoutSummary(session);
    volumeMap[dateKey] = (volumeMap[dateKey] || 0) + summary.totalVolume;
  });

  return volumeMap;
}

// Get intensity level based on volume ratio
function getIntensityLevel(volume: number, maxVolume: number): 1 | 2 | 3 | 4 | null {
  if (volume === 0 || maxVolume === 0) return null;
  const ratio = volume / maxVolume;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

// Animated Day Component for Calendar
function AnimatedDay({
  date,
  state,
  marking,
  isSelected,
  onPress
}: {
  date: DateData;
  state: string | undefined;
  marking?: { intensity?: 1 | 2 | 3 | 4 };
  isSelected: boolean;
  onPress: (date: DateData) => void;
}) {
  const scale = useSharedValue(1);
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const intensity = marking?.intensity;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let backgroundColor = 'transparent';
  if (isSelected) {
    backgroundColor = 'rgba(34, 197, 94, 0.85)';
  } else if (intensity) {
    backgroundColor = INTENSITY_COLORS[`level${intensity}`];
  }

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(date);
  };

  return (
    <View style={styles.dayWrapper}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.dayContainer,
          { backgroundColor },
          isSelected && styles.selectedDayContainer,
          isToday && !isSelected && styles.todayBorder,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            isDisabled && styles.dayTextDisabled,
            isSelected && styles.dayTextSelected,
            isToday && !isSelected && styles.dayTextToday,
          ]}
        >
          {date.day}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

// Workout History Card Component
function WorkoutHistoryCard({ session }: { session: WorkoutSession }) {
  const summary = getWorkoutSummary(session);
  const formattedDate = format(session.startedAt, 'MMM d, yyyy');
  const formattedTime = format(session.startedAt, 'h:mm a');

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.duration(200)}
      style={styles.card}
    >
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

      <Text style={styles.exerciseCount}>
        {summary.totalExercises} exercise{summary.totalExercises !== 1 ? 's' : ''} • Started at {formattedTime}
      </Text>
    </Animated.View>
  );
}

// Empty state for no workouts ever
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

// Empty state for no workouts on selected date
function EmptyDateState() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.emptyDateContainer}
    >
      <CalendarDaysIcon color={Colors.textSecondary} size={32} strokeWidth={1.5} />
      <Text style={styles.emptyDateText}>No workouts logged on this day</Text>
    </Animated.View>
  );
}

// Animated Date Header Component
function DateHeader({ date, volume }: { date: Date; volume: number }) {
  const formattedDate = format(date, 'EEEE, MMMM d');

  return (
    <Animated.View
      key={formattedDate}
      entering={FadeIn.duration(200)}
      style={styles.dateHeader}
    >
      <Text style={styles.dateHeaderText}>{formattedDate}</Text>
      {volume > 0 && (
        <View style={styles.volumeBadge}>
          <Text style={styles.volumeLabel}>Total Volume</Text>
          <Text style={styles.volumeValue}>{formatVolume(volume)} lbs</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const localSessions = useWorkoutStore((s) => s.completedSessions);
  const [remoteSessions, setRemoteSessions] = useState<WorkoutSession[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [showDateSelector, setShowDateSelector] = useState(false);

  // Merge local and remote sessions, avoiding duplicates
  const allSessions = useMemo(() => {
    const sessionMap = new Map<string, WorkoutSession>();

    for (const session of localSessions) {
      sessionMap.set(session.localId, session);
    }

    for (const session of remoteSessions) {
      if (!sessionMap.has(session.localId)) {
        sessionMap.set(session.localId, session);
      }
    }

    return Array.from(sessionMap.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }, [localSessions, remoteSessions]);

  const volumeByDate = useMemo(() => getVolumeByDate(allSessions), [allSessions]);
  const maxVolume = useMemo(() => Math.max(...Object.values(volumeByDate), 1), [volumeByDate]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { intensity: 1 | 2 | 3 | 4 }> = {};
    Object.entries(volumeByDate).forEach(([dateKey, volume]) => {
      const intensity = getIntensityLevel(volume, maxVolume);
      if (intensity) {
        marks[dateKey] = { intensity };
      }
    });
    return marks;
  }, [volumeByDate, maxVolume]);

  const filteredWorkouts = useMemo(() => {
    return allSessions.filter(session => isSameDay(session.startedAt, selectedDate));
  }, [allSessions, selectedDate]);

  const selectedDateVolume = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return volumeByDate[dateKey] || 0;
  }, [selectedDate, volumeByDate]);

  const loadData = useCallback(async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);

    if (isAuthenticated) {
      const { sessions: remote } = await fetchWorkoutHistory();
      setRemoteSessions(remote);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const handleDayPress = useCallback((day: DateData) => {
    // Parse as local date to avoid timezone issues
    // new Date("2025-12-20") parses as UTC midnight, which shifts to previous day in west timezones
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, dayNum);
    setSelectedDate(localDate);
  }, []);

  const handleDateSelectorSelect = useCallback((date: Date) => {
    setDisplayedMonth(date);
    setSelectedDate(date);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    const [year, monthNum] = month.dateString.split('-').map(Number);
    setDisplayedMonth(new Date(year, monthNum - 1, 1));
  }, []);

  const openDateSelector = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDateSelector(true);
  }, []);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const displayedMonthKey = format(displayedMonth, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>History</Text>
        </View>

        {isLoading && allSessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.success} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : allSessions.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredWorkouts}
            keyExtractor={(item) => item.localId}
            renderItem={({ item }) => <WorkoutHistoryCard session={item} />}
            ListHeaderComponent={
              <>
                <GlassCard style={styles.calendarCard}>
                  <Calendar
                    key={displayedMonthKey}
                    current={displayedMonthKey}
                    onDayPress={handleDayPress}
                    onMonthChange={handleMonthChange}
                    theme={{
                      calendarBackground: 'transparent',
                      monthTextColor: Colors.textPrimary,
                      textMonthFontFamily: 'BankGothicBT-Medium',
                      textMonthFontSize: 20,
                      arrowColor: Colors.success,
                      textSectionTitleColor: Colors.textSecondary,
                      textDayHeaderFontSize: 11,
                      textDayHeaderFontWeight: '600' as const,
                    }}
                    renderHeader={(date) => (
                      <Pressable
                        style={styles.calendarHeader}
                        onPress={openDateSelector}
                      >
                        <Text style={styles.calendarHeaderText}>
                          {format(new Date(date), 'MMMM yyyy')}
                        </Text>
                        <ChevronDownIcon color={Colors.success} size={18} strokeWidth={2.5} />
                      </Pressable>
                    )}
                    dayComponent={({ date, state }) => (
                      <AnimatedDay
                        date={date as DateData}
                        state={state}
                        marking={date ? markedDates[date.dateString] : undefined}
                        isSelected={date?.dateString === selectedDateKey}
                        onPress={handleDayPress}
                      />
                    )}
                    hideExtraDays={false}
                    enableSwipeMonths={true}
                  />
                </GlassCard>

                <DateHeader date={selectedDate} volume={selectedDateVolume} />
              </>
            }
            ListEmptyComponent={<EmptyDateState />}
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

      <DateSelector
        visible={showDateSelector}
        onClose={() => setShowDateSelector(false)}
        onSelectDate={handleDateSelectorSelect}
        currentDate={displayedMonth}
        selectedDate={selectedDate}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
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
  calendarCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  calendarHeaderText: {
    fontSize: 20,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayContainer: {
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  dayText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextDisabled: {
    color: Colors.textSecondary,
    opacity: 0.3,
  },
  dayTextSelected: {
    color: Colors.background,
    fontWeight: '700',
  },
  dayTextToday: {
    color: Colors.success,
    fontWeight: '700',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dateHeaderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  volumeLabel: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
    fontSize: 11,
  },
  volumeValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
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
  emptyDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyDateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
