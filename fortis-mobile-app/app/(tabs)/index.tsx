import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRightIcon, PlayIcon, EllipsisHorizontalIcon, DocumentDuplicateIcon, TrashIcon } from 'react-native-heroicons/outline';
import AnimatedView, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import DraggableFlatList, {
  NestableScrollContainer,
  NestableDraggableFlatList,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { GlassCard } from '../../components/GlassCard';
import { GlassButton } from '../../components/GlassButton';
import { usePersistedOrder } from '../../src/hooks/usePersistedOrder';
import { DraggableGrid } from '../../src/components/DraggableGrid';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { useDropZone } from '../../src/hooks/useDropZone';
import { useDragDropContext } from '../../src/hooks/useDragDropContext';
import { AddToProgramModal, ProgramWorkoutSlot } from '../../src/components/workout/AddToProgramModal';
import { usePrograms } from '../../src/hooks/usePrograms';
import * as ProgramService from '../../src/services/programService';
import { Colors } from '../../constants/Colors';

// Sample data for workouts (will be moved to service layer later)
const initialWorkouts = [
  { id: 1, name: 'Push Day A', exercises: 5, lastPerformed: '3 days ago' },
  { id: 2, name: 'Pull Day B', exercises: 6, lastPerformed: '5 days ago' },
  { id: 3, name: 'Leg Day', exercises: 4, lastPerformed: '1 week ago' },
  { id: 4, name: 'Core & Cardio', exercises: 3, lastPerformed: '2 weeks ago' },
];

// Types for drag-and-drop
type ProgramItem = {
  id: string;
  name: string;
  workouts: number; // Now computed from workouts.length
  weeks: number;
  lastPerformed: string;
};

type WorkoutItem = {
  id: number;
  name: string;
  exercises: number;
  lastPerformed: string;
};

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
  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
          <DocumentDuplicateIcon color="#DFE2E6" size={16} strokeWidth={2} />
          <Text style={styles.kebabOptionText}>Duplicate</Text>
        </TouchableOpacity>
        <View style={styles.kebabDivider} />
        <TouchableOpacity
          style={styles.kebabOption}
          onPress={() => handleAction(onDelete)}
        >
          <TrashIcon color="#ef4444" size={16} strokeWidth={2} />
          <Text style={[styles.kebabOptionText, styles.kebabDeleteText]}>Delete</Text>
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

// Program Card Component
function ProgramCard({
  program,
  onKebabPress,
  showKebab,
}: {
  program: ProgramItem;
  onKebabPress: (event: any) => void;
  showKebab: boolean;
}) {
  return (
    <View style={styles.programCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {program.name}
        </Text>
        <TouchableOpacity style={styles.cardKebabButton} onPress={onKebabPress}>
          <EllipsisHorizontalIcon color="#22c55e" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMetaText}>
        {program.workouts} workouts · {program.lastPerformed}
      </Text>
    </View>
  );
}

// Workout Card Component
function WorkoutCard({
  workout,
  onKebabPress,
  showKebab,
}: {
  workout: typeof initialWorkouts[0];
  onKebabPress: (event: any) => void;
  showKebab: boolean;
}) {
  return (
    <View style={styles.workoutCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {workout.name}
        </Text>
        <TouchableOpacity style={styles.cardKebabButton} onPress={onKebabPress}>
          <EllipsisHorizontalIcon color="#22c55e" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMetaText}>
        {workout.exercises} exercises · {workout.lastPerformed}
      </Text>
    </View>
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
// 3. Use #222222 background color with overflow: 'hidden'
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
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

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
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <Animated.View
          style={[
            styles.confirmationModal,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <StainlessSteelPattern />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete {itemName}?</Text>
            <Text style={styles.modalMessage}>
              This action cannot be undone. Are you sure you want to delete this item?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
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

// Drop Zone Program Card Component - wraps program cards with drop zone functionality
function DropZoneProgramCard({
  programId,
  children,
}: {
  programId: string | number;
  children: React.ReactNode;
}) {
  const { ref, onLayout, isHovered } = useDropZone({
    id: `program-${programId}`,
    type: 'program',
  });

  // Animated style for drop zone highlight
  const dropHighlightStyle = useAnimatedStyle(() => {
    return {
      borderColor: withSpring(
        isHovered.value ? Colors.success : 'rgba(255, 255, 255, 0.15)',
        { damping: 20, stiffness: 200 }
      ),
      borderWidth: withSpring(isHovered.value ? 2 : 1, { damping: 20, stiffness: 200 }),
      transform: [
        { scale: withSpring(isHovered.value ? 1.02 : 1, { damping: 20, stiffness: 200 }) },
      ],
      shadowColor: isHovered.value ? Colors.success : '#000',
      shadowOpacity: withSpring(isHovered.value ? 0.4 : 0, { damping: 20, stiffness: 200 }),
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
    };
  });

  return (
    <AnimatedView.View
      ref={ref}
      onLayout={onLayout}
      style={[styles.dropZoneWrapper, dropHighlightStyle]}
    >
      {children}
    </AnimatedView.View>
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

export default function ProgramsScreen() {
  const router = useRouter();
  const startWorkout = useWorkoutStore(s => s.startWorkout);
  const isWorkoutActive = useWorkoutStore(s => s.isWorkoutActive);

  // Use programs from service with persistence
  const { programs: programsData, loading: programsLoading, refresh: refreshPrograms } = usePrograms();

  // Transform ProgramDetail to ProgramItem for the UI
  const programs: ProgramItem[] = programsData.map(p => ({
    id: p.id,
    name: p.name,
    workouts: p.workouts.length, // Computed from actual workouts array
    weeks: p.durationWeeks,
    lastPerformed: p.lastPerformed || 'Never',
  }));

  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [openKebab, setOpenKebab] = useState<{
    type: 'program' | 'workout' | null;
    id: string | number | null;
    position: { top: number; right: number };
  }>({ type: null, id: null, position: { top: 0, right: 0 } });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    type: 'program' | 'workout' | null;
    id: string | number | null;
    name: string;
  }>({ visible: false, type: null, id: null, name: '' });
  const [animatingCards, setAnimatingCards] = useState<{
    [key: string]: 'entering' | 'exiting';
  }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Duplicated!');
  const [isStarting, setIsStarting] = useState(false);
  const isNavigating = useRef(false);
  const isProcessing = useRef(false);

  // Add to program modal state
  const [addToProgramModal, setAddToProgramModal] = useState<{
    visible: boolean;
    workoutId: string | null;
    workoutName: string;
    programId: string | null;
    programName: string;
  }>({
    visible: false,
    workoutId: null,
    workoutName: '',
    programId: null,
    programName: '',
  });

  // Reset starting flag when workout becomes inactive (user cancelled or finished)
  useEffect(() => {
    if (!isWorkoutActive) {
      setIsStarting(false);
    }
  }, [isWorkoutActive]);

  // Persistence hook for workout drag-and-drop order
  // Note: Programs order is managed by the program service with AsyncStorage persistence
  const { saveOrder: saveWorkoutsOrder } = usePersistedOrder(
    'workouts',
    workouts,
    setWorkouts
  );

  // Handle start blank workout
  const handleStartBlankWorkout = () => {
    // Navigate to active workout if one exists
    if (isWorkoutActive) {
      router.push('/workout/active');
      return;
    }
    // Button is disabled when isStarting, but guard anyway
    if (isStarting) return;

    setIsStarting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout(); // Creates blank workout with generated ID and timestamp
    router.push('/workout/active');
  };

  // Handle tap on workout card to navigate to workout hub
  const handleWorkoutCardPress = (workoutId: number) => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workouts/${workoutId}`);

    // Reset after navigation completes
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  // Handle tap on program card to navigate to program hub
  const handleProgramCardPress = (programId: string | number) => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/${programId}`);

    // Reset after navigation completes
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const handleKebabPress = (
    type: 'program' | 'workout',
    id: string | number,
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

  const handleDuplicate = () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    if (openKebab.type === 'program' && openKebab.id !== null) {
      // TODO: Implement program duplication via service
      setToastMessage('Program duplication coming soon');
      setShowToast(true);
      isProcessing.current = false;
    } else if (openKebab.type === 'workout' && openKebab.id !== null) {
      const workoutIndex = workouts.findIndex((w) => w.id === openKebab.id);
      const workout = workouts[workoutIndex];
      if (workout) {
        // Find existing duplicates to determine the next number
        const baseName = workout.name.replace(/\s*\(\d+\)$/, '');
        const duplicates = workouts.filter((w) =>
          w.name.startsWith(baseName)
        );
        const duplicateNumbers = duplicates
          .map((w) => {
            const match = w.name.match(/\((\d+)\)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((n) => n > 0);
        const nextNumber = duplicateNumbers.length > 0
          ? Math.max(...duplicateNumbers) + 1
          : 1;

        const newWorkout = {
          ...workout,
          id: Math.max(...workouts.map((w) => w.id)) + 1,
          name: `${baseName} (${nextNumber})`,
        };

        // Insert right after the original card
        const newWorkouts = [...workouts];
        newWorkouts.splice(workoutIndex + 1, 0, newWorkout);
        setWorkouts(newWorkouts);

        // Trigger entering animation
        const cardKey = `workout-${newWorkout.id}`;
        setAnimatingCards(prev => ({ ...prev, [cardKey]: 'entering' }));

        // Show toast notification
        setShowToast(true);
      }
      isProcessing.current = false;
    } else {
      isProcessing.current = false;
    }
  };

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

  const handleAnimationComplete = (type: 'program' | 'workout', id: string | number) => {
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
      // Remove card from list after exiting animation completes
      if (type === 'program') {
        // TODO: Implement program deletion via service
        // For now, just refresh to sync with service data
        refreshPrograms();
      } else {
        setWorkouts(workouts.filter((w) => w.id !== id));
      }
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

  // Handle cross-container drop (workout onto program)
  const handleCrossContainerDrop = useCallback((workoutItemKey: string, programDropZoneId: string) => {
    // Extract IDs from keys (format: "workout-1" and "program-1")
    const workoutId = workoutItemKey.replace('workout-', '');
    const programId = programDropZoneId.replace('program-', '');

    // Find the workout and program names
    const workout = workouts.find(w => w.id === parseInt(workoutId));
    const program = programs.find(p => p.id === programId); // Programs use string IDs

    if (!workout || !program) return;

    // Show the add-to-program modal
    setAddToProgramModal({
      visible: true,
      workoutId,
      workoutName: workout.name,
      programId,
      programName: program.name,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [workouts, programs]);

  // Handle position selection in add-to-program modal
  const handleSelectPosition = useCallback(async (position: number) => {
    if (!addToProgramModal.workoutId || !addToProgramModal.programId) return;
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      // Add workout to program at the selected position
      await ProgramService.addWorkoutToProgram(
        addToProgramModal.workoutId,
        addToProgramModal.programId,
        position
      );

      // Invalidate cache and refresh UI to show updated workout count
      ProgramService.invalidateProgramCache();
      await refreshPrograms();

      // Close modal
      setAddToProgramModal({
        visible: false,
        workoutId: null,
        workoutName: '',
        programId: null,
        programName: '',
      });

      // Show success toast
      setToastMessage(`Added to ${addToProgramModal.programName}`);
      setShowToast(true);
    } catch (error) {
      console.error('Failed to add workout to program:', error);
      setToastMessage('Failed to add workout');
      setShowToast(true);
    } finally {
      isProcessing.current = false;
    }
  }, [addToProgramModal, refreshPrograms]);

  // Cancel add-to-program modal
  const handleCancelAddToProgram = useCallback(() => {
    setAddToProgramModal({
      visible: false,
      workoutId: null,
      workoutName: '',
      programId: null,
      programName: '',
    });
  }, []);

  // Get existing workouts for a program from real data
  const getExistingProgramWorkouts = useCallback((programId: string): ProgramWorkoutSlot[] => {
    // Find the program in programsData (which has full workout details)
    const program = programsData.find(p => p.id === programId);
    if (!program) return [];

    // Map program workouts to the format expected by the modal
    return program.workouts.map(w => ({
      id: w.id,
      name: w.name,
      dayNumber: w.dayNumber,
    }));
  }, [programsData]);

  // Draggable program card renderer
  const renderProgramItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ProgramItem>) => {
      const cardKey = `program-${item.id}`;
      const animState = animatingCards[cardKey];

      const handleDrag = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        drag();
      };

      return (
        <ScaleDecorator activeScale={1.03}>
          <AnimatedCard
            animationState={animState}
            onAnimationComplete={() => handleAnimationComplete('program', item.id)}
          >
            <TouchableOpacity
              onPress={() => handleProgramCardPress(item.id)}
              onLongPress={handleDrag}
              disabled={isActive}
              delayLongPress={150}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.programCard,
                  isActive && styles.cardActive,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.cardKebabButton}
                    onPress={(event) => handleKebabPress('program', item.id, event)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <EllipsisHorizontalIcon color="#22c55e" size={16} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardMetaText}>
                  {item.workouts} workouts · {item.lastPerformed}
                </Text>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        </ScaleDecorator>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress, handleProgramCardPress]
  );

  // Draggable workout card renderer for DraggableGrid
  const renderWorkoutGridItem = useCallback(
    (item: WorkoutItem, index: number, isActive: boolean) => {
      const cardKey = `workout-${item.id}`;
      const animState = animatingCards[cardKey];

      return (
        <AnimatedCard
          animationState={animState}
          onAnimationComplete={() => handleAnimationComplete('workout', item.id)}
        >
          <TouchableOpacity
            onPress={() => handleWorkoutCardPress(item.id)}
            activeOpacity={0.8}
            style={[
              styles.workoutCard,
              isActive && styles.cardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
              <TouchableOpacity
                style={styles.cardKebabButton}
                onPress={(event) => handleKebabPress('workout', item.id, event)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <EllipsisHorizontalIcon color="#22c55e" size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardMetaText}>
              {item.exercises} exercises · {item.lastPerformed}
            </Text>
          </TouchableOpacity>
        </AnimatedCard>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress, handleWorkoutCardPress]
  );

  // Draggable program card renderer for DraggableGrid (with drop zone)
  const renderProgramGridItem = useCallback(
    (item: ProgramItem, index: number, isActive: boolean) => {
      const cardKey = `program-${item.id}`;
      const animState = animatingCards[cardKey];

      return (
        <DropZoneProgramCard programId={item.id}>
          <AnimatedCard
            animationState={animState}
            onAnimationComplete={() => handleAnimationComplete('program', item.id)}
          >
            <TouchableOpacity
              onPress={() => handleProgramCardPress(item.id)}
              activeOpacity={0.8}
              style={[
                styles.programCardInner,
                isActive && styles.cardActive,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                <TouchableOpacity
                  style={styles.cardKebabButton}
                  onPress={(event) => handleKebabPress('program', item.id, event)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <EllipsisHorizontalIcon color="#22c55e" size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardMetaText}>
                {item.workouts} workouts · {item.lastPerformed}
              </Text>
            </TouchableOpacity>
          </AnimatedCard>
        </DropZoneProgramCard>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress, handleProgramCardPress]
  );

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Programs</Text>
        </View>

        <NestableScrollContainer
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Start Section */}
          <View style={styles.quickStartSection}>
            <GlassButton
              style={styles.startButton}
              onPress={handleStartBlankWorkout}
              disabled={isStarting || isWorkoutActive}
            >
              <View style={styles.startButtonInner}>
                <PlayIcon color="#fff" size={20} />
                <Text style={styles.startButtonText}>Start a Blank Workout</Text>
              </View>
            </GlassButton>
          </View>

          {/* Programs Section */}
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowPrograms(!showPrograms)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderButton}>
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
                <Text style={styles.sectionTitle}>Programs</Text>
              </View>
            </TouchableOpacity>

            <CollapsibleSection isOpen={showPrograms}>
              {showPrograms && (
                <DraggableGrid
                  data={programs}
                  keyExtractor={(item) => `program-${item.id}`}
                  renderItem={renderProgramGridItem}
                  onReorder={() => {
                    // TODO: Implement program reordering via service
                    // For now, reordering is disabled - programs are ordered by service data
                  }}
                  numColumns={1}
                  itemHeight={70}
                  gap={12}
                />
              )}
            </CollapsibleSection>
          </View>

          {/* Workouts Section */}
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowWorkouts(!showWorkouts)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderButton}>
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
                <Text style={styles.sectionTitle}>Workouts</Text>
              </View>
            </TouchableOpacity>

            <CollapsibleSection isOpen={showWorkouts}>
              {showWorkouts && (
                <DraggableGrid
                  data={workouts}
                  keyExtractor={(item) => `workout-${item.id}`}
                  renderItem={renderWorkoutGridItem}
                  onReorder={(data) => {
                    setWorkouts(data);
                    saveWorkoutsOrder(data);
                  }}
                  numColumns={2}
                  itemHeight={76}
                  gap={12}
                  enableCrossContainerDrag={true}
                  dragType="workout"
                  onCrossContainerDrop={handleCrossContainerDrop}
                />
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
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />

      {/* Add to Program Modal */}
      <AddToProgramModal
        visible={addToProgramModal.visible}
        workoutName={addToProgramModal.workoutName}
        programName={addToProgramModal.programName}
        existingWorkouts={addToProgramModal.programId ? getExistingProgramWorkouts(addToProgramModal.programId) : []}
        onSelectPosition={handleSelectPosition}
        onCancel={handleCancelAddToProgram}
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
    fontWeight: '700',
    fontFamily: 'BankGothic',
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
  // Drop zone wrapper for program cards
  dropZoneWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  // Program card inner (used when wrapped in DropZoneProgramCard)
  programCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    height: 68, // Slightly less than programCard due to wrapper border
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
