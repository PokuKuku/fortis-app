/**
 * Onboarding Welcome Screen - Premium Brand Introduction
 *
 * Design Direction: "Private Fitness Club Membership"
 * The entry point to Fortis - confident, refined, powerful.
 */

import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
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
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';


export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    tagline: { color: colors.textPrimary },
    divider: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.1)',
    },
    buttonText: { color: colors.white },
  };

  useEffect(() => {
    // Staggered entrance animations for premium feel
    const animationSequence = Animated.stagger(150, [
      // 1. Logo fade + scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline fade + slide
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 3. Divider expand
      Animated.parallel([
        Animated.timing(dividerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(dividerScale, {
          toValue: 1,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      // 4. Button fade + slide
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
      // 5. Progress indicator
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

  const handleBeginSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/units');
  };

  // Gradient colors for logo - use theme accent colors
  const gradientLight = colors.accentLight;
  const gradientMid = colors.accent;
  const gradientDark = colors.accentDark;

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Animated Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <Svg height="70" width="260" viewBox="0 0 260 70">
                <Defs>
                  <SvgLinearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor={gradientLight} />
                    <Stop offset="50%" stopColor={gradientMid} />
                    <Stop offset="100%" stopColor={gradientDark} />
                  </SvgLinearGradient>
                </Defs>
                <SvgText
                  fill="url(#logoGradient)"
                  fontSize="42"
                  fontWeight="900"
                  letterSpacing="8"
                  x="130"
                  y="50"
                  textAnchor="middle"
                  fontFamily="BankGothicBT-Medium, sans-serif"
                >
                  FORTIS
                </SvgText>
              </Svg>
            </Animated.View>

            {/* Tagline */}
            <Animated.View
              style={[
                styles.taglineContainer,
                {
                  opacity: taglineOpacity,
                  transform: [{ translateY: taglineTranslate }],
                },
              ]}
            >
              <Text style={[styles.tagline, themedStyles.tagline]}>
                PRECISION STRENGTH TRAINING
              </Text>
            </Animated.View>

            {/* Decorative Divider */}
            <Animated.View
              style={[
                styles.divider,
                themedStyles.divider,
                {
                  opacity: dividerOpacity,
                  transform: [{ scaleX: dividerScale }],
                },
              ]}
            />
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* CTA Button */}
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
                style={styles.beginButton}
                onPress={handleBeginSetup}
              >
                <Text style={[styles.buttonText, themedStyles.buttonText]}>
                  BEGIN SETUP
                </Text>
              </GlassButton>
            </Animated.View>

            {/* Progress Indicator */}
            <Animated.View style={{ opacity: progressOpacity }}>
              <OnboardingProgress currentStep={1} totalSteps={4} />
            </Animated.View>
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  divider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    marginTop: Spacing.lg,
  },
  bottomSection: {
    gap: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  buttonContainer: {
    width: '100%',
  },
  beginButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
