import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingDemoVideo } from '@/src/components/onboarding/OnboardingDemoVideo';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';

const DEMO_VIDEO = require('../../assets/videos/FortisDemo3.mp4');

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const videoHeight = Math.min(420, Math.max(320, Math.round(windowHeight * 0.4)));

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
      bodyAlign="center"
      contentGap={Spacing.lg}
      footer={
        <GlassButton style={styles.button} onPress={handleStart} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>Get started</Text>
        </GlassButton>
      }
    >
      <View style={styles.videoWrap}>
        <OnboardingDemoVideo sourceModule={DEMO_VIDEO} height={videoHeight} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  videoWrap: {
    width: '100%',
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
