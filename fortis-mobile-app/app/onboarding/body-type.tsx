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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Body from 'react-native-body-highlighter';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { SelectionCard } from '@/src/components/onboarding/SelectionCard';
import { OnboardingProgress } from '@/src/components/onboarding/OnboardingProgress';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { isSmallScreen, responsiveValue } from '@/src/utils/responsive';

type BodyType = 'male' | 'female';

const CONTENT_PADDING_TOP = responsiveValue(48, 80, 96);
const CONTENT_PADDING_BOTTOM = responsiveValue(Spacing.xl, Spacing['2xl'], Spacing['3xl']);
const TITLE_SIZE = responsiveValue(20, 24, 26);
const BUTTON_HEIGHT = responsiveValue(48, 56, 60);
const BUTTON_TEXT_SIZE = responsiveValue(14, 16, 18);
const BODY_SCALE = responsiveValue(0.24, 0.3, 0.34);
const BOTTOM_GAP = responsiveValue(Spacing.xl, Spacing['3xl'], Spacing['4xl']);

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

    // Save body type to local store (for muscle visualization)
    setBodyType(selectedBodyType);

    router.push('/onboarding/complete');
  };

  // Body silhouette border color based on theme
  const bodyBorder = isDark ? '#555555' : '#aaaaaa';

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              isSmallScreen && styles.cardsContainerStacked,
              {
                opacity: cardsOpacity,
                transform: [{ translateY: cardsTranslate }],
              },
            ]}
          >
            <SelectionCard
              title="MALE"
              icon={
                <Body
                  data={[]}
                  side="front"
                  gender="male"
                  scale={BODY_SCALE}
                  border={bodyBorder}
                />
              }
              isSelected={selectedBodyType === 'male'}
              onSelect={() => handleBodyTypeSelect('male')}
              testID="male-option"
            />

            <SelectionCard
              title="FEMALE"
              icon={
                <Body
                  data={[]}
                  side="front"
                  gender="female"
                  scale={BODY_SCALE}
                  border={bodyBorder}
                />
              }
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
    paddingTop: CONTENT_PADDING_TOP,
    paddingBottom: CONTENT_PADDING_BOTTOM,
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: TITLE_SIZE,
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
  cardsContainerStacked: {
    flexDirection: 'column',
  },
  bottomSection: {
    gap: BOTTOM_GAP,
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
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
