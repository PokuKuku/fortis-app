import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingSegmentedControl } from '@/src/components/onboarding/OnboardingSegmentedControl';
import { OnboardingRulerPicker } from '@/src/components/onboarding/OnboardingRulerPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type UnitSystem = 'imperial' | 'metric';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const roundTo = (value: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const LB_MIN = 80;
const LB_MAX = 400;
const KG_MIN = 40;
const KG_MAX = 180;
const DIAL_STEP = 0.1;

export default function OnboardingWeightScreen() {
  useOnboardingFunnelScreen("Q5. What's your weight?");

  const router = useRouter();
  const { colors } = useTheme();
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [weightKg, setWeightKg] = useState(70);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      if (state?.preferred_units) {
        setUnit(state.preferred_units);
      }

      if (typeof state?.weight_kg === 'number') {
        setWeightKg(clamp(state.weight_kg, KG_MIN, KG_MAX));
      }
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleUnitChange = (nextUnit: string) => {
    const castUnit = nextUnit as UnitSystem;
    if (castUnit === unit) return;

    setUnit(castUnit);
    void updateOnboardingState({ preferred_units: castUnit });
  };

  const handleContinue = async () => {
    const normalizedKg = clamp(roundTo(weightKg, 1), KG_MIN, KG_MAX);

    await updateOnboardingState({ weight_kg: normalizedKg, preferred_units: unit });
    trackOnboardingStepCompleted('body_metrics', {
      weight_kg: normalizedKg,
      preferred_units: unit,
    });
    router.push('/onboarding/source');
  };

  const weightKgStateForDisplay = clamp(roundTo(weightKg, 1), KG_MIN, KG_MAX);
  const weightLbsForDisplay = clamp(roundTo(weightKgStateForDisplay * 2.20462, 1), LB_MIN, LB_MAX);
  const displayText = unit === 'metric'
    ? `${roundTo(weightKgStateForDisplay, 1).toFixed(1)} kg`
    : `${roundTo(weightLbsForDisplay, 1).toFixed(1)} lbs`;

  const handleRulerChange = (nextValue: number) => {
    if (unit === 'metric') {
      setWeightKg(clamp(roundTo(nextValue, 1), KG_MIN, KG_MAX));
      return;
    }

    const nextKg = roundTo(nextValue / 2.20462, 1);
    setWeightKg(clamp(nextKg, KG_MIN, KG_MAX));
  };

  return (
    <OnboardingScreen
      step={21}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your weight?"
      subtitle="You can update this any time from your profile."
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
        </GlassButton>
      }
    >
      <OnboardingSegmentedControl
        options={[
          { label: 'Pounds', value: 'imperial' },
          { label: 'Kilograms', value: 'metric' },
        ]}
        value={unit}
        onChange={handleUnitChange}
      />

      <View style={styles.dialBlock}>
        <Text style={[styles.valueText, { color: colors.textPrimary }]}>{displayText}</Text>
        <OnboardingRulerPicker
          min={unit === 'metric' ? KG_MIN : LB_MIN}
          max={unit === 'metric' ? KG_MAX : LB_MAX}
          step={DIAL_STEP}
          value={unit === 'metric' ? weightKgStateForDisplay : weightLbsForDisplay}
          onValueChange={handleRulerChange}
          onValueCommit={handleRulerChange}
          unitLabel={unit === 'metric' ? ' kg' : ' lbs'}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  dialBlock: {
    gap: 12,
  },
  valueText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 38,
    letterSpacing: 0.5,
    textAlign: 'center',
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
