import { useMemo, type ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
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

const INSIGHTS_ANIMATION = require('../../assets/lottie/render-graph-1-up.json');

type LottieColor = [number, number, number, number];

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
  if (trimmed.startsWith('#')) {
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
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if ([r, g, b].some((channel) => !Number.isFinite(channel))) return null;
    return [Math.min(255, Math.max(0, r)) / 255, Math.min(255, Math.max(0, g)) / 255, Math.min(255, Math.max(0, b)) / 255];
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

export default function OnboardingInsightsScreen() {
  useOnboardingFunnelScreen('Q14. Fortify Provides Insights');

  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const animationSize = Math.min(320, Math.max(220, Math.round(windowWidth * 0.72)));
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationSource = useMemo(() => {
    if (!INSIGHTS_ANIMATION || typeof INSIGHTS_ANIMATION !== 'object') return INSIGHTS_ANIMATION;
    const raw = INSIGHTS_ANIMATION as { assets?: Array<{ id?: string }>; layers?: Array<{ refId?: string }> };

    const base = {
      ...(raw as object),
      ...(Array.isArray(raw.assets) ? { assets: raw.assets.filter((asset) => asset?.id !== 'image_0') } : null),
      ...(Array.isArray(raw.layers) ? { layers: raw.layers.filter((layer) => layer?.refId !== 'image_0') } : null),
    };

    const accentRgb01 = parseColorToRgb01(colors.accent);
    const textRgb01 = parseColorToRgb01(colors.textPrimary);
    if (!accentRgb01 && !textRgb01) return base;

    const cloned = JSON.parse(JSON.stringify(base)) as unknown;
    if (accentRgb01) {
      recolorLottieJson(cloned, [1, 0, 0, 1], [accentRgb01[0], accentRgb01[1], accentRgb01[2], 1]);
    }
    if (textRgb01) {
      recolorLottieJson(cloned, [0, 0.239, 0.478, 1], [textRgb01[0], textRgb01[1], textRgb01[2], 1]);
      recolorLottieJson(cloned, [0, 0.239, 0.477999997606, 1], [textRgb01[0], textRgb01[1], textRgb01[2], 1]);
    }
    return cloned;
  }, [colors.accent, colors.textPrimary]);

  const handleContinue = () => {
    trackOnboardingStepCompleted('insights_preview');
    router.push('/onboarding/thank-you');
  };

  return (
    <OnboardingScreen
      step={14}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Break through your goals"
      subtitle="Fortify finds insights that move you forward"
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
