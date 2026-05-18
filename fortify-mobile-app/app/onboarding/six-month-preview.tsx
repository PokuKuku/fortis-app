import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import {
  OnboardingValueMotionPanel,
  type OnboardingValueBenefitTile,
} from '../../src/components/onboarding/OnboardingValueMotionPanel';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getOnboardingState, type OnboardingState } from '@/src/utils/onboardingState';
import {
  PROGRESS_BLOCKER_LABELS,
  getProgressBlockerInsightCopy,
} from '@/src/utils/onboardingConversion';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const OUTCOME_TILE_COPY: Record<string, OnboardingValueBenefitTile> = {
  build_visible_muscle: { emoji: '💪', value: 'See real change', label: 'Build the body you want' },
  strength_progress: { emoji: '🏋️', value: 'Feel stronger', label: 'Lift with more confidence' },
  lose_body_fat: { emoji: '🔥', value: 'Feel leaner', label: 'Train toward a body you like' },
  improve_conditioning: { emoji: '⚡', value: 'Last longer', label: 'Feel less winded day to day' },
  move_better: { emoji: '🤸', value: 'Move freely', label: 'Feel better in your body' },
  training_consistency: { emoji: '📅', value: 'Show up more', label: 'Make fitness feel automatic' },
  feel_strong_capable: { emoji: '🦾', value: 'Feel capable', label: 'Trust what your body can do' },
  body_confidence: { emoji: '✨', value: 'Feel proud', label: 'Like what you see building' },
  daily_energy: { emoji: '🔋', value: 'Have more energy', label: 'Feel better outside the gym' },
  stay_consistent_long_term: { emoji: '🎯', value: 'Stay on track', label: 'Follow through for yourself' },
  overall_health: { emoji: '🌿', value: 'Feel healthier', label: 'Build strength that lasts' },
};

const MOTIVATION_TILE_COPY: Record<string, OnboardingValueBenefitTile> = {
  self_confidence: { emoji: '😎', value: 'Walk taller', label: 'Carry confidence with you' },
  longevity: { emoji: '🌱', value: 'Stay independent', label: 'Build fitness you can keep' },
  daily_energy: { emoji: '⚡', value: 'More daily energy', label: 'Feel ready for your day' },
  strength_capability: { emoji: '💪', value: 'Feel stronger', label: 'Handle life with more ease' },
  body_confidence: { emoji: '✨', value: 'Like your body', label: 'Feel your work paying off' },
  discipline: { emoji: '🎯', value: 'Follow through', label: 'Prove you can stay with it' },
};

const BLOCKER_TILE_COPY: Record<string, OnboardingValueBenefitTile> = {
  no_plan: { emoji: '🧭', value: 'Know what to do', label: 'Walk in with confidence' },
  unclear_progress: { emoji: '📊', value: 'See it working', label: 'Know your effort is adding up' },
  plateaus: { emoji: '🚀', value: 'Get unstuck', label: 'Keep progressing when it slows' },
  time: { emoji: '⏱️', value: 'Save time', label: 'Train without wasting sessions' },
  accountability: { emoji: '🔔', value: 'Keep momentum', label: 'Stay connected to the habit' },
};

const DEFAULT_BENEFIT_TILES: OnboardingValueBenefitTile[] = [
  { emoji: '🧠', value: 'Less guessing', label: 'Know your next move' },
  { emoji: '📋', value: 'Feel prepared', label: 'Start each week with direction' },
  { emoji: '⚙️', value: 'Keep adapting', label: 'Change course before you stall' },
  { emoji: '📈', value: 'See momentum', label: 'Know your work is paying off' },
];

const FEATURE_CARD_EMOJIS = ['🧠', '🏋️', '📈'] as const;
const blockerBenefitCopy = (state: OnboardingState | null, fallback: string) => {
  switch (state?.progress_blocker) {
    case 'no_plan':
      return 'You will know exactly what to do next instead of piecing workouts together on the spot.';
    case 'unclear_progress':
      return 'You will see whether your effort is actually turning into progress, not just more logged workouts.';
    case 'plateaus':
      return 'You will get clearer next steps when the same weights stop moving, so stalls feel solvable.';
    case 'time':
      return 'You will get sessions that respect your time, so training fits your week instead of taking it over.';
    case 'accountability':
      return 'You will have a system that keeps the habit visible, so it is easier to come back and keep momentum.';
    default:
      return fallback;
  }
};

