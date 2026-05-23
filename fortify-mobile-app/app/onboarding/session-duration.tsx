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

const MIN_MINUTES = 20;
const MAX_MINUTES = 120;
const STEP_MINUTES = 5;
const THUMB_SIZE = 22;
const THUMB_RADIUS = THUMB_SIZE / 2;
const SLIDER_SIDE_INSET = THUMB_RADIUS + 4;

const clampMinutes = (value: number) => {
  const stepped = Math.round(value / STEP_MINUTES) * STEP_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, stepped));
};

export default function OnboardingSessionDurationScreen() {
  useOnboardingFunnelScreen('Q16. Session Duration');

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [minutes, setMinutes] = useState(45);
  const [trackWidth, setTrackWidth] = useState(0);
  const lastHapticValueRef = useRef(minutes);

  const percent = (minutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES);
  const dotValues = [30, 45, 60, 75];

  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const stored = typeof state?.session_duration_minutes === 'number'
        ? clampMinutes(state.session_duration_minutes)
        : 45;
      setMinutes(stored);
      lastHapticValueRef.current = stored;
    };
    void loadState();
    return () => {
      isActive = false;
    };
  }, []);

  const updateMinutes = useCallback((nextValue: number) => {
    const nextMinutes = clampMinutes(nextValue);
    setMinutes(nextMinutes);
    if (nextMinutes !== lastHapticValueRef.current) {
      lastHapticValueRef.current = nextMinutes;
      Haptics.selectionAsync().catch(() => undefined);
    }
  }, []);

  const updateMinutesFromX = useCallback((locationX: number) => {
    if (trackWidth <= 0) return;
    const trackX = locationX - SLIDER_SIDE_INSET;
    const ratio = Math.min(1, Math.max(0, trackX / trackWidth));
    updateMinutes(MIN_MINUTES + ratio * (MAX_MINUTES - MIN_MINUTES));
  }, [trackWidth, updateMinutes]);

  const persistSelection = useCallback(async () => {
    await updateOnboardingState({ session_duration_minutes: minutes });
  }, [minutes]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => updateMinutesFromX(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateMinutesFromX(event.nativeEvent.locationX),
      onPanResponderRelease: () => {
        void persistSelection();
      },
      onPanResponderTerminate: () => {
        void persistSelection();
      },
    }),
    [persistSelection, updateMinutesFromX]
  );

  const handleContinue = async () => {
    await persistSelection();
    trackOnboardingStepCompleted('session_duration', {
      session_duration_minutes: minutes,
    });
    router.push('/onboarding/goal-pace');
  };

  return (
    <OnboardingScreen
      step={15}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="How much time are you able to spend per session?"
      subtitle={undefined}
      onBack={() => router.back()}
      footer={
        <GlassButton style={styles.button} onPress={() => void handleContinue()} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.sliderSection}>
        <Text style={[styles.valueText, { color: colors.textPrimary }]}>{minutes} min</Text>
        <View style={styles.sliderBlock}>
          <View style={styles.trackHitArea} {...panResponder.panHandlers}>
            <View
              onLayout={(event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width)}
              style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}
            >
              <View style={[styles.trackFill, { width: `${percent * 100}%`, backgroundColor: colors.accent }]} />
              {dotValues.map((value) => {
                const dotPercent = ((value - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * 100;
                return (
                  <View
                    key={value}
                    pointerEvents="none"
                    style={[
                      styles.trackDot,
                      {
                        left: `${dotPercent}%`,
                        backgroundColor: value <= minutes ? colors.accent : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)',
                      },
                    ]}
                  />
                );
              })}
              <View
                pointerEvents="none"
                style={[styles.thumb, { left: `${percent * 100}%`, backgroundColor: colors.white, borderColor: colors.accent }]}
              />
            </View>
          </View>
          <View style={styles.rangeLabels}>
            <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>20</Text>
            <Text style={[styles.rangeLabel, { color: colors.textTertiary }]}>120</Text>
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
  valueText: {
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
