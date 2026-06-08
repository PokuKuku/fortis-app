import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getRealtimeCoachPreferences, setRealtimeCoachPreferences } from '@/src/services/realtimeCoachPreferencesService';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { applyOnboardingGenderCoachVoice } from '@/src/utils/onboardingCoachVoice';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius } from '@/constants/Sizes';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type GenderOption = 'male' | 'female' | 'other';

const OPTIONS: Array<{ value: GenderOption; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function GenderSymbol({ value, color }: { value: GenderOption; color: string }) {
  const strokeWidth = 4;

  if (value === 'male') {
    return (
      <Svg width={34} height={34} viewBox="0 0 34 34">
        <Circle cx={12} cy={22} r={7} stroke={color} strokeWidth={strokeWidth} fill="none" />
        <Line x1={17} y1={17} x2={29} y2={5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <Path d="M21 5h8v8" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (value === 'female') {
    return (
      <Svg width={34} height={34} viewBox="0 0 34 34">
        <Circle cx={17} cy={12} r={7} stroke={color} strokeWidth={strokeWidth} fill="none" />
        <Line x1={17} y1={19} x2={17} y2={31} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        <Line x1={11} y1={25} x2={23} y2={25} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={34} height={34} viewBox="0 0 34 34">
      <Circle cx={17} cy={17} r={6} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Line x1={17} y1={23} x2={17} y2={31} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={12} y1={28} x2={22} y2={28} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={21} y1={13} x2={30} y2={4} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M24 4h6v6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={13} y1={13} x2={5} y2={5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={5} y1={5} x2={5} y2={12} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={5} y1={5} x2={12} y2={5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export default function OnboardingGenderScreen() {
  useOnboardingFunnelScreen("Q2. What's your gender?");

  const router = useRouter();
  const { colors } = useTheme();
  const setBodyType = useWorkoutStore((state) => state.setBodyType);
  const [selected, setSelected] = useState<GenderOption | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.gender) return;
      if (state.gender === 'male' || state.gender === 'female' || state.gender === 'other') {
        setSelected(state.gender);
        if (state.gender === 'female') {
          void setBodyType('female');
        } else {
          void setBodyType('male');
        }
      }
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const applyCoachVoiceForGender = async (value: GenderOption) => {
    const currentPreferences = await getRealtimeCoachPreferences();
    await setRealtimeCoachPreferences(applyOnboardingGenderCoachVoice(currentPreferences, value));
  };

  const handleSelect = (value: GenderOption) => {
    setSelected(value);
    void updateOnboardingState({ gender: value });
    void applyCoachVoiceForGender(value);
    if (value === 'female') {
      void setBodyType('female');
    } else {
      void setBodyType('male');
    }
  };

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted('gender', {
      gender: selected,
      heatmap_gender: selected === 'female' ? 'female' : 'male',
    });
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      step={2}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your gender"
      subtitle=""
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!selected}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.label}
            leadingAccessory={
              <View style={styles.genderSymbol}>
                <GenderSymbol value={option.value} color={colors.textPrimary} />
              </View>
            }
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
    marginTop: 20,
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
  genderSymbol: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
