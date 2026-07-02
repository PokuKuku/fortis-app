import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BellAlertIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { requestNotificationPermissionIfNeeded } from '@/src/services/notificationPermissionService';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

export default function OnboardingNotificationsScreen() {
  useOnboardingFunnelScreen('Ask for notifications page');

  const router = useRouter();
  const { colors } = useTheme();
  const hasTrackedRef = useRef(false);

  const markStepComplete = () => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackOnboardingStepCompleted('notifications_prompt');
  };

  const finish = async () => {
    markStepComplete();

    try {
      await requestNotificationPermissionIfNeeded();
    } catch {
      // Best effort only.
    } finally {
      router.push('/onboarding/complete');
    }
  };

  const handleAllow = async () => {
    markStepComplete();

    try {
      await requestNotificationPermissionIfNeeded();
    } catch {
      // Best effort only.
    } finally {
      router.push('/onboarding/complete');
    }
  };

  const handleDontAllow = async () => {
    markStepComplete();

    try {
      await requestNotificationPermissionIfNeeded();
    } catch {
      // Best effort only.
    } finally {
      router.push('/onboarding/complete');
    }
  };

  return (
    <OnboardingScreen
      step={27}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      hideTitle
      onBack={() => router.back()}
      useScrollView
      scrollEnabled
      bodyAlign="center"
      contentGap={Spacing.xl}
      floatingFooter={
        <GlassButton style={styles.button} onPress={() => void finish()} hapticFeedback="impactMedium">
          <Text allowFontScaling={false} style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>
            Next
          </Text>
        </GlassButton>
      }
    >
      <View style={styles.content}>
        <Text allowFontScaling={false} style={[styles.titleText, { color: colors.textPrimary }]}>
          Allow notifications{'\n'}for workout reminders.
        </Text>

        <GlassCard
          padding={Spacing.xl}
          shellShadow={false}
          style={StyleSheet.flatten([
            styles.promptCard,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder },
          ])}
        >
          <View style={styles.promptHeader}>
            <BellAlertIcon size={22} color={colors.textPrimary} />
            <Text allowFontScaling={false} style={[styles.promptTitle, { color: colors.textPrimary }]}>
              Fortify would like to send you notifications
            </Text>
          </View>

          <View style={styles.promptActions}>
            <Pressable
              onPress={() => void handleDontAllow()}
              style={[styles.promptButton, { borderColor: colors.glassBorder }]}
            >
              <Text allowFontScaling={false} style={[styles.promptButtonText, { color: colors.textSecondary }]}>
                Don't Allow
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void handleAllow()}
              style={[styles.promptButton, styles.promptButtonPrimary, { backgroundColor: colors.accent }]}
            >
              <Text allowFontScaling={false} style={[styles.promptButtonText, { color: colors.accentForegroundOnFill }]}>
                Allow
              </Text>
            </Pressable>
          </View>
        </GlassCard>
        <View style={styles.handRow}>
          <View style={styles.handSpacer} />
          <View style={styles.handSlot}>
            <Text style={styles.handEmoji}>👆</Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={[styles.caption, { color: colors.textPrimary }]}>
          Fortify will remind you when it is time to train.
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    textAlign: 'center',
  },
  promptCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    gap: Spacing.lg,
  },
  promptHeader: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  promptActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  handRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  handSpacer: {
    flex: 1,
  },
  handSlot: {
    flex: 1,
    alignItems: 'center',
  },
  handEmoji: {
    fontSize: 34,
    lineHeight: 38,
  },
  promptButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  promptButtonPrimary: {
    borderWidth: 0,
  },
  promptButtonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  caption: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
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
});
