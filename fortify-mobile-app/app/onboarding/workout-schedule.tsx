import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import {
  deriveScheduleDaysFromWorkoutsPerWeek,
  normalizeWorkoutScheduleDays,
  WEEKDAY_LABELS,
} from '@/src/utils/workoutSchedule';

export default function OnboardingWorkoutScheduleScreen() {
  useOnboardingFunnelScreen('Q10. Workout Schedule');

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      const savedDays = normalizeWorkoutScheduleDays(state?.workout_schedule_days);
      setSelectedDays(
        savedDays.length > 0
          ? savedDays
          : deriveScheduleDaysFromWorkoutsPerWeek(state?.workouts_per_week)
      );
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setSelectedDays((current) => (
      current.includes(day)
        ? current.filter((item) => item !== day)
        : normalizeWorkoutScheduleDays([...current, day])
    ));
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) return;
    await updateOnboardingState({ workout_schedule_days: selectedDays });
    trackOnboardingStepCompleted('workout_schedule');
    router.push('/onboarding/other-apps');
  };

  return (
    <OnboardingScreen
      step={9}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What days do you plan to work out?"
      subtitle="We’ll use this to show your weekly training progress."
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={selectedDays.length === 0}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.daysGrid}>
        {WEEKDAY_LABELS.map((label, day) => {
          const selected = selectedDays.includes(day);
          return (
            <Pressable
              key={label}
              onPress={() => toggleDay(day)}
              style={({ pressed }) => [
                styles.dayButton,
                {
                  backgroundColor: selected
                    ? colors.accent
                    : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: selected
                    ? colors.accent
                    : isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.dayText, { color: selected ? colors.white : colors.textPrimary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  dayButton: {
    width: 92,
    height: 52,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    letterSpacing: 1.2,
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
  pressed: {
    opacity: 0.72,
  },
});