export default function OnboardingSixMonthPreviewScreen() {
  useOnboardingFunnelScreen('Q9. Six Month Preview');

  const router = useRouter();
  const { colors } = useTheme();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [typedTitle, setTypedTitle] = useState('');
  const typewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featureCardAnimations = useRef(
    Array.from({ length: 3 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(-22),
    }))
  ).current;

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

  const firstName = useMemo(() => state?.full_name?.trim().split(/\s+/)[0] ?? null, [state?.full_name]);
  const primaryOutcome = state?.fitness_outcomes?.[0] ?? state?.fitness_goal ?? 'training_consistency';
  const primaryChallenge = state?.biggest_challenges?.[0] ?? state?.biggest_challenge ?? 'consistency';
  const primaryMotivation = state?.fitness_motivations?.[0] ?? state?.fitness_motivation ?? null;
  const blockerCopy = useMemo(() => getProgressBlockerInsightCopy(state), [state]);
  const fullTitle = firstName
    ? `${firstName}, here's where we will take you...`
    : "Here's where we will take you...";
  const benefitTiles = useMemo<OnboardingValueBenefitTile[]>(() => {
    const tiles = [
      OUTCOME_TILE_COPY[primaryOutcome],
      primaryMotivation ? MOTIVATION_TILE_COPY[primaryMotivation] : null,
      state?.progress_blocker ? BLOCKER_TILE_COPY[state.progress_blocker] : null,
    ].filter((tile): tile is OnboardingValueBenefitTile => Boolean(tile));

    return [...tiles, ...DEFAULT_BENEFIT_TILES].slice(0, 4);
  }, [primaryMotivation, primaryOutcome, state?.progress_blocker]);

  useEffect(() => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }

    let isCancelled = false;
    let index = 0;
    setTypedTitle('');

    const typeNextCharacter = () => {
      if (isCancelled) return;
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));
      if (index < fullTitle.length) {
        typewriterTimeoutRef.current = setTimeout(typeNextCharacter, 24);
      }
    };

    typewriterTimeoutRef.current = setTimeout(typeNextCharacter, 120);

    return () => {
      isCancelled = true;
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
        typewriterTimeoutRef.current = null;
      }
    };
  }, [fullTitle]);

  useEffect(() => {
    featureCardAnimations.forEach(({ opacity, translateY }) => {
      opacity.setValue(0);
      translateY.setValue(-22);
    });

    Animated.stagger(
      220,
      featureCardAnimations.map(({ opacity, translateY }) => Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 560,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          mass: 0.85,
          useNativeDriver: true,
        }),
      ]))
    ).start();
  }, [featureCardAnimations]);

  const handleContinue = () => {
    trackOnboardingStepCompleted('six_month_preview', {
      primary_outcome: primaryOutcome,
      primary_challenge: primaryChallenge,
      progress_blocker: state?.progress_blocker ?? null,
    });
    router.push('/onboarding/program-name');
  };

  return (
    <OnboardingScreen
      step={17}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title={typedTitle || ' '}
      titleNumberOfLines={3}
      titleMinHeight={72}
      contentGap={Spacing.xs}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton style={styles.floatingButton} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.stack}>
        <OnboardingValueMotionPanel
          benefitTiles={benefitTiles}
        />

        <View style={styles.sectionStack}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            How we’ll get you there:
          </Text>

          <Animated.View
            style={[
              styles.featureCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder },
              {
                opacity: featureCardAnimations[0].opacity,
                transform: [{ translateY: featureCardAnimations[0].translateY }],
              },
            ]}
          >
            <View style={styles.featureCopy}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureEmoji}>{FEATURE_CARD_EMOJIS[0]}</Text>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Start with a plan that fits you.</Text>
              </View>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                Your goals, schedule, focus areas, and training setup turn into a week you can actually follow.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.featureCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder },
              {
                opacity: featureCardAnimations[1].opacity,
                transform: [{ translateY: featureCardAnimations[1].translateY }],
              },
            ]}
          >
            <View style={styles.featureCopy}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureEmoji}>{FEATURE_CARD_EMOJIS[1]}</Text>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Feel confident every session.</Text>
              </View>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                You will know what you did last time and what to do next, so each workout feels easier to start.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.featureCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder },
              {
                opacity: featureCardAnimations[2].opacity,
                transform: [{ translateY: featureCardAnimations[2].translateY }],
              },
            ]}
          >
            <View style={styles.featureCopy}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureEmoji}>{FEATURE_CARD_EMOJIS[2]}</Text>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Keep moving when progress slows.</Text>
              </View>
              <Text style={[styles.featureBody, { color: colors.textSecondary }]}>
                {blockerBenefitCopy(state, `${blockerCopy.feature} That keeps the plan focused on ${PROGRESS_BLOCKER_LABELS[state?.progress_blocker ?? 'accountability'] ?? primaryChallenge}.`)}
              </Text>
            </View>
          </Animated.View>
        </View>

      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.md,
    paddingBottom: Spacing['6xl'],
  },
  sectionStack: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  featureCard: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  featureEmoji: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureCopy: {
    width: '100%',
    gap: 3,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  floatingButton: {
    height: 54,
    borderRadius: BorderRadius.xl,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
