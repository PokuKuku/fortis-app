/**
 * Onboarding Complete Screen - Premium Activation Moment
 *
 * Design Direction: "Private Fitness Club Membership"
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
import { useTheme } from '@/src/contexts/ThemeContext';
import { responsiveValue } from '@/src/utils/responsive';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = responsiveValue(120, 160, 180);
const CHECK_SIZE = responsiveValue(64, 80, 96);
const CHECK_ICON_SIZE = responsiveValue(36, 48, 56);
const HEADLINE_SIZE = responsiveValue(22, 26, 28);
const SUBTITLE_SIZE = responsiveValue(14, 16, 18);
const BUTTON_HEIGHT = responsiveValue(48, 56, 60);
const BUTTON_TEXT_SIZE = responsiveValue(16, 18, 20);
const BOTTOM_GAP = responsiveValue(Spacing.xl, Spacing['3xl'], Spacing['4xl']);
const CONTENT_PADDING_BOTTOM = responsiveValue(Spacing.lg, Spacing['2xl'], Spacing['3xl']);

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    headline: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    buttonText: { color: colors.white },
  };

  useEffect(() => {
    // Trigger success haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Staggered entrance animation sequence
    const animationSequence = Animated.stagger(180, [
      // 1. Ring expansion
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
      // 2. Checkmark pop
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
      // 3. Headline reveal
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
      // 4. Subtitle reveal
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
      // 5. Button reveal
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
      // 6. Progress indicator
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

  const handleEnter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    if (isAuthenticated) {
      // User is signed in - mark onboarding complete and go to app
      const { error } = await completeOnboarding();
      setIsLoading(false);
      if (!error) {
        router.replace('/(tabs)');
      }
    } else {
      // User is signed out - go to auth (they'll complete onboarding after signup)
      setIsLoading(false);
      router.replace('/auth');
    }
  };

  // Ring animation interpolation
  const ringStrokeDashoffset = ringScale.interpolate({
    inputRange: [0, 1],
    outputRange: [440, 0], // Full circle circumference
  });

  // Gradient colors for ring - use theme accent colors
  const ringGradientStart = colors.accentLight;
  const ringGradientEnd = colors.accentDark;

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section - Icon + Text */}
          <View style={styles.heroSection}>
            {/* Success Icon with Ring */}
            <View style={styles.iconContainer}>
              {/* Animated Ring */}
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

              {/* Checkmark Icon */}
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

            {/* Text Content */}
            <View style={styles.textContainer}>
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
                YOUR TRAINING BEGINS
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
                Welcome to Fortis
              </Animated.Text>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Enter Button */}
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
                  {isLoading ? 'LOADING...' : isAuthenticated ? 'ENTER' : 'CREATE ACCOUNT'}
                </Text>
              </GlassButton>
            </Animated.View>

            {/* Progress Indicator */}
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
    justifyContent: 'space-between',
    paddingBottom: CONTENT_PADDING_BOTTOM,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing['3xl'],
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
    // backgroundColor set dynamically via themedStyles using colors.accentOverlay
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
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
    fontFamily: 'BankGothicBT-Medium',
    fontSize: SUBTITLE_SIZE,
    fontWeight: '500',
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.7,
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
