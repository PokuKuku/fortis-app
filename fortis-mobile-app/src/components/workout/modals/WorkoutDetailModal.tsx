/**
 * WorkoutDetailModal
 *
 * Modal that displays workout details (exercises, sets, reps) with a Start Workout button.
 * Triggered when tapping a workout card on the Programs screen.
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PlayIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { ProgramWorkout } from '@/src/types/workout';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useExercisesWithMuscles } from '@/src/hooks/useExercisesWithMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';

interface WorkoutDetailModalProps {
  visible: boolean;
  onClose: () => void;
  workout: ProgramWorkout | null;
  onStartWorkout: (workout: ProgramWorkout) => void;
}

export function WorkoutDetailModal({
  visible,
  onClose,
  workout,
  onStartWorkout,
}: WorkoutDetailModalProps) {
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const exerciseIds = useMemo(
    () => workout?.exercises.map((exercise) => exercise.exerciseId) || [],
    [workout]
  );
  const exercisesWithMuscles = useExercisesWithMuscles(exerciseIds);
  const hasMuscles = exercisesWithMuscles.length > 0;

  if (!workout) return null;

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStartWorkout(workout);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={workout.name}
      width={350}
      animation="slide_from_right"
      showCloseButton={true}
    >
      {/* Exercise Count */}
      <Text style={styles.exerciseCount}>
        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
      </Text>

      {hasMuscles && (
        <View style={styles.heatmapContainer}>
          <MuscleHeatmap
            exercises={exercisesWithMuscles}
            gender={bodyType}
            scale={0.26}
            compact
          />
        </View>
      )}

      {/* Exercise List */}
      <ScrollView
        style={styles.exerciseList}
        showsVerticalScrollIndicator={false}
      >
        {workout.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise.exerciseName}
            </Text>
            <Text style={styles.setsReps}>
              {exercise.sets} × {exercise.reps}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Start Workout Button */}
      <GlassButton
        style={styles.startButton}
        onPress={handleStart}
      >
        <View style={styles.startButtonContent}>
          <PlayIcon color={Colors.white} size={20} strokeWidth={2.5} />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </View>
      </GlassButton>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  exerciseCount: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  exerciseList: {
    maxHeight: 280,
    marginBottom: Spacing['2xl'],
  },
  heatmapContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  setsReps: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  startButton: {
    height: 48,
    borderRadius: BorderRadius.xl,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
  },
});
