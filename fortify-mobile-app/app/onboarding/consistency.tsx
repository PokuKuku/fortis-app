import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
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

type Consistency = 'none' | 'daily' | 'few_times_week' | 'once_or_less' | 'starting';

const MIN_DAYS = 1;
const MAX_DAYS = 7;
const THUMB_SIZE = 22;
const THUMB_RADIUS = THUMB_SIZE / 2;
const SLIDER_SIDE_INSET = THUMB_RADIUS + 4;

const consistencyFromDays = (days: number): Consistency => {
  if (days >= 7) return 'daily';
  if (days >= 4) return 'few_times_week';
  return 'once_or_less';
};

const daysFromConsistency = (consistency?: Consistency | null) => {
  if (consistency === 'daily') return 7;
  if (consistency === 'few_times_week') return 4;
  return 3;
};

const clampDays = (value: number) => Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(value)));

export default function OnboardingConsistencyScreen() {
  useOnboardingFunnelScreen('Q9. How consistent are you');

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [trackWidth, setTrackWidth] = useState(0);
  const lastHapticValueRef = useRef(daysPerWeek);

  const percent = (daysPerWeek - MIN_DAYS) / (MAX_DAYS - MIN_DAYS);
  const displayLabel = `${daysPerWeek} ${daysPerWeek === 1 ? 'day' : 'days'}`;
  const dotValues = [2, 3, 4, 5, 6];

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedDays = typeof state?.workouts_per_week === 'number'
        ? clampDays(state.workouts_per_week)
        : daysFromConsistency(state?.workout_consistency);
      setDaysPerWeek(storedDays);
      lastHapticValueRef.current = storedDays;
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const updateDays = useCallback((nextValue: number) => {
    const nextDays = clampDays(nextValue);
    setDaysPerWeek(nextDays);
    if (nextDays !== lastHapticValueRef.current) {
      lastHapticValueRef.current = nextDays;
      Haptics.selectionAsync().catch(() => undefined);
    }
  }, []);

  const updateDaysFromX = useCallback((locationX: number) => {
    if (trackWidth <= 0) return;
    const trackX = locationX - SLIDER_SIDE_INSET;
    const ratio = Math.min(1, Math.max(0, trackX / trackWidth));
    updateDays(MIN_DAYS + ratio * (MAX_DAYS - MIN_DAYS));
  }, [trackWidth, updateDays]);

  const persistSelection = useCallback(async () => {
    const current = await getOnboardingState();
    const countChanged = current?.workouts_per_week !== daysPerWeek;
    await updateOnboardingState({
      workouts_per_week: daysPerWeek,
      workout_consistency: consistencyFromDays(daysPerWeek),
      ...(countChanged ? { workout_schedule_days: undefined } : {}),
    });
  }, [daysPerWeek]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => updateDaysFromX(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateDaysFromX(event.nativeEvent.locationX),
      onPanResponderRelease: () => {
        void persistSelection();
      },
      onPanResponderTerminate: () => {
        void persistSelection();
      },
    }),
    [persistSelection, updateDaysFromX]
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handleContinue = async () => {
    await persistSelection();
    trackOnboardingStepCompleted('workout_consistency', {
      workouts_per_week: daysPerWeek,
      workout_consistency: consistencyFromDays(daysPerWeek),
    });
    router.push('/onboarding/workout-schedule');
  };

  return (
    <OnboardingScreen
      step={13}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How many days a week do you typically work out?"
      subtitle={undefined}
      onBack={() => router.back()}
      footer={
        <GlassButton
          style={styles.button}
          onPress={() => void handleContinue()}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.sliderSection}>
        <Text style={[styles.dayValue, { color: colors.textPrimary }]}>{displayLabel}</Text>
        <View style={styles.sliderBlock}>
          <View
            style={styles.trackHitArea}
            {...panResponder.panHandlers}
          >
            <View
              onLayout={handleTrackLayout}
              style={[
                styles.track,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
              ]}
            >
              <View
                style={[
                  styles.trackFill,
                  {
                    width: `${percent * 100}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
              {dotValues.map((value) => {
                const dotPercent = ((value - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
                const active = value <= daysPerWeek;
                return (
                  <View
                    key={value}
                    pointerEvents="none"
                    style={[
                      styles.trackDot,
                      {
                        left: `${dotPercent}%`,
                        backgroundColor: active
                          ? colors.accent
                          : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)',
                      },
                    ]}
                  />
                );
              })}
              <View
                pointerEvents="none"
                style={[
                  styles.thumb,
                  {
                    left: `${percent * 100}%`,
                    backgroundColor: colors.white,
                    borderColor: colors.accent,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.rangeLabels}>
            <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>1</Text>
            <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>7</Text>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  sliderSection: {
    minHeight: 260,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  dayValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  sliderBlock: {
    gap: Spacing.xs,
  },
  trackHitArea: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: SLIDER_SIDE_INSET,
    overflow: 'visible',
  },
  track: {
    height: 12,
    borderRadius: BorderRadius.full,
    overflow: 'visible',
  },
  trackFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  trackDot: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    marginLeft: -2,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginLeft: -THUMB_RADIUS,
    borderRadius: THUMB_RADIUS,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SLIDER_SIDE_INSET,
  },
  rangeLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 0.8,
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
