import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AppState, View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { format, isSameDay } from 'date-fns';
import { ClockIcon, FireIcon, TrophyIcon, CloudIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
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
import { AppHeaderBrand } from '../../src/components/navigation/AppHeaderBrand';
import { getWorkoutSummary, useWorkoutStore } from '../../src/store/workoutStore';
import { getPendingSyncSessions, processPendingQueue } from '../../src/services/workoutHistoryService';
import { useWorkoutHistorySource } from '../../src/hooks/useWorkoutHistorySource';
import { useAuth } from '../../src/contexts/AuthContext';
import { useExerciseLookup } from '../../src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '../../src/hooks/useLatestBodyweight';
import { useTheme } from '../../src/contexts/ThemeContext';
import { WorkoutSession } from '../../src/types/workout';
import type { VolumeContext } from '../../src/utils/workoutVolume';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Sizes';
import { scale, moderateScale } from '../../src/utils/responsive';
import { Typography } from '../../constants/Typography';
import { WorkoutHistoryDetailModal } from '../../src/components/workout/modals/WorkoutHistoryDetailModal';
import { AccentShadowCard } from '../../src/components/ui/AccentShadowCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Responsive calendar day sizing
const DAY_SIZE = scale(36);
const DAY_RADIUS = DAY_SIZE / 2;
const DAY_TEXT_SIZE = moderateScale(13);
const DAY_WRAPPER_PADDING_Y = scale(2);
const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.md);
const TITLE_PADDING_BOTTOM = scale(Spacing.md);
const SECTION_TITLE_SIZE = moderateScale(24);
const LIST_PADDING_BOTTOM = scale(120);
const LOADING_GAP = scale(Spacing.md);
const BODY_TEXT_SIZE = moderateScale(16);
const BODY_LINE_HEIGHT = moderateScale(24);
const CALENDAR_CARD_MARGIN = scale(Spacing.lg);
const CALENDAR_CARD_PADDING = scale(Spacing.md);
const CALENDAR_CARD_RADIUS = scale(16);
const CALENDAR_HEADER_PADDING_X = scale(16);
const CALENDAR_HEADER_PADDING_Y = scale(8);
const CALENDAR_HEADER_RADIUS = scale(20);
const CALENDAR_HEADER_TEXT_SIZE = moderateScale(20);
const CALENDAR_DAY_HEADER_SIZE = moderateScale(11);
const DATE_HEADER_PADDING_Y = scale(Spacing.md);
const DATE_HEADER_MARGIN_BOTTOM = scale(Spacing.xs);
const LOG_WORKOUT_PADDING_X = scale(Spacing.md);
const LOG_WORKOUT_PADDING_Y = scale(Spacing.xs);
const LOG_WORKOUT_TEXT_SIZE = moderateScale(11);
const SEPARATOR_HEIGHT = scale(Spacing.md);
const CARD_PADDING = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const CARD_HEADER_MARGIN = scale(Spacing.md);
const CARD_TITLE_GAP = scale(Spacing.xs);
const CARD_TITLE_MARGIN_RIGHT = scale(Spacing.md);
const WORKOUT_NAME_SIZE = moderateScale(18);
const WORKOUT_NAME_LINE_HEIGHT = moderateScale(27);
const WORKOUT_DATE_SIZE = moderateScale(12);
const STAT_GAP = scale(Spacing.xs);
const STAT_VALUE_SIZE = moderateScale(14);
const STAT_VALUE_LINE_HEIGHT = moderateScale(21);
const STAT_DIVIDER_HEIGHT = scale(16);
const STAT_DIVIDER_MARGIN = scale(Spacing.md);
const PENDING_SECTION_MARGIN = scale(Spacing.lg);
const PENDING_SECTION_GAP = scale(Spacing.sm);
const PENDING_PILL_PADDING_X = scale(8);
const PENDING_PILL_PADDING_Y = scale(2);
const PENDING_TEXT_SIZE = moderateScale(10);
const PENDING_SPINNER_MARGIN = scale(Spacing.xs);
const EXERCISE_COUNT_SIZE = moderateScale(12);
const EMPTY_CONTAINER_PADDING_Y = scale(Spacing['3xl']);
const EMPTY_CONTAINER_PADDING_X = scale(Spacing['2xl']);
const EMPTY_TEXT_MARGIN = scale(Spacing.md);
const LOG_PAST_MARGIN = scale(Spacing.lg);
const LOG_PAST_PADDING_Y = scale(Spacing.sm);
const LOG_PAST_PADDING_X = scale(Spacing.lg);
const LOG_PAST_TEXT_SIZE = moderateScale(14);
const ICON_SIZE_SM = scale(14);
const ICON_SIZE_MD = scale(16);
const ICON_SIZE_LG = scale(32);

