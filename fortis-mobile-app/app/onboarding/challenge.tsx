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

type Challenge = 'consistency' | 'plateaus' | 'starting_out' | 'time';

const OPTIONS: Array<{ value: Challenge; title: string }> = [
  { value: 'consistency', title: 'Consistency' },
  { value: 'plateaus', title: 'Plateaus' },
  { value: 'starting_out', title: 'Starting out' },
  { value: 'time', title: 'Time' },
];

export default function OnboardingChallengeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Challenge[]>([]);
  const [primary, setPrimary] = useState<Challenge | null>(null);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedChallenges = (state?.biggest_challenges?.filter(Boolean) ?? []) as Challenge[];
      const storedPrimary = (state?.biggest_challenge ?? null) as Challenge | null;
      const nextChallenges = storedChallenges.length > 0
        ? storedChallenges
        : storedPrimary
          ? [storedPrimary]
          : [];
      setSelected(nextChallenges);
      setPrimary(
        storedPrimary ?? (nextChallenges.length > 0 ? nextChallenges[nextChallenges.length - 1] : null)
      );
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: Challenge) => {
    setSelected((prev) => {
      const wasSelected = prev.includes(value);
      const nextSelected = wasSelected
        ? prev.filter((challenge) => challenge !== value)
        : [...prev, value];

      setPrimary((prevPrimary) => {
        const nextPrimary = wasSelected
          ? (prevPrimary === value ? (nextSelected[nextSelected.length - 1] ?? null) : prevPrimary)
          : value;

        void updateOnboardingState({
          biggest_challenges: nextSelected,
          biggest_challenge: nextPrimary ?? undefined,
        });

        return nextPrimary;
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    router.push('/onboarding/insights');
  };

  return (
    <OnboardingScreen
      step={11}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What are your biggest challenges toward your goals?"
      subtitle="Select all that apply."
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
        {OPTIONS.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            selected={selected.includes(option.value)}
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
