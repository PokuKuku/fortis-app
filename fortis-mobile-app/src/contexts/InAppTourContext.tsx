import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { HAS_AUTO_SET_GET_STARTED_PRESET_KEY } from '@/src/constants/storageKeys';
import {
  GET_STARTED_TEMPLATE_ID,
  GET_STARTED_WORKOUT_ID,
  IN_APP_TOUR_VERSION,
  TOUR_ANCHOR_IDS,
  type TourAnchorId,
} from '@/src/constants/inAppTour';
import { useAuth, type Profile } from '@/src/contexts/AuthContext';
import { useEntitlementStatus } from '@/src/hooks/useEntitlementStatus';
import { useGetStartedStatus } from '@/src/hooks/useGetStartedStatus';
import { clearInAppTourState, loadInAppTourState, saveInAppTourState, type PersistedInAppTourState } from '@/src/services/inAppTourService';
import { refreshTrainingInsights } from '@/src/services/insightsService';
import { useStartPresetStore, type StartPreset } from '@/src/store/startPresetStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { TourOverlay, type AnchorRect, type TourOverlayMode } from '@/src/components/tour/TourOverlay';

type TourStepId =
  | 'insights_intro'
  | 'insights_started'
  | 'quick_start'
  | 'finish_workout'
  | 'workout_recap'
  | 'history';

type TourRoute = '/insights' | '/history' | '/workout/active';

type TourStep = {
  id: TourStepId;
  route: TourRoute;
  anchorId: TourAnchorId;
  body: string;
  mode: TourOverlayMode;
  primaryActionLabel?: string | null;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'insights_intro',
    route: '/insights',
    anchorId: TOUR_ANCHOR_IDS.insightsHeader,
    body: 'Insights show what is changing in your training.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
  },
  {
    id: 'insights_started',
    route: '/insights',
    anchorId: TOUR_ANCHOR_IDS.startedCard,
    body: 'Tap any card for details. Ask Fortis explains the why.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
  },
  {
    id: 'quick_start',
    route: '/insights',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Quick Start begins logging fast. Tap it to start Get Started. Press and hold to reset it.',
    mode: 'spotlight',
    primaryActionLabel: null,
  },
  {
    id: 'finish_workout',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.finishWorkoutButton,
    body: 'Log a few sets, then tap Finish. You will get a Workout Recap.',
    mode: 'non_blocking',
    primaryActionLabel: null,
  },
  {
    id: 'workout_recap',
    route: '/insights',
    anchorId: TOUR_ANCHOR_IDS.workoutRecapCard,
    body: 'Here is your Workout Recap. You will see one after every workout.',
    mode: 'blocking',
    primaryActionLabel: 'Next',
  },
  {
    id: 'history',
    route: '/history',
    anchorId: TOUR_ANCHOR_IDS.historyHeader,
    body: 'All workouts live in History. Tap any session to review it.',
    mode: 'blocking',
    primaryActionLabel: 'Done',
  },
];

const getStepIndexById = (stepId: string): number => {
  const index = TOUR_STEPS.findIndex((step) => step.id === stepId);
  return index === -1 ? 0 : index;
};

