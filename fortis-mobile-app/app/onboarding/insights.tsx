import type { ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const INSIGHTS_ANIMATION = require('../../assets/lottie/render-graph-1-up.json');

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

export default function OnboardingInsightsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const animationSize = Math.min(320, Math.max(220, Math.round(windowWidth * 0.72)));
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();

  const handleContinue = () => {
    router.push('/onboarding/challenge');
  };

  return (
    <OnboardingScreen
      step={10}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Stay ahead of plateaus"
      subtitle="Fortis helps you detect plateaus and fatigue early so you can push toward your goals."
      onBack={() => router.back()}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.lg}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.animationWrap}>
        <View
          style={[
            styles.animationCard,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          {canRenderLottie && LottieView ? (
            <LottieView
              source={INSIGHTS_ANIMATION}
              autoPlay
              loop
              style={{ width: animationSize, height: animationSize }}
            />
          ) : (
            <View style={styles.fallback}>
              <Text style={[styles.fallbackText, { color: colors.textTertiary }]}>
                Animation unavailable in this build.
              </Text>
              <Text style={[styles.fallbackSubtext, { color: colors.textTertiary }]}>
                Rebuild the dev client to enable it.
              </Text>
            </View>
          )}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
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
