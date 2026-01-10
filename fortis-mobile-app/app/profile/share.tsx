import { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeftIcon, TrophyIcon } from 'react-native-heroicons/outline';
import type { RefObject } from 'react';
import { addDays, format, startOfDay, startOfWeek, subDays } from 'date-fns';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useActivityHeatmap } from '@/src/hooks/useActivityHeatmap';
import { useTopPersonalRecords } from '@/src/hooks/useTopPersonalRecords';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getMuscleCategory, normalizeMuscle, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { getExerciseById } from '@/src/services/exerciseService';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';

type ShareType = 'activity' | 'monthly' | 'signature' | 'personal_records';

type MonthlyStats = {
  totalVolume: number;
  totalWorkouts: number;
  totalTimeSeconds: number;
  isLoading: boolean;
};

type SignatureSummary = {
  title: string;
  subtitle: string;
  stats: Array<{ label: string; value: string }>;
  isLoading: boolean;
};

type SignatureExercise = {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
};

const HEADER_PADDING = scale(Spacing.lg);
const SECTION_GAP = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const HEATMAP_CELL = 12;
const HEATMAP_GAP = 4;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const formatVolume = (volume: number, units: 'imperial' | 'metric'): string => {
  const unit = units === 'metric' ? 'kg' : 'lbs';
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M ${unit}`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K ${unit}`;
  }
  return `${Math.round(volume)} ${unit}`;
};

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '0h';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const formatDecimal = (value: number, decimals = 1): string => {
  if (!Number.isFinite(value)) return '0';
  const rounded = value.toFixed(decimals);
  return rounded.replace(/\.0$/, '');
};

