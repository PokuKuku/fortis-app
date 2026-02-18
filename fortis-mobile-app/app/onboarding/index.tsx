import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';

export default function OnboardingNameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput | null>(null);
  const hasTypedRef = useRef(false);
  const isInputFocusedRef = useRef(false);
  const pendingHydrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;
    const task = InteractionManager.runAfterInteractions(() => {
      pendingHydrationTimeoutRef.current = setTimeout(() => {
        const loadState = async () => {
          if (!isActive || hasTypedRef.current || isInputFocusedRef.current) return;
          const state = await getOnboardingState();
          if (!isActive || !state?.full_name || hasTypedRef.current || isInputFocusedRef.current) return;
          setName((current) => (current.trim().length > 0 ? current : state.full_name ?? ''));
        };

        void loadState();
      }, 900);
    });

    return () => {
      isActive = false;
      if (pendingHydrationTimeoutRef.current) {
        clearTimeout(pendingHydrationTimeoutRef.current);
        pendingHydrationTimeoutRef.current = null;
      }
      task.cancel();
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const task = InteractionManager.runAfterInteractions(() => {
      pendingFocusTimeoutRef.current = setTimeout(() => {
        if (!isActive || hasTypedRef.current || isInputFocusedRef.current) return;
        inputRef.current?.focus();
      }, 180);
    });

    return () => {
      isActive = false;
      if (pendingFocusTimeoutRef.current) {
        clearTimeout(pendingFocusTimeoutRef.current);
        pendingFocusTimeoutRef.current = null;
      }
      task.cancel();
    };
  }, []);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await updateOnboardingState({ full_name: trimmed });
    trackOnboardingStepCompleted('profile_name');
    router.push('/onboarding/greeting');
  };

  const isDisabled = name.trim().length === 0;

  return (
    <OnboardingScreen
      step={1}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What should we call you?"
      subtitle={undefined}
      useScrollView={false}
      onBack={() => {
        router.replace({ pathname: '/onboarding/welcome', params: { returning: '1' } });
      }}
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
          ref={inputRef}
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
