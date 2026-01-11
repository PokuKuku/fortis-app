import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';

type InsightSparklineProps = {
  values: number[];
  height?: number;
  stroke?: string;
  highlightIndices?: number[];
  variant?: 'line' | 'area' | 'bars';
  fill?: string;
  fillOpacity?: number;
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
  variant = 'line',
  fill,
  fillOpacity,
}: InsightSparklineProps) {
  const { colors, isDark } = useTheme();
  const lineColor = stroke ?? colors.accent;
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
        {variant === 'bars' ? (() => {
          const maxValue = Math.max(...values, 0);
          const minValue = Math.min(...values, 0);
          const range = maxValue - minValue || 1;
          const chartHeight = VIEWBOX_HEIGHT - PADDING * 2;
          const step = (VIEWBOX_WIDTH - PADDING * 2) / Math.max(values.length, 1);
          const barWidth = Math.max(step * 0.6, 4);
          const baselineY = VIEWBOX_HEIGHT - PADDING - ((0 - minValue) / range) * chartHeight;
          return values.map((value, index) => {
            const barHeight = Math.abs((value - 0) / range) * chartHeight;
            const x = PADDING + step * index + (step - barWidth) / 2;
            const y = value >= 0 ? baselineY - barHeight : baselineY;
            const isHighlight = highlightSet.has(index);
            return (
              <Path
                key={`bar-${index}`}
                d={`M ${x} ${y} h ${barWidth} v ${barHeight} h ${-barWidth} Z`}
                fill={lineColor}
                opacity={isHighlight ? 0.9 : 0.35}
              />
            );
          });
        })() : (() => {
          const { minValue, maxValue } = resolveScale(values);
          const path = buildSmoothPath(values, minValue, maxValue);
          const coords = values.length > 1 ? getCoordinates(values, minValue, maxValue) : [];
          const baselineY = VIEWBOX_HEIGHT - PADDING;
          const areaPath = coords.length > 1
            ? `${path} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`
            : null;

          return (
            <>
              {variant === 'area' && areaPath && (
                <Path
                  d={areaPath}
                  fill={fill ?? lineColor}
                  opacity={fillOpacity ?? 0.2}
                />
              )}

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
            </>
          );
        })()}
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
