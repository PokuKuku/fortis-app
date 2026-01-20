import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { clearOnboardingState, getOnboardingState } from '@/src/utils/onboardingState';

const LOADING_DELAY_MS = 1400;
const UPDATE_TIMEOUT_MS = 5000;

type Phase = 'loading' | 'confirmed';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateProfile, isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const pulse = useRef(new Animated.Value(0.9)).current;
  const checkScale = useRef(new Animated.Value(0.6)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

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
    const timer = setTimeout(() => {
      setPhase('confirmed');
    }, LOADING_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'confirmed') return;

    Animated.parallel([
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkOpacity, checkScale, phase]);

  const handleContinue = async () => {
    if (!isAuthenticated) {
      router.replace({ pathname: '/auth', params: { onboarding: 'complete' } });
      return;
    }

    setIsSaving(true);
    try {
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
      if (state?.tried_other_apps) {
        updates.tried_other_apps = state.tried_other_apps;
      }
      const resolvedGoal = state?.fitness_goal ?? state?.fitness_goals?.[state.fitness_goals.length - 1];
      if (resolvedGoal) {
        updates.fitness_goal = resolvedGoal;
      }
      const resolvedChallenge =
        state?.biggest_challenge ??
        state?.biggest_challenges?.[state.biggest_challenges.length - 1];
      if (resolvedChallenge) {
        updates.biggest_challenge = resolvedChallenge;
      }
      if (state?.workout_consistency) {
        updates.workout_consistency = state.workout_consistency;
      }

      let didTimeout = false;
      const timeoutResult = new Promise<{ error: Error | null }>((resolve) => {
        setTimeout(() => {
          didTimeout = true;
          resolve({ error: new Error('Update timeout') });
        }, UPDATE_TIMEOUT_MS);
      });

      const { error } = await Promise.race([updateProfile(updates), timeoutResult]);
      if (!error && !didTimeout) {
        await clearOnboardingState();
      }
    } finally {
      setIsSaving(false);
      router.replace('/(tabs)');
    }
  };

  return (
    <OnboardingScreen
      step={TOTAL_ONBOARDING_STEPS}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title={phase === 'loading' ? 'Analyzing your responses' : "You're set."}
      subtitle={
        phase === 'loading'
          ? 'Feeding responses to Fortis analytics to tailor actionable insights.'
          : 'Create your account to save your setup and start logging.'
      }
      useScrollView={false}
      footer={
        phase === 'confirmed' ? (
          <GlassButton
            style={styles.enterButton}
            onPress={handleContinue}
            disabled={isSaving}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {isSaving ? 'Saving...' : isAuthenticated ? 'Enter Fortis' : 'Create account'}
            </Text>
          </GlassButton>
        ) : undefined
      }
    >
      {phase === 'loading' ? (
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
      ) : (
        <View style={styles.confirmationContainer}>
          <Animated.View
            style={[
              styles.checkCircle,
              {
                backgroundColor: colors.accentOverlay,
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <CheckIcon size={40} color={colors.accent} />
          </Animated.View>
        </View>
      )}
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
  confirmationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  checkCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButton: {
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
