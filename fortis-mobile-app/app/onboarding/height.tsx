import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingSegmentedControl } from '@/src/components/onboarding/OnboardingSegmentedControl';
import { OnboardingWheelPicker } from '@/src/components/onboarding/OnboardingWheelPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

type UnitSystem = 'imperial' | 'metric';

const FEET_VALUES = Array.from({ length: 5 }, (_, index) => index + 3);
const INCH_VALUES = Array.from({ length: 12 }, (_, index) => index);
const CM_VALUES = Array.from({ length: 101 }, (_, index) => index + 120);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function OnboardingHeightScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [feetIndex, setFeetIndex] = useState(2);
  const [inchIndex, setInchIndex] = useState(0);
  const [cmIndex, setCmIndex] = useState(30);

  const feetLabels = useMemo(() => FEET_VALUES.map((value) => `${value} ft`), []);
  const inchLabels = useMemo(() => INCH_VALUES.map((value) => `${value} in`), []);
  const cmLabels = useMemo(() => CM_VALUES.map((value) => `${value} cm`), []);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      if (state?.preferred_units) {
        setUnit(state.preferred_units);
      }

      if (typeof state?.height_cm === 'number') {
        const cmValue = state.height_cm;
        const cmIdx = clamp(CM_VALUES.indexOf(cmValue), 0, CM_VALUES.length - 1);
        setCmIndex(cmIdx >= 0 ? cmIdx : 0);

        const totalInches = Math.round(cmValue / 2.54);
        const feet = clamp(Math.floor(totalInches / 12), FEET_VALUES[0], FEET_VALUES[FEET_VALUES.length - 1]);
        const inches = clamp(totalInches % 12, 0, 11);
        setFeetIndex(Math.max(FEET_VALUES.indexOf(feet), 0));
        setInchIndex(inches);
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
      const totalInches = FEET_VALUES[feetIndex] * 12 + INCH_VALUES[inchIndex];
      const cmValue = Math.round(totalInches * 2.54);
      const cmIdx = clamp(CM_VALUES.indexOf(cmValue), 0, CM_VALUES.length - 1);
      setCmIndex(cmIdx >= 0 ? cmIdx : 0);
    } else {
      const cmValue = CM_VALUES[cmIndex];
      const totalInches = Math.round(cmValue / 2.54);
      const feet = clamp(Math.floor(totalInches / 12), FEET_VALUES[0], FEET_VALUES[FEET_VALUES.length - 1]);
      const inches = clamp(totalInches % 12, 0, 11);
      setFeetIndex(Math.max(FEET_VALUES.indexOf(feet), 0));
      setInchIndex(inches);
    }

    setUnit(castUnit);
    void updateOnboardingState({ preferred_units: castUnit });
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const heightCm = unit === 'metric'
      ? CM_VALUES[cmIndex]
      : Math.round((FEET_VALUES[feetIndex] * 12 + INCH_VALUES[inchIndex]) * 2.54);

    await updateOnboardingState({ height_cm: heightCm, preferred_units: unit });
    router.push('/onboarding/weight');
  };

  return (
    <OnboardingScreen
      step={4}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What is your height?"
      subtitle="This helps calibrate training insights and progress charts."
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
          { label: 'Feet & Inches', value: 'imperial' },
          { label: 'Centimeters', value: 'metric' },
        ]}
        value={unit}
        onChange={handleUnitChange}
      />

      <View style={styles.pickerRow}>
        {unit === 'imperial' ? (
          <>
            <View style={styles.pickerColumn}>
              <OnboardingWheelPicker
                items={feetLabels}
                selectedIndex={feetIndex}
                onChange={setFeetIndex}
              />
            </View>
            <View style={styles.pickerColumn}>
              <OnboardingWheelPicker
                items={inchLabels}
                selectedIndex={inchIndex}
                onChange={setInchIndex}
              />
            </View>
          </>
        ) : (
          <View style={styles.pickerColumnFull}>
            <OnboardingWheelPicker
              items={cmLabels}
              selectedIndex={cmIndex}
              onChange={setCmIndex}
            />
          </View>
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerColumnFull: {
    flex: 1,
  },
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
