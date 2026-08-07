import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, type ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Pressable,
  DeviceEventEmitter,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  CheckIcon,
} from 'react-native-heroicons/outline';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import Reanimated, { Easing, FadeIn, FadeInDown, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { Colors } from '../../constants/Colors';
import { FontFamily } from '../../constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { InlineSkeleton } from '@/src/components/ui/TabPageSkeleton';
import {
  isStartupRevealComplete,
  subscribeToStartupReveal,
} from '@/src/utils/startupReveal';
import { AppHeaderBrand } from '@/src/components/navigation/AppHeaderBrand';
import { GlassButton } from '../../components/GlassButton';
import { DraggableGrid } from '../../src/components/DraggableGrid';
import { Spacing } from '@/constants/Sizes';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useProgramsStore } from '../../src/store/programsStore';
import { useProgramProgressStore } from '../../src/store/programProgressStore';
import { useStartPresetStore } from '../../src/store/startPresetStore';
import { MAX_WORKOUTS_PER_PROGRAM } from '../../src/constants/programs';
import { BaseModal, useModalStyles } from '../../src/components/ui/BaseModal';
import { useDropZone } from '../../src/hooks/useDropZone';
import { responsiveValue, scale, moderateScale } from '@/src/utils/responsive';
import { isLocalProgramId } from '@/src/utils/localIds';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { HOME_CARD_ORDER_KEY } from '@/src/constants/storageKeys';
import { WeeklyProgressCarousel } from '@/src/components/program/WeeklyProgressCarousel';
import { WorkoutScheduleEditorModal } from '@/src/components/workout/WorkoutScheduleEditorModal';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { useWorkoutSchedule } from '@/src/hooks/useWorkoutSchedule';
import {
  keepSingleOnboardingProgram,
  loadPendingOnboardingProgramSpec,
  ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
  updatePendingOnboardingProgramSpec,
  type OnboardingProgramSpec,
} from '@/src/utils/onboardingProgram';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { ACCENT_COLORS, getContrastAccent } from '@/src/utils/accentColors';
import {
  NEW_USER_CHECKLIST_EVENT,
  NEW_USER_CHECKLIST_EXAMPLE_WORKOUT_TEXT,
  NEW_USER_CHECKLIST_TASKS,
  getDefaultNewUserChecklistState,
  getNewUserChecklistCompletedCount,
  isNewUserChecklistResolved,
  isNewUserChecklistTaskId,
  loadNewUserChecklistState,
  markNewUserChecklistTaskStatus,
  persistNewUserChecklistState,
  type NewUserChecklistState,
  type NewUserChecklistTask,
  type NewUserChecklistTaskId,
  type NewUserChecklistTaskStatus,
} from '@/src/utils/newUserChecklist';

const AnimatedTouchableOpacity = Reanimated.createAnimatedComponent(TouchableOpacity);
const ReanimatedText = Reanimated.createAnimatedComponent(Text);

// Types for drag-and-drop
type ProgramItem = {
  id: string;
  name: string;
  workouts: number;
  weeks: number;
  lastPerformed: string;
  isAiCreated?: boolean;
  aiPayloadVersion?: string | null;
};

type WorkoutItem = {
  id: string;
  name: string;
  exercises: number;
  lastPerformed: string;
  isAiCreated?: boolean;
  isDefault?: boolean;
  syncStatus?: 'pending' | 'syncing' | 'synced' | null;
};

type HomeCardOrderState = {
  programIds: string[];
  workoutIds: string[];
};

const PROGRAM_CARD_HEIGHT = responsiveValue(64, 70, 78);
const WORKOUT_CARD_HEIGHT = responsiveValue(68, 76, 84);
const PROGRAM_CARD_GRID_HEIGHT = PROGRAM_CARD_HEIGHT;
const WORKOUT_CARD_GRID_HEIGHT = WORKOUT_CARD_HEIGHT;
const PROGRAM_CARD_PADDING_HORIZONTAL = responsiveValue(10, 12, 14);
const WORKOUT_CARD_PADDING_HORIZONTAL = responsiveValue(8, 10, 12);
const CARD_PADDING_TOP = responsiveValue(8, 10, 12);
const CARD_PADDING_BOTTOM = responsiveValue(10, 12, 14);
const CARD_CONTENT_NUDGE_Y = responsiveValue(2, 3, 3);
const SECTION_TITLE_SIZE = responsiveValue(18, 20, 22);
const CARD_TITLE_SIZE = responsiveValue(12, 14, 15);
const CARD_META_SIZE = responsiveValue(11, 12, 13);
const HORIZONTAL_PADDING = scale(24);
const HEADER_PADDING_TOP = scale(16);
const HEADER_PADDING_BOTTOM = scale(12);
const SCROLL_PADDING_BOTTOM = scale(120);
const SECTION_SPACING = scale(32);
const PROGRAMS_SECTION_MARGIN_TOP = scale(12);
const SECTION_HEADER_MARGIN = scale(16);
const SECTION_HEADER_GAP = scale(12);
const SECTION_Kebab_PADDING = scale(4);
const SECTION_CHEVRON_SIZE = scale(16);
const SECTION_CHEVRON_BUTTON_SIZE = scale(24);
const KEBAB_ICON_SIZE = scale(20);
const SMALL_ICON_SIZE = scale(16);
const MODAL_ICON_SIZE = scale(24);
const GRID_GAP = scale(12);
const CARD_RADIUS = scale(16);
const CARD_PRESS_DEPTH = scale(2);
const CARD_INNER_EDGE_INSET = scale(2);
const CARD_CORNER_ACCENT_SIZE = scale(14);
const CARD_CORNER_ACCENT_WIDTH = scale(2);
const CARD_HEADER_MARGIN = scale(4);
const CARD_TITLE_GAP = scale(6);
const CARD_Kebab_PADDING = scale(4);
const CARD_Kebab_MARGIN_LEFT = scale(8);
const AI_BADGE_SIZE = scale(14);
const AI_BADGE_MARGIN_LEFT = scale(2);
const EMPTY_PADDING = scale(32);
const EMPTY_TEXT_SIZE = moderateScale(16);
const EMPTY_SUBTEXT_SIZE = moderateScale(14);
const WORKOUTS_COLUMN_GAP = scale(12);
const WORKOUTS_COLUMN_MARGIN = scale(12);
const KEBAB_POPOVER_RADIUS = scale(12);
const KEBAB_POPOVER_PADDING = scale(4);
const KEBAB_OPTION_PADDING_X = scale(16);
const KEBAB_OPTION_PADDING_Y = scale(12);
const KEBAB_OPTION_GAP = scale(12);
const KEBAB_OPTION_TEXT_SIZE = moderateScale(14);
const POPOVER_MARGIN = scale(12);
const KEBAB_POPOVER_WIDTH = scale(200);
const MODAL_PADDING = scale(24);
const MODAL_RADIUS = scale(16);
const MODAL_TITLE_SIZE = moderateScale(20);
const MODAL_MESSAGE_SIZE = moderateScale(14);
const MODAL_MESSAGE_LINE_HEIGHT = moderateScale(20);
const MODAL_BUTTON_GAP = scale(12);

const getReadableSubtextColors = (isDark: boolean) => ({
  meta: isDark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.62)',
});
const MODAL_BUTTON_RADIUS = scale(8);
const MODAL_BUTTON_PADDING = scale(12);
const MODAL_BUTTON_TEXT_SIZE = moderateScale(15);
const MODAL_ACTION_GAP = scale(8);
const TOAST_HEIGHT = scale(48);
const TOAST_RADIUS = scale(8);
const TOAST_PADDING_X = scale(24);
const TOAST_TEXT_SIZE = moderateScale(16);
const TEMPLATE_SYNC_CLOUD_SIZE = scale(14);
const TEMPLATE_SYNC_PILL_PADDING_X = scale(8);
const TEMPLATE_SYNC_PILL_PADDING_Y = scale(3);
const TEMPLATE_SYNC_PILL_TEXT_SIZE = moderateScale(9);
const TEMPLATE_SYNC_ROW_MARGIN_TOP = scale(4);
const ONBOARDING_PREVIEW_MARGIN_TOP = scale(18);
const ONBOARDING_PREVIEW_MARGIN_BOTTOM = scale(24);
const ONBOARDING_PREVIEW_PADDING = scale(18);
const ONBOARDING_PREVIEW_RADIUS = scale(20);
const ONBOARDING_PREVIEW_EYEBROW_SIZE = moderateScale(11);
const ONBOARDING_PREVIEW_TITLE_SIZE = responsiveValue(18, 21, 24);
const ONBOARDING_PREVIEW_BUTTON_PADDING_Y = scale(12);
const ONBOARDING_PREVIEW_BUTTON_MARGIN_TOP = scale(18);
const ONBOARDING_PREVIEW_BUTTON_RADIUS = scale(14);
const ONBOARDING_PREVIEW_BUTTON_TEXT_SIZE = moderateScale(13);
const CHECKLIST_CARD_MARGIN_TOP = 0;
const CHECKLIST_CARD_MARGIN_BOTTOM = scale(24);
const CHECKLIST_CARD_PADDING = scale(14);
const CHECKLIST_CARD_RADIUS = scale(18);
const CHALLENGE_RING_SIZE = scale(54);
const CHALLENGE_RING_STROKE = scale(5);
const CHECKLIST_PROGRESS_HEIGHT = scale(8);
const CHECKLIST_MODAL_GAP = scale(12);
const CHECKLIST_TASK_CARD_PADDING = scale(10);
const CHECKLIST_TASK_CARD_RADIUS = scale(14);
const CHECKLIST_TASK_TITLE_SIZE = moderateScale(15);
const CHECKLIST_TASK_DESCRIPTION_SIZE = moderateScale(13);
const CHECKLIST_TASK_STATUS_SIZE = moderateScale(11);
const CHECKLIST_MODAL_SLIDE_IN_DURATION = 560;

// Helper to format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Kebab Popover Component
function KebabPopover({
  visible,
  onClose,
  onDuplicate,
  onDelete,
  position,
}: {
  visible: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  position: { top: number; left: number };
}) {
  const { colors, isDark } = useTheme();
  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const popoverThemeStyle = {
    backgroundColor: isDark ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  const dividerStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(popoverScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(popoverScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Execute pending action after animation completes
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      });
    }
  }, [visible, pendingAction]);

  if (!visible && popoverOpacity._value === 0) {
    return null;
  }

  const handleAction = (action: () => void) => {
    setPendingAction(() => action);
    onClose();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.kebabOverlay}
        activeOpacity={1}
        onPress={onClose}
        pointerEvents={visible ? 'auto' : 'none'}
      />
      <Animated.View
        style={[
          styles.kebabPopover,
          popoverThemeStyle,
          {
            top: position.top,
            left: position.left,
            opacity: popoverOpacity,
            transform: [{ scale: popoverScale }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.kebabOption}
          onPress={() => handleAction(onDuplicate)}
        >
          <DocumentDuplicateIcon color={colors.textSecondary} size={SMALL_ICON_SIZE} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.textSecondary }]}>Duplicate</Text>
        </TouchableOpacity>
        <View style={[styles.kebabDivider, dividerStyle]} />
        <TouchableOpacity
          style={styles.kebabOption}
          onPress={() => handleAction(onDelete)}
        >
          <TrashIcon color={colors.error} size={SMALL_ICON_SIZE} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

