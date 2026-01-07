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

const buildPath = (values: number[], minValue: number, maxValue: number): string => {
  if (values.length < 2) {
    const y = VIEWBOX_HEIGHT / 2;
    return `M ${PADDING} ${y} L ${VIEWBOX_WIDTH - PADDING} ${y}`;
  }

  const range = maxValue - minValue || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = PADDING + step * index;
      const y = VIEWBOX_HEIGHT - PADDING - ((value - minValue) / range) * (VIEWBOX_HEIGHT - PADDING * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
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
  const { colors } = useTheme();
  const lineColor = stroke ?? colors.accent;
  const { minValue, maxValue } = resolveScale(values);
  const path = buildPath(values, minValue, maxValue);
  const canHighlight = values.length > 1;

  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <Path
          d={path}
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {canHighlight &&
          highlightIndices.map((index) => {
            if (index < 0 || index >= values.length) return null;
            const point = getPoint(values, index, minValue, maxValue);
            return (
              <Circle
                key={`spark-${index}`}
                cx={point.x}
                cy={point.y}
                r={2.8}
                fill={lineColor}
              />
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
