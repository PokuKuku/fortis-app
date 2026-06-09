import { useCallback, useRef, useState, type ComponentType } from 'react';
import { Animated, StyleSheet, Text, UIManager, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale } from '@/src/utils/responsive';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const CLARITY_ANIMATION = require('../../assets/lottie/graphs.json');
const FORTIFY_LABEL_DELAY_MS = 1650;

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
      onAnimationFinish?: () => void;
      ref?: unknown;
      style?: unknown;
    }>;
  } catch {
    return null;
  }
})();

export default function OnboardingInsightsScreen() {
  useOnboardingFunnelScreen('Q18. Fortify Provides Insights');

  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const lottieRef = useRef<{ play?: () => void; reset?: () => void } | null>(null);
  const fortifyOpacity = useRef(new Animated.Value(0)).current;
  const fortifyTranslateY = useRef(new Animated.Value(6)).current;
  const animationSize = Math.min(
    460,
    Math.max(
      290,
      Math.round(Math.min(windowWidth * 0.98, windowHeight * 0.46))
    )
  );
  const withoutFortifyLabelPosition = {
    top: Math.round(animationSize * 0.52),
    right: Math.round(animationSize * 0.08),
  };
  const withFortifyLabelPosition = {
    top: Math.round(animationSize * 0.22),
    right: Math.round(animationSize * 0.12),
  };
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationLooksTruncated = isLikelyTruncatedAnimation(CLARITY_ANIMATION);
  const [showContinue, setShowContinue] = useState(
    !canRenderLottie || animationLooksTruncated
  );

  useFocusEffect(
    useCallback(() => {
      if (!canRenderLottie || !LottieView || animationLooksTruncated) {
        setShowContinue(true);
        return;
      }

      setShowContinue(false);
      fortifyOpacity.setValue(0);
      fortifyTranslateY.setValue(6);

      const timeout = setTimeout(() => {
        lottieRef.current?.reset?.();
        lottieRef.current?.play?.();
      }, 0);

      const labelTimeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fortifyOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.spring(fortifyTranslateY, {
            toValue: 0,
            tension: 160,
            friction: 14,
            useNativeDriver: true,
          }),
        ]).start();
      }, FORTIFY_LABEL_DELAY_MS);

      return () => {
        clearTimeout(timeout);
        clearTimeout(labelTimeout);
      };
    }, [
      animationLooksTruncated,
      canRenderLottie,
      fortifyOpacity,
      fortifyTranslateY,
    ])
  );

  const handleContinue = () => {
    trackOnboardingStepCompleted('insights_preview');
    router.push('/onboarding/program-setup-intro');
  };

  return (
    <OnboardingScreen
      step={8}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Fortify helps you break through your goals!"
      subtitle="Our personalized experience will help you move past your barriers"
      titleFontSize={30}
      subtitleFontSize={20}
      onBack={() => router.back()}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.lg}
      floatingFooter={
        <View style={styles.footerSlot} pointerEvents={showContinue ? 'auto' : 'none'}>
          <GlassButton
            style={[styles.button, !showContinue && styles.buttonHidden]}
            onPress={handleContinue}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
          </GlassButton>
        </View>
      }
    >
      <View style={styles.animationWrap}>
        {canRenderLottie && LottieView && !animationLooksTruncated ? (
          <View style={[styles.graphWrap, { width: animationSize, height: animationSize }]}>
            <LottieView
              source={CLARITY_ANIMATION}
              autoPlay={false}
              loop={false}
              onAnimationFinish={() => setShowContinue(true)}
              ref={lottieRef as unknown as never}
              style={styles.graphAnimation}
            />
            <Animated.Text
              style={[
                styles.withoutFortifyLabel,
                {
                  color: colors.textPrimary,
                  opacity: fortifyOpacity,
                  transform: [{ translateY: fortifyTranslateY }],
                  ...withoutFortifyLabelPosition,
                },
              ]}
            >
              without Fortify
            </Animated.Text>
            <Animated.Text
              style={[
                styles.withFortifyLabel,
                {
                  color: colors.tabActive,
                  opacity: fortifyOpacity,
                  transform: [{ translateY: fortifyTranslateY }],
                  ...withFortifyLabelPosition,
                },
              ]}
            >
              with Fortify
            </Animated.Text>
          </View>
        ) : (
          <View
            style={[
              styles.fallbackCard,
              { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground },
            ]}
          >
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
    marginTop: -Spacing.sm,
  },
  graphWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphAnimation: {
    ...StyleSheet.absoluteFillObject,
  },
  withoutFortifyLabel: {
    position: 'absolute',
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(14),
    letterSpacing: 1,
  },
  withFortifyLabel: {
    position: 'absolute',
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(14),
    letterSpacing: 1,
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
  footerSlot: {
    width: '100%',
    alignItems: 'stretch',
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonHidden: {
    opacity: 0,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
