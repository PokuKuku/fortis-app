import type { ComponentClass } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, UIManager, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { clearOnboardingState, getOnboardingState } from '@/src/utils/onboardingState';
import { Typography } from '@/constants/Typography';

const PROGRESS_LOADING_ANIMATION = require('../../assets/lottie/progress_loading_lottie.json');

const LOADING_DURATION_MS = 5200;
const SAVING_TRANSITION_DELAY_MS = 900;
const UPDATE_TIMEOUT_MS = 5000;
const FAILSAFE_CONTINUE_MS = 14000;
const LOADING_FAILSAFE_MS = 9000;

type Phase = 'loading' | 'saving';

const isLottieViewManagerAvailable = (): boolean => {
  const getConfig = (UIManager as { getViewManagerConfig?: (name: string) => unknown }).getViewManagerConfig;
  if (typeof getConfig !== 'function') return false;
  return Boolean(getConfig('LottieAnimationView'));
};

const LottieView = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('lottie-react-native').default as ComponentClass<{
      source: unknown;
      autoPlay?: boolean;
      loop?: boolean;
      style?: unknown;
    }>;
  } catch {
    return null;
  }
})();

type LoadingStep = {
  label: string;
  completeAt: number;
};

const LOADING_STEPS: LoadingStep[] = [
  { label: 'Saving your preferences…', completeAt: 22 },
  { label: 'Building your profile…', completeAt: 54 },
  { label: 'Personalizing your insights…', completeAt: 84 },
  { label: 'Finalizing setup…', completeAt: 100 },
];

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateProfile, isAuthenticated } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const canRenderLottie = Boolean(LottieView) && isLottieViewManagerAvailable();
  const lottieRef = useRef<{ play?: () => void; reset?: () => void } | null>(null);
  const didContinueRef = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastProgressRef = useRef(-1);

  const [phase, setPhase] = useState<Phase>('loading');
  const [progressPct, setProgressPct] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const animationSize = useMemo(() => {
    return Math.min(240, Math.max(160, Math.round(Math.min(windowWidth * 0.6, windowHeight * 0.22))));
  }, [windowHeight, windowWidth]);

  const activeStepIndex = useMemo(() => {
    const index = LOADING_STEPS.findIndex((step) => progressPct < step.completeAt);
    return index === -1 ? LOADING_STEPS.length - 1 : index;
  }, [progressPct]);

  const statusLine = useMemo(() => {
    return LOADING_STEPS[Math.min(activeStepIndex, LOADING_STEPS.length - 1)]?.label ?? 'Finalizing setup…';
  }, [activeStepIndex]);

  const progressFillWidth = useMemo(() => {
    return progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });
  }, [progressAnim]);

  useFocusEffect(
    useCallback(() => {
      if (!canRenderLottie || !LottieView) return;

      const timeout = setTimeout(() => {
        lottieRef.current?.reset?.();
        lottieRef.current?.play?.();
      }, 0);

      return () => clearTimeout(timeout);
    }, [canRenderLottie])
  );

  useEffect(() => {
    if (!canRenderLottie || !LottieView) return;

    const timeout = setTimeout(() => {
      lottieRef.current?.reset?.();
      lottieRef.current?.play?.();
    }, 0);

    return () => clearTimeout(timeout);
  }, [canRenderLottie]);

  useEffect(() => {
    let isActive = true;

    const listenerId = progressAnim.addListener(({ value }) => {
      if (!isActive) return;
      const next = Math.round(value);
      if (next === lastProgressRef.current) return;
      lastProgressRef.current = next;
      setProgressPct(next);
    });

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: LOADING_DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!isActive) return;
      if (!finished) return;
      setPhase('saving');
    });

    return () => {
      isActive = false;
      progressAnim.removeListener(listenerId);
      progressAnim.stopAnimation();
    };
  }, [progressAnim]);

  useEffect(() => {
    if (phase !== 'loading') return;

    const failsafe = setTimeout(() => {
      progressAnim.stopAnimation();
      progressAnim.setValue(100);
      setProgressPct(100);
      setPhase('saving');
    }, LOADING_FAILSAFE_MS);

    return () => clearTimeout(failsafe);
  }, [phase, progressAnim]);

  const handleContinue = useCallback(async () => {
    if (didContinueRef.current) return;
    didContinueRef.current = true;

    if (!isAuthenticated) {
      router.replace({ pathname: '/auth', params: { onboarding: 'complete' } });
      return;
    }

    setIsSaving(true);
    try {
      const state = await getOnboardingState();
      const updates: Parameters<typeof updateProfile>[0] = {
        onboarding_completed: true,
      };

      if (state?.full_name?.trim()) {
        updates.full_name = state.full_name.trim();
      }
      if (state?.gender) {
        updates.gender = state.gender;
      }
      if (state?.birth_date) {
        updates.birth_date = state.birth_date;
      }
      if (typeof state?.height_cm === 'number') {
        updates.height_cm = state.height_cm;
      }
      if (typeof state?.weight_kg === 'number') {
        updates.weight_kg = state.weight_kg;
      }
      if (state?.preferred_units) {
        updates.preferred_units = state.preferred_units;
      }
      if (state?.lifting_experience) {
        updates.lifting_experience = state.lifting_experience;
      }
      if (state?.tried_other_apps) {
        updates.tried_other_apps = state.tried_other_apps;
      }
      const resolvedGoal = state?.fitness_goal ?? state?.fitness_goals?.[state.fitness_goals.length - 1];
      if (resolvedGoal) {
        updates.fitness_goal = resolvedGoal;
      }
      const resolvedChallenge =
        state?.biggest_challenge ??
        state?.biggest_challenges?.[state.biggest_challenges.length - 1];
      if (resolvedChallenge) {
        updates.biggest_challenge = resolvedChallenge;
      }
      if (state?.workout_consistency) {
        updates.workout_consistency = state.workout_consistency;
      }

      let didTimeout = false;
      const timeoutResult = new Promise<{ error: Error | null }>((resolve) => {
        setTimeout(() => {
          didTimeout = true;
          resolve({ error: new Error('Update timeout') });
        }, UPDATE_TIMEOUT_MS);
      });

      const { error } = await Promise.race([updateProfile(updates), timeoutResult]);
      if (!error && !didTimeout) {
        await clearOnboardingState();
      }
    } finally {
      setIsSaving(false);
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router, updateProfile]);

  useEffect(() => {
    if (phase !== 'saving') return;

    const continueTimer = setTimeout(() => {
      void handleContinue();
    }, SAVING_TRANSITION_DELAY_MS);

    const failsafe = setTimeout(() => {
      void handleContinue();
    }, FAILSAFE_CONTINUE_MS);

    return () => {
      clearTimeout(continueTimer);
      clearTimeout(failsafe);
    };
  }, [handleContinue, phase]);

  const renderLoadingRow = (step: LoadingStep, index: number) => {
    const completed = progressPct >= step.completeAt;
    const active = !completed && index === activeStepIndex;

    return (
      <View key={step.label} style={styles.loadingRow}>
        <View
          style={[
            styles.loadingIndicator,
            {
              borderColor: colors.glassBorder,
              backgroundColor: completed ? colors.accentOverlay : colors.glassBackground,
            },
          ]}
        >
          {completed ? (
            <CheckIcon size={14} color={colors.accent} />
          ) : (
            <View
              style={[
                styles.loadingDot,
                { backgroundColor: active ? colors.accent : colors.textTertiary },
              ]}
            />
          )}
        </View>
        <Text style={[styles.loadingLabel, { color: completed ? colors.textPrimary : colors.textSecondary }]}>
          {step.label}
        </Text>
      </View>
    );
  };

  return (
    <OnboardingScreen
      step={TOTAL_ONBOARDING_STEPS}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title=""
      subtitle={undefined}
      hideTitle
      onBack={() => router.back()}
      useScrollView={false}
      bodyAlign="center"
      contentGap={Spacing.lg}
    >
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={[styles.percentText, { color: colors.textPrimary }]}>
            {phase === 'loading' ? `${progressPct}%` : '100%'}
          </Text>
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>
            We’re setting everything up for you
          </Text>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {phase === 'loading' ? statusLine : isSaving ? 'Saving your setup…' : 'Finishing up…'}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent, width: progressFillWidth }]} />
          </View>
        </View>

        <View style={styles.animationWrap}>
          {canRenderLottie && LottieView ? (
            <LottieView
              source={PROGRESS_LOADING_ANIMATION}
              autoPlay={false}
              loop={phase === 'loading'}
              ref={lottieRef as unknown as never}
              style={{ width: animationSize, height: animationSize }}
            />
          ) : (
            <View
              style={[
                styles.fallbackCard,
                { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground },
              ]}
            >
              <Text style={[styles.fallbackText, { color: colors.textTertiary }]}>
                Animation unavailable in this build.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.stepsBlock}>
          {LOADING_STEPS.map(renderLoadingRow)}
        </View>

        <View style={styles.trustBlock}>
          <Text style={[styles.trustTitle, { color: colors.textPrimary }]}>
            Trusted by lifters
          </Text>
          <View style={[styles.trustCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBackground }]}>
            <Text style={[styles.trustHandle, { color: colors.textPrimary }]}>@fortisuser</Text>
            <Text style={[styles.trustBody, { color: colors.textSecondary }]}>
              “It’s the first app that makes my training data feel actionable.”
            </Text>
          </View>
        </View>

        {phase === 'saving' ? (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.savingText, { color: colors.textSecondary }]}>
              {isAuthenticated ? 'Opening Fortis…' : 'Starting signup…'}
            </Text>
          </View>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  headerBlock: {
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  percentText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 38,
    letterSpacing: 0.4,
  },
  titleText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    letterSpacing: 0.2,
  },
  statusText: {
    ...Typography.bodyLarge,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  animationWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 13,
    textAlign: 'center',
  },
  stepsBlock: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingLabel: {
    ...Typography.bodyLarge,
    flexShrink: 1,
  },
  trustBlock: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing['2xl'],
  },
  trustTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  trustCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  trustHandle: {
    fontWeight: '700',
  },
  trustBody: {
    ...Typography.bodyLarge,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  savingText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
});
