import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckIcon } from 'react-native-heroicons/solid';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { clearOnboardingState, getOnboardingState, type OnboardingState } from '@/src/utils/onboardingState';
import { Typography } from '@/constants/Typography';
import { trackOnboardingFinished } from '@/src/services/onboardingAnalyticsService';

const LOADING_DURATION_MS = 13000;
const AUTHENTICATED_AUTO_CONTINUE_DELAY_MS = 900;
const UPDATE_TIMEOUT_MS = 5000;
const LOADING_FAILSAFE_MS = LOADING_DURATION_MS + 1000;
const TYPEWRITER_INTERVAL_MS = 36;
const LOADING_TITLE_TYPEWRITER_MS = 50;
const TYPEWRITER_HAPTIC_EVERY_N_CHARS = 3;
const NUMBER_HAPTIC_STEP_PCT = 5;

type Phase = 'loading' | 'ready';

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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const triggerTypewriterHaptic = (index: number, text: string) => {
  const currentChar = text.charAt(index - 1);
  if (currentChar.trim().length === 0) return;

  if (index === text.length) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return;
  }

  if (index % TYPEWRITER_HAPTIC_EVERY_N_CHARS === 0) {
    void Haptics.selectionAsync();
  }
};

type SummaryItem = {
  label: string;
  value: string;
};

