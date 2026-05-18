import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

export default function OnboardingProgramNameScreen() {
  useOnboardingFunnelScreen('Q18. Program Name');

  const router = useRouter();
  const { colors } = useTheme();
  const [programName, setProgramName] = useState('');
  const isDisabled = programName.trim().length === 0;

  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setProgramName(state?.program_name?.trim() ?? '');
    };
    void loadState();
    return () => {
      isActive = false;
    };
  }, []);

  const handleContinue = async () => {
    const trimmed = programName.trim();
    if (!trimmed) return;
    await updateOnboardingState({ program_name: trimmed });
    trackOnboardingStepCompleted('program_name', {
      program_name: trimmed,
    });
    router.push('/onboarding/metrics-intro');
  };

  return (
    <OnboardingScreen
      step={18}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Now what would you like to name your program?"
      subtitle="This will be the program Fortify creates for you."
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton
          style={styles.button}
          onPress={() => void handleContinue()}
          disabled={isDisabled}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={[styles.inputWrapper, { borderColor: colors.glassBorder, backgroundColor: colors.surfaceElevated }]}>
        <TextInput
          value={programName}
          onChangeText={setProgramName}
          placeholder="My Program"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => void handleContinue()}
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
    height: 58,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 18,
    lineHeight: 24,
    height: 56,
    paddingVertical: 0,
    letterSpacing: 0.5,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
