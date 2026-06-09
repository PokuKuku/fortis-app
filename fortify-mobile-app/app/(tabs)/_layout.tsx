import { Tabs, usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Modal,
  ScrollView,
  TextInput,
  DeviceEventEmitter,
  Alert,
  AppState,
  type AppStateStatus,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSuperwall, useUser } from 'expo-superwall';
import { CalendarDaysIcon, Squares2X2Icon, UserIcon, SparklesIcon, ChartBarIcon } from 'react-native-heroicons/outline';
import { DumbbellIcon } from '../../src/components/icons/DumbbellIcon';
import { GlassButton } from '../../components/GlassButton';
import { useAIStore } from '../../src/store/aiStore';
import { Colors } from '../../constants/Colors';
import { Sizes } from '../../constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS, TOUR_QUICK_START_TEMPLATE_ID } from '@/src/constants/inAppTour';
import { scale, moderateScale } from '@/src/utils/responsive';
import { useAuth } from '@/src/contexts/AuthContext';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useStartPresetStore, type StartPreset } from '@/src/store/startPresetStore';
import { StartButtonConfigModal } from '@/src/components/workout/modals/StartButtonConfigModal';
import { FirstWorkoutStreakModal } from '@/src/components/workout/modals/FirstWorkoutStreakModal';
import {
  CATEGORIES,
  EQUIPMENT_TYPES,
} from '@/src/constants/exerciseOptions';
import { ACTIVE_MUSCLE_KEYS, getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { useExercises } from '@/src/hooks/useExercises';
import { buildExerciseSearchIndex, searchExercises as searchExercisesInIndex } from '@/src/utils/exerciseSearch';
import { saveCustomExercise } from '@/src/services/exerciseService';
import { startWorkoutFromStartPreset } from '@/src/services/startWorkoutFromPreset';
import { triggerImmediateNavigationHaptic } from '@/src/components/haptics/navigationHaptics';
import { reconcileSubscriptionStatus } from '@/src/components/superwall/subscriptionStatusSync';
import { usePendingOnboardingAuthCompletion } from '@/src/utils/onboardingAuthCompletion';

type PrimaryTabRoute = 'history' | 'insights' | 'index' | 'profile';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useTheme();
  const {
    isAuthenticated,
    isLoading,
    needsOnboarding,
    profile,
    profileResolved,
    user: authUser,
  } = useAuth();
  const {
    isPending: hasPendingOnboardingAuthCompletion,
    isResolved: pendingOnboardingAuthCompletionResolved,
  } = usePendingOnboardingAuthCompletion();
  const { subscriptionStatus, getEntitlements, setSubscriptionStatus, user: superwallUser } = useUser();
  const { isSuperwallReady } = useSuperwall((state) => ({
    isSuperwallReady: state.isConfigured && !state.isLoading,
  }));
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();

  // Theme-aware dynamic styles for accent color
  const themedStyles = {
    tabIconContainerActive: {
      backgroundColor: colors.accentOverlay,
    },
    chipActive: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accent,
    },
    chipTextActive: {
      color: colors.accent,
    },
    modalSave: {
      borderColor: colors.accent,
      backgroundColor: colors.accentOverlay,
    },
    modalSaveText: {
      color: colors.accent,
    },
  };
  const isExercises = pathname?.includes('/exercises');
  const isWorkoutActive = useWorkoutStore(s => s.isWorkoutActive);
  const showFirstWorkoutStreakModal = useWorkoutStore(s => s.showFirstWorkoutStreakModal);
  const dismissFirstWorkoutStreakModal = useWorkoutStore(s => s.dismissFirstWorkoutStreakModal);
  const { programs, fetchPrograms, isLoading: isProgramsLoading } = useProgramsStore();
  const loadProgramProgress = useProgramProgressStore(s => s.loadProgress);
  const startPreset = useStartPresetStore(s => s.preset);
  const loadStartPreset = useStartPresetStore(s => s.loadPreset);
  const setStartPreset = useStartPresetStore(s => s.setPreset);
  // Tab bar stays at fixed position
  const tabBarBottom = scale(14);
  const TAB_BAR_HEIGHT = scale(64);
  const TAB_BAR_RADIUS = Math.round(TAB_BAR_HEIGHT / 2);
  const TAB_BAR_PADDING_X = scale(20);
  const TAB_BAR_ITEM_MAX_WIDTH = scale(76);
  const TAB_BAR_LABEL_SIZE = moderateScale(8);
  const TAB_ICON_SIZE = scale(22);
  const CENTER_BUTTON_SIZE = scale(52);
  const CENTER_BUTTON_ICON_SIZE = scale(26);
  const FAB_BUTTON_SIZE = scale(68);
  const FAB_ICON_SIZE = scale(34);
  const TAB_BAR_MAX_WIDTH = scale(420);
  const accessSyncInFlightRef = useRef(false);
  const initialAccessSyncCompletedRef = useRef(false);
  const lastAccessSyncAtRef = useRef(0);
  const subscriptionStatusRef = useRef(subscriptionStatus);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const authUserId = authUser?.id ?? null;
  const superwallUserId =
    typeof superwallUser?.appUserId === 'string' && superwallUser.appUserId.trim().length > 0
      ? superwallUser.appUserId
      : null;
  const isIdentityReadyForAccessCheck = authUserId ? superwallUserId === authUserId : superwallUserId === null;

  useEffect(() => {
    subscriptionStatusRef.current = subscriptionStatus;
  }, [subscriptionStatus]);

  const syncAccessState = useCallback(
    async (reason: 'initial' | 'app-active') => {
      if (accessSyncInFlightRef.current) {
        return;
      }
      if (isLoading || !isAuthenticated || !isSuperwallReady || !isIdentityReadyForAccessCheck) {
        return;
      }

      const now = Date.now();
      if (reason === 'app-active' && now - lastAccessSyncAtRef.current < 3_000) {
        return;
      }

      accessSyncInFlightRef.current = true;
      try {
        const reconciliation = await reconcileSubscriptionStatus({
          currentStatus: subscriptionStatusRef.current,
          getEntitlements,
          setSubscriptionStatus,
          onError: (error) => {
            if (__DEV__) {
              console.warn('[Superwall] tabs entitlement reconciliation failed', { reason, error });
            }
          },
        });

        lastAccessSyncAtRef.current = Date.now();

        if (
          reconciliation.wasVerified &&
          !reconciliation.hasActiveSubscription &&
          profileResolved &&
          profile?.onboarding_completed === true
        ) {
          router.replace('/paywall-gate');
        }
      } finally {
        accessSyncInFlightRef.current = false;
      }
    },
    [
      getEntitlements,
      isAuthenticated,
      isIdentityReadyForAccessCheck,
      isLoading,
      isSuperwallReady,
      profile?.onboarding_completed,
      profileResolved,
      router,
      setSubscriptionStatus,
    ],
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/onboarding/welcome');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !profileResolved) {
      return;
    }
    if (
      pendingOnboardingAuthCompletionResolved &&
      hasPendingOnboardingAuthCompletion &&
      profile?.onboarding_completed === true
    ) {
      router.replace('/paywall-gate');
      return;
    }
    if (!profile || needsOnboarding) {
      if (
        !pendingOnboardingAuthCompletionResolved ||
        hasPendingOnboardingAuthCompletion
      ) {
        return;
      }
      router.replace('/onboarding');
    }
  }, [
    hasPendingOnboardingAuthCompletion,
    isAuthenticated,
    isLoading,
    needsOnboarding,
    pendingOnboardingAuthCompletionResolved,
    profile,
    profileResolved,
    router,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      initialAccessSyncCompletedRef.current = false;
      return;
    }
    if (initialAccessSyncCompletedRef.current) {
      return;
    }
    if (isLoading || !isSuperwallReady || !isIdentityReadyForAccessCheck) {
      return;
    }

    initialAccessSyncCompletedRef.current = true;
    void syncAccessState('initial');
  }, [isAuthenticated, isIdentityReadyForAccessCheck, isLoading, isSuperwallReady, syncAccessState]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active'
      ) {
        void syncAccessState('app-active');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncAccessState]);

  useEffect(() => {
    if (!isLoading) {
      loadStartPreset();
    }
  }, [isLoading, isAuthenticated, loadStartPreset]);

  useEffect(() => {
    loadProgramProgress();
  }, [loadProgramProgress]);

  // AI Store
  const { conversation } = useAIStore();
  const hasActiveChat =
    pathname !== '/ai/chat' &&
    (conversation?.messages.length ?? 0) > 0;
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [secondaryMuscle, setSecondaryMuscle] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [basedOnQuery, setBasedOnQuery] = useState('');
  const [basedOnExerciseId, setBasedOnExerciseId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    primary: false,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [startConfigVisible, setStartConfigVisible] = useState(false);
  const [draftStartPreset, setDraftStartPreset] = useState<StartPreset | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [pendingTabFeedback, setPendingTabFeedback] = useState<PrimaryTabRoute | null>(null);
  const nameShake = useRef(new Animated.Value(0)).current;
  const primaryShake = useRef(new Animated.Value(0)).current;
  const startActionLock = useRef(false);
  const pendingTabFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { exercises: allExercises } = useExercises();

  const canonicalExercises = useMemo(
    () => allExercises.filter((exercise) =>
      exercise.source !== 'custom' &&
      !exercise.canonicalId &&
      !exercise.isHidden &&
      exercise.isCurated
    ),
    [allExercises]
  );

  const basedOnSearchIndex = useMemo(
    () => buildExerciseSearchIndex(canonicalExercises),
    [canonicalExercises]
  );

  const basedOnResults = useMemo(() => {
    if (!basedOnQuery.trim()) return [];
    return searchExercisesInIndex(basedOnQuery, basedOnSearchIndex, {
      includeInstructions: false,
    }).slice(0, 8);
  }, [basedOnQuery, basedOnSearchIndex]);

  const basedOnSelection = useMemo(
    () => canonicalExercises.find((exercise) => exercise.id === basedOnExerciseId) ?? null,
    [canonicalExercises, basedOnExerciseId]
  );

  const templates = useMemo(
    () => programs.filter((program) => program.isTemplate),
    [programs]
  );
  const programPlans = useMemo(
    () => programs.filter((program) => !program.isTemplate),
    [programs]
  );

  const startPresetLabel = useMemo(() => {
    if (!startPreset) return 'Not set';
    if (startPreset.type === 'blank') return 'Blank workout';
    if (startPreset.type === 'program') {
      return programs.find((program) => program.id === startPreset.programId)?.name ?? 'Program';
    }
    const templateMatch = programs.find((program) =>
      program.isTemplate && (
        program.id === startPreset.templateId ||
        program.workouts.some((workout) => workout.id === startPreset.templateWorkoutId)
      )
    );
    return templateMatch?.name ?? 'Workout template';
  }, [startPreset, programs]);

  const upperQuickStartTemplate = useMemo(
    () => templates.find((template) => template.id === TOUR_QUICK_START_TEMPLATE_ID) ?? null,
    [templates]
  );

  const isQuickStartUpperPreset = (preset: StartPreset | null) => {
    if (!preset || preset.type !== 'template') return false;

    if (preset.templateId === TOUR_QUICK_START_TEMPLATE_ID) {
      return true;
    }

    if (!upperQuickStartTemplate || !preset.templateWorkoutId) {
      return false;
    }

    return upperQuickStartTemplate.workouts.some((workout) => workout.id === preset.templateWorkoutId);
  };

  const startButtonColors = startPreset
    ? (colors.buttonGradient as unknown as string[])
    : (colors.contrastGradient as unknown as string[]);

  // Track exercise detail modal visibility to disable FAB interactions
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('exerciseDetailVisible', (visible: boolean) => {
      setDetailModalVisible(!!visible);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    setPendingTabFeedback(null);
    if (pendingTabFeedbackTimeoutRef.current) {
      clearTimeout(pendingTabFeedbackTimeoutRef.current);
      pendingTabFeedbackTimeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (pendingTabFeedbackTimeoutRef.current) {
        clearTimeout(pendingTabFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const handlePrimaryTabPress = (tabName: PrimaryTabRoute) => {
    setPendingTabFeedback(tabName);
    if (pendingTabFeedbackTimeoutRef.current) {
      clearTimeout(pendingTabFeedbackTimeoutRef.current);
    }
    pendingTabFeedbackTimeoutRef.current = setTimeout(() => {
      setPendingTabFeedback(null);
      pendingTabFeedbackTimeoutRef.current = null;
    }, 240);
    triggerImmediateNavigationHaptic();
  };

  const handleAiPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/ai/chat');
  };

  const openStartConfig = async () => {
    if (startConfigVisible || isWorkoutActive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    setDraftStartPreset(startPreset);
    setStartConfigVisible(true);
    if (!programs.length) {
      await fetchPrograms();
    }
  };

  const startWorkoutFromPreset = async (preset: StartPreset) => {
    if (isWorkoutActive) return;
    if (startActionLock.current) return;
    startActionLock.current = true;

    try {
      const result = await startWorkoutFromStartPreset(preset);
      if (result === 'started') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        router.push('/workout/active');
        return;
      }

      await setStartPreset(null);
      openStartConfig();
    } finally {
      setTimeout(() => {
        startActionLock.current = false;
      }, 500);
    }
  };

  const handleStartPress = async () => {
    if (isWorkoutActive) return;
    if (isTourActive && activeStepId === 'quick_start') {
      await openStartConfig();
      return;
    }
    if (!startPreset) {
      await openStartConfig();
      return;
    }

    await startWorkoutFromPreset(startPreset);
  };

  const handleStartLongPress = () => {
    if (isWorkoutActive) return;
    openStartConfig();
  };

  const handleChangeStartPreset = (preset: StartPreset | null) => {
    setDraftStartPreset(preset);
  };

  const handleConfirmStartPreset = async () => {
    let nextPreset = draftStartPreset ?? null;

    if (isTourActive && activeStepId === 'quick_start') {
      if (!isQuickStartUpperPreset(nextPreset)) {
        nextPreset = upperQuickStartTemplate
          ? {
              type: 'template',
              templateId: upperQuickStartTemplate.id,
              templateWorkoutId: upperQuickStartTemplate.workouts[0]?.id,
            }
          : null;
      }
    }

    await setStartPreset(nextPreset);
    setStartConfigVisible(false);
    if (isTourActive && activeStepId === 'quick_start' && isQuickStartUpperPreset(nextPreset)) {
      advanceStep();
    }
  };

  const resetExerciseForm = () => {
    setExerciseName('');
    setPrimaryMuscle('');
    setSecondaryMuscle('');
    setCategory('');
    setEquipment('');
    setInstructions('');
    setBasedOnQuery('');
    setBasedOnExerciseId(null);
    setEditingExerciseId(null);
  };

  const handleSaveExercise = async () => {
    const missing = {
      name: !exerciseName.trim(),
      primary: !primaryMuscle,
    };
    setFieldErrors(missing);

    const triggerShake = (anim: Animated.Value) => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    if (missing.name || missing.primary) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      if (missing.name) triggerShake(nameShake);
      if (missing.primary) triggerShake(primaryShake);
      return;
    }

    const instructionList = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newExercise = {
      id: editingExerciseId ?? `custom-${Date.now()}`,
      name: exerciseName.trim(),
      primaryMuscles: [primaryMuscle],
      secondaryMuscles: secondaryMuscle ? [secondaryMuscle] : [],
      equipment: equipment || 'Bodyweight',
      category: category || 'Strength',
      instructions: instructionList,
      images: [],
      basedOnExerciseId: basedOnExerciseId ?? null,
    };

    try {
      await saveCustomExercise(newExercise);
      DeviceEventEmitter.emit('customExerciseUpsert', newExercise);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      setShowAddExerciseModal(false);
      resetExerciseForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save custom exercise.';
      Alert.alert('Save failed', message);
      console.warn('Failed to save custom exercise', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    }
  };

  // Listen for edit requests from the exercises screen to prefill the modal
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openEditExercise', (exercise: any) => {
      if (!exercise || !isExercises) return;
      setExerciseName(exercise.name || '');
      setCategory(exercise.category || '');
      setPrimaryMuscle(exercise.primaryMuscles?.[0] || '');
      setSecondaryMuscle(exercise.secondaryMuscles?.[0] || '');
      setEquipment(exercise.equipment || '');
      setInstructions(
        Array.isArray(exercise.instructions)
          ? exercise.instructions.join('\n')
          : exercise.instructions || ''
      );
      setBasedOnExerciseId(exercise.basedOnExerciseId || null);
      setBasedOnQuery('');
      setEditingExerciseId(exercise.id || null);
      setFieldErrors({ name: false, primary: false });
      setShowAddExerciseModal(true);
    });
    return () => sub.remove();
  }, [isExercises]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openCreateExercise', () => {
      if (!isExercises) return;
      resetExerciseForm();
      setFieldErrors({ name: false, primary: false });
      setShowAddExerciseModal(true);
    });
    return () => sub.remove();
  }, [isExercises]);

  const shakeStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  });

  // Use centralized exercise option constants
  const optionList = {
    primaryMuscles: [...ACTIVE_MUSCLE_KEYS],
    categories: [...CATEGORIES],
    equipmentTypes: [...EQUIPMENT_TYPES],
  };

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Tabs
        detachInactiveScreens
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          animation: 'shift',
          animationEnabled: true,
          sceneStyle: { backgroundColor: colors.background },
          lazy: true,
          unmountOnBlur: false,
          freezeOnBlur: true,
          tabBarStyle: {
            backgroundColor: isDark ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderTopWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            paddingHorizontal: TAB_BAR_PADDING_X,
            paddingVertical: 0,
            height: TAB_BAR_HEIGHT,
            position: 'absolute',
            width: '90%',
            maxWidth: TAB_BAR_MAX_WIDTH,
            marginHorizontal: '5%',
            bottom: tabBarBottom,
            borderRadius: TAB_BAR_RADIUS,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 32,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: TAB_BAR_LABEL_SIZE,
            fontWeight: '600',
            marginTop: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            gap: 2,
            maxWidth: TAB_BAR_ITEM_MAX_WIDTH,
            paddingTop: moderateScale(6),
          },
        }}
    >
      <Tabs.Screen
        name="history"
        listeners={{
          tabPress: () => {
            handlePrimaryTabPress('history');
          },
        }}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                (focused || pendingTabFeedback === 'history') && themedStyles.tabIconContainerActive,
              ]}
            >
              <CalendarDaysIcon color={color} size={TAB_ICON_SIZE} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        listeners={{
          tabPress: () => {
            handlePrimaryTabPress('insights');
          },
        }}
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <TourAnchor id={TOUR_ANCHOR_IDS.insightsTab}>
              <View
                style={[
                  styles.tabIconContainer,
                  (focused || pendingTabFeedback === 'insights') && themedStyles.tabIconContainerActive,
                ]}
              >
                <ChartBarIcon color={color} size={TAB_ICON_SIZE} strokeWidth={2} />
              </View>
            </TourAnchor>
          ),
        }}
      />
      <Tabs.Screen
        name="start"
        listeners={{
          tabPress: (e) => {
            e.preventDefault?.();
            handleAiPress();
          },
          tabLongPress: (e) => {
            e.preventDefault?.();
            handleAiPress();
          },
        }}
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={styles.centerButtonContainer}>
              <TourAnchor id={TOUR_ANCHOR_IDS.aiChatButton}>
                <GlassButton
                  circular
                  size={CENTER_BUTTON_SIZE}
                  style={[
                    styles.centerButton,
                    { borderColor: isDark ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.95)' },
                  ]}
                  gradientColors={hasActiveChat ? (colors.contrastGradient as unknown as string[]) : undefined}
                  onPress={handleAiPress}
                  onLongPress={handleAiPress}
                >
                  <SparklesIcon color="#fff" size={CENTER_BUTTON_ICON_SIZE} strokeWidth={1.5} />
                </GlassButton>
              </TourAnchor>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: TAB_BAR_LABEL_SIZE,
            fontWeight: '700',
            marginTop: moderateScale(2),
          },
        }}
      />
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => {
            handlePrimaryTabPress('index');
          },
        }}
        options={{
          title: 'Programs',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                (focused || pendingTabFeedback === 'index') && themedStyles.tabIconContainerActive,
              ]}
            >
              <Squares2X2Icon color={color} size={TAB_ICON_SIZE} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => {
            handlePrimaryTabPress('profile');
          },
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                (focused || pendingTabFeedback === 'profile') && themedStyles.tabIconContainerActive,
              ]}
            >
              <UserIcon color={color} size={TAB_ICON_SIZE} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>

    <StartButtonConfigModal
      visible={startConfigVisible}
      currentPreset={startPreset}
      draftPreset={draftStartPreset}
      currentLabel={startPresetLabel}
      templates={templates}
      programs={programPlans}
      isLoading={isProgramsLoading}
      onChange={handleChangeStartPreset}
      onConfirm={handleConfirmStartPreset}
      onClose={() => setStartConfigVisible(false)}
      forceTemplateId={null}
    />

    <FirstWorkoutStreakModal
      visible={showFirstWorkoutStreakModal}
      userName={profile?.full_name}
      onClose={dismissFirstWorkoutStreakModal}
    />

    {/* Plus Button */}
    <Animated.View
      style={[
        styles.plusButtonContainer,
        {
          // FAB aligned with mini bar height (88px from bottom)
          bottom: tabBarBottom + TAB_BAR_HEIGHT + scale(20),
          opacity: fabOpacity,
          transform: [
            {
              scale: fabOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents="auto"
    >
      <TourAnchor
        id={TOUR_ANCHOR_IDS.quickStartFab}
        style={{
          width: FAB_BUTTON_SIZE,
          height: FAB_BUTTON_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlassButton
          circular
          size={FAB_BUTTON_SIZE}
          style={[
            styles.plusButton,
            { borderColor: isDark ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.95)' },
            isWorkoutActive && styles.centerButtonDisabled,
          ]}
          gradientColors={startButtonColors}
          onPress={() => void handleStartPress()}
          onLongPress={handleStartLongPress}
          disabled={isWorkoutActive}
          pointerEvents={detailModalVisible ? 'none' : 'auto'}
        >
          <DumbbellIcon color="#fff" size={FAB_ICON_SIZE} fill="#fff" />
        </GlassButton>
      </TourAnchor>
    </Animated.View>

    {/* Add Custom Exercise Modal */}
    <Modal transparent visible={showAddExerciseModal} animationType="fade">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            setShowAddExerciseModal(false);
            resetExerciseForm();
          }}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Custom Exercise</Text>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>Name *</Text>
            <Animated.View style={shakeStyle(nameShake)}>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textInputSingle,
                  fieldErrors.name && styles.invalidInput,
                ]}
                placeholder="e.g. Single Arm Cable Row"
                placeholderTextColor={colors.textTertiary}
                value={exerciseName}
                onChangeText={(v) => {
                  setExerciseName(v);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                }}
              />
            </Animated.View>

            <Text style={styles.inputLabel}>Category (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    category === item && themedStyles.chipActive,
                  ]}
                  onPress={() => setCategory(item === category ? '' : item)}
                >
                  <Text style={[
                    styles.chipText,
                    category === item && themedStyles.chipTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Primary Muscle *</Text>
            <Animated.View style={shakeStyle(primaryShake)}>
              <View style={styles.chipWrap}>
                {optionList.primaryMuscles.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      primaryMuscle === item && themedStyles.chipActive,
                      fieldErrors.primary && styles.invalidChip,
                    ]}
                    onPress={() => {
                      setPrimaryMuscle(item);
                      if (fieldErrors.primary) setFieldErrors(prev => ({ ...prev, primary: false }));
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      primaryMuscle === item && themedStyles.chipTextActive,
                    ]}>
                      {getMuscleDisplayName(item as MuscleKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Text style={styles.inputLabel}>Secondary Muscle (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.primaryMuscles.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, secondaryMuscle === item && themedStyles.chipActive]}
                  onPress={() => setSecondaryMuscle(item === secondaryMuscle ? '' : item)}
                >
                  <Text style={[styles.chipText, secondaryMuscle === item && themedStyles.chipTextActive]}>
                    {getMuscleDisplayName(item as MuscleKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Equipment (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.equipmentTypes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, equipment === item && themedStyles.chipActive]}
                  onPress={() => setEquipment(item === equipment ? '' : item)}
                >
                  <Text style={[styles.chipText, equipment === item && themedStyles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Based on (optional)</Text>
            <View style={styles.basedOnContainer}>
              {basedOnSelection && (
                <View style={styles.basedOnSelectedRow}>
                  <Text style={styles.basedOnSelectedText} numberOfLines={1}>
                    {basedOnSelection.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.basedOnClear}
                    onPress={() => setBasedOnExerciseId(null)}
                  >
                    <Text style={styles.basedOnClearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.textInput}
                placeholder="Search a canonical exercise..."
                placeholderTextColor={colors.textTertiary}
                value={basedOnQuery}
                onChangeText={(value) => {
                  setBasedOnQuery(value);
                }}
              />
              {basedOnQuery.trim().length > 0 && (
                <View style={styles.basedOnResults}>
                  {basedOnResults.length === 0 ? (
                    <Text style={styles.basedOnEmpty}>No matches</Text>
                  ) : (
                    basedOnResults.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.basedOnResultRow}
                        onPress={() => {
                          setBasedOnExerciseId(item.id);
                          setBasedOnQuery('');
                          if (!primaryMuscle && item.primaryMuscles?.[0]) {
                            setPrimaryMuscle(item.primaryMuscles[0]);
                          }
                          if (!secondaryMuscle && item.secondaryMuscles?.[0]) {
                            setSecondaryMuscle(item.secondaryMuscles[0]);
                          }
                          if (!equipment && item.equipment) {
                            setEquipment(item.equipment);
                          }
                          if (!category && item.category) {
                            const match = optionList.categories.find(
                              (entry) => entry.toLowerCase() === item.category.toLowerCase()
                            );
                            if (match) setCategory(match);
                          }
                        }}
                      >
                        <Text style={styles.basedOnResultText} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.primaryMuscles?.length ? (
                          <Text style={styles.basedOnResultMeta}>
                            {getMuscleDisplayName(item.primaryMuscles[0] as MuscleKey)}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <Text style={styles.inputLabel}>Instructions (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.instructionsInput]}
              placeholder="Step-by-step cues"
              placeholderTextColor={colors.textTertiary}
              multiline
              value={instructions}
              onChangeText={setInstructions}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalCancel]}
              onPress={() => {
                setShowAddExerciseModal(false);
                resetExerciseForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, themedStyles.modalSave]}
              onPress={handleSaveExercise}
            >
              <Text style={[styles.modalSaveText, themedStyles.modalSaveText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    padding: scale(6),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    // backgroundColor is now dynamic via themedStyles
  },
  centerButtonContainer: {
    marginTop: -scale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    borderWidth: 2,
  },
  centerButtonDisabled: {
    opacity: 0.4,
  },
  plusButtonContainer: {
    position: 'absolute',
    bottom: scale(24 + 64 + 8),
    right: '5%',
    zIndex: 1000,
  },
  plusButton: {
    borderWidth: 2,
  },
  actionSheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 950,
  },
  actionSheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#24252A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  actionHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#24252A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  textInputSingle: {
    height: 50,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  instructionsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  basedOnContainer: {
    gap: 8,
  },
  basedOnSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  basedOnSelectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  basedOnClear: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  basedOnClearText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  basedOnResults: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  basedOnResultRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  basedOnResultText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  basedOnResultMeta: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  basedOnEmpty: {
    color: '#9ca3af',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: {
    flexGrow: 0,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    // backgroundColor and borderColor are now dynamic via themedStyles
  },
  chipText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    // color is now dynamic via themedStyles
  },
  invalidInput: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  invalidChip: {
    borderColor: '#ef4444',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancel: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modalSave: {
    // borderColor and backgroundColor are now dynamic via themedStyles
  },
  modalCancelText: {
    color: '#d1d5db',
    fontWeight: '700',
  },
  modalSaveText: {
    // color is now dynamic via themedStyles
    fontWeight: '800',
  },
});
