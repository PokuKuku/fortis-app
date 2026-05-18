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

type FitnessPriority = 'strength' | 'muscle_growth' | 'fat_loss' | 'conditioning' | 'mobility' | 'consistency';

const OPTIONS: Array<{ value: FitnessPriority; title: string }> = [
  { value: 'strength', title: '🏋️ Strength' },
  { value: 'muscle_growth', title: '💪 Muscle growth' },
  { value: 'fat_loss', title: '🔥 Fat loss' },
  { value: 'conditioning', title: '🫀 Conditioning' },
  { value: 'mobility', title: '🤸 Mobility' },
  { value: 'consistency', title: '📅 Consistency' },
];

const VALID_PRIORITIES = new Set<FitnessPriority>(OPTIONS.map((option) => option.value));

export default function OnboardingFitnessPrioritiesScreen() {
  useOnboardingFunnelScreen('Q13. Fitness Priorities');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<FitnessPriority[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const stored = (state?.fitness_priorities ?? []).filter((value): value is FitnessPriority =>
        VALID_PRIORITIES.has(value as FitnessPriority)
      );
      setSelected(stored);
    };
    void loadState();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: FitnessPriority) => {
    setSelected((prev) => {
      const nextSelected = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      void updateOnboardingState({ fitness_priorities: nextSelected });
      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (isDisabled) return;
    trackOnboardingStepCompleted('fitness_priorities', {
      fitness_priorities: selected.join(', '),
    });
    router.push('/onboarding/consistency');
  };

  return (
    <OnboardingScreen
      step={12}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your main fitness priorities"
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
