import { View, Text, StyleSheet, Pressable, Modal, Platform, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
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
import { AnimatedFortifyLogo } from '@/components/AnimatedFortifyLogo';
import { Typography } from '@/constants/Typography';
import { useOnboardingFunnelScreen } from '@/src/services/onboardingAnalyticsService';
import { usePendingOnboardingAuthCompletion } from '@/src/utils/onboardingAuthCompletion';

const DEMO_VIDEO = require('../../assets/videos/FortisDemoFinal888.mov');
const WELCOME_TITLE_LINE_ONE = 'Gym Progress';
const WELCOME_TITLE_LINE_TWO = 'made Simple';
const WELCOME_TITLE = `${WELCOME_TITLE_LINE_ONE}\n${WELCOME_TITLE_LINE_TWO}`;
const TITLE_TYPEWRITER_START_DELAY_MS = 140;
const TITLE_TYPEWRITER_INTERVAL_MS = 60;
const TITLE_HAPTIC_EVERY_N_CHARS = 1;

const getSharedWelcomeTitleMetrics = (screenWidth: number) => {
  if (screenWidth <= 350) {
    return { fontSize: 22, lineHeight: 28 };
  }
  if (screenWidth <= 375) {
    return { fontSize: 24, lineHeight: 30 };
  }
  if (screenWidth <= 390) {
    return { fontSize: 25, lineHeight: 31 };
  }
  if (screenWidth <= 430) {
    return { fontSize: 26, lineHeight: 32 };
  }
  return { fontSize: 27, lineHeight: 33 };
};

export default function OnboardingWelcomeScreen() {
  useOnboardingFunnelScreen('Welcome Screen');

  const router = useRouter();
  const navigation = useNavigation();
  const { returning } = useLocalSearchParams<{ returning?: string }>();
  const isReturning = returning === '1' || returning === 'true';
  const { colors, isDark } = useTheme();
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
  const {
    isPending: hasPendingOnboardingAuthCompletion,
    isResolved: pendingOnboardingAuthCompletionResolved,
  } = usePendingOnboardingAuthCompletion();
  const [showSignInSheet, setShowSignInSheet] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === 'ios');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const { width: windowWidth } = useWindowDimensions();
  const titleTypeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocused = useIsFocused();
  const isAuthProcessing =
    isFocused &&
    (authInProgress || (showSignInSheet && isAuthenticated && !profileResolved));
  const typedTitleBreakIndex = typedTitle.indexOf('\n');
  const typedTitleLineOne = typedTitleBreakIndex >= 0
    ? typedTitle.slice(0, typedTitleBreakIndex)
    : typedTitle;
  const typedTitleLineTwo = typedTitleBreakIndex >= 0
    ? typedTitle.slice(typedTitleBreakIndex + 1)
    : '';

  const sharedTitleTextStyle = useMemo(() => {
    return getSharedWelcomeTitleMetrics(windowWidth);
  }, [windowWidth]);

  const themedStyles = {
    loadingOverlay: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.15)',
    },
  };

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

  useFocusEffect(
    useCallback(() => {
      let titleIndex = 0;
      setTypedTitle('');

      const typeNextCharacter = () => {
        titleIndex += 1;
        setTypedTitle(WELCOME_TITLE.slice(0, titleIndex));
        const currentChar = WELCOME_TITLE.charAt(titleIndex - 1);
        if (currentChar.trim().length > 0) {
          if (titleIndex === WELCOME_TITLE.length) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (titleIndex % TITLE_HAPTIC_EVERY_N_CHARS === 0) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
        if (titleIndex < WELCOME_TITLE.length) {
          titleTypeTimeoutRef.current = setTimeout(typeNextCharacter, TITLE_TYPEWRITER_INTERVAL_MS);
        }
      };

      titleTypeTimeoutRef.current = setTimeout(typeNextCharacter, TITLE_TYPEWRITER_START_DELAY_MS);

      return () => {
        if (titleTypeTimeoutRef.current) {
          clearTimeout(titleTypeTimeoutRef.current);
          titleTypeTimeoutRef.current = null;
        }
      };
    }, [])
  );

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
  }, []);

  useEffect(() => {
    if (signInError) {
      setAuthInProgress(false);
    }
  }, [signInError]);

  useEffect(() => {
    if (isAuthenticated && profileResolved) {
      setAuthInProgress(false);
    }
  }, [isAuthenticated, profileResolved]);

  useEffect(() => {
    if (!isFocused) return;
    if (!showSignInSheet && !authInProgress) return;
    if (!isAuthenticated || isLoading || !profileResolved) return;
    if (!profile || needsOnboarding) {
      if (
        !pendingOnboardingAuthCompletionResolved ||
        hasPendingOnboardingAuthCompletion
      ) {
        return;
      }
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
    pendingOnboardingAuthCompletionResolved,
    hasPendingOnboardingAuthCompletion,
    showSignInSheet,
    authInProgress,
    isFocused,
    signOut,
    router,
  ]);

  const handleStart = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    setShowSignInSheet(true);
  };

  const handleCloseSheet = () => {
    setShowSignInSheet(false);
    setSignInError(null);
    setAuthInProgress(false);
  };

  const handleEmailPress = () => {
    handleCloseSheet();
    router.push({ pathname: '/auth/email', params: { source: 'onboarding' } });
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setIsLoadingGoogle(true);
    setAuthInProgress(true);
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
      setAuthInProgress(false);
    }
  };

  const handleAppleSignIn = async () => {
    setSignInError(null);
    setIsLoadingApple(true);
    setAuthInProgress(true);
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
      setAuthInProgress(false);
    }
  };

  return (
    <OnboardingScreen
      step={0}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      subtitle={undefined}
      hideTitle
      useScrollView={false}
      showProgress={false}
      hideHeader
      safeAreaEdges={['bottom']}
      bodyAlign="center"
      contentGap={0}
      footer={
        <View style={styles.footer}>
          <GlassButton
            style={styles.button}
            onPress={handleStart}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Get started</Text>
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
        <View pointerEvents="none" style={styles.videoTitleOverlay}>
          <View style={styles.typewriterTitleFrame}>
            <View style={styles.typewriterTitleLineWrap}>
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[styles.typewriterTitleText, sharedTitleTextStyle, styles.typewriterTitleReserve]}
              >
                {WELCOME_TITLE_LINE_ONE}
              </Text>
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[
                  styles.typewriterTitleText,
                  sharedTitleTextStyle,
                  styles.typewriterTitleOverlay,
                  { color: colors.textPrimary },
                ]}
              >
                {typedTitleLineOne}
              </Text>
            </View>

            <View style={styles.typewriterTitleLineWrap}>
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[styles.typewriterTitleText, sharedTitleTextStyle, styles.typewriterTitleReserve]}
              >
                {WELCOME_TITLE_LINE_TWO}
              </Text>
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[
                  styles.typewriterTitleText,
                  sharedTitleTextStyle,
                  styles.typewriterTitleOverlay,
                  { color: colors.textPrimary },
                ]}
              >
                {typedTitleLineTwo}
              </Text>
            </View>
          </View>
        </View>
        <OnboardingDemoVideo
          sourceModule={DEMO_VIDEO}
          height="100%"
          scale={1.4}
          offsetY={0}
          active
          deferMountUntilInteractions
          enablePlaybackWatchdog={false}
        />
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
              showEmailButton
            />
            {signInError ? (
              <Text style={[styles.sheetError, { color: colors.error }]}>{signInError}</Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isAuthProcessing}
        animationType="fade"
      >
        <View style={[styles.loadingOverlay, themedStyles.loadingOverlay]}>
          <AnimatedFortifyLogo size="large" centered introDurationMs={0} shineDurationMs={2600} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Getting things ready...
          </Text>
        </View>
      </Modal>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  videoWrap: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  videoTitleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg,
    zIndex: 2,
    alignItems: 'center',
  },
  typewriterTitleFrame: {
    position: 'relative',
    width: '100%',
    alignSelf: 'center',
  },
  typewriterTitleLineWrap: {
    position: 'relative',
    width: '100%',
  },
  typewriterTitleText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  typewriterTitleReserve: {
    color: 'transparent',
  },
  typewriterTitleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footer: {
    gap: Spacing.xs,
    marginTop: -Spacing.sm,
    marginBottom: -Spacing.sm,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.caption,
    marginTop: Spacing.md,
  },
});
