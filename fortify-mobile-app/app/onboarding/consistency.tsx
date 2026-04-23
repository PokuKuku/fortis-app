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

type Consistency = 'none' | 'daily' | 'few_times_week' | 'once_or_less' | 'starting';

const OPTIONS: Array<{ value: Consistency; title: string }> = [
  { value: 'none', title: 'Currently not working out' },
  { value: 'once_or_less', title: '1 - 3 times a week' },
  { value: 'few_times_week', title: '4 - 6 times a week' },
  { value: 'daily', title: 'Daily' },
];

export default function OnboardingConsistencyScreen() {
  useOnboardingFunnelScreen('Q9. How consistent are you');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Consistency | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.workout_consistency) return;
      setSelected(state.workout_consistency === 'starting' ? 'none' : state.workout_consistency);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: Consistency) => {
    setSelected(value);
    void updateOnboardingState({ workout_consistency: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted('workout_consistency');
    router.push('/onboarding/other-apps');
  };

  return (
    <OnboardingScreen
      step={8}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How would you describe your workout consistency?"
      subtitle={undefined}
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!selected}
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
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
