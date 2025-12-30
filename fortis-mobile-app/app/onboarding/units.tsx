import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

type UnitSystem = 'imperial' | 'metric';
type BodyType = 'male' | 'female';

export default function OnboardingUnitsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { updateProfile, isAuthenticated } = useAuth();
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const [selectedUnit, setSelectedUnit] = useState<UnitSystem>('imperial');
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType>('male');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    optionCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    optionTitle: { color: colors.textPrimary },
    optionDescription: { color: colors.textSecondary },
    exampleUnit: { color: colors.textSecondary },
    radioOuter: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    },
    continueText: { color: colors.white },
    dot: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
    dotActive: { backgroundColor: colors.accent },
    optionCardSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentOverlay,
    },
    exampleWeight: { color: colors.accent },
    radioOuterSelected: { borderColor: colors.accent },
    radioInner: { backgroundColor: colors.accent },
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

  const handleUnitSelect = (unit: UnitSystem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUnit(unit);
  };

  const handleBodyTypeSelect = (bodyType: BodyType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBodyType(bodyType);
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Save body type locally (works for all users)
    setBodyType(selectedBodyType);

    // Only save to profile if authenticated
    if (isAuthenticated) {
      await updateProfile({ preferred_units: selectedUnit });
    }

    setIsLoading(false);
    router.push('/onboarding/complete');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, themedStyles.title]}>Set Your Preferences</Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              Customize your workout experience
            </Text>
          </View>

          {/* Options Container */}
          <View style={styles.allOptionsContainer}>
            {/* Weight Units Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionLabel, themedStyles.subtitle]}>Weight Units</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.compactOptionCard,
                    themedStyles.optionCard,
                    selectedUnit === 'imperial' && themedStyles.optionCardSelected,
                  ]}
                  onPress={() => handleUnitSelect('imperial')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.compactOptionTitle, themedStyles.optionTitle]}>Imperial</Text>
                  <Text style={[styles.compactOptionExample, themedStyles.exampleWeight]}>lbs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.compactOptionCard,
                    themedStyles.optionCard,
                    selectedUnit === 'metric' && themedStyles.optionCardSelected,
                  ]}
                  onPress={() => handleUnitSelect('metric')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.compactOptionTitle, themedStyles.optionTitle]}>Metric</Text>
                  <Text style={[styles.compactOptionExample, themedStyles.exampleWeight]}>kg</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Body Type Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionLabel, themedStyles.subtitle]}>Body Type</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.compactOptionCard,
                    themedStyles.optionCard,
                    selectedBodyType === 'male' && themedStyles.optionCardSelected,
                  ]}
                  onPress={() => handleBodyTypeSelect('male')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.compactOptionTitle, themedStyles.optionTitle]}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.compactOptionCard,
                    themedStyles.optionCard,
                    selectedBodyType === 'female' && themedStyles.optionCardSelected,
                  ]}
                  onPress={() => handleBodyTypeSelect('female')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.compactOptionTitle, themedStyles.optionTitle]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <GlassButton
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={[styles.continueText, themedStyles.continueText]}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Text>
            </GlassButton>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
              <View style={[styles.dot, themedStyles.dot]} />
              <View style={[styles.dot, themedStyles.dotActive]} />
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
  header: {
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  allOptionsContainer: {
    gap: Spacing['2xl'],
  },
  sectionContainer: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.h4,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  compactOptionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  compactOptionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  compactOptionExample: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.success,
    fontFamily: 'BankGothicBT-Medium',
  },
  buttonContainer: {
    gap: Spacing['2xl'],
  },
  continueButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
  },
  continueText: {
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
