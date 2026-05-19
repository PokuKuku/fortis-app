import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import type { ProgressBlocker } from '@/src/utils/onboardingConversion';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const OPTIONS: Array<{
  value: ProgressBlocker;
  title: string;
  description: string;
}> = [
  {
    value: 'no_plan',
    title: '🧭 Not knowing what to do next',
    description: 'Fortify builds the plan before you train.',
  },
  {
    value: 'unclear_progress',
    title: '📊 Not knowing if I am improving',
    description: 'Progress trends show what is changing.',
  },
  {
    value: 'plateaus',
    title: '🧱 Getting stuck at the same weights',
    description: 'AI flags where to adjust.',
  },
  {
    value: 'time',
    title: '⏱️ Workouts taking too long',
    description: 'Session length shapes each workout.',
  },
  {
    value: 'accountability',
    title: '🔔 Falling off my routine',
    description: 'Schedule and reminders keep you moving.',
  },
];

const CHALLENGE_BY_BLOCKER: Record<ProgressBlocker, 'consistency' | 'plateaus' | 'starting_out' | 'time'> = {
  no_plan: 'starting_out',
  unclear_progress: 'plateaus',
  plateaus: 'plateaus',
  time: 'time',
  accountability: 'consistency',
};

export default function OnboardingProgressBlockerScreen() {
  useOnboardingFunnelScreen('Q17. Progress Blocker');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<ProgressBlocker | null>(null);
  const isDisabled = selected === null;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setSelected(state?.progress_blocker ?? null);
    };

    void loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: ProgressBlocker) => {
    const nextValue = selected === value ? null : value;
    const nextChallenge = nextValue ? CHALLENGE_BY_BLOCKER[nextValue] : undefined;
    setSelected(nextValue);
    void updateOnboardingState({
      progress_blocker: nextValue ?? undefined,
      biggest_challenge: nextChallenge,
      biggest_challenges: nextChallenge ? [nextChallenge] : undefined,
    });
  };

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted('progress_blocker', {
      progress_blocker: selected,
    });
    router.push('/onboarding/insights');
  };

  return (
    <OnboardingScreen
      step={7}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is the biggest challenge you face in your fitness journey?"
      subtitle="Pick the one Fortify should help solve first."
      titleNumberOfLines={4}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton
          style={styles.floatingButton}
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
            description={option.description}
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
  floatingButton: {
    height: 54,
    borderRadius: BorderRadius.xl,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
