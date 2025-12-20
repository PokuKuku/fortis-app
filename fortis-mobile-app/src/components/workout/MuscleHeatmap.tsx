import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Body, { Slug } from 'react-native-body-highlighter';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';

// Map exercise muscle names to library slugs
const MUSCLE_SLUG_MAP: Record<string, { slugs: Slug[]; side: 'front' | 'back' | 'both' }> = {
  // Front muscles
  'abdominals': { slugs: ['abs'], side: 'front' },
  'abs': { slugs: ['abs'], side: 'front' },
  'obliques': { slugs: ['obliques'], side: 'front' },
  'chest': { slugs: ['chest'], side: 'front' },
  'biceps': { slugs: ['biceps'], side: 'front' },
  'quadriceps': { slugs: ['quadriceps'], side: 'front' },
  'quads': { slugs: ['quadriceps'], side: 'front' },

  // Back muscles
  'back': { slugs: ['upper-back', 'lower-back'], side: 'back' },
  'upper back': { slugs: ['upper-back'], side: 'back' },
  'middle back': { slugs: ['upper-back'], side: 'back' },
  'lower back': { slugs: ['lower-back'], side: 'back' },
  'lats': { slugs: ['upper-back'], side: 'back' },
  'traps': { slugs: ['trapezius'], side: 'back' },
  'trapezius': { slugs: ['trapezius'], side: 'back' },
  'hamstrings': { slugs: ['hamstring'], side: 'back' },
  'glutes': { slugs: ['gluteal'], side: 'back' },
  'gluteal': { slugs: ['gluteal'], side: 'back' },
  'abductors': { slugs: ['gluteal'], side: 'back' },

  // Both sides
  'shoulders': { slugs: ['deltoids'], side: 'both' },
  'delts': { slugs: ['deltoids'], side: 'both' },
  'deltoids': { slugs: ['deltoids'], side: 'both' },
  'triceps': { slugs: ['triceps'], side: 'both' },
  'forearms': { slugs: ['forearm'], side: 'both' },
  'forearm': { slugs: ['forearm'], side: 'both' },
  'calves': { slugs: ['calves'], side: 'both' },
  'adductors': { slugs: ['adductors'], side: 'both' },
  'neck': { slugs: ['neck'], side: 'both' },
};

// Front-only slugs for filtering
const FRONT_SLUGS: Slug[] = ['abs', 'obliques', 'chest', 'biceps', 'quadriceps', 'knees', 'tibialis'];
// Back-only slugs for filtering
const BACK_SLUGS: Slug[] = ['upper-back', 'lower-back', 'hamstring', 'gluteal'];

interface Exercise {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
}

interface MuscleHeatmapProps {
  exercises: Exercise[];
  gender?: 'male' | 'female';
}

interface BodyPartData {
  slug: Slug;
  intensity: number;
  side?: 'left' | 'right';
}

export function MuscleHeatmap({ exercises, gender = 'male' }: MuscleHeatmapProps) {
  const { frontData, backData } = useMemo(() => {
    const muscleIntensity: Record<string, number> = {};

    // Process all exercises
    exercises.forEach((exercise) => {
      // Primary muscles get intensity 2
      exercise.primaryMuscles?.forEach((muscle) => {
        const normalized = muscle.toLowerCase();
        const mapping = MUSCLE_SLUG_MAP[normalized];
        if (mapping) {
          mapping.slugs.forEach((slug) => {
            muscleIntensity[slug] = Math.max(muscleIntensity[slug] || 0, 2);
          });
        }
      });

      // Secondary muscles get intensity 1
      exercise.secondaryMuscles?.forEach((muscle) => {
        const normalized = muscle.toLowerCase();
        const mapping = MUSCLE_SLUG_MAP[normalized];
        if (mapping) {
          mapping.slugs.forEach((slug) => {
            // Only set to 1 if not already primary (2)
            if (!muscleIntensity[slug] || muscleIntensity[slug] < 2) {
              muscleIntensity[slug] = Math.max(muscleIntensity[slug] || 0, 1);
            }
          });
        }
      });
    });

    // Split into front and back data
    const frontData: BodyPartData[] = [];
    const backData: BodyPartData[] = [];

    Object.entries(muscleIntensity).forEach(([slug, intensity]) => {
      const bodyPart: BodyPartData = { slug: slug as Slug, intensity };

      // Determine which view(s) this muscle belongs to
      if (FRONT_SLUGS.includes(slug as Slug)) {
        frontData.push(bodyPart);
      } else if (BACK_SLUGS.includes(slug as Slug)) {
        backData.push(bodyPart);
      } else {
        // Muscles that appear on both sides
        frontData.push(bodyPart);
        backData.push(bodyPart);
      }
    });

    return { frontData, backData };
  }, [exercises]);

  return (
    <View style={styles.container}>
      <View style={styles.bodiesContainer}>
        <View style={styles.bodyWrapper}>
          <Body
            data={frontData}
            side="front"
            gender={gender}
            scale={0.5}
            colors={['#166534', '#22c55e']} // Darker green for secondary, bright for primary
            border="#333333"
          />
          <Text style={styles.viewLabel}>Front</Text>
        </View>
        <View style={styles.bodyWrapper}>
          <Body
            data={backData}
            side="back"
            gender={gender}
            scale={0.5}
            colors={['#166534', '#22c55e']}
            border="#333333"
          />
          <Text style={styles.viewLabel}>Back</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  bodiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  bodyWrapper: {
    alignItems: 'center',
  },
  viewLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
});