// Intensity colors for heatmap - now generated dynamically from accent color
function getIntensityColors(accentOverlay: string, accent: string) {
  return {
    level1: `${accent}40`, // 25% opacity
    level2: `${accent}73`, // 45% opacity
    level3: `${accent}A6`, // 65% opacity
    level4: `${accent}D9`, // 85% opacity
  };
}

// Format duration as "Xh Ym" or "Xm"
function formatDuration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
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

// Get volume and activity by date for heatmap
function getDailyStats(
  sessions: WorkoutSession[],
  volumeContext: VolumeContext
): {
  volumeByDate: Record<string, number>;
  activityByDate: Record<string, boolean>;
} {
  const volumeByDate: Record<string, number> = {};
  const activityByDate: Record<string, boolean> = {};

  sessions.forEach(session => {
    const summary = getWorkoutSummary(session, volumeContext);
    if (summary.totalSets === 0) return;

    const dateKey = format(session.startedAt, 'yyyy-MM-dd');
    volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + summary.totalVolume;
    activityByDate[dateKey] = true;
  });

  return { volumeByDate, activityByDate };
}

function hasCompletedSets(session: WorkoutSession): boolean {
  return session.exercises.some(exercise =>
    exercise.sets.some(set => set.isCompleted)
  );
}

// Get intensity level based on volume ratio
function getIntensityLevel(volume: number, maxVolume: number, hasActivity: boolean): 1 | 2 | 3 | 4 | null {
  if (!hasActivity) return null;
  if (volume === 0 || maxVolume === 0) return 1;
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
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const isDisabled = state === 'disabled';
  const intensity = marking?.intensity;
  const isDisabledHighlighted = isDisabled && Boolean(intensity);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const intensityColors = getIntensityColors(colors.accentOverlay, colors.accent);
  let backgroundColor = 'transparent';
  if (intensity) {
    backgroundColor = intensityColors[`level${intensity}`];
  }
  const dayTextColor = intensity ? colors.accentForegroundOnFill : colors.textPrimary;
  const selectedDayTextColor = intensity ? colors.accentForegroundOnFill : colors.accent;

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
          isSelected && [styles.selectedDayContainer, { borderColor: colors.accent }],
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            { color: dayTextColor },
            isDisabled && { color: colors.textSecondary, opacity: 0.3 },
            isDisabledHighlighted && { color: colors.accentForegroundOnFill, opacity: isDark ? 0.9 : 0.85 },
            isSelected && { color: selectedDayTextColor, fontWeight: '700' },
          ]}
        >
          {date.day}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

// Workout History Card Component
function WorkoutHistoryCard({
  session,
  onPress,
  volumeContext,
  volumeUnitLabel,
}: {
  session: WorkoutSession;
  onPress: () => void;
  volumeContext: VolumeContext;
  volumeUnitLabel: string;
}) {
  const { colors, isDark } = useTheme();
  const summary = getWorkoutSummary(session, volumeContext);
  const formattedDate = format(session.startedAt, 'MMM d, yyyy');
  const formattedTime = format(session.startedAt, 'h:mm a');
  const durationSeconds = session.durationSeconds === null
    ? null
    : session.durationSeconds ?? summary.durationSeconds;

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
  };

  return (
    <AccentShadowCard radius={CARD_RADIUS}>
      <Pressable onPress={onPress}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          layout={Layout.duration(200)}
          style={[styles.card, cardTheme]}
        >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.workoutName, { color: colors.textPrimary }]} numberOfLines={1}>
            {session.name}
          </Text>
          {session.isSynced && (
            <CloudIcon color={colors.accent} size={ICON_SIZE_SM} strokeWidth={2} />
          )}
        </View>
        <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ClockIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatDuration(durationSeconds)}</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]} />

        <View style={styles.stat}>
          <FireIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{summary.totalSets} sets</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]} />

        <View style={styles.stat}>
          <TrophyIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatVolume(summary.totalVolume)} {volumeUnitLabel}
          </Text>
        </View>
      </View>

      <Text style={[styles.exerciseCount, { color: colors.textSecondary }]}>
        {summary.totalExercises} exercise{summary.totalExercises !== 1 ? 's' : ''} • Started at {formattedTime}
      </Text>
        </Animated.View>
      </Pressable>
    </AccentShadowCard>
  );
}

