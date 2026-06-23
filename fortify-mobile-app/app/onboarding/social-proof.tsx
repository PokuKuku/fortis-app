import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckBadgeIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { RatingStars } from '@/src/components/onboarding/RatingStars';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { getOnboardingState, type OnboardingState } from '@/src/utils/onboardingState';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const TESTIMONIALS = [
  {
    initials: 'J1',
    name: 'Jaycee1077',
    color: '#9B7AD6',
    title: 'Favorite workout app',
    body: 'This app made tracking so much easier for me. The insights are genuinely helpful and the AI trainer is an amazing addition. 100% recommend for anyone who lifts.',
  },
  {
    initials: 'M8',
    name: 'Markus836',
    color: '#4F9DD9',
    title: 'Voice coach is very unique!',
    body: 'I love the voice coach in this app. There is so much customizability to it and it’s made my fitness routine more enjoyable!',
  },
  {
    initials: 'K1',
    name: 'Kaitlin1313',
    color: '#F29AB7',
    title: 'This app is amazing!!!',
    body: 'Had my wedding coming up this April, this app helps me tone up and look amazing in my wedding dress. I have recommended this app to all of my friends and family. So helpful, informational, and has improved my overall health and physique!',
  },
  {
    initials: 'KB',
    name: 'KB',
    color: '#71C95A',
    image: require('../../assets/onboarding/kwaku_review4.png'),
    title: 'Took my progress to the next level!',
    body: 'I wanted to build a better physique and this app helped me stay consistent enough to finally see it happen. I feel stronger, have more confidence, and I’m in the best shape I’ve ever been!',
  },
  {
    initials: 'C5',
    name: 'clmt5',
    color: '#7F8AA3',
    title: 'Best workout tracker!',
    body: 'Simple to use and yet the most comprehensive workout tracker with AI integration out there. I highly recommend this app for your gym workout tracking!',
  },
  {
    initials: 'D',
    name: 'Discolight',
    color: '#E3A348',
    title: 'Beginnings',
    body: 'It’s a very good tool for beginners, trust me you won’t regret using it 🤞',
  },
  {
    initials: 'B2',
    name: 'BodyBuilder2000$',
    color: '#62B7A4',
    title: 'Nice App',
    body: 'Helped me build muscle and stop bad habits',
  },
  {
    initials: 'JJ',
    name: 'Jette Jennrich',
    color: '#D78AB0',
    title: 'gute app',
    body: 'sehr gute app 👍👍',
  },
];

const JAYCEE_REVIEW = TESTIMONIALS[0];
const MARKUS_REVIEW = TESTIMONIALS[1];
const KAITLIN_REVIEW = TESTIMONIALS[2];
const KWAKU_REVIEW = TESTIMONIALS[3];
const CLMT5_REVIEW = TESTIMONIALS[4];
const DISCOLIGHT_REVIEW = TESTIMONIALS[5];
const BODYBUILDER_REVIEW = TESTIMONIALS[6];
const JETTE_REVIEW = TESTIMONIALS[7];

export default function OnboardingSocialProofScreen() {
  useOnboardingFunnelScreen('Social Proof page');

  const router = useRouter();
  const { colors } = useTheme();
  const [state, setState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const nextState = await getOnboardingState();
      if (isActive) setState(nextState);
    };

    void loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const testimonials = useMemo(() => {
    const primaryGoal = state?.fitness_goals?.[0] ?? state?.fitness_goal;
    const primaryChallenge = state?.biggest_challenges?.[0] ?? state?.biggest_challenge;
    if (primaryChallenge === 'plateaus' || state?.progress_blocker === 'unclear_progress') {
      return [CLMT5_REVIEW, JAYCEE_REVIEW, KWAKU_REVIEW, MARKUS_REVIEW, KAITLIN_REVIEW, DISCOLIGHT_REVIEW, BODYBUILDER_REVIEW, JETTE_REVIEW];
    }
    if (primaryGoal === 'build_muscle' || primaryGoal === 'lose_fat' || primaryGoal === 'improve_strength') {
      return [KWAKU_REVIEW, CLMT5_REVIEW, JAYCEE_REVIEW, MARKUS_REVIEW, KAITLIN_REVIEW, DISCOLIGHT_REVIEW, BODYBUILDER_REVIEW, JETTE_REVIEW];
    }
    return [JAYCEE_REVIEW, MARKUS_REVIEW, KAITLIN_REVIEW, KWAKU_REVIEW, CLMT5_REVIEW, DISCOLIGHT_REVIEW, BODYBUILDER_REVIEW, JETTE_REVIEW];
  }, [state]);

  const caption = useMemo(() => {
    if (state?.progress_blocker === 'unclear_progress' || state?.biggest_challenge === 'plateaus') {
      return 'Proof from people who wanted clearer progress.';
    }
    if (state?.biggest_challenge === 'consistency' || state?.progress_blocker === 'accountability') {
      return 'Proof from people building a stronger routine.';
    }
    return "We're loved by our users!";
  }, [state]);

  const handleContinue = () => {
    trackOnboardingStepCompleted('social_proof');
    router.push('/onboarding/rating');
  };

  return (
    <OnboardingScreen
      step={25}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      hideTitle
      onBack={() => router.back()}
      useScrollView
      scrollEnabled
      bodyAlign="top"
      contentGap={Spacing.lg}
      floatingFooter={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.content}>
        <View style={styles.ratingBlock}>
          <Image
            source={require('../../assets/onboarding/laurel3.png')}
            style={styles.laurelImage}
            resizeMode="contain"
          />
          <Text style={[styles.ratingCaption, { color: colors.textSecondary }]}>
            {caption}
          </Text>
        </View>

        <View style={styles.cards}>
          {testimonials.map((item) => (
            <View
              key={item.name}
              style={styles.cardShell}
            >
              <View style={[styles.cardBottomShadow, { backgroundColor: colors.accentShadow }]} pointerEvents="none" />
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                {item.image ? (
                  <Image source={item.image} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: item.color }]}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                )}

                <View style={styles.cardCopy}>
                  <View style={styles.cardHeader}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.nameText, { color: colors.textPrimary }]}>{item.name}</Text>
                      <CheckBadgeIcon size={16} color="#0095f6" />
                    </View>
                    <RatingStars size={14} gap={2} />
                  </View>
                  <Text style={[styles.titleText, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{item.body}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: Spacing.xl,
    justifyContent: 'center',
  },
  ratingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: -12,
  },
  laurelImage: {
    width: '100%',
    maxWidth: 420,
    height: 188,
  },
  ratingCaption: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginTop: -60,
  },
  cards: {
    gap: Spacing.md,
  },
  cardShell: {
    position: 'relative',
    borderRadius: BorderRadius.xl,
  },
  cardBottomShadow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -5,
    height: 10,
    borderRadius: 999,
    opacity: 0.22,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 2,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  bodyText: {
    ...Typography.body,
    lineHeight: 22,
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
