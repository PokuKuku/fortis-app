import { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius } from '@/constants/Sizes';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import type { TrainingEnvironment } from '@/src/utils/onboardingProgram';

const OPTIONS: Array<{ value: TrainingEnvironment; title: string; description: string }> = [
  {
    value: 'gym',
    title: 'Gym',
    description: 'Full gym access: barbells, machines, cables, dumbbells.',
  },
  {
    value: 'home',
    title: 'Home',
    description: 'Minimal setup: bodyweight, dumbbells, bands, and space to train.',
  },
  {
    value: 'hybrid',
    title: 'Hybrid',
    description: 'A mix of gym days and home sessions.',
  },
];

export default function OnboardingTrainingEnvironmentScreen() {
  useOnboardingFunnelScreen('Q11. Training Environment');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<TrainingEnvironment | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setSelected(state?.training_environment ?? null);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: TrainingEnvironment) => {
    setSelected(value);
    void updateOnboardingState({ training_environment: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted('training_environment', {
      training_environment: selected,
    });
    router.push('/onboarding/muscle-focus');
  };

  return (
    <OnboardingScreen
      step={10}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Where will you train most often?"
      subtitle="This helps Fortify know what exercises you can actually do."
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!selected}
          hapticFeedback="impactMedium"
        >
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
    width: '100%',
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
