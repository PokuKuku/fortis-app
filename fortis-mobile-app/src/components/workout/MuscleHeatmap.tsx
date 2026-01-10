import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Body, { Slug } from 'react-native-body-highlighter';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Sizes';
import {
  type MuscleKey,
  type HeatmapRegion,
  MUSCLE_TO_HEATMAP_REGIONS,
  attributeExercisesToMuscles,
  bucketIntensity,
} from '@/src/utils/muscleTaxonomy';

interface Exercise {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
}

interface MuscleHeatmapProps {
  exercises?: Exercise[];
  muscleLevels?: Record<MuscleKey, number>;
  gender?: 'male' | 'female';
  scale?: number;
  compact?: boolean;
}

interface BodyPartData {
  slug: Slug;
  intensity: number;
  side?: 'left' | 'right';
}

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return null;
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  return { r, g, b };
};

const mixHex = (start: string, end: string, ratio: number) => {
  const a = hexToRgb(start);
  const b = hexToRgb(end);
  if (!a || !b) return start;
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
  const r = clamp(a.r + (b.r - a.r) * ratio);
  const g = clamp(a.g + (b.g - a.g) * ratio);
  const bVal = clamp(a.b + (b.b - a.b) * ratio);
  return `#${[r, g, bVal].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

const buildHeatmapPalette = (light: string, base: string, dark: string) => ([
  light,
  mixHex(light, base, 0.6),
  base,
  mixHex(base, dark, 0.6),
  dark,
]);

export function MuscleHeatmap({ exercises, muscleLevels, gender = 'male', scale = 0.5, compact = false }: MuscleHeatmapProps) {
  const { colors, isDark } = useTheme();

  // 5-level palette from accent colors (low -> high intensity)
  const heatmapColors = buildHeatmapPalette(colors.accentLight, colors.accent, colors.accentDark);

  const { frontData, backData } = useMemo(() => {
    const frontIntensity: Record<string, number> = {};
    const backIntensity: Record<string, number> = {};

    const applyIntensity = (target: Record<string, number>, slug: Slug, intensity: number) => {
      const current = target[slug] || 0;
      // Take max intensity when multiple muscles map to the same region
      if (intensity > current) {
        target[slug] = intensity;
      }
    };

    const resolvedLevels = muscleLevels
      ?? (exercises ? bucketIntensity(attributeExercisesToMuscles(exercises)) : {});

    Object.entries(resolvedLevels).forEach(([muscleKey, level]) => {
      if (level <= 0) return;
      const regions = MUSCLE_TO_HEATMAP_REGIONS[muscleKey as MuscleKey];
      if (!regions) return;
      regions.forEach((region: HeatmapRegion) => {
        const slug = region.slug as Slug;
        if (!slug) return;
        if (region.side === 'front' || region.side === 'both' || !region.side) {
          applyIntensity(frontIntensity, slug, level);
        }
        if (region.side === 'back' || region.side === 'both' || !region.side) {
          applyIntensity(backIntensity, slug, level);
        }
      });
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
  }, [exercises, muscleLevels]);

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
