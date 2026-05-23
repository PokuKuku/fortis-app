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
  { value: 'self_confidence', title: 'Build confidence' },
  { value: 'daily_energy', title: 'Improve daily energy' },
  { value: 'discipline', title: 'Stay disciplined' },
  { value: 'strength_capability', title: 'Sharpen my mindset' },
];

const VALID_MOTIVATIONS = new Set<Motivation>(OPTIONS.map((option) => option.value));

const isMotivation = (value: unknown): value is Motivation => {
  return typeof value === 'string' && VALID_MOTIVATIONS.has(value as Motivation);
};

export default function OnboardingMotivationScreen() {
  useOnboardingFunnelScreen('Q17. Fitness Motivation');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Motivation[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedMotivations = state?.fitness_motivations?.filter(isMotivation) ?? [];
      const storedPrimary = isMotivation(state?.fitness_motivation) ? state.fitness_motivation : null;
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
      if (!wasSelected && prev.length >= 3) {
        return prev;
      }

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
    trackOnboardingStepCompleted('fitness_motivations', {
      fitness_motivations: selected.join(', '),
      fitness_motivation: selected[0] ?? null,
    });
    router.push('/onboarding/experience');
  };

  return (
    <OnboardingScreen
      step={4}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How would achieving this outcome impact your life outside the gym?"
      subtitle="Select up to 3. Rank in order of importance."
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={isDisabled}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
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