// Animated Card Wrapper
function AnimatedCard({
  children,
  animationState,
  onAnimationComplete,
  width,
}: {
  children: React.ReactNode;
  animationState?: 'entering' | null;
  onAnimationComplete?: () => void;
  width?: string | number;
}) {
  const scale = useRef(new Animated.Value(animationState === 'entering' ? 0.8 : 1)).current;
  const opacity = useRef(new Animated.Value(animationState === 'entering' ? 0 : 1)).current;

  useEffect(() => {
    if (animationState === 'entering') {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onAnimationComplete) onAnimationComplete();
      });
    }
  }, [animationState]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }], width }}>
      {children}
    </Animated.View>
  );
}

type PressDownTouchableProps = ComponentProps<typeof TouchableOpacity>;

const PressDownTouchable = forwardRef<any, PressDownTouchableProps>(function PressDownTouchable(
  { children, onPressIn, onPressOut, style, activeOpacity = 1, ...props },
  ref
) {
  const pressDepth = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => {
    const isPressed = pressDepth.value > 0;

    return {
      transform: [
        { translateY: pressDepth.value },
        { scale: isPressed ? 0.985 : 1 },
      ],
    };
  });

  const handlePressIn = useCallback((event: any) => {
    pressDepth.value = withTiming(CARD_PRESS_DEPTH, {
      duration: 70,
      easing: Easing.out(Easing.quad),
    });
    onPressIn?.(event);
  }, [onPressIn, pressDepth]);

  const handlePressOut = useCallback((event: any) => {
    pressDepth.value = withTiming(0, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
    onPressOut?.(event);
  }, [onPressOut, pressDepth]);

  return (
    <AnimatedTouchableOpacity
      ref={ref}
      activeOpacity={activeOpacity}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, pressStyle]}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
});

