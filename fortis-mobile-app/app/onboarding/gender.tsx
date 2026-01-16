import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius } from '@/constants/Sizes';

type GenderOption = 'male' | 'female';

const OPTIONS: Array<{ value: GenderOption; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function OnboardingGenderScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const setBodyType = useWorkoutStore((state) => state.setBodyType);
  const [selected, setSelected] = useState<GenderOption | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.gender) return;
      setSelected(state.gender);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: GenderOption) => {
    setSelected(value);
    void updateOnboardingState({ gender: value });
    if (value === 'female') {
      void setBodyType('female');
    }
    if (value === 'male') {
      void setBodyType('male');
    }
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/birthdate');
  };

  return (
    <OnboardingScreen
      step={2}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your gender"
      subtitle="This helps us pick the correct heat map for your profile."
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.label}
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
