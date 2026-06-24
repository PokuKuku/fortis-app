import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { usePathname, useRouter, useSegments } from 'expo-router';
import {
  IN_APP_TOUR_VERSION,
  TOUR_ANCHOR_IDS,
  type TourAnchorId,
} from '@/src/constants/inAppTour';
import { useAuth, type Profile } from '@/src/contexts/AuthContext';
import {
  clearInAppTourState,
  loadInAppTourState,
  resumeInProgressTourAtStep,
  saveInAppTourState,
  type PersistedInAppTourState,
} from '@/src/services/inAppTourService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { TourOverlay, type AnchorRect, type TourOverlayMode, type TourOverlayPlacement } from '@/src/components/tour/TourOverlay';
import { PAYWALL_PLACEMENTS, type PaywallPlacement } from '@/src/components/superwall/paywallPlacements';
import { useTourNarration } from '@/src/hooks/useTourNarration';
import {
  AI_CHAT_OVERVIEW_COPY,
  AI_TEXT_CHAT_TOUR_COPY,
  getAIChatTourNarrationVoice,
} from '@/src/utils/aiChatTour';
import { AccentColorPicker } from '@/src/components/ui/AccentColorPicker';
import { posthog } from '@/src/config/posthog';

const AI_CHAT_TOUR_NARRATION_DEFAULT = require('@/assets/audio/ai-chat-overview.m4a');
const AI_CHAT_TOUR_NARRATION_CEDAR = require('@/assets/audio/ai-chat-overview-cedar.m4a');

// Keep development behavior aligned with production tour completion state.
const FORCE_TOUR_ON_DEV_REFRESH = false;

type TourStepId =
  | 'welcome'
  | 'workouts_intro'
  | 'add_workout_routine'
  | 'open_add_with_voice'
  | 'add_with_voice'
  | 'confirm_add_with_voice'
  | 'voice_add_multiple'
  | 'paste_workout_tip'
  | 'paste_workout_demo'
  | 'paste_workout_result'
  | 'close_workout_builder'
  | 'ai_chat_open'
  | 'ai_text_chat_overview'
  | 'ai_text_chat_result'
  | 'ai_voice_chat_open'
  | 'ai_chat_overview'
  | 'quick_start'
  | 'launch_workout'
  | 'rest_timer'
  | 'open_voice_log'
  | 'voice_log_result'
  | 'set_target'
  | 'rest_timer_settings'
  | 'go_insights'
  | 'insights_overview'
  | 'support_overview'
  | 'primary_style';

type TourRoute = '/(tabs)' | '/(tabs)/insights' | '/workout/active' | '/ai/chat' | '/workout/create';

