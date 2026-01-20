import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';

type AgeGroup = 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus';

const AGE_GROUPS: Array<{ value: AgeGroup; label: string; targetAge: number }> = [
  { value: 'under_18', label: 'Under 18', targetAge: 16 },
  { value: '18_24', label: '18 - 24', targetAge: 21 },
  { value: '25_34', label: '25 - 34', targetAge: 29 },
  { value: '35_44', label: '35 - 44', targetAge: 39 },
  { value: '45_54', label: '45 - 54', targetAge: 49 },
  { value: '55_plus', label: '55+', targetAge: 60 },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toBirthDateFromTargetAge = (targetAge: number) => {
  const now = new Date();
  const year = clamp(now.getFullYear() - targetAge, 1930, now.getFullYear());
  return `${year}-07-01`;
};

const getAgeGroupFromBirthDate = (birthDate: string | undefined): AgeGroup | null => {
  if (!birthDate) return null;
  const [yearString] = birthDate.split('-');
  const year = Number(yearString);
  if (!year) return null;

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age < 18) return 'under_18';
  if (age <= 24) return '18_24';
  if (age <= 34) return '25_34';
  if (age <= 44) return '35_44';
  if (age <= 54) return '45_54';
  return '55_plus';
};

export default function OnboardingBirthdateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<AgeGroup | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      const stored = (state?.age_group ?? null) as AgeGroup | null;
      if (stored) {
        setSelected(stored);
        return;
      }

      const inferred = getAgeGroupFromBirthDate(state?.birth_date);
      if (inferred) setSelected(inferred);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: AgeGroup) => {
    setSelected(value);
    const group = AGE_GROUPS.find((g) => g.value === value);
    const birthDate = group ? toBirthDateFromTargetAge(group.targetAge) : undefined;
    void updateOnboardingState({ age_group: value, birth_date: birthDate });
  };

  const handleContinue = async () => {
    if (!selected) return;
    router.push('/onboarding/height');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your age group"
      subtitle="We use this to personalize your insights."
      contentGap={Spacing.lg}
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          hapticFeedback="impactMedium"
          disabled={!selected}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {AGE_GROUPS.map((option) => (
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
    marginTop: Spacing.sm,
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