function NewUserChecklistSummaryCard({
  state,
  onPress,
}: {
  state: NewUserChecklistState;
  onPress: () => void;
}) {
  const { colors, accentColor, isDark } = useTheme();
  const completedCount = getNewUserChecklistCompletedCount(state);
  const progress = completedCount / NEW_USER_CHECKLIST_TASKS.length;
  const inverseAccent = ACCENT_COLORS[getContrastAccent(accentColor)].base;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const ringRadius = (CHALLENGE_RING_SIZE - CHALLENGE_RING_STROKE) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const endAngle = -Math.PI / 2 + clampedProgress * Math.PI * 2;
  const progressDotX = CHALLENGE_RING_SIZE / 2 + ringRadius * Math.cos(endAngle);
  const progressDotY = CHALLENGE_RING_SIZE / 2 + ringRadius * Math.sin(endAngle);
  const percentLabel = `${Math.round(clampedProgress * 100)}%`;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.newUserChecklistCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
          borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)',
          shadowColor: colors.accent,
        },
      ]}
    >
      <View style={styles.newUserChecklistProgressRow}>
        <View style={styles.newUserChecklistRing}>
          <Svg width={CHALLENGE_RING_SIZE} height={CHALLENGE_RING_SIZE}>
            <Circle
              cx={CHALLENGE_RING_SIZE / 2}
              cy={CHALLENGE_RING_SIZE / 2}
              r={ringRadius}
              stroke={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)'}
              strokeWidth={CHALLENGE_RING_STROKE}
              fill="transparent"
            />
            <Circle
              cx={CHALLENGE_RING_SIZE / 2}
              cy={CHALLENGE_RING_SIZE / 2}
              r={ringRadius}
              stroke={colors.accent}
              strokeWidth={CHALLENGE_RING_STROKE}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${ringCircumference} ${ringCircumference}`}
              strokeDashoffset={ringCircumference * (1 - clampedProgress)}
              rotation="-90"
              originX={CHALLENGE_RING_SIZE / 2}
              originY={CHALLENGE_RING_SIZE / 2}
            />
            {clampedProgress > 0 ? (
              <Circle
                cx={progressDotX}
                cy={progressDotY}
                r={CHALLENGE_RING_STROKE * 0.82}
                fill={inverseAccent}
              />
            ) : null}
          </Svg>
          <Text allowFontScaling={false} style={[styles.newUserChecklistRingText, { color: colors.textPrimary }]}>
            {percentLabel}
          </Text>
        </View>
        <View style={styles.newUserChecklistTextColumn}>
          <Text allowFontScaling={false} style={[styles.newUserChecklistTitle, { color: colors.textPrimary }]}>
            Fortify Challenge
          </Text>
          <Text allowFontScaling={false} style={[styles.newUserChecklistSubtitle, { color: colors.textSecondary }]}>
            {completedCount} of {NEW_USER_CHECKLIST_TASKS.length} complete
          </Text>
        </View>
        <ChevronRightIcon color={colors.textPrimary} size={scale(22)} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
}

function NewUserChecklistModal({
  visible,
  state,
  onClose,
  onSetTaskStatus,
}: {
  visible: boolean;
  state: NewUserChecklistState;
  onClose: () => void;
  onSetTaskStatus: (taskId: NewUserChecklistTaskId, status: NewUserChecklistTaskStatus) => void;
}) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const [selectedTask, setSelectedTask] = useState<NewUserChecklistTask | null>(null);
  const [didCopyExampleWorkout, setDidCopyExampleWorkout] = useState(false);
  const isClosingRef = useRef(false);
  const completedCount = getNewUserChecklistCompletedCount(state);
  const pageTranslateX = useSharedValue(windowWidth);
  const backdropOpacity = useSharedValue(0);
  const headerTopPadding = Math.max(insets.top + scale(22), scale(82));
  const taskCardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
    borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(13,27,47,0.12)',
  };
  const pageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pageTranslateX.value }],
  }));
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const detailModalWidth = Math.min(scale(360), Math.max(1, windowWidth - HORIZONTAL_PADDING * 2));

  useEffect(() => {
    if (!visible) {
      if (isMounted && !isClosingRef.current) {
        setIsMounted(false);
      }
      setSelectedTask(null);
      setDidCopyExampleWorkout(false);
      return;
    }
    isClosingRef.current = false;
    setIsMounted(true);
    pageTranslateX.value = windowWidth;
    backdropOpacity.value = 0;
    backdropOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
    pageTranslateX.value = withTiming(0, {
      duration: CHECKLIST_MODAL_SLIDE_IN_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [backdropOpacity, pageTranslateX, visible, windowWidth]);

  useEffect(() => {
    setDidCopyExampleWorkout(false);
  }, [selectedTask?.id]);

  const finishClose = useCallback(() => {
    setIsMounted(false);
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    setSelectedTask(null);
    setDidCopyExampleWorkout(false);
    backdropOpacity.value = withTiming(0, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
    pageTranslateX.value = withTiming(
      windowWidth,
      {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      }
    );
  }, [backdropOpacity, finishClose, pageTranslateX, windowWidth]);

  const handleCopyExampleWorkout = useCallback(async () => {
    await Clipboard.setStringAsync(NEW_USER_CHECKLIST_EXAMPLE_WORKOUT_TEXT);
    setDidCopyExampleWorkout(true);
    void Haptics.selectionAsync();
  }, []);

  const handleTaskPress = useCallback((task: NewUserChecklistTask) => {
    if (task.id === 'finish_in_app_tour' || task.id === 'pick_app_theme') {
      return;
    }
    setSelectedTask(task);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal
      visible={isMounted}
      animationType="none"
      transparent
      presentationStyle="overFullScreen"
      hardwareAccelerated
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.checklistModalRoot}>
        <Reanimated.View
          pointerEvents="none"
          style={[
            styles.checklistModalBackdrop,
            { backgroundColor: colors.background },
            backdropAnimatedStyle,
          ]}
        >
          <StainlessSteelPattern />
        </Reanimated.View>
        <Reanimated.View
          style={[styles.checklistFullPage, { backgroundColor: colors.background }, pageAnimatedStyle]}
        >
          <StainlessSteelPattern />
          <SafeAreaView style={styles.checklistFullPageSafeArea} edges={['bottom']}>
            <View style={[styles.checklistFullPageHeader, { paddingTop: headerTopPadding }]}>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.checklistFullPageBackButton,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                  pressed && styles.checklistTaskCardPressed,
                ]}
              >
                <ChevronLeftIcon color={colors.textPrimary} size={scale(24)} strokeWidth={2.2} />
              </Pressable>
              <Text allowFontScaling={false} style={[styles.checklistFullPageTitle, { color: colors.textPrimary }]}>
                Fortify Challenge
              </Text>
              <View style={styles.checklistFullPageHeaderSpacer} />
            </View>
            <View style={styles.checklistModalHeader}>
              <Text allowFontScaling={false} style={[styles.checklistModalIntro, { color: colors.textSecondary }]}>
                {completedCount}/{NEW_USER_CHECKLIST_TASKS.length} complete
              </Text>
              <View style={styles.checklistModalProgressTrack}>
                <View
                  style={[
                    styles.checklistModalProgressFill,
                    {
                      width: `${(completedCount / NEW_USER_CHECKLIST_TASKS.length) * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
            <ScrollView
              style={styles.checklistModalScroll}
              contentContainerStyle={styles.checklistModalContent}
              showsVerticalScrollIndicator={false}
            >
              {NEW_USER_CHECKLIST_TASKS.map((task) => {
                const status = state[task.id];
                const isComplete = status === 'complete';
                const isSkipped = status === 'skipped';
                const hasDescription = !!task.description;
                const canOpenDetail = task.id !== 'finish_in_app_tour' && task.id !== 'pick_app_theme';
                return (
                  <Pressable
                    key={task.id}
                    disabled={!canOpenDetail}
                    onPress={() => handleTaskPress(task)}
                    style={({ pressed }) => [
                      styles.checklistTaskCard,
                      taskCardStyle,
                      canOpenDetail && pressed && styles.checklistTaskCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.checklistTaskTopRow,
                        !hasDescription && styles.checklistTaskTopRowCentered,
                      ]}
                    >
                      <View
                        style={[
                          styles.checklistTaskStatusIcon,
                          !hasDescription && styles.checklistTaskStatusIconCentered,
                          {
                            backgroundColor: isComplete ? colors.accent : 'transparent',
                            borderColor: isComplete
                              ? colors.accent
                              : isSkipped
                              ? colors.warning
                              : isDark
                              ? 'rgba(255,255,255,0.22)'
                              : 'rgba(0,0,0,0.16)',
                          },
                        ]}
                      >
                        {isComplete ? (
                          <CheckIcon color="#fff" size={scale(14)} strokeWidth={3} />
                        ) : (
                          <Text
                            allowFontScaling={false}
                            style={[styles.checklistTaskStatusQuestion, { color: colors.textSecondary }]}
                          >
                            ?
                          </Text>
                        )}
                      </View>
                      <View style={styles.checklistTaskTitleColumn}>
                        <Text allowFontScaling={false} style={[styles.checklistTaskTitle, { color: colors.textPrimary }]}>
                          {task.title}
                        </Text>
                        {hasDescription ? (
                          <Text allowFontScaling={false} style={[styles.checklistTaskDescription, { color: colors.textSecondary }]}>
                            {task.description}
                          </Text>
                        ) : null}
                      </View>
                      {!isComplete ? (
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            onSetTaskStatus(task.id, isSkipped ? 'incomplete' : 'skipped');
                          }}
                          style={({ pressed }) => [
                            styles.checklistTaskSkipButton,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                            pressed && styles.checklistTaskCardPressed,
                          ]}
                        >
                          <Text allowFontScaling={false} style={[styles.checklistTaskSkipText, { color: colors.textSecondary }]}>
                            {isSkipped ? 'Unskip' : 'Skip'}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Reanimated.View>
        {selectedTask ? (
          <Reanimated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(140)}
            style={[
              styles.checklistTaskDetailOverlay,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setSelectedTask(null)}
            />
            <View style={styles.checklistTaskDetailCenter} pointerEvents="box-none">
              <Reanimated.View
                entering={ZoomIn.duration(220)}
                exiting={ZoomOut.duration(160)}
                style={[
                  styles.checklistTaskDetailModal,
                  {
                    width: detailModalWidth,
                    backgroundColor: isDark ? '#222222' : '#FFFFFF',
                  },
                ]}
              >
                <StainlessSteelPattern />
                <View style={styles.checklistTaskDetailHeader}>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={2}
                    style={[styles.checklistTaskDetailTitle, { color: colors.textPrimary }]}
                  >
                    {selectedTask.title}
                  </Text>
                </View>
                <View style={styles.checklistTaskDetailContent}>
                  {selectedTask.description ? (
                    <Text allowFontScaling={false} style={[styles.checklistTaskDetailDescription, { color: colors.textSecondary }]}>
                      {selectedTask.description}
                    </Text>
                  ) : null}
                  <View
                    style={[
                      styles.checklistTaskDetailBox,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                        borderColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <Text allowFontScaling={false} style={[styles.checklistTaskDetailText, { color: colors.textPrimary }]}>
                      {selectedTask.detail}
                    </Text>
                  </View>
                  {selectedTask.id === 'make_workout_template_from_text' ? (
                    <Pressable
                      onPress={handleCopyExampleWorkout}
                      style={({ pressed }) => [
                        styles.checklistTaskDetailCopyButton,
                        { backgroundColor: colors.accent },
                        pressed && styles.checklistTaskCardPressed,
                      ]}
                    >
                      <Text allowFontScaling={false} style={styles.checklistTaskDetailCopyButtonText}>
                        {didCopyExampleWorkout ? 'Copied' : 'Copy Example'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </Reanimated.View>
            </View>
          </Reanimated.View>
        ) : null}
      </View>
    </Modal>
  );
}

function NewUserChecklistCompleteGraffitiModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const artWidth = Math.min(width * 1.16, scale(460));
  const artHeight = Math.min(height * 0.6, scale(560));
  const headlineAvailableWidth = Math.max(0, width - HORIZONTAL_PADDING * 2);
  // Bank Gothic's wide glyphs plus letter spacing occupy roughly 7x the font size.
  const headlineFontSize = Math.min(68, Math.max(36, Math.floor(headlineAvailableWidth / 7)));
  const kickerFontSize = Math.min(22, Math.max(18, width * 0.05));
  const mutedStroke = isDark ? 'rgba(255,255,255,0.36)' : 'rgba(0,0,0,0.24)';
  const softStroke = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const floatY = useSharedValue(0);
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
    borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(13,27,47,0.12)',
  };
  const floatingArtStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  useEffect(() => {
    if (!visible) {
      floatY.value = 0;
      return;
    }
    floatY.value = withRepeat(
      withTiming(-scale(10), {
        duration: 1350,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [floatY, visible]);

  const handleClose = useCallback(() => {
    void Haptics.selectionAsync();
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[styles.challengeCompleteRoot, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.challengeCompleteSafeArea} edges={['left', 'right', 'bottom']}>
          <View
            style={[
              styles.challengeCompleteContent,
              {
                paddingTop: Math.max(insets.top + Spacing.lg, Spacing['4xl']),
                paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.lg,
              },
            ]}
          >
            <Reanimated.View style={[styles.challengeGraffitiStage, floatingArtStyle]}>
              <Reanimated.View
                entering={FadeIn.duration(520)}
                pointerEvents="none"
                style={styles.challengeGraffitiArt}
              >
                <Svg
                  width={artWidth}
                  height={artHeight}
                  viewBox="0 0 460 560"
                  pointerEvents="none"
                >
                  <Path
                    d="M45 125c85-72 190-95 311-42 39 17 66 38 87 63"
                    stroke={colors.accent}
                    strokeWidth={18}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.46}
                  />
                  <Path
                    d="M68 167c91-43 193-37 306 20"
                    stroke={mutedStroke}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.72}
                  />
                  <Path
                    d="M37 393c70 34 144 47 222 35 62-10 114-35 157-76"
                    stroke={colors.accent}
                    strokeWidth={15}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.36}
                  />
                  <Path
                    d="M70 438c55 25 125 32 212 14"
                    stroke={softStroke}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.9}
                  />
                  <Path
                    d="M348 206l38-55M388 207l-39-57M72 295l37-48M113 294l-40-47"
                    stroke={colors.accent}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.44}
                  />
                  <Path
                    d="M139 72c30-18 65-22 104-10M253 505c46 7 85-1 118-25"
                    stroke={mutedStroke}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.68}
                  />
                  <Circle cx={44} cy={224} r={6} fill={colors.accent} opacity={0.42} />
                  <Circle cx={92} cy={198} r={3.5} fill={mutedStroke} opacity={0.72} />
                  <Circle cx={391} cy={118} r={5} fill={colors.accent} opacity={0.36} />
                  <Circle cx={421} cy={179} r={3.5} fill={mutedStroke} opacity={0.72} />
                  <Circle cx={59} cy={387} r={4.5} fill={mutedStroke} opacity={0.72} />
                  <Circle cx={410} cy={378} r={6} fill={colors.accent} opacity={0.34} />
                  <Circle cx={356} cy={475} r={3.5} fill={mutedStroke} opacity={0.72} />
                </Svg>
              </Reanimated.View>
              <ReanimatedText
                entering={FadeInDown.delay(120).duration(320)}
                allowFontScaling={false}
                style={[
                  styles.challengeCompleteKicker,
                  { color: colors.accent, fontSize: kickerFontSize },
                ]}
              >
                Fortify Challenge
              </ReanimatedText>
              {/* Avoid native auto-fit here; it can collapse custom fonts on physical iOS devices. */}
              <ReanimatedText
                entering={ZoomIn.delay(240).duration(360)}
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.challengeCompleteGraffitiText,
                  {
                    color: colors.textPrimary,
                    fontSize: headlineFontSize,
                    lineHeight: Math.ceil(headlineFontSize * 1.15),
                  },
                ]}
              >
                COMPLETE
              </ReanimatedText>
              <ReanimatedText
                entering={FadeInDown.delay(420).duration(320)}
                allowFontScaling={false}
                style={[styles.challengeCompleteScore, { color: colors.textPrimary }]}
              >
                {NEW_USER_CHECKLIST_TASKS.length}/{NEW_USER_CHECKLIST_TASKS.length}
              </ReanimatedText>
            </Reanimated.View>

            <View style={[styles.challengeCompleteMessage, cardStyle]}>
              <Text allowFontScaling={false} style={[styles.challengeCompleteTitle, { color: colors.textPrimary }]}>
                Congrats on finishing the Fortify Challenge!
              </Text>
            </View>

            <GlassButton
              style={styles.challengeCompleteButton}
              onPress={handleClose}
              hapticFeedback="impactMedium"
            >
              <Text style={[styles.challengeCompleteButtonText, { color: colors.accentForegroundOnFill }]}>
                Keep going
              </Text>
            </GlassButton>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// Toast Notification Component
function ToastNotification({
  visible,
  message,
  onHide,
}: {
  visible: boolean;
  message: string;
  onHide: () => void;
}) {
  const { colors } = useTheme();
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(toastScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(toastScale, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible && toastOpacity._value === 0) {
    return null;
  }

  return (
    <View style={styles.toastWrapper} pointerEvents="none">
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastOpacity,
            transform: [{ scale: toastScale }],
          },
        ]}
      >
        <LinearGradient
          colors={colors.accentGradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.toast}
        >
          <Text style={[styles.toastText, { color: colors.accentForegroundOnFill }]}>{message}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// Delete Confirmation Modal
// MODAL TEMPLATE: All modals in the app should follow this pattern:
// 1. Use StainlessSteelPattern for background
// 2. Include pop-in/pop-out animations (spring for scale, timing for opacity)
// 3. Use theme-aware background color with overflow: 'hidden'
// 4. Wrap content in a container with padding and z-index: 1
function DeleteConfirmationModal({
  visible,
  itemName,
  dependentPrograms,
  isQuickStartProgram,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  itemName: string;
  dependentPrograms?: { name: string }[];
  isQuickStartProgram?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { colors, isDark } = useTheme();
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  // Theme-aware modal styles
  const modalThemeStyle = {
    backgroundColor: isDark ? '#222222' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  const cancelButtonThemeStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  const backdropColor = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const dependentCount = dependentPrograms?.length ?? 0;
  const dependentNames = dependentPrograms?.map((program) => program.name).filter(Boolean) ?? [];
  const showNames = dependentNames.length > 0 && dependentNames.length <= 3;
  const dependencyMessage = dependentCount > 0
    ? dependentCount === 1
      ? `This workout is used in "${dependentNames[0]}". Deleting will remove it from that program.`
      : `This workout is used in ${dependentCount} programs. Deleting will remove it from those programs.`
    : null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity, backgroundColor: backdropColor }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <Animated.View
          style={[
            styles.confirmationModal,
            modalThemeStyle,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <StainlessSteelPattern />
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Delete {itemName}?</Text>
            {isQuickStartProgram ? (
              <Text style={[styles.modalQuickStartWarning, { color: colors.error }]}>
                This program is currently set for Quick Start. Deleting it will clear your Quick Start setting.
              </Text>
            ) : null}
            {dependencyMessage && (
              <>
                <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                  {dependencyMessage}
                </Text>
                {showNames && (
                  <Text style={[styles.modalSubtleText, { color: colors.textTertiary }]}>
                    Programs: {dependentNames.join(', ')}
                  </Text>
                )}
              </>
            )}
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              This action cannot be undone. Are you sure you want to delete this item?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalCancelButton, cancelButtonThemeStyle]} onPress={onCancel}>
                <Text style={[styles.modalCancelText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteButton} onPress={() => { void onConfirm(); }}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Animated Collapsible Section Component
function CollapsibleSection({
  isOpen,
  children
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const animationHeight = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const animationOpacity = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animationHeight, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animationOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen, animationHeight, animationOpacity]);

  if (!isOpen && animationHeight._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        maxHeight: animationHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2000],
        }),
        opacity: animationOpacity,
        overflow: 'visible',
      }}
    >
      {children}
    </Animated.View>
  );
}

function ProgramDropCard({
  item,
  isActive,
  onPress,
  onPressIn,
  onKebabPress,
  enableDropZone,
}: {
  item: ProgramItem;
  isActive: boolean;
  onPress: () => void;
  onPressIn: () => void;
  onKebabPress: (event: any) => void;
  enableDropZone: boolean;
}) {
  const { colors, isDark } = useTheme();
  const readableSubtext = getReadableSubtextColors(isDark);
  const { ref, onLayout, isHovered } = useDropZone({
    id: `program-${item.id}`,
    type: 'program',
    enabled: enableDropZone,
  });

  const baseBackgroundColor = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.6)';
  const baseBorderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(13, 27, 47, 0.12)';
  const innerBorderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)';
  const cardThemeStyle = {
    backgroundColor: baseBackgroundColor,
    borderColor: baseBorderColor,
  };
  const cardShadowStyle = {
    shadowColor: isDark ? '#000000' : '#10213A',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: isDark ? 0.24 : 0.09,
    shadowRadius: scale(6),
    elevation: 2,
  };
  const accentOverlay = colors.accentOverlay;
  const accentBorder = colors.accent;
  const hoverStyle = useAnimatedStyle(() => {
    return {
      opacity: enableDropZone && isHovered.value ? 1 : 0,
    };
  }, [enableDropZone]);
  const hoverBorderStyle = useAnimatedStyle(() => {
    const isDropTarget = enableDropZone && isHovered.value;
    return {
      borderColor: isDropTarget ? accentBorder : baseBorderColor,
      shadowColor: isDropTarget ? accentBorder : isDark ? '#000000' : '#10213A',
      shadowOpacity: isDropTarget ? 0.42 : isDark ? 0.24 : 0.09,
    };
  }, [accentBorder, baseBorderColor, enableDropZone, isDark]);

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={styles.cardPressFrame}
    >
      <PressDownTouchable
        onPressIn={onPressIn}
        onPress={onPress}
        style={styles.cardPressFrame}
      >
        <Reanimated.View
          style={[
            styles.programCard,
            cardShadowStyle,
            hoverBorderStyle,
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.cardSurface,
              cardThemeStyle,
              isActive && { borderColor: colors.accentBorder },
            ]}
          />
          <View
            pointerEvents="none"
            style={[styles.cardInnerEdge, { borderColor: innerBorderColor }]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.cardCornerAccent,
              { borderTopColor: colors.accent, borderLeftColor: colors.accent },
            ]}
          />
          <Reanimated.View
            pointerEvents="none"
            style={[
              styles.programHoverOverlay,
              { backgroundColor: accentOverlay, borderColor: accentBorder },
              hoverStyle,
            ]}
          />
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text
                allowFontScaling={false}
                style={[styles.cardTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              {item.isAiCreated && (
              <SparklesIcon color={colors.accent} size={AI_BADGE_SIZE} strokeWidth={2} style={styles.aiBadge} />
              )}
            </View>
            <TouchableOpacity
              style={styles.cardKebabButton}
              onPress={onKebabPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EllipsisHorizontalIcon color={colors.accent} size={SMALL_ICON_SIZE} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text allowFontScaling={false} style={[styles.cardMetaText, { color: readableSubtext.meta }]}>
            {item.workouts} workouts · {item.lastPerformed}
          </Text>
        </Reanimated.View>
      </PressDownTouchable>
    </View>
  );
}

const buildDropIn = (index: number) =>
  FadeInDown
    // Keep the cascade visible while capping the wait on long workout lists.
    .delay(Math.min(index, 6) * 32)
    .springify()
    .damping(19)
    .stiffness(175)
    .mass(0.6);

const EMPTY_HOME_CARD_ORDER: HomeCardOrderState = {
  programIds: [],
  workoutIds: [],
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function normalizeSavedOrder(currentIds: string[], savedIds: string[]): string[] {
  const currentSet = new Set(currentIds);
  const missingIds = currentIds.filter((id) => !savedIds.includes(id));
  const retainedSavedIds = savedIds.filter((id) => currentSet.has(id));
  return [...missingIds, ...retainedSavedIds];
}

function sortItemsBySavedOrder<T extends { id: string }>(items: T[], savedIds: string[]): T[] {
  if (savedIds.length === 0) return items;

  const normalizedOrder = normalizeSavedOrder(
    items.map((item) => item.id),
    savedIds
  );
  const indexById = new Map(normalizedOrder.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const aIndex = indexById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = indexById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

export default function ProgramsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isAuthResolved } = useAuth();
  const readableSubtext = getReadableSubtextColors(isDark);
  const { isTourActive, activeStepId, hasTourFinished, isScreenScrollLocked } = useInAppTour();
  const { highlightWorkoutId } = useLocalSearchParams<{ highlightWorkoutId?: string }>();
  const [highlightedWorkoutId, setHighlightedWorkoutId] = useState<string | null>(null);
  const isHomeFocused = useIsFocused();
  const modalStyles = useModalStyles();
  const { sessions: historySessions } = useWorkoutHistorySource({ enabled: Boolean(user) });
  const {
    scheduleDays,
    scheduleHistory,
    isSaving: isSavingSchedule,
    saveScheduleDays,
  } = useWorkoutSchedule();

  // Programs store
  const storePrograms = useProgramsStore(s => s.programs);
  const pendingProgramSyncIds = useProgramsStore(s => s.pendingProgramSyncIds);
  const syncingProgramSyncIds = useProgramsStore(s => s.syncingProgramSyncIds);
  const isLoadingPrograms = useProgramsStore(s => s.isLoading);
  const hasFetchedPrograms = useProgramsStore(s => s.hasFetchedPrograms);
  const fetchPrograms = useProgramsStore(s => s.fetchPrograms);
  const refreshPendingProgramSyncIds = useProgramsStore(s => s.refreshPendingProgramSyncIds);
  const deleteProgramFromStore = useProgramsStore(s => s.deleteProgram);
  const duplicateProgramInStore = useProgramsStore(s => s.duplicateProgram);
  const duplicateWorkoutInStore = useProgramsStore(s => s.duplicateWorkoutTemplate);
  const appendTemplateToProgram = useProgramsStore(s => s.appendTemplateToProgram);
  const removeWorkoutFromProgram = useProgramsStore(s => s.removeWorkoutFromProgram);
  const { canCreateProgram, canCreateWorkoutTemplate, runProFeature } = useProFeatureGate();
  const isProgramProgressLoaded = useProgramProgressStore(s => s.isLoaded);
  const progressByProgram = useProgramProgressStore(s => s.progressByProgram);
  const restartProgram = useProgramProgressStore(s => s.restartProgram);
  const trimCompletedDays = useProgramProgressStore(s => s.trimCompletedDays);
  const startPreset = useStartPresetStore(s => s.preset);

  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [startupRevealComplete, setStartupRevealComplete] = useState(
    isStartupRevealComplete
  );
  const [scheduleEditorVisible, setScheduleEditorVisible] = useState(false);
  const [homeCardOrder, setHomeCardOrder] = useState<HomeCardOrderState>(EMPTY_HOME_CARD_ORDER);
  const [isHomeCardOrderLoaded, setIsHomeCardOrderLoaded] = useState(false);
  const [onboardingProgramSpec, setOnboardingProgramSpec] = useState<OnboardingProgramSpec | null>(null);
  const [newUserChecklistState, setNewUserChecklistState] = useState<NewUserChecklistState>(
    getDefaultNewUserChecklistState
  );
  const [isNewUserChecklistLoaded, setIsNewUserChecklistLoaded] = useState(false);
  const [isNewUserChecklistModalVisible, setIsNewUserChecklistModalVisible] = useState(false);
  const [isNewUserChecklistCompleteVisible, setIsNewUserChecklistCompleteVisible] = useState(false);
  const [deferWorkoutStreakCelebration, setDeferWorkoutStreakCelebration] = useState(false);
  const previousNewUserChecklistCompletedCountRef = useRef<number | null>(null);
  const challengeDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAnchorAddWorkout = isTourActive && activeStepId === 'add_workout_routine';

  useEffect(() => {
    const subscription = subscribeToStartupReveal(() => {
      setStartupRevealComplete(true);
    });
    if (isStartupRevealComplete()) {
      setStartupRevealComplete(true);
    }
    return () => subscription.remove();
  }, []);

  const loadOnboardingProgramSpec = useCallback(async () => {
    try {
      setOnboardingProgramSpec(await loadPendingOnboardingProgramSpec());
    } catch (error) {
      console.warn('Failed to load onboarding program preview:', error);
    }
  }, []);

  const persistHomeCardOrder = useCallback(async (nextOrder: HomeCardOrderState) => {
    try {
      await setScopedItem(HOME_CARD_ORDER_KEY, JSON.stringify(nextOrder), user?.id ?? null);
    } catch (error) {
      console.warn('Failed to persist home card order:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadOnboardingProgramSpec();

    const subscription = DeviceEventEmitter.addListener(
      ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
      (spec: OnboardingProgramSpec | null) => {
        setOnboardingProgramSpec(spec);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [loadOnboardingProgramSpec]);

  useFocusEffect(
    useCallback(() => {
      void loadOnboardingProgramSpec();
      return undefined;
    }, [loadOnboardingProgramSpec])
  );

  useEffect(() => {
    if (!isAuthResolved) {
      setIsHomeCardOrderLoaded(false);
      return;
    }

    let isMounted = true;
    setIsHomeCardOrderLoaded(false);

    const loadHomeCardOrder = async () => {
      try {
        const raw = await getScopedItem(HOME_CARD_ORDER_KEY, user?.id ?? null);
        if (!isMounted) return;
        if (!raw) {
          setHomeCardOrder(EMPTY_HOME_CARD_ORDER);
          return;
        }
        const parsed = JSON.parse(raw) as Partial<HomeCardOrderState>;
        setHomeCardOrder({
          programIds: Array.isArray(parsed.programIds)
            ? parsed.programIds.filter((id): id is string => typeof id === 'string')
            : [],
          workoutIds: Array.isArray(parsed.workoutIds)
            ? parsed.workoutIds.filter((id): id is string => typeof id === 'string')
            : [],
        });
      } catch (error) {
        console.warn('Failed to load home card order:', error);
      } finally {
        if (isMounted) {
          setIsHomeCardOrderLoaded(true);
        }
      }
    };

    void loadHomeCardOrder();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, user?.id]);

  useEffect(() => {
    if (!isAuthResolved) {
      setIsNewUserChecklistLoaded(false);
      return;
    }

    let isMounted = true;
    setIsNewUserChecklistLoaded(false);

    const loadChecklist = async () => {
      try {
        const nextState = await loadNewUserChecklistState(user?.id ?? null);
        if (isMounted) {
          setNewUserChecklistState(nextState);
        }
      } catch (error) {
        console.warn('Failed to load new user checklist:', error);
      } finally {
        if (isMounted) {
          setIsNewUserChecklistLoaded(true);
        }
      }
    };

    void loadChecklist();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, user?.id]);

  const reloadNewUserChecklistState = useCallback(async () => {
    try {
      const nextState = await loadNewUserChecklistState(user?.id ?? null);
      const previousCompletedCount = previousNewUserChecklistCompletedCountRef.current;
      const nextCompletedCount = getNewUserChecklistCompletedCount(nextState);
      if (
        previousCompletedCount !== null
        && previousCompletedCount < NEW_USER_CHECKLIST_TASKS.length
        && nextCompletedCount === NEW_USER_CHECKLIST_TASKS.length
      ) {
        // Block the streak modal in the same update that completes the challenge,
        // before the pending workout celebration can be presented on home.
        setDeferWorkoutStreakCelebration(true);
      }
      setNewUserChecklistState(nextState);
      setIsNewUserChecklistLoaded(true);
    } catch (error) {
      console.warn('Failed to reload new user checklist:', error);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthResolved) {
        return undefined;
      }
      void reloadNewUserChecklistState();
      return undefined;
    }, [isAuthResolved, reloadNewUserChecklistState])
  );

  const updateNewUserChecklistTaskStatus = useCallback((
    taskId: NewUserChecklistTaskId,
    status: NewUserChecklistTaskStatus
  ) => {
    setNewUserChecklistState((current) => {
      if (current[taskId] === status) {
        return current;
      }
      const nextState = markNewUserChecklistTaskStatus(current, taskId, status);
      void persistNewUserChecklistState(nextState, user?.id ?? null).catch((error) => {
        console.warn('Failed to persist new user checklist:', error);
      });
      return nextState;
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isNewUserChecklistLoaded) {
      previousNewUserChecklistCompletedCountRef.current = null;
      return;
    }

    const completedCount = getNewUserChecklistCompletedCount(newUserChecklistState);
    const previousCompletedCount = previousNewUserChecklistCompletedCountRef.current;

    if (
      previousCompletedCount !== null &&
      previousCompletedCount < NEW_USER_CHECKLIST_TASKS.length &&
      completedCount === NEW_USER_CHECKLIST_TASKS.length
    ) {
      setDeferWorkoutStreakCelebration(true);
      setIsNewUserChecklistModalVisible(false);
      setIsNewUserChecklistCompleteVisible(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    previousNewUserChecklistCompletedCountRef.current = completedCount;
  }, [isNewUserChecklistLoaded, newUserChecklistState]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      NEW_USER_CHECKLIST_EVENT,
      (taskId: unknown) => {
        if (taskId === 'reset') {
          setDeferWorkoutStreakCelebration(false);
          setIsNewUserChecklistCompleteVisible(false);
          void reloadNewUserChecklistState();
          return;
        }

        if (!isNewUserChecklistTaskId(taskId)) {
          return;
        }
        void reloadNewUserChecklistState();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [reloadNewUserChecklistState]);

  useEffect(() => () => {
    if (challengeDismissTimerRef.current) {
      clearTimeout(challengeDismissTimerRef.current);
    }
  }, []);

  const handleChallengeCompleteClose = useCallback(() => {
    setIsNewUserChecklistCompleteVisible(false);
    if (challengeDismissTimerRef.current) {
      clearTimeout(challengeDismissTimerRef.current);
    }
    // Let the native full-screen modal finish dismissing before presenting the
    // queued streak celebration. This avoids overlapping iOS presentations.
    challengeDismissTimerRef.current = setTimeout(() => {
      challengeDismissTimerRef.current = null;
      setDeferWorkoutStreakCelebration(false);
    }, 400);
  }, []);

  useEffect(() => {
    void refreshPendingProgramSyncIds();
  }, [refreshPendingProgramSyncIds]);

  useEffect(() => {
    if (!highlightWorkoutId || typeof highlightWorkoutId !== 'string') {
      return;
    }
    setHighlightedWorkoutId(highlightWorkoutId);
    const timeout = setTimeout(() => {
      setHighlightedWorkoutId(null);
    }, 3500);
    return () => clearTimeout(timeout);
  }, [highlightWorkoutId]);

  // Transform store programs to UI format (exclude templates)
  const basePrograms: ProgramItem[] = keepSingleOnboardingProgram(
    storePrograms.filter(p => !p.isTemplate)
  )
    .map(p => ({
      id: p.id,
      name: p.name,
      workouts: p.workouts.length,
      weeks: p.durationWeeks || 0,
      lastPerformed: formatRelativeTime(p.lastPerformedAt),
      isAiCreated: p.isAiCreated,
      aiPayloadVersion: p.aiPayloadVersion,
    }));

  // Templates (programs marked as isTemplate)
  const pendingProgramSyncIdSet = new Set(pendingProgramSyncIds);
  const syncingProgramSyncIdSet = new Set(syncingProgramSyncIds);

  const baseTemplates: (WorkoutItem & { programId: string })[] = storePrograms
    .filter(p => p.isTemplate)
    .map(p => ({
      id: p.id,
      programId: p.id,
      name: p.name,
      exercises: p.workouts[0]?.exercises.length || 0,
      lastPerformed: formatRelativeTime(p.lastPerformedAt),
      isAiCreated: p.isAiCreated,
      isDefault: p.isDefault,
      syncStatus: p.isDefault
        ? null
        : syncingProgramSyncIdSet.has(p.id)
          ? 'syncing'
          : (pendingProgramSyncIdSet.has(p.id) || isLocalProgramId(p.id))
            ? 'pending'
            : 'synced',
    }));

  const programs = useMemo(
    () => sortItemsBySavedOrder(basePrograms, homeCardOrder.programIds),
    [basePrograms, homeCardOrder.programIds]
  );

  const onboardingPreviewProgram = useMemo(() => {
    if (onboardingProgramSpec?.status !== 'ready') {
      return null;
    }

    const sourceSpecKey = `onboarding-program:${onboardingProgramSpec.id}`;
    return programs.find((program) =>
      program.id === onboardingProgramSpec.generatedProgramId ||
      program.aiPayloadVersion === sourceSpecKey
    ) ?? null;
  }, [onboardingProgramSpec, programs]);

  const shouldShowOnboardingProgramPreview = Boolean(
    onboardingProgramSpec && onboardingProgramSpec.status !== 'dismissed'
  );
  const onboardingProgramPreviewTitle =
    onboardingPreviewProgram?.name ??
    onboardingProgramSpec?.programName ??
    'Your program';
  const onboardingProgramPreviewSubtitle = onboardingPreviewProgram
    ? 'Your personalized program is ready.'
    : onboardingProgramSpec?.status === 'failed'
      ? 'We are retrying your personalized program.'
      : 'Preparing your personalized program...';
  const onboardingProgramPreviewButtonLabel = onboardingPreviewProgram
    ? 'VIEW PROGRAM'
    : onboardingProgramSpec?.status === 'failed'
      ? 'RETRYING...'
      : 'BUILDING...';

  useEffect(() => {
    if (onboardingPreviewProgram) {
      router.prefetch(`/programs/${onboardingPreviewProgram.id}`);
    }
  }, [onboardingPreviewProgram, router]);

  const templates = useMemo(
    () => sortItemsBySavedOrder(baseTemplates, homeCardOrder.workoutIds),
    [baseTemplates, homeCardOrder.workoutIds]
  );

  // Keep original workouts for backward compatibility
  const workouts: WorkoutItem[] = templates;

  useEffect(() => {
    if (!isHomeCardOrderLoaded || !hasFetchedPrograms) {
      return;
    }

    const nextProgramIds = normalizeSavedOrder(
      basePrograms.map((program) => program.id),
      homeCardOrder.programIds
    );
    const nextWorkoutIds = normalizeSavedOrder(
      baseTemplates.map((template) => template.id),
      homeCardOrder.workoutIds
    );

    if (
      arraysEqual(nextProgramIds, homeCardOrder.programIds) &&
      arraysEqual(nextWorkoutIds, homeCardOrder.workoutIds)
    ) {
      return;
    }

    const nextOrder = {
      programIds: nextProgramIds,
      workoutIds: nextWorkoutIds,
    };
    setHomeCardOrder(nextOrder);
    void persistHomeCardOrder(nextOrder);
  }, [
    basePrograms,
    baseTemplates,
    homeCardOrder.programIds,
    homeCardOrder.workoutIds,
    hasFetchedPrograms,
    isHomeCardOrderLoaded,
    persistHomeCardOrder,
  ]);

  const getProgramsUsingTemplate = useCallback((templateId: string) => {
    const template = storePrograms.find((program) => program.id === templateId && program.isTemplate);
    const templateWorkout = template?.workouts[0];
    if (!templateWorkout) return [];

    const templateIds = templateWorkout.exercises.map((ex) => ex.exerciseId).join(',');
    const templateName = template.name.toLowerCase();

    return storePrograms
      .filter((program) => !program.isTemplate)
      .map((program) => {
        const matchingWorkouts = program.workouts.filter((workout) => {
          const workoutIds = workout.exercises.map((ex) => ex.exerciseId).join(',');
          return (templateIds && workoutIds === templateIds)
            || workout.name.toLowerCase() === templateName;
        });

        if (matchingWorkouts.length === 0) return null;
        return {
          id: program.id,
          name: program.name,
          workoutIds: matchingWorkouts.map((workout) => workout.id),
        };
      })
      .filter((program): program is { id: string; name: string; workoutIds: string[] } => !!program);
  }, [storePrograms]);

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);
  const [openKebab, setOpenKebab] = useState<{
    type: 'program' | 'workout' | null;
    id: string | null;
    position: { top: number; left: number };
  }>({ type: null, id: null, position: { top: 0, left: 0 } });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    type: 'program' | 'workout' | null;
    id: string | null;
    name: string;
    dependentPrograms?: { id: string; name: string; workoutIds: string[] }[];
    isQuickStartProgram?: boolean;
  }>({ visible: false, type: null, id: null, name: '' });
  const [animatingCards, setAnimatingCards] = useState<{
    [key: string]: 'entering';
  }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editIntentModalVisible, setEditIntentModalVisible] = useState(false);
  const [pendingProgramDrop, setPendingProgramDrop] = useState<{
    programId: string;
    templateId: string;
  } | null>(null);

  const handleSaveSchedule = async (days: number[]) => {
    const { error } = await saveScheduleDays(days, { sessions: historySessions });
    if (error) {
      setToastMessage(error.message);
      setShowToast(true);
      return;
    }

    setScheduleEditorVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  // Handle workout/template card press - navigate to detail screen
  const handleWorkoutCardPress = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workouts/${templateId}`);
  };

  const handleWorkoutCardPressIn = (templateId: string) => {
    // Warm the route module during the press without interfering with drag/reorder.
    router.prefetch(`/workouts/${templateId}`);
  };

  // Handle program card press - navigate to program detail
  const handleProgramCardPress = (programId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/${programId}`);
  };

  const handleProgramCardPressIn = (programId: string) => {
    router.prefetch(`/programs/${programId}`);
  };

  const handleOnboardingProgramPreviewPress = useCallback(() => {
    if (!onboardingPreviewProgram || !onboardingProgramSpec) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dismissedSpec: OnboardingProgramSpec = {
      ...onboardingProgramSpec,
      status: 'dismissed',
      generatedProgramId: onboardingPreviewProgram.id,
      updatedAt: new Date().toISOString(),
    };

    router.push(`/programs/${onboardingPreviewProgram.id}`);
    setOnboardingProgramSpec(dismissedSpec);

    void updatePendingOnboardingProgramSpec({
      status: 'dismissed',
      generatedProgramId: onboardingPreviewProgram.id,
    }).catch((error) => {
      console.warn('Failed to dismiss onboarding program preview:', error);
    });
  }, [
    onboardingPreviewProgram,
    onboardingProgramSpec,
    router,
  ]);

  const handleKebabPress = (
    type: 'program' | 'workout',
    id: string,
    event: any
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Measure the button position relative to the screen
    event.target.measure(
      (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const popoverWidth = KEBAB_POPOVER_WIDTH;
        const margin = POPOVER_MARGIN;
        const left = Math.min(
          Math.max(margin, pageX - 4),
          screenWidth - popoverWidth - margin
        );
        setOpenKebab({
          type,
          id,
          position: {
            top: pageY + height + 4,
            left,
          },
        });
      }
    );
  };

  const handleDuplicate = async () => {
    if (openKebab.type === 'program' && openKebab.id !== null) {
      const duplicateProgram = async () => {
        const newProgramId = await duplicateProgramInStore(openKebab.id as string);
        if (newProgramId) {
          // Trigger entering animation for the new card
          const cardKey = `program-${newProgramId}`;
          setAnimatingCards(prev => ({ ...prev, [cardKey]: 'entering' }));
          // Show toast notification
          setToastMessage('Program duplicated!');
          setShowToast(true);
        }
      };

      if (!canCreateProgram(basePrograms.length)) {
        await runProFeature(
          {
            placement: PAYWALL_PLACEMENTS.programLimit,
            params: {
              source: 'home',
              action: 'duplicate_program',
              programCount: basePrograms.length,
            },
          },
          duplicateProgram,
        );
        return;
      }

      await duplicateProgram();
    } else if (openKebab.type === 'workout' && openKebab.id !== null) {
      const duplicateWorkout = async () => {
        const newWorkoutId = await duplicateWorkoutInStore(openKebab.id as string);
        if (newWorkoutId) {
          const cardKey = `workout-${newWorkoutId}`;
          setAnimatingCards(prev => ({ ...prev, [cardKey]: 'entering' }));
          setToastMessage('Workout duplicated!');
          setShowToast(true);
        }
      };

      if (!canCreateWorkoutTemplate(baseTemplates.length)) {
        await runProFeature(
          {
            placement: PAYWALL_PLACEMENTS.workoutLimit,
            params: {
              source: 'home',
              action: 'duplicate_workout_template',
              workoutTemplateCount: baseTemplates.length,
            },
          },
          duplicateWorkout,
        );
        return;
      }

      await duplicateWorkout();
    }
  };

  const applyProgramAppend = useCallback(async (
    programId: string,
    templateId: string,
    intent?: 'keep' | 'restart'
  ) => {
    const program = storePrograms.find((p) => p.id === programId && !p.isTemplate);
    if (!program) return;

    if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      setToastMessage(`Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts.`);
      setShowToast(true);
      return;
    }

    const totalDays = program.workouts.length + 1;
    const success = await appendTemplateToProgram(programId, templateId);

    if (success) {
      if (intent === 'restart') {
        restartProgram(programId);
      } else if (intent === 'keep') {
        trimCompletedDays(programId, totalDays);
      }
      setToastMessage(`Added to ${program.name}`);
    } else {
      setToastMessage('Unable to add workout to program.');
    }
    setShowToast(true);
  }, [appendTemplateToProgram, restartProgram, storePrograms, trimCompletedDays]);

  const handleWorkoutDropOnProgram = useCallback(async (sourceItemId: string, targetDropZoneId: string) => {
    const templateId = sourceItemId.replace(/^workout-/, '');
    const programId = targetDropZoneId.replace(/^program-/, '');
    if (!templateId || !programId) return;

    if (!isProgramProgressLoaded) {
      await useProgramProgressStore.getState().loadProgress();
    }

    const program = storePrograms.find((p) => p.id === programId && !p.isTemplate);
    if (!program) return;

    if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      setToastMessage(`Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts.`);
      setShowToast(true);
      return;
    }

    if (useProgramProgressStore.getState().progressByProgram[programId]) {
      setPendingProgramDrop({ programId, templateId });
      setEditIntentModalVisible(true);
      return;
    }

    applyProgramAppend(programId, templateId);
  }, [applyProgramAppend, isProgramProgressLoaded, storePrograms]);

  const handleProgramReorder = useCallback((items: ProgramItem[]) => {
    const nextOrder = {
      ...homeCardOrder,
      programIds: items.map((item) => item.id),
    };
    setHomeCardOrder(nextOrder);
    void persistHomeCardOrder(nextOrder);
  }, [homeCardOrder, persistHomeCardOrder]);

  const handleWorkoutReorder = useCallback((items: WorkoutItem[]) => {
    const nextOrder = {
      ...homeCardOrder,
      workoutIds: items.map((item) => item.id),
    };
    setHomeCardOrder(nextOrder);
    void persistHomeCardOrder(nextOrder);
  }, [homeCardOrder, persistHomeCardOrder]);

  const handleDelete = () => {
    if (openKebab.type === 'program' && openKebab.id !== null) {
      const program = programs.find((p) => p.id === openKebab.id);
      if (program) {
        setDeleteConfirmation({
          visible: true,
          type: 'program',
          id: openKebab.id,
          name: program.name,
          isQuickStartProgram: startPreset?.type === 'program' && startPreset.programId === openKebab.id,
        });
      }
    } else if (openKebab.type === 'workout' && openKebab.id !== null) {
      const workout = workouts.find((w) => w.id === openKebab.id);
      if (workout) {
        const dependentPrograms = getProgramsUsingTemplate(openKebab.id);
        setDeleteConfirmation({
          visible: true,
          type: 'workout',
          id: openKebab.id,
          name: workout.name,
          dependentPrograms,
        });
      }
    }
  };

  const confirmDelete = async () => {
    const { type, id, dependentPrograms } = deleteConfirmation;
    setDeleteConfirmation({ visible: false, type: null, id: null, name: '' });

    if (!type || id === null) return;

    if (type === 'workout' && dependentPrograms) {
      for (const program of dependentPrograms) {
        for (const workoutId of program.workoutIds) {
          await removeWorkoutFromProgram(program.id, workoutId);
        }
      }
    }

    const deleted = await deleteProgramFromStore(id);
    if (!deleted) {
      setToastMessage(`Could not delete ${type === 'program' ? 'program' : 'workout'}.`);
      setShowToast(true);
    }
  };

  const handleAnimationComplete = (type: 'program' | 'workout', id: string) => {
    const cardKey = `${type}-${id}`;
    const animState = animatingCards[cardKey];

    if (animState === 'entering') {
      // Remove from animating cards after entering animation completes
      setAnimatingCards(prev => {
        const next = { ...prev };
        delete next[cardKey];
        return next;
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ visible: false, type: null, id: null, name: '' });
  };

  const handleAddProgramPress = () => {
    if (!canCreateProgram(basePrograms.length)) {
      void runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.programLimit,
          params: {
            source: 'home',
            action: 'open_create_program',
            programCount: basePrograms.length,
          },
        },
        () => {
          router.push('/programs/create');
        },
      );
      return;
    }

    router.push('/programs/create');
  };

  // Handle add workout from kebab menu
  const handleAddWorkoutPress = () => {
    if (!canCreateWorkoutTemplate(baseTemplates.length)) {
      void runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.workoutLimit,
          params: {
            source: 'home',
            action: 'open_create_workout_template',
            workoutTemplateCount: baseTemplates.length,
          },
        },
        () => {
          router.push('/workout/create');
        },
      );
      return;
    }

    router.push('/workout/create');
  };

  // Theme-aware card style for workout cards
  const workoutCardThemeStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.6)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(13, 27, 47, 0.12)',
  };
  const workoutCardInnerEdgeStyle = {
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)',
  };
  const workoutCardShadowStyle = {
    shadowColor: isDark ? '#000000' : '#10213A',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: isDark ? 0.24 : 0.09,
    shadowRadius: scale(6),
    elevation: 2,
  };

  // Draggable workout card renderer for DraggableGrid
  const renderWorkoutGridItem = useCallback(
    (item: WorkoutItem, index: number, isActive: boolean) => {
      const cardKey = `workout-${item.id}`;
      const animState = animatingCards[cardKey];
      const isHighlighted = highlightedWorkoutId === item.id;
      const highlightStyle = isHighlighted
        ? {
            borderColor: colors.accent,
            backgroundColor: colors.accentOverlay,
          }
        : null;

      return (
        <Reanimated.View entering={buildDropIn(index)}>
          <AnimatedCard
            animationState={animState}
            onAnimationComplete={() => handleAnimationComplete('workout', item.id)}
          >
            <PressDownTouchable
              onPressIn={() => handleWorkoutCardPressIn(item.id)}
              onPress={() => handleWorkoutCardPress(item.id)}
              style={styles.cardPressFrame}
            >
              <View
                style={[
                  styles.workoutCard,
                  workoutCardShadowStyle,
                ]}
              >
              <View
                pointerEvents="none"
                style={[
                  styles.cardSurface,
                  workoutCardThemeStyle,
                  highlightStyle,
                  isActive && { borderColor: colors.accentBorder },
                ]}
              />
              <View
                pointerEvents="none"
                style={[styles.cardInnerEdge, workoutCardInnerEdgeStyle]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.cardCornerAccent,
                  { borderTopColor: colors.accent, borderLeftColor: colors.accent },
                ]}
              />
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleColumn}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      allowFontScaling={false}
                      style={[styles.cardTitle, { color: colors.textPrimary }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    {item.isAiCreated && (
                      <SparklesIcon color={colors.accent} size={AI_BADGE_SIZE} strokeWidth={2} style={styles.aiBadge} />
                    )}
                    {item.syncStatus === 'synced' && (
                      <CloudIcon color={colors.accent} size={TEMPLATE_SYNC_CLOUD_SIZE} strokeWidth={2} />
                    )}
                  </View>
                  {(item.syncStatus === 'pending' || item.syncStatus === 'syncing') && (
                    <View style={[styles.templateSyncPill, { borderColor: colors.accentBorder }]}>
                      <Text allowFontScaling={false} style={[styles.templateSyncPillText, { color: colors.accent }]}>
                        {item.syncStatus === 'syncing' ? 'Syncing...' : 'Pending sync'}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.cardKebabButton}
                  onPress={(event) => handleKebabPress('workout', item.id, event)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <EllipsisHorizontalIcon color={colors.accent} size={SMALL_ICON_SIZE} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <Text
                allowFontScaling={false}
                style={[styles.cardMetaText, { color: readableSubtext.meta }]}
              >
                {item.lastPerformed}
              </Text>
              </View>
            </PressDownTouchable>
          </AnimatedCard>
        </Reanimated.View>
      );
    },
    [
      animatingCards,
      handleAnimationComplete,
      handleKebabPress,
      handleWorkoutCardPress,
      handleWorkoutCardPressIn,
      colors,
      isDark,
      workoutCardThemeStyle,
      workoutCardInnerEdgeStyle,
      workoutCardShadowStyle,
      highlightedWorkoutId,
      readableSubtext,
    ]
  );

  // Draggable program card renderer for DraggableGrid
  const renderProgramGridItem = useCallback(
    (item: ProgramItem, index: number, isActive: boolean) => {
      const cardKey = `program-${item.id}`;
      const animState = animatingCards[cardKey];

      return (
        <Reanimated.View entering={buildDropIn(index)}>
          <AnimatedCard
            animationState={animState}
            onAnimationComplete={() => handleAnimationComplete('program', item.id)}
          >
            <ProgramDropCard
              item={item}
              isActive={isActive}
              enableDropZone={showPrograms}
              onPressIn={() => handleProgramCardPressIn(item.id)}
              onPress={() => handleProgramCardPress(item.id)}
              onKebabPress={(event) => handleKebabPress('program', item.id, event)}
            />
          </AnimatedCard>
        </Reanimated.View>
      );
    },
    [
      animatingCards,
      handleAnimationComplete,
      handleKebabPress,
      handleProgramCardPress,
      handleProgramCardPressIn,
      showPrograms,
    ]
  );

  // Theme-aware styles for glass cards and popovers
  const glassCardStyle = {
    backgroundColor: colors.glassBackground,
    borderColor: colors.glassBorder,
  };

  const popoverStyle = {
    backgroundColor: isDark ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NestableScrollContainer
          scrollEnabled={!isScreenScrollLocked}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeaderBrand style={styles.header} />

          <WeeklyProgressCarousel
            scheduleDays={scheduleDays}
            scheduleHistory={scheduleHistory}
            sessions={historySessions}
            isFocused={isHomeFocused}
            startupRevealComplete={startupRevealComplete}
            deferMilestoneCelebration={deferWorkoutStreakCelebration}
            onEditSchedule={() => setScheduleEditorVisible(true)}
          />

          {hasTourFinished && isNewUserChecklistLoaded && !isNewUserChecklistResolved(newUserChecklistState) ? (
            <Reanimated.View entering={FadeInDown.duration(420).springify()}>
              <NewUserChecklistSummaryCard
                state={newUserChecklistState}
                onPress={() => setIsNewUserChecklistModalVisible(true)}
              />
            </Reanimated.View>
          ) : null}

          {shouldShowOnboardingProgramPreview && (
            <View>
              <TouchableOpacity
                activeOpacity={0.84}
                disabled={!onboardingPreviewProgram}
                onPress={handleOnboardingProgramPreviewPress}
                style={[
                  styles.onboardingProgramPreviewCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <StainlessSteelPattern />
                <View style={styles.onboardingProgramPreviewContent}>
                  <View style={styles.onboardingProgramPreviewHeader}>
                    <View>
                      <Text style={[styles.onboardingProgramPreviewEyebrow, { color: colors.accent }]}>
                        FORTIFY AI
                      </Text>
                      <Text
                        style={[styles.onboardingProgramPreviewTitle, { color: colors.textPrimary }]}
                        numberOfLines={2}
                      >
                        {onboardingProgramPreviewTitle}
                      </Text>
                      <Text
                        style={[styles.onboardingProgramPreviewSubtitle, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {onboardingProgramPreviewSubtitle}
                      </Text>
                    </View>
                    {onboardingPreviewProgram ? (
                      <SparklesIcon color={colors.accent} size={MODAL_ICON_SIZE} strokeWidth={2} />
                    ) : (
                      <InlineSkeleton width={MODAL_ICON_SIZE} height={MODAL_ICON_SIZE} />
                    )}
                  </View>
                  <LinearGradient
                    colors={colors.accentGradient as unknown as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.onboardingProgramPreviewButton,
                      !onboardingPreviewProgram && styles.onboardingProgramPreviewButtonDisabled,
                    ]}
                  >
                    <Text style={[styles.onboardingProgramPreviewButtonText, { color: colors.accentForegroundOnFill }]}>
                      {onboardingProgramPreviewButtonLabel}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Programs Section */}
          <View style={[styles.section, styles.programsSection]}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity
                onPress={() => setShowPrograms(!showPrograms)}
                style={styles.sectionHeaderButton}
              >
                <GlassButton circular size={SECTION_CHEVRON_BUTTON_SIZE} onPress={() => setShowPrograms(!showPrograms)}>
                  <ChevronRightIcon
                    color="#fff"
                    size={SECTION_CHEVRON_SIZE}
                    style={[
                      styles.chevron,
                      showPrograms && styles.chevronRotated,
                    ]}
                  />
                </GlassButton>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Programs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddProgramPress}
                style={styles.sectionKebabButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <PlusIcon color={colors.accent} size={KEBAB_ICON_SIZE} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <CollapsibleSection isOpen={showPrograms}>
              {showPrograms && startupRevealComplete && (
                programs.length === 0 ? null : (
                  <DraggableGrid
                    data={programs}
                    keyExtractor={(item) => `program-${item.id}`}
                    renderItem={renderProgramGridItem}
                    onReorder={handleProgramReorder}
                    numColumns={1}
                    itemHeight={PROGRAM_CARD_GRID_HEIGHT}
                    gap={GRID_GAP}
                  />
                )
              )}
            </CollapsibleSection>
          </View>

          {/* Workouts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity
                onPress={() => setShowWorkouts(!showWorkouts)}
              >
                <TourAnchor id={TOUR_ANCHOR_IDS.workoutsSection}>
                  <View style={styles.sectionHeaderButton}>
                  <GlassButton circular size={SECTION_CHEVRON_BUTTON_SIZE} onPress={() => setShowWorkouts(!showWorkouts)}>
                    <ChevronRightIcon
                      color="#fff"
                      size={SECTION_CHEVRON_SIZE}
                      style={[
                        styles.chevron,
                        showWorkouts && styles.chevronRotated,
                      ]}
                    />
                  </GlassButton>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Workouts</Text>
                  </View>
                </TourAnchor>
              </TouchableOpacity>
              {shouldAnchorAddWorkout ? (
                <TourAnchor id={TOUR_ANCHOR_IDS.addWorkoutRoutine}>
                  <TouchableOpacity
                    onPress={handleAddWorkoutPress}
                    style={styles.sectionKebabButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <PlusIcon color={colors.accent} size={KEBAB_ICON_SIZE} strokeWidth={2} />
                  </TouchableOpacity>
                </TourAnchor>
              ) : (
                <TouchableOpacity
                  onPress={handleAddWorkoutPress}
                  style={styles.sectionKebabButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <PlusIcon color={colors.accent} size={KEBAB_ICON_SIZE} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            <CollapsibleSection isOpen={showWorkouts}>
              {showWorkouts && startupRevealComplete && (
                workouts.length === 0 ? null : (
                  <DraggableGrid
                    data={workouts}
                    keyExtractor={(item) => `workout-${item.id}`}
                    renderItem={renderWorkoutGridItem}
                    enableCrossContainerDrag={true}
                    dragType="workout"
                    onCrossContainerDrop={handleWorkoutDropOnProgram}
                    onReorder={handleWorkoutReorder}
                    numColumns={2}
                    itemHeight={WORKOUT_CARD_GRID_HEIGHT}
                    gap={GRID_GAP}
                  />
                )
              )}
            </CollapsibleSection>
          </View>
        </NestableScrollContainer>

        {/* Kebab Popover */}
        <KebabPopover
          visible={openKebab.type !== null}
          onClose={() => setOpenKebab({ ...openKebab, type: null, id: null })}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          position={openKebab.position}
        />

        <BaseModal
          visible={editIntentModalVisible}
          onClose={() => {
            setEditIntentModalVisible(false);
            setPendingProgramDrop(null);
          }}
          title="Edit Active Program?"
          icon={<ExclamationTriangleIcon size={MODAL_ICON_SIZE} color={colors.warning} />}
        >
          <Text style={modalStyles.message}>
            This program is in progress. How should we handle your edits?
          </Text>
          <View style={[modalStyles.actions, styles.modalActions]}>
            <Pressable
              onPress={async () => {
                if (!pendingProgramDrop) return;
                setEditIntentModalVisible(false);
                await applyProgramAppend(
                  pendingProgramDrop.programId,
                  pendingProgramDrop.templateId,
                  'keep'
                );
                setPendingProgramDrop(null);
              }}
              style={({ pressed }) => [
                modalStyles.successButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.successButtonText, styles.modalActionText]}>
                Apply to future workouts
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                if (!pendingProgramDrop) return;
                setEditIntentModalVisible(false);
                await applyProgramAppend(
                  pendingProgramDrop.programId,
                  pendingProgramDrop.templateId,
                  'restart'
                );
                setPendingProgramDrop(null);
              }}
              style={({ pressed }) => [
                modalStyles.warningButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.warningButtonText, styles.modalActionText]}>
                Restart program
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEditIntentModalVisible(false);
                setPendingProgramDrop(null);
              }}
              style={({ pressed }) => [
                modalStyles.cancelButton,
                styles.modalActionButton,
                pressed && modalStyles.buttonPressed,
              ]}
            >
              <Text style={[modalStyles.cancelButtonText, styles.modalActionText]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </BaseModal>
      </SafeAreaView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteConfirmation.visible}
        itemName={deleteConfirmation.name}
        dependentPrograms={deleteConfirmation.dependentPrograms}
        isQuickStartProgram={deleteConfirmation.isQuickStartProgram}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toast Notification */}
      <ToastNotification
        visible={showToast}
        message={toastMessage || 'Done!'}
        onHide={() => setShowToast(false)}
      />

      <NewUserChecklistModal
        visible={isNewUserChecklistModalVisible}
        state={newUserChecklistState}
        onClose={() => setIsNewUserChecklistModalVisible(false)}
        onSetTaskStatus={updateNewUserChecklistTaskStatus}
      />

      <NewUserChecklistCompleteGraffitiModal
        visible={isNewUserChecklistCompleteVisible}
        onClose={handleChallengeCompleteClose}
      />

      <WorkoutScheduleEditorModal
        visible={scheduleEditorVisible}
        initialDays={scheduleDays}
        isSaving={isSavingSchedule}
        onClose={() => setScheduleEditorVisible(false)}
        onSave={handleSaveSchedule}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222222',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    alignItems: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: SCROLL_PADDING_BOTTOM,
  },
  newUserChecklistCard: {
    marginTop: CHECKLIST_CARD_MARGIN_TOP,
    marginBottom: CHECKLIST_CARD_MARGIN_BOTTOM,
    minHeight: scale(74),
    paddingHorizontal: CHECKLIST_CARD_PADDING,
    paddingVertical: scale(10),
    borderRadius: CHECKLIST_CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  newUserChecklistProgressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
  },
  newUserChecklistRing: {
    width: CHALLENGE_RING_SIZE,
    height: CHALLENGE_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newUserChecklistRingText: {
    position: 'absolute',
    fontSize: moderateScale(12),
    fontWeight: '900',
  },
  newUserChecklistTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  newUserChecklistTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: responsiveValue(12, 13, 14),
    letterSpacing: 1.4,
    marginBottom: scale(4),
  },
  newUserChecklistSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  challengeCompleteRoot: {
    flex: 1,
  },
  challengeCompleteSafeArea: {
    flex: 1,
  },
  challengeCompleteContent: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  challengeGraffitiStage: {
    flex: 1,
    minHeight: scale(360),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  challengeGraffitiArt: {
    position: 'absolute',
  },
  challengeCompleteKicker: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: scale(10),
  },
  challengeCompleteGraffitiText: {
    fontFamily: 'BankGothicBT-Medium',
    letterSpacing: 2.2,
    textAlign: 'center',
    textTransform: 'uppercase',
    maxWidth: '100%',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  challengeCompleteScore: {
    marginTop: scale(6),
    fontSize: moderateScale(58),
    lineHeight: moderateScale(66),
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  challengeCompleteMessage: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  challengeCompleteTitle: {
    fontSize: moderateScale(21),
    lineHeight: moderateScale(28),
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  challengeCompleteButton: {
    minHeight: scale(58),
    borderRadius: 999,
  },
  challengeCompleteButtonText: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  checklistModalHeader: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: scale(18),
    marginBottom: CHECKLIST_MODAL_GAP,
  },
  checklistModalRoot: {
    flex: 1,
    overflow: 'hidden',
  },
  checklistModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  checklistFullPage: {
    flex: 1,
  },
  checklistFullPageSafeArea: {
    flex: 1,
  },
  checklistFullPageHeader: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: scale(12),
    paddingBottom: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(16),
  },
  checklistFullPageTitle: {
    flex: 1,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: responsiveValue(20, 24, 28),
    letterSpacing: 2,
    textAlign: 'center',
  },
  checklistFullPageBackButton: {
    width: scale(54),
    height: scale(54),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistFullPageHeaderSpacer: {
    width: scale(54),
    height: scale(54),
  },
  checklistModalIntro: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginBottom: scale(8),
  },
  checklistModalProgressTrack: {
    height: CHECKLIST_PROGRESS_HEIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(127,127,127,0.22)',
  },
  checklistModalProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  checklistModalScroll: {
    flex: 1,
  },
  checklistModalContent: {
    gap: CHECKLIST_MODAL_GAP,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: scale(32),
  },
  checklistTaskCard: {
    borderWidth: 1,
    borderRadius: CHECKLIST_TASK_CARD_RADIUS,
    padding: CHECKLIST_TASK_CARD_PADDING,
  },
  checklistTaskCardPressed: {
    opacity: 0.78,
  },
  checklistTaskTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(9),
  },
  checklistTaskTopRowCentered: {
    alignItems: 'center',
  },
  checklistTaskStatusIcon: {
    width: scale(24),
    height: scale(24),
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(1),
  },
  checklistTaskStatusIconCentered: {
    marginTop: 0,
  },
  checklistTaskStatusQuestion: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    lineHeight: moderateScale(18),
  },
  checklistTaskTitleColumn: {
    flex: 1,
    minWidth: 0,
  },
  checklistTaskTitle: {
    fontSize: CHECKLIST_TASK_TITLE_SIZE,
    fontWeight: '800',
  },
  checklistTaskDescription: {
    marginTop: scale(3),
    fontSize: CHECKLIST_TASK_DESCRIPTION_SIZE,
    lineHeight: CHECKLIST_TASK_DESCRIPTION_SIZE * 1.28,
    fontWeight: '500',
  },
  checklistTaskSkipButton: {
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  checklistTaskSkipText: {
    fontSize: CHECKLIST_TASK_STATUS_SIZE,
    fontWeight: '800',
  },
  checklistTaskDetailOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: scale(28),
  },
  checklistTaskDetailCenter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistTaskDetailModal: {
    borderRadius: scale(18),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  checklistTaskDetailHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
    paddingBottom: scale(14),
    position: 'relative',
    zIndex: 1,
  },
  checklistTaskDetailTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    textAlign: 'center',
  },
  checklistTaskDetailContent: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(24),
    zIndex: 1,
  },
  checklistTaskDetailDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    fontWeight: '600',
    marginBottom: scale(14),
    textAlign: 'center',
  },
  checklistTaskDetailBox: {
    borderWidth: 1,
    borderRadius: scale(14),
    padding: scale(14),
  },
  checklistTaskDetailText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(21),
    fontWeight: '600',
  },
  checklistTaskDetailCopyButton: {
    marginTop: scale(14),
    borderRadius: 999,
    paddingVertical: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistTaskDetailCopyButtonText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: SECTION_SPACING,
  },
  programsSection: {
    marginTop: PROGRAMS_SECTION_MARGIN_TOP,
  },
  onboardingProgramPreviewCard: {
    marginTop: ONBOARDING_PREVIEW_MARGIN_TOP,
    marginBottom: ONBOARDING_PREVIEW_MARGIN_BOTTOM,
    borderRadius: ONBOARDING_PREVIEW_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  onboardingProgramPreviewContent: {
    padding: ONBOARDING_PREVIEW_PADDING,
  },
  onboardingProgramPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  onboardingProgramPreviewEyebrow: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: ONBOARDING_PREVIEW_EYEBROW_SIZE,
    letterSpacing: 2,
    marginBottom: scale(8),
  },
  onboardingProgramPreviewTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: ONBOARDING_PREVIEW_TITLE_SIZE,
    lineHeight: ONBOARDING_PREVIEW_TITLE_SIZE * 1.18,
    letterSpacing: 1.4,
  },
  onboardingProgramPreviewSubtitle: {
    marginTop: scale(6),
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: '600',
  },
  onboardingProgramPreviewButton: {
    marginTop: ONBOARDING_PREVIEW_BUTTON_MARGIN_TOP,
    borderRadius: ONBOARDING_PREVIEW_BUTTON_RADIUS,
    paddingVertical: ONBOARDING_PREVIEW_BUTTON_PADDING_Y,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingProgramPreviewButtonDisabled: {
    opacity: 0.68,
  },
  onboardingProgramPreviewButtonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: ONBOARDING_PREVIEW_BUTTON_TEXT_SIZE,
    letterSpacing: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SECTION_HEADER_MARGIN,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SECTION_HEADER_GAP,
  },
  chevronContainer: {
    // NOTE: This style appears unused - chevron uses GlassButton circular instead
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    // borderColor would use colors.accentBorder if this style were active
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_SIZE,
    fontWeight: '700',
    color: '#DFE2E6',
  },
  sectionKebabButton: {
    padding: SECTION_Kebab_PADDING,
  },
  cardsContainer: {
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: CARD_HEADER_MARGIN,
    zIndex: 3,
  },
  cardKebabButton: {
    padding: CARD_Kebab_PADDING,
    marginLeft: CARD_Kebab_MARGIN_LEFT,
    zIndex: 4,
  },
  cardTitleColumn: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARD_TITLE_GAP,
  },
  templateSyncPill: {
    alignSelf: 'flex-start',
    marginTop: TEMPLATE_SYNC_ROW_MARGIN_TOP,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: TEMPLATE_SYNC_PILL_PADDING_X,
    paddingVertical: TEMPLATE_SYNC_PILL_PADDING_Y,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  templateSyncPillText: {
    fontSize: TEMPLATE_SYNC_PILL_TEXT_SIZE,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  aiBadge: {
    marginLeft: AI_BADGE_MARGIN_LEFT,
  },
  loadingText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: EMPTY_PADDING,
  },
  emptyText: {
    fontSize: EMPTY_TEXT_SIZE,
    fontWeight: '600',
    color: '#DFE2E6',
    marginBottom: CARD_HEADER_MARGIN,
  },
  emptySubtext: {
    fontSize: EMPTY_SUBTEXT_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  workoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workoutsColumnWrapper: {
    justifyContent: 'space-between',
    gap: WORKOUTS_COLUMN_GAP,
    marginBottom: WORKOUTS_COLUMN_MARGIN,
  },
  cardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    // borderColor now applied via inline styles (colors.accentBorder)
  },
  cardSurface: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    zIndex: 1,
  },
  cardInnerEdge: {
    position: 'absolute',
    top: CARD_INNER_EDGE_INSET,
    right: CARD_INNER_EDGE_INSET,
    bottom: CARD_INNER_EDGE_INSET,
    left: CARD_INNER_EDGE_INSET,
    borderRadius: CARD_RADIUS - CARD_INNER_EDGE_INSET,
    borderWidth: 1,
    zIndex: 2,
  },
  cardCornerAccent: {
    position: 'absolute',
    top: scale(1.5),
    left: scale(1.5),
    width: CARD_CORNER_ACCENT_SIZE,
    height: CARD_CORNER_ACCENT_SIZE,
    borderTopWidth: CARD_CORNER_ACCENT_WIDTH,
    borderLeftWidth: CARD_CORNER_ACCENT_WIDTH,
    borderTopLeftRadius: CARD_RADIUS - scale(1.5),
    zIndex: 3,
  },
  cardPressFrame: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  programCard: {
    backgroundColor: 'transparent',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: PROGRAM_CARD_PADDING_HORIZONTAL,
    paddingTop: CARD_PADDING_TOP + CARD_CONTENT_NUDGE_Y,
    paddingBottom: CARD_PADDING_BOTTOM - CARD_CONTENT_NUDGE_Y,
    overflow: 'visible',
    height: PROGRAM_CARD_HEIGHT,
  },
  workoutCard: {
    backgroundColor: 'transparent',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: WORKOUT_CARD_PADDING_HORIZONTAL,
    paddingTop: CARD_PADDING_TOP + CARD_CONTENT_NUDGE_Y,
    paddingBottom: CARD_PADDING_BOTTOM - CARD_CONTENT_NUDGE_Y,
    overflow: 'visible',
    height: WORKOUT_CARD_HEIGHT,
  },
  programHoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    borderWidth: 2,
    zIndex: 2,
  },
  cardTitle: {
    flex: 1,
    fontSize: CARD_TITLE_SIZE,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: CARD_META_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
    zIndex: 3,
  },
  kebabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  kebabPopover: {
    position: 'absolute',
    backgroundColor: 'rgba(36, 36, 36, 0.95)',
    borderRadius: KEBAB_POPOVER_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: KEBAB_POPOVER_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
    minWidth: scale(150),
  },
  kebabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: KEBAB_OPTION_PADDING_X,
    paddingVertical: KEBAB_OPTION_PADDING_Y,
    gap: KEBAB_OPTION_GAP,
  },
  kebabOptionText: {
    fontSize: KEBAB_OPTION_TEXT_SIZE,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  kebabDeleteText: {
    color: '#ef4444',
  },
  kebabDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: KEBAB_POPOVER_PADDING,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODAL_PADDING,
  },
  confirmationModal: {
    backgroundColor: '#222222',
    borderRadius: MODAL_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    maxWidth: scale(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: MODAL_PADDING,
    position: 'relative',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: MODAL_TITLE_SIZE,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: '#DFE2E6',
    textAlign: 'center',
    marginBottom: MODAL_BUTTON_GAP,
  },
  modalMessage: {
    fontSize: MODAL_MESSAGE_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: MODAL_PADDING,
    lineHeight: MODAL_MESSAGE_LINE_HEIGHT,
  },
  modalQuickStartWarning: {
    fontSize: MODAL_MESSAGE_SIZE,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: MODAL_PADDING,
    lineHeight: MODAL_MESSAGE_LINE_HEIGHT,
  },
  modalSubtleText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -Spacing.xs,
    marginBottom: MODAL_PADDING,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: MODAL_BUTTON_GAP,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: MODAL_BUTTON_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: MODAL_BUTTON_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: MODAL_BUTTON_TEXT_SIZE,
    fontWeight: '700',
    color: '#DFE2E6',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: MODAL_BUTTON_RADIUS,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: MODAL_BUTTON_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteText: {
    fontSize: MODAL_BUTTON_TEXT_SIZE,
    fontWeight: '700',
    color: '#ef4444',
  },
  modalActions: {
    flexDirection: 'column',
    gap: MODAL_ACTION_GAP,
  },
  modalActionButton: {
    width: '100%',
    flex: 0,
  },
  modalActionText: {
    textAlign: 'center',
  },
  toastWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  toastContainer: {
    alignSelf: 'center',
  },
  toast: {
    height: TOAST_HEIGHT,
    borderRadius: TOAST_RADIUS,
    paddingHorizontal: TOAST_PADDING_X,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: TOAST_TEXT_SIZE,
    fontWeight: '600',
    textAlign: 'center',
  },
});
