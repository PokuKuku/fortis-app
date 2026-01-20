import type { ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';

const THANK_YOU_ANIMATION = require('../../assets/lottie/fortis_thankyou.json');

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

export default function OnboardingThankYouScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationSize = Math.min(
    360,
    Math.max(240, Math.round(Math.min(windowWidth * 0.78, windowHeight * 0.34)))
  );

  const handleContinue = () => {
    router.push('/onboarding/rate');
  };

  return (
    <OnboardingScreen
      step={14}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      subtitle={undefined}
      hideTitle
      onBack={() => router.back()}
      useScrollView={false}
      bodyAlign="center"
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
            <LottieView
              source={THANK_YOU_ANIMATION}
              autoPlay
              loop={false}
              style={{ width: animationSize, height: animationSize }}
            />
          ) : (
            <View
              style={[
                styles.fallbackCard,
                { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground },
              ]}
            >
              <Text style={[styles.fallbackText, { color: colors.textTertiary }]}>
                Animation unavailable in this build.
              </Text>
              <Text style={[styles.fallbackSubtext, { color: colors.textTertiary }]}>
                Rebuild the dev client to enable it.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>
            Thanks for trusting us.
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            Now let’s tailor Fortis to you.
          </Text>
        </View>

        <View style={[styles.infoCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
          <View style={styles.infoHeader}>
            <LockClosedIcon size={18} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Privacy-first</Text>
          </View>
          <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
            Your preferences and workout data stay under your control.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: Spacing['2xl'] }],
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  titleText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitleText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 13,
    textAlign: 'center',
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
