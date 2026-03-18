import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type Slug } from 'react-native-body-highlighter';
import { Path } from 'react-native-svg';
import { bodyFront } from 'react-native-body-highlighter/assets/bodyFront';
import { bodyBack } from 'react-native-body-highlighter/assets/bodyBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/assets/bodyFemaleFront';
import { bodyFemaleBack } from 'react-native-body-highlighter/assets/bodyFemaleBack';
import { SvgMaleWrapper } from 'react-native-body-highlighter/components/SvgMaleWrapper';
import { SvgFemaleWrapper } from 'react-native-body-highlighter/components/SvgFemaleWrapper';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import {
  MUSCLE_TO_HEATMAP_REGIONS,
  WEEKLY_MUSCLE_TIER_COLORS,
  type HeatmapRegion,
  type MuscleKey,
  type MuscleTier,
} from '@/src/utils/muscleTaxonomy';

type WeeklyTierMuscleHeatmapProps = {
  muscleLevels: Partial<Record<MuscleKey, number>>;
  gender?: 'male' | 'female';
  scale?: number;
  compact?: boolean;
};

type BodyPartData = {
  slug: Slug;
  intensity: number;
};

type LocalBodyPart = {
  slug?: Slug;
  color?: string;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
};

type TierBodyProps = {
  data: ReadonlyArray<BodyPartData>;
  colors: ReadonlyArray<string>;
  baseColor: string;
  scale: number;
  side: 'front' | 'back';
  gender: 'male' | 'female';
  border: string | 'none';
};

const LEGEND_ORDER: MuscleTier[] = ['S', 'A', 'B', 'C', 'D', 'E'];
const HEATMAP_COLORS = LEGEND_ORDER.slice().reverse().map((tier) => WEEKLY_MUSCLE_TIER_COLORS[tier]);
const LEGEND_HEIGHT = 170;

function TierBody({
  data,
  colors,
  baseColor,
  scale,
  side,
  gender,
  border,
}: TierBodyProps) {
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

export function WeeklyTierMuscleHeatmap({
  muscleLevels,
  gender = 'male',
  scale = 0.45,
  compact = false,
}: WeeklyTierMuscleHeatmapProps) {
  const { colors, isDark } = useTheme();
  const baseBodyFill = isDark ? '#5B626D' : '#8C949E';

  const { frontData, backData } = useMemo(() => {
    const frontIntensity: Record<string, number> = {};
    const backIntensity: Record<string, number> = {};

    const applyIntensity = (target: Record<string, number>, slug: Slug, intensity: number) => {
      const current = target[slug] || 0;
      if (intensity > current) {
        target[slug] = intensity;
      }
    };

    Object.entries(muscleLevels).forEach(([muscleKey, level]) => {
      if (level <= 0) return;
      const regions = MUSCLE_TO_HEATMAP_REGIONS[muscleKey as MuscleKey];
      if (!regions) return;

      regions.forEach((region: HeatmapRegion) => {
        const slug = region.slug as Slug;
        if (region.side === 'front' || region.side === 'both' || !region.side) {
          applyIntensity(frontIntensity, slug, level);
        }
        if (region.side === 'back' || region.side === 'both' || !region.side) {
          applyIntensity(backIntensity, slug, level);
        }
      });
    });

    return {
      frontData: Object.entries(frontIntensity).map(([slug, intensity]) => ({
        slug: slug as Slug,
        intensity,
      })),
      backData: Object.entries(backIntensity).map(([slug, intensity]) => ({
        slug: slug as Slug,
        intensity,
      })),
    };
  }, [muscleLevels]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.legend, compact && styles.legendCompact]}>
        {LEGEND_ORDER.map((tier) => (
          <View key={tier} style={styles.legendRow}>
            <View
              style={[
                styles.legendSwatch,
                compact && styles.legendSwatchCompact,
                { backgroundColor: WEEKLY_MUSCLE_TIER_COLORS[tier] },
              ]}
            />
            <Text
              style={[
                styles.legendLabel,
                compact && styles.legendLabelCompact,
                { color: colors.textSecondary },
              ]}
            >
              {tier} tier
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.bodiesContainer}>
        <View style={styles.bodyWrapper}>
          <TierBody
            data={frontData}
            side="front"
            gender={gender}
            scale={scale}
            colors={HEATMAP_COLORS}
            baseColor={baseBodyFill}
            border={isDark ? '#333333' : '#cccccc'}
          />
        </View>
        <View style={styles.bodyWrapper}>
          <TierBody
            data={backData}
            side="back"
            gender={gender}
            scale={scale}
            colors={HEATMAP_COLORS}
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  containerCompact: {
    gap: Spacing.sm,
  },
  legend: {
    alignSelf: 'center',
    height: LEGEND_HEIGHT,
    justifyContent: 'space-between',
    marginRight: Spacing.md,
    gap: 4,
  },
  legendCompact: {
    alignSelf: 'center',
    marginRight: Spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.sm,
  },
  legendSwatchCompact: {
    width: 10,
    height: 10,
  },
  legendLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  legendLabelCompact: {
    fontSize: 9,
    letterSpacing: 0.35,
  },
  bodiesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  bodyWrapper: {
    alignItems: 'center',
    flexShrink: 1,
  },
});
