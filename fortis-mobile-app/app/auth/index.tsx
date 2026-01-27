import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AuthProviderButtons } from '@/src/components/auth/AuthProviderButtons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { clearOnboardingState, getOnboardingState } from '@/src/utils/onboardingState';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    signInWithGoogle,
    signInWithApple,
    isAuthenticated,
    needsOnboarding,
    updateProfile,
    profile,
    isLoading,
  } = useAuth();
  const { colors, isDark } = useTheme();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const onboardingValue = Array.isArray(onboarding) ? onboarding[0] : onboarding;
  const showBack = Boolean(onboardingValue);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    tagline: { color: colors.textSecondary },
    backButton: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
    glassCard: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.6)',
    },
    glassCardTitle: { color: isDark ? '#DFE2E6' : colors.textSecondary },
    errorText: { color: colors.error },
    terms: { color: colors.textSecondary },
  };

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === 'ios');
  const [error, setError] = useState<string | null>(null);

  // Navigate when auth state changes
  useEffect(() => {
    if (!isAuthenticated || isFinalizing || isLoading) return;

    if (onboardingValue === 'complete') {
      setIsFinalizing(true);
      void (async () => {
        const state = await getOnboardingState();
        const shouldSetString = (value: string | null | undefined) => !value || value.trim().length === 0;
        const shouldSetNumber = (value: number | null | undefined) => typeof value !== 'number' || Number.isNaN(value);

        const updates: Parameters<typeof updateProfile>[0] = {
          onboarding_completed: true,
        };

        if (state?.full_name?.trim() && shouldSetString(profile?.full_name)) {
          updates.full_name = state.full_name.trim();
        }
        if (state?.gender && !profile?.gender) {
          updates.gender = state.gender;
        }
        if (state?.birth_date && !profile?.birth_date) {
          updates.birth_date = state.birth_date;
        }
        if (typeof state?.height_cm === 'number' && shouldSetNumber(profile?.height_cm)) {
          updates.height_cm = state.height_cm;
        }
        if (typeof state?.weight_kg === 'number' && shouldSetNumber(profile?.weight_kg)) {
          updates.weight_kg = state.weight_kg;
        }
        if (state?.preferred_units && !profile?.preferred_units) {
          updates.preferred_units = state.preferred_units;
        }
        if (state?.lifting_experience && !profile?.lifting_experience) {
          updates.lifting_experience = state.lifting_experience;
        }
        if (typeof state?.workouts_per_week === 'number') {
          if (shouldSetNumber(profile?.workouts_per_week)) {
            updates.workouts_per_week = state.workouts_per_week;
          }
        }
        if (state?.tried_other_apps && !profile?.tried_other_apps) {
          updates.tried_other_apps = state.tried_other_apps;
        }
        const resolvedGoal = state?.fitness_goal ?? state?.fitness_goals?.[state.fitness_goals.length - 1];
        if (resolvedGoal && !profile?.fitness_goal) {
          updates.fitness_goal = resolvedGoal;
        }
        const resolvedChallenge =
          state?.biggest_challenge ??
          state?.biggest_challenges?.[state.biggest_challenges.length - 1];
        if (resolvedChallenge && !profile?.biggest_challenge) {
          updates.biggest_challenge = resolvedChallenge;
        }
        if (state?.workout_consistency && !profile?.workout_consistency) {
          updates.workout_consistency = state.workout_consistency;
        }

        const { error } = await updateProfile(updates);
        if (error) {
          setIsFinalizing(false);
          router.replace('/onboarding/welcome');
          return;
        }

        await clearOnboardingState();
        router.replace('/paywall-gate');
      })();
      return;
    }

    if (needsOnboarding) {
      router.replace('/onboarding/welcome');
      return;
    }

    router.replace('/paywall-gate');
  }, [
    isAuthenticated,
    isFinalizing,
    isLoading,
    needsOnboarding,
    onboardingValue,
    profile,
    router,
    updateProfile,
  ]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoadingGoogle(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { error: signInError } = await signInWithGoogle();

      if (signInError) {
        setError(signInError.message);
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setIsLoadingApple(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { error: signInError } = await signInWithApple();

      if (signInError) {
        setError(signInError.message);
      }
    } finally {
      setIsLoadingApple(false);
    }
  };

  const handleEmailPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/email');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if ((navigation as { canGoBack?: () => boolean }).canGoBack?.()) {
      (navigation as { goBack?: () => void }).goBack?.();
      return;
    }
    if (onboardingValue) {
      router.replace(`/onboarding/${onboardingValue}`);
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {showBack ? (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.backButton, themedStyles.backButton]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeftIcon color={colors.textPrimary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.content, showBack && styles.contentWithHeader]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <AnimatedLogo size="large" centered animate={false} />
            <Text style={[styles.tagline, themedStyles.tagline]}>
              Start tracking your strength journey
            </Text>
          </View>

          {/* Glass Card Container */}
          <View style={[styles.glassCard, themedStyles.glassCard]}>
            {/* Fog Overlay */}
            <LinearGradient
              colors={isDark
                ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)', 'transparent']
                : ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)', 'transparent']
              }
              style={styles.fogOverlay}
            />

            <View style={styles.glassCardContent}>
              <Text style={[styles.glassCardTitle, themedStyles.glassCardTitle]}>
                Sign in to save your preferences
              </Text>

              <AuthProviderButtons
                onGoogle={handleGoogleSignIn}
                onApple={handleAppleSignIn}
                onEmail={handleEmailPress}
                isLoadingGoogle={isLoadingGoogle}
                isLoadingApple={isLoadingApple}
                isAppleAvailable={isAppleAvailable}
                showDivider
              />

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, themedStyles.errorText]}>{error}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Terms */}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: Spacing['2xl'],
    gap: Spacing['4xl'],
  },
  contentWithHeader: {
    paddingTop: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing['4xl'],
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  // Glass card styles
  glassCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassCardContent: {
    padding: Spacing.lg,
  },
  glassCardTitle: {
    ...Typography.body,
    color: '#DFE2E6',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  // Error
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'center',
  },
  // Terms
  terms: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
