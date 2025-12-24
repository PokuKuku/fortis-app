import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import { useProgramsStore } from '@/src/store/programsStore';
import type { ProgramWorkout } from '@/src/types/workout';

// Editor workout type for local state
interface EditorWorkout {
  id: string;
  name: string;
  exercises: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: string;
  }>;
}

export default function CreateProgramScreen() {
  const router = useRouter();
  const {
    mode,
    programId: programIdParam,
  } = useLocalSearchParams<{
    mode?: 'edit';
    programId?: string | string[];
  }>();
  const programId = Array.isArray(programIdParam) ? programIdParam[0] : programIdParam;
  const isEditing = mode === 'edit' && !!programId;

  // Store actions
  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);

  // Local editor state
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [workouts, setWorkouts] = useState<EditorWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  // Stats
  const workoutCount = workouts.length;
  const totalExercises = useMemo(
    () => workouts.reduce((sum, w) => sum + w.exercises.length, 0),
    [workouts]
  );

  // Check if we can save
  const canSave = programName.trim().length > 0 && workouts.length > 0 && !isSaving;

  // Handle close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle add workout
  const handleAddWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newWorkout: EditorWorkout = {
      id: `workout-${Date.now()}`,
      name: `Day ${workouts.length + 1}`,
      exercises: [],
    };
    setWorkouts(prev => [...prev, newWorkout]);
  }, [workouts.length]);

  // Handle remove workout
  const handleRemoveWorkout = useCallback((workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  }, []);

  // Handle update workout name
  const handleUpdateWorkoutName = useCallback((workoutId: string, name: string) => {
    setWorkouts(prev => prev.map(w =>
      w.id === workoutId ? { ...w, name } : w
    ));
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!canSave) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      // Create a program (non-template) using the existing store method
      // For now, we'll create it as a template with the workouts
      // TODO: Add proper createProgram action to store

      // For now, just go back - full implementation in Phase 3
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to save program:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsSaving(false);
    }
  };

  // Render workout card
  const renderWorkoutCard = useCallback(({ item, index }: { item: EditorWorkout; index: number }) => (
    <View style={styles.workoutCard}>
      <View style={styles.workoutCardHeader}>
        <TextInput
          style={styles.workoutNameInput}
          value={item.name}
          onChangeText={(text) => handleUpdateWorkoutName(item.id, text)}
          placeholder="Workout Name"
          placeholderTextColor={Colors.textSecondary}
          autoCorrect={false}
          autoCapitalize="words"
        />
        <Pressable
          onPress={() => handleRemoveWorkout(item.id)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <TrashIcon size={18} color={Colors.error} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={styles.workoutCardContent}>
        <Text style={styles.workoutExerciseCount}>
          {item.exercises.length} exercises
        </Text>
        <Pressable
          onPress={() => {
            // TODO: Open add exercise modal for this workout
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => [
            styles.addExerciseButton,
            pressed && styles.addExerciseButtonPressed,
          ]}
        >
          <PlusIcon size={16} color={Colors.success} strokeWidth={2} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </Pressable>
      </View>
    </View>
  ), [handleUpdateWorkoutName, handleRemoveWorkout]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No workouts added yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap "Add Workout" to get started
      </Text>
    </View>
  );

  const saveButtonText = isEditing ? 'Update' : 'Save';

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <XMarkIcon size={24} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <View style={styles.titleInputWrapper}>
            <TextInput
              style={styles.headerTitleInput}
              placeholder="Program Name"
              placeholderTextColor={Colors.textSecondary}
              value={programName}
              onChangeText={setProgramName}
              autoCorrect={false}
              autoCapitalize="words"
              autoComplete="off"
              editable={true}
              maxLength={50}
              returnKeyType="done"
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
            <View style={styles.editIconSlot}>
              {!isNameFocused && (
                <PencilIcon size={14} color={Colors.textTertiary} strokeWidth={2} />
              )}
            </View>
          </View>
          <GlassButton
            style={{
              ...styles.saveButton,
              ...(!canSave ? styles.saveButtonDisabled : {}),
            }}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{saveButtonText}</Text>
            )}
          </GlassButton>
        </View>

        {/* Stats Row */}
        {workoutCount > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statsLeft}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={styles.statValue}>{workoutCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Exercises</Text>
                <Text style={styles.statValue}>{totalExercises}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Workouts List */}
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />

        {/* Add Workout Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            onPress={handleAddWorkout}
            style={({ pressed }) => [
              styles.addWorkoutButton,
              pressed && styles.addWorkoutButtonPressed,
            ]}
          >
            <PlusIcon size={20} color={Colors.success} strokeWidth={2} />
            <Text style={styles.addWorkoutText}>Add Workout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  titleInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
  },
  editIconSlot: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleInput: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    flex: 1,
    minWidth: 100,
  },
  saveButton: {
    height: 40,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statsLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing['4xl'],
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    color: Colors.success,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  workoutNameInput: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.md,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  workoutCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutExerciseCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  addExerciseButtonPressed: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  addExerciseText: {
    ...Typography.bodySmall,
    color: Colors.success,
    fontWeight: '600',
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
  addWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  addWorkoutButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  addWorkoutText: {
    ...Typography.button,
    color: Colors.success,
  },
});
