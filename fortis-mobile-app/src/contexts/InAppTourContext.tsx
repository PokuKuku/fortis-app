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
import { useStartPresetStore, type StartPreset } from '@/src/store/startPresetStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { TourOverlay, type AnchorRect, type TourOverlayMode } from '@/src/components/tour/TourOverlay';

type TourStepId =
  | 'programs_intro'
  | 'start_config'
  | 'launch_workout'
  | 'finish_workout';

type TourRoute = '/(tabs)/index' | '/workout/active';

type TourStep = {
  id: TourStepId;
  route: TourRoute;
  anchorId: TourAnchorId;
  body: string;
  mode: TourOverlayMode;
  primaryActionLabel?: string | null;
  showArrow?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'programs_intro',
    route: '/(tabs)/index',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'This button starts your default workout. Set Get Started now, and press & hold anytime to change it later.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
  },
  {
    id: 'start_config',
    route: '/(tabs)/index',
    anchorId: TOUR_ANCHOR_IDS.startConfigGetStarted,
    body: 'Tap Get Started and confirm to lock in your default.',
    mode: 'spotlight',
    primaryActionLabel: null,
  },
  {
    id: 'launch_workout',
    route: '/(tabs)/index',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Now press the dumbbell Start button to launch your workout.',
    mode: 'spotlight',
    primaryActionLabel: null,
  },
  {
    id: 'finish_workout',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.finishWorkoutButton,
    body: 'Do 3 pushups, then tap Finish.',
    mode: 'non_blocking',
    primaryActionLabel: null,
  },
];

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

  const step = currentStepIndex >= 0 ? TOUR_STEPS[currentStepIndex] : null;

  const stepLabel = step && currentStepIndex >= 0
    ? `${currentStepIndex + 1} of ${TOUR_STEPS.length}`
    : undefined;

  const currentAnchorRect = step ? anchorRects[step.anchorId] ?? null : null;
  const normalizedPathname = useMemo(
    () => (pathname ? pathname.replace('/(tabs)', '') : ''),
    [pathname]
  );

  const isOnStepRoute = useCallback(
    (route: TourRoute) => {
      const normalizedRoute = route.replace('/(tabs)', '');
      if (normalizedPathname === normalizedRoute) {
        return true;
      }
      if (route === '/(tabs)/index') {
        return segments[0] === '(tabs)' && segments[1] === 'index';
      }
      if (route === '/workout/active') {
        return segments[0] === 'workout' && segments[1] === 'active';
      }
      return false;
    },
    [normalizedPathname, segments]
  );

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

    if (!isOnStepRoute(step.route)) {
      router.replace(step.route);
    }
  }, [isOnStepRoute, isTourActive, router, step]);

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
  const hasSeenServer = Boolean(
    profile?.has_seen_in_app_tour &&
    (profile?.in_app_tour_version ?? 0) >= IN_APP_TOUR_VERSION
  );
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

  // Advance when the Start FAB launches a workout.
  useEffect(() => {
    if (!isTourActive || step?.id !== 'launch_workout') return;
    if (isOnStepRoute('/workout/active')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, step?.id]);

  const lastWorkoutActiveRef = useRef<boolean>(Boolean(workoutActiveSession));
  const lastCompletedCountRef = useRef<number>(workoutCompletedSessions.length);

  // Detect workout completion while on the "finish workout" step and complete the tour.
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
      void finishTour('completed');
      router.replace('/(tabs)/insights');
    }
  }, [finishTour, isTourActive, router, step?.id, workoutActiveSession, workoutCompletedSessions.length]);

  const contextValue = useMemo<InAppTourContextValue>(() => ({
    registerAnchorRect,
    unregisterAnchor,
    isTourActive,
    activeStepId: step?.id ?? null,
    advanceStep: () => void advanceStep(),
  }), [advanceStep, isTourActive, registerAnchorRect, step?.id, unregisterAnchor]);

  const primaryAction = useMemo(() => {
    if (!isTourActive || !step || !step.primaryActionLabel) return null;
    return {
      label: step.primaryActionLabel,
      onPress: () => {
        void advanceStep();
      },
    };
  }, [advanceStep, isTourActive, step]);

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
        showArrow={Boolean(step?.showArrow)}
      />
    </InAppTourContext.Provider>
  );
}
