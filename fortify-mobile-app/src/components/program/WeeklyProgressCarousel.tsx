import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
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
  getSundayWeekStart,
  type WeekProgressDay,
} from '@/src/utils/workoutSchedule';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = scale(24);
const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const DAY_SIZE = scale(38);
const DAY_GAP = scale(8);

type WeeklyProgressCarouselProps = {
  scheduleDays: number[];
  sessions: WorkoutSession[];
  onEditSchedule: () => void;
};

type WeekPage = {
  key: string;
  anchorDate: Date;
};

export function WeeklyProgressCarousel({
  scheduleDays,
  sessions,
  onEditSchedule,
}: WeeklyProgressCarouselProps) {
  const { colors, isDark } = useTheme();
  const modalStyles = useModalStyles();
  const listRef = useRef<FlatList<WeekPage>>(null);
  const [anchorDate, setAnchorDate] = useState(() => getSundayWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<WeekProgressDay | null>(null);
  const headerDateLabel = useMemo(() => format(new Date(), 'MMM d'), []);

  const pages = useMemo<WeekPage[]>(
    () => [
      { key: 'previous', anchorDate: addDays(anchorDate, -7) },
      { key: 'current', anchorDate },
      { key: 'next', anchorDate: addDays(anchorDate, 7) },
    ],
    [anchorDate]
  );

  const streak = useMemo(
    () => getScheduledWorkoutDayStreak({ scheduleDays, sessions }),
    [scheduleDays, sessions]
  );

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

  const renderWeek = ({ item }: { item: WeekPage }) => {
    const weekDays = buildWeekProgressDays({
      anchorDate: item.anchorDate,
      scheduleDays,
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
                        ? colors.accent
                        : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                      borderStyle: isScheduledPending ? 'dashed' : 'solid',
                    },
                    day.isToday && { borderColor: colors.textPrimary },
                  ]}
                >
                  {isComplete ? (
                    <CheckIcon color={colors.white} size={20} strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.dateLabel,
                        { color: day.isScheduled ? colors.accent : colors.textTertiary },
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
          <View style={styles.streakInline}>
            <Text style={[styles.streakText, { color: colors.textPrimary }]}>
              {streak}
            </Text>
            <FireIcon color="#FF4D4D" size={20} strokeWidth={2.4} />
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
        width={360}
      >
        {selectedDay ? (
          <>
            <Text style={[styles.detailStatus, { color: colors.textSecondary }]}>
              {selectedDay.completedSessions.length > 0
                ? 'Workout completed'
                : selectedDay.isScheduled
                  ? 'Scheduled workout day'
                  : 'Rest day'}
            </Text>
            <View style={styles.detailList}>
              {selectedDay.completedSessions.length > 0 ? (
                selectedDay.completedSessions.map((session) => (
                  <View
                    key={session.localId}
                    style={[
                      styles.detailWorkoutRow,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    <Text style={[styles.detailWorkoutName, { color: colors.textPrimary }]}>
                      {session.name}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.detailEmpty, { color: colors.textTertiary }]}>
                  No completed workouts logged for this day.
                </Text>
              )}
            </View>

            <View style={modalStyles.actions}>
              <Pressable
                onPress={() => setSelectedDay(null)}
                style={({ pressed }) => [
                  modalStyles.cancelButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={modalStyles.cancelButtonText}>Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedDay(null);
                  onEditSchedule();
                }}
                style={({ pressed }) => [
                  modalStyles.successButton,
                  pressed && modalStyles.buttonPressed,
                ]}
              >
                <Text style={modalStyles.successButtonText}>Edit Schedule</Text>
              </Pressable>
            </View>
          </>
        ) : null}
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
  },
  streakText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(20),
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
  detailList: {
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  detailWorkoutRow: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  detailWorkoutName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  detailEmpty: {
    textAlign: 'center',
    fontSize: moderateScale(13),
    fontWeight: '500',
    lineHeight: moderateScale(20),
  },
});
