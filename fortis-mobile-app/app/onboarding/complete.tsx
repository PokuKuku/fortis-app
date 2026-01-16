/**
 * Onboarding Complete Screen - Calibration Complete
 *
 * Design Direction: "Training Lab / Calibration"
 * Dramatic reveal with ring expansion and staggered animations.
 */

import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { CheckIcon } from 'react-native-heroicons/solid';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useAuth } from '@/src/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { responsiveValue } from '@/src/utils/responsive';

const RING_SIZE = responsiveValue(120, 160, 180);
const CHECK_SIZE = responsiveValue(64, 80, 96);
const CHECK_ICON_SIZE = responsiveValue(36, 48, 56);
const OVERLINE_SIZE = responsiveValue(11, 12, 13);
const HEADLINE_SIZE = responsiveValue(22, 26, 28);
const SUBTITLE_SIZE = responsiveValue(14, 16, 18);
const QUICK_LABEL_SIZE = responsiveValue(11, 12, 13);
const QUICK_TEXT_SIZE = responsiveValue(12, 13, 14);
const BUTTON_HEIGHT = responsiveValue(48, 56, 60);
const BUTTON_TEXT_SIZE = responsiveValue(16, 18, 20);
const BOTTOM_GAP = responsiveValue(Spacing.xl, Spacing['3xl'], Spacing['4xl']);
const CONTENT_PADDING_TOP = responsiveValue(Spacing['2xl'], Spacing['3xl'], Spacing['4xl']);
const CONTENT_PADDING_BOTTOM = responsiveValue(Spacing.lg, Spacing['2xl'], Spacing['3xl']);

const QUICK_START_ITEMS = [
  'Create your first session',
  'Log sets with rest and RPE',
  'Track PRs and weekly volume',
];

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Animation values - staggered reveal
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineTranslate = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslate = useRef(new Animated.Value(15)).current;
  const quickOpacity = useRef(new Animated.Value(0)).current;
  const quickTranslate = useRef(new Animated.Value(15)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    overline: { color: colors.textTertiary },
    headline: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    quickStart: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
    quickLabel: { color: colors.textTertiary },
    quickText: { color: colors.textSecondary },
    buttonText: { color: colors.white },
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const animationSequence = Animated.stagger(180, [
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 300,
          friction: 15,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(headlineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(headlineTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(quickOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(quickTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, [
    buttonOpacity,
    buttonTranslate,
    checkOpacity,
    checkScale,
    headlineOpacity,
    headlineTranslate,
    progressOpacity,
    quickOpacity,
    quickTranslate,
    ringOpacity,
    ringScale,
    subtitleOpacity,
    subtitleTranslate,
  ]);

  const handleEnter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    if (isAuthenticated) {
      const { error } = await completeOnboarding();
      setIsLoading(false);
      if (!error) {
        router.replace('/(tabs)');
      }
    } else {
      setIsLoading(false);
      router.replace('/auth');
    }
  };

  const ringGradientStart = colors.accentLight;
  const ringGradientEnd = colors.accentDark;

  const buttonLabel = isLoading
    ? 'LOADING...'
    : isAuthenticated
      ? 'ENTER FORTIS'
      : 'CREATE ACCOUNT';

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.ringContainer,
                  {
                    opacity: ringOpacity,
                    transform: [{ scale: ringScale }],
                  },
                ]}
              >
                <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 160 160">
                  <Defs>
                    <SvgLinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor={ringGradientStart} />
                      <Stop offset="100%" stopColor={ringGradientEnd} />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#ringGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>

              <Animated.View
                style={[
                  styles.checkContainer,
                  {
                    opacity: checkOpacity,
                    transform: [{ scale: checkScale }],
                  },
                ]}
              >
                <View style={[styles.checkCircle, { backgroundColor: colors.accentOverlay }]}>
                  <CheckIcon size={CHECK_ICON_SIZE} color={colors.accent} />
                </View>
              </Animated.View>
            </View>

            <View style={styles.textContainer}>
              <Animated.Text
                style={[
                  styles.overline,
                  themedStyles.overline,
                  {
                    opacity: headlineOpacity,
                    transform: [{ translateY: headlineTranslate }],
                  },
                ]}
              >
                CALIBRATION COMPLETE
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.headline,
                  themedStyles.headline,
                  {
                    opacity: headlineOpacity,
                    transform: [{ translateY: headlineTranslate }],
                  },
                ]}
              >
                SYSTEM READY
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.subtitle,
                  themedStyles.subtitle,
                  {
                    opacity: subtitleOpacity,
                    transform: [{ translateY: subtitleTranslate }],
                  },
                ]}
              >
                Your training log is tuned and ready to run.
              </Animated.Text>
            </View>

            <Animated.View
              style={[
                styles.quickStart,
                themedStyles.quickStart,
                {
                  opacity: quickOpacity,
                  transform: [{ translateY: quickTranslate }],
                },
              ]}
            >
              <Text style={[styles.quickLabel, themedStyles.quickLabel]}>QUICK START</Text>
              {QUICK_START_ITEMS.map((item) => (
                <View key={item} style={styles.quickRow}>
                  <View style={[styles.quickDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.quickText, themedStyles.quickText]}>{item}</Text>
                </View>
              ))}
            </Animated.View>
          </View>

          <View style={styles.bottomSection}>
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonOpacity,
                  transform: [{ translateY: buttonTranslate }],
                },
              ]}
            >
              <GlassButton
                style={styles.enterButton}
                onPress={handleEnter}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, themedStyles.buttonText]}>
                  {buttonLabel}
                </Text>
              </GlassButton>
            </Animated.View>

            <Animated.View style={{ opacity: progressOpacity }}>
              <OnboardingProgress currentStep={4} totalSteps={4} />
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: CONTENT_PADDING_TOP,
    paddingBottom: CONTENT_PADDING_BOTTOM,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  iconContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  overline: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: OVERLINE_SIZE,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: HEADLINE_SIZE,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    fontSize: SUBTITLE_SIZE,
    textAlign: 'center',
    maxWidth: 320,
  },
  quickStart: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  quickLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: QUICK_LABEL_SIZE,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickText: {
    ...Typography.bodySmall,
    fontSize: QUICK_TEXT_SIZE,
    flex: 1,
  },
  bottomSection: {
    gap: BOTTOM_GAP,
  },
  buttonContainer: {
    width: '100%',
  },
  enterButton: {
    height: BUTTON_HEIGHT,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: BUTTON_TEXT_SIZE,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
