import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlayIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes, ButtonHeights, IconSizes } from '@/constants/Sizes';
import { useWorkout } from '@/src/hooks/usePrograms';
import { HubHeader, HubExerciseRow, HubStatsSection } from '@/src/components/hub';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { workout, loading } = useWorkout(id);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to edit screen
  };

  const handleStartWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Start workout with this template
    router.push('/workout/active');
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/exercise/${exerciseId}`);
  };

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
  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Workout not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <HubHeader
        title={workout.name}
        onBack={handleBack}
        rightAction={{ label: 'Edit', onPress: handleEdit }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {workout.description && (
          <Animated.View
            entering={FadeIn.delay(100).duration(300)}
            style={styles.descriptionContainer}
          >
            <Text style={styles.description}>{workout.description}</Text>
          </Animated.View>
        )}

        {/* Last Performed */}
        {workout.lastPerformed && (
          <Animated.View
            entering={FadeIn.delay(150).duration(300)}
            style={styles.metaContainer}
          >
            <Text style={styles.metaText}>
              Last performed: {workout.lastPerformed}
            </Text>
          </Animated.View>
        )}

        {/* Start Workout Button */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.startButtonContainer}
        >
          <GlassButton
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <View style={styles.startButtonContent}>
              <PlayIcon color={Colors.white} size={IconSizes.lg} strokeWidth={2.5} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </View>
          </GlassButton>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.section}
        >
          <HubStatsSection
            stats={workout.stats}
            totalExercises={workout.exercises.length}
          />
        </Animated.View>

        {/* Exercises Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.sectionCount}>
              {workout.exercises.length} exercises
            </Text>
          </View>

          <View style={styles.exercisesList}>
            {workout.exercises.map((exercise, index) => (
              <HubExerciseRow
                key={exercise.id}
                exerciseName={exercise.exerciseName}
                targetSets={exercise.targetSets}
                targetReps={exercise.targetReps}
                primaryMuscles={exercise.primaryMuscles}
                images={exercise.images}
                index={index}
                onPress={() => handleExercisePress(exercise.exerciseId)}
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
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaContainer: {
    marginBottom: Spacing.lg,
  },
  metaText: {
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
  exercisesList: {
    gap: Spacing.md,
  },
});
