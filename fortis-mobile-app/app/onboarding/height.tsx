import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
const LB_MIN = 80;
const LB_MAX = 400;
const KG_MIN = 40;
const KG_MAX = 180;
const LB_VALUES = Array.from({ length: LB_MAX - LB_MIN + 1 }, (_, index) => index + LB_MIN);
const KG_VALUES = Array.from({ length: KG_MAX - KG_MIN + 1 }, (_, index) => index + KG_MIN);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const roundTo = (value: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};
const lbIndexFromKg = (valueKg: number) => clamp(Math.round(valueKg * 2.20462) - LB_MIN, 0, LB_VALUES.length - 1);
const kgIndexFromKg = (valueKg: number) => clamp(Math.round(valueKg) - KG_MIN, 0, KG_VALUES.length - 1);

export default function OnboardingHeightScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [feetIndex, setFeetIndex] = useState(2);
  const [inchIndex, setInchIndex] = useState(0);
  const [cmIndex, setCmIndex] = useState(30);
  const [weightKg, setWeightKg] = useState(70);
  const [lbIndex, setLbIndex] = useState(() => lbIndexFromKg(70));
  const [kgIndex, setKgIndex] = useState(() => kgIndexFromKg(70));

  const feetLabels = useMemo(() => FEET_VALUES.map((value) => `${value} ft`), []);
  const inchLabels = useMemo(() => INCH_VALUES.map((value) => `${value} in`), []);
  const cmLabels = useMemo(() => CM_VALUES.map((value) => `${value} cm`), []);
  const lbLabels = useMemo(() => LB_VALUES.map((value) => `${value} lb`), []);
  const kgLabels = useMemo(() => KG_VALUES.map((value) => `${value} kg`), []);

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

      if (typeof state?.weight_kg === 'number') {
        const normalizedKg = clamp(state.weight_kg, KG_MIN, KG_MAX);
        setWeightKg(normalizedKg);
        setKgIndex(kgIndexFromKg(normalizedKg));
        setLbIndex(lbIndexFromKg(normalizedKg));
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
      setKgIndex(kgIndexFromKg(weightKg));
    } else {
      const cmValue = CM_VALUES[cmIndex];
      const totalInches = Math.round(cmValue / 2.54);
      const feet = clamp(Math.floor(totalInches / 12), FEET_VALUES[0], FEET_VALUES[FEET_VALUES.length - 1]);
      const inches = clamp(totalInches % 12, 0, 11);
      setFeetIndex(Math.max(FEET_VALUES.indexOf(feet), 0));
      setInchIndex(inches);
      setLbIndex(lbIndexFromKg(weightKg));
    }

    setUnit(castUnit);
    void updateOnboardingState({ preferred_units: castUnit });
  };

  const handleContinue = async () => {
    const heightCm = unit === 'metric'
      ? CM_VALUES[cmIndex]
      : Math.round((FEET_VALUES[feetIndex] * 12 + INCH_VALUES[inchIndex]) * 2.54);
    const normalizedKg = clamp(roundTo(weightKg, 1), KG_MIN, KG_MAX);

    await updateOnboardingState({ height_cm: heightCm, weight_kg: normalizedKg, preferred_units: unit });
    router.push('/onboarding/source');
  };

  const handleWeightChange = (nextIndex: number) => {
    if (unit === 'metric') {
      const nextKg = KG_VALUES[nextIndex];
      setKgIndex(nextIndex);
      setWeightKg(clamp(nextKg, KG_MIN, KG_MAX));
      return;
    }

    const nextLb = LB_VALUES[nextIndex];
    setLbIndex(nextIndex);
    const nextKg = roundTo(nextLb / 2.20462, 1);
    setWeightKg(clamp(nextKg, KG_MIN, KG_MAX));
  };

  return (
    <OnboardingScreen
      step={4}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Height & weight"
      subtitle="This will be used to calibrate your custom plan."
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.centerStack}>
        <OnboardingSegmentedControl
          options={[
            { label: 'Imperial', value: 'imperial' },
            { label: 'Metric', value: 'metric' },
          ]}
          value={unit}
          onChange={handleUnitChange}
        />

        <View style={styles.metricGrid}>
          <View style={styles.metricColumn}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Height</Text>
            {unit === 'imperial' ? (
              <View style={styles.pickerRow}>
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
              </View>
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

          <View style={styles.metricColumn}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Weight</Text>
            <OnboardingWheelPicker
              items={unit === 'metric' ? kgLabels : lbLabels}
              selectedIndex={unit === 'metric' ? kgIndex : lbIndex}
              onChange={handleWeightChange}
            />
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  centerStack: {
    gap: Spacing.lg,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'flex-start',
  },
  metricColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  metricLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
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
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
