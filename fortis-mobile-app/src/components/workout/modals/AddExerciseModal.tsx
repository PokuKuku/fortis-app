import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
  Image,
  InteractionManager,
} from 'react-native';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius, Sizes } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import { Exercise } from '@/src/types/exercise';
import { useExercises } from '@/src/hooks/useExercises';
import { getExerciseImageUrl } from '@/src/services/exerciseService';
import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  suspended?: boolean;
  replaceMode?: boolean;
  exerciseLocalIdToReplace?: string;
  // Callback mode for template creation (doesn't use workoutStore)
  onAddExercisesCallback?: (exercises: Array<{ id: string; name: string }>) => void;
  existingExerciseIds?: string[];
  showRestTimerBanner?: boolean;
  onDismissRestTimerBanner?: () => void;
  onOpenExerciseDetails?: (exerciseId: string) => void;
}

const EXERCISE_PREVIEW_SIZE = 36;
const EXERCISE_ROW_BORDER_WIDTH = 1;
const EXERCISE_ROW_PADDING_Y = Spacing.lg;
const EXERCISE_ROW_MARGIN_BOTTOM = Spacing.sm;
const EXERCISE_ROW_HEIGHT = EXERCISE_PREVIEW_SIZE
  + (EXERCISE_ROW_PADDING_Y * 2)
  + (EXERCISE_ROW_BORDER_WIDTH * 2)
  + EXERCISE_ROW_MARGIN_BOTTOM;

