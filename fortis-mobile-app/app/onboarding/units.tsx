/**
 * Onboarding Units Screen - Premium Weight Units Selection
 *
 * Design Direction: "Private Fitness Club Membership"
 * Single question per view with auto-advance after selection.
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
import { ScaleIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { SelectionCard } from '@/src/components/onboarding/SelectionCard';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useAuth } from '@/src/contexts/AuthContext';
import { analytics } from '@/src/services/analyticsService';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

type UnitSystem = 'imperial' | 'metric';

export default function OnboardingUnitsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { updateProfile, isAuthenticated } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<UnitSystem | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(30)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
  };

  useEffect(() => {
    // Track step completion and view
    analytics.trackOnboardingStepCompleted({ step: 1, stepName: 'welcome' });
    analytics.trackOnboardingStepViewed({ step: 2, stepName: 'units' });

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

  const handleUnitSelect = async (unit: UnitSystem) => {
    if (isNavigating) return; // Prevent double selection

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUnit(unit);

    // Save to profile if authenticated
    if (isAuthenticated) {
      await updateProfile({ preferred_units: unit });
    }

    // Track step 2 completion before navigating
    analytics.trackOnboardingStepCompleted({ step: 2, stepName: 'units' });

    // Auto-advance after 400ms delay for premium feel
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/onboarding/body-type');
    }, 400);
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
              SELECT YOUR UNITS
            </Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              Choose your preferred weight measurement
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
              title="IMPERIAL"
              subtitle="lbs"
              icon={<ScaleIcon size={32} color={iconColor} strokeWidth={1.5} />}
              isSelected={selectedUnit === 'imperial'}
              onSelect={() => handleUnitSelect('imperial')}
              testID="imperial-option"
            />

            <SelectionCard
              title="METRIC"
              subtitle="kg"
              icon={<ScaleIcon size={32} color={iconColor} strokeWidth={1.5} />}
              isSelected={selectedUnit === 'metric'}
              onSelect={() => handleUnitSelect('metric')}
              testID="metric-option"
            />
          </Animated.View>

          {/* Progress Indicator */}
          <Animated.View
            style={[
              styles.progressContainer,
              { opacity: progressOpacity },
            ]}
          >
            <OnboardingProgress currentStep={2} totalSteps={4} />
          </Animated.View>
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
  progressContainer: {
    alignItems: 'center',
  },
});
