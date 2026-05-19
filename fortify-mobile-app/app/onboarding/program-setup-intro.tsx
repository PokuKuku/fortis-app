import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Text, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const INTRO_TITLE = 'Now help Fortify get to know you better!';
const COPY_SUBTITLE = "Help Fortify get to know you! In the meantime, we'll start you off with a custom program.";
const TITLE_TYPEWRITER_START_DELAY_MS = 80;
const TITLE_TYPEWRITER_INTERVAL_MS = 24;

export default function OnboardingProgramSetupIntroScreen() {
  useOnboardingFunnelScreen('Program Setup Intro');

  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const floatOffset = useState(() => new Animated.Value(0))[0];
  const [typedTitle, setTypedTitle] = useState('');
  const isTitleComplete = typedTitle === INTRO_TITLE;
  const layout = useMemo(() => {
    const isNarrow = screenWidth < 380;
    const isShort = screenHeight < 760;
    const bubbleSize = isNarrow ? 96 : 108;
    const clusterWidth = isNarrow ? 218 : 244;
    const clusterHeight = isNarrow ? 174 : 194;
    const sideInset = isNarrow ? 8 : 10;

    return {
      bubbleSize,
      clusterWidth,
      clusterHeight,
      sideInset,
      bottomBubbleLeft: Math.round((clusterWidth - bubbleSize) / 2),
      emojiSize: isNarrow ? 42 : 48,
      visualMinHeight: isShort ? 318 : 360,
      clusterTopOffset: isShort ? -Spacing['2xl'] : -Spacing['3xl'],
      subtitleFontSize: isNarrow ? 18 : 20,
      subtitleLineHeight: isNarrow ? 25 : 28,
      copySubtitleHeight: isNarrow ? 102 : 112,
    };
  }, [screenHeight, screenWidth]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatOffset, {
          toValue: -8,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatOffset, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatOffset]);

  useEffect(() => {
    let titleIndex = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const typeNextCharacter = () => {
      titleIndex += 1;
      setTypedTitle(INTRO_TITLE.slice(0, titleIndex));

      if (titleIndex < INTRO_TITLE.length) {
        timeout = setTimeout(typeNextCharacter, TITLE_TYPEWRITER_INTERVAL_MS);
      }
    };

    timeout = setTimeout(typeNextCharacter, TITLE_TYPEWRITER_START_DELAY_MS);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const handleContinue = () => {
    trackOnboardingStepCompleted('program_setup_intro');
    router.push('/onboarding/training-environment');
  };

  return (
    <OnboardingScreen
      step={9}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title={typedTitle}
      subtitle={undefined}
      onBack={() => router.back()}
      bodyAlign="center"
      contentGap={Spacing.xl}
      titleNumberOfLines={2}
      titleAdjustsFontSizeToFit
      titleMinimumFontScale={0.86}
      titleMinHeight={74}
      footer={
        <View style={styles.footerSlot} pointerEvents={isTitleComplete ? 'auto' : 'none'}>
          <GlassButton
            style={[styles.button, !isTitleComplete && styles.buttonHidden]}
            onPress={handleContinue}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Let&apos;s start!</Text>
          </GlassButton>
        </View>
      }
    >
      <View style={[styles.visualWrap, { minHeight: layout.visualMinHeight }]}>
        <View style={styles.contentGroup}>
          <Animated.View
            style={[
              styles.bubbleCluster,
              {
                width: layout.clusterWidth,
                height: layout.clusterHeight,
                marginTop: layout.clusterTopOffset,
                transform: [{ translateY: floatOffset }],
              },
            ]}
          >
            <View
              style={[
                styles.bubble,
                styles.bubbleTopLeft,
                {
                  width: layout.bubbleSize,
                  height: layout.bubbleSize,
                  borderRadius: layout.bubbleSize / 2,
                  left: layout.sideInset,
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Text style={[styles.bubbleEmoji, { fontSize: layout.emojiSize }]}>🏋️</Text>
            </View>
            <View
              style={[
                styles.bubble,
                styles.bubbleTopRight,
                {
                  width: layout.bubbleSize,
                  height: layout.bubbleSize,
                  borderRadius: layout.bubbleSize / 2,
                  right: layout.sideInset,
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Text style={[styles.bubbleEmoji, { fontSize: layout.emojiSize }]}>🎯</Text>
            </View>
            <View
              style={[
                styles.bubble,
                styles.bubbleBottom,
                {
                  width: layout.bubbleSize,
                  height: layout.bubbleSize,
                  borderRadius: layout.bubbleSize / 2,
                  left: layout.bottomBubbleLeft,
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Text style={[styles.bubbleEmoji, { fontSize: layout.emojiSize }]}>⏱️</Text>
            </View>
          </Animated.View>
          <View style={styles.copyBlock}>
            <Text
              style={[
                styles.visualSubtitle,
                {
                  color: colors.textSecondary,
                  fontSize: layout.subtitleFontSize,
                  lineHeight: layout.subtitleLineHeight,
                  height: layout.copySubtitleHeight,
                },
              ]}
            >
              {COPY_SUBTITLE}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  visualWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentGroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  bubbleCluster: {
    marginBottom: Spacing.sm,
  },
  bubble: {
    position: 'absolute',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  bubbleTopLeft: {
    top: 0,
  },
  bubbleTopRight: {
    top: 0,
  },
  bubbleBottom: {
    bottom: 0,
  },
  bubbleEmoji: {},
  copyBlock: {
    width: '100%',
    alignItems: 'flex-start',
  },
  visualSubtitle: {
    maxWidth: 350,
    fontWeight: '700',
    textAlign: 'left',
  },
  footerSlot: {
    minHeight: 54,
    justifyContent: 'center',
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonHidden: {
    opacity: 0,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
