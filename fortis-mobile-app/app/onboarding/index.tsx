import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';

export default function OnboardingNameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.full_name) return;
      setName(state.full_name);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await updateOnboardingState({ full_name: trimmed });
    router.push('/onboarding/greeting');
  };

  const isDisabled = name.trim().length === 0;

  return (
    <OnboardingScreen
      step={1}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What should we call you?"
      subtitle={undefined}
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={isDisabled}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={[styles.inputWrapper, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated }]}
      >
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCapitalize="words"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: {
    fontSize: 20,
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 0.5,
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
