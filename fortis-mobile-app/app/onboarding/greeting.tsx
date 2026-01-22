import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getOnboardingState } from '@/src/utils/onboardingState';
import { InlineAnimatedLogo } from '@/components/InlineAnimatedLogo';
import { scale } from '@/src/utils/responsive';

const ADVANCE_DELAY_MS = 2400;

export default function OnboardingGreetingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState<string | null>(null);
  const floatOffset = useState(() => new Animated.Value(0))[0];
  const textSize = scale(28);
  const commaOffset = -Math.round(textSize * 0.35);
  const logoNudge = -Math.round(textSize * 0.18);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setFullName(state?.full_name?.trim() ? state.full_name.trim() : null);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const firstName = useMemo(() => {
    if (!fullName) return null;
    return fullName.split(/\s+/)[0] ?? null;
  }, [fullName]);

  const trailingText = firstName ? `${firstName}!` : '';

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/onboarding/gender');
    }, ADVANCE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatOffset, {
          toValue: -6,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatOffset, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatOffset]);

  return (
    <OnboardingScreen
      step={1}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      subtitle={undefined}
      showProgress={false}
      titleFontSize={0}
      titleTopOffset={-Spacing['2xl']}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.sm}
    >
      <Animated.View
        style={[
          styles.centered,
          {
            transform: [{ translateY: Animated.add(floatOffset, -Spacing.xl) }],
          },
        ]}
      >
        <View style={styles.line}>
          <Text style={[styles.text, { color: colors.textPrimary, fontSize: textSize }]}>Welcome to</Text>
          <View style={[styles.logoInline, { marginTop: logoNudge }]}>
            <InlineAnimatedLogo fontSize={textSize} introDurationMs={450} shineDurationMs={1400} />
          </View>
          <Text
            style={[
              styles.text,
              styles.comma,
              { color: colors.textPrimary, fontSize: textSize, marginLeft: commaOffset },
            ]}
          >
            ,
          </Text>
        </View>
        {trailingText ? (
          <Text style={[styles.text, { color: colors.textPrimary, fontSize: textSize }]}>
            {trailingText}
          </Text>
        ) : null}
      </Animated.View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  logoInline: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
  },
  text: {
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  comma: {
    marginLeft: 0,
  },
});
