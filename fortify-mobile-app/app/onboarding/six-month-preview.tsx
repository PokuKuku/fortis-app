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
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const RAIL_STEPS = [
  {
    label: 'Track',
    body: 'Log reps, weight, and sets so your progression is visible.',
    emoji: '📝',
  },
  {
    label: 'AI trainer',
    body: 'Your personal AI trainer pulls relevant insights on your lifting trends and offers adjustments.',
    emoji: '🤖',
  },
  {
    label: 'Progress',
    body: 'Fortify proactively suggests what to push next session based on each exercise.',
    emoji: '🎯',
  },
] as const;

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
  const primaryOutcome = state?.fitness_outcomes?.[0] ?? null;
  const primaryChallenge = state?.biggest_challenges?.[0] ?? state?.biggest_challenge ?? 'consistency';
  const fullTitle = firstName
    ? `${firstName}, here's where you will be in just over 2 months...`
    : "Here's where you will be in just over 2 months...";
  const benefitTiles = useMemo<OnboardingValueBenefitTile[]>(() => {
    return [
      {
        value: '31%-33%+ increase in strength',
      },
      {
        value: '10%-11%+ increase in muscle size',
      },
      {
        value: 'Enhanced metabolic health',
      },
    ];
  }, []);

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
    router.push('/onboarding/coach-personality');
  };

  return (
    <OnboardingScreen
      step={17}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title={typedTitle || ' '}
      titleFontSize={22}
      titleNumberOfLines={3}
      titleAdjustsFontSizeToFit
      titleMinimumFontScale={0.76}
      titleMinHeight={72}
      contentGap={Spacing.xs}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton style={styles.floatingButton} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
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

          <View
            style={[
              styles.rail,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.glassBorder },
            ]}
          >
            {RAIL_STEPS.map(({ label, body, emoji }, index) => (
              <Animated.View
                key={label}
                style={[
                  styles.railStep,
                  index < RAIL_STEPS.length - 1 && {
                    borderBottomColor: colors.glassBorder,
                    borderBottomWidth: 1,
                  },
                  {
                    opacity: featureCardAnimations[index].opacity,
                    transform: [{ translateY: featureCardAnimations[index].translateY }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.railIcon,
                    { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
                  ]}
                >
                  <Text style={styles.railEmoji}>{emoji}</Text>
                </View>
                <View style={styles.railCopy}>
                  <Text style={[styles.railTitle, { color: colors.textPrimary }]}>
                    {label}
                  </Text>
                  <Text style={[styles.railBody, { color: colors.textSecondary }]}>
                    {body}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
          <Text style={[styles.citationHeader, { color: colors.textSecondary }]}>
            The science behind the results
          </Text>
          <Text style={[styles.citationText, { color: colors.textTertiary }]}>
            Chaves, T. S., Scarpelli, M. C., Bergamasco, J. G. A., da Silva, D. G., Medalha Junior, R. A., Dias, N. F., Bittencourt, D., Carello Filho, P. C., Angleri, V., Nóbrega, S. R., Roberts, M. D., Ugrinowitsch, C., & Libardi, C. A. (2024). Effects of resistance training overload progression protocols on strength and muscle mass. International Journal of Sports Medicine, 45, 504–510. https://doi.org/10.1055/a-2256-5857
          </Text>
        </View>

      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.md,
  },
  sectionStack: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  rail: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  railStep: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  railIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railEmoji: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  railCopy: {
    flex: 1,
    gap: 2,
  },
  railTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  railBody: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  citationHeader: {
    marginTop: Spacing.xs,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  citationText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
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
