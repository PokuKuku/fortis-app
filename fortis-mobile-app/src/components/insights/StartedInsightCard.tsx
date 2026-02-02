import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/Sizes';
import { moderateScale, scale } from '@/src/utils/responsive';

export function StartedInsightCard() {
  const { colors, isDark } = useTheme();

  const themedStyles = {
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    bullet: { color: colors.textSecondary },
    tip: { color: colors.textTertiary },
    accent: { color: colors.accent },
  };

  return (
    <View style={[styles.card, themedStyles.card]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, themedStyles.title]}>Get Started</Text>
        <Text style={[styles.badge, themedStyles.accent]}>Started</Text>
      </View>

      <Text style={[styles.subtitle, themedStyles.subtitle]}>
        Complete a quick workout to unlock your first recap and weekly insights.
      </Text>

      <View style={styles.bullets}>
        <Text style={[styles.bullet, themedStyles.bullet]}>
          1) Tap the Quick Start button (dumbbell).
        </Text>
        <Text style={[styles.bullet, themedStyles.bullet]}>
          2) Log a few sets, then finish the workout.
        </Text>
      </View>

      <Text style={[styles.tip, themedStyles.tip]}>
        Tip: press and hold Quick Start to reset what it starts.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: FontWeights.bold,
    letterSpacing: 0.2,
  },
  badge: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: FontWeights.medium,
    lineHeight: moderateScale(20),
    marginBottom: Spacing.md,
  },
  bullets: {
    gap: scale(6),
    marginBottom: Spacing.md,
  },
  bullet: {
    fontSize: moderateScale(13),
    fontWeight: FontWeights.medium,
    lineHeight: moderateScale(18),
  },
  tip: {
    fontSize: moderateScale(12),
    fontWeight: FontWeights.medium,
    lineHeight: moderateScale(16),
  },
});
