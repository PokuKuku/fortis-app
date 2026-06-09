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
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type GoalPace = 'steady' | 'balanced' | 'aggressive';

const OPTIONS: Array<{ value: GoalPace; title: string; description: string }> = [
  {
    value: 'steady',
    title: 'Steady',
    description: 'Sustainable pace with more recovery room.',
  },
  {
    value: 'balanced',
    title: 'Balanced',
    description: 'A practical mix of progress and recovery.',
  },
  {
    value: 'aggressive',
    title: 'Aggressive',
    description: 'Higher training demand when you can push.',
  },
];

export default function OnboardingGoalPaceScreen() {
  useOnboardingFunnelScreen('Q17. Goal Pace');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<GoalPace | null>(null);

  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setSelected(state?.goal_pace ?? 'balanced');
    };
    void loadState();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: GoalPace) => {
    setSelected(value);
    void updateOnboardingState({ goal_pace: value });
  };

  const handleContinue = async () => {
    const value = selected ?? 'balanced';
    await updateOnboardingState({ goal_pace: value });
    trackOnboardingStepCompleted('goal_pace', {
      goal_pace: value,
    });
    router.push('/onboarding/six-month-preview');
  };

  return (
    <OnboardingScreen
      step={16}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What pace do you want to reach your goals?"
      subtitle={undefined}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton style={styles.button} onPress={() => void handleContinue()} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={(selected ?? 'balanced') === option.value}
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
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
