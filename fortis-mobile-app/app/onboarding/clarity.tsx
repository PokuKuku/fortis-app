import type { ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const CLARITY_ANIMATION = require('../../assets/lottie/data_analysis_lottie.json');

const isLikelyTruncatedAnimation = (source: unknown): boolean => {
  if (!source || typeof source !== 'object') return false;
  const record = source as { assets?: unknown; layers?: unknown };
  const layers = Array.isArray(record.layers) ? record.layers.length : 0;
  const assets = Array.isArray(record.assets) ? record.assets.length : 0;
  return layers > 0 && layers <= 4 && assets === 0;
};

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

export default function OnboardingClarityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const animationSize = Math.min(
    460,
    Math.max(
      290,
      Math.round(Math.min(windowWidth * 0.98, windowHeight * 0.46))
    )
  );
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationLooksTruncated = isLikelyTruncatedAnimation(CLARITY_ANIMATION);

  const handleContinue = () => {
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      step={10}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Fortis takes the mystery out of gym progression"
      subtitle="Understand what’s working and keep progressing!"
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
        {canRenderLottie && LottieView && !animationLooksTruncated ? (
          <LottieView
            source={CLARITY_ANIMATION}
            autoPlay
            loop
            style={{ width: animationSize, height: animationSize }}
          />
        ) : (
          <View style={[styles.fallbackCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
            <Text style={[styles.fallbackText, { color: colors.textTertiary }]}>
              {animationLooksTruncated ? 'Animation file is incomplete.' : 'Animation unavailable in this build.'}
            </Text>
            <Text style={[styles.fallbackSubtext, { color: colors.textTertiary }]}>
              {animationLooksTruncated ? 'Re-export as a .lottie file and drop it in assets.' : 'Rebuild the dev client to enable it.'}
            </Text>
          </View>
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Spacing.lg,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 320,
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
