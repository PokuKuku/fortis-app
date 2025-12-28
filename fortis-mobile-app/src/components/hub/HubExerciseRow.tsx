import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getExerciseImageUrl } from '@/src/services/exerciseService';

interface HubExerciseRowProps {
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  primaryMuscles: string[];
  images: string[];
  index: number;
  onPress?: () => void;
  rightAction?: React.ReactNode;
}

// Muscle group colors for visual distinction
const MUSCLE_COLORS: Record<string, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  'middle back': '#3b82f6',
  'lower back': '#3b82f6',
  lats: '#3b82f6',
  shoulders: '#8b5cf6',
  biceps: '#22c55e',
  triceps: '#22c55e',
  forearms: '#22c55e',
  quadriceps: '#f59e0b',
  hamstrings: '#f59e0b',
  glutes: '#f59e0b',
  calves: '#f59e0b',
  abdominals: '#ec4899',
  core: '#ec4899',
};

function getMuscleColor(muscle: string): string {
  const normalizedMuscle = muscle.toLowerCase();
  return MUSCLE_COLORS[normalizedMuscle] || Colors.textSecondary;
}

export function HubExerciseRow({
  exerciseName,
  targetSets,
  targetReps,
  primaryMuscles,
  images,
  index,
  onPress,
  rightAction,
}: HubExerciseRowProps) {
  const { colors, isDark } = useTheme();
  const imageUrl = images.length > 0
    ? getExerciseImageUrl(images[0])
    : null;

  // Theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    exerciseName: { color: colors.textPrimary },
    placeholderImage: { backgroundColor: colors.accentOverlay },
    placeholderText: { color: colors.accent },
    setsReps: { color: colors.accent },
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const primaryMuscle = primaryMuscles[0] || 'General';
  const muscleColor = getMuscleColor(primaryMuscle);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(300)}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.container, themedStyles.container]}
        disabled={!onPress}
      >
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, themedStyles.placeholderImage]}>
              <Text style={[styles.placeholderText, themedStyles.placeholderText]}>
                {exerciseName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Subtle gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Set x Reps indicator */}
          <Text style={[styles.setsReps, themedStyles.setsReps]}>
            {targetSets} × {targetReps}
          </Text>

          {/* Exercise Name */}
          <Text style={[styles.exerciseName, themedStyles.exerciseName]} numberOfLines={1}>
            {exerciseName}
          </Text>

          {/* Muscle Tag */}
          <View style={styles.muscleTagContainer}>
            <View
              style={[
                styles.muscleTag,
                { backgroundColor: `${muscleColor}20` },
              ]}
            >
              <View
                style={[styles.muscleDot, { backgroundColor: muscleColor }]}
              />
              <Text
                style={[styles.muscleText, { color: muscleColor }]}
              >
                {primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Action (e.g., kebab menu) */}
        {rightAction}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  placeholderText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.success,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  setsReps: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  muscleTagContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  muscleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  muscleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  muscleText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
