import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AccentShadowCard } from '@/src/components/ui/AccentShadowCard';
import { getMuscleCategory, getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import {
  getCachedExerciseImageSource,
} from '@/src/utils/exerciseImageCache';

interface HubExerciseRowProps {
  exerciseName: string;
  primaryMuscles: string[];
  images: string[];
  onPress?: () => void;
  rightAction?: React.ReactNode;
}

// Muscle group colors for visual distinction
const MUSCLE_CATEGORY_COLORS: Record<string, string> = {
  push: '#ef4444',
  pull: '#0ea5e9',
  legs: '#f59e0b',
  core: '#ec4899',
  other: '#6b7280',
};

function getMuscleColor(muscle: string): string {
  const category = getMuscleCategory(muscle as MuscleKey);
  return MUSCLE_CATEGORY_COLORS[category] || Colors.textSecondary;
}

export const HubExerciseRow = React.memo(function HubExerciseRow({
  exerciseName,
  primaryMuscles,
  images,
  onPress,
  rightAction,
}: HubExerciseRowProps) {
  const { colors, isDark } = useTheme();
  const imageSource = getCachedExerciseImageSource(images[0]);

  // Theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    exerciseName: { color: colors.textPrimary },
    placeholderImage: { backgroundColor: colors.accentOverlay },
    placeholderText: { color: colors.accent },
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const primaryMuscle = primaryMuscles[0] || 'other';
  const muscleColor = getMuscleColor(primaryMuscle);
  const muscleLabel = primaryMuscles.length > 0
    ? getMuscleDisplayName(primaryMuscle as MuscleKey)
    : 'General';

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
    >
      <AccentShadowCard radius={BorderRadius.xl}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={[styles.container, themedStyles.container]}
          disabled={!onPress}
        >
          {/* Exercise Image */}
          <View style={styles.imageContainer}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
                fadeDuration={0}
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
                  {muscleLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Action (e.g., kebab menu) */}
          {rightAction}
        </TouchableOpacity>
      </AccentShadowCard>
    </Animated.View>
  );
}, (prev, next) => {
  // Only re-render if exercise data changes, NOT index
  // This prevents animation storms when exercises are deleted
  return (
    prev.exerciseName === next.exerciseName &&
    prev.images[0] === next.images[0] &&
    prev.primaryMuscles[0] === next.primaryMuscles[0] &&
    prev.onPress === next.onPress &&
    prev.rightAction === next.rightAction
  );
});

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
    // backgroundColor now applied via themedStyles (colors.accentOverlay)
  },
  placeholderText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    // color now applied via themedStyles (colors.accent)
  },
  content: {
    flex: 1,
    gap: 2,
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
