import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { InsightBarPoint } from '@/src/types/insightCharts';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { moderateScale, scale } from '@/src/utils/responsive';

type InsightRadarChartProps = {
  data: InsightBarPoint[];
  compact?: boolean;
};

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 250;
const CENTER_X = VIEWBOX_WIDTH / 2;
const DEFAULT_CENTER_Y = 120;
const DEFAULT_OUTER_RADIUS = 84;
const GRID_LEVELS = 4;
const TOOLTIP_WIDTH = 120;
const TOOLTIP_HEIGHT = 34;
const TOOLTIP_PADDING = 8;

const pointFor = (centerX: number, centerY: number, radius: number, angle: number) => ({
  x: centerX + radius * Math.cos(angle),
  y: centerY + radius * Math.sin(angle),
});

const getTextAnchor = (cosValue: number): 'start' | 'middle' | 'end' => {
  if (cosValue > 0.28) return 'start';
  if (cosValue < -0.28) return 'end';
  return 'middle';
};

// Compress high outliers so one dominant muscle does not visually flatten the others.
const compressRatio = (value: number): number => Math.sqrt(Math.max(value, 0));

const formatRadarValue = (value: number): string => {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  const rounded = Number(value.toFixed(2));
  return `${rounded}`;
};

export function InsightRadarChart({ data, compact = false }: InsightRadarChartProps) {
  const { colors, isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const filtered = data.filter((item) => item.value > 0);
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const axisCount = data.length;
  const centerY = compact ? 98 : DEFAULT_CENTER_Y;
  const outerRadius = compact ? 66 : DEFAULT_OUTER_RADIUS;
  const labelRadius = outerRadius + (compact ? 18 : 24);
  const viewBoxHeight = compact ? 210 : VIEWBOX_HEIGHT;
  const svgHeight = compact ? scale(190) : scale(230);

  if (axisCount < 3 || maxValue <= 0 || filtered.length === 0) {
    return (
      <View
        style={[
          styles.emptyState,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          No muscle breakdown yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
          Complete more working sets to map muscle emphasis.
        </Text>
      </View>
    );
  }

  const angles = data.map((_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / axisCount);
  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, levelIndex) => {
    const ratio = (levelIndex + 1) / GRID_LEVELS;
    return angles
      .map((angle) => {
        const point = pointFor(CENTER_X, centerY, outerRadius * ratio, angle);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  });

  const radarPoints = data.map((item, index) => {
    const ratio = compressRatio(item.value / maxValue);
    const point = pointFor(CENTER_X, centerY, outerRadius * ratio, angles[index]);
    return {
      ...point,
      label: item.label,
      value: item.value,
      angle: angles[index],
    };
  });
  const radarPolygon = radarPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const selectedPoint = selectedIndex === null ? null : radarPoints[selectedIndex];
  const tooltipX = selectedPoint
    ? Math.min(
      Math.max(selectedPoint.x - TOOLTIP_WIDTH / 2, TOOLTIP_PADDING),
      VIEWBOX_WIDTH - TOOLTIP_WIDTH - TOOLTIP_PADDING
    )
    : 0;
  const tooltipY = selectedPoint
    ? Math.min(
      Math.max(selectedPoint.y - (compact ? 48 : 56), TOOLTIP_PADDING),
      viewBoxHeight - TOOLTIP_HEIGHT - TOOLTIP_PADDING
    )
    : 0;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Svg width="100%" height={svgHeight} viewBox={`0 0 ${VIEWBOX_WIDTH} ${viewBoxHeight}`}>
        {gridPolygons.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            points={points}
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'}
            strokeWidth={1}
          />
        ))}

        {angles.map((angle, index) => {
          const edge = pointFor(CENTER_X, centerY, outerRadius, angle);
          return (
            <Line
              key={`axis-${index}`}
              x1={CENTER_X}
              y1={centerY}
              x2={edge.x}
              y2={edge.y}
              stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={radarPolygon}
          fill={colors.accentOverlay}
          stroke={colors.accent}
          strokeWidth={2}
        />

        {radarPoints.map((point, index) => {
          const labelPoint = pointFor(CENTER_X, centerY, labelRadius, point.angle);
          return (
            <React.Fragment key={`point-${index}`}>
              <SvgText
                x={labelPoint.x}
                y={labelPoint.y}
                fill={colors.textSecondary}
                fontSize={11}
                fontWeight="600"
                textAnchor={getTextAnchor(Math.cos(point.angle))}
                alignmentBaseline="middle"
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {selectedPoint && (
          <Rect
            x={0}
            y={0}
            width={VIEWBOX_WIDTH}
            height={viewBoxHeight}
            fill="transparent"
            onPress={() => setSelectedIndex(null)}
          />
        )}

        {radarPoints.map((point, index) => {
          const isSelected = selectedIndex === index;
          return (
            <React.Fragment key={`node-${index}`}>
              <Circle
                cx={point.x}
                cy={point.y}
                r={14}
                fill="transparent"
                onPress={() => {
                  setSelectedIndex((prev) => (prev === index ? null : index));
                }}
              />
              {isSelected && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={6}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2}
                />
              )}
              <Circle cx={point.x} cy={point.y} r={3.5} fill={colors.accent} />
            </React.Fragment>
          );
        })}

        {selectedPoint && (
          <>
            <Rect
              x={tooltipX}
              y={tooltipY}
              rx={8}
              width={TOOLTIP_WIDTH}
              height={TOOLTIP_HEIGHT}
              fill={isDark ? 'rgba(18,18,18,0.94)' : 'rgba(255,255,255,0.96)'}
              stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
              strokeWidth={1}
            />
            <SvgText
              x={tooltipX + TOOLTIP_WIDTH / 2}
              y={tooltipY + 13}
              fill={colors.textPrimary}
              fontSize={11}
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {selectedPoint.label}
            </SvgText>
            <SvgText
              x={tooltipX + TOOLTIP_WIDTH / 2 - 2}
              y={tooltipY + 25}
              fill={colors.textPrimary}
              fontSize={10}
              fontWeight="700"
              textAnchor="end"
              alignmentBaseline="middle"
            >
              {formatRadarValue(selectedPoint.value)}
            </SvgText>
            <SvgText
              x={tooltipX + TOOLTIP_WIDTH / 2 + 2}
              y={tooltipY + 25}
              fill={colors.textTertiary}
              fontSize={10}
              textAnchor="start"
              alignmentBaseline="middle"
            >
              sets
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: scale(Spacing.xs),
    paddingTop: scale(Spacing.sm),
  },
  containerCompact: {
    paddingTop: scale(Spacing.xs),
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: moderateScale(11),
    textAlign: 'center',
  },
});