type InAppTourContextValue = {
  registerAnchorRect: (id: string, rect: AnchorRect) => void;
  unregisterAnchor: (id: string) => void;
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
  const { isLoaded: isEntitlementLoaded, isEntitled } = useEntitlementStatus();
  const { hasCompletedGetStarted } = useGetStartedStatus();

  const startPreset = useStartPresetStore((s) => s.preset);
  const startPresetLoaded = useStartPresetStore((s) => s.isLoaded);
  const loadStartPreset = useStartPresetStore((s) => s.loadPreset);
  const setStartPreset = useStartPresetStore((s) => s.setPreset);

  const workoutActiveSession = useWorkoutStore((s) => s.activeSession);
  const workoutCompletedSessions = useWorkoutStore((s) => s.completedSessions);

  const [tourState, setTourState] = useState<PersistedInAppTourState | null>(null);
  const [tourLoaded, setTourLoaded] = useState(false);
  const [anchorRects, setAnchorRects] = useState<Record<string, AnchorRect>>({});
  const [hasAutoSetGetStarted, setHasAutoSetGetStarted] = useState<boolean | null>(null);

  const isTourActive = tourState?.status === 'in_progress';
  const currentStepIndex = useMemo(() => {
    if (!isTourActive) return -1;
    return getStepIndexById(tourState?.stepId ?? TOUR_STEPS[0].id);
  }, [isTourActive, tourState?.stepId]);

  const rawStep = currentStepIndex >= 0 ? TOUR_STEPS[currentStepIndex] : null;

  const step = useMemo(() => {
    if (!rawStep) return null;
    if (rawStep.id !== 'workout_recap') return rawStep;
    const hasRecapAnchor = Boolean(anchorRects[TOUR_ANCHOR_IDS.workoutRecapCard]);
    return {
      ...rawStep,
      anchorId: hasRecapAnchor ? TOUR_ANCHOR_IDS.workoutRecapCard : TOUR_ANCHOR_IDS.insightsHeader,
    };
  }, [anchorRects, rawStep]);

  const stepLabel = step && currentStepIndex >= 0
    ? `${currentStepIndex + 1} of ${TOUR_STEPS.length}`
    : undefined;

  const currentAnchorRect = step ? anchorRects[step.anchorId] ?? null : null;

  const registerAnchorRect = useCallback((id: string, rect: AnchorRect) => {
    setAnchorRects((prev) => {
      const existing = prev[id];
      if (
        existing &&
        existing.x === rect.x &&
        existing.y === rect.y &&
        existing.width === rect.width &&
        existing.height === rect.height
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
  }, [markTourSeenOnServer, setTourStateAndPersist, tourLoaded]);

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
    await setTourStateAndPersist(next);
  }, [currentStepIndex, finishTour, isTourActive, setTourStateAndPersist, tourLoaded]);

  const autoNavStepRef = useRef<string | null>(null);

  // One-time navigation per step (avoid fighting user-driven navigation when a step advances itself).
  useEffect(() => {
    if (!isTourActive || !step) return;
    if (autoNavStepRef.current === step.id) return;
    autoNavStepRef.current = step.id;

    if (pathname !== step.route) {
      router.replace(step.route);
    }
  }, [isTourActive, pathname, router, step]);

  // Reset per-step navigation when returning from background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        autoNavStepRef.current = null;
      }
    });
    return () => subscription.remove();
  }, []);

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

  // Load the "auto-set Get Started preset" guard flag.
  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      setHasAutoSetGetStarted(null);
      return;
    }

    const run = async () => {
      const raw = await getScopedItem(HAS_AUTO_SET_GET_STARTED_PRESET_KEY);
      if (!isMounted) return;
      setHasAutoSetGetStarted(raw === 'true');
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Ensure start preset is loaded early for new users (so Quick Start works immediately).
  useEffect(() => {
    if (!isAuthenticated) return;
    if (startPresetLoaded) return;
    void loadStartPreset();
  }, [isAuthenticated, loadStartPreset, startPresetLoaded]);

  // Auto-set Quick Start to Get Started once (only when the user hasn't configured it yet).
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isEntitlementLoaded || !isEntitled) return;
    if (hasCompletedGetStarted) return;
    if (!startPresetLoaded) return;
    if (startPreset !== null) return;
    if (hasAutoSetGetStarted !== false) return;

    const preset: StartPreset = {
      type: 'template',
      templateId: GET_STARTED_TEMPLATE_ID,
      templateWorkoutId: GET_STARTED_WORKOUT_ID,
    };

    const run = async () => {
      await setStartPreset(preset);
      await setScopedItem(HAS_AUTO_SET_GET_STARTED_PRESET_KEY, 'true');
      setHasAutoSetGetStarted(true);
    };

    void run();
  }, [
    hasAutoSetGetStarted,
    hasCompletedGetStarted,
    isAuthenticated,
    isEntitled,
    isEntitlementLoaded,
    setStartPreset,
    startPreset,
    startPresetLoaded,
  ]);

  const isInOnboardingOrAuth = segments[0] === 'onboarding' || segments[0] === 'auth';
  const hasSeenServer = Boolean(profile?.has_seen_in_app_tour);
  const hasSeenLocal = tourState?.status === 'completed' || tourState?.status === 'skipped';
  const isEligibleForStart =
    tourLoaded &&
    !isInOnboardingOrAuth &&
    isAuthenticated &&
    profile?.onboarding_completed === true &&
    isEntitlementLoaded &&
    isEntitled &&
    !hasSeenServer &&
    !hasSeenLocal &&
    !isTourActive;

  // Auto-start tour when eligible.
  useEffect(() => {
    if (!isEligibleForStart) return;
    void startTour();
  }, [isEligibleForStart, startTour]);

  // Advance when Quick Start launches a workout.
  useEffect(() => {
    if (!isTourActive || step?.id !== 'quick_start') return;
    if (pathname === '/workout/active') {
      void advanceStep();
    }
  }, [advanceStep, isTourActive, pathname, step?.id]);

  const lastWorkoutActiveRef = useRef<boolean>(Boolean(workoutActiveSession));
  const lastCompletedCountRef = useRef<number>(workoutCompletedSessions.length);
  const pendingAdvanceToRecapRef = useRef(false);

  // Detect workout completion while on the "finish workout" step.
  useEffect(() => {
    const wasActive = lastWorkoutActiveRef.current;
    const isActiveNow = Boolean(workoutActiveSession);
    const prevCompletedCount = lastCompletedCountRef.current;
    const nextCompletedCount = workoutCompletedSessions.length;

    lastWorkoutActiveRef.current = isActiveNow;
    lastCompletedCountRef.current = nextCompletedCount;

    if (!isTourActive || step?.id !== 'finish_workout') return;

    const finishedAWorkout = wasActive && !isActiveNow && nextCompletedCount > prevCompletedCount;
    if (finishedAWorkout) {
      pendingAdvanceToRecapRef.current = true;
    }
  }, [isTourActive, step?.id, workoutActiveSession, workoutCompletedSessions.length]);

  // Only advance to recap after we have left the workout screen (avoid replacing the modal route mid-dismiss).
  useEffect(() => {
    if (!pendingAdvanceToRecapRef.current) return;
    if (!isTourActive) return;
    if (step?.id !== 'finish_workout') return;
    if (pathname === '/workout/active') return;

    pendingAdvanceToRecapRef.current = false;
    void advanceStep();
  }, [advanceStep, isTourActive, pathname, step?.id]);

  // Refresh insights when Get Started is completed (so Recap/Weekly cards appear quickly).
  const refreshedAfterGetStartedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (hasCompletedGetStarted && !refreshedAfterGetStartedRef.current) {
      refreshedAfterGetStartedRef.current = true;
      void refreshTrainingInsights();
    }
  }, [hasCompletedGetStarted, isAuthenticated]);

  // Refresh insights when we land on the recap step (best effort; handles cases where recap is not yet generated).
  const refreshedOnRecapStepRef = useRef(false);
  useEffect(() => {
    if (!isTourActive || step?.id !== 'workout_recap') {
      refreshedOnRecapStepRef.current = false;
      return;
    }
    if (refreshedOnRecapStepRef.current) return;
    refreshedOnRecapStepRef.current = true;
    void refreshTrainingInsights();
  }, [isTourActive, step?.id]);

  const contextValue = useMemo<InAppTourContextValue>(() => ({
    registerAnchorRect,
    unregisterAnchor,
  }), [registerAnchorRect, unregisterAnchor]);

  const primaryAction = useMemo(() => {
    if (!isTourActive || !step || !step.primaryActionLabel) return null;
    const isLast = step.id === 'history';
    return {
      label: step.primaryActionLabel,
      onPress: () => {
        if (isLast) {
          void finishTour('completed');
          return;
        }
        void advanceStep();
      },
    };
  }, [advanceStep, finishTour, isTourActive, step]);

  return (
    <InAppTourContext.Provider value={contextValue}>
      {children}
      <TourOverlay
        visible={Boolean(isTourActive && step)}
        mode={step?.mode ?? 'blocking'}
        anchorRect={currentAnchorRect}
        body={step?.body ?? ''}
        stepLabel={stepLabel}
        primaryAction={primaryAction}
        onSkip={isTourActive ? () => void finishTour('skipped') : null}
      />
    </InAppTourContext.Provider>
  );
}
