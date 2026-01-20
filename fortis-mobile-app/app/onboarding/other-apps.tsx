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

type TriedApps = 'consistent' | 'occasionally' | 'stopped' | 'never';

const OPTIONS: Array<{ value: TriedApps; title: string }> = [
  { value: 'consistent', title: 'Yes, consistently' },
  { value: 'occasionally', title: 'Occasionally' },
  { value: 'stopped', title: "I've tried but stopped" },
  { value: 'never', title: 'Never' },
];

export default function OnboardingOtherAppsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<TriedApps | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.tried_other_apps) return;
      setSelected(state.tried_other_apps);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: TriedApps) => {
    setSelected(value);
    void updateOnboardingState({ tried_other_apps: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      step={8}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Have you tried other workout tracking apps?"
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
