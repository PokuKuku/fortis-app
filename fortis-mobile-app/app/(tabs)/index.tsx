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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Play, MoreHorizontal, Copy, Trash2, Sparkles } from 'lucide-react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { GlassCard } from '../../components/GlassCard';
import { GlassButton } from '../../components/GlassButton';
import { DraggableGrid } from '../../src/components/DraggableGrid';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { useProgramsStore } from '../../src/store/programsStore';

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
          <Copy color="#DFE2E6" size={16} strokeWidth={2} />
          <Text style={styles.kebabOptionText}>Duplicate</Text>
        </TouchableOpacity>
        <View style={styles.kebabDivider} />
        <TouchableOpacity
          style={styles.kebabOption}
          onPress={() => handleAction(onDelete)}
        >
          <Trash2 color="#ef4444" size={16} strokeWidth={2} />
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

  // Programs store
  const storePrograms = useProgramsStore(s => s.programs);
  const isLoadingPrograms = useProgramsStore(s => s.isLoading);
  const fetchPrograms = useProgramsStore(s => s.fetchPrograms);
  const deleteProgramFromStore = useProgramsStore(s => s.deleteProgram);
  const duplicateProgramInStore = useProgramsStore(s => s.duplicateProgram);

  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);

  // Transform store programs to UI format
  const programs: ProgramItem[] = storePrograms.map(p => ({
    id: p.id,
    name: p.name,
    workouts: p.workouts.length,
    weeks: p.durationWeeks || 0,
    lastPerformed: formatRelativeTime(p.lastPerformedAt),
    isAiCreated: p.isAiCreated,
  }));

  // For workouts, we'll extract single-day workouts (templates) from programs
  // For now, use mock data as templates are not yet implemented
  const workouts: WorkoutItem[] = storePrograms.flatMap(p =>
    p.workouts.map(w => ({
      id: w.id,
      name: w.name,
      exercises: w.exercises.length,
      lastPerformed: formatRelativeTime(p.lastPerformedAt),
      isAiCreated: p.isAiCreated,
    }))
  );

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
  }>({ visible: false, type: null, id: null, name: '' });
  const [animatingCards, setAnimatingCards] = useState<{
    [key: string]: 'entering' | 'exiting';
  }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle start blank workout
  const handleStartBlankWorkout = () => {
    // Prevent multiple workout sessions
    if (isWorkoutActive) {
      router.push('/workout/active');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout(); // Creates blank workout with generated ID and timestamp
    router.push('/workout/active');
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
    }
    // Note: Individual workout duplication would need a separate store method
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
      if (type === 'program') {
        await deleteProgramFromStore(id);
      }
      // Note: Individual workout deletion would need a separate store method
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
          <View
            style={[
              styles.workoutCard,
              isActive && styles.cardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                {item.isAiCreated && (
                  <Sparkles color="#22c55e" size={14} strokeWidth={2} style={styles.aiBadge} />
                )}
              </View>
              <TouchableOpacity
                style={styles.cardKebabButton}
                onPress={(event) => handleKebabPress('workout', item.id, event)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreHorizontal color="#22c55e" size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardMetaText}>
              {item.exercises} exercises · {item.lastPerformed}
            </Text>
          </View>
        </AnimatedCard>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress]
  );

  // Draggable program card renderer for DraggableGrid
  const renderProgramGridItem = useCallback(
    (item: ProgramItem, index: number, isActive: boolean) => {
      const cardKey = `program-${item.id}`;
      const animState = animatingCards[cardKey];

      return (
        <AnimatedCard
          animationState={animState}
          onAnimationComplete={() => handleAnimationComplete('program', item.id)}
        >
          <View
            style={[
              styles.programCard,
              isActive && styles.cardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                {item.isAiCreated && (
                  <Sparkles color="#22c55e" size={14} strokeWidth={2} style={styles.aiBadge} />
                )}
              </View>
              <TouchableOpacity
                style={styles.cardKebabButton}
                onPress={(event) => handleKebabPress('program', item.id, event)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreHorizontal color="#22c55e" size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardMetaText}>
              {item.workouts} workouts · {item.lastPerformed}
            </Text>
          </View>
        </AnimatedCard>
      );
    },
    [animatingCards, handleAnimationComplete, handleKebabPress]
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
            <GlassButton style={styles.startButton} onPress={handleStartBlankWorkout}>
              <View style={styles.startButtonInner}>
                <Play color="#fff" size={20} fill="#fff" />
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
                  <ChevronRight
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
                isLoadingPrograms ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading programs...</Text>
                  </View>
                ) : programs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No programs yet</Text>
                    <Text style={styles.emptySubtext}>Create your first program with AI</Text>
                  </View>
                ) : (
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
            <TouchableOpacity
              onPress={() => setShowWorkouts(!showWorkouts)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderButton}>
                <GlassButton circular size={24} onPress={() => setShowWorkouts(!showWorkouts)}>
                  <ChevronRight
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
                isLoadingPrograms ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading workouts...</Text>
                  </View>
                ) : workouts.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No workouts yet</Text>
                    <Text style={styles.emptySubtext}>Create programs to see workouts here</Text>
                  </View>
                ) : (
                  <DraggableGrid
                    data={workouts}
                    keyExtractor={(item) => `workout-${item.id}`}
                    renderItem={renderWorkoutGridItem}
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