// Pending Sync Card Component
function PendingSyncCard({
  session,
  status,
  onPress,
  volumeContext,
  volumeUnitLabel,
}: {
  session: WorkoutSession;
  status: 'pending' | 'syncing';
  onPress?: () => void;
  volumeContext: VolumeContext;
  volumeUnitLabel: string;
}) {
  const { colors, isDark } = useTheme();
  const summary = getWorkoutSummary(session, volumeContext);
  const formattedDate = format(session.startedAt, 'MMM d, yyyy');
  const formattedTime = format(session.startedAt, 'h:mm a');
  const isSyncing = status === 'syncing';
  const durationSeconds = session.durationSeconds === null
    ? null
    : session.durationSeconds ?? summary.durationSeconds;

  const cardTheme = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
  };

  return (
    <AccentShadowCard radius={CARD_RADIUS}>
      <Pressable onPress={onPress}>
        <View style={[styles.card, cardTheme]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.workoutName, { color: colors.textPrimary }]} numberOfLines={1}>
              {session.name}
            </Text>
            <View style={[styles.pendingPill, { borderColor: colors.accentBorder }]}>
              {isSyncing && (
                <ActivityIndicator
                  size="small"
                  color={colors.accent}
                  style={styles.pendingSpinner}
                />
              )}
              <Text style={[styles.pendingPillText, { color: colors.accent }]}>
                {isSyncing ? 'Syncing...' : 'Pending sync'}
              </Text>
            </View>
          </View>
          <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ClockIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatDuration(durationSeconds)}</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]} />

          <View style={styles.stat}>
            <FireIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{summary.totalSets} sets</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]} />

        <View style={styles.stat}>
          <TrophyIcon color={colors.accent} size={ICON_SIZE_MD} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatVolume(summary.totalVolume)} {volumeUnitLabel}
          </Text>
        </View>
        </View>

        <Text style={[styles.exerciseCount, { color: colors.textSecondary }]}>
          {summary.totalExercises} exercise{summary.totalExercises !== 1 ? 's' : ''} • Started at {formattedTime}
        </Text>
        </View>
      </Pressable>
    </AccentShadowCard>
  );
}

// Empty state for no workouts on selected date
function EmptyDateState({ onLogPastWorkout }: { onLogPastWorkout: () => void }) {
  const { colors, isDark } = useTheme();

  const containerTheme = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
  };

  const buttonStyles = {
    logPastButton: {
      borderColor: colors.accentBorder,
    },
    logPastButtonPressed: {
      backgroundColor: colors.accentOverlay,
    },
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.emptyDateContainer, containerTheme]}
    >
      <CalendarDaysIcon color={colors.textSecondary} size={ICON_SIZE_LG} strokeWidth={1.5} />
      <Text style={[styles.emptyDateText, { color: colors.textSecondary }]}>No workouts logged on this day</Text>
      <Pressable
        style={({ pressed }) => [
          styles.logPastButton,
          buttonStyles.logPastButton,
          pressed && buttonStyles.logPastButtonPressed,
        ]}
        onPress={onLogPastWorkout}
      >
        <Text style={[styles.logPastButtonText, { color: colors.accent }]}>Log Past Workout</Text>
      </Pressable>
    </Animated.View>
  );
}

