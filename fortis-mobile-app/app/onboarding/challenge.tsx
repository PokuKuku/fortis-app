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
  const [selected, setSelected] = useState<Challenge | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.biggest_challenge) return;
      setSelected(state.biggest_challenge);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: Challenge) => {
    setSelected(value);
    void updateOnboardingState({ biggest_challenge: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/consistency');
  };

  return (
    <OnboardingScreen
      step={10}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your biggest challenge?"
      subtitle="We'll keep this in mind when shaping insights."
      onBack={() => router.back()}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} disabled={!selected}>
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
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
