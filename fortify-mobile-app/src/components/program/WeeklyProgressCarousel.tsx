import { useEffect, useMemo, useRef, useState } from 'react';
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
import { CheckIcon, FireIcon } from 'react-native-heroicons/outline';
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
  type WeekProgressDay,
  type WorkoutScheduleHistoryEntry,
} from '@/src/utils/workoutSchedule';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { ACCENT_COLORS } from '@/src/utils/accentColors';
import { useWorkoutStore } from '@/src/store/workoutStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = scale(24);
const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const DAY_SIZE = scale(38);
const DAY_GAP = scale(8);

type WeeklyProgressCarouselProps = {
  scheduleDays: number[];
  scheduleHistory?: WorkoutScheduleHistoryEntry[];
  sessions: WorkoutSession[];
  onEditSchedule: () => void;
};

type WeekPage = {
  key: string;
  anchorDate: Date;
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
  onEditSchedule,
}: WeeklyProgressCarouselProps) {
  const { colors, isDark } = useTheme();
  const { isPro, runProFeature } = useProFeatureGate();
  const isStreakPaused = useWorkoutStore(s => s.isStreakPaused);
  const streakPausedAt = useWorkoutStore(s => s.streakPausedAt);
  const pausedStreakCount = useWorkoutStore(s => s.pausedStreakCount);
  const pauseStreak = useWorkoutStore(s => s.pauseStreak);
  const resumeStreak = useWorkoutStore(s => s.resumeStreak);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const modalStyles = useModalStyles();
  const listRef = useRef<FlatList<WeekPage>>(null);
  const editScheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anchorDate, setAnchorDate] = useState(() => getSundayWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<WeekProgressDay | null>(null);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);
  const headerDateLabel = useMemo(() => format(new Date(), 'MMM d'), []);
  const detailModalWidth = Math.max(1, Math.min(360, windowWidth - Spacing.lg * 2));
  const streakModalWidth = Math.max(1, Math.min(380, windowWidth - Spacing.lg * 2));
  const detailScrollMaxHeight = Math.max(180, Math.min(scale(360), Math.round(windowHeight * 0.42)));

  useEffect(() => () => {
    if (editScheduleTimeoutRef.current) {
      clearTimeout(editScheduleTimeoutRef.current);
    }
  }, []);

  const pages = useMemo<WeekPage[]>(
    () => [
      { key: 'previous', anchorDate: addDays(anchorDate, -7) },
      { key: 'current', anchorDate },
      { key: 'next', anchorDate: addDays(anchorDate, 7) },
    ],
    [anchorDate]
  );

  const streak = useMemo(
    () => getScheduledWorkoutDayStreak({ scheduleDays, scheduleHistory, sessions }),
    [scheduleDays, scheduleHistory, sessions]
  );
  const displayedStreak = isStreakPaused && pausedStreakCount !== null
    ? pausedStreakCount
    : streak;
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    if (isStreakPaused) {
      void resumeStreak();
      return;
    }
    void pauseStreak(streak);
  };

  const renderWeek = ({ item }: { item: WeekPage }) => {
    const weekDays = buildWeekProgressDays({
      anchorDate: item.anchorDate,
      scheduleDays,
      scheduleHistory,
      sessions,
    });

    return (
      <View style={[styles.weekPage, { width: CAROUSEL_WIDTH }]}>
        <View style={styles.daysRow}>
          {weekDays.map((day) => {
            const isComplete = day.completedSessions.length > 0;
            const isScheduledPending = day.isScheduled && !isComplete;

            return (
              <Pressable
                key={day.dateKey}
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
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isComplete
                        ? colors.accent
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderColor: isScheduledPending
                        ? day.isMissed ? colors.error : colors.accent
                        : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                      borderStyle: isScheduledPending ? 'dashed' : 'solid',
                    },
                    day.isToday && !isComplete && { borderColor: colors.textPrimary },
                  ]}
                >
                  {isComplete ? (
                    <CheckIcon color={colors.accentForegroundOnFill} size={18} strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.dateLabel,
                        {
                          color: day.isMissed ? colors.error : day.isScheduled ? colors.accent : colors.textTertiary,
                        },
                      ]}
                    >
                      {day.dateLabel}
                    </Text>
                  )}
                </View>
              </Pressable>
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
          {isPro ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isStreakPaused ? 'Workout streak paused' : 'Open workout streak options'}
              onPress={handleStreakPress}
              style={({ pressed }) => [
                styles.streakInline,
                pressed && styles.streakInlinePressed,
              ]}
            >
              <Text style={[styles.streakText, { color: colors.textPrimary }]}>
                {displayedStreak}
              </Text>
              <FireIcon
                color={isStreakPaused ? colors.textTertiary : '#FF4D4D'}
                size={20}
                strokeWidth={2.4}
              />
            </Pressable>
          ) : (
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
          )}
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
        width={streakModalWidth}
      >
        <View style={styles.streakModalHero}>
          <View
            style={[
              styles.streakModalIcon,
              {
                backgroundColor: isStreakPaused
                  ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                  : 'rgba(255,77,77,0.12)',
                borderColor: isStreakPaused
                  ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
                  : 'rgba(255,77,77,0.3)',
              },
            ]}
          >
            <FireIcon
              color={isStreakPaused ? colors.textTertiary : '#FF4D4D'}
              size={34}
              strokeWidth={2.4}
            />
          </View>
          <Text style={[styles.streakModalNumber, { color: colors.textPrimary }]}>
            {displayedStreak}
          </Text>
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

        <View style={[modalStyles.actions, styles.detailActions]}>
          <Pressable
            onPress={() => setIsStreakModalVisible(false)}
            style={({ pressed }) => [
              modalStyles.cancelButton,
              styles.detailActionButton,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text style={[modalStyles.cancelButtonText, styles.detailActionText]}>Close</Text>
          </Pressable>
          <Pressable
            onPress={handleStreakPauseToggle}
            style={({ pressed }) => [
              isStreakPaused ? modalStyles.successButton : modalStyles.warningButton,
              styles.detailActionButton,
              pressed && modalStyles.buttonPressed,
            ]}
          >
            <Text
              style={[
                isStreakPaused ? modalStyles.successButtonText : modalStyles.warningButtonText,
                styles.detailActionText,
              ]}
            >
              {isStreakPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
        </View>
      </BaseModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(32),
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
  dateLabel: {
    fontSize: moderateScale(12),
    fontWeight: '800',
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
  streakModalIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  streakModalNumber: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(34),
    letterSpacing: 1,
  },
  streakModalLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginTop: scale(4),
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
    justifyContent: 'center',
  },
  streakInfoLabel: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: scale(6),
  },
  streakInfoValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  streakRules: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  streakRuleTitle: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: scale(6),
  },
  streakRuleText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    lineHeight: moderateScale(19),
  },
});
