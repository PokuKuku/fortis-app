/**
 * Onboarding Body Type Screen - Premium Body Type Selection
 *
 * Design Direction: "Private Fitness Club Membership"
 * Single question per view with CONTINUE button after selection.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { UserIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { SelectionCard } from '@/src/components/onboarding/SelectionCard';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { analytics } from '@/src/services/analyticsService';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

type BodyType = 'male' | 'female';

export default function OnboardingBodyTypeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);

  // Entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(20)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    buttonText: { color: colors.white },
  };

  useEffect(() => {
    // Track step 3 view
    analytics.trackOnboardingStepViewed({ step: 3, stepName: 'body-type' });

    // Staggered entrance animation
    const animationSequence = Animated.stagger(150, [
      // 1. Header fade + slide
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. Cards fade + slide
      Animated.parallel([
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardsTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 3. Progress indicator
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

  // Animate button appearance when selection is made
  useEffect(() => {
    if (selectedBodyType) {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslate, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedBodyType]);

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBodyType(bodyType);
  };

  const handleContinue = () => {
    if (!selectedBodyType) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Track step 3 completion
    analytics.trackOnboardingStepCompleted({ step: 3, stepName: 'body-type' });

    // Save body type to local store (for muscle visualization)
    setBodyType(selectedBodyType);

    router.push('/onboarding/complete');
  };

  // Icon colors based on theme
  const iconColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslate }],
              },
            ]}
          >
            <Text style={[styles.title, themedStyles.title]}>
              SELECT BODY TYPE
            </Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              Used for muscle visualization
            </Text>
          </Animated.View>

          {/* Selection Cards */}
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: cardsOpacity,
                transform: [{ translateY: cardsTranslate }],
              },
            ]}
          >
            <SelectionCard
              title="MALE"
              icon={<UserIcon size={32} color={iconColor} strokeWidth={1.5} />}
              isSelected={selectedBodyType === 'male'}
              onSelect={() => handleBodyTypeSelect('male')}
              testID="male-option"
            />

            <SelectionCard
              title="FEMALE"
              icon={<UserIcon size={32} color={iconColor} strokeWidth={1.5} />}
              isSelected={selectedBodyType === 'female'}
              onSelect={() => handleBodyTypeSelect('female')}
              testID="female-option"
            />
          </Animated.View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Continue Button - appears after selection */}
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: buttonOpacity,
                  transform: [{ translateY: buttonTranslate }],
                },
              ]}
              pointerEvents={selectedBodyType ? 'auto' : 'none'}
            >
              <GlassButton
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={[styles.buttonText, themedStyles.buttonText]}>
                  CONTINUE
                </Text>
              </GlassButton>
            </Animated.View>

            {/* Progress Indicator */}
            <Animated.View style={{ opacity: progressOpacity }}>
              <OnboardingProgress currentStep={3} totalSteps={4} />
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
    paddingTop: 80,
    paddingBottom: Spacing['2xl'],
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  bottomSection: {
    gap: Spacing['3xl'],
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
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
