import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { scale } from '@/src/utils/responsive';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import {
  normalizeWorkoutScheduleDays,
  WEEKDAY_LABELS,
} from '@/src/utils/workoutSchedule';

export default function OnboardingWorkoutScheduleScreen() {
  useOnboardingFunnelScreen('Q10. Workout Schedule');

  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const maxScreenWidth = windowWidth < 380 ? 360 : windowWidth < 420 ? 420 : 480;
  const horizontalPadding = windowWidth < 380 ? scale(20) : scale(24);
  const contentWidth = Math.min(windowWidth, maxScreenWidth) - (horizontalPadding * 2);
  const dayGap = scale(Spacing.md);
  const dayButtonWidth = Math.floor((contentWidth - (dayGap * 2)) / 3);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;

      const savedDays = normalizeWorkoutScheduleDays(state?.workout_schedule_days);
      setSelectedDays(savedDays);
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
    trackOnboardingStepCompleted('workout_schedule', {
      workout_schedule_days: selectedDays.join(', '),
      workout_schedule_days_count: selectedDays.length,
    });
    router.push('/onboarding/session-duration');
  };

  return (
    <OnboardingScreen
      step={14}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What days do you plan to work out?"
      subtitle={undefined}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={selectedDays.length === 0}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={[styles.daysGrid, { gap: dayGap }]}>
        {WEEKDAY_LABELS.map((label, day) => {
          const selected = selectedDays.includes(day);
          const isLastDay = day === WEEKDAY_LABELS.length - 1;
          return (
            <Pressable
              key={label}
              onPress={() => toggleDay(day)}
              style={({ pressed }) => [
                styles.dayButton,
                {
                  width: dayButtonWidth,
                  marginLeft: isLastDay ? dayButtonWidth + dayGap : 0,
                  marginRight: isLastDay ? dayButtonWidth + dayGap : 0,
                },
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
              <Text style={[styles.dayText, { color: selected ? colors.accentForegroundOnFill : colors.textPrimary }]}>
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
    justifyContent: 'center',
    marginTop: 128,
  },
  dayButton: {
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
