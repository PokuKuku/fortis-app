import { useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { FireIcon, XMarkIcon } from 'react-native-heroicons/outline';
import type { RefObject } from 'react';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { InsightRadarChart } from '@/src/components/insights/InsightRadarChart';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';
import type { WeeklyRecap } from '@/src/utils/workoutRetention';
import {
  bucketIntensity,
  resolveMuscleTargetKeys,
  type MuscleKey,
} from '@/src/utils/muscleTaxonomy';

type WeeklyRecapModalProps = {
  visible: boolean;
  recap: WeeklyRecap | null;
  userName?: string | null;
  onClose: () => void;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const formatVolume = (volume: number, unit: string): string => {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k ${unit}`;
  return `${Math.round(volume)} ${unit}`;
};

const formatBestLift = (lift: WeeklyRecap['bestLifts'][number]): string => {
  const reps = lift.reps ? `${lift.reps} reps` : null;
  const weight = lift.weight ? `${lift.weight} ${lift.weightUnit ?? ''}`.trim() : 'Bodyweight';
  return reps ? `${reps} x ${weight}` : weight;
};

export function WeeklyRecapModal({ visible, recap, userName, onClose }: WeeklyRecapModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const bodyType = useWorkoutStore((state) => state.bodyType);
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

  const ViewShotComponent = isCaptureReady
    ? (require('react-native-view-shot').default as any)
    : null;

  const weekLabel = useMemo(() => {
    if (!recap) return 'Weekly Recap';
    return `${format(recap.weekStart, 'MMM d')} - ${format(recap.weekEnd, 'MMM d')}`;
  }, [recap]);
  const userWeekLabel = useMemo(() => {
    const firstName = userName?.trim().split(/\s+/)[0];
    return firstName ? `${firstName}'s Week` : 'Your Week';
  }, [userName]);
  const muscleLevels = useMemo(() => {
    const scores = {} as Record<MuscleKey, number>;
    const muscles = recap?.muscleScores?.length ? recap.muscleScores : recap?.topMuscles;
    muscles?.forEach((muscle) => {
      resolveMuscleTargetKeys(muscle.label).forEach((key) => {
        scores[key] = Math.max(scores[key] ?? 0, muscle.score);
      });
    });
    return bucketIntensity(scores);
  }, [recap]);

  const handleShare = async () => {
    if (!recap || !isCaptureReady) return;
    setIsSharing(true);
    setShareError(null);
    try {
      const { captureRef } = require('react-native-view-shot') as {
        captureRef: (ref: RefObject<any>, options?: { format?: string; quality?: number; result?: string }) => Promise<string>;
      };
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await Share.share(
        Platform.select({
          ios: { url: uri, title: 'Fortify weekly recap' },
          default: { message: `Fortify weekly recap: ${weekLabel}\n${uri}` },
        }) ?? { message: `Fortify weekly recap: ${weekLabel}` }
      );
    } catch {
      setShareError('Could not generate the share image.');
    } finally {
      setIsSharing(false);
    }
  };

  if (!visible || !recap) return null;

  const isCompactHeight = windowHeight < 760;
  const isNarrow = windowWidth < 390;
  const horizontalPadding = isNarrow ? Spacing.lg : Spacing['2xl'];
  const shareCardPadding = isCompactHeight ? Spacing.md : Spacing.lg;
  const heatmapScale = isCompactHeight ? 0.34 : 0.4;
  const heatmapMinHeight = isCompactHeight ? scale(132) : scale(158);
  const cardTheme = {
    backgroundColor: colors.glassBackground,
    borderColor: colors.glassBorder,
  };

  const shareCard = (
    <View
      style={[
        styles.shareCard,
        {
          backgroundColor: colors.background,
          minHeight: isCompactHeight ? scale(400) : scale(440),
          padding: shareCardPadding,
        },
      ]}
    >
      <StainlessSteelPattern />
      <View style={styles.shareHeader}>
        <Text
          style={[styles.shareEyebrow, { color: colors.accent }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {userWeekLabel}
        </Text>
        <View style={styles.streakInline}>
          <Text style={[styles.streakText, { color: colors.textPrimary }]}>{recap.streak}</Text>
          <FireIcon color="#FF4D4D" size={20} strokeWidth={2.4} />
        </View>
      </View>
      <Text style={[styles.shareSubtitle, { color: colors.textSecondary }]}>{weekLabel}</Text>
      <View style={styles.shareStatsGrid}>
        <View style={[styles.shareStat, cardTheme]}>
          <Text style={[styles.shareStatValue, { color: colors.textPrimary }]}>{recap.workoutsCompleted}</Text>
          <Text style={[styles.shareStatLabel, { color: colors.textSecondary }]}>Workouts</Text>
        </View>
        <View style={[styles.shareStat, cardTheme]}>
          <Text style={[styles.shareStatValue, { color: colors.textPrimary }]}>{recap.scheduledDaysHit}/{recap.scheduledDays}</Text>
          <Text style={[styles.shareStatLabel, { color: colors.textSecondary }]}>Schedule</Text>
        </View>
        <View style={[styles.shareStat, cardTheme]}>
          <Text style={[styles.shareStatValue, { color: colors.textPrimary }]}>{recap.totalSets}</Text>
          <Text style={[styles.shareStatLabel, { color: colors.textSecondary }]}>Sets</Text>
        </View>
        <View style={[styles.shareStat, cardTheme]}>
          <Text style={[styles.shareStatValue, { color: colors.textPrimary }]}>{formatVolume(recap.totalVolume, recap.volumeUnit)}</Text>
          <Text style={[styles.shareStatLabel, { color: colors.textSecondary }]}>Volume</Text>
        </View>
      </View>
      <View style={[styles.detailStrip, styles.shareDetailStrip, cardTheme]}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDuration(recap.totalDurationSeconds)}</Text>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{recap.scheduledDaysMissed}</Text>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Wks Missed</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{recap.bestLifts.length}</Text>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Best Lifts</Text>
        </View>
      </View>
      <Text style={[styles.heatmapTitle, { color: colors.textPrimary }]}>Volume</Text>
      <View style={[styles.heatmapBlock, { minHeight: heatmapMinHeight }]}>
        <MuscleHeatmap
          muscleLevels={muscleLevels}
          gender={bodyType}
          scale={heatmapScale}
          compact
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: horizontalPadding,
                paddingTop: Math.max(insets.top + Spacing.md, Spacing['4xl']),
              },
            ]}
          >
            <View style={styles.headerSpacer} />
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Weekly recap</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.closeButton, cardTheme]}>
              <XMarkIcon color={colors.textPrimary} size={22} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: scale(84) + Math.max(insets.bottom, Spacing.md),
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {ViewShotComponent ? (
              <ViewShotComponent ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                {shareCard}
              </ViewShotComponent>
            ) : (
              shareCard
            )}

            {recap.bestLifts.length > 0 ? (
              <View style={[styles.sectionCard, cardTheme]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Best Lifts</Text>
                {recap.bestLifts.map((lift, index) => (
                  <View
                    key={`${lift.exerciseName}-${index}`}
                    style={styles.listRow}
                  >
                    <Text style={[styles.listLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                      {lift.exerciseName}
                    </Text>
                    <Text style={[styles.listValue, { color: colors.textSecondary }]} numberOfLines={1}>
                      {formatBestLift(lift)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.radarSection}>
              <Text style={[styles.sectionTitle, styles.radarTitle, { color: colors.textPrimary }]}>Top Muscles</Text>
              {recap.topMuscles.length > 0 ? (
                <InsightRadarChart
                  data={recap.topMuscles.map((muscle) => ({
                    label: muscle.label,
                    value: muscle.score,
                  }))}
                  compact
                />
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No muscle breakdown yet.
                </Text>
              )}
            </View>

            {shareError ? <Text style={[styles.errorText, { color: colors.error }]}>{shareError}</Text> : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: Math.max(insets.bottom, Spacing.md),
              },
            ]}
          >
            <Pressable
              onPress={handleShare}
              disabled={isSharing || !isCaptureReady}
              style={[
                styles.shareButton,
                {
                  backgroundColor: colors.accentOverlay,
                  borderColor: colors.accent,
                  opacity: isSharing || !isCaptureReady ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share Recap</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
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
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: scale(40),
    height: scale(40),
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(12),
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    textAlign: 'center',
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: scale(96),
    gap: Spacing.xs,
  },
  shareCard: {
    width: '100%',
    minHeight: scale(460),
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    padding: Spacing.lg,
    alignSelf: 'center',
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  shareEyebrow: {
    flex: 1,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(20),
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  shareSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  shareStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  shareStat: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  shareStatValue: {
    fontSize: moderateScale(22),
    fontWeight: '900',
  },
  shareStatLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(10),
    letterSpacing: 1,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
  shareFooter: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    lineHeight: moderateScale(19),
    marginTop: Spacing.sm,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  streakText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(17),
    letterSpacing: 0.8,
    fontWeight: '900',
  },
  heatmapTitle: {
    fontSize: moderateScale(16),
    fontWeight: '900',
    marginTop: Spacing.lg,
  },
  heatmapBlock: {
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    minHeight: scale(165),
    justifyContent: 'center',
  },
  detailStrip: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.md,
  },
  shareDetailStrip: {
    marginTop: Spacing.md,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  detailValue: {
    fontSize: moderateScale(18),
    fontWeight: '900',
  },
  detailLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '900',
    marginBottom: Spacing.md,
  },
  radarSection: {
    paddingVertical: Spacing.sm,
  },
  radarTitle: {
    marginBottom: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  listLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  listValue: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  emptyText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: moderateScale(19),
  },
  errorText: {
    textAlign: 'center',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  shareButton: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
});