type TourStep = {
  id: TourStepId;
  route: TourRoute;
  anchorId?: TourAnchorId;
  secondaryAnchorId?: TourAnchorId;
  body: string;
  mode: TourOverlayMode;
  primaryActionLabel?: string | null;
  showArrow?: boolean;
  centerTooltip?: boolean;
  showHighlight?: boolean;
  hideTooltip?: boolean;
  tooltipOffsetY?: number;
  pinTooltipToTop?: boolean;
  tooltipTopOffset?: number;
  placement?: TourOverlayPlacement;
  renderOverlay?: boolean;
  holePadding?: number;
  holePaddingBottom?: number;
  reserveArrowSpace?: boolean;
  allowAnchorInteraction?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/(tabs)',
    body: 'Welcome to Fortify! Congrats on committing to your fitness journey! Now let’s quickly show you around.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'workouts_intro',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.workoutsSection,
    body: 'Workouts are exercise templates. Programs group workouts. Drag a workout card into a program to add it.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    placement: 'below',
  },
  {
    id: 'add_workout_routine',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.addWorkoutRoutine,
    body: 'Tap + beside Workouts to add a custom routine you can use for future sessions.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'open_add_with_voice',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.addWithVoice,
    body: 'Add with Voice allows you to add exercises by speaking.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    holePadding: 0,
  },
  {
    id: 'voice_add_multiple',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.workoutExerciseCard,
    body: 'You can voice add multiple exercises at once if needed.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    showHighlight: true,
    placement: 'below',
    holePadding: 0,
    holePaddingBottom: -22,
    tooltipOffsetY: 18,
  },
  {
    id: 'paste_workout_tip',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.pasteWorkout,
    body: 'Have your workout template in Notes or text?\n\nTap Paste Workout to turn it into a workout template faster.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'paste_workout_demo',
    route: '/workout/create',
    body: 'Creating an example workout template.',
    mode: 'blocking',
    primaryActionLabel: null,
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
    renderOverlay: false,
  },
  {
    id: 'paste_workout_result',
    route: '/workout/create',
    body: 'Your notes will now appear as a workout template! The cleaner the layout of your notes, the faster the result!',
    mode: 'blocking',
    primaryActionLabel: 'Next',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'close_workout_builder',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.workoutBuilderCloseButton,
    body: 'Tap X to close the workout editor.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: false,
    holePadding: 0,
  },
  {
    id: 'ai_chat_open',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.aiChatButton,
    body: 'Tap to open the Fortify AI chat.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'ai_text_chat_overview',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatBackWorkout,
    body: 'Tap Back Workout to see Fortify create a workout for you in Chat.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'ai_text_chat_result',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatWorkoutTemplate,
    secondaryAnchorId: TOUR_ANCHOR_IDS.aiChatBackWorkoutPrompt,
    body: AI_TEXT_CHAT_TOUR_COPY,
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: true,
  },
  {
    id: 'ai_voice_chat_open',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatVoiceMode,
    body: 'Next, tap Voice to chat with Fortify out loud.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'ai_chat_overview',
    route: '/ai/chat',
    body: AI_CHAT_OVERVIEW_COPY,
    mode: 'blocking',
    primaryActionLabel: 'Next',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'quick_start',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Tap the dumbbell, select “Upper,” and confirm to set your default workout. You can reset it later by press & hold.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'launch_workout',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Now tap the dumbbell to start your workout.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'open_voice_log',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.voiceLog,
    body: 'You can tap the mic on exercise cards to log sets with your voice.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    tooltipOffsetY: 18,
  },
  {
    id: 'voice_log_result',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeWorkoutExerciseCard,
    body: 'Voice Log can fill multiple sets at once and capture the set type too.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    placement: 'below',
    holePadding: 0,
    holePaddingBottom: -22,
    reserveArrowSpace: true,
    allowAnchorInteraction: false,
  },
  {
    id: 'set_target',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.setTarget,
    body: 'Tap Set Target to update this exercise’s sets and rep range.\n\nUse the same control in the Edit Workout modal to update your workout template.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    reserveArrowSpace: true,
  },
  {
    id: 'rest_timer',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.restTimer,
    body: 'Rest Timer keeps you on pace between sets. Tap to start/pause and adjust anytime.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
    reserveArrowSpace: true,
  },
  {
    id: 'rest_timer_settings',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.restTimerSettings,
    body: 'Use the clock to set your rest timer duration.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: false,
  },
  {
    id: 'go_insights',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.insightsTab,
    body: 'Next, tap Insights to see your progress.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'insights_overview',
    route: '/(tabs)/insights',
    body: 'Insights power Fortify AI. Tap "Ask Fortify" on any insight to get a breakdown and next steps.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'support_overview',
    route: '/(tabs)',
    body: 'Need help? Open Profile, tap Settings, then use Send Feedback or Report a Bug in the Support section.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'primary_style',
    route: '/(tabs)',
    body: 'Choose your primary style.',
    mode: 'blocking',
    primaryActionLabel: null,
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
    renderOverlay: false,
  },
];

const ROUTE_LOCKED_STEP_IDS: ReadonlySet<TourStepId> = new Set([
  'welcome',
  'workouts_intro',
  'ai_text_chat_overview',
  'ai_text_chat_result',
  'ai_voice_chat_open',
  'ai_chat_overview',
  'quick_start',
  'rest_timer',
  'open_voice_log',
  'rest_timer_settings',
  'insights_overview',
  'support_overview',
  'primary_style',
  'paste_workout_demo',
  'paste_workout_result',
]);

const USER_DRIVEN_NAV_STEP_IDS: ReadonlySet<TourStepId> = new Set([
  'add_workout_routine',
  'open_add_with_voice',
  'voice_add_multiple',
  'paste_workout_tip',
  'close_workout_builder',
  'open_voice_log',
]);
const ANCHOR_RECT_JITTER_PX = 2;

