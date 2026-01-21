import { useCallback, useEffect, useRef, type ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const SUCCESS_ANIMATION = require('../../assets/lottie/success.json');

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
      onAnimationFinish?: (isCancelled?: boolean) => void;
    }>;
  } catch {
    return null;
  }
})();

export default function OnboardingFitnessBackgroundScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const animationSize = Math.min(380, Math.max(260, Math.round(windowWidth * 0.82)));
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const didNavigateRef = useRef(false);
  const autoContinueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContinue = useCallback(() => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    router.push('/onboarding/experience');
  }, [router]);

  useEffect(() => {
    if (autoContinueTimeoutRef.current) {
      clearTimeout(autoContinueTimeoutRef.current);
      autoContinueTimeoutRef.current = null;
    }

    const fallbackDelayMs = canRenderLottie ? 7000 : 3200;
    autoContinueTimeoutRef.current = setTimeout(() => {
      handleContinue();
    }, fallbackDelayMs);

    return () => {
      if (autoContinueTimeoutRef.current) {
        clearTimeout(autoContinueTimeoutRef.current);
        autoContinueTimeoutRef.current = null;
      }
    };
  }, [canRenderLottie, handleContinue]);

  const handleAnimationFinish = useCallback(
    (isCancelled?: boolean) => {
      if (isCancelled) return;
      if (didNavigateRef.current) return;
      if (autoContinueTimeoutRef.current) {
        clearTimeout(autoContinueTimeoutRef.current);
      }
      autoContinueTimeoutRef.current = setTimeout(() => {
        handleContinue();
      }, 500);
    },
    [handleContinue]
  );

  return (
    <OnboardingScreen
      step={6}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Awesome!"
      subtitle="Now a few quick questions on your fitness background"
      showProgress={false}
      titleTopOffset={-Spacing['3xl']}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.lg}
    >
      <View style={styles.animationWrap}>
        <View
          style={[
            styles.animationCard,
            !canRenderLottie && {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
            !canRenderLottie && styles.fallbackCard,
          ]}
        >
          {canRenderLottie && LottieView ? (
            <LottieView
              source={SUCCESS_ANIMATION}
              autoPlay
              loop={false}
              onAnimationFinish={handleAnimationFinish}
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
    marginTop: -Spacing['2xl'],
  },
  animationCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
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
});
