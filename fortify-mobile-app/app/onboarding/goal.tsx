import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';

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
  const [selected, setSelected] = useState<FitnessGoal[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedGoals = (state?.fitness_goals?.filter(Boolean) ?? []) as FitnessGoal[];
      const storedPrimary = (state?.fitness_goal ?? null) as FitnessGoal | null;
      const nextGoals = storedGoals.length > 0
        ? storedGoals
        : storedPrimary
          ? [storedPrimary]
          : [];
      setSelected(nextGoals);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: FitnessGoal) => {
    setSelected((prev) => {
      const wasSelected = prev.includes(value);
      const nextSelected = wasSelected
        ? prev.filter((goal) => goal !== value)
        : [...prev, value];

      void updateOnboardingState({
        fitness_goals: nextSelected,
        fitness_goal: nextSelected[0] ?? undefined,
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted('fitness_goals');
    router.push('/onboarding/challenge');
  };

  return (
    <OnboardingScreen
      step={11}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What are your main fitness goals?"
      subtitle="Rank all that apply. Tap in order of importance."
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={isDisabled}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const rank = selected.indexOf(option.value);
          return (
            <OnboardingOptionCard
              key={option.value}
              title={option.title}
              selected={rank !== -1}
              rank={rank === -1 ? null : rank + 1}
              onSelect={() => handleSelect(option.value)}
            />
          );
        })}
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
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
