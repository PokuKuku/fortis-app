/**
 * Onboarding Welcome Screen - Baseline Calibration
 *
 * Design Direction: "Training Lab / Calibration"
 */

import { useRef, useEffect } from 'react';
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
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import {
  ChartBarIcon,
  FireIcon,
  CalendarDaysIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useAuth } from '@/src/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { responsiveValue, scale } from '@/src/utils/responsive';

const LOGO_WIDTH = responsiveValue(190, 230, 260);
const LOGO_HEIGHT = responsiveValue(50, 62, 70);
const LOGO_FONT_SIZE = responsiveValue(30, 38, 42);
const LOGO_LETTER_SPACING_RATIO = 3 / 18;
const LOGO_LETTER_SPACING = Math.round(LOGO_FONT_SIZE * LOGO_LETTER_SPACING_RATIO * 10) / 10;
const OVERLINE_SIZE = responsiveValue(11, 12, 13);
const HEADLINE_SIZE = responsiveValue(22, 26, 30);
const SUBTITLE_SIZE = responsiveValue(13, 15, 16);
const FEATURE_ICON_SIZE = responsiveValue(18, 20, 22);
const FEATURE_TITLE_SIZE = responsiveValue(13, 14, 15);
const FEATURE_BODY_SIZE = responsiveValue(12, 13, 14);
const BUTTON_HEIGHT = responsiveValue(48, 56, 60);
const BUTTON_TEXT_SIZE = responsiveValue(14, 16, 18);
const CONTENT_PADDING_TOP = responsiveValue(Spacing['2xl'], Spacing['3xl'], Spacing['4xl']);
const CONTENT_PADDING_BOTTOM = responsiveValue(Spacing.lg, Spacing['2xl'], Spacing['3xl']);
const FEATURE_GAP = responsiveValue(Spacing.md, Spacing.lg, Spacing.xl);
const BOTTOM_GAP = responsiveValue(Spacing.xl, Spacing['3xl'], Spacing['4xl']);

const FEATURES = [
  {
    icon: FireIcon,
    title: 'Precision logging',
    description: 'Track sets, load, rest, and RPE with every lift.',
  },
  {
    icon: ChartBarIcon,
    title: 'Progress map',
    description: 'Volume, PRs, and trends in one clean view.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Program cadence',
    description: 'Build repeatable sessions and a weekly rhythm.',
  },
];

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to auth if not authenticated (onboarding requires auth first)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // Staggered animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(16)).current;
  const featureOpacity = useRef(new Animated.Value(0)).current;
  const featureTranslate = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(24)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    overline: { color: colors.textTertiary },
    headline: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    metaPill: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorderLight,
    },
    metaText: { color: colors.accent },
    featureTitle: { color: colors.textPrimary },
    featureDescription: { color: colors.textSecondary },
    featureIcon: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorderLight,
    },
    buttonText: { color: colors.white },
  };

  useEffect(() => {
    const animationSequence = Animated.stagger(140, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslate, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(featureOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(featureTranslate, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 450,
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
    featureOpacity,
    featureTranslate,
    headerOpacity,
    headerTranslate,
    logoOpacity,
    logoScale,
    progressOpacity,
  ]);

  const handleBeginSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/units');
  };

  const gradientLight = colors.accentLight;
  const gradientMid = colors.accent;
  const gradientDark = colors.accentDark;

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <Svg height={LOGO_HEIGHT} width={LOGO_WIDTH} viewBox="0 0 260 70">
                <Defs>
                  <SvgLinearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor={gradientLight} />
                    <Stop offset="50%" stopColor={gradientMid} />
                    <Stop offset="100%" stopColor={gradientDark} />
                  </SvgLinearGradient>
                </Defs>
                <SvgText
                  fill="url(#logoGradient)"
                  fontSize={LOGO_FONT_SIZE}
                  fontWeight="900"
                  letterSpacing={`${LOGO_LETTER_SPACING}`}
                  x="130"
                  y="50"
                  textAnchor="middle"
                  fontFamily="BankGothicBT-Medium, sans-serif"
                >
                  FORTIS
                </SvgText>
              </Svg>
            </Animated.View>

            <Animated.View
              style={[
                styles.headerSection,
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: headerTranslate }],
                },
              ]}
            >
              <Text style={[styles.overline, themedStyles.overline]}>SETUP RUN</Text>
              <Text style={[styles.headline, themedStyles.headline]}>
                SET YOUR BASELINE
              </Text>
              <Text style={[styles.subtitle, themedStyles.subtitle]}>
                Four quick choices so your log and insights stay consistent.
              </Text>
              <View style={styles.metaRow}>
                {['4 steps', 'Under a minute', 'Change anytime'].map((item) => (
                  <View key={item} style={[styles.metaPill, themedStyles.metaPill]}>
                    <Text style={[styles.metaText, themedStyles.metaText]}>{item}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.featureList,
              {
                opacity: featureOpacity,
                transform: [{ translateY: featureTranslate }],
              },
            ]}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={feature.title} padding={Spacing.lg} style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <View style={[styles.featureIcon, themedStyles.featureIcon]}>
                      <Icon size={FEATURE_ICON_SIZE} color={colors.accent} strokeWidth={1.8} />
                    </View>
                    <Text style={[styles.featureTitle, themedStyles.featureTitle]}>
                      {feature.title}
                    </Text>
                  </View>
                  <Text style={[styles.featureDescription, themedStyles.featureDescription]}>
                    {feature.description}
                  </Text>
                </GlassCard>
              );
            })}
          </Animated.View>

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
              <GlassButton style={styles.beginButton} onPress={handleBeginSetup}>
                <Text style={[styles.buttonText, themedStyles.buttonText]}>START SETUP</Text>
              </GlassButton>
            </Animated.View>

            <Animated.View style={{ opacity: progressOpacity }}>
              <OnboardingProgress currentStep={1} totalSteps={4} />
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
  topSection: {
    gap: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.md,
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
    maxWidth: scale(320),
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  metaPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  metaText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featureList: {
    gap: FEATURE_GAP,
  },
  featureCard: {
    width: '100%',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FEATURE_TITLE_SIZE,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featureDescription: {
    ...Typography.bodySmall,
    fontSize: FEATURE_BODY_SIZE,
    lineHeight: FEATURE_BODY_SIZE * 1.45,
  },
  bottomSection: {
    gap: BOTTOM_GAP,
    paddingTop: Spacing['2xl'],
  },
  buttonContainer: {
    width: '100%',
  },
  beginButton: {
    height: BUTTON_HEIGHT,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: BUTTON_TEXT_SIZE,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
