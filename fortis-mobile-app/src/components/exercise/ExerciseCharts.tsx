import { View, Text, StyleSheet } from 'react-native';
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

export function ExerciseCharts({ chartData, formatVolume, unitLabel }: ExerciseChartsProps) {
  const { colors, isDark } = useTheme();
  const axisFont = useFont(
    require('../../../assets/fonts/BankGothicMediumBT.ttf'),
    10
  );
  const formatSessionIndex = (value: number) => `${Math.round(value)}`;

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
      <View style={[styles.chartContainer, themedStyles.chartContainer]}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['weight']}
          padding={{ top: 20, bottom: 30, left: 34, right: 12 }}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: { x: 5, y: 5 },
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatXLabel: formatSessionIndex,
            formatYLabel: (value: number) => `${value}`,
          }}
        >
          {({ points }: { points: { weight: any[] } }) => (
            <>
              <Line
                points={points.weight}
                color={colors.accent}
                strokeWidth={2}
                curveType="natural"
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
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Session</Text>
        <Text style={[styles.axisLabel, styles.axisLabelY, themedStyles.axisLabel]}>
          Max weight ({unitLabel})
        </Text>
      </View>

      {/* Volume Progress Chart */}
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>VOLUME PROGRESS</Text>
      <View style={[styles.chartContainer, themedStyles.chartContainer]}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['volume']}
          padding={{ top: 20, bottom: 30, left: 34, right: 12 }}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: { x: 5, y: 5 },
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatXLabel: formatSessionIndex,
            formatYLabel: (value: number) => formatVolume(Number(value)),
          }}
        >
          {({ points }: { points: { volume: any[] } }) => (
            <>
              <Line
                points={points.volume}
                color="#3b82f6"
                strokeWidth={2}
                curveType="natural"
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
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Session</Text>
        <Text style={[styles.axisLabel, styles.axisLabelY, themedStyles.axisLabel]}>
          Volume ({unitLabel})
        </Text>
      </View>

      {/* Estimated 1RM Progress Chart */}
      <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>E1RM PROGRESS</Text>
      <View style={[styles.chartContainer, themedStyles.chartContainer]}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['e1rm']}
          padding={{ top: 20, bottom: 30, left: 34, right: 12 }}
          domainPadding={{ top: 20, bottom: 10 }}
          axisOptions={{
            tickCount: { x: 5, y: 5 },
            labelColor: colors.textSecondary,
            labelOffset: { x: 6, y: 6 },
            font: axisFont ?? undefined,
            lineColor: {
              grid: { x: 'transparent', y: themedStyles.gridLineColor },
              frame: themedStyles.frameColor,
            },
            formatXLabel: formatSessionIndex,
            formatYLabel: (value: number) => `${Math.round(Number(value))}`,
          }}
        >
          {({ points }: { points: { e1rm: any[] } }) => (
            <>
              <Line
                points={points.e1rm}
                color={Colors.success}
                strokeWidth={2}
                curveType="natural"
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
        <Text style={[styles.axisLabel, styles.axisLabelX, themedStyles.axisLabel]}>Session</Text>
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
    left: Spacing.xs,
    top: '50%',
    transform: [{ translateY: -40 }, { rotate: '-90deg' }],
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
