import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { InsightChartPoint } from '@/src/types/insightCharts';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';

type HighlightRange = { start: string; end: string };

type InsightLineChartProps = {
  points: InsightChartPoint[];
  height?: number;
  stroke?: string;
  highlightRange?: HighlightRange;
  highlightPoints?: string[];
  emptyLabel?: string;
};

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 160;
const PADDING = 18;

const buildPath = (points: InsightChartPoint[]): string => {
  if (points.length < 2) {
    const y = VIEWBOX_HEIGHT / 2;
    return `M ${PADDING} ${y} L ${VIEWBOX_WIDTH - PADDING} ${y}`;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);

  return points
    .map((point, index) => {
      const x = PADDING + step * index;
      const y = VIEWBOX_HEIGHT - PADDING - ((point.value - min) / range) * (VIEWBOX_HEIGHT - PADDING * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
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

const getPoint = (points: InsightChartPoint[], index: number) => {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);
  const x = PADDING + step * index;
  const y = VIEWBOX_HEIGHT - PADDING - ((points[index].value - min) / range) * (VIEWBOX_HEIGHT - PADDING * 2);
  return { x, y };
};

export function InsightLineChart({
  points,
  height = 180,
  stroke,
  highlightRange,
  highlightPoints = [],
  emptyLabel = 'Not enough data yet',
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

  const path = buildPath(points);
  const highlight = resolveHighlightRange(points, highlightRange);
  const highlightSet = new Set(highlightPoints);

  const highlightRect = highlight
    ? (() => {
        const step = (VIEWBOX_WIDTH - PADDING * 2) / (points.length - 1);
        const x = PADDING + step * highlight.startIndex;
        const width = step * (highlight.endIndex - highlight.startIndex || 1);
        return { x, width };
      })()
    : null;

  return (
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
        <Path d={path} stroke={lineColor} strokeWidth={2.5} fill="none" />
        {points.map((point, index) => {
          if (!highlightSet.has(point.date)) return null;
          const pos = getPoint(points, index);
          return (
            <Circle
              key={`highlight-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={4}
              fill={lineColor}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
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
