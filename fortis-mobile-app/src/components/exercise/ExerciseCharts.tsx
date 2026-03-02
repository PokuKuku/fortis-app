import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { format } from 'date-fns';
import { useFont } from '@shopify/react-native-skia';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';

// Try to import victory-native, fall back gracefully if Skia unavailable
let ChartsAvailable = false;
let CartesianChart: any, Line: any, Scatter: any;

try {
  const victory = require('victory-native');
  CartesianChart = victory.CartesianChart;
  Line = victory.Line;
  Scatter = victory.Scatter;
  ChartsAvailable = true;
} catch (e) {
  // Skia not available - charts will show fallback
}

interface ChartDataPoint {
  x: number;
  weight: number;
  volume: number;
  e1rm: number;
  date: Date;
}

interface ExerciseChartsProps {
  chartData: ChartDataPoint[];
  formatVolume: (volume: number) => string;
  unitLabel: string;
}

type ChartMetric = 'weight' | 'volume' | 'e1rm';
type ChartSelection = { metric: ChartMetric; index: number } | null;

const TOOLTIP_WIDTH = 140;

export function ExerciseCharts({ chartData, formatVolume, unitLabel }: ExerciseChartsProps) {
  const { colors, isDark } = useTheme();
  const [chartWidths, setChartWidths] = useState<Record<ChartMetric, number>>({
    weight: 0,
    volume: 0,
    e1rm: 0,
  });
  const [selection, setSelection] = useState<ChartSelection>(null);
  const axisFont = useFont(
    require('../../../assets/fonts/BankGothicMediumBT.ttf'),
    10
  );
  const xValues = useMemo(
    () => chartData.map((point) => point.x).filter((value) => Number.isFinite(value)),
    [chartData]
  );
  const minX = xValues.length ? Math.min(...xValues) : null;
  const maxX = xValues.length ? Math.max(...xValues) : null;

  useEffect(() => {
    setSelection(null);
  }, [chartData]);

  const dateTicks = (() => {
    if (!chartData.length) return [];
    const targetCount = Math.min(4, chartData.length);
    if (!xValues.length) return [];
    const localMinX = Math.min(...xValues);
    const localMaxX = Math.max(...xValues);
    if (targetCount === 1 || localMinX === localMaxX) return [localMinX];
    const step = (localMaxX - localMinX) / (targetCount - 1);
    const evenlySpacedTicks = Array.from({ length: targetCount }, (_, index) => localMinX + step * index);
    const seenDayLabels = new Set<string>();
    const dedupedTicks: number[] = [];

    evenlySpacedTicks.forEach((tick) => {
      const dayLabel = format(new Date(tick), 'd');
      if (seenDayLabels.has(dayLabel)) return;
      seenDayLabels.add(dayLabel);
      dedupedTicks.push(tick);
    });

    return dedupedTicks;
  })();
  const formatDateTick = (value: number) => {
    if (!Number.isFinite(value)) return '';
    return format(new Date(value), 'd');
  };
  const chartPadding = { top: 18, bottom: 38, left: 80, right: 4 };
  const plotInset = 8;

  const handleChartLayout = (metric: ChartMetric) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setChartWidths((prev) => (prev[metric] === width ? prev : { ...prev, [metric]: width }));
  };

  const resolveNearestPointIndex = (tapX: number, chartWidth: number) => {
    if (!chartData.length || !Number.isFinite(tapX) || chartWidth <= 0 || minX === null || maxX === null) {
      return null;
    }
    const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
    if (plotWidth <= 0) return null;

    if (minX === maxX) return 0;

    const clampedX = Math.min(Math.max(tapX - chartPadding.left, 0), plotWidth);
    const tappedDomainX = minX + (clampedX / plotWidth) * (maxX - minX);
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    chartData.forEach((point, index) => {
      const distance = Math.abs(point.x - tappedDomainX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const handleChartPress = (metric: ChartMetric) => (event: GestureResponderEvent) => {
    const chartWidth = chartWidths[metric];
    const index = resolveNearestPointIndex(event.nativeEvent.locationX, chartWidth);
    if (index === null) return;
    setSelection((prev) => {
      if (prev?.metric === metric && prev.index === index) return null;
      return { metric, index };
    });
  };

  const resolveTooltipLeft = (pointX: number, chartWidth: number) => {
    if (chartWidth <= 0 || minX === null || maxX === null) return plotInset;
    const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
    if (plotWidth <= 0) return plotInset;
    const ratio = maxX === minX ? 0.5 : (pointX - minX) / (maxX - minX);
    const x = chartPadding.left + ratio * plotWidth;
    return Math.min(
      Math.max(x - TOOLTIP_WIDTH / 2, plotInset),
      chartWidth - TOOLTIP_WIDTH - plotInset
    );
  };

  const formatMetricValue = (metric: ChartMetric, point: ChartDataPoint) => {
    if (metric === 'weight') {
      const value = point.weight;
      return Number.isInteger(value) ? `${value} ${unitLabel}` : `${value.toFixed(1)} ${unitLabel}`;
    }
    if (metric === 'volume') {
      return `${formatVolume(point.volume)} ${unitLabel}`;
    }
    return `${Math.round(point.e1rm)} ${unitLabel}`;
  };

  const renderTooltip = (metric: ChartMetric) => {
    if (!selection || selection.metric !== metric) return null;
    const point = chartData[selection.index];
    const chartWidth = chartWidths[metric];
    if (!point || chartWidth <= 0) return null;
    return (
      <View
        style={[
          styles.chartTooltip,
          {
            left: resolveTooltipLeft(point.x, chartWidth),
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            backgroundColor: isDark ? 'rgba(18,18,18,0.94)' : 'rgba(255,255,255,0.96)',
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.tooltipValue, { color: colors.textPrimary }]}>
          {formatMetricValue(metric, point)}
        </Text>
        <Text style={[styles.tooltipLabel, { color: colors.textTertiary }]}>
          {format(new Date(point.x), 'MMM d, yyyy')}
        </Text>
      </View>
    );
  };

  // Theme-aware styles
  const themedStyles = {
    sectionTitle: { color: colors.textSecondary },
    placeholderTabText: { color: colors.textSecondary },
    placeholderTabSubtext: { color: colors.textTertiary },
    chartContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    gridLineColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    frameColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    axisLabel: { color: colors.textTertiary },
  };

  // Not enough data
  if (chartData.length < 2) {
    return (
      <View style={styles.placeholderTab}>
        <Text style={[styles.placeholderTabText, themedStyles.placeholderTabText]}>Not enough data</Text>
        <Text style={[styles.placeholderTabSubtext, themedStyles.placeholderTabSubtext]}>
          Log at least 2 workouts with this exercise to see progress charts
        </Text>
      </View>
    );
  }

  // Skia/victory-native not available
  if (!ChartsAvailable) {
    return (
      <View style={styles.placeholderTab}>
        <Text style={[styles.placeholderTabText, themedStyles.placeholderTabText]}>Charts unavailable</Text>
        <Text style={[styles.placeholderTabSubtext, themedStyles.placeholderTabSubtext]}>
          Charts require a development build. Run `npx expo run:ios` to enable.
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Weight Progress Chart */}
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>WEIGHT PROGRESS</Text>
      <View
        style={[styles.chartContainer, themedStyles.chartContainer]}
        onLayout={handleChartLayout('weight')}
      >
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['weight']}
          padding={chartPadding}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: 5,
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatYLabel: (value: number) => `${value}`,
          }}
          xAxis={{
            tickValues: dateTicks,
            tickCount: dateTicks.length || 4,
            labelColor: colors.textSecondary,
            labelOffset: 6,
            font: axisFont ?? undefined,
            lineColor: 'transparent',
            formatXLabel: formatDateTick,
          }}
        >
          {({ points }: { points: { weight: any[] } }) => (
            <>
              <Line
                points={points.weight}
                color={colors.accent}
                strokeWidth={2}
                curveType="monotoneX"
                animate={{ type: 'timing', duration: 500 }}
              />
              <Scatter
                points={points.weight}
                radius={5}
                color={colors.accent}
                animate={{ type: 'timing', duration: 500 }}
              />
            </>
          )}
        </CartesianChart>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleChartPress('weight')} />
        {renderTooltip('weight')}
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Date</Text>
        <Text style={[styles.axisLabel, styles.axisLabelY, themedStyles.axisLabel]}>
          Max weight ({unitLabel})
        </Text>
      </View>

      {/* Volume Progress Chart */}
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>VOLUME PROGRESS</Text>
      <View
        style={[styles.chartContainer, themedStyles.chartContainer]}
        onLayout={handleChartLayout('volume')}
      >
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['volume']}
          padding={chartPadding}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: 5,
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatYLabel: (value: number) => formatVolume(Number(value)),
          }}
          xAxis={{
            tickValues: dateTicks,
            tickCount: dateTicks.length || 4,
            labelColor: colors.textSecondary,
            labelOffset: 6,
            font: axisFont ?? undefined,
            lineColor: 'transparent',
            formatXLabel: formatDateTick,
          }}
        >
          {({ points }: { points: { volume: any[] } }) => (
            <>
              <Line
                points={points.volume}
                color="#3b82f6"
                strokeWidth={2}
                curveType="monotoneX"
                animate={{ type: 'timing', duration: 500 }}
              />
              <Scatter
                points={points.volume}
                radius={5}
                color="#3b82f6"
                animate={{ type: 'timing', duration: 500 }}
              />
            </>
          )}
        </CartesianChart>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleChartPress('volume')} />
        {renderTooltip('volume')}
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Date</Text>
        <Text style={[styles.axisLabel, styles.axisLabelY, themedStyles.axisLabel]}>
          Volume ({unitLabel})
        </Text>
      </View>

      {/* Estimated 1RM Progress Chart */}
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>E1RM PROGRESS</Text>
      <View
        style={[styles.chartContainer, themedStyles.chartContainer]}
        onLayout={handleChartLayout('e1rm')}
      >
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['e1rm']}
          padding={chartPadding}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: 5,
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatYLabel: (value: number) => `${Math.round(Number(value))}`,
          }}
          xAxis={{
            tickValues: dateTicks,
            tickCount: dateTicks.length || 4,
            labelColor: colors.textSecondary,
            labelOffset: 6,
            font: axisFont ?? undefined,
            lineColor: 'transparent',
            formatXLabel: formatDateTick,
          }}
        >
          {({ points }: { points: { e1rm: any[] } }) => (
            <>
              <Line
                points={points.e1rm}
                color={Colors.success}
                strokeWidth={2}
                curveType="monotoneX"
                animate={{ type: 'timing', duration: 500 }}
              />
              <Scatter
                points={points.e1rm}
                radius={5}
                color={Colors.success}
                animate={{ type: 'timing', duration: 500 }}
              />
            </>
          )}
        </CartesianChart>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleChartPress('e1rm')} />
        {renderTooltip('e1rm')}
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Date</Text>
        <Text style={[styles.axisLabel, styles.axisLabelY, themedStyles.axisLabel]}>
          Estimated 1RM ({unitLabel})
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  chartContainer: {
    height: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  axisLabel: {
    position: 'absolute',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  axisLabelX: {
    bottom: Spacing.xs,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  axisLabelY: {
    left: -Spacing['3xl'],
    top: '50%',
    width: 150,
    textAlign: 'center',
    transform: [{ translateY: -34 }, { rotate: '-90deg' }],
  },
  chartTooltip: {
    position: 'absolute',
    top: Spacing.sm,
    width: TOOLTIP_WIDTH,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  tooltipValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  tooltipLabel: {
    marginTop: 2,
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  placeholderTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  placeholderTabText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  placeholderTabSubtext: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
