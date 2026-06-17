import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const isNarrowScreen = windowWidth < 380;
  const isShortScreen = windowHeight < 700;
  const maxScreenWidth = windowWidth < 380 ? 360 : windowWidth < 420 ? 420 : 480;
  const horizontalPadding = isNarrowScreen ? scale(20) : scale(24);
  const contentWidth = Math.min(windowWidth, maxScreenWidth) - (horizontalPadding * 2);
  const dayGap = isNarrowScreen ? scale(Spacing.sm) : scale(Spacing.md);
  const dayButtonWidth = Math.floor((contentWidth - (dayGap * 2)) / 3);
  const dayButtonHeight = isNarrowScreen ? scale(50) : scale(56);
  const gridTopMargin = isShortScreen ? scale(72) : windowHeight < 780 ? scale(96) : scale(128);

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
      <View style={[styles.daysGrid, { gap: dayGap, marginTop: gridTopMargin }]}>
        {WEEKDAY_LABELS.map((label, day) => {
          const selected = selectedDays.includes(day);
          const isLastDay = day === WEEKDAY_LABELS.length - 1;
          return (
            <View
              key={label}
              style={{
                width: dayButtonWidth,
                marginLeft: isLastDay ? dayButtonWidth + dayGap : 0,
                marginRight: isLastDay ? dayButtonWidth + dayGap : 0,
              }}
            >
              <GlassCard
                onPress={() => toggleDay(day)}
                width="100%"
                padding={0}
                shellShadow={false}
                style={[
                  styles.dayCard,
                  {
                    borderColor: selected ? colors.accent : colors.glassBorder,
                    backgroundColor: selected ? colors.accent : colors.surfaceElevated,
                  },
                ]}
              >
                <View style={[styles.dayContent, { height: dayButtonHeight }]}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: selected ? colors.accentForegroundOnFill : colors.textPrimary },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.86}
                  >
                    {label}
                  </Text>
                </View>
              </GlassCard>
            </View>
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
  },
  dayCard: {
    borderRadius: BorderRadius.xl,
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(14),
    letterSpacing: moderateScale(1.2),
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
