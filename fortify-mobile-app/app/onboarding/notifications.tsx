import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { BellAlertIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { HAS_REQUESTED_NOTIFICATIONS_KEY } from '@/src/constants/storageKeys';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

export default function OnboardingNotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const hasTrackedRef = useRef(false);

  const markStepComplete = () => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackOnboardingStepCompleted('notifications_prompt');
  };

  const finish = () => {
    markStepComplete();
    router.push('/onboarding/complete');
  };

  const handleAllow = async () => {
    markStepComplete();

    try {
      const alreadyRequested = await getScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY);
      if (alreadyRequested !== 'true') {
        if (typeof Notifications.getPermissionsAsync === 'function') {
          const { status, granted, canAskAgain } = await Notifications.getPermissionsAsync();
          if (!granted && status !== 'granted' && canAskAgain) {
            if (typeof Notifications.requestPermissionsAsync === 'function') {
              await Notifications.requestPermissionsAsync();
            }
          }
        }
        await setScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
      }
    } catch {
      // Best effort only.
    } finally {
      router.push('/onboarding/complete');
    }
  };

  const handleDontAllow = async () => {
    markStepComplete();

    try {
      await setScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
    } catch {
      // Best effort only.
    } finally {
      router.push('/onboarding/complete');
    }
  };

  return (
    <OnboardingScreen
      step={17}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      hideTitle
      onBack={() => router.back()}
      useScrollView
      scrollEnabled
      bodyAlign="center"
      contentGap={Spacing.xl}
      footer={
        <GlassButton style={styles.button} onPress={finish} hapticFeedback="impactMedium">
          <Text allowFontScaling={false} style={[styles.buttonText, { color: colors.white }]}>
            Next
          </Text>
        </GlassButton>
      }
    >
      <View style={styles.content}>
        <Text allowFontScaling={false} style={[styles.titleText, { color: colors.textPrimary }]}>
          Allow notifications{'\n'}to reach your goals.
        </Text>

        <GlassCard
          padding={Spacing.xl}
          style={[styles.promptCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder }]}
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
              <Text allowFontScaling={false} style={[styles.promptButtonText, { color: colors.white }]}>
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
          Notifications help Fortify keep you on track.
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
