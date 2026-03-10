import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getOnboardingState } from '@/src/utils/onboardingState';
import { InlineAnimatedLogo } from '@/components/InlineAnimatedLogo';

const ADVANCE_DELAY_MS = 2400;
const GREETING_TEXT_SIZE = 26;
const COMMA_RIGHT_NUDGE = 7;

export default function OnboardingGreetingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [fullName, setFullName] = useState<string | null>(null);
  const floatOffset = useState(() => new Animated.Value(0))[0];
  const textSize = GREETING_TEXT_SIZE;
  const commaOffset = -Math.round(textSize * 0.35) + COMMA_RIGHT_NUDGE;
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
        <View
          style={[styles.lineContainer, { width: screenWidth }]}
        >
          <View style={styles.textGroup}>
            <View style={styles.line}>
              <Text
                style={[styles.text, { color: colors.textPrimary, fontSize: textSize }]}
                allowFontScaling={false}
                numberOfLines={1}
              >
                Welcome to
              </Text>
              <View style={styles.logoGroup}>
                <View style={[styles.logoInline, { marginTop: logoNudge }]}>
                  <InlineAnimatedLogo fontSize={textSize} introDurationMs={450} shineDurationMs={1400} />
                </View>
                <Text
                  style={[
                    styles.text,
                    styles.comma,
                    { color: colors.textPrimary, fontSize: textSize, marginLeft: commaOffset },
                  ]}
                  allowFontScaling={false}
                  numberOfLines={1}
                >
                  ,
                </Text>
              </View>
            </View>
            {trailingText ? (
              <Text
                style={[styles.text, { color: colors.textPrimary, fontSize: textSize }]}
                allowFontScaling={false}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {trailingText}
              </Text>
            ) : null}
          </View>
        </View>
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
  lineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    flexWrap: 'nowrap',
    maxWidth: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.xs,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
    maxWidth: '100%',
  },
  comma: {
    marginLeft: 0,
  },
});
