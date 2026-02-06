import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { usePathname, useRouter, useSegments } from 'expo-router';
import {
  HAS_REQUESTED_REVIEW_DEVICE_KEY,
  HAS_REQUESTED_REVIEW_KEY,
} from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IN_APP_TOUR_VERSION,
  TOUR_ANCHOR_IDS,
  type TourAnchorId,
} from '@/src/constants/inAppTour';
import { useAuth, type Profile } from '@/src/contexts/AuthContext';
import { clearInAppTourState, loadInAppTourState, saveInAppTourState, type PersistedInAppTourState } from '@/src/services/inAppTourService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getScopedItem } from '@/src/utils/scopedStorage';
import { TourOverlay, type AnchorRect, type TourOverlayMode, type TourOverlayPlacement } from '@/src/components/tour/TourOverlay';
import * as StoreReview from 'expo-store-review';

type TourStepId =
  | 'welcome'
  | 'workouts_intro'
  | 'ai_chat_open'
  | 'ai_chat_overview'
  | 'quick_start'
  | 'launch_workout'
  | 'rest_timer'
  | 'rest_timer_settings'
  | 'go_insights'
  | 'insights_overview';

type TourRoute = '/(tabs)' | '/(tabs)/insights' | '/workout/active' | '/ai/chat';

type TourStep = {
  id: TourStepId;
  route: TourRoute;
  anchorId?: TourAnchorId;
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
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/(tabs)',
    body: 'Welcome to Fortis! Congrats on committing to your fitness journey! Now let’s show you around.',
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
    body: 'Workouts are exercise templates. Programs group workouts—drag a workout card into a program to add it.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: true,
  },
  {
    id: 'ai_chat_open',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.aiChatButton,
    body: 'Tap to open the Fortis AI chat.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'ai_chat_overview',
    route: '/ai/chat',
    body: 'Fortis helps with training analysis and insights on your data—weekly progress, trends, and what to do next. Ask about your training insights, weekly progress, trends, and what to focus on next.',
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
    id: 'rest_timer',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.restTimer,
    body: 'Rest Timer keeps you on pace between sets. Tap to start/pause and adjust anytime.',
    mode: 'spotlight',
    primaryActionLabel: 'Next',
    showArrow: true,
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
    body: 'Insights power Fortis AI—tap "Ask Fortis" on any insight to get a breakdown and next steps. Welcome to smarter training!',
    mode: 'blocking',
    primaryActionLabel: 'Done',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
];

const ROUTE_LOCKED_STEP_IDS: ReadonlySet<TourStepId> = new Set([
  'welcome',
  'workouts_intro',
  'ai_chat_overview',
  'quick_start',
  'rest_timer',
  'rest_timer_settings',
  'insights_overview',
]);
const ANCHOR_RECT_JITTER_PX = 2;

const getStepIndexById = (stepId: string): number => {
  const index = TOUR_STEPS.findIndex((step) => step.id === stepId);
  return index === -1 ? 0 : index;
};

