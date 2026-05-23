import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';

export type OnboardingValueBenefitTile = {
  value: string;
};

type ValueMotionPanelProps = {
  benefitTiles: OnboardingValueBenefitTile[];
};

export function OnboardingValueMotionPanel({
  benefitTiles,
}: ValueMotionPanelProps) {
  const { colors, isDark } = useTheme();
  const rowAnimations = useRef(
    Array.from({ length: 4 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(-12),
    }))
  ).current;

  const gradientColors = useMemo<readonly [string, string, string]>(
    () => isDark
      ? ['rgba(255,255,255,0.14)', colors.glassBackground, 'rgba(255,255,255,0.06)']
      : ['rgba(255,255,255,0.98)', 'rgba(247,246,243,0.96)', 'rgba(230,232,235,0.84)'],
    [colors.glassBackground, isDark]
  );

  useEffect(() => {
    rowAnimations.forEach(({ opacity, translateY }) => {
      opacity.setValue(0);
      translateY.setValue(-12);
    });

    Animated.stagger(
      120,
      benefitTiles.slice(0, 4).map((_, index) => Animated.parallel([
        Animated.timing(rowAnimations[index].opacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(rowAnimations[index].translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 120,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]))
    ).start();
  }, [benefitTiles, rowAnimations]);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, { borderColor: colors.glassBorder }]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.accentGlow,
          { backgroundColor: colors.accent, opacity: isDark ? 0.18 : 0.09 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.diagonalBeam,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.045)' },
        ]}
      />

      <View style={styles.benefitList}>
        {benefitTiles.slice(0, 4).map((tile, index) => {
          return (
            <Animated.View
              key={`${tile.value}-${index}`}
              style={[
                styles.benefitRow,
                { backgroundColor: colors.background, borderColor: colors.glassBorder },
                {
                  opacity: rowAnimations[index].opacity,
                  transform: [{ translateY: rowAnimations[index].translateY }],
                },
              ]}
            >
              <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                <CheckIcon color={colors.accentForegroundOnFill} size={15} />
              </View>
              <View style={styles.benefitCopy}>
                <Text
                  style={[styles.benefitValue, { color: colors.textPrimary }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {tile.value}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  accentGlow: {
    position: 'absolute',
    top: -88,
    right: -72,
    width: 176,
    height: 176,
    borderRadius: 88,
  },
  diagonalBeam: {
    position: 'absolute',
    top: -52,
    left: 132,
    width: 88,
    height: 430,
    transform: [{ rotate: '16deg' }],
  },
  benefitList: {
    gap: Spacing.sm,
  },
  benefitRow: {
    minHeight: 62,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitCopy: {
    flex: 1,
  },
  benefitValue: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
});