const withAlpha = (color: string, alpha: number): string => {
  if (!color.startsWith('#') || color.length !== 7) {
    return color;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


const resolveShareTitle = (type: ShareType): string => {
  switch (type) {
    case 'monthly':
      return 'Monthly recap';
    case 'signature':
      return 'Training signature';
    case 'personal_records':
      return 'Personal records';
    default:
      return 'Workout streak';
  }
};

export default function ProfileShareScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { type } = useLocalSearchParams<{ type?: ShareType }>();
  const shareType: ShareType = type === 'monthly' || type === 'signature' || type === 'personal_records'
    ? type
    : 'activity';
  const viewShotRef = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCaptureReady] = useState(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require('react-native-view-shot');
      return Boolean(module?.captureRef);
    } catch {
      return false;
    }
  });

  const { weeks, maxVolume, isLoading: activityLoading } = useActivityHeatmap(
    profile?.id,
    'rolling',
    10
  );
  const bodyType = useWorkoutStore((state) => state.bodyType);
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const personalRecords = useTopPersonalRecords(5);

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalVolume: 0,
    totalWorkouts: 0,
    totalTimeSeconds: 0,
    isLoading: true,
  });

  const [signatureSummary, setSignatureSummary] = useState<SignatureSummary>({
    title: 'Building momentum',
    subtitle: 'Log a few more sessions to reveal your signature.',
    stats: [],
    isLoading: true,
  });
  const [signatureExercises, setSignatureExercises] = useState<SignatureExercise[]>([]);
  const [signatureHasWorkouts, setSignatureHasWorkouts] = useState(false);

  const units = profile?.preferred_units || 'imperial';
  const unitLabel = units === 'metric' ? 'kg' : 'lbs';

  useEffect(() => {
    let isMounted = true;
    if (!isSupabaseConfigured() || !profile?.id) {
      setMonthlyStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const loadMonthly = async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const fromDate = subDays(weekStart, 7 * 3);
      const { data, error } = await supabase
        .from('weekly_workout_volume')
        .select('total_volume, workouts_count, total_time_seconds, week_start')
        .eq('user_id', profile.id)
        .gte('week_start', toIsoDate(fromDate))
        .lte('week_start', toIsoDate(weekStart));

      if (!isMounted) return;
      if (error || !data) {
        setMonthlyStats((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const totals = (data as Array<{
        total_volume: number | null;
        workouts_count: number | null;
        total_time_seconds: number | null;
      }>).reduce(
        (acc, row) => {
          acc.totalVolume += row.total_volume ?? 0;
          acc.totalWorkouts += row.workouts_count ?? 0;
          acc.totalTimeSeconds += row.total_time_seconds ?? 0;
          return acc;
        },
        { totalVolume: 0, totalWorkouts: 0, totalTimeSeconds: 0 }
      );

      setMonthlyStats({ ...totals, isLoading: false });
    };

    loadMonthly();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  useEffect(() => {
    let isMounted = true;
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const exerciseSetCounts = new Map<string, number>();

    completedSessions.forEach((session) => {
      const sessionDate = startOfDay(new Date(session.completedAt ?? session.startedAt));
      if (sessionDate < weekStart || sessionDate > today) return;

      session.exercises.forEach((exercise) => {
        const workingSets = exercise.sets.filter(
          (set) => set.isCompleted && set.setType !== 'warmup' && (set.reps ?? 0) > 0
        );
        if (workingSets.length === 0) return;
        exerciseSetCounts.set(
          exercise.exerciseId,
          (exerciseSetCounts.get(exercise.exerciseId) ?? 0) + workingSets.length
        );
      });
    });

    const exerciseIds = Array.from(exerciseSetCounts.keys());
    if (exerciseIds.length === 0) {
      if (!isMounted) return;
      setSignatureExercises([]);
      setSignatureHasWorkouts(false);
      setSignatureSummary({
        title: 'Building momentum',
        subtitle: 'Log a few more sessions to reveal your signature.',
        stats: [],
        isLoading: false,
      });
      return;
    }

    setSignatureHasWorkouts(true);
    setSignatureSummary((prev) => ({ ...prev, isLoading: true }));

    const loadSignature = async () => {
      const results = await Promise.all(exerciseIds.map((id) => getExerciseById(id)));
      if (!isMounted) return;

      const exercises = results
        .filter(Boolean)
        .map((exercise) => ({
          primaryMuscles: exercise!.primaryMuscles ?? [],
          secondaryMuscles: exercise!.secondaryMuscles ?? [],
        }));
      setSignatureExercises(exercises);
      setSignatureHasWorkouts(exercises.length > 0);

      let totalSets = 0;
      let pushSets = 0;
      let pullSets = 0;
      let legSets = 0;
      let coreSets = 0;

      results.forEach((exercise, index) => {
        if (!exercise) return;
        const setCount = exerciseSetCounts.get(exerciseIds[index]) ?? 0;
        if (setCount <= 0) return;

        const muscleGroups = new Set<MuscleKey>();
        exercise.primaryMuscles?.forEach((muscle) => {
          const key = normalizeMuscle(muscle);
          if (key) muscleGroups.add(key);
        });

        muscleGroups.forEach((group) => {
          totalSets += setCount;
          const category = getMuscleCategory(group);
          if (category === 'push') pushSets += setCount;
          if (category === 'pull') pullSets += setCount;
          if (category === 'legs') legSets += setCount;
          if (category === 'core') coreSets += setCount;
        });
      });

      if (totalSets < 8) {
        setSignatureSummary({
          title: 'Building momentum',
          subtitle: 'Log a few more sessions to reveal your signature.',
          stats: [],
          isLoading: false,
        });
        return;
      }

      const pushPullRatio = pullSets > 0 ? pushSets / pullSets : pushSets > 0 ? 2 : 1;
      const legShare = legSets / totalSets;
      const coreShare = coreSets / totalSets;

      let title = 'Balanced week';
      let subtitle = 'Your training was well-rounded across muscle groups.';
      if (legShare >= 0.45) {
        title = 'Lower-body focus';
        subtitle = 'Leg training carried most of the workload this week.';
      } else if (coreShare >= 0.3) {
        title = 'Core-focused week';
        subtitle = 'Core work led your training focus this week.';
      } else if (pushPullRatio > 1.3) {
        title = 'Push-focused week';
        subtitle = 'Push volume outweighed pull work this week.';
      } else if (pushPullRatio < 0.77) {
        title = 'Pull-focused week';
        subtitle = 'Pull volume outweighed push work this week.';
      }

      setSignatureSummary({
        title,
        subtitle,
        stats: [
          { label: 'Push sets', value: Math.round(pushSets).toString() },
          { label: 'Pull sets', value: Math.round(pullSets).toString() },
          { label: 'Leg sets', value: Math.round(legSets).toString() },
          { label: 'Core sets', value: Math.round(coreSets).toString() },
        ],
        isLoading: false,
      });
    };

    loadSignature();

    return () => {
      isMounted = false;
    };
  }, [completedSessions]);

  const gradientColors = isDark
    ? ['#0c1413', '#131c1b', '#0f1918']
    : ['#f4f7f6', '#eef1f1', '#f6f8f8'];
  const accentBase = colors.accent;

  const ViewShotComponent = isCaptureReady
    ? (require('react-native-view-shot').default as any)
    : null;

  const activeDays = useMemo(() => {
    return weeks.reduce(
      (count, week) => count + week.days.filter((day) => day.hasActivity).length,
      0
    );
  }, [weeks]);

  const activityStats = useMemo(() => {
    if (weeks.length === 0) {
      return { averageDays: 0, bestWeek: 0, activeWeeks: 0 };
    }
    let bestWeek = 0;
    let activeWeeks = 0;
    weeks.forEach((week) => {
      const count = week.days.filter((day) => day.hasActivity).length;
      if (count > bestWeek) bestWeek = count;
      if (count > 0) activeWeeks += 1;
    });
    return {
      averageDays: activeDays / weeks.length,
      bestWeek,
      activeWeeks,
    };
  }, [weeks, activeDays]);

  const activitySubtitle = useMemo(() => {
    if (weeks.length === 0) {
      return 'Recent weeks';
    }
    const start = addDays(new Date(), -(weeks.length * 7 - 1));
    const end = new Date();
    return `Last ${weeks.length} weeks · ${format(start, 'MMM d')}–${format(end, 'MMM d')}`;
  }, [weeks.length]);

  const monthlyStatTiles = useMemo(() => {
    if (monthlyStats.isLoading) return [];
    const workouts = monthlyStats.totalWorkouts;
    const averageVolume = workouts > 0 ? monthlyStats.totalVolume / workouts : 0;
    const averageTimeSeconds = workouts > 0 ? monthlyStats.totalTimeSeconds / workouts : 0;
    const workoutsPerWeek = workouts / 4;

    return [
      { label: 'Volume', value: formatVolume(monthlyStats.totalVolume, units) },
      { label: 'Workouts', value: workouts.toString() },
      { label: 'Time trained', value: formatTime(monthlyStats.totalTimeSeconds) },
      { label: 'Avg volume/workout', value: formatVolume(averageVolume, units) },
      { label: 'Avg time/workout', value: formatTime(averageTimeSeconds) },
      { label: 'Workouts/week', value: formatDecimal(workoutsPerWeek) },
    ];
  }, [monthlyStats, units]);

  const handleShare = async () => {
    if (!isCaptureReady || !viewShotRef.current) {
      setShareError('Share preview requires a dev client rebuild.');
      return;
    }
    setIsSharing(true);
    setShareError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { captureRef } = require('react-native-view-shot') as {
        captureRef: (ref: RefObject<any>, options?: { format?: string; quality?: number; result?: string }) => Promise<string>;
      };
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const title = resolveShareTitle(shareType);
      await Share.share(
        Platform.OS === 'ios'
          ? { url: uri, title }
          : { message: title, url: uri, title }
      );
    } catch (error) {
      setShareError('Could not generate the share image.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <ChevronLeftIcon color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Share</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewSection}>
            {isCaptureReady && ViewShotComponent ? (
              <ViewShotComponent ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.shareCard,
                    {
                      borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  collapsable={false}
                >
                  <View
                    style={[
                      styles.shareGlow,
                      { backgroundColor: colors.accent, opacity: isDark ? 0.16 : 0.12 },
                    ]}
                  />
                  <View style={styles.shareHeader}>
                    <Text style={[styles.brand, { color: colors.accent }]}>FORTIS</Text>
                    <Text style={[styles.weekLabel, { color: colors.textTertiary }]}>
                      {resolveShareTitle(shareType)}
                    </Text>
                  </View>

                  {shareType === 'activity' && (
                    <View style={styles.shareBlock}>
                      <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>
                        Workout streak
                      </Text>
                      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>
                        {activitySubtitle}
                      </Text>
                      <View style={styles.activityHeadline}>
                        <Text style={[styles.activityValue, { color: colors.accent }]}>
                          {activeDays}
                        </Text>
                        <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>
                          Lifting days
                        </Text>
                      </View>
                      <View style={styles.activityGridWrap}>
                        <View style={styles.activityGrid}>
                          {weeks.map((week, index) => (
                            <View key={`week-${index}`} style={styles.activityColumn}>
                              {week.days.map((day, dayIndex) => {
                                const intensity = maxVolume > 0 ? day.volume / maxVolume : 0;
                                const alpha = day.hasActivity ? Math.max(0.2, intensity) : 0.08;
                                const backgroundColor = day.hasActivity
                                  ? withAlpha(accentBase, Math.min(alpha, 1))
                                  : isDark
                                  ? 'rgba(255,255,255,0.08)'
                                  : 'rgba(0,0,0,0.06)';
                                return (
                                  <View
                                    key={`day-${index}-${dayIndex}`}
                                    style={[styles.activityCell, { backgroundColor }]}
                                  />
                                );
                              })}
                            </View>
                          ))}
                        </View>
                      </View>
                      <View style={styles.activityStatsRow}>
                        <View style={styles.activityStat}>
                          <Text style={[styles.activityStatValue, { color: colors.textPrimary }]}>
                            {formatDecimal(activityStats.averageDays)}
                          </Text>
                          <Text style={[styles.activityStatLabel, { color: colors.textSecondary }]}>
                            Avg lifts/week
                          </Text>
                        </View>
                        <View style={styles.activityStat}>
                          <Text style={[styles.activityStatValue, { color: colors.textPrimary }]}>
                            {activityStats.bestWeek}
                          </Text>
                          <Text style={[styles.activityStatLabel, { color: colors.textSecondary }]}>
                            Best week
                          </Text>
                        </View>
                        <View style={styles.activityStat}>
                          <Text style={[styles.activityStatValue, { color: colors.textPrimary }]}>
                            {activityStats.activeWeeks}
                          </Text>
                          <Text style={[styles.activityStatLabel, { color: colors.textSecondary }]}>
                            Active weeks
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {shareType === 'monthly' && (
                    <View style={styles.shareBlock}>
                      <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>
                        {format(new Date(), 'MMMM')} recap
                      </Text>
                      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>
                        Last 4 weeks of training
                      </Text>
                      {monthlyStats.isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.accent} size="small" />
                        </View>
                      ) : (
                        <View style={styles.statsGrid}>
                          {monthlyStatTiles.map((tile) => (
                            <View key={tile.label} style={styles.statsTile}>
                              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                                {tile.value}
                              </Text>
                              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                                {tile.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {shareType === 'signature' && (
                    <View style={styles.shareBlock}>
                      <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>
                        {signatureSummary.title}
                      </Text>
                      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>
                        {signatureSummary.subtitle}
                      </Text>
                      {signatureSummary.isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.accent} size="small" />
                        </View>
                      ) : (
                        <View style={styles.signatureRow}>
                          {signatureSummary.stats.map((stat) => (
                            <View key={stat.label} style={styles.signatureTile}>
                              <Text style={[styles.signatureValue, { color: colors.textPrimary }]}>
                                {stat.value}
                              </Text>
                              <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>
                                {stat.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {signatureSummary.isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.accent} size="small" />
                        </View>
                      ) : signatureHasWorkouts ? (
                        <View style={styles.signatureHeatmap}>
                          <MuscleHeatmap
                            exercises={signatureExercises}
                            gender={bodyType}
                            scale={0.45}
                            compact
                          />
                        </View>
                      ) : (
                        <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
                          Log a workout to reveal your muscle map.
                        </Text>
                      )}
                    </View>
                  )}

                  {shareType === 'personal_records' && (
                    <View style={styles.shareBlock}>
                      <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>
                        Personal records
                      </Text>
                      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>
                        {personalRecords.length > 0
                          ? 'Top lifts so far'
                          : 'Log workouts to capture PRs'}
                      </Text>
                      {personalRecords.length === 0 ? (
                        <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
                          No personal records yet.
                        </Text>
                      ) : (
                        <View style={styles.prList}>
                          {personalRecords.map((pr, index) => (
                            <View key={pr.exerciseId} style={styles.prRow}>
                              <View
                                style={[
                                  styles.prRankBadge,
                                  { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
                                ]}
                              >
                                <Text style={[styles.prRankText, { color: colors.textSecondary }]}>
                                  {index + 1}
                                </Text>
                              </View>
                              <View style={styles.prInfo}>
                                <Text style={[styles.prName, { color: colors.textPrimary }]} numberOfLines={1}>
                                  {pr.exerciseName}
                                </Text>
                                <Text style={[styles.prMeta, { color: colors.textSecondary }]}>
                                  {pr.maxWeight} {unitLabel} × {pr.reps} reps • {format(pr.date, 'MMM d')}
                                </Text>
                              </View>
                              {index < 3 && (
                                <TrophyIcon
                                  color={index === 0 ? '#fbbf24' : index === 1 ? '#a3a3a3' : '#cd7f32'}
                                  size={14}
                                  strokeWidth={2}
                                />
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.shareFooter}>
                    <Text style={[styles.shareHandle, { color: colors.textTertiary }]}>
                      fortis.app
                    </Text>
                  </View>
                </LinearGradient>
              </ViewShotComponent>
            ) : (
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shareCard,
                  {
                    borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                collapsable={false}
              >
                <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>
                  Share preview requires a dev client rebuild.
                </Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: colors.accentOverlay, borderColor: colors.accent },
              ]}
              onPress={handleShare}
              disabled={isSharing || !isCaptureReady}
              activeOpacity={0.8}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
              )}
            </TouchableOpacity>
            {!isCaptureReady && (
              <Text style={[styles.shareError, { color: colors.textTertiary }]}>
                Share preview requires a dev client rebuild.
              </Text>
            )}
            {shareError && (
              <Text style={[styles.shareError, { color: colors.error }]}>
                {shareError}
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HEADER_PADDING,
    paddingTop: scale(Spacing.sm),
    paddingBottom: scale(Spacing.sm),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    fontSize: moderateScale(16),
  },
  headerSpacer: {
    width: scale(36),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HEADER_PADDING,
    paddingBottom: scale(Spacing['4xl']),
    gap: SECTION_GAP,
  },
  previewSection: {
    alignItems: 'center',
  },
  shareCard: {
    width: scale(320),
    minHeight: scale(360),
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: scale(Spacing.lg),
    gap: scale(Spacing.md),
    overflow: 'hidden',
  },
  shareGlow: {
    position: 'absolute',
    top: -scale(60),
    right: -scale(40),
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 2,
    fontSize: moderateScale(13),
  },
  weekLabel: {
    fontSize: moderateScale(11),
  },
  shareBlock: {
    gap: scale(Spacing.sm),
  },
  shareTitle: {
    ...Typography.h3,
    fontSize: moderateScale(20),
  },
  shareSubtitle: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  shareFooter: {
    marginTop: 'auto',
  },
  shareHandle: {
    fontSize: moderateScale(10),
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  activityHeadline: {
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  activityValue: {
    fontSize: moderateScale(26),
    fontWeight: '700',
  },
  activityLabel: {
    fontSize: moderateScale(11),
  },
  activityGridWrap: {
    alignItems: 'center',
  },
  activityGrid: {
    flexDirection: 'row',
    gap: HEATMAP_GAP,
  },
  activityColumn: {
    gap: HEATMAP_GAP,
  },
  activityCell: {
    width: HEATMAP_CELL,
    height: HEATMAP_CELL,
    borderRadius: 3,
  },
  activityStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(Spacing.sm),
  },
  activityStat: {
    flex: 1,
    gap: scale(Spacing.xs),
  },
  activityStatValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  activityStatLabel: {
    fontSize: moderateScale(10),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(Spacing.md),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  statsTile: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: scale(Spacing.xs),
    alignItems: 'center',
  },
  statsValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  statsLabel: {
    fontSize: moderateScale(11),
    textAlign: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(Spacing.md),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  signatureHeatmap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(Spacing.sm),
  },
  emptyHint: {
    fontSize: moderateScale(11),
  },
  signatureTile: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: scale(Spacing.xs),
    alignItems: 'center',
  },
  signatureValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: moderateScale(11),
    textAlign: 'center',
  },
  prList: {
    gap: scale(Spacing.xs),
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(Spacing.xs),
  },
  prRankBadge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(Spacing.sm),
  },
  prRankText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  prInfo: {
    flex: 1,
    marginRight: scale(Spacing.xs),
  },
  prName: {
    ...Typography.caption,
    fontSize: moderateScale(11),
    marginBottom: scale(Spacing.xs),
  },
  prMeta: {
    fontSize: moderateScale(10),
  },
  actionsSection: {
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  shareButton: {
    height: scale(36),
    minWidth: scale(140),
    borderRadius: scale(18),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(Spacing.lg),
  },
  shareButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  shareError: {
    fontSize: moderateScale(11),
  },
  loadingContainer: {
    paddingVertical: scale(Spacing.md),
  },
});