const TOUR_PRO_GATE_BYPASS_STEPS: Partial<Record<PaywallPlacement, ReadonlySet<TourStepId>>> = {
  [PAYWALL_PLACEMENTS.voiceExerciseAdd]: new Set([
    'open_add_with_voice',
    'voice_add_multiple',
  ]),
  [PAYWALL_PLACEMENTS.voiceSetLog]: new Set([
    'open_voice_log',
    'voice_log_result',
  ]),
  [PAYWALL_PLACEMENTS.aiChat]: new Set([
    'ai_chat_open',
    'ai_text_chat_overview',
    'ai_text_chat_result',
    'ai_chat_overview',
  ]),
  [PAYWALL_PLACEMENTS.workoutLimit]: new Set([
    'ai_text_chat_result',
  ]),
};

const REMOVED_TOUR_STEP_REPLACEMENTS: Partial<Record<string, TourStepId>> = {
  add_with_voice: 'voice_add_multiple',
  confirm_add_with_voice: 'voice_add_multiple',
  log_with_voice: 'voice_log_result',
  confirm_voice_log: 'voice_log_result',
};
const COLD_START_TOUR_RESUME_STEP_ID: TourStepId = 'support_overview';

export function shouldBypassProGateForTourState(params: {
  activeStepId: TourStepId | null;
  isTourActive: boolean;
  placement: PaywallPlacement;
}): boolean {
  if (!params.isTourActive || !params.activeStepId) {
    return false;
  }

  return Boolean(TOUR_PRO_GATE_BYPASS_STEPS[params.placement]?.has(params.activeStepId));
}

const getStepIndexById = (stepId: string): number => {
  const resolvedStepId = REMOVED_TOUR_STEP_REPLACEMENTS[stepId] ?? stepId;
  const index = TOUR_STEPS.findIndex((step) => step.id === resolvedStepId);
  return index === -1 ? 0 : index;
};

type InAppTourContextValue = {
  registerAnchorRect: (id: string, rect: AnchorRect) => void;
  unregisterAnchor: (id: string) => void;
  isTourActive: boolean;
  activeStepId: TourStepId | null;
  activeAnchorId: TourAnchorId | null;
  advanceStep: () => void;
  skipTour: () => void;
  currentStepNumber: number | null;
  totalSteps: number;
  queueTourStartAfterPaywallClose: () => void;
  shouldBypassProGateForTour: (placement: PaywallPlacement) => boolean;
};

const InAppTourContext = createContext<InAppTourContextValue | null>(null);

export function useInAppTour() {
  const context = useContext(InAppTourContext);
  if (!context) {
    throw new Error('useInAppTour must be used within an InAppTourProvider');
  }
  return context;
}

