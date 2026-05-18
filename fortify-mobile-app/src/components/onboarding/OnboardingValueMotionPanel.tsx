import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';

export type OnboardingValueBenefitTile = {
  value: string;
  label: string;
  emoji: string;
};

type ValueMotionPanelProps = {
  benefitTiles: OnboardingValueBenefitTile[];
};

export function OnboardingValueMotionPanel({
  benefitTiles,
}: ValueMotionPanelProps) {
  const { colors, isDark } = useTheme();
  const tileAnimations = useRef(
    Array.from({ length: 4 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(-14),
    }))
  ).current;

  const gradientColors = useMemo<readonly [string, string, string]>(
    () => isDark
      ? ['rgba(255,255,255,0.14)', colors.glassBackground, 'rgba(255,255,255,0.06)']
      : ['rgba(255,255,255,0.98)', 'rgba(247,246,243,0.96)', 'rgba(230,232,235,0.84)'],
    [colors.glassBackground, isDark]
  );

  useEffect(() => {
    tileAnimations.forEach(({ opacity, translateY }) => {
      opacity.setValue(0);
      translateY.setValue(-14);
    });

    Animated.stagger(
      170,
      benefitTiles.slice(0, 4).map((_, index) => Animated.parallel([
        Animated.timing(tileAnimations[index].opacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(tileAnimations[index].translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 95,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]))
    ).start();
  }, [benefitTiles, tileAnimations]);

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
          { backgroundColor: colors.accent, opacity: isDark ? 0.2 : 0.1 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.diagonalBeam,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.045)' },
        ]}
      />

      <View style={styles.benefitGrid}>
        {benefitTiles.slice(0, 4).map((tile, index) => (
          <Animated.View
            key={`${tile.value}-${tile.label}`}
            style={[
              styles.benefitTile,
              { backgroundColor: colors.background, borderColor: colors.glassBorder },
              {
                opacity: tileAnimations[index].opacity,
                transform: [{ translateY: tileAnimations[index].translateY }],
              },
            ]}
          >
            <View style={styles.tileEmojiWrap}>
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
            </View>
            <Text style={[styles.tileNumber, { color: colors.textTertiary }]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text
              style={[styles.benefitValue, { color: colors.textPrimary }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
            >
              {tile.value}
            </Text>
            <Text
              style={[styles.benefitLabel, { color: colors.textSecondary }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {tile.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  accentGlow: {
    position: 'absolute',
    top: -82,
    right: -68,
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  diagonalBeam: {
    position: 'absolute',
    top: -48,
    left: 130,
    width: 88,
    height: 430,
    transform: [{ rotate: '16deg' }],
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  benefitTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: 'flex-end',
    padding: Spacing.sm,
    gap: 6,
    overflow: 'hidden',
  },
  tileEmojiWrap: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  tileNumber: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 10,
    letterSpacing: 1,
  },
  benefitValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  benefitLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
});
