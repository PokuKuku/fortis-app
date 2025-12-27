import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import { Exercise } from '@/src/types/exercise';
import { useExercises } from '@/src/hooks/useExercises';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  replaceMode?: boolean;
  exerciseLocalIdToReplace?: string;
  // Callback mode for template creation (doesn't use workoutStore)
  onAddExercisesCallback?: (exercises: Array<{ id: string; name: string }>) => void;
  existingExerciseIds?: string[];
}

export function AddExerciseModal({
  visible,
  onClose,
  replaceMode = false,
  exerciseLocalIdToReplace,
  onAddExercisesCallback,
  existingExerciseIds: externalExistingIds,
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
    replaceHint: { color: colors.textSecondary },
    exerciseItem: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    exerciseName: { color: colors.textPrimary },
    exerciseNameSelected: { color: colors.success },
    iconContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    addButtonContainer: {
      backgroundColor: colors.background,
    },
  };

  const addExercises = useWorkoutStore(s => s.addExercises);
  const replaceExercise = useWorkoutStore(s => s.replaceExercise);
  const activeSession = useWorkoutStore(s => s.activeSession);

  // Use centralized exercise service
  const { exercises: allExercises } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const isProcessing = useRef(false);

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

  // Filter exercises based on search and exclude existing exercises
  const filteredExercises = useMemo(() => {
    // Get the exerciseId of the exercise being replaced (if in replace mode)
    const replacingExerciseId = replaceMode && exerciseLocalIdToReplace
      ? activeSession?.exercises.find(e => e.localId === exerciseLocalIdToReplace)?.exerciseId
      : null;

    return allExercises
      .filter((ex) => {
        const isExisting = existingExerciseIds.includes(ex.id);
        // Allow the exercise being replaced, filter out all other existing exercises
        if (isExisting && ex.id !== replacingExerciseId) return false;
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allExercises, existingExerciseIds, searchQuery, replaceMode, exerciseLocalIdToReplace, activeSession]);

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

  const renderExercise = ({ item }: { item: Exercise }) => {
    const selected = isSelected(item.id);
    return (
      <Pressable
        onPress={() => toggleExercise(item.id)}
        style={({ pressed }) => [
          styles.exerciseItem,
          themedStyles.exerciseItem,
          selected && styles.exerciseItemSelected,
          pressed && styles.exerciseItemPressed,
        ]}
      >
        <Text style={[styles.exerciseName, themedStyles.exerciseName, selected && themedStyles.exerciseNameSelected]}>
          {item.name}
        </Text>
        <View style={[styles.iconContainer, themedStyles.iconContainer, selected && styles.iconContainerSelected]}>
          {selected ? (
            <CheckIcon size={18} color={colors.success} strokeWidth={2} />
          ) : (
            <PlusIcon size={18} color={colors.textSecondary} strokeWidth={2} />
          )}
        </View>
      </Pressable>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
          style={[styles.container, themedStyles.container]}
        >
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, themedStyles.title]}>
              {replaceMode ? 'Replace Exercise' : 'Exercises'}
            </Text>
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

          {/* Selected Exercises Chips (only in add mode) */}
          {!replaceMode && selectedExercises.length > 0 && (
            <View style={styles.selectedSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedScrollContent}
              >
                {selectedExercises.map(exerciseId => (
                  <View key={exerciseId} style={styles.chip}>
                    <Text style={styles.chipText} numberOfLines={1}>
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

          {/* Replace mode hint */}
          {replaceMode && (
            <Text style={[styles.replaceHint, themedStyles.replaceHint]}>
              Tap an exercise to replace the current one
            </Text>
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
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 180,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
    flexShrink: 1,
  },
  replaceHint: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    paddingVertical: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
  },
  exerciseItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  exerciseItemPressed: {
    opacity: 0.7,
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  exerciseNameSelected: {
    color: Colors.success,
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
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
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
