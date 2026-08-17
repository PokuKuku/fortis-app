import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { usePathname, useRouter, useSegments } from 'expo-router';
import {
  IN_APP_TOUR_NEW_USER_CUTOFF,
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
import {
  TourOverlay,
  type AnchorRect,
  type TourArrowDirection,
  type TourOverlayMode,
  type TourOverlayPlacement,
} from '@/src/components/tour/TourOverlay';
import { PAYWALL_PLACEMENTS, type PaywallPlacement } from '@/src/components/superwall/paywallPlacements';
import {
  AI_CHAT_OVERVIEW_COPY,
  AI_TEXT_CHAT_TOUR_COPY,
} from '@/src/utils/aiChatTour';
import { AccentColorPicker } from '@/src/components/ui/AccentColorPicker';
import { posthog } from '@/src/config/posthog';
import { ACCENT_COLORS } from '@/src/utils/accentColors';

// Keep development behavior aligned with production tour completion state.
const FORCE_TOUR_ON_DEV_REFRESH = false;

type TourStepId =
  | 'streak_counter'
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
  | 'close_ai_chat'
  | 'quick_start'
  | 'launch_workout'
  | 'rest_timer'
  | 'open_voice_log'
  | 'fill_weight_column'
  | 'fill_reps_column'
  | 'complete_remaining_sets'
  | 'logging_shortcuts'
  | 'set_target'
  | 'set_target_explanation'
  | 'rest_timer_settings'
  | 'close_active_workout'
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
  arrowAnchorId?: TourAnchorId;
  body: string;
  mode: TourOverlayMode;
  primaryActionLabel?: string | null;
  showArrow?: boolean;
  arrowDirections?: TourArrowDirection[];
  arrowColor?: string;
  boldPhrases?: string[];
  centerTooltip?: boolean;
  showHighlight?: boolean;
  hideTooltip?: boolean;
  tooltipOffsetY?: number;
  pinTooltipToTop?: boolean;
  tooltipTopOffset?: number;
  placement?: TourOverlayPlacement;
  renderOverlay?: boolean;
  holePadding?: number;
  holePaddingHorizontal?: number;
  holePaddingTop?: number;
  holePaddingBottom?: number;
  holeOffsetY?: number;
  reserveArrowSpace?: boolean;
  allowAnchorInteraction?: boolean;
  allowOnlyArrowTargetInteraction?: boolean;
  requiresActionBeforeNext?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/(tabs)',
    body: 'Welcome to Fortify!\n\nLet’s quickly show you around.',
    mode: 'blocking',
    primaryActionLabel: 'Continue',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'streak_counter',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.streakCounter,
    body: 'Press this button to freeze your scheduled workout streak.\n\nThere are 3 freezes available each month.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    placement: 'below',
  },
  {
    id: 'workouts_intro',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.workoutsSection,
    body: 'Workouts are exercise templates.\n\nPrograms group workouts.\n\nDrag a workout card into a program to add it.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    placement: 'below',
  },
  {
    id: 'add_workout_routine',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.addWorkoutRoutine,
    body: 'Tap this button to add a workout',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'open_add_with_voice',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.addWithVoice,
    body: 'Add with Voice allows you to add exercises by speaking.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    holePadding: 0,
  },
  {
    id: 'voice_add_multiple',
    route: '/workout/create',
    anchorId: TOUR_ANCHOR_IDS.workoutExerciseCard,
    body: 'You can voice add multiple exercises at once if needed.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
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
    allowAnchorInteraction: true,
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
    body: 'Your text will now appear as a workout template!',
    mode: 'non_blocking',
    primaryActionLabel: 'Sounds good!',
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
    allowAnchorInteraction: true,
  },
  {
    id: 'ai_chat_open',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.aiChatButton,
    body: 'Tap to open the Fortify AI chat.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'ai_text_chat_overview',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatBackWorkout,
    body: 'Tap Back Workout to see Fortify create a workout for you in Chat.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'ai_text_chat_result',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatWorkoutTemplate,
    secondaryAnchorId: TOUR_ANCHOR_IDS.aiChatBackWorkoutPrompt,
    body: AI_TEXT_CHAT_TOUR_COPY,
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: true,
    requiresActionBeforeNext: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'ai_voice_chat_open',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatVoiceMode,
    body: 'Next, tap Voice to chat with Fortify out loud.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'ai_chat_overview',
    route: '/ai/chat',
    body: AI_CHAT_OVERVIEW_COPY,
    mode: 'blocking',
    primaryActionLabel: 'Continue',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'close_ai_chat',
    route: '/ai/chat',
    anchorId: TOUR_ANCHOR_IDS.aiChatCloseButton,
    body: 'Tap X to close Voice Coach.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: false,
    holePadding: 0,
    allowAnchorInteraction: true,
  },
  {
    id: 'quick_start',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Tap the dumbbell, then select the Back Workout you made earlier.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'launch_workout',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.quickStartFab,
    body: 'Now tap the dumbbell to start your workout.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'open_voice_log',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.voiceLog,
    body: 'You can log your sets with your voice using this button.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    tooltipOffsetY: 18,
  },
  {
    id: 'fill_weight_column',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeWorkoutExerciseCard,
    arrowAnchorId: TOUR_ANCHOR_IDS.activeSetWeight,
    body: 'Press and hold 225 to fill the remaining sets in this weight column.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    arrowDirections: ['top', 'right', 'bottom', 'left'],
    arrowColor: ACCENT_COLORS.midnight.base,
    boldPhrases: ['Press and hold'],
    allowAnchorInteraction: true,
    allowOnlyArrowTargetInteraction: true,
    holePadding: 0,
    holePaddingHorizontal: 8,
    holePaddingTop: 16,
    holePaddingBottom: 0,
  },
  {
    id: 'fill_reps_column',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeSetFillDown,
    body: 'The double down arrow on the keyboard does the same thing: it fills the remaining cells in whichever column you are editing.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    placement: 'above',
    allowAnchorInteraction: true,
    arrowColor: ACCENT_COLORS.midnight.base,
  },
  {
    id: 'complete_remaining_sets',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeWorkoutExerciseCard,
    arrowAnchorId: TOUR_ANCHOR_IDS.activeSetComplete,
    body: 'Press and hold the checkmark in the rightmost column to complete all remaining sets.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    arrowDirections: ['top', 'right', 'bottom', 'left'],
    allowAnchorInteraction: true,
    arrowColor: ACCENT_COLORS.midnight.base,
    boldPhrases: ['Press and hold'],
    holePadding: 0,
    holePaddingHorizontal: 8,
    holePaddingTop: 16,
    holePaddingBottom: 0,
  },
  {
    id: 'logging_shortcuts',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeWorkoutExerciseCard,
    body: 'These shortcuts keep your workout moving. Log repeated sets in seconds, so you can focus on training.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    placement: 'below',
    holePadding: 0,
  },
  {
    id: 'set_target',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.setTarget,
    arrowAnchorId: TOUR_ANCHOR_IDS.setTarget,
    body: 'Tap this button to update your rep range and number of sets.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    allowAnchorInteraction: true,
  },
  {
    id: 'set_target_explanation',
    route: '/workout/active',
    body: 'You can use this control to also make and edit your workouts faster.',
    mode: 'blocking',
    primaryActionLabel: 'Continue',
    showArrow: false,
    renderOverlay: false,
  },
  {
    id: 'rest_timer',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.restTimer,
    body: 'You can adjust your rest timer with this button.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
    reserveArrowSpace: true,
  },
  {
    id: 'rest_timer_settings',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.restTimerSettings,
    body: 'Use this button to set your resting preferences.',
    mode: 'spotlight',
    primaryActionLabel: 'Continue',
    showArrow: false,
  },
  {
    id: 'close_active_workout',
    route: '/workout/active',
    anchorId: TOUR_ANCHOR_IDS.activeWorkoutCloseButton,
    body: 'Tap X to close the workout.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: false,
    holePadding: 0,
    allowAnchorInteraction: true,
  },
  {
    id: 'go_insights',
    route: '/(tabs)',
    anchorId: TOUR_ANCHOR_IDS.insightsTab,
    body: 'Next, tap Insights to see your progress.',
    mode: 'spotlight',
    primaryActionLabel: null,
    showArrow: true,
    holeOffsetY: 6,
    allowAnchorInteraction: true,
  },
  {
    id: 'insights_overview',
    route: '/(tabs)/insights',
    body: 'Tap \'Ask Fortify\' to get deep insights on your training patterns and recommendations.',
    mode: 'blocking',
    primaryActionLabel: 'Continue',
    showArrow: false,
    centerTooltip: true,
    showHighlight: false,
  },
  {
    id: 'support_overview',
    route: '/(tabs)',
    body: 'Need help?\n\nContact us in the support section.\n\nHappy lifting!',
    mode: 'blocking',
    primaryActionLabel: 'Continue',
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

export function getNextInAppTourStepId(currentStepId: TourStepId): TourStepId | null {
  if (currentStepId === 'open_add_with_voice') return 'paste_workout_tip';
  const currentIndex = TOUR_STEPS.findIndex((step) => step.id === currentStepId);
  if (currentIndex < 0 || currentIndex >= TOUR_STEPS.length - 1) return null;
  return TOUR_STEPS[currentIndex + 1].id;
}

export function shouldLockInAppTourScreen(
  isTourActive: boolean,
  mode: TourOverlayMode | null | undefined
): boolean {
  return isTourActive && mode === 'spotlight';
}

const ROUTE_LOCKED_STEP_IDS: ReadonlySet<TourStepId> = new Set([
  'streak_counter',
  'welcome',
  'workouts_intro',
  'ai_text_chat_overview',
  'ai_text_chat_result',
  'ai_voice_chat_open',
  'ai_chat_overview',
  'quick_start',
  'fill_weight_column',
  'fill_reps_column',
  'complete_remaining_sets',
  'logging_shortcuts',
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
  'close_ai_chat',
  'close_active_workout',
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
  log_with_voice: 'fill_weight_column',
  confirm_voice_log: 'fill_weight_column',
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

export function isProfileEligibleForInAppTour(
  profile: Pick<Profile, 'created_at' | 'in_app_tour_version'> | null
): boolean {
  // Version 0 is reserved for an explicit developer/account reset. This lets
  // one legacy test account preview the tour without re-enrolling old users.
  if (profile?.in_app_tour_version === 0) return true;
  if (!profile?.created_at) return false;

  const createdAt = Date.parse(profile.created_at);
  const cutoff = Date.parse(IN_APP_TOUR_NEW_USER_CUTOFF);
  return Number.isFinite(createdAt) && createdAt >= cutoff;
}

export function getInAppTourVersionForServerUpdate(params: {
  currentVersion: number | null | undefined;
  status: 'started' | 'completed' | 'skipped';
}): number {
  // Keep the developer-reset sentinel while a legacy account is taking the
  // tour. Replacing it on start would immediately make the account ineligible
  // again, causing the provider to clear the newly created local tour state.
  if (params.status === 'started' && params.currentVersion === 0) return 0;
  return IN_APP_TOUR_VERSION;
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
  hasTourFinished: boolean;
  activeStepId: TourStepId | null;
  activeAnchorId: TourAnchorId | null;
  activeSecondaryAnchorId: TourAnchorId | null;
  activeArrowAnchorId: TourAnchorId | null;
  isScreenScrollLocked: boolean;
  advanceStep: () => void;
  skipTour: () => void;
  currentStepNumber: number | null;
  totalSteps: number;
  completeCurrentStepAction: () => void;
  queueTourStartAfterPaywallClose: () => void;
  resetTourForDev: () => Promise<void>;
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
  const isNewUserTourEligible = FORCE_TOUR_ON_DEV_REFRESH || isProfileEligibleForInAppTour(profile);
  const isLegacyAccountExcluded = profileResolved && !isNewUserTourEligible;

  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const isWorkoutActive = useWorkoutStore((s) => s.isWorkoutActive);
  const firstExerciseAllSetsCompleted = useWorkoutStore((s) => {
    const sets = s.activeSession?.exercises[0]?.sets ?? [];
    return sets.length > 0 && sets.every((set) => set.isCompleted);
  });

  const [tourState, setTourState] = useState<PersistedInAppTourState | null>(null);
  const [tourLoaded, setTourLoaded] = useState(false);
  const [anchorRects, setAnchorRects] = useState<Record<string, AnchorRect>>({});
  const [renderStepId, setRenderStepId] = useState<TourStepId | null>(null);
  const [pendingStepId, setPendingStepId] = useState<TourStepId | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isExitingTooltip, setIsExitingTooltip] = useState(false);
  const [completedActionStepIds, setCompletedActionStepIds] = useState<Set<TourStepId>>(() => new Set());
  const [pendingPaywallStartRequestedAt, setPendingPaywallStartRequestedAt] = useState<number | null>(null);
  const persistenceQueueRef = useRef<Promise<void>>(Promise.resolve());
  const serverSyncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const advancingStepIdRef = useRef<TourStepId | null>(null);
  const lastTrackedStepIdRef = useRef<TourStepId | null>(null);
  const completedSetsTourAdvanceRef = useRef(false);
  const profileTourVersionRef = useRef(profile?.in_app_tour_version);
  profileTourVersionRef.current = profile?.in_app_tour_version;

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
  const arrowAnchorRect = overlayStep?.arrowAnchorId
    ? anchorRects[overlayStep.arrowAnchorId] ?? null
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

  const setTourStateAndPersist = useCallback((next: PersistedInAppTourState | null): Promise<void> => {
    // Tour interactions are local-first. Persistence is serialized in the
    // background so rapid steps cannot be written out of order.
    setTourState(next);
    const pendingWrite = persistenceQueueRef.current
      .catch(() => undefined)
      .then(() => persistTour(next))
      .catch(() => undefined);
    persistenceQueueRef.current = pendingWrite;
    return pendingWrite;
  }, [persistTour]);

  const syncTourSeenOnServer = useCallback(async (params: {
    completedAt?: string | null;
    status: 'started' | 'completed' | 'skipped';
  }) => {
    if (FORCE_TOUR_ON_DEV_REFRESH) return;
    if (!isAuthenticated) return;

    const payload: Partial<Profile> = {
      has_seen_in_app_tour: true,
      in_app_tour_version: getInAppTourVersionForServerUpdate({
        currentVersion: profileTourVersionRef.current,
        status: params.status,
      }),
    };

    if (params.completedAt) {
      payload.in_app_tour_completed_at = params.completedAt;
    }

    const { error } = await updateProfile(payload, { refresh: false });
    if (error) {
      // Best-effort: local state prevents repeated tours even if this fails.
      console.warn('[InAppTour] Failed to persist tour state:', error.message);
    }
  }, [isAuthenticated, updateProfile]);

  const markTourSeenOnServer = useCallback((params: {
    completedAt?: string | null;
    status: 'started' | 'completed' | 'skipped';
  }): Promise<void> => {
    // Preserve server update order without putting network latency on the
    // interaction path.
    const pendingSync = serverSyncQueueRef.current
      .catch(() => undefined)
      .then(() => syncTourSeenOnServer(params))
      .catch(() => undefined);
    serverSyncQueueRef.current = pendingSync;
    return pendingSync;
  }, [syncTourSeenOnServer]);

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

    setCompletedActionStepIds(new Set());
    void setTourStateAndPersist(next);
    posthog.capture('tour_started');
    void markTourSeenOnServer({ status: 'started' });
    router.navigate(TOUR_STEPS[0].route);
    return true;
  }, [isAuthenticated, isTourActive, markTourSeenOnServer, router, setTourStateAndPersist, tourLoaded]);

  const finishTour = useCallback((status: 'completed' | 'skipped') => {
    if (!tourLoaded) return;
    const now = new Date().toISOString();
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status,
      stepId: TOUR_STEPS[TOUR_STEPS.length - 1].id,
      updatedAt: now,
    };
    void setTourStateAndPersist(next);
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

  const advanceStep = useCallback(() => {
    if (!tourLoaded) return;
    if (!isTourActive || currentStepIndex < 0) return;
    if (!logicalStep || advancingStepIdRef.current === logicalStep.id) return;

    advancingStepIdRef.current = logicalStep.id;

    const isLast = currentStepIndex >= TOUR_STEPS.length - 1;
    if (isLast) {
      finishTour('completed');
      return;
    }

    const now = new Date().toISOString();
    const nextStepId = logicalStep ? getNextInAppTourStepId(logicalStep.id) : null;
    const nextStep = TOUR_STEPS.find((step) => step.id === nextStepId)!;
    const next: PersistedInAppTourState = {
      version: IN_APP_TOUR_VERSION,
      status: 'in_progress',
      stepId: nextStep.id,
      updatedAt: now,
    };

    void setTourStateAndPersist(next);
  }, [currentStepIndex, finishTour, isTourActive, logicalStep?.id, setTourStateAndPersist, tourLoaded]);

  // Long presses update workout state asynchronously. Advance only after the
  // completed sets are committed, which keeps the next tour anchor available.
  useEffect(() => {
    const isCompletionStep = isTourActive && logicalStep?.id === 'complete_remaining_sets';
    if (!isCompletionStep) {
      completedSetsTourAdvanceRef.current = false;
      return;
    }

    if (!firstExerciseAllSetsCompleted || completedSetsTourAdvanceRef.current) {
      return;
    }

    completedSetsTourAdvanceRef.current = true;
    const timer = setTimeout(() => {
      void advanceStep();
    }, 180);
    return () => clearTimeout(timer);
  }, [advanceStep, firstExerciseAllSetsCompleted, isTourActive, logicalStep?.id]);

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

      if (isAuthenticated && profileResolved && !isNewUserTourEligible) {
        await clearInAppTourState();
        if (!isMounted) return;
        setTourState(null);
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
        // Make the restored controls interactive in the same render that
        // reveals them. Neither storage nor the network may gate the first tap.
        void setTourStateAndPersist(resumed);
        setTourLoaded(true);
        void markTourSeenOnServer({ status: 'started' });
        return;
      }

      setTourState(loaded);
      setTourLoaded(true);
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [
    isAuthResolved,
    isAuthenticated,
    isNewUserTourEligible,
    markTourSeenOnServer,
    profileResolved,
    setTourStateAndPersist,
    user?.id,
  ]);

  const isInOnboardingOrAuth = segments[0] === 'onboarding' || segments[0] === 'auth';
  const isMainAppRoute =
    segments.length > 0 &&
    segments[0] !== 'onboarding' &&
    segments[0] !== 'auth' &&
    segments[0] !== 'paywall-gate';
  // Completing or skipping a tour is permanent for an account. Tour versions track
  // the content that was shown to new users; they must not re-enroll existing users.
  const hasSeenServer = !FORCE_TOUR_ON_DEV_REFRESH && Boolean(
    profile?.has_seen_in_app_tour && profile?.in_app_tour_completed_at
  );
  const hasServerStartedTour = !FORCE_TOUR_ON_DEV_REFRESH && Boolean(profile?.has_seen_in_app_tour);
  const shouldUseLocalTourCompletion = !profileResolved || hasSeenServer || hasServerStartedTour;
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
    isNewUserTourEligible &&
    !isTourActive &&
    !hasSeenServer &&
    !hasSeenLocal;
  const hasTourFinished = Boolean(
    isLegacyAccountExcluded || hasSeenServer || tourState?.status === 'completed' || tourState?.status === 'skipped'
  );

  const queueTourStartAfterPaywallClose = useCallback(() => {
    setPendingPaywallStartRequestedAt(Date.now());
  }, []);

  const resetTourForDev = useCallback(async () => {
    setRenderStepId(null);
    setPendingStepId(null);
    setIsTooltipVisible(false);
    setIsExitingTooltip(false);
    setCompletedActionStepIds(new Set());
    advancingStepIdRef.current = null;
    lastTrackedStepIdRef.current = null;
    await setTourStateAndPersist(null);
    setTourLoaded(true);
  }, [setTourStateAndPersist]);

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
      const hasSeenTour = isLegacyAccountExcluded || hasSeenServer || hasSeenLocal;
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
        isNewUserTourEligible &&
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
    isLegacyAccountExcluded,
    isMainAppRoute,
    isNewUserTourEligible,
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

  // Advance after the user closes Voice Coach.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'close_ai_chat') return;
    if (isOnStepRoute('/(tabs)')) {
      void advanceStep();
    }
  }, [advanceStep, isOnStepRoute, isTourActive, logicalStep?.id]);

  // Advance after the user closes the tour-created workout.
  useEffect(() => {
    if (!isTourActive || logicalStep?.id !== 'close_active_workout') return;
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
    hasTourFinished,
    activeStepId: logicalStep?.id ?? null,
    activeAnchorId: logicalStep?.anchorId ?? null,
    activeSecondaryAnchorId: logicalStep?.secondaryAnchorId ?? null,
    activeArrowAnchorId: logicalStep?.arrowAnchorId ?? null,
    isScreenScrollLocked: shouldLockInAppTourScreen(isTourActive, logicalStep?.mode),
    advanceStep: () => void advanceStep(),
    skipTour: () => void finishTour('skipped'),
    currentStepNumber: logicalStep ? getStepIndexById(logicalStep.id) + 1 : null,
    totalSteps: TOUR_STEPS.length,
    completeCurrentStepAction: () => {
      if (!isTourActive || !logicalStep?.requiresActionBeforeNext) return;
      setCompletedActionStepIds((current) => {
        if (current.has(logicalStep.id)) return current;
        const next = new Set(current);
        next.add(logicalStep.id);
        return next;
      });
    },
    queueTourStartAfterPaywallClose,
    resetTourForDev,
    shouldBypassProGateForTour: (placement) => shouldBypassProGateForTourState({
      activeStepId: logicalStep?.id ?? null,
      isTourActive,
      placement,
    }),
  }), [advanceStep, finishTour, hasTourFinished, isTourActive, logicalStep, queueTourStartAfterPaywallClose, registerAnchorRect, resetTourForDev, unregisterAnchor]);

  const primaryAction = useMemo(() => {
    if (!isTourActive || !overlayStep || !overlayStep.primaryActionLabel) return null;
    const isActionRequired = Boolean(overlayStep.requiresActionBeforeNext);
    const hasCompletedRequiredAction = !isActionRequired || completedActionStepIds.has(overlayStep.id);
    const canAdvanceFromDisplayedStep =
      tourLoaded &&
      !isExitingTooltip &&
      !pendingStepId &&
      logicalStep?.id === overlayStep.id &&
      hasCompletedRequiredAction;
    return {
      label: overlayStep.primaryActionLabel,
      onPress: () => {
        if (!canAdvanceFromDisplayedStep) return;
        void advanceStep();
      },
      disabled: !canAdvanceFromDisplayedStep,
    };
  }, [advanceStep, completedActionStepIds, isExitingTooltip, isTourActive, logicalStep?.id, overlayStep, pendingStepId, tourLoaded]);

  const skipAction = useMemo(() => {
    if (!isTourActive || !overlayStep) return null;
    const canSkip =
      tourLoaded &&
      !isExitingTooltip &&
      !pendingStepId &&
      logicalStep?.id === overlayStep.id;
    return {
      label: 'Skip tour',
      onPress: () => {
        if (!canSkip) return;
        void finishTour('skipped');
      },
      disabled: !canSkip,
    };
  }, [finishTour, isExitingTooltip, isTourActive, logicalStep?.id, overlayStep, pendingStepId, tourLoaded]);

  const stepLabel = useMemo(() => {
    if (!isTourActive || !overlayStep) return null;
    return `Step ${getStepIndexById(overlayStep.id) + 1} of ${TOUR_STEPS.length}`;
  }, [isTourActive, overlayStep]);

  const showOverlay = Boolean(
    tourLoaded &&
    isTourActive &&
    overlayStep &&
    overlayStep.renderOverlay !== false &&
    isAuthenticated &&
    isMainAppRoute &&
    isOverlayStepOnRoute &&
    (!overlayStep.anchorId || currentAnchorRect)
  );
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
        arrowTargetRect={arrowAnchorRect}
        body={overlayStep?.body ?? ''}
        stepLabel={stepLabel}
        primaryAction={primaryAction}
        secondaryAction={skipAction}
        showArrow={Boolean(overlayStep?.showArrow) && isTooltipVisible && Boolean(currentAnchorRect)}
        arrowDirections={overlayStep?.arrowDirections}
        arrowColor={overlayStep?.arrowColor}
        boldPhrases={overlayStep?.boldPhrases}
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
        holePaddingHorizontal={overlayStep?.holePaddingHorizontal}
        holePaddingTop={overlayStep?.holePaddingTop}
        holePaddingBottom={overlayStep?.holePaddingBottom}
        holeOffsetY={overlayStep?.holeOffsetY}
        reserveArrowSpace={overlayStep?.reserveArrowSpace}
        allowAnchorInteraction={overlayStep?.allowAnchorInteraction}
        allowOnlyArrowTargetInteraction={overlayStep?.allowOnlyArrowTargetInteraction}
        onTooltipHideComplete={handleTooltipHideComplete}
      />
      <AccentColorPicker
        visible={showPrimaryStylePicker}
        title="Primary Style"
        description="You can change this anytime in settings."
        closeOnSelect={false}
        showCloseButton={false}
        closeOnBackdropPress={false}
        showThemeToggle
        confirmButtonLabel="Continue"
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
