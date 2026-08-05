import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Pressable,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { format, subMonths } from 'date-fns';
import { Group, rect, useFont } from '@shopify/react-native-skia';
import {
  Easing as ReanimatedEasing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';

// Try to import victory-native, fall back gracefully if Skia is unavailable.
let ChartsAvailable = false;
let CartesianChart: any, Line: any, Scatter: any, Area: any;

try {
  const victory = require('victory-native');
  CartesianChart = victory.CartesianChart;
  Line = victory.Line;
  Scatter = victory.Scatter;
  Area = victory.Area;
  ChartsAvailable = true;
} catch (e) {
  // Skia is not available - charts will show a fallback.
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
type ChartRange = '3M' | '6M' | '1Y' | 'ALL';
type ChartSelection = { metric: ChartMetric; index: number } | null;

const RANGE_OPTIONS: ChartRange[] = ['3M', '6M', '1Y', 'ALL'];
const RANGE_MONTHS: Record<Exclude<ChartRange, 'ALL'>, number> = {
  '3M': 3,
  '6M': 6,
  '1Y': 12,
};
const TOOLTIP_WIDTH = 104;
const CHART_PADDING = { top: 14, bottom: 30, left: 28, right: 0 };
const PLOT_INSET = 6;

const METRIC_CONFIG: Record<ChartMetric, { title: string; color: string }> = {
  weight: { title: 'WEIGHT PROGRESS', color: '' },
  volume: { title: 'VOLUME PROGRESS', color: Colors.info },
  e1rm: { title: 'E1RM PROGRESS', color: '' },
};

interface AnimatedMetricPathsProps {
  points: any[];
  chartBounds: { top: number; bottom: number; left: number; right: number };
  color: string;
  fillOpacity: number;
  delay: number;
}

function AnimatedMetricPaths({
  points,
  chartBounds,
  color,
  fillOpacity,
  delay,
}: AnimatedMetricPathsProps) {
  const lineProgress = useSharedValue(0);
  const fillProgress = useSharedValue(0);
  const pointOpacity = useSharedValue(0);

  useEffect(() => {
    lineProgress.value = 0;
    fillProgress.value = 0;
    pointOpacity.value = 0;

    lineProgress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 700,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      })
    );
    fillProgress.value = withDelay(
      delay + 620,
      withTiming(1, {
        duration: 520,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      })
    );
    pointOpacity.value = withDelay(
      delay + 680,
      withTiming(1, { duration: 220 })
    );

    return () => {
      cancelAnimation(lineProgress);
      cancelAnimation(fillProgress);
      cancelAnimation(pointOpacity);
    };
  }, [delay, fillProgress, lineProgress, pointOpacity]);

  const fillClip = useDerivedValue(() => {
    const plotHeight = chartBounds.bottom - chartBounds.top;
    const revealedHeight = plotHeight * fillProgress.value;
    return rect(
      chartBounds.left,
      chartBounds.bottom - revealedHeight,
      chartBounds.right - chartBounds.left,
      revealedHeight
    );
  }, [chartBounds]);

  return (
    <>
      <Group clip={fillClip}>
        <Area
          points={points}
          y0={chartBounds.bottom}
          color={color}
          opacity={fillOpacity}
          curveType="monotoneX"
        />
      </Group>
      <Line
        points={points}
        color={color}
        strokeWidth={2.5}
        strokeCap="round"
        strokeJoin="round"
        curveType="monotoneX"
        end={lineProgress}
      />
      <Scatter
        points={points}
        radius={4}
        color={color}
        opacity={pointOpacity}
      />
    </>
  );
}

