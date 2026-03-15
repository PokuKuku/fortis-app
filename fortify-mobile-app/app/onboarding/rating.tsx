import { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { RatingStars } from '@/src/components/onboarding/RatingStars';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { HAS_REQUESTED_REVIEW_DEVICE_KEY } from '@/src/constants/storageKeys';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { trackOnboardingStepCompleted } from '@/src/services/onboardingAnalyticsService';

const USERS = [
  { image: require('@/assets/onboarding/user5.png') },
  { image: require('@/assets/onboarding/user6.png') },
  { image: require('@/assets/onboarding/user7.png') },
];

export default function OnboardingRatingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [reviewRequested, setReviewRequested] = useState(false);

  const handleContinue = async () => {
    if (reviewRequested) {
      trackOnboardingStepCompleted('app_rating');
      router.push('/onboarding/notifications');
      return;
    }

    try {
      const alreadyRequested = await AsyncStorage.getItem(HAS_REQUESTED_REVIEW_DEVICE_KEY);
      const shouldRequestReview = alreadyRequested !== 'true';

      if (shouldRequestReview) {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
        }
        await AsyncStorage.setItem(HAS_REQUESTED_REVIEW_DEVICE_KEY, 'true');
      }
    } catch {
      // Best effort only.
    } finally {
      setReviewRequested(true);
    }
  };

  return (
    <OnboardingScreen
      step={16}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      hideTitle
      onBack={() => router.back()}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.xl}
      footer={
        <GlassButton style={styles.button} onPress={() => void handleContinue()} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>
            {reviewRequested ? 'Continue' : 'Next'}
          </Text>
        </GlassButton>
      }
    >
      <View style={styles.content}>
        <Text style={[styles.titleText, { color: colors.textPrimary }]}>Give us a rating</Text>

        <View style={styles.ratingCard}>
          <RatingStars size={36} gap={8} />
        </View>

        <View style={styles.socialBlock}>
          <Text style={[styles.headline, { color: colors.textPrimary }]}>
            Fortify AI was built to serve people like you.
          </Text>

          <View style={styles.avatarRow}>
            {USERS.map((user, index) => (
              <Image
                key={`user-${index}`}
                source={user.image}
                style={[
                  styles.avatar,
                  {
                    marginLeft: index === 0 ? 0 : -12,
                    borderColor: colors.background,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.socialProofText, { color: colors.textSecondary }]}>
            Join our growing user base
          </Text>
        </View>
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
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '800',
    textAlign: 'center',
  },
  ratingCard: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBlock: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialProofText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
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
