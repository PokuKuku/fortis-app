import { View, Text, StyleSheet, Pressable, useWindowDimensions, Modal, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingDemoVideo } from '@/src/components/onboarding/OnboardingDemoVideo';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { AuthProviderButtons } from '@/src/components/auth/AuthProviderButtons';
import { useAuth } from '@/src/contexts/AuthContext';

const DEMO_VIDEO = require('../../assets/videos/FortisDemo3.mp4');

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { returning } = useLocalSearchParams<{ returning?: string }>();
  const isReturning = returning === '1' || returning === 'true';
  const { colors } = useTheme();
  const {
    signInWithGoogle,
    signInWithApple,
    isAuthenticated,
    needsOnboarding,
    isLoading,
    profile,
    profileResolved,
    signOut,
  } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const videoHeight = Math.min(420, Math.max(320, Math.round(windowHeight * 0.4)));
  const [showSignInSheet, setShowSignInSheet] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === 'ios');
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReturning) return;
    navigation.setOptions({
      animation: 'slide_from_left',
      animationTypeForReplace: 'pop',
    });
    return () => {
      navigation.setOptions({
        animation: 'slide_from_right',
        animationTypeForReplace: 'push',
      });
    };
  }, [isReturning, navigation]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !profileResolved) return;
    if (!profile || needsOnboarding) {
      setShowSignInSheet(false);
      void (async () => {
        await signOut();
        router.replace('/onboarding');
      })();
      return;
    }
    setShowSignInSheet(false);
    console.log('[Routing] onboarding/welcome -> /paywall-gate');
    router.replace('/paywall-gate');
  }, [
    isAuthenticated,
    isLoading,
    needsOnboarding,
    profile,
    profileResolved,
    signOut,
    router,
  ]);

  const handleStart = () => {
    router.replace('/onboarding');
  };

  const handleSignIn = () => {
    setShowSignInSheet(true);
  };

  const handleCloseSheet = () => {
    setShowSignInSheet(false);
    setSignInError(null);
  };

  const handleEmailPress = () => {
    handleCloseSheet();
    router.push({ pathname: '/auth/email', params: { source: 'onboarding' } });
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setIsLoadingGoogle(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { error } = await signInWithGoogle();
      if (error) {
        setSignInError(error.message);
      } else {
        setSignInError(null);
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    setSignInError(null);
    setIsLoadingApple(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { error } = await signInWithApple();
      if (error) {
        setSignInError(error.message);
      } else {
        setSignInError(null);
      }
    } finally {
      setIsLoadingApple(false);
    }
  };

  return (
    <OnboardingScreen
      step={0}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Workout insights made simple"
      subtitle={undefined}
      useScrollView={false}
      showProgress={false}
      titleAlign="center"
      subtitleAlign="center"
      titleFontSize={36}
      titleNumberOfLines={2}
      titleAdjustsFontSizeToFit
      titleMinimumFontScale={0.8}
      titleTopOffset={Spacing.lg}
      bodyAlign="center"
      contentGap={Spacing.lg}
      footer={
        <View style={styles.footer}>
          <GlassButton style={styles.button} onPress={handleStart} hapticFeedback="impactMedium">
            <Text style={[styles.buttonText, { color: colors.white }]}>Get started</Text>
          </GlassButton>

          <View style={styles.signInRow}>
            <Text style={[styles.signInText, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <Pressable onPress={handleSignIn} hitSlop={8}>
              <Text style={[styles.signInLink, { color: colors.textPrimary }]}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={styles.videoWrap}>
        <OnboardingDemoVideo sourceModule={DEMO_VIDEO} height={videoHeight} />
      </View>

      <Modal
        transparent
        visible={showSignInSheet}
        animationType="slide"
        onRequestClose={handleCloseSheet}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetOverlay} onPress={handleCloseSheet} />
          <View style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.textTertiary }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Sign In</Text>
              <Pressable style={[styles.sheetClose, { backgroundColor: colors.glassBackground }]} onPress={handleCloseSheet}>
                <XMarkIcon color={colors.textSecondary} size={18} strokeWidth={2} />
              </Pressable>
            </View>
            <AuthProviderButtons
              onGoogle={handleGoogleSignIn}
              onApple={handleAppleSignIn}
              onEmail={handleEmailPress}
              isLoadingGoogle={isLoadingGoogle}
              isLoadingApple={isLoadingApple}
              isAppleAvailable={isAppleAvailable}
            />
            {signInError ? (
              <Text style={[styles.sheetError, { color: colors.error }]}>{signInError}</Text>
            ) : null}
          </View>
        </View>
      </Modal>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  videoWrap: {
    width: '100%',
  },
  footer: {
    gap: Spacing.md,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600',
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
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.35,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sheetClose: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetError: {
    fontSize: 13,
    textAlign: 'center',
  },
});