export function ExerciseCharts({ chartData, formatVolume, unitLabel }: ExerciseChartsProps) {
  const { colors, isDark } = useTheme();
  const [range, setRange] = useState<ChartRange>('ALL');
  const [chartWidths, setChartWidths] = useState<Record<ChartMetric, number>>({
    weight: 0,
    volume: 0,
    e1rm: 0,
  });
  const [selection, setSelection] = useState<ChartSelection>(null);
  const cardEntrance = useRef({
    weight: new Animated.Value(0),
    volume: new Animated.Value(0),
    e1rm: new Animated.Value(0),
  }).current;
  const axisFont = useFont(
    require('../../../assets/fonts/BankGothicMediumBT.ttf'),
    10
  );

  useEffect(() => {
    const entrances = (['weight', 'volume', 'e1rm'] as ChartMetric[]).map((metric) => {
      cardEntrance[metric].setValue(0);
      return Animated.timing(cardEntrance[metric], {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });

    Animated.stagger(190, entrances).start();

    return () => entrances.forEach((entrance) => entrance.stop());
  }, [cardEntrance]);

  const normalizedChartData = useMemo(
    () => chartData
      .filter((point) => Number.isFinite(point.x))
      .sort((first, second) => first.x - second.x),
    [chartData]
  );

  const filteredChartData = useMemo(() => {
    if (range === 'ALL' || normalizedChartData.length === 0) return normalizedChartData;

    const latestTimestamp = normalizedChartData[normalizedChartData.length - 1].x;
    const cutoffTimestamp = subMonths(
      new Date(latestTimestamp),
      RANGE_MONTHS[range]
    ).getTime();

    return normalizedChartData.filter((point) => point.x >= cutoffTimestamp);
  }, [normalizedChartData, range]);

  const xValues = useMemo(
    () => filteredChartData.map((point) => point.x).filter((value) => Number.isFinite(value)),
    [filteredChartData]
  );
  const minX = xValues.length ? Math.min(...xValues) : null;
  const maxX = xValues.length ? Math.max(...xValues) : null;

  const dateTicks = useMemo(() => {
    if (filteredChartData.length === 0 || xValues.length === 0) return [];
    const targetCount = Math.min(3, filteredChartData.length);
    const localMinX = Math.min(...xValues);
    const localMaxX = Math.max(...xValues);
    if (targetCount === 1 || localMinX === localMaxX) return [localMinX];

    return Array.from(
      { length: targetCount },
      (_, index) => localMinX + ((localMaxX - localMinX) * index) / (targetCount - 1)
    );
  }, [filteredChartData.length, xValues]);

  useEffect(() => {
    setSelection(
      filteredChartData.length > 0
        ? { metric: 'weight', index: filteredChartData.length - 1 }
        : null
    );
  }, [filteredChartData.length, range]);

  const formatDateTick = (value: number) => {
    if (!Number.isFinite(value)) return '';
    return format(new Date(value), 'MMM d');
  };

  const handleChartLayout = (metric: ChartMetric) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setChartWidths((prev) => (prev[metric] === width ? prev : { ...prev, [metric]: width }));
  };

  const resolvePointX = (pointX: number, chartWidth: number) => {
    if (chartWidth <= 0 || minX === null || maxX === null) return CHART_PADDING.left;
    const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    if (plotWidth <= 0) return CHART_PADDING.left;
    if (minX === maxX) return CHART_PADDING.left + plotWidth / 2;
    return CHART_PADDING.left + ((pointX - minX) / (maxX - minX)) * plotWidth;
  };

  const resolveNearestPointIndex = (tapX: number, chartWidth: number) => {
    if (
      filteredChartData.length === 0 ||
      !Number.isFinite(tapX) ||
      chartWidth <= 0 ||
      minX === null ||
      maxX === null
    ) {
      return null;
    }

    const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    if (plotWidth <= 0) return null;
    if (minX === maxX) return 0;

    const clampedX = Math.min(Math.max(tapX - CHART_PADDING.left, 0), plotWidth);
    const tappedDomainX = minX + (clampedX / plotWidth) * (maxX - minX);
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    filteredChartData.forEach((point, index) => {
      const distance = Math.abs(point.x - tappedDomainX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const handleChartPress = (metric: ChartMetric) => (event: GestureResponderEvent) => {
    const index = resolveNearestPointIndex(event.nativeEvent.locationX, chartWidths[metric]);
    if (index === null) return;
    setSelection((prev) => {
      if (prev?.metric === metric && prev.index === index) return null;
      return { metric, index };
    });
  };

  const resolveTooltipLeft = (pointX: number, chartWidth: number) => {
    const x = resolvePointX(pointX, chartWidth);
    return Math.min(
      Math.max(x - TOOLTIP_WIDTH / 2, PLOT_INSET),
      chartWidth - TOOLTIP_WIDTH - PLOT_INSET
    );
  };

  const formatNumber = (value: number) =>
    Number.isInteger(value) ? `${value}` : value.toFixed(1);

  const formatMetricAmount = (metric: ChartMetric, value: number) => {
    if (metric === 'volume') return formatVolume(value);
    if (metric === 'e1rm') return `${Math.round(value)}`;
    return formatNumber(value);
  };

  const formatMetricValue = (metric: ChartMetric, point: ChartDataPoint) =>
    `${formatMetricAmount(metric, point[metric])} ${unitLabel}`;

  const formatMetricChange = (metric: ChartMetric, delta: number) => {
    const prefix = delta > 0 ? '+' : delta < 0 ? '-' : '';
    return `${prefix}${formatMetricAmount(metric, Math.abs(delta))} ${unitLabel}`;
  };

  const getMetricSummary = (metric: ChartMetric) => {
    const first = filteredChartData[0];
    const latest = filteredChartData[filteredChartData.length - 1];
    return {
      current: latest?.[metric] ?? 0,
      delta: first && latest ? latest[metric] - first[metric] : 0,
    };
  };

  const renderTooltip = (metric: ChartMetric) => {
    if (!selection || selection.metric !== metric) return null;
    const point = filteredChartData[selection.index];
    const chartWidth = chartWidths[metric];
    if (!point || chartWidth <= 0) return null;

    return (
      <View
        style={[
          styles.chartTooltip,
          {
            left: resolveTooltipLeft(point.x, chartWidth),
            borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.09)',
            backgroundColor: isDark ? 'rgba(24,24,24,0.96)' : 'rgba(255,255,255,0.98)',
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.tooltipValue, { color: colors.textPrimary }]}>
          {formatMetricValue(metric, point)}
        </Text>
        <Text style={[styles.tooltipLabel, { color: colors.textTertiary }]}>
          {format(new Date(point.x), 'MMM d')}
        </Text>
      </View>
    );
  };

  const renderSelectionGuide = (metric: ChartMetric) => {
    if (!selection || selection.metric !== metric) return null;
    const point = filteredChartData[selection.index];
    const chartWidth = chartWidths[metric];
    if (!point || chartWidth <= 0) return null;

    return (
      <View
        pointerEvents="none"
        style={[
          styles.selectionGuide,
          {
            left: resolvePointX(point.x, chartWidth),
            backgroundColor: metric === 'volume' ? Colors.info : colors.accent,
          },
        ]}
      />
    );
  };

  const themedStyles = {
    placeholderTabText: { color: colors.textSecondary },
    placeholderTabSubtext: { color: colors.textTertiary },
    rangeControl: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.45)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(13,27,47,0.1)',
    },
    rangeOptionText: { color: colors.textSecondary },
    rangeOptionActive: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    rangeOptionTextActive: { color: colors.accent },
    chartCard: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
      borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(13,27,47,0.12)',
      shadowColor: isDark ? '#000000' : '#10213A',
      shadowOpacity: isDark ? 0.24 : 0.08,
    },
    sectionTitle: { color: colors.textSecondary },
    currentValue: { color: colors.textPrimary },
    gridLineColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(13,27,47,0.09)',
    axisLabelColor: colors.textTertiary,
    emptyRangeCard: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
  };

  const renderMetricCard = (metric: ChartMetric) => {
    const config = METRIC_CONFIG[metric];
    const lineColor = config.color || colors.accent;
    const summary = getMetricSummary(metric);
    const changeColor = summary.delta < 0 ? Colors.error : summary.delta > 0 ? Colors.success : colors.textTertiary;
    const changeBackground = summary.delta < 0
      ? 'rgba(239,68,68,0.1)'
      : summary.delta > 0
        ? 'rgba(34,197,94,0.1)'
        : isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)';
    const entranceStyle = {
      opacity: cardEntrance[metric],
      transform: [
        {
          translateY: cardEntrance[metric].interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        },
      ],
    };
    const metricIndex = (['weight', 'volume', 'e1rm'] as ChartMetric[]).indexOf(metric);

    return (
      <Animated.View
        key={metric}
        style={[styles.chartCard, themedStyles.chartCard, entranceStyle]}
      >
        <Text style={[styles.sectionTitle, styles.cardHeaderInset, themedStyles.sectionTitle]}>
          {config.title}
        </Text>
        <View style={[styles.metricSummaryRow, styles.cardHeaderInset]}>
          <Text style={[styles.currentValue, themedStyles.currentValue]}>
            {formatMetricAmount(metric, summary.current)}
            <Text style={styles.currentUnit}> {unitLabel}</Text>
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: changeBackground, borderColor: changeColor }]}>
            <Text style={[styles.changeBadgeText, { color: changeColor }]}>
              {formatMetricChange(metric, summary.delta)}
            </Text>
          </View>
        </View>

        <View style={styles.chartPlot} onLayout={handleChartLayout(metric)}>
          <CartesianChart
            data={filteredChartData}
            xKey="x"
            yKeys={[metric]}
            padding={CHART_PADDING}
            domainPadding={{ top: 18, bottom: 8 }}
            axisOptions={{
              tickCount: 4,
              labelColor: themedStyles.axisLabelColor,
              labelOffset: { x: 4, y: 6 },
              font: axisFont ?? undefined,
              lineColor: {
                grid: { x: 'transparent', y: themedStyles.gridLineColor },
                frame: 'transparent',
              },
              formatYLabel: (value: number) =>
                metric === 'volume' ? formatVolume(Number(value)) : formatNumber(Number(value)),
            }}
            xAxis={{
              tickValues: dateTicks,
              tickCount: dateTicks.length || 3,
              labelColor: themedStyles.axisLabelColor,
              labelOffset: 8,
              font: axisFont ?? undefined,
              lineColor: 'transparent',
              formatXLabel: formatDateTick,
            }}
          >
            {({
              points,
              chartBounds,
            }: {
              points: Record<ChartMetric, any[]>;
              chartBounds: { top: number; bottom: number; left: number; right: number };
            }) => (
              <AnimatedMetricPaths
                key={`${metric}-${range}`}
                points={points[metric]}
                chartBounds={chartBounds}
                color={lineColor}
                fillOpacity={isDark ? 0.13 : 0.08}
                delay={140 + metricIndex * 90}
              />
            )}
          </CartesianChart>
          {renderSelectionGuide(metric)}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleChartPress(metric)} />
          {renderTooltip(metric)}
        </View>
      </Animated.View>
    );
  };

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
      <View style={[styles.rangeControl, themedStyles.rangeControl]}>
        {RANGE_OPTIONS.map((option) => {
          const isActive = range === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setRange(option)}
              style={[
                styles.rangeOption,
                isActive && styles.rangeOptionActive,
                isActive && themedStyles.rangeOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.rangeOptionText,
                  themedStyles.rangeOptionText,
                  isActive && styles.rangeOptionTextActive,
                  isActive && themedStyles.rangeOptionTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filteredChartData.length < 2 ? (
        <View style={[styles.emptyRangeCard, themedStyles.emptyRangeCard]}>
          <Text style={[styles.placeholderTabText, themedStyles.placeholderTabText]}>Not enough data in this range</Text>
          <Text style={[styles.placeholderTabSubtext, themedStyles.placeholderTabSubtext]}>
            Choose a longer range to compare your progress.
          </Text>
        </View>
      ) : (
        (['weight', 'volume', 'e1rm'] as ChartMetric[]).map(renderMetricCard)
      )}
    </>
  );
}

const styles = StyleSheet.create({
  rangeControl: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 44,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  rangeOption: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: BorderRadius.lg,
  },
  rangeOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeOptionText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.4,
  },
  rangeOptionTextActive: {
    fontFamily: 'BankGothicBT-Medium',
  },
  chartCard: {
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: BorderRadius['2xl'],
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    letterSpacing: 1.4,
  },
  cardHeaderInset: {
    marginHorizontal: Spacing.lg,
  },
  metricSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  currentValue: {
    flexShrink: 1,
    fontSize: FontSizes['3xl'],
    lineHeight: 36,
    fontWeight: '700',
  },
  currentUnit: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  changeBadge: {
    flexShrink: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  changeBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  chartPlot: {
    height: 190,
    marginTop: Spacing.xs,
    width: '100%',
  },
  selectionGuide: {
    position: 'absolute',
    top: CHART_PADDING.top,
    bottom: CHART_PADDING.bottom,
    width: StyleSheet.hairlineWidth,
    opacity: 0.55,
    zIndex: 1,
  },
  chartTooltip: {
    position: 'absolute',
    top: 2,
    width: TOOLTIP_WIDTH,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
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
  emptyRangeCard: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 180,
    borderWidth: 1,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
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
    textAlign: 'center',
  },
  placeholderTabSubtext: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
