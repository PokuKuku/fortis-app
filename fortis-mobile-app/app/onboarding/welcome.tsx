import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleStart = () => {
    router.push('/onboarding');
  };

  return (
    <OnboardingScreen
      step={0}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title={'Workout Data\nmade useful'}
      subtitle={undefined}
      useScrollView={false}
      showProgress={false}
      titleAlign="center"
      subtitleAlign="center"
      titleFontSize={36}
      titleNumberOfLines={2}
      titleAdjustsFontSizeToFit
      titleMinimumFontScale={0.8}
      titleTopOffset={Spacing.lg}
      footer={
        <GlassButton style={styles.button} onPress={handleStart} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>Get started</Text>
        </GlassButton>
      }
    >
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
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
