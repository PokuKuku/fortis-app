import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Body, { Slug } from 'react-native-body-highlighter';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { normalizeMuscleName } from '@/src/utils/muscleMapping';

// Map exercise muscle names to library slugs
const MUSCLE_SLUG_MAP: Record<string, { slugs: Slug[]; side: 'front' | 'back' | 'both' }> = {
  // Front muscles
  'abdominals': { slugs: ['abs'], side: 'front' },
  'abs': { slugs: ['abs'], side: 'front' },
  'obliques': { slugs: ['obliques'], side: 'front' },
  'chest': { slugs: ['chest'], side: 'front' },
  'pectoral': { slugs: ['chest'], side: 'front' },
  'pectorals': { slugs: ['chest'], side: 'front' },
  'pecs': { slugs: ['chest'], side: 'front' },
  'upper chest': { slugs: ['chest'], side: 'front' },
  'lower chest': { slugs: ['chest'], side: 'front' },
  'biceps': { slugs: ['biceps'], side: 'front' },
  'quadriceps': { slugs: ['quadriceps'], side: 'front' },
  'quads': { slugs: ['quadriceps'], side: 'front' },
  'tibialis': { slugs: ['tibialis'], side: 'front' },

  // Back muscles
  'back': { slugs: ['upper-back', 'lower-back'], side: 'back' },
  'upper back': { slugs: ['upper-back'], side: 'back' },
  'middle back': { slugs: ['upper-back'], side: 'back' },
  'lower back': { slugs: ['lower-back'], side: 'back' },
  'lats': { slugs: ['upper-back'], side: 'back' },
  'traps': { slugs: ['trapezius'], side: 'both' },
  'trapezius': { slugs: ['trapezius'], side: 'both' },
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

const MUSCLE_ALIAS_MAP: Record<string, string> = {
  'pec': 'chest',
  'pecs': 'chest',
  'pectorals': 'chest',
  'pectoral': 'chest',
  'upper chest': 'chest',
  'lower chest': 'chest',
  'rear delts': 'shoulders',
  'rear deltoids': 'shoulders',
  'front delts': 'shoulders',
  'front deltoids': 'shoulders',
  'side delts': 'shoulders',
  'side deltoids': 'shoulders',
  'anterior deltoid': 'shoulders',
  'posterior deltoid': 'shoulders',
  'lateral deltoid': 'shoulders',
  'mid back': 'middle back',
  'upper back': 'upper back',
  'lower back': 'lower back',
  'bicep': 'biceps',
  'tricep': 'triceps',
  'calf': 'calves',
  'hamstring': 'hamstrings',
  'glute': 'glutes',
  'gluteus': 'glutes',
  'abdominal': 'abdominals',
  'abs': 'abdominals',
  'core': 'abdominals',
  'oblique': 'obliques',
  'adductor': 'adductors',
  'abductor': 'abductors',
  'tibialis anterior': 'tibialis',
};

const MUSCLE_KEYWORD_RULES: Array<[RegExp, string]> = [
  [/\bpectoral|\bpec\b|\bpecs\b/i, 'chest'],
  [/\bdeltoid|\bdelt\b|\bshoulder/i, 'shoulders'],
  [/\btricep/i, 'triceps'],
  [/\bbicep/i, 'biceps'],
  [/\bforearm|\bbrachioradialis|\bwrist/i, 'forearms'],
  [/\bquad|\bquadricep/i, 'quadriceps'],
  [/\bhamstring/i, 'hamstrings'],
  [/\bglute/i, 'glutes'],
  [/\bcalf/i, 'calves'],
  [/\boblique/i, 'obliques'],
  [/\babs|\babdom|\bcore/i, 'abdominals'],
  [/\badductor/i, 'adductors'],
  [/\babductor/i, 'abductors'],
  [/\btrapezius|\btrap\b/i, 'traps'],
  [/\blat(s|issimus)?\b/i, 'lats'],
  [/\bupper back|\bmid back|\bmiddle back/i, 'upper back'],
  [/\blower back/i, 'lower back'],
  [/\bback\b/i, 'back'],
  [/\bneck\b/i, 'neck'],
  [/\btibialis\b/i, 'tibialis'],
];

const normalizeMuscleKey = (value: string) =>
  value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

const resolveMuscleKey = (muscle: string) => {
  const rawKey = normalizeMuscleKey(muscle);
  const normalizedKey = normalizeMuscleKey(normalizeMuscleName(muscle));
  const aliasKey = MUSCLE_ALIAS_MAP[rawKey] || MUSCLE_ALIAS_MAP[normalizedKey];

  if (MUSCLE_SLUG_MAP[rawKey]) return rawKey;
  if (aliasKey && MUSCLE_SLUG_MAP[aliasKey]) return aliasKey;
  if (MUSCLE_SLUG_MAP[normalizedKey]) return normalizedKey;

  const keywordKey =
    MUSCLE_KEYWORD_RULES.find(([pattern]) => pattern.test(rawKey))?.[1] ||
    MUSCLE_KEYWORD_RULES.find(([pattern]) => pattern.test(normalizedKey))?.[1];

  return keywordKey && MUSCLE_SLUG_MAP[keywordKey] ? keywordKey : null;
};

interface Exercise {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
}

interface MuscleHeatmapProps {
  exercises: Exercise[];
  gender?: 'male' | 'female';
  scale?: number;
  compact?: boolean;
}

interface BodyPartData {
  slug: Slug;
  intensity: number;
  side?: 'left' | 'right';
}

export function MuscleHeatmap({ exercises, gender = 'male', scale = 0.5, compact = false }: MuscleHeatmapProps) {
  const { colors, isDark } = useTheme();

  // Dynamic heatmap colors based on accent
  const heatmapColors: [string, string] = [colors.accentDark, colors.accent];

  const { frontData, backData } = useMemo(() => {
    const frontIntensity: Record<string, number> = {};
    const backIntensity: Record<string, number> = {};

    const applyIntensity = (target: Record<string, number>, slug: Slug, intensity: number) => {
      const current = target[slug] || 0;
      if (intensity > current) {
        target[slug] = intensity;
      }
    };

    const addMuscle = (muscle: string | undefined, intensity: number) => {
      if (!muscle) return;
      const resolvedKey = resolveMuscleKey(muscle);
      if (!resolvedKey) return;
      const mapping = MUSCLE_SLUG_MAP[resolvedKey];
      if (!mapping) return;

      mapping.slugs.forEach((slug) => {
        if (mapping.side === 'front' || mapping.side === 'both') {
          applyIntensity(frontIntensity, slug, intensity);
        }
        if (mapping.side === 'back' || mapping.side === 'both') {
          applyIntensity(backIntensity, slug, intensity);
        }
      });
    };

    // Process all exercises
    exercises.forEach((exercise) => {
      // Primary muscles get intensity 2
      exercise.primaryMuscles?.forEach((muscle) => addMuscle(muscle, 2));

      // Secondary muscles get intensity 1
      exercise.secondaryMuscles?.forEach((muscle) => addMuscle(muscle, 1));
    });

    const frontData: BodyPartData[] = Object.entries(frontIntensity).map(([slug, intensity]) => ({
      slug: slug as Slug,
      intensity,
    }));
    const backData: BodyPartData[] = Object.entries(backIntensity).map(([slug, intensity]) => ({
      slug: slug as Slug,
      intensity,
    }));

    return { frontData, backData };
  }, [exercises]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.bodiesContainer}>
        <View style={styles.bodyWrapper}>
          <Body
            data={frontData}
            side="front"
            gender={gender}
            scale={scale}
            colors={heatmapColors}
            border={isDark ? '#333333' : '#cccccc'}
          />
          {!compact && <Text style={[styles.viewLabel, { color: colors.textSecondary }]}>Front</Text>}
        </View>
        <View style={styles.bodyWrapper}>
          <Body
            data={backData}
            side="back"
            gender={gender}
            scale={scale}
            colors={heatmapColors}
            border={isDark ? '#333333' : '#cccccc'}
          />
          {!compact && <Text style={[styles.viewLabel, { color: colors.textSecondary }]}>Back</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  containerCompact: {
    padding: 0,
    marginBottom: 0,
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
