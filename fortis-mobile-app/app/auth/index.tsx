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
  Path,
} from 'react-native-svg';

// Apple Logo Component
function AppleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill="#000000"
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
                fontFamily="BankGothicBT-Medium, sans-serif"
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
                    <AppleLogo size={20} />
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
                  <GoogleLogo size={20} />
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
