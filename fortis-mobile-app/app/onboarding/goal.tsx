import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

type FitnessGoal = 'build_muscle' | 'general_health' | 'improve_strength' | 'stay_consistent';

const OPTIONS: Array<{ value: FitnessGoal; title: string }> = [
  { value: 'build_muscle', title: 'Build muscle' },
  { value: 'general_health', title: 'General health and fitness' },
  { value: 'improve_strength', title: 'Improve strength' },
  { value: 'stay_consistent', title: 'Stay consistent' },
];

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<FitnessGoal | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.fitness_goal) return;
      setSelected(state.fitness_goal);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: FitnessGoal) => {
    setSelected(value);
    void updateOnboardingState({ fitness_goal: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/challenge');
  };

  return (
    <OnboardingScreen
      step={9}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your primary goal?"
      subtitle="Pick the one that matters most right now."
      onBack={() => router.back()}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} disabled={!selected}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            selected={selected === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 12,
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
