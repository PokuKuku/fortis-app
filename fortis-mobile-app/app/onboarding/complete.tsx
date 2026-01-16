import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { Spacing } from '@/constants/Sizes';
import { clearOnboardingState, getOnboardingState } from '@/src/utils/onboardingState';

const LOADING_DELAY_MS = 1400;

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateProfile, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const pulse = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    let isActive = true;

    const finalize = async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
      if (!isActive) return;

      if (isAuthenticated) {
        const state = await getOnboardingState();
        const updates: Parameters<typeof updateProfile>[0] = {
          onboarding_completed: true,
        };

        if (state?.full_name?.trim()) {
          updates.full_name = state.full_name.trim();
        }
        if (state?.gender) {
          updates.gender = state.gender;
        }
        if (state?.birth_date) {
          updates.birth_date = state.birth_date;
        }
        if (typeof state?.height_cm === 'number') {
          updates.height_cm = state.height_cm;
        }
        if (typeof state?.weight_kg === 'number') {
          updates.weight_kg = state.weight_kg;
        }
        if (state?.preferred_units) {
          updates.preferred_units = state.preferred_units;
        }
        if (state?.lifting_experience) {
          updates.lifting_experience = state.lifting_experience;
        }
        if (typeof state?.workouts_per_week === 'number') {
          updates.workouts_per_week = state.workouts_per_week;
        }
        if (state?.tried_other_apps) {
          updates.tried_other_apps = state.tried_other_apps;
        }
        if (state?.fitness_goal) {
          updates.fitness_goal = state.fitness_goal;
        }
        if (state?.biggest_challenge) {
          updates.biggest_challenge = state.biggest_challenge;
        }
        if (state?.workout_consistency) {
          updates.workout_consistency = state.workout_consistency;
        }

        const { error } = await updateProfile(updates);
        if (!error) {
          await clearOnboardingState();
          router.replace('/(tabs)');
        }
        return;
      }

      router.replace({ pathname: '/auth', params: { onboarding: 'complete' } });
    };

    void finalize();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isProcessing, router, updateProfile]);

  return (
    <OnboardingScreen
      step={TOTAL_ONBOARDING_STEPS}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Analyzing your responses"
      subtitle="Feeding responses to Fortis analytics to tailor actionable insights."
      useScrollView={false}
    >
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.loaderRing,
            {
              borderColor: colors.accentOverlayMedium,
              transform: [{ scale: pulse }],
            },
          ]}
        />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing['2xl'],
  },
  loaderRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
});
