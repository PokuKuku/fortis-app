import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { type Slug } from 'react-native-body-highlighter';
import { bodyFront } from 'react-native-body-highlighter/assets/bodyFront';
import { bodyBack } from 'react-native-body-highlighter/assets/bodyBack';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  type HeatmapRegion,
  type MuscleKey,
  MUSCLE_TO_HEATMAP_REGIONS,
} from '@/src/utils/muscleTaxonomy';

type FocusedHeatmapSide = 'front' | 'back';

export type FocusedHeatmapCrop =
  | 'balanced'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'glutes'
  | 'core';

type FocusedMuscleHeatmapIconProps = {
  muscleLevels: Partial<Record<MuscleKey, number>>;
  side: FocusedHeatmapSide;
  crop: FocusedHeatmapCrop;
  highlightSlugs?: Slug[];
  width?: number;
  height?: number;
};

type LocalBodyPart = {
  slug?: Slug;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
};

const CROP_VIEW_BOXES: Record<FocusedHeatmapCrop, string> = {
  balanced: '165 300 420 315',
  chest: '215 295 300 225',
  back: '900 300 380 285',
  shoulders: '155 270 430 323',
  arms: '145 330 445 334',
  legs: '115 815 310 465',
  glutes: '945 595 310 233',
  core: '225 400 285 214',
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

export function FocusedMuscleHeatmapIcon({
  muscleLevels,
  side,
  crop,
  highlightSlugs = [],
  width = 64,
  height = 48,
}: FocusedMuscleHeatmapIconProps) {
  const { colors, isDark } = useTheme();
  const heatmapColors = buildHeatmapPalette(colors.accentLight, colors.accent, colors.accentDark);
  const baseBodyFill = isDark ? '#5B626D' : '#8C949E';
  const bodySource = side === 'front' ? bodyFront : bodyBack;

  const intensityBySlug = useMemo(() => {
    const next: Partial<Record<Slug, number>> = {};

    Object.entries(muscleLevels).forEach(([muscleKey, level]) => {
      if (level <= 0) return;
      const regions = MUSCLE_TO_HEATMAP_REGIONS[muscleKey as MuscleKey];
      if (!regions) return;

      regions.forEach((region: HeatmapRegion) => {
        if (region.side && region.side !== 'both' && region.side !== side) return;
        const slug = region.slug as Slug;
        next[slug] = Math.max(next[slug] ?? 0, level);
      });
    });

    highlightSlugs.forEach((slug) => {
      next[slug] = Math.max(next[slug] ?? 0, 5);
    });

    return next;
  }, [highlightSlugs, muscleLevels, side]);

  const fillFor = (bodyPart: LocalBodyPart) => {
    const intensity = bodyPart.slug ? intensityBySlug[bodyPart.slug] : 0;
    if (!intensity || intensity <= 0) return baseBodyFill;
    return heatmapColors[intensity - 1] ?? heatmapColors[0] ?? baseBodyFill;
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox={CROP_VIEW_BOXES[crop]}
      preserveAspectRatio="xMidYMid meet"
    >
      {bodySource.flatMap((bodyPart) => {
        const localPart = bodyPart as LocalBodyPart;
        const fill = fillFor(localPart);
        const commonPaths = (localPart.path?.common || []).map((path) => (
          <Path key={`${localPart.slug}-common-${path}`} fill={fill} d={path} />
        ));
        const leftPaths = (localPart.path?.left || []).map((path) => (
          <Path key={`${localPart.slug}-left-${path}`} fill={fill} d={path} />
        ));
        const rightPaths = (localPart.path?.right || []).map((path) => (
          <Path key={`${localPart.slug}-right-${path}`} fill={fill} d={path} />
        ));
        return [...commonPaths, ...leftPaths, ...rightPaths];
      })}
    </Svg>
  );
}
