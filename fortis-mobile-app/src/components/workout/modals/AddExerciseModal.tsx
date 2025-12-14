import { useState, useEffect, useMemo } from 'react';
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
import { X, Search, Plus, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import exercisesData from '@/assets/exercises.json';
import { CUSTOM_EXERCISES_KEY } from '@/src/constants/storageKeys';

interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  level: string;
  force: string;
  mechanic: string | null;
  instructions: string[];
  images: string[];
}

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddExerciseModal({ visible, onClose }: AddExerciseModalProps) {
  const addExercises = useWorkoutStore(s => s.addExercises);
  const activeSession = useWorkoutStore(s => s.activeSession);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  // Load custom exercises on mount
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
        if (raw) {
          setCustomExercises(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('Failed to load custom exercises', err);
      }
    };
    if (visible) {
      loadCustomExercises();
    }
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSelectedExercises([]);
    }
  }, [visible]);

  // Combine base and custom exercises
  const allExercises = useMemo(
    () => [...customExercises, ...(exercisesData as Exercise[])],
    [customExercises]
  );

  // Get IDs of exercises already in the workout
  const existingExerciseIds = useMemo(
    () => activeSession?.exercises.map(e => e.exerciseId) || [],
    [activeSession]
  );

  // Filter exercises based on search and exclude existing
  const filteredExercises = useMemo(() => {
    return allExercises
      .filter((ex) =>
        !existingExerciseIds.includes(ex.id) &&
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allExercises, existingExerciseIds, searchQuery]);

  // Toggle exercise selection
  const toggleExercise = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Remove exercise from selection
  const removeFromSelection = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises(prev => prev.filter(id => id !== exerciseId));
  };

  // Add all selected exercises in one atomic operation
  const handleAddExercises = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Build array of exercises to add
    const exercisesToAdd = selectedExercises
      .map(exerciseId => {
        const exercise = allExercises.find(ex => ex.id === exerciseId);
        return exercise ? { id: exerciseId, name: exercise.name } : null;
      })
      .filter((ex): ex is { id: string; name: string } => ex !== null);

    // Add all exercises in one batch update
    if (exercisesToAdd.length > 0) {
      addExercises(exercisesToAdd);
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
          selected && styles.exerciseItemSelected,
          pressed && styles.exerciseItemPressed,
        ]}
      >
        <Text style={[styles.exerciseName, selected && styles.exerciseNameSelected]}>
          {item.name}
        </Text>
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          {selected ? (
            <Check size={18} color={Colors.success} strokeWidth={2.5} />
          ) : (
            <Plus size={18} color={Colors.textSecondary} strokeWidth={2} />
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
          entering={SlideInDown.duration(450).easing(Easing.out(Easing.quad))}
          exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
          style={styles.container}
        >
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Exercise</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <X size={24} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Selected Exercises Chips */}
          {selectedExercises.length > 0 && (
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
                      <X size={14} color={Colors.textSecondary} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={16} color={Colors.textSecondary} strokeWidth={2} />
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

          {/* Add Button */}
          {selectedExercises.length > 0 && (
            <View style={styles.addButtonContainer}>
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
    fontWeight: '700',
    color: Colors.textPrimary,
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
    fontWeight: '500',
    color: Colors.success,
    flexShrink: 1,
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
    fontWeight: '500',
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
