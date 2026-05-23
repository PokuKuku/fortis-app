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

type Challenge = 'consistency' | 'plateaus' | 'starting_out' | 'time';

const OPTIONS: Array<{ value: Challenge; title: string }> = [
  { value: 'consistency', title: 'Consistency' },
  { value: 'plateaus', title: 'Plateaus' },
  { value: 'starting_out', title: 'Starting out' },
  { value: 'time', title: 'Time' },
];

export default function OnboardingChallengeScreen() {
  useOnboardingFunnelScreen('Q16. What are you biggest challenge');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Challenge[]>([]);
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

      void updateOnboardingState({
        biggest_challenges: nextSelected,
        biggest_challenge: nextSelected[0] ?? undefined,
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted('biggest_challenges', {
      biggest_challenges: selected.join(', '),
      biggest_challenge: selected[0] ?? null,
    });
    router.push('/onboarding/progress-blocker');
  };

  return (
    <OnboardingScreen
      step={7}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What are your biggest challenges toward your goals?"
      subtitle="Rank all that apply. Tap in order of importance."
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
