import { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AppHeaderBrand } from '@/src/components/navigation/AppHeaderBrand';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { moderateScale, scale } from '@/src/utils/responsive';

type SkeletonBlockProps = {
  color: string;
  opacity: Animated.Value;
  style?: StyleProp<ViewStyle>;
};

function SkeletonBlock({ color, opacity, style }: SkeletonBlockProps) {
  return <Animated.View style={[styles.block, { backgroundColor: color, opacity }, style]} />;
}

function useSkeletonPulse() {
  const pulse = useRef(new Animated.Value(0.48)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 720, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.48, duration: 720, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return pulse;
}

export function InlineSkeleton({
  width = scale(48),
  height = scale(14),
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useTheme();
  const pulse = useSkeletonPulse();
  const blockColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)';

  return (
    <SkeletonBlock
      color={blockColor}
      opacity={pulse}
      style={[{ width, height }, style]}
    />
  );
}

export function SectionSkeleton({
  height = scale(180),
  rows = 3,
  style,
}: {
  height?: number;
  rows?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useTheme();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const pulse = useSkeletonPulse();
  const blockColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)';
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.035)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
  };
  const resolvedHeight = Math.min(height, Math.max(scale(88), screenHeight * 0.36));
  const horizontalPadding = Math.min(scale(Spacing.lg), Math.max(scale(12), screenWidth * 0.04));

  return (
    <View
      style={[
        styles.sectionSkeleton,
        cardStyle,
        { minHeight: resolvedHeight, padding: horizontalPadding },
        style,
      ]}
      testID="section-skeleton"
      accessibilityLabel="Loading content"
    >
      <SkeletonBlock color={blockColor} opacity={pulse} style={styles.sectionHeading} />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock
          key={index}
          color={blockColor}
          opacity={pulse}
          style={[styles.sectionLine, index === rows - 1 && styles.sectionLastLine]}
        />
      ))}
    </View>
  );
}

export function TabPageSkeleton({ title }: { title: string }) {
  const { colors, isDark } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const pulse = useSkeletonPulse();
  const blockColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)';
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };
  const horizontalPadding = Math.min(
    scale(Spacing['2xl']),
    Math.max(scale(16), screenWidth * 0.055)
  );
  const chartHeight = Math.min(scale(260), Math.max(scale(150), screenHeight * 0.27));
  const compactHeight = Math.min(scale(86), Math.max(scale(68), screenHeight * 0.1));

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      testID="tab-page-skeleton"
      accessibilityLabel={`Loading ${title}`}
    >
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <AppHeaderBrand style={styles.header} />

          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          </View>

          <View style={[styles.compactCard, cardStyle, { minHeight: compactHeight }]}>
            <SkeletonBlock color={blockColor} opacity={pulse} style={styles.iconBlock} />
            <View style={styles.compactText}>
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.mediumLine} />
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.shortLine} />
            </View>
          </View>

          <View style={[styles.detailCard, cardStyle]}>
            <View style={styles.cardHeader}>
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.smallLine} />
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.tinyLine} />
            </View>
            <SkeletonBlock color={blockColor} opacity={pulse} style={styles.headingLine} />
            <SkeletonBlock
              color={blockColor}
              opacity={pulse}
              style={[styles.chartBlock, { height: chartHeight }]}
            />
            <SkeletonBlock color={blockColor} opacity={pulse} style={styles.fullLine} />
            <SkeletonBlock color={blockColor} opacity={pulse} style={styles.wideLine} />
            <View style={styles.actionRow}>
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.buttonBlock} />
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.buttonBlock} />
              <SkeletonBlock color={blockColor} opacity={pulse} style={styles.buttonBlock} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const CARD_RADIUS = scale(BorderRadius.xl);

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: scale(120),
    gap: scale(Spacing.lg),
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  header: {
    paddingTop: scale(Spacing.lg),
    paddingBottom: scale(Spacing.md),
    alignItems: 'flex-start',
  },
  titleContainer: { paddingBottom: scale(Spacing.md) },
  title: {
    fontSize: moderateScale(26),
    fontFamily: 'BankGothicBT-Medium',
  },
  block: { borderRadius: scale(8) },
  compactCard: {
    padding: scale(Spacing.lg),
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.md),
  },
  iconBlock: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
  },
  compactText: { flex: 1, gap: scale(8) },
  detailCard: {
    padding: scale(Spacing.lg),
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    gap: scale(Spacing.md),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  chartBlock: {
    width: '100%',
    borderRadius: scale(BorderRadius.lg),
  },
  fullLine: { width: '100%', height: scale(14) },
  wideLine: { width: '72%', height: scale(14) },
  headingLine: { width: '48%', height: scale(20) },
  mediumLine: { width: '58%', height: scale(16) },
  shortLine: { width: '76%', height: scale(12) },
  smallLine: { width: '34%', height: scale(12) },
  tinyLine: { width: '18%', height: scale(12) },
  actionRow: { flexDirection: 'row', gap: scale(Spacing.sm) },
  buttonBlock: {
    flex: 1,
    height: scale(32),
    borderRadius: scale(16),
  },
  sectionSkeleton: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: CARD_RADIUS,
    justifyContent: 'center',
    gap: scale(Spacing.md),
  },
  sectionHeading: {
    width: '42%',
    height: scale(18),
  },
  sectionLine: {
    width: '100%',
    height: scale(14),
  },
  sectionLastLine: {
    width: '68%',
  },
});
