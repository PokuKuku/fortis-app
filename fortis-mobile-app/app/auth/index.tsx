import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as AppleAuthentication from 'expo-apple-authentication';

// Apple Logo Component
function AppleLogo({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill={color}
      />
    </Svg>
  );
}

// Google Logo Component
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { getOnboardingState, type OnboardingState } from '@/src/utils/onboardingState';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, isAuthenticated, needsOnboarding } = useAuth();
  const { colors, isDark } = useTheme();
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [onboardingStateLoaded, setOnboardingStateLoaded] = useState(false);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    tagline: { color: colors.textSecondary },
    glassCard: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.6)',
    },
    glassCardTitle: { color: isDark ? '#DFE2E6' : colors.textSecondary },
    oauthButton: {
      backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(63, 63, 70, 0.8)' : 'rgba(0, 0, 0, 0.1)',
    },
    oauthButtonText: { color: isDark ? colors.white : colors.textPrimary },
    dividerText: { color: colors.textSecondary },
    emailButtonText: { color: colors.white },
    errorText: { color: colors.error },
    terms: { color: colors.textSecondary },
  };

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === 'ios');
  const [error, setError] = useState<string | null>(null);

  // Navigate when auth state changes
  useEffect(() => {
    if (!isAuthenticated || !onboardingStateLoaded) return;

    if (needsOnboarding) {
      if (onboardingState?.completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
      return;
    }

    router.replace('/(tabs)');
  }, [isAuthenticated, needsOnboarding, onboardingState?.completed, onboardingStateLoaded, router]);

  useEffect(() => {
    let isActive = true;

    const loadOnboardingState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setOnboardingState(state);
      setOnboardingStateLoaded(true);
    };

    loadOnboardingState();

    return () => {
      isActive = false;
    };
  }, []);

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

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <AnimatedLogo size="large" centered animate={false} />
            <Text style={[styles.tagline, themedStyles.tagline]}>Track your strength journey</Text>
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
              <Text style={[styles.glassCardTitle, themedStyles.glassCardTitle]}>Create an account or sign in</Text>

              {/* OAuth Buttons */}
              <View style={styles.oauthButtons}>
                {/* Google Sign In */}
                <TouchableOpacity
                  style={[styles.oauthButton, themedStyles.oauthButton]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoadingGoogle || isLoadingApple}
                  activeOpacity={0.8}
                >
                  {isLoadingGoogle ? (
                    <ActivityIndicator color={colors.textPrimary} size="small" />
                  ) : (
                    <>
                      <View style={styles.oauthIconContainer}>
                        <GoogleLogo size={20} />
                      </View>
                      <Text style={[styles.oauthButtonText, themedStyles.oauthButtonText]}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Apple Sign In (iOS only) */}
                {isAppleAvailable && (
                  <TouchableOpacity
                    style={[styles.oauthButton, themedStyles.oauthButton]}
                    onPress={handleAppleSignIn}
                    disabled={isLoadingApple || isLoadingGoogle}
                    activeOpacity={0.8}
                  >
                    {isLoadingApple ? (
                      <ActivityIndicator color={colors.textPrimary} size="small" />
                    ) : (
                      <>
                        <View style={styles.oauthIconContainer}>
                          <AppleLogo size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                        </View>
                        <Text style={[styles.oauthButtonText, themedStyles.oauthButtonText]}>Continue with Apple</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <LinearGradient
                  colors={isDark
                    ? ['transparent', 'rgba(113,113,122,0.5)', 'transparent']
                    : ['transparent', 'rgba(0,0,0,0.15)', 'transparent']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
                <Text style={[styles.dividerText, themedStyles.dividerText]}>or</Text>
                <LinearGradient
                  colors={isDark
                    ? ['transparent', 'rgba(113,113,122,0.5)', 'transparent']
                    : ['transparent', 'rgba(0,0,0,0.15)', 'transparent']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
              </View>

              {/* Email Sign In */}
              <GlassButton
                style={styles.emailButton}
                onPress={handleEmailPress}
              >
                <Text style={[styles.emailButtonText, themedStyles.emailButtonText]}>Continue with Email</Text>
              </GlassButton>

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
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: Spacing['2xl'],
    gap: Spacing['4xl'],
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
  // OAuth button styles
  oauthButtons: {
    gap: Spacing.md,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(63, 63, 70, 0.8)',
  },
  oauthIconContainer: {
    position: 'absolute',
    left: Spacing.lg,
  },
  oauthButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
  // Divider styles
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  dividerGradient: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  // Email button
  emailButton: {
    height: 44,
    borderRadius: 22,
  },
  emailButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
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
