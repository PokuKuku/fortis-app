import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
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
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    welcomeTitle: { color: colors.textPrimary },
    welcomeSubtitle: { color: colors.textSecondary },
    featureText: { color: colors.textPrimary },
    getStartedText: { color: colors.white },
    dot: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
    dotActive: { backgroundColor: colors.accent },
    featureDot: { backgroundColor: colors.accent },
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/units');
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Svg height="60" width="220" viewBox="0 0 220 60">
              <Defs>
                <SvgLinearGradient id="welcomeGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={colors.accentLight} />
                  <Stop offset="50%" stopColor={colors.accent} />
                  <Stop offset="100%" stopColor={colors.accentDark} />
                </SvgLinearGradient>
              </Defs>
              <SvgText
                fill="url(#welcomeGradient)"
                fontSize="32"
                fontWeight="900"
                letterSpacing="5"
                x="110"
                y="42"
                textAnchor="middle"
                fontFamily="BankGothicBT-Medium, sans-serif"
              >
                FORTIS
              </SvgText>
            </Svg>
          </View>

          {/* Welcome Message */}
          <View style={styles.messageContainer}>
            <Text style={[styles.welcomeTitle, themedStyles.welcomeTitle]}>Welcome to Fortis</Text>
            <Text style={[styles.welcomeSubtitle, themedStyles.welcomeSubtitle]}>
              Your personal strength training companion. Track workouts, monitor progress, and achieve your fitness goals.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, themedStyles.featureDot]} />
              <Text style={[styles.featureText, themedStyles.featureText]}>Track every rep and set</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, themedStyles.featureDot]} />
              <Text style={[styles.featureText, themedStyles.featureText]}>Follow structured programs</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, themedStyles.featureDot]} />
              <Text style={[styles.featureText, themedStyles.featureText]}>Visualize your progress</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <View style={styles.buttonContainer}>
            <GlassButton
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={[styles.getStartedText, themedStyles.getStartedText]}>Get Started</Text>
            </GlassButton>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
              <View style={[styles.dot, themedStyles.dotActive]} />
              <View style={[styles.dot, themedStyles.dot]} />
              <View style={[styles.dot, themedStyles.dot]} />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: Spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  featureText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  buttonContainer: {
    gap: Spacing['2xl'],
  },
  getStartedButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
  },
  getStartedText: {
    ...Typography.button,
    color: Colors.white,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: Colors.success,
  },
});