// Animated Date Header Component
function DateHeader({ date, onLogPastWorkout }: { date: Date; onLogPastWorkout: () => void }) {
  const { colors } = useTheme();
  const formattedDate = format(date, 'EEEE, MMMM d');

  const buttonStyles = {
    logWorkoutButton: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    logWorkoutButtonPressed: {
      backgroundColor: colors.accentOverlayMedium,
      borderColor: colors.accent,
    },
  };

  return (
    <Animated.View
      key={formattedDate}
      entering={FadeIn.duration(200)}
      style={styles.dateHeader}
    >
      <Text style={[styles.dateHeaderText, { color: colors.textSecondary }]}>{formattedDate}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.logWorkoutButton,
          buttonStyles.logWorkoutButton,
          pressed && buttonStyles.logWorkoutButtonPressed,
        ]}
        onPress={onLogPastWorkout}
      >
        <Text style={[styles.logWorkoutButtonText, { color: colors.accent }]}>Log Workout</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { colors, isDark } = useTheme();
  const syncingSessionIds = useWorkoutStore((state) => state.syncingSessionIds);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const preferredUnits = profile?.preferred_units ?? 'imperial';
  const volumeUnitLabel = preferredUnits === 'metric' ? 'kg' : 'lbs';
  const volumeContext = useMemo<VolumeContext>(
    () => ({
      preferredUnits,
      weightUnits,
      exercisesById,
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
    }),
    [preferredUnits, weightUnits, exercisesById, bodyweightKg, profile?.weight_kg]
  );
  const markSessionsSyncing = useWorkoutStore((state) => state.markSessionsSyncing);
  const clearSessionsSyncing = useWorkoutStore((state) => state.clearSessionsSyncing);
  const markSessionsSynced = useWorkoutStore((state) => state.markSessionsSynced);
  const [pendingSessions, setPendingSessions] = useState<WorkoutSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const previousSyncCount = useRef(0);
  const appState = useRef(AppState.currentState);
  const { sessions: historySessions, isLoading: historyLoading } = useWorkoutHistorySource({
    enabled: isAuthenticated,
    refreshKey: historyRefreshKey,
  });

  // Supabase is the source of truth for history
  const allSessions = useMemo(() => {
    return [...historySessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }, [historySessions]);

  const { volumeByDate, activityByDate } = useMemo(
    () => getDailyStats(allSessions, volumeContext),
    [allSessions, volumeContext]
  );
  const maxVolume = useMemo(() => Math.max(...Object.values(volumeByDate), 1), [volumeByDate]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { intensity: 1 | 2 | 3 | 4 }> = {};
    Object.entries(volumeByDate).forEach(([dateKey, volume]) => {
      const intensity = getIntensityLevel(volume, maxVolume, activityByDate[dateKey] ?? false);
      if (intensity) {
        marks[dateKey] = { intensity };
      }
    });
    return marks;
  }, [volumeByDate, maxVolume, activityByDate]);

  const filteredWorkouts = useMemo(() => {
    return allSessions.filter(session => isSameDay(session.startedAt, selectedDate));
  }, [allSessions, selectedDate]);

  const syncingSessions = useMemo(() => {
    if (syncingSessionIds.length === 0) return [];
    const syncingIds = new Set(syncingSessionIds);
    return completedSessions.filter(session =>
      syncingIds.has(session.localId) && hasCompletedSets(session)
    );
  }, [syncingSessionIds, completedSessions]);

  const pendingEntries = useMemo(() => {
    const entries: Array<{ session: WorkoutSession; status: 'pending' | 'syncing' }> = [];
    const seen = new Set<string>();

    [...syncingSessions]
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .forEach((session) => {
        entries.push({ session, status: 'syncing' });
        seen.add(session.localId);
      });

    [...pendingSessions]
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .forEach((session) => {
        if (seen.has(session.localId)) return;
        entries.push({ session, status: 'pending' });
      });

    return entries;
  }, [syncingSessions, pendingSessions]);

  const loadData = useCallback(async () => {
    setIsPendingLoading(true);
    const pending = await getPendingSyncSessions();
    setPendingSessions(pending);
    setIsPendingLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetCalendarToToday = useCallback(() => {
    const today = new Date();
    const sameMonth = displayedMonth.getFullYear() === today.getFullYear()
      && displayedMonth.getMonth() === today.getMonth();
    if (!sameMonth || !isSameDay(selectedDate, today)) {
      setDisplayedMonth(today);
      setSelectedDate(today);
    }
  }, [displayedMonth, selectedDate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current.match(/inactive|background/);
      appState.current = nextState;
      if (wasInactive && nextState === 'active') {
        resetCalendarToToday();
      }
    });

    return () => subscription.remove();
  }, [resetCalendarToToday]);

  useEffect(() => {
    if (previousSyncCount.current > 0 && syncingSessionIds.length === 0) {
      loadData().catch((error) => {
        console.warn('Failed to refresh workout history after sync:', error);
      });
    }
    previousSyncCount.current = syncingSessionIds.length;
  }, [loadData, syncingSessionIds.length]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setHistoryRefreshKey((key) => key + 1);
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

  const handleLogPastWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/create?mode=log&date=${selectedDate.toISOString()}`);
  }, [router, selectedDate]);

  const handleCardPress = useCallback((session: WorkoutSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSession(session);
  }, []);

  const handleRetryPendingSync = useCallback(async () => {
    let pendingIds: string[] = [];
    try {
      const pending = await getPendingSyncSessions();
      pendingIds = pending.map((session) => session.localId);
      if (pendingIds.length === 0) {
        return;
      }

      markSessionsSyncing(pendingIds);
      const result = await processPendingQueue();
      if (result.syncedLocalIds.length > 0) {
        await markSessionsSynced(result.syncedLocalIds);
      }
    } catch (error) {
      console.warn('Failed to retry pending workout sync:', error);
    } finally {
      if (pendingIds.length > 0) {
        clearSessionsSyncing(pendingIds);
      }
      await loadData();
    }
  }, [clearSessionsSyncing, loadData, markSessionsSyncing, markSessionsSynced]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const displayedMonthKey = format(displayedMonth, 'yyyy-MM-dd');

  // Theme-aware styles
  const themedStyles = {
    calendarCard: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    },
    calendarHeader: {
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
    calendarHeaderPressed: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    logWorkoutButton: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    logWorkoutButtonPressed: {
      backgroundColor: colors.accentOverlayMedium,
      borderColor: colors.accent,
    },
    logWorkoutButtonText: { color: colors.accent },
    logPastButton: {
      borderColor: colors.accentBorder,
    },
    logPastButtonPressed: {
      backgroundColor: colors.accentOverlay,
    },
    logPastButtonText: { color: colors.accent },
  };

  const hasPendingSessions = pendingEntries.length > 0;
  const hasRemoteSessions = allSessions.length > 0;
  const isLoading = historyLoading || isPendingLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {isLoading && !hasRemoteSessions && !hasPendingSessions ? (
          <View style={styles.loadingContainer}>
            <AppHeaderBrand style={styles.header} />
            <View style={styles.titleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>History</Text>
            </View>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading history...</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredWorkouts}
            keyExtractor={(item) => item.localId}
            renderItem={({ item }) => (
              <WorkoutHistoryCard
                session={item}
                onPress={() => handleCardPress(item)}
                volumeContext={volumeContext}
                volumeUnitLabel={volumeUnitLabel}
              />
            )}
            ListHeaderComponent={
              <>
                <AppHeaderBrand style={styles.header} />
                <View style={styles.titleContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>History</Text>
                </View>
                <View style={[styles.calendarCard, themedStyles.calendarCard]}>
                  <Calendar
                    key={displayedMonthKey}
                    current={displayedMonthKey}
                    onDayPress={handleDayPress}
                    onMonthChange={handleMonthChange}
                    theme={{
                      calendarBackground: 'transparent',
                      monthTextColor: colors.textPrimary,
                      textMonthFontFamily: 'BankGothicBT-Medium',
                      textMonthFontSize: CALENDAR_HEADER_TEXT_SIZE,
                      arrowColor: colors.accent,
                      textSectionTitleColor: colors.textSecondary,
                      textDayHeaderFontSize: CALENDAR_DAY_HEADER_SIZE,
                      textDayHeaderFontWeight: '600' as const,
                    }}
                    renderHeader={(date) => (
                      <Pressable
                        style={({ pressed }) => [
                          styles.calendarHeader,
                          themedStyles.calendarHeader,
                          pressed && themedStyles.calendarHeaderPressed,
                        ]}
                        onPress={openDateSelector}
                      >
                        <Text style={[styles.calendarHeaderText, { color: colors.textPrimary }]}>
                          {format(new Date(date), 'MMMM yyyy')}
                        </Text>
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
                    hideArrows={true}
                    enableSwipeMonths={false}
                  />
                </View>

                <DateHeader date={selectedDate} onLogPastWorkout={handleLogPastWorkout} />

                {hasPendingSessions && (
                  <View style={styles.pendingSection}>
                    {pendingEntries.map(({ session, status }) => (
                      <PendingSyncCard
                        key={session.localId}
                        session={session}
                        status={status}
                        onPress={() => handleCardPress(session)}
                        volumeContext={volumeContext}
                        volumeUnitLabel={volumeUnitLabel}
                      />
                    ))}
                  </View>
                )}
              </>
            }
            ListEmptyComponent={hasPendingSessions ? null : <EmptyDateState onLogPastWorkout={handleLogPastWorkout} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
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

      <WorkoutHistoryDetailModal
        visible={selectedSession !== null}
        onClose={() => setSelectedSession(null)}
        onRetry={handleRetryPendingSync}
        session={selectedSession}
        allSessions={allSessions}
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
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingBottom: TITLE_PADDING_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: LOADING_GAP,
  },
  loadingText: {
    ...Typography.body,
    fontSize: BODY_TEXT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    color: Colors.textSecondary,
  },
  calendarCard: {
    marginBottom: CALENDAR_CARD_MARGIN,
    padding: CALENDAR_CARD_PADDING,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: CALENDAR_CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: CALENDAR_HEADER_PADDING_X,
    paddingVertical: CALENDAR_HEADER_PADDING_Y,
    borderRadius: CALENDAR_HEADER_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  calendarHeaderPressed: {
    // borderColor and backgroundColor now applied via themedStyles
  },
  calendarHeaderText: {
    fontSize: CALENDAR_HEADER_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DAY_WRAPPER_PADDING_Y,
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayContainer: {
    borderWidth: 2,
    // borderColor now applied via inline styles (colors.accent)
  },
  dayText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: DAY_TEXT_SIZE,
    fontWeight: '500',
  },
  dayTextDisabled: {
    color: Colors.textSecondary,
    opacity: 0.3,
  },
  dayTextSelected: {
    color: Colors.success,
    fontWeight: '700',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: DATE_HEADER_PADDING_Y,
    marginBottom: DATE_HEADER_MARGIN_BOTTOM,
  },
  dateHeaderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: BODY_TEXT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
  },
  logWorkoutButton: {
    paddingHorizontal: LOG_WORKOUT_PADDING_X,
    paddingVertical: LOG_WORKOUT_PADDING_Y,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    // borderColor and backgroundColor now applied via themedStyles
  },
  logWorkoutButtonPressed: {
    // backgroundColor and borderColor now applied via themedStyles
  },
  logWorkoutButtonText: {
    ...Typography.caption,
    // color now applied via themedStyles (colors.accent)
    fontWeight: '600',
    fontSize: LOG_WORKOUT_TEXT_SIZE,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: LIST_PADDING_BOTTOM,
  },
  separator: {
    height: SEPARATOR_HEIGHT,
  },
  card: {
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: CARD_PADDING,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CARD_HEADER_MARGIN,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: CARD_TITLE_GAP,
    marginRight: CARD_TITLE_MARGIN_RIGHT,
  },
  workoutName: {
    ...Typography.h5,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: WORKOUT_NAME_SIZE,
    lineHeight: WORKOUT_NAME_LINE_HEIGHT,
  },
  workoutDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: WORKOUT_DATE_SIZE,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_HEADER_MARGIN,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: STAT_GAP,
  },
  statValue: {
    ...Typography.labelSmall,
    color: Colors.textPrimary,
    fontSize: STAT_VALUE_SIZE,
    lineHeight: STAT_VALUE_LINE_HEIGHT,
  },
  statDivider: {
    width: 1,
    height: STAT_DIVIDER_HEIGHT,
    backgroundColor: Colors.borderLight,
    marginHorizontal: STAT_DIVIDER_MARGIN,
  },
  pendingSection: {
    marginTop: PENDING_SECTION_MARGIN,
    marginBottom: PENDING_SECTION_MARGIN,
    gap: PENDING_SECTION_GAP,
  },
  pendingTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pendingPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: PENDING_PILL_PADDING_X,
    paddingVertical: PENDING_PILL_PADDING_Y,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingSpinner: {
    marginRight: PENDING_SPINNER_MARGIN,
  },
  pendingPillText: {
    ...Typography.caption,
    fontSize: PENDING_TEXT_SIZE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: EXERCISE_COUNT_SIZE,
  },
  emptyDateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: EMPTY_CONTAINER_PADDING_Y,
    paddingHorizontal: EMPTY_CONTAINER_PADDING_X,
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyDateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: BODY_TEXT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    marginTop: EMPTY_TEXT_MARGIN,
  },
  logPastButton: {
    marginTop: LOG_PAST_MARGIN,
    paddingVertical: LOG_PAST_PADDING_Y,
    paddingHorizontal: LOG_PAST_PADDING_X,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    // borderColor now applied via buttonStyles (colors.accentBorder)
  },
  logPastButtonPressed: {
    // backgroundColor now applied via buttonStyles (colors.accentOverlay)
  },
  logPastButtonText: {
    ...Typography.labelSmall,
    // color now applied via inline styles (colors.accent)
    fontWeight: '600',
    fontSize: LOG_PAST_TEXT_SIZE,
  },
});
