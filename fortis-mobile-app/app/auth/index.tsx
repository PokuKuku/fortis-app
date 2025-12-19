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
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, isAuthenticated, needsOnboarding } = useAuth();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigate when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, needsOnboarding, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoadingGoogle(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error: signInError } = await signInWithGoogle();

    setIsLoadingGoogle(false);
    if (signInError) {
      setError(signInError.message);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setIsLoadingApple(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error: signInError } = await signInWithApple();

    setIsLoadingApple(false);
    if (signInError) {
      setError(signInError.message);
    }
  };

  const handleEmailPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/email');
  };

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Svg height="80" width="280" viewBox="0 0 280 80">
              <Defs>
                <SvgLinearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#4ade80" />
                  <Stop offset="50%" stopColor="#22c55e" />
                  <Stop offset="100%" stopColor="#16a34a" />
                </SvgLinearGradient>
              </Defs>
              <SvgText
                fill="url(#logoGradient)"
                fontSize="38"
                fontWeight="900"
                letterSpacing="6"
                x="140"
                y="52"
                textAnchor="middle"
                fontFamily="BankGothicMediumBT, sans-serif"
              >
                FORTIS
              </SvgText>
            </Svg>
            <Text style={styles.tagline}>Track your strength journey</Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtons}>
            {/* Apple Sign In (iOS only) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleAppleSignIn}
                disabled={isLoadingApple || isLoadingGoogle}
                activeOpacity={0.8}
              >
                {isLoadingApple ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <>
                    <Text style={styles.appleIcon}></Text>
                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoadingGoogle || isLoadingApple}
              activeOpacity={0.8}
            >
              {isLoadingGoogle ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Sign In */}
            <GlassButton
              style={styles.emailButton}
              onPress={handleEmailPress}
            >
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </GlassButton>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
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
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: Spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing['4xl'],
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  authButtons: {
    gap: Spacing.md,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  appleIcon: {
    fontSize: 20,
    color: '#000000',
  },
  appleButtonText: {
    ...Typography.button,
    color: '#000000',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    ...Typography.button,
    color: '#000000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
  },
  emailButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
  },
  emailButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'center',
  },
  terms: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