type InAppTourContextValue = {
  registerAnchorRect: (id: string, rect: AnchorRect) => void;
  unregisterAnchor: (id: string) => void;
  isTourActive: boolean;
  activeStepId: TourStepId | null;
  advanceStep: () => void;
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
  const { isAuthenticated, profile, updateProfile } = useAuth();
  const forceTourThisSession = useRef(false);

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

  const overlayStepIndex = useMemo(() => {
    if (!overlayStep) return -1;
    return getStepIndexById(overlayStep.id);
  }, [overlayStep]);
  const stepLabel = overlayStepIndex >= 0
    ? `${overlayStepIndex + 1} of ${TOUR_STEPS.length}`
    : undefined;

  const currentAnchorRect = overlayStep?.anchorId ? anchorRects[overlayStep.anchorId] ?? null : null;
  const normalizedPathname = useMemo(
    () => (pathname ? pathname.replace('/(tabs)', '') : ''),
    [pathname]
  );

  const isOnStepRoute = useCallback(
    (route: TourRoute) => {
      if (route === '/(tabs)') {
        return segments[0] === '(tabs)' && (segments.length === 1 || segments[1] === 'index');
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
    if (candidateStep.id === 'go_insights' && isWorkoutActive) return false;
    return true;
  }, [isOnStepRoute, isWorkoutActive]);

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
  }, [isExitingTooltip, isStepReady, isTourActive, isTooltipVisible, pendingStep, renderStepId]);

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

  const requestAppReviewIfNeeded = useCallback(async () => {
    try {
      const deviceRequested = await AsyncStorage.getItem(HAS_REQUESTED_REVIEW_DEVICE_KEY);
      if (deviceRequested === 'true') return;

      const legacyRequested = await getScopedItem(HAS_REQUESTED_REVIEW_KEY);
      if (legacyRequested === 'true') {
        await AsyncStorage.setItem(HAS_REQUESTED_REVIEW_DEVICE_KEY, 'true');
        return;
      }
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return;
      await StoreReview.requestReview();
      await AsyncStorage.setItem(HAS_REQUESTED_REVIEW_DEVICE_KEY, 'true');
    } catch {
      // Ignore review prompt failures; avoid blocking the tour completion.
    }
  }, []);

  const lastCompletedCountRef = useRef<number>(workoutCompletedSessions.length);
  const pendingFirstWorkoutReviewRef = useRef(false);

  const startTour = useCallback(async () => {
    if (!tourLoaded) return;
    if (isTourActive) return;
    if (!isAuthenticated) return;

    const now = new Date().toISOString();
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status: 'in_progress',
      stepId: TOUR_STEPS[0].id,
      updatedAt: now,
    };

    await setTourStateAndPersist(next);
    void markTourSeenOnServer({ status: 'started' });
    router.replace(TOUR_STEPS[0].route);
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
    void markTourSeenOnServer({ status, completedAt: now });
    if (status === 'completed') {
      setTimeout(() => {
        void requestAppReviewIfNeeded();
      }, 600);
    }
  }, [markTourSeenOnServer, requestAppReviewIfNeeded, setTourStateAndPersist, tourLoaded]);

  // Ask for a review after the first completed workout if we haven't already.
  useEffect(() => {
    const prevCount = lastCompletedCountRef.current;
    const nextCount = workoutCompletedSessions.length;
    if (prevCount === nextCount) return;
    lastCompletedCountRef.current = nextCount;

    if (prevCount === 0 && nextCount > 0) {
      if (isTourActive) {
        pendingFirstWorkoutReviewRef.current = true;
        return;
      }
      setTimeout(() => {
        void requestAppReviewIfNeeded();
      }, 600);
    }
  }, [isTourActive, requestAppReviewIfNeeded, workoutCompletedSessions.length]);

  useEffect(() => {
    if (isTourActive) return;
    if (!pendingFirstWorkoutReviewRef.current) return;
    pendingFirstWorkoutReviewRef.current = false;
    setTimeout(() => {
      void requestAppReviewIfNeeded();
    }, 600);
  }, [isTourActive, requestAppReviewIfNeeded]);

  const advanceStep = useCallback(async () => {
    if (!tourLoaded) return;
    if (!isTourActive || currentStepIndex < 0) return;

    const isLast = currentStepIndex >= TOUR_STEPS.length - 1;
    if (isLast) {
      await finishTour('completed');
      return;
    }

    const now = new Date().toISOString();
    const nextStep = TOUR_STEPS[currentStepIndex + 1];
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
      router.replace('/(tabs)');
      return;
    }
    if (logicalStep?.id === 'rest_timer_settings') {
      router.replace('/(tabs)');
    }
  }, [cancelWorkout, currentStepIndex, finishTour, isTourActive, isWorkoutActive, logicalStep?.id, router, setTourStateAndPersist, tourLoaded]);

  const autoNavStepRef = useRef<string | null>(null);

  // One-time navigation per step (avoid fighting user-driven navigation when a step advances itself).
  useEffect(() => {
    if (!isTourActive || !logicalStep) return;
    if (autoNavStepRef.current === logicalStep.id) return;
    autoNavStepRef.current = logicalStep.id;

    if (!isOnStepRoute(logicalStep.route)) {
      router.replace(logicalStep.route);
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
    router.replace(logicalStep.route);
  }, [isLogicalStepOnRoute, isTourActive, logicalStep, router, shouldRouteLockLogicalStep]);

  // Defensive close: step 9 should never render with an active workout session.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'go_insights') return;
    if (!isWorkoutActive) return;
    cancelWorkout();
  }, [cancelWorkout, isTourActive, isWorkoutActive, logicalStep?.id]);

  // Load persisted tour state (resume).
  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      const loaded = await loadInAppTourState();
      if (!isMounted) return;

      if (loaded && loaded.version !== IN_APP_TOUR_VERSION) {
        await clearInAppTourState();
        setTourState(null);
        setTourLoaded(true);
        return;
      }

      if (loaded && loaded.status === 'in_progress') {
        const index = getStepIndexById(loaded.stepId);
        const step = TOUR_STEPS[index];
        setTourState({ ...loaded, stepId: step.id });
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
  }, []);

  const isInOnboardingOrAuth = segments[0] === 'onboarding' || segments[0] === 'auth';
  const isMainAppRoute =
    segments.length > 0 &&
    segments[0] !== 'onboarding' &&
    segments[0] !== 'auth' &&
    segments[0] !== 'paywall-gate';
  const hasSeenServer = Boolean(
    profile?.has_seen_in_app_tour &&
    (profile?.in_app_tour_version ?? 0) >= IN_APP_TOUR_VERSION
  );
  const hasSeenLocal = tourState?.status === 'completed' || tourState?.status === 'skipped';
  const FORCE_IN_APP_TOUR = true; // TEMP: always run once per app session for testing
  const isEligibleForStart =
    tourLoaded &&
    !isInOnboardingOrAuth &&
    isMainAppRoute &&
    isAuthenticated &&
    profile?.onboarding_completed === true &&
    !isTourActive &&
    (FORCE_IN_APP_TOUR
      ? !forceTourThisSession.current
      : !hasSeenServer && !hasSeenLocal);

  // Auto-start tour when eligible.
  useEffect(() => {
    if (!isEligibleForStart) return;
    const run = async () => {
      if (FORCE_IN_APP_TOUR) {
        forceTourThisSession.current = true;
      }
      await startTour();
    };
    void run();
  }, [isEligibleForStart, startTour]);

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
    advanceStep: () => void advanceStep(),
  }), [advanceStep, isTourActive, logicalStep?.id, registerAnchorRect, unregisterAnchor]);

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

  const showOverlay = Boolean(
    isTourActive &&
    overlayStep &&
    isAuthenticated &&
    isMainAppRoute &&
    (!shouldRouteLockOverlayStep || isOverlayStepOnRoute)
  );

  return (
    <InAppTourContext.Provider value={contextValue}>
      {children}
      <TourOverlay
        visible={showOverlay}
        mode={overlayStep?.mode ?? 'blocking'}
        anchorRect={currentAnchorRect}
        body={overlayStep?.body ?? ''}
        stepLabel={stepLabel}
        primaryAction={primaryAction}
        onSkip={isTourActive ? () => void finishTour('skipped') : null}
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
        onTooltipHideComplete={handleTooltipHideComplete}
      />
    </InAppTourContext.Provider>
  );
}
