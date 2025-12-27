import { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRightIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from 'react-native-heroicons/outline';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { Colors } from '../../constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { GlassButton } from '../../components/GlassButton';
import { DraggableGrid } from '../../src/components/DraggableGrid';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { useProgramsStore } from '../../src/store/programsStore';
import { useProgramProgressStore } from '../../src/store/programProgressStore';
import { MAX_WORKOUTS_PER_PROGRAM } from '../../src/constants/programs';
import { BaseModal, useModalStyles } from '../../src/components/ui/BaseModal';
import { useDropZone } from '../../src/hooks/useDropZone';

// Types for drag-and-drop
type ProgramItem = {
  id: string;
  name: string;
  workouts: number;
  weeks: number;
  lastPerformed: string;
  isAiCreated?: boolean;
};

type WorkoutItem = {
  id: string;
  name: string;
  exercises: number;
  lastPerformed: string;
  isAiCreated?: boolean;
};

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
          <DocumentDuplicateIcon color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.textSecondary }]}>Duplicate</Text>
        </TouchableOpacity>
        <View style={[styles.kebabDivider, dividerStyle]} />
        <TouchableOpacity
          style={styles.kebabOption}
          onPress={() => handleAction(onDelete)}
        >
          <TrashIcon color={colors.error} size={16} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

// Programs Section Kebab Popover Component
function ProgramsKebabPopover({
  visible,
  onClose,
  onAddProgram,
  position,
}: {
  visible: boolean;
  onClose: () => void;
  onAddProgram: () => void;
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
          onPress={() => handleAction(onAddProgram)}
        >
          <PlusIcon color={colors.success} size={16} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.success }]}>Add Program</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

// Workouts Section Kebab Popover Component
function WorkoutsKebabPopover({
  visible,
  onClose,
  onAddWorkout,
  position,
}: {
  visible: boolean;
  onClose: () => void;
  onAddWorkout: () => void;
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
          onPress={() => handleAction(onAddWorkout)}
        >
          <PlusIcon color={colors.success} size={16} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, { color: colors.success }]}>Add Workout</Text>
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
          colors={['#22c55e', '#16a34a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.toast}
        >
          <Text style={styles.toastText}>{message}</Text>
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
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  itemName: string;
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
  const { ref, onLayout } = useDropZone({
    id: `program-${item.id}`,
    type: 'program',
    enabled: enableDropZone,
  });

  const cardThemeStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <TouchableOpacity
      ref={ref}
      onLayout={onLayout}
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.programCard,
        cardThemeStyle,
        isActive && styles.cardActive,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.isAiCreated && (
            <SparklesIcon color={colors.success} size={14} strokeWidth={2} style={styles.aiBadge} />
          )}
        </View>
        <TouchableOpacity
          style={styles.cardKebabButton}
          onPress={onKebabPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <EllipsisHorizontalIcon color={colors.success} size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.cardMetaText, { color: colors.textTertiary }]}>
        {item.workouts} workouts · {item.lastPerformed}
      </Text>
    </TouchableOpacity>
  );
}

const buildDropIn = (index: number) =>
  FadeInDown
    .delay(index * 40)
    .springify()
    .damping(18)
    .stiffness(160)
    .mass(0.6);

