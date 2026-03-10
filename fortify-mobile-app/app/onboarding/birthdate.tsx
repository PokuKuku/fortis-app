import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingWheelPicker } from '@/src/components/onboarding/OnboardingWheelPicker';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';

const YEAR_MIN = 1930;
const DEFAULT_YEAR = 1998;
const DEFAULT_MONTH_INDEX = 7;
const DEFAULT_DAY = 8;

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad2 = (value: number) => value.toString().padStart(2, '0');
const formatBirthDate = (year: number, monthIndex: number, day: number) => `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
const daysInMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

export default function OnboardingBirthdateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const count = currentYear - YEAR_MIN + 1;
    return Array.from({ length: count }, (_, idx) => currentYear - idx);
  }, [currentYear]);

  const fallbackYearIndex = Math.max(0, Math.min(currentYear - DEFAULT_YEAR, currentYear - YEAR_MIN));
  const [monthIndex, setMonthIndex] = useState(DEFAULT_MONTH_INDEX);
  const [dayIndex, setDayIndex] = useState(Math.max(0, DEFAULT_DAY - 1));
  const [yearIndex, setYearIndex] = useState(fallbackYearIndex);

  const selectedYear = years[yearIndex] ?? currentYear;
  const maxDays = daysInMonth(selectedYear, monthIndex);
  const dayLabels = useMemo(() => (
    Array.from({ length: maxDays }, (_, idx) => `${idx + 1}`)
  ), [maxDays]);

  useEffect(() => {
    if (dayIndex <= maxDays - 1) return;
    setDayIndex(Math.max(0, maxDays - 1));
  }, [dayIndex, maxDays]);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      if (!state?.birth_date) return;

      const [yearString, monthString, dayString] = state.birth_date.split('-');
      const year = Number(yearString);
      const month = Number(monthString);
      const day = Number(dayString);
      if (!year || !month || !day) return;

      const clampedYearIndex = Math.max(0, years.indexOf(year));
      setYearIndex(clampedYearIndex);

      const clampedMonthIndex = Math.min(11, Math.max(0, month - 1));
      setMonthIndex(clampedMonthIndex);

      const maxForStored = daysInMonth(year, clampedMonthIndex);
      const clampedDayIndex = Math.min(maxForStored - 1, Math.max(0, day - 1));
      setDayIndex(clampedDayIndex);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const year = years[yearIndex] ?? currentYear;
    const day = (dayIndex ?? 0) + 1;
    const birthDate = formatBirthDate(year, monthIndex, day);
    void updateOnboardingState({ birth_date: birthDate });
  }, [currentYear, dayIndex, monthIndex, yearIndex, years]);

  const handleContinue = async () => {
    const year = years[yearIndex] ?? currentYear;
    const day = (dayIndex ?? 0) + 1;
    const selectedDate = new Date(year, monthIndex, day);
    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > selectedDate.getMonth()
      || (today.getMonth() === selectedDate.getMonth() && today.getDate() >= selectedDate.getDate());
    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    if (age < 9) {
      Alert.alert(
        'Age requirement',
        'You must be at least 9 years old to use Fortify.',
        [{ text: 'OK', onPress: () => router.replace('/onboarding/welcome') }]
      );
      return;
    }

    trackOnboardingStepCompleted('birthdate');
    router.push('/onboarding/height');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="When were you born?"
      subtitle={undefined}
      contentGap={Spacing.lg}
      onBack={() => router.back()}
      useScrollView={false}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            items={MONTH_LABELS}
            selectedIndex={monthIndex}
            onChange={setMonthIndex}
          />
        </View>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            items={dayLabels}
            selectedIndex={dayIndex}
            onChange={setDayIndex}
          />
        </View>
        <View style={styles.pickerColumn}>
          <OnboardingWheelPicker
            items={years.map((y) => `${y}`)}
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
    alignSelf: 'center',
    gap: Spacing.md,
    marginTop: 40,
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
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
