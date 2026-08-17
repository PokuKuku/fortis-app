import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { addDays, format } from 'date-fns';
import { FireIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';
import type { WorkoutSession } from '@/src/types/workout';
import {
  buildWeekProgressDays,
  getScheduledWorkoutDayStreak,
  getScheduleDaysForDate,
  getSundayWeekStart,
  isStreakDateProtected,
  type WeekProgressDay,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { ACCENT_COLORS } from '@/src/utils/accentColors';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { AnimatedStreakCounter } from '@/src/components/program/AnimatedStreakCounter';
import { AnimatedDayCompletion } from '@/src/components/program/AnimatedDayCompletion';
import { PENDING_HOME_WORKOUT_CELEBRATION_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem } from '@/src/utils/scopedStorage';
import { StreakPercentileCelebrationModal } from '@/src/components/retention/StreakPercentileCelebrationModal';
import Reanimated, { ZoomIn } from 'react-native-reanimated';
import { useDevHomeTestControlsVisibility } from '@/src/hooks/useDevHomeTestControlsVisibility';
import { FrostSnowflakeIcon } from '@/src/components/program/FrostSnowflakeIcon';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = scale(24);
const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const DAY_SIZE = scale(38);
const DAY_GAP = scale(8);
const STREAK_PAUSES_PER_MONTH = 3;

const buildDayPopIn = (index: number) =>
  ZoomIn
    .delay(index * 55)
    .springify()
    .damping(17)
    .stiffness(190)
    .mass(0.55);

type WeeklyProgressCarouselProps = {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  isFocused?: boolean;
  startupRevealComplete?: boolean;
  deferMilestoneCelebration?: boolean;
  onEditSchedule: () => void;
};

type WeekPage = {
  key: string;
  anchorDate: Date;
};

type DevCompletionPreview = {
  dateKey: string;
  isComplete: boolean;
};

type PendingHomeCelebration = {
  sessionLocalId: string;
  completedAt: string;
};

function formatSetSummary(reps: number | null, weight: number | null, unit?: string | null): string {
  const repsLabel = reps === null ? '-- reps' : `${reps} reps`;
  const resolvedUnit = unit === 'kg' ? 'kg' : 'lbs';
  const weightLabel = weight === null
    ? `-- ${resolvedUnit}`
    : `${Number.isInteger(weight) ? weight : weight.toFixed(1)} ${resolvedUnit}`;

  return `${repsLabel} × ${weightLabel}`;
}

function getNextScheduledWorkoutDate({
  scheduleDays,
  scheduleHistory,
  today = new Date(),
}: {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  today?: Date;
}): Date | null {
  for (let offset = 0; offset <= 14; offset += 1) {
    const date = addDays(today, offset);
    const activeSchedule = new Set(getScheduleDaysForDate({ date, scheduleDays, scheduleHistory }));
    if (activeSchedule.size === 0 || activeSchedule.has(date.getDay())) {
      return date;
    }
  }

  return null;
}

export function WeeklyProgressCarousel({
  scheduleDays,
  scheduleHistory = [],
  sessions,
  isFocused = true,
  startupRevealComplete = true,
  deferMilestoneCelebration = false,
  onEditSchedule,
}: WeeklyProgressCarouselProps) {
  const { colors, isDark } = useTheme();
  const { visible: showDevTestControls } = useDevHomeTestControlsVisibility();
  const { isPro, runProFeature } = useProFeatureGate();
  const isStreakPaused = useWorkoutStore(s => s.isStreakPaused);
  const streakPausedAt = useWorkoutStore(s => s.streakPausedAt);
  const pausedStreakCount = useWorkoutStore(s => s.pausedStreakCount);
  const streakPausesUsedThisMonth = useWorkoutStore(s => s.streakPausesUsedThisMonth);
  const streakPausePeriods = useWorkoutStore(s => s.streakPausePeriods);
  const streakFreezePassAvailable = useWorkoutStore(s => s.streakFreezePassAvailable);
  const pauseStreak = useWorkoutStore(s => s.pauseStreak);
  const resumeStreak = useWorkoutStore(s => s.resumeStreak);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const modalStyles = useModalStyles();
  const listRef = useRef<FlatList<WeekPage>>(null);
  const editScheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeCelebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledCelebrationRef = useRef<string | null>(null);
  const shouldAnimateStartupDaysRef = useRef(!startupRevealComplete);
  const [anchorDate, setAnchorDate] = useState(() => getSundayWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<WeekProgressDay | null>(null);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);
  const [devStreakBoost, setDevStreakBoost] = useState(0);
  const [devCompletionPreview, setDevCompletionPreview] = useState<DevCompletionPreview | null>(null);
  const [homeCompletionPreview, setHomeCompletionPreview] = useState<DevCompletionPreview | null>(null);
  const [homeStreakPreview, setHomeStreakPreview] = useState<number | null>(null);
  const [pendingHomeCelebration, setPendingHomeCelebration] = useState<PendingHomeCelebration | null>(null);
  const [milestoneStreak, setMilestoneStreak] = useState(1);
  const [isMilestoneVisible, setIsMilestoneVisible] = useState(false);
  const [milestoneDateKey, setMilestoneDateKey] = useState<string | null>(null);
  const [isDevMilestonePreview, setIsDevMilestonePreview] = useState(false);
  const [nextDevMilestoneStreak, setNextDevMilestoneStreak] = useState(1);
  const [homeCelebrationToken, setHomeCelebrationToken] = useState<number | null>(null);
  const headerDateLabel = useMemo(() => format(new Date(), 'MMM d'), []);
  const detailModalWidth = Math.max(1, Math.min(360, windowWidth - Spacing.lg * 2));
  const streakModalWidth = Math.max(1, Math.min(380, windowWidth - Spacing.lg * 2));
  const detailScrollMaxHeight = Math.max(180, Math.min(scale(360), Math.round(windowHeight * 0.42)));

  useEffect(() => () => {
    if (editScheduleTimeoutRef.current) {
      clearTimeout(editScheduleTimeoutRef.current);
    }
    if (completionPreviewTimeoutRef.current) {
      clearTimeout(completionPreviewTimeoutRef.current);
    }
    if (homeCelebrationTimeoutRef.current) {
      clearTimeout(homeCelebrationTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (startupRevealComplete && shouldAnimateStartupDaysRef.current) {
      // The entering animation is only for the first render revealed by a cold
      // start. Consume it after that commit so newly mounted swipe pages do not
      // replay the same pop-in.
      shouldAnimateStartupDaysRef.current = false;
    }
  }, [startupRevealComplete]);

  useEffect(() => {
    if (!isFocused) return;
    let isMounted = true;

    const loadPendingCelebration = async () => {
      try {
        const raw = await getScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
        if (!isMounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<PendingHomeCelebration>;
        if (
          typeof parsed.sessionLocalId !== 'string'
          || typeof parsed.completedAt !== 'string'
          || Number.isNaN(new Date(parsed.completedAt).getTime())
        ) {
          await removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
          return;
        }
        setPendingHomeCelebration({
          sessionLocalId: parsed.sessionLocalId,
          completedAt: parsed.completedAt,
        });
      } catch (error) {
        console.warn('Failed to load pending home workout celebration:', error);
      }
    };

    void loadPendingCelebration();
    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const pages = useMemo<WeekPage[]>(
    () => [
      { key: 'previous', anchorDate: addDays(anchorDate, -7) },
      { key: 'current', anchorDate },
      { key: 'next', anchorDate: addDays(anchorDate, 7) },
    ],
    [anchorDate]
  );

  const streak = useMemo(
    () => getScheduledWorkoutDayStreak({
      scheduleDays,
      scheduleHistory,
      sessions,
      streakPausePeriods,
    }),
    [scheduleDays, scheduleHistory, sessions, streakPausePeriods]
  );
  const displayedStreak = isStreakPaused && pausedStreakCount !== null
    ? pausedStreakCount
    : streak;
  const animatedDisplayedStreak = displayedStreak + devStreakBoost;
  const celebrationDisplayedStreak = homeStreakPreview ?? animatedDisplayedStreak;
  const nextScheduledWorkoutDate = useMemo(
    () => getNextScheduledWorkoutDate({ scheduleDays, scheduleHistory }),
    [scheduleDays, scheduleHistory]
  );
  const nextScheduledWorkoutLabel = nextScheduledWorkoutDate
    ? format(nextScheduledWorkoutDate, 'EEE, MMM d')
    : 'Any day';
  const streakPausedLabel = streakPausedAt
    ? format(new Date(streakPausedAt), 'MMM d')
    : 'today';
  const streakPausesRemaining = Math.max(0, STREAK_PAUSES_PER_MONTH - streakPausesUsedThisMonth);
  const canPauseStreak = isStreakPaused || streakPausesRemaining > 0;

  const playHomeCelebration = useCallback((
    completedDateKey: string,
    { incrementDevStreak = false, consumePending = true } = {}
  ) => {
    if (homeCelebrationTimeoutRef.current) {
      clearTimeout(homeCelebrationTimeoutRef.current);
    }
    setHomeCompletionPreview({ dateKey: completedDateKey, isComplete: false });
    setHomeStreakPreview(
      incrementDevStreak
        ? animatedDisplayedStreak
        : Math.max(0, animatedDisplayedStreak - 1)
    );

    homeCelebrationTimeoutRef.current = setTimeout(() => {
      homeCelebrationTimeoutRef.current = null;
      setHomeCompletionPreview({ dateKey: completedDateKey, isComplete: true });
      setHomeCelebrationToken((current) => (current ?? 0) + 1);
      if (incrementDevStreak) {
        setDevStreakBoost((current) => current + 1);
      }
      setHomeStreakPreview(null);
      if (consumePending) {
        setPendingHomeCelebration(null);
        void removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
      }
    }, 180);
  }, [animatedDisplayedStreak]);

  useEffect(() => {
    if (
      !isFocused
      || deferMilestoneCelebration
      || !pendingHomeCelebration
      || handledCelebrationRef.current === pendingHomeCelebration.sessionLocalId
    ) {
      return;
    }

    const completedSession = sessions.find(
      (session) => session.localId === pendingHomeCelebration.sessionLocalId
    );
    if (!completedSession) return;

    const completedAt = new Date(pendingHomeCelebration.completedAt);
    const completedDateKey = format(completedAt, 'yyyy-MM-dd');
    const hasEarlierCompletionThatDay = sessions.some((session) => (
      session.localId !== completedSession.localId
      && session.completedAt
      && format(session.completedAt, 'yyyy-MM-dd') === completedDateKey
      && session.completedAt.getTime() < completedAt.getTime()
    ));
    if (hasEarlierCompletionThatDay) {
      handledCelebrationRef.current = pendingHomeCelebration.sessionLocalId;
      void removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
      setPendingHomeCelebration(null);
      return;
    }

    const activeSchedule = new Set(
      getScheduleDaysForDate({ date: completedAt, scheduleDays, scheduleHistory })
    );
    const isScheduledCompletion = activeSchedule.size === 0 || activeSchedule.has(completedAt.getDay());

    handledCelebrationRef.current = pendingHomeCelebration.sessionLocalId;
    if (!isScheduledCompletion) {
      void removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY);
      setPendingHomeCelebration(null);
      return;
    }

    setAnchorDate(getSundayWeekStart(completedAt));
    setMilestoneDateKey(completedDateKey);
    if (streak >= 1 && streak <= 10) {
      // Reset the hidden home UI while the milestone is covering it so both
      // transitions are guaranteed to begin only after Continue is pressed.
      setHomeCompletionPreview({ dateKey: completedDateKey, isComplete: false });
      setHomeStreakPreview(Math.max(0, animatedDisplayedStreak - 1));
      setIsDevMilestonePreview(false);
      setMilestoneStreak(streak);
      setIsMilestoneVisible(true);
      return;
    }

    playHomeCelebration(completedDateKey);
  }, [
    animatedDisplayedStreak,
    deferMilestoneCelebration,
    isFocused,
    pendingHomeCelebration,
    playHomeCelebration,
    scheduleDays,
    scheduleHistory,
    sessions,
    streak,
  ]);

  useEffect(() => {
    if (!deferMilestoneCelebration || !isMilestoneVisible) return;
    setIsMilestoneVisible(false);
    handledCelebrationRef.current = null;
  }, [deferMilestoneCelebration, isMilestoneVisible]);

  const handleMomentumEnd = (offsetX: number) => {
    const pageIndex = Math.round(offsetX / CAROUSEL_WIDTH);
    if (pageIndex === 0) {
      setAnchorDate((current) => addDays(current, -7));
      requestAnimationFrame(() => listRef.current?.scrollToIndex({ index: 1, animated: false }));
    }
    if (pageIndex === 2) {
      setAnchorDate((current) => addDays(current, 7));
      requestAnimationFrame(() => listRef.current?.scrollToIndex({ index: 1, animated: false }));
    }
  };

  const handleEditSchedulePress = () => {
    setSelectedDay(null);
    if (editScheduleTimeoutRef.current) {
      clearTimeout(editScheduleTimeoutRef.current);
    }
    editScheduleTimeoutRef.current = setTimeout(() => {
      editScheduleTimeoutRef.current = null;
      onEditSchedule();
    }, 260);
  };

  const handleWorkoutStreakUpgradePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    void runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.workoutStreak,
        params: {
          source: 'weekly_progress',
          action: 'view_workout_streak',
          streak,
        },
      },
      () => true,
    );
  };

  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setIsStreakModalVisible(true);
  };

  const handleStreakPauseToggle = () => {
    if (!canPauseStreak) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    if (isStreakPaused) {
      void resumeStreak();
      return;
    }
    void pauseStreak(streak);
  };

  const handleDevCompletionTest = () => {
    const visibleWeekDays = buildWeekProgressDays({
      anchorDate,
      scheduleDays,
      scheduleHistory,
      sessions,
    });
    const targetDay = visibleWeekDays.find((day) => day.isToday)
      ?? visibleWeekDays.find((day) => day.isScheduled)
      ?? visibleWeekDays[0];
    if (!targetDay) return;

    if (completionPreviewTimeoutRef.current) {
      clearTimeout(completionPreviewTimeoutRef.current);
    }
    setDevCompletionPreview({ dateKey: targetDay.dateKey, isComplete: false });
    completionPreviewTimeoutRef.current = setTimeout(() => {
      completionPreviewTimeoutRef.current = null;
      setDevCompletionPreview({ dateKey: targetDay.dateKey, isComplete: true });
    }, 100);
  };

  const handleDevMilestoneTest = () => {
    const visibleWeekDays = buildWeekProgressDays({
      anchorDate,
      scheduleDays,
      scheduleHistory,
      sessions,
    });
    const targetDay = visibleWeekDays.find((day) => day.isToday)
      ?? visibleWeekDays.find((day) => day.isScheduled)
      ?? visibleWeekDays[0];
    if (!targetDay) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setMilestoneDateKey(targetDay.dateKey);
    setHomeCompletionPreview({ dateKey: targetDay.dateKey, isComplete: false });
    setHomeStreakPreview(animatedDisplayedStreak);
    setIsDevMilestonePreview(true);
    setMilestoneStreak(nextDevMilestoneStreak);
    setIsMilestoneVisible(true);
    setNextDevMilestoneStreak((current) => current >= 10 ? 1 : current + 1);
  };

  const handleMilestoneContinue = () => {
    const completedDateKey = milestoneDateKey;
    const wasDevPreview = isDevMilestonePreview;
    setIsMilestoneVisible(false);
    setIsDevMilestonePreview(false);
    if (!completedDateKey) return;

    playHomeCelebration(completedDateKey, {
      incrementDevStreak: wasDevPreview,
      consumePending: !wasDevPreview,
    });
  };

  const renderWeek = ({ item }: { item: WeekPage }) => {
    const today = new Date();
    const weekDays = buildWeekProgressDays({
      anchorDate: item.anchorDate,
      scheduleDays,
      scheduleHistory,
      sessions,
      today,
    });

    return (
      <View style={[styles.weekPage, { width: CAROUSEL_WIDTH }]}>
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const completionPreview = homeCompletionPreview ?? devCompletionPreview;
            const isComplete = completionPreview?.dateKey === day.dateKey
              ? completionPreview.isComplete
              : day.completedSessions.length > 0;
            const isFrozen = day.isScheduled
              && day.isMissed
              && !isComplete
              && isStreakDateProtected(day.dateKey, streakPausePeriods, today);
            const isScheduledPending = day.isScheduled && !isComplete && !isFrozen;

            if (!startupRevealComplete) {
              return <View key={day.dateKey} style={styles.dayAnimationSlot} />;
            }

            return (
              <Reanimated.View
                key={day.dateKey}
                entering={shouldAnimateStartupDaysRef.current ? buildDayPopIn(index) : undefined}
                style={styles.dayAnimationSlot}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFrozen
                    ? `${format(day.date, 'EEEE, MMM d')}, frozen scheduled workout day`
                    : format(day.date, 'EEEE, MMM d')}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                    setSelectedDay(day);
                  }}
                  style={styles.dayColumn}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: day.isToday ? colors.textPrimary : colors.textSecondary },
                    ]}
                  >
                    {day.dayLabel}
                  </Text>
                  {isFrozen ? (
                    <View style={styles.frozenDayMark}>
                      <FrostSnowflakeIcon size={scale(38)} />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: isComplete
                            ? colors.accent
                            : colors.glassBackground,
                          borderColor: isScheduledPending
                            ? day.isMissed ? colors.error : colors.accent
                            : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                          borderStyle: isScheduledPending ? 'dashed' : 'solid',
                        },
                        day.isToday && !isComplete && { borderColor: colors.textPrimary },
                      ]}
                    >
                      <AnimatedDayCompletion
                        isComplete={isComplete}
                        dateLabel={day.dateLabel}
                        dateColor={day.isMissed ? colors.error : day.isScheduled ? colors.accent : colors.textTertiary}
                        celebrationKey={
                          homeCompletionPreview?.dateKey === day.dateKey
                            ? homeCelebrationToken
                            : null
                        }
                      />
                    </View>
                  )}
                </Pressable>
              </Reanimated.View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{headerDateLabel}</Text>
          <View style={styles.headerActions}>
            {__DEV__ && showDevTestControls ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Test streak percentile celebration"
                  onPress={handleDevMilestoneTest}
                  style={({ pressed }) => [
                    styles.streakTestButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
                    },
                    pressed && styles.streakInlinePressed,
                  ]}
                >
                  <Text style={[styles.streakTestText, { color: colors.textSecondary }]}>🔥 Test</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Test completed day animation"
                  onPress={handleDevCompletionTest}
                  style={({ pressed }) => [
                    styles.streakTestButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
                    },
                    pressed && styles.streakInlinePressed,
                  ]}
                >
                  <Text style={[styles.streakTestText, { color: colors.textSecondary }]}>✓ Test</Text>
                </Pressable>
              </>
            ) : null}
            {isPro ? (
              <View style={styles.streakControls}>
                {__DEV__ && showDevTestControls ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Test streak increase"
                    onPress={() => setDevStreakBoost((current) => current + 1)}
                    style={({ pressed }) => [
                      styles.streakTestButton,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                        borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)',
                      },
                      pressed && styles.streakInlinePressed,
                    ]}
                  >
                    <Text style={[styles.streakTestText, { color: colors.textSecondary }]}>+1 Test</Text>
                  </Pressable>
                ) : null}
                <TourAnchor id={TOUR_ANCHOR_IDS.streakCounter}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isStreakPaused ? 'Workout streak paused' : 'Open workout streak options'}
                    onPress={handleStreakPress}
                    style={({ pressed }) => [
                      styles.streakInline,
                      pressed && styles.streakInlinePressed,
                    ]}
                  >
                    <AnimatedStreakCounter
                      value={celebrationDisplayedStreak}
                      isPaused={isStreakPaused}
                      textStyle={styles.streakText}
                      celebrationKey={homeCelebrationToken}
                    />
                  </Pressable>
                </TourAnchor>
              </View>
            ) : (
              <TourAnchor id={TOUR_ANCHOR_IDS.streakCounter}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go Pro to view workout streak"
                  onPress={handleWorkoutStreakUpgradePress}
                  style={({ pressed }) => [
                    styles.streakUpgradeButton,
                    pressed && styles.streakUpgradeButtonPressed,
                  ]}
                >
                  <Text style={styles.streakUpgradeText}>Go Pro</Text>
                </Pressable>
              </TourAnchor>
            )}
          </View>
        </View>
        <FlatList
          ref={listRef}
          data={pages}
          renderItem={renderWeek}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={1}
          getItemLayout={(_, index) => ({
            length: CAROUSEL_WIDTH,
            offset: CAROUSEL_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(event) => handleMomentumEnd(event.nativeEvent.contentOffset.x)}
        />
      </View>

      <BaseModal
        visible={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay.date, 'EEEE, MMM d') : 'Workout Day'}
        width={detailModalWidth}
        showCloseButton={false}
      >
        {selectedDay ? (
          <>
            <Text style={[styles.detailStatus, { color: colors.textSecondary }]}>
              {selectedDay.completedSessions.length > 0
                ? 'Workout completed'
                : selectedDay.isScheduled
                  && selectedDay.isMissed
                  && isStreakDateProtected(selectedDay.dateKey, streakPausePeriods, new Date())
                  ? 'Scheduled workout frozen'
                : selectedDay.isMissed
                  ? 'Scheduled workout missed'
                : selectedDay.isScheduled
                  ? 'Scheduled workout day'
                  : 'Rest day'}
            </Text>
            <ScrollView
              style={[styles.detailScroll, { maxHeight: detailScrollMaxHeight }]}
              contentContainerStyle={styles.detailList}
              showsVerticalScrollIndicator={false}
            >
              {selectedDay.completedSessions.length > 0 ? (
                selectedDay.completedSessions.map((session) => {
                  const performedExercises = session.exercises
                    .map((exercise) => ({
                      ...exercise,
                      sets: exercise.sets.filter((set) => (
                        set.isCompleted
                        && (set.reps !== null || set.weight !== null)
                      )),
                    }))
                    .filter((exercise) => exercise.sets.length > 0);

                  return (
                  <View
                    key={session.localId}
                    style={[
                      styles.detailSessionCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    <Text style={[styles.detailSessionName, { color: colors.textPrimary }]}>
                      {session.name}
                    </Text>
                    {performedExercises.length > 0 ? (
                      performedExercises.map((exercise) => (
                        <View key={exercise.localId} style={styles.detailExerciseBlock}>
                          <Text style={[styles.detailExerciseName, { color: colors.accent }]}>
                            {exercise.exerciseName}
                          </Text>
                          {exercise.sets.map((set, index) => (
                            <View key={set.localId} style={styles.detailSetRow}>
                              <Text style={[styles.detailSetNumber, { color: colors.textSecondary }]}>
                                {index + 1}
                              </Text>
                              <Text style={[styles.detailSetText, { color: colors.textPrimary }]}>
                                {formatSetSummary(set.reps, set.weight, set.weightUnit)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.detailEmpty, { color: colors.textTertiary }]}>
                        No completed set details saved for this workout.
                      </Text>
                    )}
                  </View>
                  );
                })
              ) : (
                <Text style={[styles.detailEmpty, { color: colors.textTertiary }]}>
                  No completed workouts logged for this day.
                </Text>
              )}
            </ScrollView>

            <View style={[modalStyles.actions, styles.detailActions]}>
              <Pressable
                onPress={() => setSelectedDay(null)}
                style={({ pressed }) => [
                  modalStyles.cancelButton,
                  styles.detailActionButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={[modalStyles.cancelButtonText, styles.detailActionText]}>Close</Text>
              </Pressable>
              <Pressable
                onPress={handleEditSchedulePress}
                style={({ pressed }) => [
                  modalStyles.successButton,
                  styles.detailActionButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={[modalStyles.successButtonText, styles.detailActionText]}>Edit Schedule</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </BaseModal>

      <BaseModal
        visible={isStreakModalVisible}
        onClose={() => setIsStreakModalVisible(false)}
        title="Workout Streak"
        titleStyle={styles.streakModalTitle}
        showCloseButton={false}
        width={streakModalWidth}
      >
        <View style={styles.streakModalHero}>
          <View style={styles.streakModalInline}>
            <Text style={[styles.streakModalNumber, { color: colors.textPrimary }]}>
              {displayedStreak}
            </Text>
            <FireIcon
              color={isStreakPaused ? colors.textTertiary : '#FF4D4D'}
              size={38}
              strokeWidth={2.4}
            />
          </View>
          <Text style={[styles.streakModalLabel, { color: colors.textSecondary }]}>
            {isStreakPaused ? `Paused since ${streakPausedLabel}` : 'Active workout streak'}
          </Text>
        </View>

        <View style={styles.streakInfoGrid}>
          <View
            style={[
              styles.streakInfoCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            ]}
          >
            <Text style={[styles.streakInfoLabel, { color: colors.textTertiary }]}>Status</Text>
            <Text style={[styles.streakInfoValue, { color: colors.textPrimary }]}>
              {isStreakPaused ? 'Paused' : 'Active'}
            </Text>
          </View>
          <View
            style={[
              styles.streakInfoCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            ]}
          >
            <Text style={[styles.streakInfoLabel, { color: colors.textTertiary }]}>Next day</Text>
            <Text style={[styles.streakInfoValue, { color: colors.textPrimary }]}>
              {nextScheduledWorkoutLabel}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.streakPauseAllowanceCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          ]}
        >
          <Text style={[styles.streakInfoLabel, { color: colors.textTertiary }]}>Pauses</Text>
          <Text style={[styles.streakInfoValue, { color: colors.textPrimary }]}>
            {streakPausesRemaining} left this month
          </Text>
          <Text style={[styles.streakPauseResetText, { color: colors.textTertiary }]}>
            Pauses reset next month.
          </Text>
        </View>

        <View
          style={[
            styles.streakPauseAllowanceCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
          ]}
        >
          <Text style={[styles.streakInfoLabel, { color: colors.textTertiary }]}>Earned freeze pass</Text>
          <Text style={[styles.streakInfoValue, { color: colors.textPrimary }]}>
            {streakFreezePassAvailable ? '1 ready' : 'Earn at a 5-workout streak'}
          </Text>
          <Text style={[styles.streakPauseResetText, { color: colors.textTertiary }]}>
            One pass can protect your next missed scheduled workout.
          </Text>
        </View>

        <View
          style={[
            styles.streakRules,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <Text style={[styles.streakRuleTitle, { color: colors.textPrimary }]}>
            Streak rules
          </Text>
          <Text style={[styles.streakRuleText, { color: colors.textSecondary }]}>
            Scheduled rest days do not break your streak. Pausing protects your streak while life gets in the way.
          </Text>
        </View>

        <View style={[modalStyles.actions, styles.streakActions]}>
          <Pressable
            onPress={() => setIsStreakModalVisible(false)}
            style={({ pressed }) => [
              modalStyles.cancelButton,
              styles.streakActionButton,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text style={[modalStyles.cancelButtonText, styles.detailActionText]}>Close</Text>
          </Pressable>
          <Pressable
            disabled={!canPauseStreak}
            onPress={handleStreakPauseToggle}
            style={({ pressed }) => [
              isStreakPaused ? modalStyles.successButton : modalStyles.warningButton,
              styles.streakActionButton,
              !canPauseStreak && styles.streakActionButtonDisabled,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text
              style={[
                isStreakPaused ? modalStyles.successButtonText : modalStyles.warningButtonText,
                styles.detailActionText,
                !canPauseStreak && { color: colors.textTertiary },
              ]}
            >
              {isStreakPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
        </View>
      </BaseModal>

      <StreakPercentileCelebrationModal
        visible={isMilestoneVisible}
        streak={milestoneStreak}
        onContinue={handleMilestoneContinue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: scale(12),
    marginBottom: scale(14),
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(24),
    letterSpacing: 1.2,
  },
  weekPage: {
    paddingVertical: scale(2),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scale(6),
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  streakControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  streakTestButton: {
    minHeight: scale(26),
    paddingHorizontal: scale(8),
    borderRadius: scale(13),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTestText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(9),
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingTop: scale(2),
    minHeight: scale(30),
    paddingHorizontal: scale(8),
    borderRadius: scale(15),
    marginRight: scale(-8),
  },
  streakInlinePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  streakText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(20),
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  streakUpgradeButton: {
    minHeight: scale(30),
    paddingHorizontal: scale(12),
    borderRadius: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_COLORS.amber.base,
    borderWidth: 1,
    borderColor: ACCENT_COLORS.amber.light,
  },
  streakUpgradeButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  streakUpgradeText: {
    color: '#1C1403',
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(11),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DAY_GAP,
  },
  dayAnimationSlot: {
    flex: 1,
  },
  dayColumn: {
    alignItems: 'center',
    gap: scale(6),
    flex: 1,
  },
  dayLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(11),
    letterSpacing: 1,
  },
  dayCircle: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frozenDayMark: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailStatus: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  detailScroll: {
    marginBottom: Spacing['2xl'],
  },
  detailList: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  detailSessionCard: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  detailSessionName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  detailExerciseBlock: {
    marginTop: Spacing.sm,
  },
  detailExerciseName: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  detailSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: scale(2),
  },
  detailSetNumber: {
    width: scale(18),
    textAlign: 'center',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  detailSetText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  detailEmpty: {
    textAlign: 'center',
    fontSize: moderateScale(13),
    fontWeight: '500',
    lineHeight: moderateScale(20),
  },
  detailActions: {
    flexWrap: 'wrap',
  },
  detailActionButton: {
    minWidth: scale(120),
  },
  detailActionText: {
    textAlign: 'center',
  },
  streakModalHero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  streakModalTitle: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streakModalInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
  },
  streakModalNumber: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(42),
    letterSpacing: 1,
    lineHeight: moderateScale(48),
  },
  streakModalLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginTop: scale(8),
    textAlign: 'center',
  },
  streakInfoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  streakInfoCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: scale(74),
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfoLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: scale(6),
    textAlign: 'center',
  },
  streakInfoValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    textAlign: 'center',
  },
  streakPauseAllowanceCard: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: scale(74),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  streakPauseResetText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    lineHeight: moderateScale(17),
    marginTop: scale(6),
    textAlign: 'center',
  },
  streakRules: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  streakRuleTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(13),
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: scale(6),
  },
  streakRuleText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    lineHeight: moderateScale(19),
  },
  streakActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  streakActionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: scale(52),
    justifyContent: 'center',
  },
  streakActionButtonDisabled: {
    opacity: 0.45,
  },
});
