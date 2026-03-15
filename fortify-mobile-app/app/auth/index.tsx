import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { AuthProviderButtons } from '@/src/components/auth/AuthProviderButtons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { clearOnboardingState, getOnboardingState } from '@/src/utils/onboardingState';

const ONBOARDING_STATE_LOAD_TIMEOUT_MS = 4_000;
const PROFILE_FINALIZATION_TIMEOUT_MS = 8_000;
const ONBOARDING_STATE_CLEAR_TIMEOUT_MS = 3_000;
const AUTH_LOGO_SCALE = 0.68;

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

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
    profileResolved,
    setAllowProfileCreation,
  } = useAuth();
  const { colors, isDark } = useTheme();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const onboardingValue = Array.isArray(onboarding) ? onboarding[0] : onboarding;
  const showBack = Boolean(onboardingValue);
  const TERMS_OF_SERVICE_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
  const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '';
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    setAllowProfileCreation(onboardingValue === 'complete');
    return () => {
      setAllowProfileCreation(false);
    };
  }, [onboardingValue, setAllowProfileCreation]);

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
    loadingOverlay: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.15)',
    },
  };

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === 'ios');
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);
  const isMountedRef = useRef(true);
  const onboardingFinalizeInFlightRef = useRef(false);
  const isAuthProcessing =
    isFocused && (isLoading || isFinalizing || (isAuthenticated && !profileResolved));

  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Finalize onboarding after sign-in from onboarding-complete auth entry.
  useEffect(() => {
    if (!isFocused) return;
    if (onboardingValue !== 'complete') return;
    if (!isAuthenticated || isLoading || !profileResolved) return;

    if (profile?.onboarding_completed) {
      router.replace('/paywall-gate');
      return;
    }

    if (onboardingFinalizeInFlightRef.current) return;

    onboardingFinalizeInFlightRef.current = true;
    setIsFinalizing(true);

    const profileSnapshot = profile;

    void (async () => {
      try {
        const state = await withTimeout(
          getOnboardingState(),
          ONBOARDING_STATE_LOAD_TIMEOUT_MS,
          'Loading onboarding state',
        );
        const shouldSetNumber = (value: number | null | undefined) =>
          typeof value !== 'number' || Number.isNaN(value);

        const updates: Parameters<typeof updateProfile>[0] = {
          onboarding_completed: true,
          avatar_url: null,
          has_seen_in_app_tour: false,
          in_app_tour_completed_at: null,
          in_app_tour_version: 0,
        };

        if (typeof state?.full_name === 'string') {
          updates.full_name = state.full_name.trim() || null;
        }
        if (state?.gender && !profileSnapshot?.gender) {
          updates.gender = state.gender;
        }
        if (state?.birth_date && !profileSnapshot?.birth_date) {
          updates.birth_date = state.birth_date;
        }
        if (typeof state?.height_cm === 'number' && shouldSetNumber(profileSnapshot?.height_cm)) {
          updates.height_cm = state.height_cm;
        }
        if (typeof state?.weight_kg === 'number' && shouldSetNumber(profileSnapshot?.weight_kg)) {
          updates.weight_kg = state.weight_kg;
        }
        if (state?.preferred_units && !profileSnapshot?.preferred_units) {
          updates.preferred_units = state.preferred_units;
        }
        if (state?.lifting_experience && !profileSnapshot?.lifting_experience) {
          updates.lifting_experience = state.lifting_experience;
        }
        if (typeof state?.workouts_per_week === 'number') {
          if (shouldSetNumber(profileSnapshot?.workouts_per_week)) {
            updates.workouts_per_week = state.workouts_per_week;
          }
        }
        if (state?.tried_other_apps && !profileSnapshot?.tried_other_apps) {
          updates.tried_other_apps = state.tried_other_apps;
        }
        const resolvedGoal = state?.fitness_goal ?? state?.fitness_goals?.[state.fitness_goals.length - 1];
        if (resolvedGoal && !profileSnapshot?.fitness_goal) {
          updates.fitness_goal = resolvedGoal;
        }
        const resolvedChallenge =
          state?.biggest_challenge ??
          state?.biggest_challenges?.[state.biggest_challenges.length - 1];
        if (resolvedChallenge && !profileSnapshot?.biggest_challenge) {
          updates.biggest_challenge = resolvedChallenge;
        }
        if (state?.workout_consistency && !profileSnapshot?.workout_consistency) {
          updates.workout_consistency = state.workout_consistency;
        }

        const { error } = await withTimeout(
          updateProfile(updates),
          PROFILE_FINALIZATION_TIMEOUT_MS,
          'Finalizing profile',
        );
        if (error) {
          if (isMountedRef.current && isFocusedRef.current) {
            router.replace('/onboarding/welcome');
          }
          return;
        }

        await withTimeout(
          clearOnboardingState(),
          ONBOARDING_STATE_CLEAR_TIMEOUT_MS,
          'Clearing onboarding state',
        );

        if (isMountedRef.current && isFocusedRef.current) {
          router.replace('/paywall-gate');
        }
      } catch (finalizeError) {
        console.warn('[Auth] Failed to finalize onboarding after sign-in:', finalizeError);
        if (isMountedRef.current && isFocusedRef.current) {
          router.replace('/onboarding/welcome');
        }
      } finally {
        onboardingFinalizeInFlightRef.current = false;
        if (isMountedRef.current) {
          setIsFinalizing(false);
        }
      }
    })();
  }, [
    isAuthenticated,
    isFocused,
    isLoading,
    onboardingValue,
    profile,
    profileResolved,
    router,
    updateProfile,
  ]);

  // Navigate when auth state changes in non-onboarding-complete auth entry paths.
  useEffect(() => {
    if (!isFocused) return;
    if (!isAuthenticated || isLoading || !profileResolved) return;
    if (onboardingValue === 'complete') {
      return;
    }

    if (!profile || needsOnboarding) {
      router.replace('/onboarding');
      return;
    }

    console.log('[Routing] auth/index -> /onboarding/welcome (authenticated)');
    router.replace('/onboarding/welcome');
  }, [
    isAuthenticated,
    isFocused,
    isLoading,
    needsOnboarding,
    onboardingValue,
    profile,
    profileResolved,
    router,
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

  const openExternalLink = async (url: string, label: string) => {
    if (!url) {
      Alert.alert('Missing link', `${label} link is not configured yet.`);
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unable to open link', 'Please try again later.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', 'Please try again later.');
    }
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
            <AnimatedFortifyLogo
              size="large"
              centered
              animate={false}
              useDynamicSizing={false}
              sizeScale={AUTH_LOGO_SCALE}
            />
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
                isLoadingGoogle={isLoadingGoogle}
                isLoadingApple={isLoadingApple}
                isAppleAvailable={isAppleAvailable}
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
          <View style={styles.termsContainer}>
            <Text style={[styles.terms, themedStyles.terms]}>
              By continuing, you agree to our{' '}
            </Text>
            <TouchableOpacity
              onPress={() => openExternalLink(TERMS_OF_SERVICE_URL, 'Terms & Conditions')}
              activeOpacity={0.7}
            >
              <Text style={[styles.termsLink, { color: colors.accent }]}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={[styles.terms, themedStyles.terms]}> and </Text>
            <TouchableOpacity
              onPress={() => openExternalLink(PRIVACY_POLICY_URL, 'Privacy Policy')}
              activeOpacity={0.7}
            >
              <Text style={[styles.termsLink, { color: colors.accent }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.terms, themedStyles.terms]}>.</Text>
          </View>
        </View>
      </SafeAreaView>

      {isAuthProcessing && (
        <View style={[styles.loadingOverlay, themedStyles.loadingOverlay]} pointerEvents="none">
          <AnimatedFortifyLogo
            size="large"
            centered
            useDynamicSizing={false}
            sizeScale={AUTH_LOGO_SCALE}
            introDurationMs={0}
            shineDurationMs={2600}
          />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Getting things ready...
          </Text>
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.caption,
    marginTop: Spacing.md,
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
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  terms: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    ...Typography.caption,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
});