const FITNESS_GOAL_LABELS: Record<string, string> = {
  build_muscle: 'Build muscle',
  general_health: 'General health and fitness',
  lose_fat: 'Lose fat',
  improve_strength: 'Improve strength',
  stay_consistent: 'Stay consistent',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  none: 'Currently not lifting',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const CONSISTENCY_LABELS: Record<string, string> = {
  none: 'Currently not working out',
  once_or_less: '1–3 times a week',
  few_times_week: '4–6 times a week',
  daily: 'Daily',
  starting: 'Just starting out',
};

const CHALLENGE_LABELS: Record<string, string> = {
  consistency: 'Consistency',
  plateaus: 'Plateaus',
  starting_out: 'Starting out',
  time: 'Time',
};

const UNIT_LABELS: Record<string, string> = {
  imperial: 'Imperial (lb, in)',
  metric: 'Metric (kg, cm)',
};

const OTHER_APP_LABELS: Record<string, string> = {
  consistent: 'Tried others consistently',
  occasionally: 'Tried others occasionally',
  stopped: 'Tried others, but stopped',
  never: 'Never tried others',
};

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { updateProfile, isAuthenticated, profile } = useAuth();
  const didContinueRef = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const stepsAnim = useRef(new Animated.Value(1)).current;
  const lastProgressRef = useRef(-1);
  const lastHapticStepRef = useRef(0);
  const lastNumberHapticBucketRef = useRef(0);
  const returnedFromAuthRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('loading');
  const [progressPct, setProgressPct] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [showSteps, setShowSteps] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [typedStatusLine, setTypedStatusLine] = useState('');
  const [typedLoadingTitle, setTypedLoadingTitle] = useState('');
  const [typedReadyTitle, setTypedReadyTitle] = useState('');
  const [typedReadySubtitle, setTypedReadySubtitle] = useState('');
  const typewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTypewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTypeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didTypeLoadingTitleRef = useRef(false);

  const activeStepIndex = useMemo(() => {
    const index = LOADING_STEPS.findIndex((step) => progressPct < step.completeAt);
    return index === -1 ? LOADING_STEPS.length - 1 : index;
  }, [progressPct]);

  const statusLine = useMemo(() => {
    return LOADING_STEPS[Math.min(activeStepIndex, LOADING_STEPS.length - 1)]?.label ?? 'Finalizing setup…';
  }, [activeStepIndex]);

  const loadingTitleLine = 'We’re setting everything up for you';
  const readyTitleLine = 'You’re ready to go';
  const readySubtitleLine = isSaving
    ? 'Starting…'
    : isAuthenticated
      ? 'Finishing up…'
      : 'Fortis AI is customized for you.';

  useEffect(() => {
    if (statusTypewriterTimeoutRef.current) {
      clearTimeout(statusTypewriterTimeoutRef.current);
      statusTypewriterTimeoutRef.current = null;
    }

    if (phase !== 'loading') {
      setTypedStatusLine(statusLine);
      return;
    }

    let isCancelled = false;
    setTypedStatusLine('');
    let index = 0;

    const typeStatus = () => {
      if (isCancelled) return;
      index += 1;
      setTypedStatusLine(statusLine.slice(0, index));
      triggerTypewriterHaptic(index, statusLine);
      if (index < statusLine.length) {
        statusTypewriterTimeoutRef.current = setTimeout(typeStatus, TYPEWRITER_INTERVAL_MS);
      }
    };

    statusTypewriterTimeoutRef.current = setTimeout(typeStatus, TYPEWRITER_INTERVAL_MS);

    return () => {
      isCancelled = true;
      if (statusTypewriterTimeoutRef.current) {
        clearTimeout(statusTypewriterTimeoutRef.current);
        statusTypewriterTimeoutRef.current = null;
      }
    };
  }, [phase, statusLine]);

  useEffect(() => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }

    if (phase !== 'loading') {
      setTypedLoadingTitle(loadingTitleLine);
      return;
    }

    if (didTypeLoadingTitleRef.current) {
      setTypedLoadingTitle(loadingTitleLine);
      return;
    }

    let isCancelled = false;
    setTypedLoadingTitle('');
    let titleIndex = 0;

    const typeTitle = () => {
      if (isCancelled) return;
      titleIndex += 1;
      setTypedLoadingTitle(loadingTitleLine.slice(0, titleIndex));
      triggerTypewriterHaptic(titleIndex, loadingTitleLine);
      if (titleIndex < loadingTitleLine.length) {
        typewriterTimeoutRef.current = setTimeout(typeTitle, LOADING_TITLE_TYPEWRITER_MS);
      } else {
        didTypeLoadingTitleRef.current = true;
      }
    };

    typewriterTimeoutRef.current = setTimeout(typeTitle, LOADING_TITLE_TYPEWRITER_MS);

    return () => {
      isCancelled = true;
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
        typewriterTimeoutRef.current = null;
      }
    };
  }, [phase, loadingTitleLine]);

  useEffect(() => {
    if (readyTypeTimeoutRef.current) {
      clearTimeout(readyTypeTimeoutRef.current);
      readyTypeTimeoutRef.current = null;
    }

    if (phase !== 'ready') {
      setTypedReadyTitle(readyTitleLine);
      setTypedReadySubtitle(readySubtitleLine);
      return;
    }

    let isCancelled = false;
    let titleIndex = 0;
    let subtitleIndex = 0;
    setTypedReadyTitle('');
    setTypedReadySubtitle('');

    const typeSubtitle = () => {
      if (isCancelled) return;
      subtitleIndex += 1;
      setTypedReadySubtitle(readySubtitleLine.slice(0, subtitleIndex));
      triggerTypewriterHaptic(subtitleIndex, readySubtitleLine);
      if (subtitleIndex < readySubtitleLine.length) {
        readyTypeTimeoutRef.current = setTimeout(typeSubtitle, TYPEWRITER_INTERVAL_MS);
      }
    };

    const typeTitle = () => {
      if (isCancelled) return;
      titleIndex += 1;
      setTypedReadyTitle(readyTitleLine.slice(0, titleIndex));
      triggerTypewriterHaptic(titleIndex, readyTitleLine);
      if (titleIndex < readyTitleLine.length) {
        readyTypeTimeoutRef.current = setTimeout(typeTitle, TYPEWRITER_INTERVAL_MS);
        return;
      }
      readyTypeTimeoutRef.current = setTimeout(typeSubtitle, TYPEWRITER_INTERVAL_MS);
    };

    readyTypeTimeoutRef.current = setTimeout(typeTitle, TYPEWRITER_INTERVAL_MS);

    return () => {
      isCancelled = true;
      if (readyTypeTimeoutRef.current) {
        clearTimeout(readyTypeTimeoutRef.current);
        readyTypeTimeoutRef.current = null;
      }
    };
  }, [phase, readySubtitleLine, readyTitleLine]);

  const summaryName = useMemo(() => {
    const name = onboardingState?.full_name?.trim();
    if (!name) return null;
    if (name.endsWith('s') || name.endsWith('S')) {
      return `${name}' training profile`;
    }
    return `${name}'s training profile`;
  }, [onboardingState?.full_name]);

  const summaryItems = useMemo<SummaryItem[]>(() => {
    if (!onboardingState) return [];
    const goalFromList = onboardingState.fitness_goals?.length
      ? onboardingState.fitness_goals[0]
      : undefined;
    const resolvedGoal = onboardingState.fitness_goal ?? goalFromList;
    const challengeFromList = onboardingState.biggest_challenges?.length
      ? onboardingState.biggest_challenges[0]
      : undefined;
    const resolvedChallenge = onboardingState.biggest_challenge ?? challengeFromList;
    const items: SummaryItem[] = [];

    if (resolvedGoal) {
      items.push({ label: 'Goal', value: FITNESS_GOAL_LABELS[resolvedGoal] ?? resolvedGoal });
    }
    if (onboardingState.lifting_experience) {
      items.push({
        label: 'Experience',
        value: EXPERIENCE_LABELS[onboardingState.lifting_experience] ?? onboardingState.lifting_experience,
      });
    }
    if (onboardingState.workout_consistency) {
      items.push({
        label: 'Consistency',
        value: CONSISTENCY_LABELS[onboardingState.workout_consistency] ?? onboardingState.workout_consistency,
      });
    }
    if (resolvedChallenge) {
      items.push({
        label: 'Challenge',
        value: CHALLENGE_LABELS[resolvedChallenge] ?? resolvedChallenge,
      });
    }
    if (onboardingState.preferred_units) {
      items.push({
        label: 'Units',
        value: UNIT_LABELS[onboardingState.preferred_units] ?? onboardingState.preferred_units,
      });
    }
    if (onboardingState.tried_other_apps) {
      items.push({
        label: 'Other apps',
        value: OTHER_APP_LABELS[onboardingState.tried_other_apps] ?? onboardingState.tried_other_apps,
      });
    }

    return items.slice(0, 4);
  }, [onboardingState]);

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
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!isActive) return;
      if (!finished) return;
      setPhase('ready');
    });

    return () => {
      isActive = false;
      progressAnim.removeListener(listenerId);
      progressAnim.stopAnimation();
    };
  }, [progressAnim]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        didContinueRef.current = false;
        setIsSaving(false);
        if (returnedFromAuthRef.current && phase === 'ready') {
          setShowSummary(true);
          setShowSteps(false);
          stepsAnim.setValue(0);
          summaryAnim.setValue(1);
        }
      }
    }, [isAuthenticated, phase, stepsAnim, summaryAnim])
  );

  useEffect(() => {
    if (phase !== 'loading') return;
    const completedCount = LOADING_STEPS.filter((step) => progressPct >= step.completeAt).length;
    if (completedCount <= lastHapticStepRef.current) return;
    lastHapticStepRef.current = completedCount;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [phase, progressPct]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const bucket = Math.floor(progressPct / NUMBER_HAPTIC_STEP_PCT);
    if (bucket <= lastNumberHapticBucketRef.current) return;
    lastNumberHapticBucketRef.current = bucket;
    if (bucket === 0) return;
    void Haptics.selectionAsync();
  }, [phase, progressPct]);

  useEffect(() => {
    if (phase === 'loading') {
      setShowSteps(true);
      setShowSummary(false);
      stepsAnim.setValue(1);
      summaryAnim.setValue(0);
      return;
    }

    Animated.timing(stepsAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowSteps(false);
        setShowSummary(true);
        Animated.timing(summaryAnim, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [phase, stepsAnim, summaryAnim]);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      setOnboardingState(state);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    const failsafe = setTimeout(() => {
      progressAnim.stopAnimation();
      progressAnim.setValue(100);
      setProgressPct(100);
      setPhase('ready');
    }, LOADING_FAILSAFE_MS);

    return () => clearTimeout(failsafe);
  }, [phase, progressAnim]);

  const handleContinue = useCallback(async () => {
    if (didContinueRef.current) return;
    didContinueRef.current = true;

    if (!isAuthenticated) {
      returnedFromAuthRef.current = true;
      router.push({ pathname: '/auth', params: { onboarding: 'complete' } });
      return;
    }

    setIsSaving(true);
    if (phase === 'ready') {
      await new Promise<void>((resolve) => {
        Animated.timing(summaryAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => resolve());
      });
    }
    try {
      const state = await getOnboardingState();
      const shouldSetNumber = (value: number | null | undefined) => typeof value !== 'number' || Number.isNaN(value);

      const updates: Parameters<typeof updateProfile>[0] = {
        onboarding_completed: true,
        avatar_url: null,
        has_seen_in_app_tour: false,
        in_app_tour_completed_at: null,
        in_app_tour_version: 0,
      };

      if (typeof state?.full_name === 'string') {
        updates.full_name = state.full_name.trim() || null;
      }
      if (state?.gender && !profile?.gender) {
        updates.gender = state.gender;
      }
      if (state?.birth_date && !profile?.birth_date) {
        updates.birth_date = state.birth_date;
      }
      if (typeof state?.height_cm === 'number' && shouldSetNumber(profile?.height_cm)) {
        updates.height_cm = state.height_cm;
      }
      if (typeof state?.weight_kg === 'number' && shouldSetNumber(profile?.weight_kg)) {
        updates.weight_kg = state.weight_kg;
      }
      if (state?.preferred_units && !profile?.preferred_units) {
        updates.preferred_units = state.preferred_units;
      }
      if (state?.lifting_experience && !profile?.lifting_experience) {
        updates.lifting_experience = state.lifting_experience;
      }
      if (state?.tried_other_apps && !profile?.tried_other_apps) {
        updates.tried_other_apps = state.tried_other_apps;
      }
      const resolvedGoal = state?.fitness_goal ?? state?.fitness_goals?.[0];
      if (resolvedGoal && !profile?.fitness_goal) {
        updates.fitness_goal = resolvedGoal;
      }
      const resolvedChallenge =
        state?.biggest_challenge ??
        state?.biggest_challenges?.[0];
      if (resolvedChallenge && !profile?.biggest_challenge) {
        updates.biggest_challenge = resolvedChallenge;
      }
      if (state?.workout_consistency && !profile?.workout_consistency) {
        updates.workout_consistency = state.workout_consistency;
      }

      let didTimeout = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeoutResult = new Promise<{ error: Error | null }>((resolve) => {
        timeoutId = setTimeout(() => {
          didTimeout = true;
          resolve({ error: new Error('Update timeout') });
        }, UPDATE_TIMEOUT_MS);
      });

      const { error } = await Promise.race([updateProfile(updates), timeoutResult]);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error || didTimeout) {
        didContinueRef.current = false;
        return;
      }

      trackOnboardingFinished();
      try {
        await clearOnboardingState();
      } catch (clearError) {
        console.warn('[Onboarding] Failed to clear local onboarding state:', clearError);
      }
      router.replace('/paywall-gate');
    } catch (error) {
      console.warn('[Onboarding] Failed to finalize onboarding:', error);
      didContinueRef.current = false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, phase, profile, router, summaryAnim, updateProfile]);

  useEffect(() => {
    if (phase !== 'ready') return;
    if (!isAuthenticated) return;

    const continueTimer = setTimeout(() => {
      void handleContinue();
    }, AUTHENTICATED_AUTO_CONTINUE_DELAY_MS);

    return () => {
      clearTimeout(continueTimer);
    };
  }, [handleContinue, isAuthenticated, phase]);

  const renderLoadingRow = (step: LoadingStep, index: number) => {
    const currentPct = phase === 'loading' ? progressPct : 100;
    const stepStart = index === 0 ? 0 : LOADING_STEPS[index - 1]?.completeAt ?? 0;
    const stepEnd = step.completeAt;
    const denom = Math.max(1, stepEnd - stepStart);
    const stepProgress = clamp01((currentPct - stepStart) / denom);
    const completed = stepProgress >= 1;
    const active = !completed && index === activeStepIndex;
    const stepFillPct = `${Math.round(stepProgress * 100)}%`;

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
        <View style={styles.loadingBody}>
          <Text style={[styles.loadingLabel, { color: completed ? colors.textPrimary : colors.textSecondary }]}>
            {step.label}
          </Text>
          <View
            style={[
              styles.stepTrack,
              { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
            ]}
          >
            <View
              style={[
                styles.stepFill,
                {
                  width: stepFillPct,
                  backgroundColor: colors.accent,
                  opacity: completed ? 1 : 0.9,
                },
              ]}
            />
          </View>
        </View>
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
      useScrollView
      scrollEnabled
      bodyAlign="center"
      contentGap={Spacing.lg}
      footer={
        phase === 'ready' && !isAuthenticated ? (
          <GlassButton
            style={styles.continueButton}
            onPress={() => void handleContinue()}
            disabled={isSaving}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.continueButtonText, { color: colors.white }]}>
              {isSaving ? 'Starting…' : "I'm ready!"}
            </Text>
          </GlassButton>
        ) : undefined
      }
    >
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={[styles.percentText, { color: colors.textPrimary }]}>
            {phase === 'loading' ? `${progressPct}%` : '100%'}
          </Text>
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>
            {phase === 'loading' ? typedLoadingTitle : typedReadyTitle}
          </Text>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {phase === 'loading'
              ? typedStatusLine
              : isSaving
                ? typedReadySubtitle
                : isAuthenticated
                  ? typedReadySubtitle
                  : typedReadySubtitle}
          </Text>
        </View>

        {showSummary ? (
          <Animated.View
            style={{
              opacity: summaryAnim,
            }}
          >
            <LinearGradient
              colors={[colors.surfaceElevated, colors.glassBackground, colors.surfaceElevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.summaryCard, { borderColor: colors.glassBorder }]}
            >
              <View
                style={[
                  styles.summaryGlow,
                  { backgroundColor: colors.accent, opacity: isDark ? 0.18 : 0.12 },
                ]}
              />
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryBrand, { color: colors.accent }]}>FORTIS</Text>
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: colors.accentOverlay, borderColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.summaryBadgeText, { color: colors.accent }]}>
                    Setup recap
                  </Text>
                </View>
              </View>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                {summaryName ?? 'Your training profile'}
              </Text>
            {summaryItems.length > 0 ? (
              <View style={styles.summaryGrid}>
                  {summaryItems.map((item) => (
                    <View
                      key={item.label}
                      style={[
                        styles.summaryTile,
                        { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
                      ]}
                    >
                    <Text style={[styles.summaryLabel, { color: colors.textPrimary }]}>
                      {item.label}
                    </Text>
                      <Text
                        style={[styles.summaryValue, { color: colors.textPrimary }]}
                        numberOfLines={2}
                      >
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.summaryLoading}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={[styles.summaryLoadingText, { color: colors.textSecondary }]}>
                    Gathering your setup…
                  </Text>
                </View>
              )}
            <View style={styles.summaryFooter}>
              <Text style={[styles.summaryHandle, { color: colors.textTertiary }]}>
                fortis.app
              </Text>
            </View>
          </LinearGradient>
          <Text style={[styles.summaryNote, { color: colors.textPrimary }]}>
            You can edit your information at any time.
          </Text>
        </Animated.View>
      ) : null}

        {showSteps ? (
          <Animated.View
            style={[
              styles.stepsBlock,
              {
                opacity: stepsAnim,
              },
            ]}
          >
            {LOADING_STEPS.map(renderLoadingRow)}
          </Animated.View>
        ) : null}

      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    gap: Spacing['2xl'],
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
    alignSelf: 'center',
  },
  titleText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  statusText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
  stepsBlock: {
    width: '100%',
    gap: Spacing.sm,
  },
  summaryCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  summaryGlow: {
    position: 'absolute',
    top: -36,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  summaryBrand: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 2,
    fontSize: 12,
  },
  summaryBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    ...Typography.h3,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 20,
  },
  summarySubtitle: {
    ...Typography.bodySmall,
  },
  summaryNote: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  summaryTile: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    ...Typography.bodyLarge,
    fontSize: 15,
  },
  summaryLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  summaryLoadingText: {
    ...Typography.bodySmall,
  },
  summaryFooter: {
    marginTop: Spacing.xs,
  },
  summaryHandle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingBody: {
    flex: 1,
    gap: Spacing.xs,
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
  stepTrack: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
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
  continueButton: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  continueButtonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
