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

type Motivation =
  | 'self_confidence'
  | 'longevity'
  | 'daily_energy'
  | 'strength_capability'
  | 'body_confidence'
  | 'discipline';

const OPTIONS: Array<{ value: Motivation; title: string }> = [
  { value: 'self_confidence', title: 'More self-confidence' },
  { value: 'longevity', title: 'A healthier, longer life' },
  { value: 'daily_energy', title: 'More energy every day' },
  { value: 'strength_capability', title: 'Feel stronger and capable' },
  { value: 'body_confidence', title: 'Look better in my body' },
  { value: 'discipline', title: 'Stay disciplined' },
];

export default function OnboardingMotivationScreen() {
  useOnboardingFunnelScreen('Q14. Fitness Motivation');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Motivation[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedMotivations = (state?.fitness_motivations?.filter(Boolean) ?? []) as Motivation[];
      const storedPrimary = (state?.fitness_motivation ?? null) as Motivation | null;
      const nextMotivations = storedMotivations.length > 0
        ? storedMotivations
        : storedPrimary
          ? [storedPrimary]
          : [];
      setSelected(nextMotivations);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: Motivation) => {
    setSelected((prev) => {
      const wasSelected = prev.includes(value);
      const nextSelected = wasSelected
        ? prev.filter((motivation) => motivation !== value)
        : [...prev, value];

      void updateOnboardingState({
        fitness_motivations: nextSelected,
        fitness_motivation: nextSelected[0] ?? undefined,
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted('fitness_motivations');
    router.push('/onboarding/insights');
  };

  return (
    <OnboardingScreen
      step={14}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What would reaching your fitness goals do for you?"
      subtitle="Fortify AI uses this to personalize your training around what matters most to you."
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
