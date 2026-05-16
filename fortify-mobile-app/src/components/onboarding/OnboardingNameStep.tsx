import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

interface OnboardingNameStepProps {
  prewarm?: boolean;
}

export function OnboardingNameStep({ prewarm = false }: OnboardingNameStepProps) {
  useOnboardingFunnelScreen('Profile Name', !prewarm);

  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const hasTypedRef = useRef(false);
  const isInputFocusedRef = useRef(false);

  useEffect(() => {
    if (prewarm) {
      return;
    }

    let isActive = true;
    const loadState = async () => {
      if (!isActive || hasTypedRef.current || isInputFocusedRef.current) return;
      const state = await getOnboardingState();
      if (!isActive || !state?.full_name || hasTypedRef.current || isInputFocusedRef.current) return;
      setName((current) => (current.trim().length > 0 ? current : state.full_name ?? ''));
    };
    void loadState();

    return () => {
      isActive = false;
    };
  }, [prewarm]);

  const handleContinue = async () => {
    if (prewarm) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    await updateOnboardingState({ full_name: trimmed });
    trackOnboardingStepCompleted('profile_name');
    router.push('/onboarding/greeting');
  };

  const isDisabled = prewarm || name.trim().length === 0;

  return (
    <OnboardingScreen
      step={1}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What should we call you?"
      subtitle={undefined}
      useScrollView={false}
      onBack={
        prewarm
          ? undefined
          : () => {
              if (navigation.canGoBack()) {
                router.back();
                return;
              }
              router.replace({ pathname: '/onboarding/welcome', params: { returning: '1' } });
            }
      }
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
          onChangeText={(value) => {
            hasTypedRef.current = true;
            setName(value);
          }}
          placeholder="Enter your name"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={handleContinue}
          editable={!prewarm}
          onFocus={() => {
            isInputFocusedRef.current = true;
          }}
          onBlur={() => {
            isInputFocusedRef.current = false;
          }}
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
    paddingVertical: 0,
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
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
