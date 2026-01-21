import type { ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { StarIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

const FIVE_STARS_ANIMATION = require('../../assets/lottie/five_stars.json');

const isLottieViewManagerAvailable = (): boolean => {
  const getConfig = (UIManager as { getViewManagerConfig?: (name: string) => unknown }).getViewManagerConfig;
  if (typeof getConfig !== 'function') return false;
  return Boolean(getConfig('LottieAnimationView'));
};

const LottieView = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('lottie-react-native').default as ComponentType<{
      source: unknown;
      autoPlay?: boolean;
      loop?: boolean;
      style?: unknown;
    }>;
  } catch {
    return null;
  }
})();

function StarsRow({ color }: { color: string }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon key={index} size={16} color={color} />
      ))}
    </View>
  );
}

export default function OnboardingRateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationWidth = Math.min(320, Math.max(220, Math.round(windowWidth * 0.78)));

  const handleContinue = () => {
    router.push('/onboarding/complete');
  };

  return (
    <OnboardingScreen
      step={14}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Give us a rating"
      subtitle="If Fortis is helping you, a 5-star rating helps us grow."
      onBack={() => router.back()}
      useScrollView
      bodyAlign="top"
      contentGap={Spacing.lg}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.content}>
        <View style={styles.animationWrap}>
          {canRenderLottie && LottieView ? (
            <LottieView source={FIVE_STARS_ANIMATION} autoPlay loop={false} style={{ width: animationWidth, height: 90 }} />
          ) : (
            <View style={[styles.fallbackCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
              <Text style={[styles.fallbackText, { color: colors.textTertiary }]}>Animation unavailable in this build.</Text>
            </View>
          )}
        </View>

        <View style={[styles.ratingCard, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.ratingNumber, { color: colors.textPrimary }]}>5.0</Text>
          <StarsRow color={colors.accent} />
          <Text style={[styles.ratingCaption, { color: colors.textSecondary }]}>Loved by lifters</Text>
        </View>

        <View style={styles.testimonials}>
          <View style={[styles.testimonialCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
            <View style={styles.testimonialHeader}>
              <Text style={[styles.testimonialName, { color: colors.textPrimary }]}>Alex</Text>
              <StarsRow color={colors.accent} />
            </View>
            <Text style={[styles.testimonialBody, { color: colors.textSecondary }]}>
              “Fortis makes it way easier to see what’s working and what to change.”
            </Text>
          </View>

          <View style={[styles.testimonialCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
            <View style={styles.testimonialHeader}>
              <Text style={[styles.testimonialName, { color: colors.textPrimary }]}>Sam</Text>
              <StarsRow color={colors.accent} />
            </View>
            <Text style={[styles.testimonialBody, { color: colors.textSecondary }]}>
              “The insights feel like having a coach reviewing my training data.”
            </Text>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 13,
    textAlign: 'center',
  },
  ratingCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  ratingNumber: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCaption: {
    ...Typography.bodySmall,
  },
  testimonials: {
    gap: Spacing.md,
  },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  testimonialBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