export function InAppTourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { user, isAuthResolved, isAuthenticated, profile, profileResolved, updateProfile } = useAuth();

  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const isWorkoutActive = useWorkoutStore((s) => s.isWorkoutActive);
  const workoutCompletedSessions = useWorkoutStore((s) => s.completedSessions);

  const [tourState, setTourState] = useState<PersistedInAppTourState | null>(null);
  const [tourLoaded, setTourLoaded] = useState(false);
  const [anchorRects, setAnchorRects] = useState<Record<string, AnchorRect>>({});
  const [renderStepId, setRenderStepId] = useState<TourStepId | null>(null);
  const [pendingStepId, setPendingStepId] = useState<TourStepId | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isExitingTooltip, setIsExitingTooltip] = useState(false);
  const [pendingPaywallStartRequestedAt, setPendingPaywallStartRequestedAt] = useState<number | null>(null);
  const lastTrackedStepIdRef = useRef<TourStepId | null>(null);

  const getStepById = useCallback((stepId: string | null | undefined): TourStep | null => {
    if (!stepId) return null;
    const index = getStepIndexById(stepId);
    return TOUR_STEPS[index] ?? null;
  }, []);

  const isTourActive = tourState?.status === 'in_progress';
  const currentStepIndex = useMemo(() => {
    if (!isTourActive) return -1;
    return getStepIndexById(tourState?.stepId ?? TOUR_STEPS[0].id);
  }, [isTourActive, tourState?.stepId]);

  const logicalStep = currentStepIndex >= 0 ? TOUR_STEPS[currentStepIndex] : null;
  const renderStep = useMemo(() => getStepById(renderStepId), [getStepById, renderStepId]);
  const pendingStep = useMemo(() => getStepById(pendingStepId), [getStepById, pendingStepId]);
  const overlayStep = renderStep ?? pendingStep ?? logicalStep;

  const currentAnchorRect = overlayStep?.anchorId ? anchorRects[overlayStep.anchorId] ?? null : null;
  const secondaryAnchorRect = overlayStep?.secondaryAnchorId
    ? anchorRects[overlayStep.secondaryAnchorId] ?? null
    : null;
  const normalizedPathname = useMemo(
    () => (pathname ? pathname.replace('/(tabs)', '') : ''),
    [pathname]
  );

  const isOnStepRoute = useCallback(
    (route: TourRoute) => {
      if (route === '/(tabs)') {
        const routeSegments = segments as readonly string[];
        return routeSegments[0] === '(tabs)' && (routeSegments.length === 1 || routeSegments[1] === 'index');
      }

      const normalizedRoute = route.replace('/(tabs)', '');
      if (normalizedPathname === normalizedRoute) {
        return true;
      }
      if (route === '/(tabs)/insights') {
        return segments[0] === '(tabs)' && segments[1] === 'insights';
      }
      if (route === '/ai/chat') {
        return segments[0] === 'ai' && segments[1] === 'chat';
      }
      if (route === '/workout/active') {
        return segments[0] === 'workout' && segments[1] === 'active';
      }
      return false;
    },
    [normalizedPathname, segments]
  );

  const isLogicalStepOnRoute = logicalStep ? isOnStepRoute(logicalStep.route) : false;
  const shouldRouteLockLogicalStep = logicalStep ? ROUTE_LOCKED_STEP_IDS.has(logicalStep.id) : false;
  const isOverlayStepOnRoute = overlayStep ? isOnStepRoute(overlayStep.route) : false;
  const shouldRouteLockOverlayStep = overlayStep ? ROUTE_LOCKED_STEP_IDS.has(overlayStep.id) : false;

  const registerAnchorRect = useCallback((id: string, rect: AnchorRect) => {
    setAnchorRects((prev) => {
      const existing = prev[id];
      if (
        existing &&
        Math.abs(existing.x - rect.x) <= ANCHOR_RECT_JITTER_PX &&
        Math.abs(existing.y - rect.y) <= ANCHOR_RECT_JITTER_PX &&
        Math.abs(existing.width - rect.width) <= ANCHOR_RECT_JITTER_PX &&
        Math.abs(existing.height - rect.height) <= ANCHOR_RECT_JITTER_PX
      ) {
        return prev;
      }
      return { ...prev, [id]: rect };
    });
  }, []);

  const unregisterAnchor = useCallback((id: string) => {
    setAnchorRects((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isStepReady = useCallback((candidateStep: TourStep | null): boolean => {
    if (!candidateStep) return false;
    if (!isOnStepRoute(candidateStep.route)) return false;
    if (candidateStep.anchorId && !anchorRects[candidateStep.anchorId]) return false;
    if (candidateStep.id === 'go_insights' && isWorkoutActive) return false;
    return true;
  }, [anchorRects, isOnStepRoute, isWorkoutActive]);

  useEffect(() => {
    if (!isTourActive || !logicalStep) {
      setPendingStepId(null);
      setRenderStepId(null);
      setIsTooltipVisible(false);
      setIsExitingTooltip(false);
      return;
    }

    setPendingStepId((current) => (current === logicalStep.id ? current : logicalStep.id));
  }, [isTourActive, logicalStep?.id]);

  useEffect(() => {
    if (!isTourActive || !pendingStep) return;
    if (!isStepReady(pendingStep)) return;

    if (!renderStepId || renderStepId === pendingStep.id) {
      if (renderStepId !== pendingStep.id) {
        setRenderStepId(pendingStep.id);
      }
      setPendingStepId(null);
      setIsExitingTooltip(false);
      setIsTooltipVisible(true);
      return;
    }

    const currentRenderStep = getStepById(renderStepId);
    const canAnimateCurrentStepOut =
      isStepReady(currentRenderStep) &&
      currentRenderStep?.renderOverlay !== false;
    if (!canAnimateCurrentStepOut) {
      setRenderStepId(pendingStep.id);
      setPendingStepId(null);
      setIsExitingTooltip(false);
      setIsTooltipVisible(true);
      return;
    }

    if (!isExitingTooltip) {
      if (isTooltipVisible) {
        setIsExitingTooltip(true);
        setIsTooltipVisible(false);
        return;
      }

      setRenderStepId(pendingStep.id);
      setPendingStepId(null);
      setIsTooltipVisible(true);
    }
  }, [getStepById, isExitingTooltip, isStepReady, isTourActive, isTooltipVisible, pendingStep, renderStepId]);

  const handleTooltipHideComplete = useCallback(() => {
    if (!isExitingTooltip) return;
    if (!isTourActive) {
      setIsExitingTooltip(false);
      return;
    }

    const nextStep = getStepById(pendingStepId);
    if (!isStepReady(nextStep)) {
      setIsExitingTooltip(false);
      setIsTooltipVisible(true);
      return;
    }

    if (nextStep && renderStepId !== nextStep.id) {
      setRenderStepId(nextStep.id);
    }
    setPendingStepId(null);
    setIsExitingTooltip(false);
    setIsTooltipVisible(true);
  }, [getStepById, isExitingTooltip, isStepReady, isTourActive, pendingStepId, renderStepId]);

  const persistTour = useCallback(async (next: PersistedInAppTourState | null) => {
    if (FORCE_TOUR_ON_DEV_REFRESH) return;
    if (!next) {
      await clearInAppTourState();
      return;
    }
    await saveInAppTourState(next);
  }, []);

  const setTourStateAndPersist = useCallback(async (next: PersistedInAppTourState | null) => {
    setTourState(next);
    try {
      await persistTour(next);
    } catch {
      // Ignore storage failures; tour should still function.
    }
  }, [persistTour]);

  const markTourSeenOnServer = useCallback(async (params: {
    completedAt?: string | null;
    status: 'started' | 'completed' | 'skipped';
  }) => {
    if (FORCE_TOUR_ON_DEV_REFRESH) return;
    if (!isAuthenticated) return;

    const payload: Partial<Profile> = {
      has_seen_in_app_tour: true,
      in_app_tour_version: IN_APP_TOUR_VERSION,
    };

    if (params.completedAt) {
      payload.in_app_tour_completed_at = params.completedAt;
    }

    const { error } = await updateProfile(payload);
    if (error) {
      // Best-effort: local state prevents repeated tours even if this fails.
      console.warn('[InAppTour] Failed to persist tour state:', error.message);
    }
  }, [isAuthenticated, updateProfile]);

  const lastCompletedCountRef = useRef<number>(workoutCompletedSessions.length);

  const startTour = useCallback(async (): Promise<boolean> => {
    if (!tourLoaded) return false;
    if (isTourActive) return false;
    if (!isAuthenticated) return false;

    const now = new Date().toISOString();
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status: 'in_progress',
      stepId: TOUR_STEPS[0].id,
      updatedAt: now,
    };

    await setTourStateAndPersist(next);
    posthog.capture('tour_started');
    await markTourSeenOnServer({ status: 'started' });
    router.navigate(TOUR_STEPS[0].route);
    return true;
  }, [isAuthenticated, isTourActive, markTourSeenOnServer, router, setTourStateAndPersist, tourLoaded]);

  const finishTour = useCallback(async (status: 'completed' | 'skipped') => {
    if (!tourLoaded) return;
    const now = new Date().toISOString();
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status,
      stepId: TOUR_STEPS[TOUR_STEPS.length - 1].id,
      updatedAt: now,
    };
    await setTourStateAndPersist(next);
    if (status === 'completed') {
      posthog.capture('tour_completed');
    } else if (logicalStep) {
      posthog.capture('tour_abandoned', {
        step_index: currentStepIndex + 1,
        step_name: logicalStep.id,
      });
    }
    void markTourSeenOnServer({ status, completedAt: now });
  }, [currentStepIndex, logicalStep, markTourSeenOnServer, setTourStateAndPersist, tourLoaded]);

  useEffect(() => {
    if (!isTourActive || !logicalStep || lastTrackedStepIdRef.current === logicalStep.id) return;
    lastTrackedStepIdRef.current = logicalStep.id;
    posthog.capture('tour_step_viewed', {
      step_index: currentStepIndex + 1,
      step_name: logicalStep.id,
    });
  }, [currentStepIndex, isTourActive, logicalStep]);

  useEffect(() => {
    if (!isTourActive) {
      lastTrackedStepIdRef.current = null;
    }
  }, [isTourActive]);

  useEffect(() => {
    const prevCount = lastCompletedCountRef.current;
    const nextCount = workoutCompletedSessions.length;
    if (prevCount === nextCount) return;
    lastCompletedCountRef.current = nextCount;
  }, [workoutCompletedSessions.length]);

  const advanceStep = useCallback(async () => {
    if (!tourLoaded) return;
    if (!isTourActive || currentStepIndex < 0) return;

    const isLast = currentStepIndex >= TOUR_STEPS.length - 1;
    if (isLast) {
      await finishTour('completed');
      return;
    }

    const now = new Date().toISOString();
    const nextStep = logicalStep?.id === 'open_add_with_voice'
      ? TOUR_STEPS.find((step) => step.id === 'paste_workout_tip')!
      : TOUR_STEPS[currentStepIndex + 1];
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status: 'in_progress',
      stepId: nextStep.id,
      updatedAt: now,
    };

    if (logicalStep?.id === 'rest_timer_settings' && isWorkoutActive) {
      cancelWorkout();
    }

    await setTourStateAndPersist(next);

    if (logicalStep?.id === 'ai_chat_overview') {
      router.navigate('/(tabs)');
      return;
    }
    if (logicalStep?.id === 'rest_timer_settings') {
      router.navigate('/(tabs)');
    }
  }, [cancelWorkout, currentStepIndex, finishTour, isTourActive, isWorkoutActive, logicalStep?.id, router, setTourStateAndPersist, tourLoaded]);

  const autoNavStepRef = useRef<string | null>(null);

  // One-time navigation per step (avoid fighting user-driven navigation when a step advances itself).
  useEffect(() => {
    if (!isTourActive || !logicalStep) return;
    if (autoNavStepRef.current === logicalStep.id) return;
    autoNavStepRef.current = logicalStep.id;

    if (USER_DRIVEN_NAV_STEP_IDS.has(logicalStep.id)) {
      return;
    }

    if (!isOnStepRoute(logicalStep.route)) {
      router.navigate(logicalStep.route);
    }
  }, [isOnStepRoute, isTourActive, logicalStep, router]);

  // Reset per-step navigation when returning from background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        autoNavStepRef.current = null;
      }
    });
    return () => subscription.remove();
  }, []);

  // Keep route-locked steps on their required route even after first navigation.
  useEffect(() => {
    if (!isTourActive || !logicalStep || !shouldRouteLockLogicalStep) return;
    if (isLogicalStepOnRoute) return;
    router.navigate(logicalStep.route);
  }, [isLogicalStepOnRoute, isTourActive, logicalStep, router, shouldRouteLockLogicalStep]);

  // Defensive close: step 9 should never render with an active workout session.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'go_insights') return;
    if (!isWorkoutActive) return;
    cancelWorkout();
  }, [cancelWorkout, isTourActive, isWorkoutActive, logicalStep?.id]);

  // Load persisted tour state for the active auth scope (guest vs signed-in user).
  useEffect(() => {
    if (!isAuthResolved) return;
    if (isAuthenticated && !user?.id) return;

    let isMounted = true;
    setTourLoaded(false);
    setTourState(null);

    const run = async () => {
      if (FORCE_TOUR_ON_DEV_REFRESH) {
        setTourLoaded(true);
        return;
      }

      const loaded = await loadInAppTourState();
      if (!isMounted) return;

      if (loaded && loaded.version !== IN_APP_TOUR_VERSION) {
        await clearInAppTourState();
        setTourState(null);
        setTourLoaded(true);
        return;
      }

      if (loaded?.status === 'in_progress') {
        const resumed = resumeInProgressTourAtStep(
          loaded,
          COLD_START_TOUR_RESUME_STEP_ID,
        );
        await setTourStateAndPersist(resumed);
        await markTourSeenOnServer({ status: 'started' });
        setTourLoaded(true);
        return;
      }

      setTourState(loaded);
      setTourLoaded(true);
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, isAuthenticated, markTourSeenOnServer, setTourStateAndPersist, user?.id]);

  const isInOnboardingOrAuth = segments[0] === 'onboarding' || segments[0] === 'auth';
  const isMainAppRoute =
    segments.length > 0 &&
    segments[0] !== 'onboarding' &&
    segments[0] !== 'auth' &&
    segments[0] !== 'paywall-gate';
  const hasSeenServer = !FORCE_TOUR_ON_DEV_REFRESH && Boolean(
    profile?.has_seen_in_app_tour &&
    profile?.in_app_tour_completed_at &&
    (profile?.in_app_tour_version ?? 0) >= IN_APP_TOUR_VERSION
  );
  const hasServerStartedCurrentTour = !FORCE_TOUR_ON_DEV_REFRESH && Boolean(
    profile?.has_seen_in_app_tour &&
    (profile?.in_app_tour_version ?? 0) >= IN_APP_TOUR_VERSION
  );
  const shouldUseLocalTourCompletion = !profileResolved || hasSeenServer || hasServerStartedCurrentTour;
  const hasSeenLocal = shouldUseLocalTourCompletion && (
    tourState?.status === 'completed' || tourState?.status === 'skipped'
  );
  const isEligibleForStart =
    tourLoaded &&
    profileResolved &&
    !isInOnboardingOrAuth &&
    isMainAppRoute &&
    isAuthenticated &&
    profile?.onboarding_completed === true &&
    !isTourActive &&
    !hasSeenServer &&
    !hasSeenLocal;

  const queueTourStartAfterPaywallClose = useCallback(() => {
    setPendingPaywallStartRequestedAt(Date.now());
  }, []);

  // Auto-start tour when eligible.
  useEffect(() => {
    if (!isEligibleForStart) return;
    const run = async () => {
      await startTour();
    };
    void run();
  }, [isEligibleForStart, startTour]);

  // Prioritize starting the tour right after paywall close.
  useEffect(() => {
    if (pendingPaywallStartRequestedAt === null) return;

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const deadlineMs = pendingPaywallStartRequestedAt + 5000;

    const attemptStart = async () => {
      if (cancelled) return;
      const hasSeenTour = hasSeenServer || hasSeenLocal;
      if (hasSeenTour) {
        if (!cancelled) {
          setPendingPaywallStartRequestedAt(null);
        }
        return;
      }

      const isReadyToStart =
        tourLoaded &&
        profileResolved &&
        isMainAppRoute &&
        isAuthenticated &&
        profile?.onboarding_completed === true &&
        !isTourActive;

      if (isReadyToStart) {
        const didStart = await startTour();
        if (didStart) {
          if (!cancelled) {
            setPendingPaywallStartRequestedAt(null);
          }
          return;
        }
      }

      if (Date.now() >= deadlineMs) {
        if (!cancelled) {
          setPendingPaywallStartRequestedAt(null);
        }
        return;
      }

      retryTimeout = setTimeout(() => {
        void attemptStart();
      }, 120);
    };

    void attemptStart();

    return () => {
      cancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [
    hasSeenLocal,
    hasSeenServer,
    isAuthenticated,
    isMainAppRoute,
    isTourActive,
    pendingPaywallStartRequestedAt,
    profile?.onboarding_completed,
    profileResolved,
    startTour,
    tourLoaded,
  ]);

  // Advance when a workout is launched from Quick Start.
  useEffect(() => {
  if (!isTourActive || logicalStep?.id !== 'launch_workout') return;
    if (isOnStepRoute('/workout/active')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, logicalStep?.id]);

  // Advance when the AI chat is opened.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'ai_chat_open') return;
    if (isOnStepRoute('/ai/chat')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, logicalStep?.id]);

  // Advance after the user closes the workout builder.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'close_workout_builder') return;
    if (isOnStepRoute('/(tabs)')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, logicalStep?.id]);

  // Advance when user reaches the Insights tab.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'go_insights') return;
    if (isOnStepRoute('/(tabs)/insights')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, logicalStep?.id]);

  const contextValue = useMemo<InAppTourContextValue>(() => ({
    registerAnchorRect,
    unregisterAnchor,
    isTourActive,
    activeStepId: logicalStep?.id ?? null,
    activeAnchorId: logicalStep?.anchorId ?? null,
    advanceStep: () => void advanceStep(),
    skipTour: () => void finishTour('skipped'),
    currentStepNumber: logicalStep ? getStepIndexById(logicalStep.id) + 1 : null,
    totalSteps: TOUR_STEPS.length,
    queueTourStartAfterPaywallClose,
    shouldBypassProGateForTour: (placement) => shouldBypassProGateForTourState({
      activeStepId: logicalStep?.id ?? null,
      isTourActive,
      placement,
    }),
  }), [advanceStep, finishTour, isTourActive, logicalStep, queueTourStartAfterPaywallClose, registerAnchorRect, unregisterAnchor]);

  const primaryAction = useMemo(() => {
    if (!isTourActive || !overlayStep || !overlayStep.primaryActionLabel) return null;
    const canAdvanceFromDisplayedStep =
      !isExitingTooltip &&
      !pendingStepId &&
      logicalStep?.id === overlayStep.id;
    return {
      label: overlayStep.primaryActionLabel,
      onPress: () => {
        if (!canAdvanceFromDisplayedStep) return;
        void advanceStep();
      },
      disabled: !canAdvanceFromDisplayedStep,
    };
  }, [advanceStep, isExitingTooltip, isTourActive, logicalStep?.id, overlayStep, pendingStepId]);

  const skipAction = useMemo(() => {
    if (!isTourActive || !overlayStep) return null;
    const canSkip =
      !isExitingTooltip &&
      !pendingStepId &&
      logicalStep?.id === overlayStep.id;
    return {
      label: 'Skip',
      onPress: () => {
        if (!canSkip) return;
        void finishTour('skipped');
      },
      disabled: !canSkip,
    };
  }, [finishTour, isExitingTooltip, isTourActive, logicalStep?.id, overlayStep, pendingStepId]);

  const stepLabel = useMemo(() => {
    if (!isTourActive || !overlayStep) return null;
    return `Step ${getStepIndexById(overlayStep.id) + 1} of ${TOUR_STEPS.length}`;
  }, [isTourActive, overlayStep]);

  const showOverlay = Boolean(
    isTourActive &&
    overlayStep &&
    overlayStep.renderOverlay !== false &&
    isAuthenticated &&
    isMainAppRoute &&
    isOverlayStepOnRoute &&
    (!overlayStep.anchorId || currentAnchorRect)
  );
  const aiChatTourNarration = getAIChatTourNarrationVoice(profile?.gender) === 'cedar'
    ? AI_CHAT_TOUR_NARRATION_CEDAR
    : AI_CHAT_TOUR_NARRATION_DEFAULT;
  const {
    isPlaying: isTourNarrationPlaying,
    hasPlayed: hasPlayedTourNarration,
    replay: replayTourNarration,
  } = useTourNarration({
    enabled: showOverlay && overlayStep?.id === 'ai_chat_overview',
    source: aiChatTourNarration,
    autoPlay: false,
  });

  const auxiliaryAction = useMemo(() => {
    if (!showOverlay || overlayStep?.id !== 'ai_chat_overview') return null;
    return {
      label: isTourNarrationPlaying
        ? 'Playing demo'
        : hasPlayedTourNarration
          ? 'Replay demo'
          : 'Play demo',
      onPress: () => {
        void replayTourNarration();
      },
      disabled: isTourNarrationPlaying,
    };
  }, [hasPlayedTourNarration, isTourNarrationPlaying, overlayStep?.id, replayTourNarration, showOverlay]);
  const showPrimaryStylePicker = Boolean(
    isTourActive &&
    logicalStep?.id === 'primary_style' &&
    isAuthenticated &&
    isMainAppRoute &&
    isLogicalStepOnRoute
  );

  return (
    <InAppTourContext.Provider value={contextValue}>
      {children}
      <TourOverlay
        visible={showOverlay}
        mode={overlayStep?.mode ?? 'blocking'}
        anchorRect={currentAnchorRect}
        secondaryAnchorRect={secondaryAnchorRect}
        body={overlayStep?.body ?? ''}
        stepLabel={stepLabel}
        primaryAction={primaryAction}
        secondaryAction={skipAction}
        auxiliaryAction={auxiliaryAction}
        showArrow={Boolean(overlayStep?.showArrow) && isTooltipVisible && Boolean(currentAnchorRect)}
        centerTooltip={
          Boolean(overlayStep?.centerTooltip) ||
          (overlayStep?.mode === 'spotlight' && !currentAnchorRect)
        }
        showHighlight={isTooltipVisible && (overlayStep?.showHighlight ?? true) && Boolean(currentAnchorRect)}
        hideTooltip={Boolean(overlayStep?.hideTooltip) || !isTooltipVisible}
        tooltipOffsetY={overlayStep?.tooltipOffsetY ?? 0}
        pinTooltipToTop={overlayStep?.pinTooltipToTop ?? false}
        tooltipTopOffset={overlayStep?.tooltipTopOffset ?? 0}
        placement={overlayStep?.placement}
        holePadding={overlayStep?.holePadding}
        holePaddingBottom={overlayStep?.holePaddingBottom}
        reserveArrowSpace={overlayStep?.reserveArrowSpace}
        allowAnchorInteraction={overlayStep?.allowAnchorInteraction}
        onTooltipHideComplete={handleTooltipHideComplete}
      />
      <AccentColorPicker
        visible={showPrimaryStylePicker}
        title="Primary Style"
        description="Make yourself at home."
        closeOnSelect={false}
        showCloseButton={false}
        closeOnBackdropPress={false}
        showThemeToggle
        confirmButtonLabel="Confirm"
        onClose={() => {
          void finishTour('completed');
        }}
        onConfirm={() => {
          void finishTour('completed');
        }}
      />
    </InAppTourContext.Provider>
  );
}
