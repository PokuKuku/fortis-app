import { useMemo, type ComponentType } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import * as Notifications from 'expo-notifications';
import { HAS_REQUESTED_NOTIFICATIONS_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';

const THANK_YOU_ANIMATION = require('../../assets/lottie/Lock Animation.json');

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

export default function OnboardingThankYouScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const animationSize = Math.min(
    360,
    Math.max(240, Math.round(Math.min(windowWidth * 0.78, windowHeight * 0.34)))
  );
  const animationSource = useMemo(() => {
    if (!THANK_YOU_ANIMATION || typeof THANK_YOU_ANIMATION !== 'object') return THANK_YOU_ANIMATION;
    const textRgb01 = parseColorToRgb01(colors.textPrimary);
    if (!textRgb01) return THANK_YOU_ANIMATION;

    const cloned = JSON.parse(JSON.stringify(THANK_YOU_ANIMATION)) as unknown;
    recolorLottieJson(cloned, [0, 0, 0, 1], [textRgb01[0], textRgb01[1], textRgb01[2], 1]);
    return cloned;
  }, [colors.textPrimary]);

  const handleContinue = async () => {
    trackOnboardingStepCompleted('privacy_thank_you');
    try {
      const alreadyRequested = await getScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY);
      if (alreadyRequested !== 'true') {
        if (typeof Notifications.getPermissionsAsync !== 'function') {
          await setScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
          return;
        }

        const { status, granted, canAskAgain } = await Notifications.getPermissionsAsync();
        if (!granted && status !== 'granted' && canAskAgain) {
          if (typeof Notifications.requestPermissionsAsync === 'function') {
            await Notifications.requestPermissionsAsync();
          }
        }
        await setScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
      }
    } catch {
      // Ignore permission errors to avoid blocking onboarding.
    } finally {
      router.push('/onboarding/complete');
    }
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
              source={animationSource}
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
            Thank you for trusting us.
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            Now let’s tailor Fortify to you.
          </Text>
        </View>

        <View style={[styles.infoCard, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.infoHeader}>
            <LockClosedIcon size={18} color={colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Privacy-first</Text>
          </View>
          <Text style={[styles.infoBody, { color: colors.textPrimary }]}>
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
    marginTop: -Spacing['2xl'],
  },
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
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
