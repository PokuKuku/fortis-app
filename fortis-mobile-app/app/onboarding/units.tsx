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
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

type UnitSystem = 'imperial' | 'metric';

export default function OnboardingUnitsScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<UnitSystem>('imperial');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Save preference to profile
    const { error } = await updateProfile({ preferred_units: selectedUnit });

    setIsLoading(false);

    if (!error) {
      router.push('/onboarding/complete');
    }
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.title}>Choose Your Units</Text>
            <Text style={styles.subtitle}>
              Select your preferred weight measurement system
            </Text>
          </View>

          {/* Unit Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedUnit === 'imperial' && styles.optionCardSelected,
              ]}
              onPress={() => handleUnitSelect('imperial')}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Imperial</Text>
                <Text style={styles.optionDescription}>Pounds (lbs)</Text>
              </View>
              <View style={styles.optionExample}>
                <Text style={styles.exampleWeight}>135</Text>
                <Text style={styles.exampleUnit}>lbs</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedUnit === 'imperial' && styles.radioOuterSelected,
                ]}
              >
                {selectedUnit === 'imperial' && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedUnit === 'metric' && styles.optionCardSelected,
              ]}
              onPress={() => handleUnitSelect('metric')}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Metric</Text>
                <Text style={styles.optionDescription}>Kilograms (kg)</Text>
              </View>
              <View style={styles.optionExample}>
                <Text style={styles.exampleWeight}>60</Text>
                <Text style={styles.exampleUnit}>kg</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedUnit === 'metric' && styles.radioOuterSelected,
                ]}
              >
                {selectedUnit === 'metric' && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <GlassButton
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.continueText}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Text>
            </GlassButton>

            {/* Progress Dots */}
            <View style={styles.progressDots}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
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
  optionsContainer: {
    gap: Spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: Spacing.xl,
  },
  optionCardSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  optionExample: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: Spacing.xl,
  },
  exampleWeight: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.success,
    fontFamily: 'BankGothicMediumBT',
  },
  exampleUnit: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.success,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
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
