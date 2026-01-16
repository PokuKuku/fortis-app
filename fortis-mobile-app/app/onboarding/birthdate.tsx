import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingWheelPicker } from '@/src/components/onboarding/OnboardingWheelPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIN_YEAR = 1930;

export default function OnboardingBirthdateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  const [monthIndex, setMonthIndex] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [yearIndex, setYearIndex] = useState(0);

  const daysInMonth = useMemo(() => {
    const year = Number(years[yearIndex]);
    return new Date(year, monthIndex + 1, 0).getDate();
  }, [monthIndex, yearIndex, years]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => String(index + 1)),
    [daysInMonth]
  );

  useEffect(() => {
    if (dayIndex > daysInMonth - 1) {
      setDayIndex(daysInMonth - 1);
    }
  }, [dayIndex, daysInMonth]);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.birth_date) return;
      const [year, month, day] = state.birth_date.split('-').map(Number);
      if (!year || !month || !day) return;

      const yearIdx = years.findIndex((value) => Number(value) === year);
      setYearIndex(yearIdx >= 0 ? yearIdx : 0);
      setMonthIndex(Math.max(month - 1, 0));
      setDayIndex(Math.max(day - 1, 0));
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, [years]);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const year = years[yearIndex];
    const month = String(monthIndex + 1).padStart(2, '0');
    const day = String(dayIndex + 1).padStart(2, '0');
    await updateOnboardingState({ birth_date: `${year}-${month}-${day}` });

    router.push('/onboarding/height');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="When were you born?"
      subtitle="We use this to personalize age-based insights."
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue}>
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            items={MONTHS}
            selectedIndex={monthIndex}
            onChange={setMonthIndex}
          />
        </View>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            key={`day-${daysInMonth}`}
            items={days}
            selectedIndex={dayIndex}
            onChange={setDayIndex}
          />
        </View>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            items={years}
            selectedIndex={yearIndex}
            onChange={setYearIndex}
          />
        </View>
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
