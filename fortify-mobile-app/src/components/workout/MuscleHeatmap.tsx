import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type Slug } from 'react-native-body-highlighter';
import { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { bodyFront } from 'react-native-body-highlighter/assets/bodyFront';
import { bodyBack } from 'react-native-body-highlighter/assets/bodyBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/assets/bodyFemaleFront';
import { bodyFemaleBack } from 'react-native-body-highlighter/assets/bodyFemaleBack';
import { SvgMaleWrapper } from 'react-native-body-highlighter/components/SvgMaleWrapper';
import { SvgFemaleWrapper } from 'react-native-body-highlighter/components/SvgFemaleWrapper';
import { useTheme } from '@/src/contexts/ThemeContext';
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
  muscleLevels?: Partial<Record<MuscleKey, number>>;
  gender?: 'male' | 'female';
  scale?: number;
  compact?: boolean;
  baselineIntensity?: number;
  showLegend?: boolean;
}

interface BodyPartData {
  slug: Slug;
  intensity: number;
  side?: 'left' | 'right';
}

type LocalBodyPart = {
  slug?: Slug;
  color?: string;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
};

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

const TRAINABLE_HEATMAP_SLUGS: Slug[] = [
  'chest',
  'obliques',
  'abs',
  'biceps',
  'triceps',
  'trapezius',
  'deltoids',
  'adductors',
  'quadriceps',
  'tibialis',
  'calves',
  'forearm',
  'upper-back',
  'lower-back',
  'gluteal',
  'hamstring',
] as Slug[];

function AccentBody({
  data,
  colors,
  baseColor,
  scale,
  side,
  gender,
  border,
}: {
  data: ReadonlyArray<BodyPartData>;
  colors: ReadonlyArray<string>;
  baseColor: string;
  scale: number;
  side: 'front' | 'back';
  gender: 'male' | 'female';
  border: string | 'none';
}) {
  const SvgWrapper = gender === 'male' ? SvgMaleWrapper : SvgFemaleWrapper;
  const bodySource =
    gender === 'female'
      ? side === 'front'
        ? bodyFemaleFront
        : bodyFemaleBack
      : side === 'front'
      ? bodyFront
      : bodyBack;

  const getFillFor = (bodyPart: LocalBodyPart) => {
    const match = data.find((item) => item.slug === bodyPart.slug);
    if (!match || match.intensity <= 0) return baseColor;
    return colors[match.intensity - 1] ?? colors[0] ?? baseColor;
  };

  return (
    <SvgWrapper side={side} scale={scale} border={border}>
      {bodySource.flatMap((bodyPart) => {
        const fill = getFillFor(bodyPart as LocalBodyPart);
        const commonPaths = (bodyPart.path?.common || []).map((path) => (
          <Path key={`${bodyPart.slug}-common-${path}`} id={bodyPart.slug} fill={fill} d={path} />
        ));
        const leftPaths = (bodyPart.path?.left || []).map((path) => (
          <Path key={`${bodyPart.slug}-left-${path}`} id={bodyPart.slug} fill={fill} d={path} />
        ));
        const rightPaths = (bodyPart.path?.right || []).map((path) => (
          <Path key={`${bodyPart.slug}-right-${path}`} id={bodyPart.slug} fill={fill} d={path} />
        ));
        return [...commonPaths, ...leftPaths, ...rightPaths];
      })}
    </SvgWrapper>
  );
}

export function MuscleHeatmap({
  exercises,
  muscleLevels,
  gender = 'male',
  scale = 0.5,
  compact = false,
  baselineIntensity = 0,
  showLegend = false,
}: MuscleHeatmapProps) {
  const { colors, isDark } = useTheme();

  // 5-level palette from accent colors (low -> high intensity)
  const heatmapColors = buildHeatmapPalette(colors.accentLight, colors.accent, colors.accentDark);
  const legendColors: [string, string, string, string] = isDark
    ? ['#3D4654', '#8EA6C0', colors.accent, '#020817']
    : ['#F2F6FB', '#91A9C4', colors.accent, '#081323'];
  const baseBodyFill = isDark ? '#5B626D' : '#8C949E';

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
      ?? (exercises ? bucketIntensity(attributeExercisesToMuscles(exercises as any)) : {});

    if (baselineIntensity > 0) {
      TRAINABLE_HEATMAP_SLUGS.forEach((slug) => {
        applyIntensity(frontIntensity, slug, baselineIntensity);
        applyIntensity(backIntensity, slug, baselineIntensity);
      });
    }

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
  }, [baselineIntensity, exercises, muscleLevels]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {showLegend ? (
        <View style={styles.legend}>
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
          <LinearGradient
            colors={legendColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            locations={[0, 0.28, 0.62, 1]}
            style={[styles.legendTrack, { borderColor: colors.glassBorder }]}
          />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
        </View>
      ) : null}
      <View style={styles.bodiesContainer}>
        <View style={styles.bodyWrapper}>
          <AccentBody
            data={frontData}
            side="front"
            gender={gender}
            scale={scale}
            colors={heatmapColors}
            baseColor={baseBodyFill}
            border={isDark ? '#333333' : '#cccccc'}
          />
        </View>
        <View style={styles.bodyWrapper}>
          <AccentBody
            data={backData}
            side="back"
            gender={gender}
            scale={scale}
            colors={heatmapColors}
            baseColor={baseBodyFill}
            border={isDark ? '#333333' : '#cccccc'}
          />
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
  legend: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  legendTrack: {
    width: 108,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  legendLabel: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bodyWrapper: {
    alignItems: 'center',
  },
});
