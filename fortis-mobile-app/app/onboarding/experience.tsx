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

type ExperienceLevel = 'none' | 'beginner' | 'intermediate' | 'advanced';

const OPTIONS: Array<{ value: ExperienceLevel; title: string; description: string }> = [
  {
    value: 'none',
    title: 'None',
    description: 'Currently not lifting',
  },
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'Lifting for less than a year',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: 'Lifting for 1-4 years',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Lifting for 5+ years',
  },
];

export default function OnboardingExperienceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<ExperienceLevel | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.lifting_experience) return;
      setSelected(state.lifting_experience);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: ExperienceLevel) => {
    setSelected(value);
    void updateOnboardingState({ lifting_experience: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push('/onboarding/consistency');
  };

  return (
    <OnboardingScreen
      step={6}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your experience level with lifting?"
      subtitle="This helps us shape your training insights."
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
