import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';

type InsightSparklineProps = {
  values: number[];
  height?: number;
  stroke?: string;
  highlightIndices?: number[];
};

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 36;
const PADDING = 6;

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
const getCoordinates = (values: number[], minValue: number, maxValue: number) => {
  const range = maxValue - minValue || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (values.length - 1);
  return values.map((value, index) => ({
    x: PADDING + step * index,
    y: VIEWBOX_HEIGHT - PADDING - ((value - minValue) / range) * (VIEWBOX_HEIGHT - PADDING * 2),
  }));
};

// Build smooth bezier curve path using Catmull-Rom spline conversion
const buildSmoothPath = (values: number[], minValue: number, maxValue: number): string => {
  if (values.length < 2) {
    const y = VIEWBOX_HEIGHT / 2;
    return `M ${PADDING} ${y} L ${VIEWBOX_WIDTH - PADDING} ${y}`;
  }

  const coords = getCoordinates(values, minValue, maxValue);

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

const getPoint = (values: number[], index: number, minValue: number, maxValue: number) => {
  if (values.length < 2) {
    return { x: PADDING, y: VIEWBOX_HEIGHT / 2 };
  }
  const range = maxValue - minValue || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (values.length - 1);
  const x = PADDING + step * index;
  const y = VIEWBOX_HEIGHT - PADDING - ((values[index] - minValue) / range) * (VIEWBOX_HEIGHT - PADDING * 2);
  return { x, y };
};

export function InsightSparkline({
  values,
  height = 36,
  stroke,
  highlightIndices = [],
}: InsightSparklineProps) {
  const { colors, isDark } = useTheme();
  const lineColor = stroke ?? colors.accent;
  const { minValue, maxValue } = resolveScale(values);
  const path = buildSmoothPath(values, minValue, maxValue);
  const canHighlight = values.length > 1;
  const highlightSet = new Set(highlightIndices);
  if (canHighlight) {
    highlightSet.add(values.length - 1);
  }

  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        {/* Smooth bezier curve line */}
        <Path
          d={path}
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Enhanced data points with subtle glow */}
        {canHighlight &&
          Array.from(highlightSet).map((index) => {
            if (index < 0 || index >= values.length) return null;
            const point = getPoint(values, index, minValue, maxValue);
            return (
              <React.Fragment key={`spark-${index}`}>
                {/* Outer glow (smaller for sparkline) */}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={lineColor}
                  opacity={0.15}
                />
                {/* Main point */}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={lineColor}
                />
                {/* Inner highlight */}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={1.5}
                  fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)'}
                />
              </React.Fragment>
            );
          })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
});
