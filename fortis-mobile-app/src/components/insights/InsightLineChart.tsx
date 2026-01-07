import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { InsightChartPoint } from '@/src/types/insightCharts';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';

type HighlightRange = { start: string; end: string };

type InsightLineChartProps = {
  points: InsightChartPoint[];
  height?: number;
  stroke?: string;
  highlightRange?: HighlightRange;
  highlightPoints?: string[];
  emptyLabel?: string;
  xLabel?: string;
  yLabel?: string;
  formatYValue?: (value: number) => string;
  formatXValue?: (value: string) => string;
};

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 160;
const PADDING = 18;
const Y_AXIS_WIDTH = scale(46);
const GRID_LINE_COUNT = 2;

const trimTrailingZero = (value: string): string => value.replace(/\.0$/, '');

const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return trimTrailingZero((value / 1_000_000).toFixed(1)) + 'm';
  }
  if (absValue >= 1000) {
    return trimTrailingZero((value / 1000).toFixed(1)) + 'k';
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return trimTrailingZero(value.toFixed(1));
};

const resolveScale = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range === 0 ? Math.max(Math.abs(max) * 0.1, 1) : range * 0.15;
  return {
    min,
    max,
    minValue: min - pad,
    maxValue: max + pad,
  };
};

// Calculate coordinates for all points
const getCoordinates = (points: InsightChartPoint[], minValue: number, maxValue: number) => {
  const range = maxValue - minValue || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);
  return points.map((point, index) => ({
    x: PADDING + step * index,
    y: VIEWBOX_HEIGHT - PADDING - ((point.value - minValue) / range) * (VIEWBOX_HEIGHT - PADDING * 2),
  }));
};

// Build smooth bezier curve path using Catmull-Rom spline conversion
const buildSmoothPath = (points: InsightChartPoint[], minValue: number, maxValue: number): string => {
  if (points.length < 2) {
    const y = VIEWBOX_HEIGHT / 2;
    return `M ${PADDING} ${y} L ${VIEWBOX_WIDTH - PADDING} ${y}`;
  }

  const coords = getCoordinates(points, minValue, maxValue);

  if (coords.length === 2) {
    return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
  }

  // Catmull-Rom to Bezier conversion with tension
  const tension = 0.3;
  let path = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

const resolveHighlightRange = (
  points: InsightChartPoint[],
  highlightRange?: HighlightRange
): { startIndex: number; endIndex: number } | null => {
  if (!highlightRange || points.length < 2) return null;
  const startTime = new Date(highlightRange.start).getTime();
  const endTime = new Date(highlightRange.end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null;

  let startIndex = points.findIndex((point) => new Date(point.date).getTime() >= startTime);
  if (startIndex === -1) startIndex = 0;
  let endIndex = -1;
  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (new Date(points[i].date).getTime() <= endTime) {
      endIndex = i;
      break;
    }
  }
  if (endIndex === -1) endIndex = points.length - 1;
  if (endIndex < startIndex) return null;
  return { startIndex, endIndex };
};

const getPoint = (points: InsightChartPoint[], index: number, minValue: number, maxValue: number) => {
  const range = maxValue - minValue || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);
  const x = PADDING + step * index;
  const y = VIEWBOX_HEIGHT - PADDING - ((points[index].value - minValue) / range) * (VIEWBOX_HEIGHT - PADDING * 2);
  return { x, y };
};

export function InsightLineChart({
  points,
  height = 180,
  stroke,
  highlightRange,
  highlightPoints = [],
  emptyLabel = 'Not enough data yet',
  xLabel,
  yLabel,
  formatYValue,
  formatXValue,
}: InsightLineChartProps) {
  const { colors, isDark } = useTheme();
  const lineColor = stroke ?? colors.accent;

  if (points.length < 2) {
    return (
      <View
        style={[
          styles.emptyState,
          {
            height,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          {emptyLabel}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
          Log more sessions to unlock the trend.
        </Text>
      </View>
    );
  }

  const values = points.map((point) => point.value);
  const { min, max, minValue, maxValue } = resolveScale(values);
  const path = buildSmoothPath(points, minValue, maxValue);
  const highlight = resolveHighlightRange(points, highlightRange);
  const highlightSet = new Set(highlightPoints);
  const lastPointDate = points[points.length - 1]?.date;
  if (lastPointDate) {
    highlightSet.add(lastPointDate);
  }
  const mid = (min + max) / 2;
  const yTicks = [max, mid, min];
  const xStart = points[0]?.date;
  const xEnd = points[points.length - 1]?.date;

  const formatY = formatYValue ?? formatCompactNumber;
  const formatX = formatXValue ?? ((value: string) => value.slice(5, 10).replace('-', '/'));

  const highlightRect = highlight
    ? (() => {
        const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);
        const x = PADDING + step * highlight.startIndex;
        const width = step * (highlight.endIndex - highlight.startIndex || 1);
        return { x, width };
      })()
    : null;

  return (
    <View style={styles.wrapper}>
      {yLabel && (
        <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
          {yLabel}
        </Text>
      )}
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yTicks.map((tick, index) => (
            <Text key={`tick-${index}`} style={[styles.yAxisText, { color: colors.textTertiary }]}>
              {formatY(tick)}
            </Text>
          ))}
        </View>
        <View
          style={[
            styles.chartContainer,
            {
              height,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          >
            {highlightRect && (
              <Rect
                x={highlightRect.x}
                y={PADDING}
                width={highlightRect.width}
                height={VIEWBOX_HEIGHT - PADDING * 2}
                fill={colors.accentOverlay}
              />
            )}

            {/* Refined grid lines - subtle solid lines */}
            {Array.from({ length: GRID_LINE_COUNT }).map((_, index) => {
              const y =
                PADDING +
                ((VIEWBOX_HEIGHT - PADDING * 2) / (GRID_LINE_COUNT + 1)) * (index + 1);
              return (
                <Line
                  key={`grid-${index}`}
                  x1={PADDING}
                  x2={VIEWBOX_WIDTH - PADDING}
                  y1={y}
                  y2={y}
                  stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth={0.5}
                />
              );
            })}

            {/* Smooth bezier curve line */}
            <Path
              d={path}
              stroke={lineColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Enhanced data points with glow effect */}
            {points.map((point, index) => {
              if (!highlightSet.has(point.date)) return null;
              const pos = getPoint(points, index, minValue, maxValue);
              return (
                <React.Fragment key={`highlight-${index}`}>
                  {/* Outer glow */}
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={8}
                    fill={lineColor}
                    opacity={0.15}
                  />
                  {/* Main point */}
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4.5}
                    fill={lineColor}
                  />
                  {/* Inner highlight for depth */}
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={2}
                    fill={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)'}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </View>
      <View style={styles.xAxis}>
        <Text style={[styles.xAxisText, { color: colors.textTertiary }]}>
          {xStart ? formatX(xStart) : ''}
        </Text>
        {xLabel && (
          <Text style={[styles.xAxisLabel, { color: colors.textTertiary }]}>
            {xLabel}
          </Text>
        )}
        <Text style={[styles.xAxisText, { color: colors.textTertiary }]}>
          {xEnd ? formatX(xEnd) : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: scale(Spacing.xs),
  },
  chartContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.xs),
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    justifyContent: 'space-between',
  },
  yAxisText: {
    fontSize: moderateScale(10),
    textAlign: 'right',
  },
  axisLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  xAxis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xAxisText: {
    fontSize: moderateScale(10),
  },
  xAxisLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.caption,
    fontSize: 11,
    textAlign: 'center',
  },
});
