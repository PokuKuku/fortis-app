import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, type ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ActivityIndicator,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CloudIcon,
} from 'react-native-heroicons/outline';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import Reanimated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { Colors } from '../../constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AppHeaderBrand } from '@/src/components/navigation/AppHeaderBrand';
import { GlassButton } from '../../components/GlassButton';
import { DraggableGrid } from '../../src/components/DraggableGrid';
import { Spacing } from '@/constants/Sizes';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useProgramsStore } from '../../src/store/programsStore';
import { useProgramProgressStore } from '../../src/store/programProgressStore';
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
  loadPendingOnboardingProgramSpec,
  ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
  updatePendingOnboardingProgramSpec,
  type OnboardingProgramSpec,
} from '@/src/utils/onboardingProgram';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';

const AnimatedTouchableOpacity = Reanimated.createAnimatedComponent(TouchableOpacity);

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
const CARD_ACCENT_GLOW_HEIGHT = scale(8);
const CARD_ACCENT_GLOW_VISIBLE_HEIGHT = scale(5);
const CARD_ACCENT_GLOW_LIFT = scale(2);
const WORKOUT_CARD_ACCENT_GLOW_LIFT = CARD_ACCENT_GLOW_LIFT + scale(1);
const CARD_ACCENT_GLOW_CLIP_TOP = CARD_ACCENT_GLOW_HEIGHT - CARD_ACCENT_GLOW_VISIBLE_HEIGHT;
const PROGRAM_CARD_GRID_HEIGHT = PROGRAM_CARD_HEIGHT + CARD_ACCENT_GLOW_VISIBLE_HEIGHT;
const WORKOUT_CARD_GRID_HEIGHT = WORKOUT_CARD_HEIGHT + CARD_ACCENT_GLOW_VISIBLE_HEIGHT;
const PROGRAM_CARD_PADDING_HORIZONTAL = responsiveValue(10, 12, 14);
const WORKOUT_CARD_PADDING_HORIZONTAL = responsiveValue(8, 10, 12);
const CARD_PADDING_TOP = responsiveValue(8, 10, 12);
const CARD_PADDING_BOTTOM = responsiveValue(10, 12, 14);
const SECTION_TITLE_SIZE = responsiveValue(18, 20, 22);
const CARD_TITLE_SIZE = responsiveValue(12, 14, 15);
const CARD_META_SIZE = responsiveValue(11, 12, 13);
const HORIZONTAL_PADDING = scale(24);
const HEADER_PADDING_TOP = scale(16);
const HEADER_PADDING_BOTTOM = scale(12);
const SCROLL_PADDING_BOTTOM = scale(120);
const SECTION_SPACING = scale(32);
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
const WORKOUT_CARD_ACCENT_GLOW_INSET = Math.max(0, CARD_RADIUS - scale(4));
const CARD_HEADER_MARGIN = scale(4);
const CARD_TITLE_GAP = scale(6);
const CARD_Kebab_PADDING = scale(4);
const CARD_Kebab_MARGIN_LEFT = scale(8);
const AI_BADGE_SIZE = scale(14);
const AI_BADGE_MARGIN_LEFT = scale(2);
const LOADING_PADDING = scale(24);
const LOADING_GAP = scale(12);
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
const TEMPLATE_SYNC_PILL_GAP = scale(4);
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
  animationState?: 'entering' | 'exiting' | null;
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
    } else if (animationState === 'exiting') {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
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
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  itemName: string;
  dependentPrograms?: { name: string }[];
  onConfirm: () => void;
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
              <TouchableOpacity style={styles.modalDeleteButton} onPress={onConfirm}>
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
  onKebabPress,
  enableDropZone,
}: {
  item: ProgramItem;
  isActive: boolean;
  onPress: () => void;
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

  const baseBackgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const baseBorderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const cardThemeStyle = {
    backgroundColor: baseBackgroundColor,
    borderColor: baseBorderColor,
  };
  const accentOverlay = colors.accentOverlay;
  const accentBorder = colors.accent;
  const accentShadow = colors.accentShadow;
  const hoverStyle = useAnimatedStyle(() => {
    return {
      opacity: enableDropZone && isHovered.value ? 1 : 0,
    };
  }, [enableDropZone]);
  const hoverBorderStyle = useAnimatedStyle(() => {
    const isDropTarget = enableDropZone && isHovered.value;
    return {
      borderColor: isDropTarget ? accentBorder : baseBorderColor,
      shadowColor: isDropTarget ? accentBorder : accentShadow,
      shadowOpacity: isDropTarget ? 0.5 : 0.34,
    };
  }, [accentBorder, accentShadow, baseBorderColor, enableDropZone]);

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={styles.cardPressFrame}
    >
      <PressDownTouchable
        onPress={onPress}
        style={styles.cardPressFrame}
      >
        <View pointerEvents="none" style={styles.cardAccentGlowViewport}>
          <View
            style={[
              styles.cardAccentGlow,
              { backgroundColor: colors.accent, opacity: isDark ? 0.44 : 0.26 },
            ]}
          />
        </View>
        <Reanimated.View
          style={[
            styles.programCard,
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
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
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
          <Text style={[styles.cardMetaText, { color: readableSubtext.meta }]}>
            {item.workouts} workouts · {item.lastPerformed}
          </Text>
        </Reanimated.View>
      </PressDownTouchable>
    </View>
  );
}

const buildDropIn = (index: number) =>
  FadeInDown
    .delay(index * 40)
    .springify()
    .damping(18)
    .stiffness(160)
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
  const { isTourActive, activeStepId } = useInAppTour();
  const { highlightWorkoutId } = useLocalSearchParams<{ highlightWorkoutId?: string }>();
  const [highlightedWorkoutId, setHighlightedWorkoutId] = useState<string | null>(null);
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
  const loadProgress = useProgramProgressStore(s => s.loadProgress);
  const isProgramProgressLoaded = useProgramProgressStore(s => s.isLoaded);
  const progressByProgram = useProgramProgressStore(s => s.progressByProgram);
  const restartProgram = useProgramProgressStore(s => s.restartProgram);
  const trimCompletedDays = useProgramProgressStore(s => s.trimCompletedDays);

  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [scheduleEditorVisible, setScheduleEditorVisible] = useState(false);
  const [homeCardOrder, setHomeCardOrder] = useState<HomeCardOrderState>(EMPTY_HOME_CARD_ORDER);
  const [isHomeCardOrderLoaded, setIsHomeCardOrderLoaded] = useState(false);
  const [onboardingProgramSpec, setOnboardingProgramSpec] = useState<OnboardingProgramSpec | null>(null);
  const [isOnboardingPreviewDismissing, setIsOnboardingPreviewDismissing] = useState(false);
  const onboardingPreviewOpacity = useRef(new Animated.Value(1)).current;
  const onboardingPreviewScale = useRef(new Animated.Value(1)).current;
  const onboardingPreviewTranslateY = useRef(new Animated.Value(0)).current;
  const shouldAnchorAddWorkout = isTourActive && activeStepId === 'add_workout_routine';

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
  const basePrograms: ProgramItem[] = storePrograms
    .filter(p => !p.isTemplate)
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

  useEffect(() => {
    if (!onboardingPreviewProgram || isOnboardingPreviewDismissing) {
      return;
    }

    onboardingPreviewOpacity.setValue(1);
    onboardingPreviewScale.setValue(1);
    onboardingPreviewTranslateY.setValue(0);
  }, [
    isOnboardingPreviewDismissing,
    onboardingPreviewOpacity,
    onboardingPreviewProgram,
    onboardingPreviewScale,
    onboardingPreviewTranslateY,
  ]);

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
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);
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
  }>({ visible: false, type: null, id: null, name: '' });
  const pendingWorkoutDeletes = useRef<Record<string, { id: string; name: string; workoutIds: string[] }[]>>({});
  const [animatingCards, setAnimatingCards] = useState<{
    [key: string]: 'entering' | 'exiting';
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

  // Handle program card press - navigate to program detail
  const handleProgramCardPress = (programId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/${programId}`);
  };

  const handleOnboardingProgramPreviewPress = useCallback(async () => {
    if (!onboardingPreviewProgram || !onboardingProgramSpec || isOnboardingPreviewDismissing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOnboardingPreviewDismissing(true);

    await new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(onboardingPreviewOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(onboardingPreviewScale, {
          toValue: 0.96,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(onboardingPreviewTranslateY, {
          toValue: -12,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });

    setOnboardingProgramSpec({
      ...onboardingProgramSpec,
      status: 'dismissed',
      generatedProgramId: onboardingPreviewProgram.id,
      updatedAt: new Date().toISOString(),
    });

    try {
      await updatePendingOnboardingProgramSpec({
        status: 'dismissed',
        generatedProgramId: onboardingPreviewProgram.id,
      });
    } catch (error) {
      console.warn('Failed to dismiss onboarding program preview:', error);
    }
    router.push(`/programs/${onboardingPreviewProgram.id}`);
    setIsOnboardingPreviewDismissing(false);
  }, [
    isOnboardingPreviewDismissing,
    onboardingPreviewOpacity,
    onboardingPreviewProgram,
    onboardingProgramSpec,
    onboardingPreviewScale,
    onboardingPreviewTranslateY,
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

  const confirmDelete = () => {
    if (deleteConfirmation.type === 'program' && deleteConfirmation.id !== null) {
      const cardKey = `program-${deleteConfirmation.id}`;
      setAnimatingCards(prev => ({ ...prev, [cardKey]: 'exiting' }));
    } else if (deleteConfirmation.type === 'workout' && deleteConfirmation.id !== null) {
      const cardKey = `workout-${deleteConfirmation.id}`;
      if (deleteConfirmation.dependentPrograms) {
        pendingWorkoutDeletes.current[deleteConfirmation.id] = deleteConfirmation.dependentPrograms;
      }
      setAnimatingCards(prev => ({ ...prev, [cardKey]: 'exiting' }));
    }
    setDeleteConfirmation({ visible: false, type: null, id: null, name: '' });
  };

  const handleAnimationComplete = async (type: 'program' | 'workout', id: string) => {
    const cardKey = `${type}-${id}`;
    const animState = animatingCards[cardKey];

    if (animState === 'entering') {
      // Remove from animating cards after entering animation completes
      setAnimatingCards(prev => {
        const next = { ...prev };
        delete next[cardKey];
        return next;
      });
    } else if (animState === 'exiting') {
      // Delete from database after exiting animation completes
      // Both programs and workouts (templates) use the same store
      if (type === 'workout') {
        const dependentPrograms = pendingWorkoutDeletes.current[id] || [];
        if (dependentPrograms.length > 0) {
          for (const program of dependentPrograms) {
            for (const workoutId of program.workoutIds) {
              // Remove linked workouts before deleting the template
              await removeWorkoutFromProgram(program.id, workoutId);
            }
          }
        }
        delete pendingWorkoutDeletes.current[id];
      }
      await deleteProgramFromStore(id);
      // Remove from animating cards
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
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
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
              onPress={() => handleWorkoutCardPress(item.id)}
              style={styles.cardPressFrame}
            >
              <View
                pointerEvents="none"
                style={[styles.cardAccentGlowViewport, styles.workoutCardAccentGlowViewport]}
              >
                <View
                  style={[
                    styles.cardAccentGlow,
                    styles.workoutCardAccentGlow,
                    { backgroundColor: colors.accent, opacity: isDark ? 0.44 : 0.26 },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.workoutCard,
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
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleColumn}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
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
                      {item.syncStatus === 'syncing' && (
                        <ActivityIndicator
                          size="small"
                          color={colors.accent}
                          style={styles.templateSyncSpinner}
                        />
                      )}
                      <Text style={[styles.templateSyncPillText, { color: colors.accent }]}>
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
              <Text style={[styles.cardMetaText, { color: readableSubtext.meta }]}>
                {item.exercises} exercises · {item.lastPerformed}
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
      colors,
      isDark,
      workoutCardThemeStyle,
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
              onPress={() => handleProgramCardPress(item.id)}
              onKebabPress={(event) => handleKebabPress('program', item.id, event)}
            />
          </AnimatedCard>
        </Reanimated.View>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress, handleProgramCardPress, showPrograms]
  );

  // Theme-aware styles for glass cards and popovers
  const glassCardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeaderBrand style={styles.header} />

          <WeeklyProgressCarousel
            scheduleDays={scheduleDays}
            scheduleHistory={scheduleHistory}
            sessions={historySessions}
            onEditSchedule={() => setScheduleEditorVisible(true)}
          />

          {onboardingPreviewProgram && (
            <Animated.View
              style={{
                opacity: onboardingPreviewOpacity,
                transform: [
                  { translateY: onboardingPreviewTranslateY },
                  { scale: onboardingPreviewScale },
                ],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.84}
                disabled={isOnboardingPreviewDismissing}
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
                        {onboardingPreviewProgram.name}
                      </Text>
                    </View>
                    <SparklesIcon color={colors.accent} size={MODAL_ICON_SIZE} strokeWidth={2} />
                  </View>
                  <LinearGradient
                    colors={colors.accentGradient as unknown as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.onboardingProgramPreviewButton}
                  >
                    <Text style={[styles.onboardingProgramPreviewButtonText, { color: colors.accentForegroundOnFill }]}>VIEW PROGRAM</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Programs Section */}
          <View style={styles.section}>
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
              {showPrograms && (
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
              {showWorkouts && (
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
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toast Notification */}
      <ToastNotification
        visible={showToast}
        message={toastMessage || 'Done!'}
        onHide={() => setShowToast(false)}
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
  section: {
    marginBottom: SECTION_SPACING,
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
  onboardingProgramPreviewButton: {
    marginTop: ONBOARDING_PREVIEW_BUTTON_MARGIN_TOP,
    borderRadius: ONBOARDING_PREVIEW_BUTTON_RADIUS,
    paddingVertical: ONBOARDING_PREVIEW_BUTTON_PADDING_Y,
    alignItems: 'center',
    justifyContent: 'center',
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
  templateSyncSpinner: {
    marginRight: TEMPLATE_SYNC_PILL_GAP,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LOADING_PADDING,
    gap: LOADING_GAP,
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
  cardPressFrame: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  cardAccentGlowViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -(CARD_ACCENT_GLOW_VISIBLE_HEIGHT - CARD_ACCENT_GLOW_LIFT),
    height: CARD_ACCENT_GLOW_VISIBLE_HEIGHT,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    zIndex: 0,
  },
  workoutCardAccentGlowViewport: {
    left: 0,
    right: 0,
    bottom: -(CARD_ACCENT_GLOW_VISIBLE_HEIGHT - WORKOUT_CARD_ACCENT_GLOW_LIFT),
  },
  cardAccentGlow: {
    position: 'absolute',
    left: CARD_RADIUS,
    right: CARD_RADIUS,
    top: -CARD_ACCENT_GLOW_CLIP_TOP,
    height: CARD_ACCENT_GLOW_HEIGHT,
    borderRadius: 999,
  },
  workoutCardAccentGlow: {
    left: WORKOUT_CARD_ACCENT_GLOW_INSET,
    right: WORKOUT_CARD_ACCENT_GLOW_INSET,
  },
  programCard: {
    backgroundColor: 'transparent',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: PROGRAM_CARD_PADDING_HORIZONTAL,
    paddingTop: CARD_PADDING_TOP,
    paddingBottom: CARD_PADDING_BOTTOM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'visible',
    height: PROGRAM_CARD_HEIGHT,
  },
  workoutCard: {
    backgroundColor: 'transparent',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: WORKOUT_CARD_PADDING_HORIZONTAL,
    paddingTop: CARD_PADDING_TOP,
    paddingBottom: CARD_PADDING_BOTTOM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
    fontWeight: '700',
    color: '#DFE2E6',
    marginBottom: MODAL_BUTTON_GAP,
  },
  modalMessage: {
    fontSize: MODAL_MESSAGE_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: MODAL_PADDING,
    lineHeight: MODAL_MESSAGE_LINE_HEIGHT,
  },
  modalSubtleText: {
    fontSize: 12,
    fontWeight: '500',
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
