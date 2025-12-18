import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayIcon, ChevronDownIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights, IconSizes } from '@/constants/Sizes';
import { useProgram } from '@/src/hooks/usePrograms';
import { HubHeader, HubExerciseRow, HubStatsSection } from '@/src/components/hub';
import { ProgramWorkout } from '@/src/types/program';

// Difficulty badge colors
const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
  intermediate: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
  advanced: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
};

// Goal badge colors
const GOAL_LABELS: Record<string, string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerlifting: 'Powerlifting',
  general_fitness: 'General Fitness',
};

// Collapsible workout section component
function WorkoutSection({
  workout,
  index,
  onExercisePress,
}: {
  workout: ProgramWorkout;
  index: number;
  onExercisePress: (exerciseId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First one expanded by default
  const rotation = useSharedValue(index === 0 ? 90 : 0);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rotation.value = withTiming(isExpanded ? 0 : 90, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    setIsExpanded(!isExpanded);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.workoutSection}>
      {/* Section Header */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={styles.workoutSectionHeader}
      >
        <View style={styles.workoutSectionLeft}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {workout.dayNumber}</Text>
          </View>
          <View style={styles.workoutSectionInfo}>
            <Text style={styles.workoutSectionTitle}>{workout.name}</Text>
            <Text style={styles.workoutSectionSubtitle}>
              {workout.exercises.length} exercises
            </Text>
          </View>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronRightIcon
            size={20}
            color={Colors.textSecondary}
            strokeWidth={2}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Exercises List (collapsible) */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.workoutExercises}
        >
          {workout.exercises.map((exercise, exerciseIndex) => (
            <HubExerciseRow
              key={exercise.id}
              exerciseName={exercise.exerciseName}
              targetSets={exercise.targetSets}
              targetReps={exercise.targetReps}
              primaryMuscles={exercise.primaryMuscles}
              images={exercise.images}
              index={exerciseIndex}
              onPress={() => onExercisePress(exercise.exerciseId)}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { program, loading } = useProgram(id);
  const isNavigating = useRef(false);

  const handleBack = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to edit screen
  };

  const handleStartProgram = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Start first workout of the program
    router.push('/workout/active');
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleExercisePress = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Calculate total exercises across all workouts
  const totalExercises = program?.workouts.reduce(
    (sum, w) => sum + w.exercises.length,
    0
  ) || 0;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StainlessSteelPattern />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Program not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyColors = DIFFICULTY_COLORS[program.difficulty] || DIFFICULTY_COLORS.beginner;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <HubHeader
        title={program.name}
        onBack={handleBack}
        rightAction={{ label: 'Edit', onPress: handleEdit }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {program.description && (
          <Animated.View
            entering={FadeIn.delay(100).duration(300)}
            style={styles.descriptionContainer}
          >
            <Text style={styles.description}>{program.description}</Text>
          </Animated.View>
        )}

        {/* Meta Tags */}
        <Animated.View
          entering={FadeIn.delay(150).duration(300)}
          style={styles.metaTagsContainer}
        >
          {/* Duration */}
          <View style={styles.metaTag}>
            <Text style={styles.metaTagText}>
              {program.durationWeeks} weeks
            </Text>
          </View>

          {/* Difficulty */}
          <View
            style={[
              styles.metaTag,
              { backgroundColor: difficultyColors.bg },
            ]}
          >
            <Text style={[styles.metaTagText, { color: difficultyColors.text }]}>
              {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
            </Text>
          </View>

          {/* Goal */}
          {program.goal && (
            <View style={styles.metaTag}>
              <Text style={styles.metaTagText}>
                {GOAL_LABELS[program.goal] || program.goal}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Creator & Last Performed */}
        <Animated.View
          entering={FadeIn.delay(200).duration(300)}
          style={styles.creatorContainer}
        >
          {program.createdBy && (
            <Text style={styles.creatorText}>
              Created by {program.createdBy}
            </Text>
          )}
          {program.lastPerformed && (
            <Text style={styles.lastPerformedText}>
              Last performed: {program.lastPerformed}
            </Text>
          )}
        </Animated.View>

        {/* Start Program Button */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.startButtonContainer}
        >
          <GlassButton
            style={styles.startButton}
            onPress={handleStartProgram}
          >
            <View style={styles.startButtonContent}>
              <PlayIcon color={Colors.white} size={IconSizes.lg} strokeWidth={2.5} />
              <Text style={styles.startButtonText}>Start Program</Text>
            </View>
          </GlassButton>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.section}
        >
          <HubStatsSection
            stats={program.stats}
            totalExercises={totalExercises}
          />
        </Animated.View>

        {/* Workouts Section */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workouts</Text>
            <Text style={styles.sectionCount}>
              {program.workouts.length} workouts
            </Text>
          </View>

          <View style={styles.workoutsList}>
            {program.workouts.map((workout, index) => (
              <WorkoutSection
                key={workout.id}
                workout={workout}
                index={index}
                onExercisePress={handleExercisePress}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['6xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
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
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  metaTagText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  creatorContainer: {
    marginBottom: Spacing.lg,
    gap: 4,
  },
  creatorText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: 'rgba(163, 163, 163, 0.7)',
  },
  lastPerformedText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: 'rgba(163, 163, 163, 0.7)',
  },
  startButtonContainer: {
    marginBottom: Spacing['2xl'],
  },
  startButton: {
    height: ButtonHeights.xl,
    borderRadius: BorderRadius.xl,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  workoutsList: {
    gap: Spacing.md,
  },
  workoutSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  workoutSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  workoutSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  dayBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dayBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.success,
  },
  workoutSectionInfo: {
    flex: 1,
    gap: 2,
  },
  workoutSectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  workoutSectionSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  workoutExercises: {
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.sm,
  },
});