export function AddExerciseModal({
  visible,
  onClose,
  suspended = false,
  replaceMode = false,
  exerciseLocalIdToReplace,
  onAddExercisesCallback,
  existingExerciseIds: externalExistingIds,
  showRestTimerBanner = false,
  onDismissRestTimerBanner,
  onOpenExerciseDetails,
}: AddExerciseModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: colors.background,
    },
    title: { color: colors.textPrimary },
    searchContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    searchInput: { color: colors.textPrimary },
    exerciseItem: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    exerciseName: { color: colors.textPrimary },
    exerciseNameSelected: { color: colors.accent },
    exercisePreview: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    exercisePreviewPlaceholder: { color: colors.accent },
    iconContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    iconContainerSelected: {
      backgroundColor: colors.accentOverlayMedium,
    },
    addButtonContainer: {
      backgroundColor: colors.background,
    },
    chip: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    chipText: { color: colors.accent },
    exerciseItemSelected: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    restTimerBanner: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    restTimerBannerText: { color: colors.accent },
  };

  const addExercises = useWorkoutStore(s => s.addExercises);
  const replaceExercise = useWorkoutStore(s => s.replaceExercise);
  const activeSession = useWorkoutStore(s => s.activeSession);

  // Use centralized exercise service
  const { exercises: allExercises, loading } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const isProcessing = useRef(false);
  const listRef = useRef<FlatList<Exercise>>(null);
  const lastScrollOffset = useRef(0);
  const isRestoringScroll = useRef(false);
  const pendingScrollRestore = useRef(false);
  const restoreAttempts = useRef(0);
  const wasLoading = useRef(false);
  const contentReady = useRef(false);
  const restoreTargetOffset = useRef(0);
  const restoreTargetIndex = useRef(0);
  const firstVisibleIndex = useRef(0);
  const isModalVisible = visible && !suspended;

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSelectedExercises([]);
      isProcessing.current = false;
    }
  }, [visible]);

  // Get IDs of exercises already in the workout (use external prop if provided)
  const existingExerciseIds = useMemo(
    () => externalExistingIds || activeSession?.exercises.map(e => e.exerciseId) || [],
    [externalExistingIds, activeSession]
  );

  const sortedExercises = useMemo(
    () => [...allExercises].sort((a, b) => a.name.localeCompare(b.name)),
    [allExercises]
  );

  const searchIndex = useMemo(
    () => buildExerciseSearchIndex(sortedExercises),
    [sortedExercises]
  );

  // Filter exercises based on search and exclude existing exercises
  const filteredExercises = useMemo(() => {
    // Get the exerciseId of the exercise being replaced (if in replace mode)
    const replacingExerciseId = replaceMode && exerciseLocalIdToReplace
      ? activeSession?.exercises.find(e => e.localId === exerciseLocalIdToReplace)?.exerciseId
      : null;

    return searchExercises(searchQuery, searchIndex)
      .filter((ex) => {
        const isExisting = existingExerciseIds.includes(ex.id);
        // Allow the exercise being replaced, filter out all other existing exercises
        if (isExisting && ex.id !== replacingExerciseId) return false;
        return true;
      });
  }, [searchQuery, searchIndex, existingExerciseIds, replaceMode, exerciseLocalIdToReplace, activeSession]);

  // Toggle exercise selection (different behavior in replace mode)
  const toggleExercise = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (replaceMode) {
      // Guard against rapid clicks in replace mode
      if (isProcessing.current) return;
      isProcessing.current = true;

      // In replace mode, immediately replace and close
      const exercise = allExercises.find(ex => ex.id === exerciseId);
      if (exercise && exerciseLocalIdToReplace) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        replaceExercise(exerciseLocalIdToReplace, exerciseId, exercise.name);
        onClose();
      } else {
        isProcessing.current = false;
      }
    } else {
      // Normal mode: toggle selection
      setSelectedExercises(prev =>
        prev.includes(exerciseId)
          ? prev.filter(id => id !== exerciseId)
          : [...prev, exerciseId]
      );
    }
  };

  // Remove exercise from selection
  const removeFromSelection = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises(prev => prev.filter(id => id !== exerciseId));
  };

  // Add all selected exercises in one atomic operation
  const handleAddExercises = () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Build array of exercises to add
    const exercisesToAdd = selectedExercises
      .map(exerciseId => {
        const exercise = allExercises.find(ex => ex.id === exerciseId);
        return exercise ? { id: exerciseId, name: exercise.name } : null;
      })
      .filter((ex): ex is { id: string; name: string } => ex !== null);

    // Use callback if provided (template mode), otherwise use store action
    if (exercisesToAdd.length > 0) {
      if (onAddExercisesCallback) {
        onAddExercisesCallback(exercisesToAdd);
      } else {
        addExercises(exercisesToAdd);
      }
    }

    onClose();
  };

  // Get exercise name by ID
  const getExerciseName = (exerciseId: string) => {
    return allExercises.find(ex => ex.id === exerciseId)?.name || '';
  };

  // Check if exercise is selected
  const isSelected = (exerciseId: string) => selectedExercises.includes(exerciseId);

  const handleExercisePress = (exerciseId: string) => {
    if (onOpenExerciseDetails) {
      if (lastScrollOffset.current > 0 || firstVisibleIndex.current > 0) {
        restoreTargetOffset.current = lastScrollOffset.current;
        restoreTargetIndex.current = firstVisibleIndex.current > 0
          ? firstVisibleIndex.current
          : Math.floor(lastScrollOffset.current / EXERCISE_ROW_HEIGHT);
        pendingScrollRestore.current = true;
        restoreAttempts.current = 0;
      }
      onOpenExerciseDetails(exerciseId);
      return;
    }
    toggleExercise(exerciseId);
  };

  const handleListScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (isRestoringScroll.current) return;
    const nextOffset = event.nativeEvent.contentOffset.y;
    if (pendingScrollRestore.current && (restoreTargetOffset.current > 0 || restoreTargetIndex.current > 0)) {
      if (nextOffset === 0) return;
      if (restoreTargetOffset.current > 0
        && (Math.abs(nextOffset - restoreTargetOffset.current) <= 4 || nextOffset > restoreTargetOffset.current)) {
        pendingScrollRestore.current = false;
        lastScrollOffset.current = nextOffset;
        return;
      }
      if (restoreTargetOffset.current <= 0) {
        pendingScrollRestore.current = false;
        lastScrollOffset.current = nextOffset;
        return;
      }
      return;
    }
    lastScrollOffset.current = nextOffset;
  };

  const attemptScrollRestore = useCallback(() => {
    if (!pendingScrollRestore.current) return;
    if (!isModalVisible) return;
    if (loading || filteredExercises.length === 0) return;
    if (!contentReady.current) return;
    if (restoreAttempts.current >= 5) {
      pendingScrollRestore.current = false;
      return;
    }

    restoreAttempts.current += 1;
    isRestoringScroll.current = true;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (restoreTargetIndex.current > 0) {
          listRef.current?.scrollToIndex({
            index: Math.min(restoreTargetIndex.current, filteredExercises.length - 1),
            viewPosition: 0,
            animated: false,
          });
        } else if (restoreTargetOffset.current > 0) {
          listRef.current?.scrollToOffset({
            offset: restoreTargetOffset.current,
            animated: false,
          });
        }
        requestAnimationFrame(() => {
          isRestoringScroll.current = false;
          if (pendingScrollRestore.current) {
            setTimeout(() => {
              attemptScrollRestore();
            }, 120);
          }
        });
      });
    });
    return () => task.cancel?.();
  }, [filteredExercises.length, isModalVisible, loading]);

  useEffect(() => {
    if (!isModalVisible) {
      isRestoringScroll.current = false;
      contentReady.current = false;
      return;
    }
    attemptScrollRestore();
  }, [isModalVisible, loading, filteredExercises.length, attemptScrollRestore]);

  useEffect(() => {
    if (!isModalVisible) {
      wasLoading.current = loading;
      return;
    }

    if (!wasLoading.current && loading && lastScrollOffset.current > 0) {
      restoreTargetOffset.current = lastScrollOffset.current;
      restoreTargetIndex.current = firstVisibleIndex.current > 0
        ? firstVisibleIndex.current
        : Math.floor(lastScrollOffset.current / EXERCISE_ROW_HEIGHT);
      pendingScrollRestore.current = true;
      restoreAttempts.current = 0;
    }

    wasLoading.current = loading;
  }, [loading, isModalVisible]);

  const handleContentSizeChange = (_width: number, height: number) => {
    if (!isModalVisible) return;
    if (height > 0) {
      contentReady.current = true;
      attemptScrollRestore();
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
    if (pendingScrollRestore.current || isRestoringScroll.current) return;
    const firstIndex = viewableItems.find(item => typeof item.index === 'number')?.index;
    if (typeof firstIndex === 'number') {
      firstVisibleIndex.current = firstIndex;
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 10 }).current;

  const renderExercise = ({ item }: { item: Exercise }) => {
    const selected = isSelected(item.id);
    const imageUrl = item.images.length > 0
      ? getExerciseImageUrl(item.images[0])
      : null;
    return (
      <Pressable
        onPress={() => handleExercisePress(item.id)}
        style={({ pressed }) => [
          styles.exerciseItem,
          themedStyles.exerciseItem,
          selected && themedStyles.exerciseItemSelected,
          pressed && styles.exerciseItemPressed,
        ]}
      >
        <View style={styles.exerciseContent}>
          <View style={[styles.exercisePreview, themedStyles.exercisePreview]}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.exercisePreviewImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[styles.exercisePreviewPlaceholder, themedStyles.exercisePreviewPlaceholder]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.exerciseName,
              themedStyles.exerciseName,
              selected && themedStyles.exerciseNameSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            toggleExercise(item.id);
          }}
          style={[styles.iconContainer, themedStyles.iconContainer, selected && themedStyles.iconContainerSelected]}
          hitSlop={8}
        >
          {selected ? (
            <CheckIcon size={18} color={colors.accent} strokeWidth={2} />
          ) : (
            <PlusIcon size={18} color={colors.textSecondary} strokeWidth={2} />
          )}
        </Pressable>
      </Pressable>
    );
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={SlideInDown.duration(420).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(320).easing(Easing.in(Easing.cubic))}
          style={[styles.container, themedStyles.container]}
        >
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, themedStyles.title]}>Exercises</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <XMarkIcon size={24} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Rest timer banner */}
          {showRestTimerBanner && (
            <View style={[styles.restTimerBanner, themedStyles.restTimerBanner]}>
              <Text style={[styles.restTimerBannerText, themedStyles.restTimerBannerText]}>
                Time's up - rest complete.
              </Text>
              {onDismissRestTimerBanner && (
                <Pressable onPress={onDismissRestTimerBanner} hitSlop={8}>
                  <XMarkIcon size={16} color={colors.accent} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          )}

          {/* Selected Exercises Chips (only in add mode) */}
          {!replaceMode && selectedExercises.length > 0 && (
            <View style={styles.selectedSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedScrollContent}
              >
                {selectedExercises.map(exerciseId => (
                  <View key={exerciseId} style={[styles.chip, themedStyles.chip]}>
                    <Text style={[styles.chipText, themedStyles.chipText]} numberOfLines={1}>
                      {getExerciseName(exerciseId)}
                    </Text>
                    <Pressable
                      onPress={() => removeFromSelection(exerciseId)}
                      hitSlop={8}
                    >
                      <XMarkIcon size={14} color={colors.textSecondary} strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Input */}
          <View style={[styles.searchContainer, themedStyles.searchContainer]}>
            <MagnifyingGlassIcon size={18} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, themedStyles.searchInput]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <XMarkIcon size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
            )}
          </View>

          {/* Exercise List */}
          <FlatList
            ref={listRef}
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={handleListScroll}
            onScrollEndDrag={handleListScroll}
            onMomentumScrollEnd={handleListScroll}
            onContentSizeChange={handleContentSizeChange}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_data, index) => ({
              length: EXERCISE_ROW_HEIGHT,
              offset: EXERCISE_ROW_HEIGHT * index,
              index,
            })}
          />

          {/* Add Button (only in add mode) */}
          {!replaceMode && selectedExercises.length > 0 && (
            <View style={[styles.addButtonContainer, themedStyles.addButtonContainer]}>
              <GlassButton style={styles.addButton} onPress={handleAddExercises}>
                <Text style={styles.addButtonText}>
                  Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''}
                </Text>
              </GlassButton>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  selectedSection: {
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  selectedScrollContent: {
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    zIndex: 1,
  },
  restTimerBannerText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    // backgroundColor and borderColor now applied via themedStyles.chip
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 180,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    // color now applied via themedStyles.chipText
    flexShrink: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: Sizes.minTouchTarget,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textPrimary,
    height: Sizes.minTouchTarget,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: EXERCISE_ROW_PADDING_Y,
    paddingHorizontal: Spacing.md,
    marginBottom: EXERCISE_ROW_MARGIN_BOTTOM,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: EXERCISE_ROW_BORDER_WIDTH,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
  },
  exerciseItemSelected: {
    // backgroundColor and borderColor now applied via themedStyles.exerciseItemSelected
  },
  exerciseItemPressed: {
    opacity: 0.7,
  },
  exerciseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginRight: Spacing.md,
  },
  exercisePreview: {
    width: EXERCISE_PREVIEW_SIZE,
    height: EXERCISE_PREVIEW_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exercisePreviewImage: {
    width: '100%',
    height: '100%',
  },
  exercisePreviewPlaceholder: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  exerciseNameSelected: {
    // color now applied via themedStyles (colors.accent)
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainerSelected: {
    // backgroundColor now applied via themedStyles.iconContainerSelected
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.background,
    zIndex: 2,
  },
  addButton: {
    height: 48,
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#fff',
  },
});
