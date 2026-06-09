import { useMemo, type ComponentType } from 'react';
import { Text, StyleSheet, View, UIManager, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const SUCCESS_ANIMATION = require('../../assets/lottie/success.json');

type LottieColor = [number, number, number, number];

const SUCCESS_GREEN_FILL: LottieColor = [0.229886716955, 0.739552696078, 0.369435897528, 1];
const SUCCESS_GREEN_STROKE: LottieColor = [0.23137254902, 0.741176470588, 0.36862745098, 1];

const isLottieColor = (value: unknown): value is LottieColor =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((channel) => typeof channel === 'number');

const colorsClose = (a: LottieColor, b: LottieColor, epsilon = 0.001): boolean =>
  a.every((value, index) => Math.abs(value - b[index]) <= epsilon);

const parseHexChannel = (value: string): number | null => {
  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseColorToRgb01 = (value: string): [number, number, number] | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('#')) return null;

  const hex = trimmed.slice(1);
  if (hex.length === 3) {
    const r = parseHexChannel(hex[0] + hex[0]);
    const g = parseHexChannel(hex[1] + hex[1]);
    const b = parseHexChannel(hex[2] + hex[2]);
    if (r === null || g === null || b === null) return null;
    return [r / 255, g / 255, b / 255];
  }

  if (hex.length === 6) {
    const r = parseHexChannel(hex.slice(0, 2));
    const g = parseHexChannel(hex.slice(2, 4));
    const b = parseHexChannel(hex.slice(4, 6));
    if (r === null || g === null || b === null) return null;
    return [r / 255, g / 255, b / 255];
  }

  return null;
};

const recolorLottieJson = (node: unknown, from: LottieColor, to: LottieColor) => {
  if (!node || typeof node !== 'object') return;

  const record = node as Record<string, unknown>;
  const nodeType = record.ty;

  if ((nodeType === 'fl' || nodeType === 'st') && record.c && typeof record.c === 'object') {
    const colorRecord = record.c as Record<string, unknown>;
    const current = colorRecord.k;
    if (isLottieColor(current) && colorsClose(current, from)) {
      colorRecord.k = [...to] as LottieColor;
    }
    if (Array.isArray(current)) {
      current.forEach((frame) => {
        if (!frame || typeof frame !== 'object') return;
        const frameRecord = frame as Record<string, unknown>;
        const start = frameRecord.s;
        if (isLottieColor(start) && colorsClose(start, from)) {
          frameRecord.s = [...to] as LottieColor;
        }
      });
    }
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      value.forEach((item) => recolorLottieJson(item, from, to));
    } else if (value && typeof value === 'object') {
      recolorLottieJson(value, from, to);
    }
  }
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

export default function OnboardingMetricsIntroScreen() {
  useOnboardingFunnelScreen('Metrics Intro');

  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const animationSize = Math.min(360, Math.max(260, Math.round(windowWidth * 0.78)));
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationSource = useMemo(() => {
    if (!SUCCESS_ANIMATION || typeof SUCCESS_ANIMATION !== 'object') return SUCCESS_ANIMATION;
    const accentRgb01 = parseColorToRgb01(colors.accent);
    if (!accentRgb01) return SUCCESS_ANIMATION;

    const recolored = JSON.parse(JSON.stringify(SUCCESS_ANIMATION)) as unknown;
    const accentColor: LottieColor = [accentRgb01[0], accentRgb01[1], accentRgb01[2], 1];
    recolorLottieJson(recolored, SUCCESS_GREEN_FILL, accentColor);
    recolorLottieJson(recolored, SUCCESS_GREEN_STROKE, accentColor);
    return recolored;
  }, [colors.accent]);

  const handleContinue = () => {
    trackOnboardingStepCompleted('metrics_intro');
    router.push('/onboarding/birthdate');
  };

  return (
    <OnboardingScreen
      step={19}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="You’re good to go!"
      subtitle="Now please answer a few quick questions to further tailor your experience."
      onBack={() => router.back()}
      bodyAlign="center"
      useScrollView={false}
      floatingFooter={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
        </GlassButton>
      }
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
              source={animationSource}
              autoPlay
              loop={false}
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
    marginTop: -Spacing.lg,
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
