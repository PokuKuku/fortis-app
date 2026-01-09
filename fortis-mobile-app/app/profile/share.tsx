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
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import type { RefObject } from 'react';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useActivityHeatmap } from '@/src/hooks/useActivityHeatmap';
import { useWeeklyMuscles } from '@/src/hooks/useWeeklyMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';

type ShareType = 'activity' | 'monthly' | 'signature';

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

const HEADER_PADDING = scale(Spacing.lg);
const SECTION_GAP = scale(Spacing.lg);
const CARD_RADIUS = scale(BorderRadius.xl);
const HEATMAP_CELL = 10;
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

const withAlpha = (color: string, alpha: number): string => {
  if (!color.startsWith('#') || color.length !== 7) {
    return color;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const normalizeGroup = (group: string): string => {
  const key = group.trim().toLowerCase();
  if (['middle back', 'upper back', 'lower back', 'lats', 'traps'].includes(key)) return 'back';
  if (['quadriceps', 'quads'].includes(key)) return 'quads';
  if (['glutes', 'gluteus maximus'].includes(key)) return 'glutes';
  if (['abdominals', 'abs', 'core'].includes(key)) return 'core';
  if (['delts', 'deltoids', 'shoulders'].includes(key)) return 'shoulders';
  if (['pectorals', 'chest'].includes(key)) return 'chest';
  if (['hamstrings'].includes(key)) return 'hamstrings';
  if (['biceps'].includes(key)) return 'biceps';
  if (['triceps'].includes(key)) return 'triceps';
  if (['calves'].includes(key)) return 'calves';
  return key;
};

const resolveShareTitle = (type: ShareType): string => {
  switch (type) {
    case 'monthly':
      return 'Monthly recap';
    case 'signature':
      return 'Training signature';
    default:
      return 'Training activity';
  }
};

export default function ProfileShareScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { type } = useLocalSearchParams<{ type?: ShareType }>();
  const shareType: ShareType = type === 'monthly' || type === 'signature' ? type : 'activity';
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
  const { exercises, loading: musclesLoading, hasWorkouts } = useWeeklyMuscles();
  const bodyType = useWorkoutStore((state) => state.bodyType);

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

  const units = profile?.preferred_units || 'imperial';

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
    if (!isSupabaseConfigured() || !profile?.id) {
      setSignatureSummary((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const loadSignature = async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const fromDate = subDays(weekStart, 7 * 2);
      const { data, error } = await supabase
        .from('weekly_muscle_group_sets')
        .select('week_start, muscle_group, working_sets')
        .eq('user_id', profile.id)
        .gte('week_start', toIsoDate(fromDate))
        .lte('week_start', toIsoDate(weekStart));

      if (!isMounted) return;
      if (error || !data) {
        setSignatureSummary((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const totals = new Map<string, number>();
      let totalSets = 0;
      (data as Array<{ muscle_group: string | null; working_sets: number | null }>).forEach((row) => {
        if (!row.muscle_group) return;
        const group = normalizeGroup(row.muscle_group);
        const sets = row.working_sets ?? 0;
        totals.set(group, (totals.get(group) ?? 0) + sets);
        totalSets += sets;
      });

      const pushGroups = new Set(['chest', 'shoulders', 'triceps']);
      const pullGroups = new Set(['back', 'biceps']);
      const legGroups = new Set(['quads', 'hamstrings', 'glutes', 'calves']);
      const coreGroups = new Set(['core']);

      let pushSets = 0;
      let pullSets = 0;
      let legSets = 0;
      let coreSets = 0;
      totals.forEach((value, key) => {
        if (pushGroups.has(key)) pushSets += value;
        if (pullGroups.has(key)) pullSets += value;
        if (legGroups.has(key)) legSets += value;
        if (coreGroups.has(key)) coreSets += value;
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
        ],
        isLoading: false,
      });
    };

    loadSignature();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

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

  const activitySubtitle = useMemo(() => {
    if (weeks.length === 0) {
      return 'Recent weeks';
    }
    const start = addDays(new Date(), -(weeks.length * 7 - 1));
    const end = new Date();
    return `Last ${weeks.length} weeks · ${format(start, 'MMM d')}–${format(end, 'MMM d')}`;
  }, [weeks.length]);

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
                        Consistency snapshot
                      </Text>
                      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>
                        {activitySubtitle}
                      </Text>
                      <View style={styles.activityRow}>
                        <View style={styles.activityMetric}>
                          <Text style={[styles.activityValue, { color: colors.accent }]}>
                            {activeDays}
                          </Text>
                          <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>
                            Active days
                          </Text>
                        </View>
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
                          <View style={styles.statsTile}>
                            <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                              {formatVolume(monthlyStats.totalVolume, units)}
                            </Text>
                            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                              Volume
                            </Text>
                          </View>
                          <View style={styles.statsTile}>
                            <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                              {monthlyStats.totalWorkouts}
                            </Text>
                            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                              Workouts
                            </Text>
                          </View>
                          <View style={styles.statsTile}>
                            <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                              {formatTime(monthlyStats.totalTimeSeconds)}
                            </Text>
                            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                              Time trained
                            </Text>
                          </View>
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
                      {musclesLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.accent} size="small" />
                        </View>
                      ) : hasWorkouts ? (
                        <View style={styles.signatureHeatmap}>
                          <MuscleHeatmap
                            exercises={exercises}
                            gender={bodyType}
                            scale={0.38}
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
    minHeight: scale(420),
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.md),
  },
  activityMetric: {
    width: scale(72),
  },
  activityValue: {
    fontSize: moderateScale(26),
    fontWeight: '700',
  },
  activityLabel: {
    fontSize: moderateScale(11),
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(Spacing.md),
  },
  statsTile: {
    flex: 1,
    gap: scale(Spacing.xs),
  },
  statsValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: moderateScale(11),
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(Spacing.md),
  },
  signatureHeatmap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(Spacing.xs),
  },
  emptyHint: {
    fontSize: moderateScale(11),
  },
  signatureTile: {
    flex: 1,
    gap: scale(Spacing.xs),
  },
  signatureValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  signatureLabel: {
    fontSize: moderateScale(11),
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
