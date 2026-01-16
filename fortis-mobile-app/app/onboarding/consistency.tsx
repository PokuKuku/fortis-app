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

type Consistency = 'daily' | 'few_times_week' | 'once_or_less' | 'starting';

const OPTIONS: Array<{ value: Consistency; title: string }> = [
  { value: 'daily', title: 'Daily' },
  { value: 'few_times_week', title: 'A few times a week' },
  { value: 'once_or_less', title: 'Once a week or less' },
  { value: 'starting', title: "I'm just getting started" },
];

export default function OnboardingConsistencyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Consistency | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.workout_consistency) return;
      setSelected(state.workout_consistency);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/complete');
  };

  return (
    <OnboardingScreen
      step={11}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How would you describe your workout consistency?"
      subtitle="We use this to keep your plan realistic."
      onBack={() => router.back()}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} disabled={!selected}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Finish</Text>
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
