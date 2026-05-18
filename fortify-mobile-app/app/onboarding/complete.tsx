import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Easing,
  PanResponder,
  type DimensionValue,
  type LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckIcon } from 'react-native-heroicons/solid';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { clearOnboardingState, getOnboardingState, type OnboardingState } from '@/src/utils/onboardingState';
import {
  buildOnboardingProgramBlueprint,
  buildOnboardingProgramSpec,
  savePendingOnboardingProgramSpec,
  type MuscleFocus,
} from '@/src/utils/onboardingProgram';
import {
  buildOnboardingConversionContext,
  savePendingOnboardingConversionContext,
} from '@/src/utils/onboardingConversion';
import type { MuscleKey } from '@/src/utils/muscleTaxonomy';
import { Typography } from '@/constants/Typography';
import {
  trackOnboardingFinished,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

const LOADING_DURATION_MS = 13000;
const AUTHENTICATED_AUTO_CONTINUE_DELAY_MS = 900;
const UPDATE_TIMEOUT_MS = 5000;
const LOADING_FAILSAFE_MS = LOADING_DURATION_MS + 1000;
const TYPEWRITER_INTERVAL_MS = 36;
const READY_NAME_TYPEWRITER_MS = 165;
const READY_TITLE_TYPEWRITER_MS = 72;
const LOADING_TITLE_TYPEWRITER_MS = 50;
const TYPEWRITER_HAPTIC_EVERY_N_CHARS = 3;
const NUMBER_HAPTIC_STEP_PCT = 5;
const SUMMARY_MAX_TILT_DEG = 16;
const SUMMARY_MAX_SHIFT_PX = 34;
const SUMMARY_MAX_TRANSLATE_PX = 4;
const SUMMARY_REST_SCALE = 0.985;

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

const FOCUS_MUSCLE_LEVELS: Record<MuscleFocus, Partial<Record<MuscleKey, number>>> = {
  balanced: {
    chest: 2,
    side_delts: 2,
    triceps: 2,
    biceps: 2,
    lats: 2,
    upper_back: 2,
    abs: 2,
    glutes: 2,
    quads: 2,
    hamstrings: 2,
    adductors: 2,
  },
  chest: {
    chest: 5,
    front_delts: 3,
    triceps: 3,
  },
  back: {
    lats: 5,
    upper_back: 5,
    lower_back: 3,
    rear_delts: 3,
    biceps: 3,
  },
  shoulders: {
    front_delts: 5,
    side_delts: 5,
    rear_delts: 5,
    upper_back: 2,
    triceps: 2,
  },
  arms: {
    biceps: 5,
    triceps: 5,
    forearms: 3,
    front_delts: 2,
  },
  legs: {
    quads: 5,
    adductors: 5,
    hamstrings: 5,
    glutes: 4,
    calves: 4,
  },
  glutes: {
    glutes: 5,
    hamstrings: 4,
    quads: 2,
    lower_back: 2,
  },
  core: {
    abs: 5,
    obliques: 5,
    lower_back: 2,
  },
};

const buildProgramPreviewMuscleLevels = (focuses: MuscleFocus[]): Partial<Record<MuscleKey, number>> => {
  const resolvedFocuses = focuses.length > 0 ? focuses : ['balanced' as MuscleFocus];
  const levels: Partial<Record<MuscleKey, number>> = {};

  resolvedFocuses.forEach((focus) => {
    const focusLevels = FOCUS_MUSCLE_LEVELS[focus] ?? FOCUS_MUSCLE_LEVELS.balanced;
    Object.entries(focusLevels).forEach(([muscle, level]) => {
      const key = muscle as MuscleKey;
      levels[key] = Math.max(levels[key] ?? 0, level ?? 0);
    });
  });

  return levels;
};

const FITNESS_GOAL_LABELS: Record<string, string> = {
  build_muscle: 'Build muscle',
  general_health: 'General health and fitness',
  lose_fat: 'Lose fat',
  improve_strength: 'Improve strength',
  stay_consistent: 'Stay consistent',
};

const FITNESS_MOTIVATION_LABELS: Record<string, string> = {
  self_confidence: 'More self-confidence',
  longevity: 'A healthier, longer life',
  daily_energy: 'More energy every day',
  strength_capability: 'Feel stronger and capable',
  body_confidence: 'Look better in my body',
  discipline: 'Stay disciplined',
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

const getPreferredFirstName = (fullName?: string | null) => {
  const trimmed = fullName?.trim();
  if (!trimmed) return null;
  const [firstName] = trimmed.split(/\s+/);
  return firstName || null;
};

export default function OnboardingCompleteScreen() {
  useOnboardingFunnelScreen('Onboarding Complete Page');

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
  const [typedReadyName, setTypedReadyName] = useState('');
  const [typedReadyTitle, setTypedReadyTitle] = useState('');
  const [typedReadySubtitle, setTypedReadySubtitle] = useState('');
  const typewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTypewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTypeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didTypeLoadingTitleRef = useRef(false);
  const summaryTiltX = useRef(new Animated.Value(0)).current;
  const summaryTiltY = useRef(new Animated.Value(0)).current;
  const summaryScale = useRef(new Animated.Value(SUMMARY_REST_SCALE)).current;
  const summaryTranslateX = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(0)).current;
  const summaryShineX = useRef(new Animated.Value(0)).current;
  const summaryShineY = useRef(new Animated.Value(0)).current;
  const summaryCardSizeRef = useRef({ width: 320, height: 240 });

  const activeStepIndex = useMemo(() => {
    const index = LOADING_STEPS.findIndex((step) => progressPct < step.completeAt);
    return index === -1 ? LOADING_STEPS.length - 1 : index;
  }, [progressPct]);

  const statusLine = useMemo(() => {
    return LOADING_STEPS[Math.min(activeStepIndex, LOADING_STEPS.length - 1)]?.label ?? 'Finalizing setup…';
  }, [activeStepIndex]);

  const preferredFirstName = useMemo(
    () => getPreferredFirstName(onboardingState?.full_name ?? profile?.full_name),
    [onboardingState?.full_name, profile?.full_name]
  );

  const loadingTitleLine = 'Generating your personalized program';
  const readyNameLine = preferredFirstName ?? '';
  const readyTitleLine = 'Your custom AI-powered program is here';
  const readySubtitleLine = isSaving
    ? 'Starting…'
    : isAuthenticated
      ? 'Finishing up…'
      : '';

  const animateSummaryRestState = useCallback(() => {
    Animated.parallel([
      Animated.spring(summaryTiltX, {
        toValue: 0,
        damping: 18,
        stiffness: 190,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(summaryTiltY, {
        toValue: 0,
        damping: 18,
        stiffness: 190,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(summaryScale, {
        toValue: SUMMARY_REST_SCALE,
        damping: 16,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(summaryTranslateX, {
        toValue: 0,
        damping: 17,
        stiffness: 210,
        mass: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(summaryTranslateY, {
        toValue: 0,
        damping: 17,
        stiffness: 210,
        mass: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(summaryShineX, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(summaryShineY, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  }, [summaryScale, summaryShineX, summaryShineY, summaryTiltX, summaryTiltY, summaryTranslateX, summaryTranslateY]);

  const handleSummaryCardLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      summaryCardSizeRef.current = { width, height };
    }
  }, []);

  const summaryPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => phase === 'ready' && showSummary,
    onStartShouldSetPanResponderCapture: () => phase === 'ready' && showSummary,
    onMoveShouldSetPanResponder: (_event, gestureState) =>
      phase === 'ready'
      && showSummary
      && (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3),
    onMoveShouldSetPanResponderCapture: (_event, gestureState) =>
      phase === 'ready'
      && showSummary
      && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
    onPanResponderGrant: () => {
      void Haptics.selectionAsync();
    },
    onPanResponderMove: (_event, gestureState) => {
      const { width, height } = summaryCardSizeRef.current;
      const maxHorizontal = Math.max(width * 0.38, 1);
      const maxVertical = Math.max(height * 0.32, 1);
      const normalizedX = clamp01((gestureState.dx + maxHorizontal) / (maxHorizontal * 2));
      const normalizedY = clamp01((gestureState.dy + maxVertical) / (maxVertical * 2));
      const tiltYValue = ((normalizedX * 2) - 1) * SUMMARY_MAX_TILT_DEG;
      const tiltXValue = (((normalizedY * 2) - 1) * SUMMARY_MAX_TILT_DEG) * -1;
      const shineXValue = ((normalizedX * 2) - 1) * SUMMARY_MAX_SHIFT_PX;
      const shineYValue = ((normalizedY * 2) - 1) * SUMMARY_MAX_SHIFT_PX;
      const translateXValue = ((normalizedX * 2) - 1) * SUMMARY_MAX_TRANSLATE_PX;
      const translateYValue = ((normalizedY * 2) - 1) * SUMMARY_MAX_TRANSLATE_PX;

      summaryTiltX.setValue(tiltXValue);
      summaryTiltY.setValue(tiltYValue);
      summaryTranslateX.setValue(translateXValue);
      summaryTranslateY.setValue(translateYValue);
      summaryShineX.setValue(shineXValue);
      summaryShineY.setValue(shineYValue);
    },
    onPanResponderRelease: () => {
      animateSummaryRestState();
    },
    onPanResponderTerminate: () => {
      animateSummaryRestState();
    },
    onPanResponderTerminationRequest: () => false,
  }), [
    animateSummaryRestState,
    phase,
    showSummary,
    summaryScale,
    summaryShineX,
    summaryShineY,
    summaryTiltX,
    summaryTiltY,
    summaryTranslateX,
    summaryTranslateY,
  ]);

  const summaryCardAnimatedStyle = useMemo(() => ({
    transform: [
      { perspective: 1200 },
      { translateX: summaryTranslateX },
      { translateY: summaryTranslateY },
      {
        rotateX: summaryTiltX.interpolate({
          inputRange: [-SUMMARY_MAX_TILT_DEG, SUMMARY_MAX_TILT_DEG],
          outputRange: [`-${SUMMARY_MAX_TILT_DEG}deg`, `${SUMMARY_MAX_TILT_DEG}deg`],
        }),
      },
      {
        rotateY: summaryTiltY.interpolate({
          inputRange: [-SUMMARY_MAX_TILT_DEG, SUMMARY_MAX_TILT_DEG],
          outputRange: [`-${SUMMARY_MAX_TILT_DEG}deg`, `${SUMMARY_MAX_TILT_DEG}deg`],
        }),
      },
      { scale: summaryScale },
    ],
  }), [summaryScale, summaryTiltX, summaryTiltY, summaryTranslateX, summaryTranslateY]);

  const summaryShineAnimatedStyle = useMemo(() => ({
    transform: [
      { translateX: summaryShineX },
      { translateY: summaryShineY },
      { rotate: '18deg' },
    ],
  }), [summaryShineX, summaryShineY]);

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
      setTypedReadyName(readyNameLine);
      setTypedReadyTitle(readyTitleLine);
      setTypedReadySubtitle(readySubtitleLine);
      return;
    }

    let isCancelled = false;
    let nameIndex = 0;
    let titleIndex = 0;
    let subtitleIndex = 0;
    setTypedReadyName('');
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
        readyTypeTimeoutRef.current = setTimeout(typeTitle, READY_TITLE_TYPEWRITER_MS);
        return;
      }
      readyTypeTimeoutRef.current = setTimeout(typeSubtitle, TYPEWRITER_INTERVAL_MS);
    };

    const typeName = () => {
      if (isCancelled) return;
      nameIndex += 1;
      setTypedReadyName(readyNameLine.slice(0, nameIndex));
      triggerTypewriterHaptic(nameIndex, readyNameLine);
      if (nameIndex < readyNameLine.length) {
        readyTypeTimeoutRef.current = setTimeout(typeName, READY_NAME_TYPEWRITER_MS);
        return;
      }
      readyTypeTimeoutRef.current = setTimeout(typeTitle, READY_TITLE_TYPEWRITER_MS);
    };

    readyTypeTimeoutRef.current = setTimeout(
      readyNameLine ? typeName : typeTitle,
      readyNameLine ? READY_NAME_TYPEWRITER_MS : READY_TITLE_TYPEWRITER_MS
    );

    return () => {
      isCancelled = true;
      if (readyTypeTimeoutRef.current) {
        clearTimeout(readyTypeTimeoutRef.current);
        readyTypeTimeoutRef.current = null;
      }
    };
  }, [phase, readyNameLine, readySubtitleLine, readyTitleLine]);

  const summaryName = useMemo(() => {
    const name = onboardingState?.full_name?.trim();
    if (!name) return null;
    if (name.endsWith('s') || name.endsWith('S')) {
      return `${name}' training profile`;
    }
    return `${name}'s training profile`;
  }, [onboardingState?.full_name]);

  const programBlueprint = useMemo(() => {
    if (!onboardingState) return null;
    return buildOnboardingProgramBlueprint(buildOnboardingProgramSpec(onboardingState));
  }, [onboardingState]);

  const programPreviewMuscleLevels = useMemo(() => {
    if (!programBlueprint) return null;
    return buildProgramPreviewMuscleLevels(
      onboardingState?.muscle_focuses?.length
        ? (onboardingState.muscle_focuses as MuscleFocus[])
        : onboardingState?.muscle_focus
          ? [onboardingState.muscle_focus as MuscleFocus]
          : ['balanced']
    );
  }, [onboardingState?.muscle_focus, onboardingState?.muscle_focuses, programBlueprint]);

  const programPreviewHeatmapGender = useMemo<'male' | 'female'>(() => {
    const resolvedGender = onboardingState?.gender ?? profile?.gender;
    return resolvedGender === 'female' ? 'female' : 'male';
  }, [onboardingState?.gender, profile?.gender]);

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
    const motivationFromList = onboardingState.fitness_motivations?.length
      ? onboardingState.fitness_motivations[0]
      : undefined;
    const resolvedMotivation = onboardingState.fitness_motivation ?? motivationFromList;
    const items: SummaryItem[] = [];

    if (resolvedGoal) {
      items.push({ label: 'Goal', value: FITNESS_GOAL_LABELS[resolvedGoal] ?? resolvedGoal });
    }
    if (resolvedMotivation) {
      items.push({
        label: 'Motivation',
        value: FITNESS_MOTIVATION_LABELS[resolvedMotivation] ?? resolvedMotivation,
      });
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

  const headerStatusText = phase === 'loading' ? typedStatusLine : typedReadySubtitle;

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
      if (state?.workout_schedule_days?.length && !profile?.workout_schedule_days?.length) {
        updates.workout_schedule_days = state.workout_schedule_days;
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

      if (state) {
        try {
          const programSpec = buildOnboardingProgramSpec(state);
          const conversionContext = buildOnboardingConversionContext(state);
          await savePendingOnboardingProgramSpec(programSpec);
          await savePendingOnboardingConversionContext(conversionContext);
          trackOnboardingFinished(conversionContext);
        } catch (programSpecError) {
          console.warn('[Onboarding] Failed to save pending program spec:', programSpecError);
          trackOnboardingFinished();
        }
      } else {
        trackOnboardingFinished();
      }

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
    const stepFillPct = `${Math.round(stepProgress * 100)}%` as DimensionValue;

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
      floatingFooter={
        phase === 'ready' && !isAuthenticated ? (
          <GlassButton
            style={styles.continueButton}
            onPress={() => void handleContinue()}
            disabled={isSaving}
            hapticFeedback="impactMedium"
          >
            <Text allowFontScaling={false} style={[styles.continueButtonText, { color: colors.white }]}>
              {isSaving ? 'Starting…' : "I'm ready"}
            </Text>
          </GlassButton>
        ) : undefined
      }
    >
      <View style={styles.page}>
        <View style={styles.headerBlock}>
          <Text allowFontScaling={false} style={[styles.percentText, { color: colors.textPrimary }]}>
            {phase === 'loading' ? `${progressPct}%` : '100%'}
          </Text>
          {phase === 'ready' && typedReadyName ? (
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              numberOfLines={1}
              style={[styles.nameText, { color: colors.textPrimary }]}
            >
              {typedReadyName}
            </Text>
          ) : null}
          <Text
            allowFontScaling={false}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            numberOfLines={2}
            style={[styles.titleText, { color: colors.textPrimary }]}
          >
            {phase === 'loading' ? typedLoadingTitle : typedReadyTitle}
          </Text>
          {headerStatusText ? (
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={[styles.statusText, { color: colors.textSecondary }]}
            >
              {headerStatusText}
            </Text>
          ) : null}
        </View>

        {showSummary ? (
          <Animated.View
            style={[
              styles.summaryBlock,
              {
                opacity: summaryAnim,
                overflow: 'visible',
              },
            ]}
          >
            <Animated.View
              style={[styles.summaryCardShell, summaryCardAnimatedStyle]}
              onLayout={handleSummaryCardLayout}
              {...summaryPanResponder.panHandlers}
            >
              <LinearGradient
                colors={[colors.surfaceElevated, colors.glassBackground, colors.surfaceElevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.summaryCard, { borderColor: colors.glassBorder }]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.summaryShine,
                    summaryShineAnimatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0)',
                      isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.34)',
                      'rgba(255,255,255,0)',
                    ]}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 1, y: 0.9 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                <View
                  style={[
                    styles.summaryGlow,
                    { backgroundColor: colors.accent, opacity: isDark ? 0.18 : 0.12 },
                  ]}
                />
                <View style={styles.summaryHeader}>
                  <Text allowFontScaling={false} style={[styles.summaryBrand, { color: colors.accent }]}>
                    FORTIFY AI
                  </Text>
                </View>
                <Text allowFontScaling={false} style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                  {summaryName ?? 'Your training profile'}
                </Text>
                {programBlueprint ? (
                  <View style={[styles.programPreview, { borderColor: colors.glassBorder }]}>
                    <View style={styles.programPreviewHeader}>
                      <View style={styles.programPreviewTitleStack}>
                        <Text allowFontScaling={false} style={[styles.programPreviewEyebrow, { color: colors.accent }]}>
                          PROGRAM PREVIEW
                        </Text>
                        <Text allowFontScaling={false} style={[styles.programPreviewTitle, { color: colors.textPrimary }]}>
                          {programBlueprint.name}
                        </Text>
                      </View>
                      <Text allowFontScaling={false} style={[styles.programPreviewWeeks, { color: colors.textPrimary }]}>
                        {programBlueprint.durationWeeks} weeks
                      </Text>
                    </View>
                    <Text allowFontScaling={false} style={[styles.programPreviewSubtitle, { color: colors.textSecondary }]}>
                      {programBlueprint.subtitle}
                    </Text>
                    <View style={styles.programChips}>
                      {[programBlueprint.environmentLabel, programBlueprint.scheduleLabel, programBlueprint.focusLabel].map((label) => (
                        <View
                          key={label}
                          style={[
                            styles.programChip,
                            { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
                          ]}
                        >
                          <Text allowFontScaling={false} numberOfLines={1} style={[styles.programChipText, { color: colors.textPrimary }]}>
                            {label}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.programPreviewBody}>
                      <View style={styles.programWorkoutList}>
                        {programBlueprint.workouts.slice(0, 4).map((workout, index) => (
                          <View key={`${workout.name}-${index}`} style={styles.programWorkoutRow}>
                            <Text allowFontScaling={false} style={[styles.programWorkoutIndex, { color: colors.accent }]}>
                              {index + 1}
                            </Text>
                            <Text allowFontScaling={false} numberOfLines={1} style={[styles.programWorkoutName, { color: colors.textPrimary }]}>
                              {workout.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                      {programPreviewMuscleLevels ? (
                        <View style={styles.programHeatmap}>
                          <MuscleHeatmap
                            muscleLevels={programPreviewMuscleLevels}
                            gender={programPreviewHeatmapGender}
                            scale={0.32}
                            compact
                            baselineIntensity={1}
                            showLegend
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : null}
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
                        <Text allowFontScaling={false} style={[styles.summaryLabel, { color: colors.textPrimary }]}>
                          {item.label}
                        </Text>
                        <Text
                          allowFontScaling={false}
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
                    <Text allowFontScaling={false} style={[styles.summaryLoadingText, { color: colors.textSecondary }]}>
                      Gathering your setup…
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
            <Text allowFontScaling={false} style={[styles.summaryNote, { color: colors.textPrimary }]}>
              You can change this at any time.
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
    gap: Spacing.lg,
    paddingBottom: Spacing['6xl'],
  },
  headerBlock: {
    minHeight: 178,
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
  nameText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    letterSpacing: 0.3,
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
  summaryCardShell: {
    width: '100%',
    overflow: 'visible',
  },
  summaryBlock: {
    marginTop: -Spacing.md,
  },
  summaryShine: {
    position: 'absolute',
    top: -28,
    left: '18%',
    width: '34%',
    height: '140%',
    opacity: 0.95,
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
  summaryTitle: {
    ...Typography.h3,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 20,
  },
  summaryStreakCard: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  summaryStreakLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryStreakValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    letterSpacing: 0.2,
  },
  summarySubtitle: {
    ...Typography.bodySmall,
  },
  programPreview: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  programPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  programPreviewTitleStack: {
    flex: 1,
    gap: 2,
  },
  programPreviewEyebrow: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  programPreviewTitle: {
    ...Typography.h3,
    fontSize: 18,
  },
  programPreviewWeeks: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  programPreviewSubtitle: {
    ...Typography.bodySmall,
  },
  programChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  programChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  programChipText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  programPreviewBody: {
    minHeight: 124,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  programWorkoutList: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  programWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programWorkoutIndex: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    width: 18,
  },
  programWorkoutName: {
    ...Typography.bodySmall,
    flex: 1,
    fontWeight: '700',
  },
  programHeatmap: {
    width: 148,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
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
