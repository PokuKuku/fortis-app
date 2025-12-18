import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBarIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { StatsTabType } from '@/src/types/program';

interface StatsPlaceholderProps {
  selectedTab: StatsTabType;
}

const TAB_CONTENT: Record<StatsTabType, { title: string; subtitle: string }> = {
  Volume: {
    title: 'No volume data yet',
    subtitle: 'Complete workouts to track total weight lifted',
  },
  Reps: {
    title: 'No rep data yet',
    subtitle: 'Complete workouts to track total reps performed',
  },
  Duration: {
    title: 'No duration data yet',
    subtitle: 'Complete workouts to track time spent training',
  },
};

export function StatsPlaceholder({ selectedTab }: StatsPlaceholderProps) {
  const content = TAB_CONTENT[selectedTab];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      {/* Decorative chart bars background */}
      <View style={styles.chartBarsContainer}>
        {[0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5].map((height, index) => (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                height: `${height * 100}%`,
                opacity: 0.15 + (index * 0.05),
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.4)', 'rgba(34, 197, 94, 0.1)']}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ))}
      </View>

      {/* Content overlay */}
      <View style={styles.contentOverlay}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.iconGradient}
          >
            <ChartBarIcon
              size={32}
              color={Colors.textSecondary}
              strokeWidth={1.5}
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  chartBarsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing['3xl'],
    paddingBottom: Spacing.md,
  },
  chartBar: {
    width: 24,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  contentOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: 'rgba(163, 163, 163, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
