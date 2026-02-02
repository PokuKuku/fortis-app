import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeftIcon, TrophyIcon, FireIcon, ScaleIcon, ChartBarIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { ExerciseCharts } from '@/src/components/exercise/ExerciseCharts';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useExercise } from '@/src/hooks/useExercises';
import { useExerciseHistory } from '@/src/hooks/useExerciseHistory';
import { useExerciseRecords } from '@/src/hooks/useExerciseRecords';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseImageUrl, getExerciseVariants } from '@/src/services/exerciseService';
import type { Exercise } from '@/src/types/exercise';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';

type TabType = 'About' | 'History' | 'Charts' | 'Records';

const stripInstructionPrefix = (value: string) =>
  value.replace(/^step\s*[:#-]?\s*\d+\s*[:.)-]?\s*/i, '');

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toString();
}

function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  const repsClamped = Math.min(reps, 12);
  return Math.round(weight * (1 + repsClamped / 30));
}

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const [selectedTab, setSelectedTab] = useState<TabType>('About');
  const isNavigating = useRef(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    backButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    headerTitle: { color: colors.textPrimary },
    tabBar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    tabActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    tabText: { color: colors.textSecondary },
    tabTextActive: { color: colors.textPrimary },
    sectionTitle: { color: colors.textSecondary },
    exerciseImageContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    placeholderImage: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    placeholderImageText: { color: colors.textSecondary },
    infoBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    infoLabel: { color: colors.textSecondary },
    infoValue: { color: colors.textPrimary },
    musclesSectionTitle: { color: colors.textSecondary },
    secondaryMuscleTag: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    secondaryMuscleTagText: { color: colors.textPrimary },
    instructionsSectionTitle: { color: colors.textSecondary },
    instructionText: { color: colors.textPrimary },
    variantRow: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    variantText: { color: colors.textPrimary },
    variantSubtext: { color: colors.textSecondary },
    historyCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    historyDate: { color: colors.textPrimary },
    historySession: { color: colors.textSecondary },
    historyStatLabel: { color: colors.textSecondary },
    historyStatValue: { color: colors.accent },
    recordCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    recordLabel: { color: colors.textSecondary },
    recordValue: { color: colors.textPrimary },
    recordDate: { color: colors.textSecondary },
    statBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    statValue: { color: colors.textPrimary },
    statLabel: { color: colors.textSecondary },
    placeholderTabText: { color: colors.textSecondary },
    placeholderTabSubtext: { color: colors.textTertiary },
    notFoundText: { color: colors.textSecondary },
    backLinkText: { color: colors.accent },
    accentGradient: colors.accentGradient as unknown as string[],
  };

  const { exercise, loading } = useExercise(id);
  const { history } = useExerciseHistory(id);
  const records = useExerciseRecords(id);
  const [variants, setVariants] = useState<Exercise[]>([]);
  const shouldLoadVariants = useMemo(
    () => !!exercise && !exercise.isCustom && !exercise.canonicalId,
    [exercise]
  );

  useEffect(() => {
    let isMounted = true;
    if (!shouldLoadVariants || !exercise) {
      setVariants([]);
      return () => {
        isMounted = false;
      };
    }

    getExerciseVariants(exercise.id)
      .then((rows) => {
        if (isMounted) {
          setVariants(rows);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVariants([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exercise, shouldLoadVariants]);

  const handleBack = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const preferredUnits = profile?.preferred_units ?? 'imperial';
  const unitLabel = preferredUnits === 'metric' ? 'kg' : 'lbs';

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

  const chartData = useMemo(() => {
    const normalizeWeight = (weight: number, unit?: 'lbs' | 'kg' | null) => {
      if (!Number.isFinite(weight)) return 0;
      const resolvedUnit = unit ?? unitLabel;
      if (preferredUnits === 'metric') {
        return resolvedUnit === 'lbs' ? weight / 2.20462 : weight;
      }
      return resolvedUnit === 'kg' ? weight * 2.20462 : weight;
    };
    const points = history
      .slice()
      .reverse()
      .map((entry) => {
        const workingSets = entry.sets.filter(
          (set) =>
            set.isCompleted &&
            set.setType !== 'warmup' &&
            (set.reps ?? 0) > 0
        );

        if (workingSets.length === 0) return null;

        let totalVolume = 0;
        let maxWeight = 0;
        let maxE1rm = 0;

        const exerciseMeta = id ? exercisesById?.get(id) : undefined;
        const fallbackUnit = id ? weightUnits?.[id] : undefined;

        workingSets.forEach((set) => {
          const reps = set.reps ?? 0;
          if (!Number.isFinite(reps) || reps <= 0) return;
          totalVolume += getSetVolume(set, volumeContext, {
            exerciseMeta,
            fallbackUnit,
            exerciseName: exercise?.name ?? null,
          });

          const weight = normalizeWeight(set.weight ?? 0, set.weightUnit ?? unitLabel);
          if (!Number.isFinite(weight) || weight <= 0) return;
          if (weight > maxWeight) {
            maxWeight = weight;
          }
          const e1rm = calculateEstimated1RM(weight, reps);
          if (e1rm > maxE1rm) {
            maxE1rm = e1rm;
          }
        });

        if (!Number.isFinite(totalVolume) || !Number.isFinite(maxWeight) || !Number.isFinite(maxE1rm)) {
          return null;
        }
        if (totalVolume <= 0 || maxWeight <= 0 || maxE1rm <= 0) {
          return null;
        }

        return {
          weight: maxWeight,
          volume: totalVolume,
          e1rm: maxE1rm,
          date: entry.date,
        };
      })
      .filter((point): point is { weight: number; volume: number; e1rm: number; date: Date } => Boolean(point));

    return points.map((point) => ({
      x: point.date.getTime(),
      ...point,
    }));
  }, [
    history,
    preferredUnits,
    unitLabel,
    volumeContext,
    exercisesById,
    weightUnits,
    id,
    exercise?.name,
  ]);

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, themedStyles.container]}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, themedStyles.notFoundText]}>Exercise not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={[styles.backLinkText, themedStyles.backLinkText]}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themedStyles.container]} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, themedStyles.backButton]}>
          <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.headerTitle]} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, themedStyles.tabBar]}>
        {(['About', 'History', 'Charts', 'Records'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive, selectedTab === tab && themedStyles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, themedStyles.tabText, selectedTab === tab && styles.tabTextActive, selectedTab === tab && themedStyles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================== ABOUT TAB ==================== */}
        {selectedTab === 'About' && (
          <>
            <View style={[styles.exerciseImageContainer, themedStyles.exerciseImageContainer]}>
              {exercise.images && exercise.images.length > 0 ? (
                <Image
                  source={{ uri: getExerciseImageUrl(exercise.images[0]) }}
                  style={styles.exerciseImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.placeholderImage, themedStyles.placeholderImage]}>
                  <Text style={[styles.placeholderImageText, themedStyles.placeholderImageText]}>No image provided</Text>
                </View>
              )}
            </View>

            <View style={styles.infoGrid}>
              <View style={[styles.infoBox, themedStyles.infoBox]}>
                <Text style={[styles.infoLabel, themedStyles.infoLabel]}>EQUIPMENT</Text>
                <Text style={[styles.infoValue, themedStyles.infoValue]}>{exercise.equipment || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.musclesSection}>
              <Text style={[styles.musclesSectionTitle, themedStyles.musclesSectionTitle]}>PRIMARY MUSCLES</Text>
              <View style={styles.muscleTags}>
                {exercise.primaryMuscles.map((muscle, index) => (
                  <LinearGradient
                    key={index}
                    colors={themedStyles.accentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryMuscleTag}
                  >
                    <Text style={[styles.primaryMuscleTagText, { color: colors.white }]}>
                      {getMuscleDisplayName(muscle as MuscleKey)}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            {exercise.secondaryMuscles.length > 0 && (
              <View style={styles.musclesSection}>
                <Text style={[styles.musclesSectionTitle, themedStyles.musclesSectionTitle]}>SECONDARY MUSCLES</Text>
                <View style={styles.muscleTags}>
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <View key={index} style={[styles.secondaryMuscleTag, themedStyles.secondaryMuscleTag]}>
                      <Text style={[styles.secondaryMuscleTagText, themedStyles.secondaryMuscleTagText]}>
                        {getMuscleDisplayName(muscle as MuscleKey)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.instructionsSection}>
              <Text style={[styles.instructionsSectionTitle, themedStyles.instructionsSectionTitle]}>INSTRUCTIONS</Text>
              {exercise.instructions.length === 0 ? (
                <Text style={[styles.instructionText, themedStyles.instructionText]}>N/A</Text>
              ) : (
                exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <LinearGradient
                      colors={themedStyles.accentGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.instructionNumber}
                    >
                      <Text style={[styles.instructionNumberText, { color: colors.white }]}>{index + 1}</Text>
                    </LinearGradient>
                    <Text style={[styles.instructionText, themedStyles.instructionText]}>
                      {stripInstructionPrefix(instruction)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {variants.length > 0 && (
              <View style={styles.variantsSection}>
                <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>VARIANTS</Text>
                <View style={styles.variantsList}>
                  {variants.map((variant) => (
                    <TouchableOpacity
                      key={variant.id}
                      style={[styles.variantRow, themedStyles.variantRow]}
                      onPress={() => router.push(`/exercise/${variant.id}`)}
                    >
                      <View style={styles.variantInfo}>
                        <Text style={[styles.variantText, themedStyles.variantText]} numberOfLines={1}>
                          {variant.name}
                        </Text>
                        {variant.equipment ? (
                          <Text style={[styles.variantSubtext, themedStyles.variantSubtext]}>
                            {variant.equipment}
                          </Text>
                        ) : null}
                      </View>
                      <ChevronRightIcon color={colors.textSecondary} size={18} strokeWidth={2} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ==================== HISTORY TAB ==================== */}
        {selectedTab === 'History' && (
          <View style={styles.tabContent}>
            {history.length === 0 ? (
              <View style={styles.placeholderTab}>
                <Text style={[styles.placeholderTabText, themedStyles.placeholderTabText]}>No history yet</Text>
                <Text style={[styles.placeholderTabSubtext, themedStyles.placeholderTabSubtext]}>
                  Complete workouts with this exercise to see your history
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>WORKOUT HISTORY</Text>
                {history.map((entry) => (
                  <View key={entry.sessionId} style={[styles.historyCard, themedStyles.historyCard]}>
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyDate, themedStyles.historyDate]}>
                        {format(entry.date, 'MMM d, yyyy')}
                      </Text>
                      <Text style={[styles.historySession, themedStyles.historySession]}>{entry.sessionName}</Text>
                    </View>
                    <View style={styles.historyStats}>
                      <View style={styles.historyStat}>
                        <Text style={[styles.historyStatValue, themedStyles.historyStatValue]}>{entry.completedSets}</Text>
                        <Text style={[styles.historyStatLabel, themedStyles.historyStatLabel]}>Sets</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={[styles.historyStatValue, themedStyles.historyStatValue]}>{entry.totalReps}</Text>
                        <Text style={[styles.historyStatLabel, themedStyles.historyStatLabel]}>Reps</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={[styles.historyStatValue, themedStyles.historyStatValue]}>{entry.maxWeight}</Text>
                        <Text style={[styles.historyStatLabel, themedStyles.historyStatLabel]}>Max lbs</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={[styles.historyStatValue, themedStyles.historyStatValue]}>{formatVolume(entry.totalVolume)}</Text>
                        <Text style={[styles.historyStatLabel, themedStyles.historyStatLabel]}>Volume</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* ==================== CHARTS TAB ==================== */}
        {selectedTab === 'Charts' && (
          <View style={styles.tabContent}>
            <ExerciseCharts chartData={chartData} formatVolume={formatVolume} unitLabel={unitLabel} />
          </View>
        )}

        {/* ==================== RECORDS TAB ==================== */}
        {selectedTab === 'Records' && (
          <View style={styles.tabContent}>
            {records.totalWorkouts === 0 ? (
              <View style={styles.placeholderTab}>
                <Text style={[styles.placeholderTabText, themedStyles.placeholderTabText]}>No records yet</Text>
                <Text style={[styles.placeholderTabSubtext, themedStyles.placeholderTabSubtext]}>
                  Your personal records will appear here after logging workouts
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>PERSONAL RECORDS</Text>

                {/* Max Weight */}
                {records.maxWeight && (
                  <View style={[styles.recordCard, themedStyles.recordCard]}>
                    <LinearGradient
                      colors={themedStyles.accentGradient}
                      style={styles.recordIcon}
                    >
                      <ScaleIcon color="#000" size={20} strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordLabel, themedStyles.recordLabel]}>Max Weight</Text>
                      <Text style={[styles.recordValue, themedStyles.recordValue]}>
                        {records.maxWeight.value} lbs × {records.maxWeight.reps} reps
                      </Text>
                      <Text style={[styles.recordDate, themedStyles.recordDate]}>
                        {format(records.maxWeight.date, 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Estimated 1RM */}
                {records.estimated1RM && (
                  <View style={[styles.recordCard, themedStyles.recordCard]}>
                    <LinearGradient
                      colors={['#f59e0b', '#d97706']}
                      style={styles.recordIcon}
                    >
                      <TrophyIcon color="#000" size={20} strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordLabel, themedStyles.recordLabel]}>Estimated 1RM</Text>
                      <Text style={[styles.recordValue, themedStyles.recordValue]}>{records.estimated1RM.value} lbs</Text>
                      <Text style={[styles.recordDate, themedStyles.recordDate]}>
                        {format(records.estimated1RM.date, 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Max Reps */}
                {records.maxReps && (
                  <View style={[styles.recordCard, themedStyles.recordCard]}>
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb']}
                      style={styles.recordIcon}
                    >
                      <FireIcon color="#000" size={20} strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordLabel, themedStyles.recordLabel]}>Max Reps</Text>
                      <Text style={[styles.recordValue, themedStyles.recordValue]}>
                        {records.maxReps.value} reps @ {records.maxReps.weight} lbs
                      </Text>
                      <Text style={[styles.recordDate, themedStyles.recordDate]}>
                        {format(records.maxReps.date, 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Best Volume */}
                {records.maxVolume && (
                  <View style={[styles.recordCard, themedStyles.recordCard]}>
                    <LinearGradient
                      colors={['#8b5cf6', '#7c3aed']}
                      style={styles.recordIcon}
                    >
                      <ChartBarIcon color="#000" size={20} strokeWidth={2} />
                    </LinearGradient>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordLabel, themedStyles.recordLabel]}>Best Session Volume</Text>
                      <Text style={[styles.recordValue, themedStyles.recordValue]}>
                        {formatVolume(records.maxVolume.value)} {unitLabel}
                      </Text>
                      <Text style={[styles.recordDate, themedStyles.recordDate]}>
                        {format(records.maxVolume.date, 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Total Stats */}
                <Text style={[styles.sectionTitle, themedStyles.sectionTitle, { marginTop: Spacing.xl }]}>
                  LIFETIME STATS
                </Text>
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, themedStyles.statBox]}>
                    <Text style={[styles.statValue, themedStyles.statValue]}>{records.totalWorkouts}</Text>
                    <Text style={[styles.statLabel, themedStyles.statLabel]}>Workouts</Text>
                  </View>
                  <View style={[styles.statBox, themedStyles.statBox]}>
                    <Text style={[styles.statValue, themedStyles.statValue]}>{records.totalSets}</Text>
                    <Text style={[styles.statLabel, themedStyles.statLabel]}>Total Sets</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 240,
  },
  tabContent: {
    paddingHorizontal: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },

  // About tab styles
  exerciseImageContainer: {
    height: 280,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Spacing.lg,
  },
  placeholderImageText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  infoBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  musclesSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
  },
  musclesSectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  primaryMuscleTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  primaryMuscleTagText: {
    color: '#000',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  secondaryMuscleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  secondaryMuscleTagText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructionsSection: {
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  instructionsSectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  instructionNumberText: {
    color: '#000',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  variantsSection: {
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  variantsList: {
    gap: Spacing.sm,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  variantInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  variantText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  variantSubtext: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // History tab styles
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  historyDate: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historySession: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.success,
  },
  historyStatLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Charts tab styles
  chartContainer: {
    height: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },

  // Records tab styles
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  recordInfo: {
    flex: 1,
  },
  recordLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  recordValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recordDate: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Placeholder styles
  placeholderTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  placeholderTabText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  placeholderTabSubtext: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.success,
  },
});
