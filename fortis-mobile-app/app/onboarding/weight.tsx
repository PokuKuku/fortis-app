import { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingSegmentedControl } from '@/src/components/onboarding/OnboardingSegmentedControl';
import { OnboardingWheelPicker } from '@/src/components/onboarding/OnboardingWheelPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

type UnitSystem = 'imperial' | 'metric';

const LB_VALUES = Array.from({ length: 321 }, (_, index) => index + 80);
const KG_VALUES = Array.from({ length: 141 }, (_, index) => index + 40);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function OnboardingWeightScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [lbIndex, setLbIndex] = useState(100);
  const [kgIndex, setKgIndex] = useState(60);

  const lbLabels = useMemo(() => LB_VALUES.map((value) => `${value} lbs`), []);
  const kgLabels = useMemo(() => KG_VALUES.map((value) => `${value} kg`), []);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      if (state?.preferred_units) {
        setUnit(state.preferred_units);
      }

      if (typeof state?.weight_kg === 'number') {
        const kgValue = Math.round(state.weight_kg);
        const kgIdx = clamp(KG_VALUES.indexOf(kgValue), 0, KG_VALUES.length - 1);
        setKgIndex(kgIdx >= 0 ? kgIdx : 0);

        const lbsValue = Math.round(state.weight_kg * 2.20462);
        const lbIdx = clamp(LB_VALUES.indexOf(lbsValue), 0, LB_VALUES.length - 1);
        setLbIndex(lbIdx >= 0 ? lbIdx : 0);
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

    if (castUnit === 'metric') {
      const lbsValue = LB_VALUES[lbIndex];
      const kgValue = Math.round(lbsValue / 2.20462);
      const kgIdx = clamp(KG_VALUES.indexOf(kgValue), 0, KG_VALUES.length - 1);
      setKgIndex(kgIdx >= 0 ? kgIdx : 0);
    } else {
      const kgValue = KG_VALUES[kgIndex];
      const lbsValue = Math.round(kgValue * 2.20462);
      const lbIdx = clamp(LB_VALUES.indexOf(lbsValue), 0, LB_VALUES.length - 1);
      setLbIndex(lbIdx >= 0 ? lbIdx : 0);
    }

    setUnit(castUnit);
    void updateOnboardingState({ preferred_units: castUnit });
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const weightKg = unit === 'metric'
      ? KG_VALUES[kgIndex]
      : Math.round((LB_VALUES[lbIndex] / 2.20462) * 10) / 10;

    await updateOnboardingState({ weight_kg: weightKg, preferred_units: unit });
    router.push('/onboarding/experience');
  };

  return (
    <OnboardingScreen
      step={5}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your weight?"
      subtitle="You can update this any time from your profile."
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
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

      <OnboardingWheelPicker
        items={unit === 'imperial' ? lbLabels : kgLabels}
        selectedIndex={unit === 'imperial' ? lbIndex : kgIndex}
        onChange={unit === 'imperial' ? setLbIndex : setKgIndex}
      />
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
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
