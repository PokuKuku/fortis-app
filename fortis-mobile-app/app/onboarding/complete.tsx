import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircleIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { completeOnboarding, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    startText: { color: colors.white },
    dot: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
    dotActive: { backgroundColor: colors.accent },
    iconCircle: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    checkIcon: { color: colors.accent },
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, []);

  const handleStart = async () => {
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

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.iconCircle,
                themedStyles.iconCircle,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: checkAnim,
                  transform: [
                    {
                      scale: checkAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                }}
              >
                <CheckCircleIcon
                  color={colors.accent}
                  size={80}
                  strokeWidth={1.5}
                />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={[styles.title, themedStyles.title]}>You're All Set!</Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              Your account is ready. Start tracking your workouts and crush your fitness goals.
            </Text>
          </View>

          {/* Start Button */}
          <View style={styles.buttonContainer}>
            <GlassButton
              style={styles.startButton}
              onPress={handleStart}
              disabled={isLoading}
            >
              <Text style={[styles.startText, themedStyles.startText]}>
                {isLoading ? 'Loading...' : isAuthenticated ? 'Start Training' : 'Create Account'}
              </Text>
            </GlassButton>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
              <View style={[styles.dot, themedStyles.dot]} />
              <View style={[styles.dot, themedStyles.dot]} />
              <View style={[styles.dot, themedStyles.dotActive]} />
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
    paddingTop: 80,
    paddingBottom: Spacing['2xl'],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    // backgroundColor and borderColor now applied via themedStyles (colors.accentOverlay, colors.accentBorder)
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: Spacing['2xl'],
    marginTop: Spacing['3xl'],
  },
  startButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
  },
  startText: {
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
    // backgroundColor now applied via themedStyles
  },
  dotActive: {
    // backgroundColor now applied via themedStyles (colors.accent)
  },
});
