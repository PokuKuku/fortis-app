import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingWheelPicker } from '@/src/components/onboarding/OnboardingWheelPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const WORKOUT_OPTIONS = Array.from({ length: 7 }, (_, index) => index + 1);

export default function OnboardingWorkoutsPerWeekScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(2);
  const selectedValue = WORKOUT_OPTIONS[selectedIndex];

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || typeof state?.workouts_per_week !== 'number') return;
      const nextValue = Math.min(Math.max(state.workouts_per_week, 1), WORKOUT_OPTIONS.length);
      const nextIndex = Math.max(WORKOUT_OPTIONS.indexOf(nextValue), 0);
      setSelectedIndex(nextIndex);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (nextIndex: number) => {
    setSelectedIndex(nextIndex);
    Haptics.selectionAsync();
    void updateOnboardingState({ workouts_per_week: WORKOUT_OPTIONS[nextIndex] });
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateOnboardingState({ workouts_per_week: selectedValue });
    router.push('/onboarding/other-apps');
  };

  return (
    <OnboardingScreen
      step={7}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How many workouts per week do you do?"
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.wheelWrapper}>
        <OnboardingWheelPicker
          items={WORKOUT_OPTIONS.map(String)}
          selectedIndex={selectedIndex}
          onChange={handleChange}
        />
        <Text style={[styles.countLabel, { color: colors.textSecondary }]}>times per week</Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  wheelWrapper: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  countLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