export default function ProgramsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const modalStyles = useModalStyles();
  const startWorkout = useWorkoutStore(s => s.startWorkout);
  const isWorkoutActive = useWorkoutStore(s => s.isWorkoutActive);

  // Programs store
  const storePrograms = useProgramsStore(s => s.programs);
  const isLoadingPrograms = useProgramsStore(s => s.isLoading);
  const fetchPrograms = useProgramsStore(s => s.fetchPrograms);
  const deleteProgramFromStore = useProgramsStore(s => s.deleteProgram);
  const duplicateProgramInStore = useProgramsStore(s => s.duplicateProgram);
  const duplicateWorkoutInStore = useProgramsStore(s => s.duplicateWorkoutTemplate);
  const appendTemplateToProgram = useProgramsStore(s => s.appendTemplateToProgram);
  const loadProgress = useProgramProgressStore(s => s.loadProgress);
  const progressByProgram = useProgramProgressStore(s => s.progressByProgram);
  const restartProgram = useProgramProgressStore(s => s.restartProgram);
  const trimCompletedDays = useProgramProgressStore(s => s.trimCompletedDays);

  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);

  // Transform store programs to UI format (exclude templates)
  const programs: ProgramItem[] = storePrograms
    .filter(p => !p.isTemplate)
    .map(p => ({
      id: p.id,
      name: p.name,
      workouts: p.workouts.length,
      weeks: p.durationWeeks || 0,
      lastPerformed: formatRelativeTime(p.lastPerformedAt),
      isAiCreated: p.isAiCreated,
    }));

  // Templates (programs marked as isTemplate)
  const templates: (WorkoutItem & { programId: string })[] = storePrograms
    .filter(p => p.isTemplate)
    .map(p => ({
      id: p.id,
      programId: p.id,
      name: p.name,
      exercises: p.workouts[0]?.exercises.length || 0,
      lastPerformed: formatRelativeTime(p.lastPerformedAt),
      isAiCreated: p.isAiCreated,
    }));

  // Keep original workouts for backward compatibility
  const workouts: WorkoutItem[] = templates;

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
  }>({ visible: false, type: null, id: null, name: '' });
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

  // Workouts section kebab menu state
  const [showWorkoutsKebab, setShowWorkoutsKebab] = useState(false);
  const [workoutsKebabPosition, setWorkoutsKebabPosition] = useState({ top: 0, left: 0 });
  const [showProgramsKebab, setShowProgramsKebab] = useState(false);
  const [programsKebabPosition, setProgramsKebabPosition] = useState({ top: 0, left: 0 });

  // Handle start blank workout
  const handleStartBlankWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout(); // Creates blank workout with generated ID and timestamp
    router.push('/workout/active');
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
        const popoverWidth = 200;
        const margin = 12;
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
      const newProgramId = await duplicateProgramInStore(openKebab.id);
      if (newProgramId) {
        // Trigger entering animation for the new card
        const cardKey = `program-${newProgramId}`;
        setAnimatingCards(prev => ({ ...prev, [cardKey]: 'entering' }));
        // Show toast notification
        setToastMessage('Program duplicated!');
        setShowToast(true);
      }
    } else if (openKebab.type === 'workout' && openKebab.id !== null) {
      const newWorkoutId = await duplicateWorkoutInStore(openKebab.id);
      if (newWorkoutId) {
        const cardKey = `workout-${newWorkoutId}`;
        setAnimatingCards(prev => ({ ...prev, [cardKey]: 'entering' }));
        setToastMessage('Workout duplicated!');
        setShowToast(true);
      }
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

  const handleWorkoutDropOnProgram = useCallback((sourceItemId: string, targetDropZoneId: string) => {
    const templateId = sourceItemId.replace(/^workout-/, '');
    const programId = targetDropZoneId.replace(/^program-/, '');
    if (!templateId || !programId) return;

    const program = storePrograms.find((p) => p.id === programId && !p.isTemplate);
    if (!program) return;

    if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
      setToastMessage(`Programs can have at most ${MAX_WORKOUTS_PER_PROGRAM} workouts.`);
      setShowToast(true);
      return;
    }

    if (progressByProgram[programId]) {
      setPendingProgramDrop({ programId, templateId });
      setEditIntentModalVisible(true);
      return;
    }

    applyProgramAppend(programId, templateId);
  }, [applyProgramAppend, progressByProgram, storePrograms]);

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
        setDeleteConfirmation({
          visible: true,
          type: 'workout',
          id: openKebab.id,
          name: workout.name,
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

  // Handle workouts section kebab press
  const handleWorkoutsKebabPress = (event: any) => {
    event.preventDefault?.();
    event.stopPropagation?.();

    event.target.measure(
      (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const popoverWidth = 180;
        const margin = 12;
        const left = Math.min(
          Math.max(margin, pageX - popoverWidth + width),
          screenWidth - popoverWidth - margin
        );
        setWorkoutsKebabPosition({
          top: pageY + height + 2,
          left,
        });
        setShowWorkoutsKebab(true);
      }
    );
  };

  // Handle programs section kebab press
  const handleProgramsKebabPress = (event: any) => {
    event.preventDefault?.();
    event.stopPropagation?.();

    event.target.measure(
      (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const popoverWidth = 180;
        const margin = 12;
        const left = Math.min(
          Math.max(margin, pageX - popoverWidth + width),
          screenWidth - popoverWidth - margin
        );
        setProgramsKebabPosition({
          top: pageY + height + 2,
          left,
        });
        setShowProgramsKebab(true);
      }
    );
  };

  const handleAddProgramPress = () => {
    setShowProgramsKebab(false);
    setTimeout(() => {
      router.push('/programs/create');
    }, 100);
  };

  // Handle add workout from kebab menu
  const handleAddWorkoutPress = () => {
    setShowWorkoutsKebab(false);
    // Small delay to let kebab close animation start
    setTimeout(() => {
      router.push('/workout/create');
    }, 100);
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

      return (
        <Reanimated.View entering={buildDropIn(index)}>
          <AnimatedCard
            animationState={animState}
            onAnimationComplete={() => handleAnimationComplete('workout', item.id)}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleWorkoutCardPress(item.id)}
              style={[
                styles.workoutCard,
                workoutCardThemeStyle,
                isActive && styles.cardActive,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  {item.isAiCreated && (
                    <SparklesIcon color={colors.success} size={14} strokeWidth={2} style={styles.aiBadge} />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.cardKebabButton}
                  onPress={(event) => handleKebabPress('workout', item.id, event)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <EllipsisHorizontalIcon color={colors.success} size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardMetaText, { color: colors.textTertiary }]}>
                {item.exercises} exercises · {item.lastPerformed}
              </Text>
            </TouchableOpacity>
          </AnimatedCard>
        </Reanimated.View>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress, handleWorkoutCardPress, colors, isDark, workoutCardThemeStyle]
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
        {/* Header */}
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Programs</Text>
        </View>

        <NestableScrollContainer
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Start Section */}
          <View style={styles.quickStartSection}>
            <GlassButton style={styles.startButton} onPress={handleStartBlankWorkout} disabled={isWorkoutActive}>
              <View style={styles.startButtonInner}>
                <PlayIcon color="#fff" size={20} strokeWidth={2} />
                <Text style={styles.startButtonText}>Start a Blank Workout</Text>
              </View>
            </GlassButton>
          </View>

          {/* Programs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity
                onPress={() => setShowPrograms(!showPrograms)}
                style={styles.sectionHeaderButton}
              >
                <GlassButton circular size={24} onPress={() => setShowPrograms(!showPrograms)}>
                  <ChevronRightIcon
                    color="#fff"
                    size={16}
                    style={[
                      styles.chevron,
                      showPrograms && styles.chevronRotated,
                    ]}
                  />
                </GlassButton>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Programs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProgramsKebabPress}
                style={styles.sectionKebabButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <EllipsisHorizontalIcon color={colors.textTertiary} size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <CollapsibleSection isOpen={showPrograms}>
              {showPrograms && (
                programs.length === 0 ? null : (
                  <DraggableGrid
                    data={programs}
                    keyExtractor={(item) => `program-${item.id}`}
                    renderItem={renderProgramGridItem}
                    onReorder={() => {
                      // Reordering currently not persisted to database
                    }}
                    numColumns={1}
                    itemHeight={70}
                    gap={12}
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
                style={styles.sectionHeaderButton}
              >
                <GlassButton circular size={24} onPress={() => setShowWorkouts(!showWorkouts)}>
                  <ChevronRightIcon
                    color="#fff"
                    size={16}
                    style={[
                      styles.chevron,
                      showWorkouts && styles.chevronRotated,
                    ]}
                  />
                </GlassButton>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWorkoutsKebabPress}
                style={styles.sectionKebabButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <EllipsisHorizontalIcon color={colors.textTertiary} size={20} strokeWidth={2} />
              </TouchableOpacity>
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
                    onReorder={() => {
                      // Reordering currently not persisted to database
                    }}
                    numColumns={2}
                    itemHeight={76}
                    gap={12}
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

        {/* Workouts Section Kebab Popover */}
        <WorkoutsKebabPopover
          visible={showWorkoutsKebab}
          onClose={() => setShowWorkoutsKebab(false)}
          onAddWorkout={handleAddWorkoutPress}
          position={workoutsKebabPosition}
        />
        <ProgramsKebabPopover
          visible={showProgramsKebab}
          onClose={() => setShowProgramsKebab(false)}
          onAddProgram={handleAddProgramPress}
          position={programsKebabPosition}
        />

        <BaseModal
          visible={editIntentModalVisible}
          onClose={() => {
            setEditIntentModalVisible(false);
            setPendingProgramDrop(null);
          }}
          title="Edit Active Program?"
          icon={<ExclamationTriangleIcon size={24} color={colors.warning} />}
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
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toast Notification */}
      <ToastNotification
        visible={showToast}
        message={toastMessage || 'Done!'}
        onHide={() => setShowToast(false)}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'BankGothicBT-Medium',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  quickStartSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DFE2E6',
  },
  sectionKebabButton: {
    padding: 4,
  },
  startButton: {
    height: 36,
    borderRadius: 8,
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardsContainer: {
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardKebabButton: {
    padding: 4,
    marginLeft: 8,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadge: {
    marginLeft: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DFE2E6',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
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
    gap: 12,
    marginBottom: 12,
  },
  cardActive: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    height: 70,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    height: 76,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
    minWidth: 150,
  },
  kebabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  kebabOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  kebabDeleteText: {
    color: '#ef4444',
  },
  kebabDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationModal: {
    backgroundColor: '#222222',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DFE2E6',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DFE2E6',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  modalActions: {
    flexDirection: 'column',
    gap: 8,
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
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
