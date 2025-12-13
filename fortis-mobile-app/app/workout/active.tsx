import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/store/workoutStore';
import { useRestTimerTick } from '@/hooks/useRestTimerTick';
import { WorkoutHeader } from '@/src/components/workout/WorkoutHeader';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import * as Haptics from 'expo-haptics';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const cancelWorkout = useWorkoutStore(s => s.cancelWorkout);

  // Modal visibility states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimerSettingsModal, setShowTimerSettingsModal] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Initialize rest timer tick
  useRestTimerTick();

  // Handle cancel workout
  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    cancelWorkout();
    setShowCancelModal(false);
    router.back();
  };

  // Handle add exercise
  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddExerciseModal(true);
  };

  // Handle finish workout
  const handleFinishWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFinishModal(true);
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Dumbbell size={64} color={Colors.textTertiary} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No Exercises Added</Text>
      <Text style={styles.emptyDescription}>
        Tap the button below to add exercises to your workout
      </Text>
    </View>
  );

  // Exercise card renderer
  const renderExerciseCard = ({ item }: any) => (
    <ExerciseCard exerciseLocalId={item.localId} />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StainlessSteelPattern />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <WorkoutHeader
          onCancelPress={handleCancelPress}
          onTimerSettingsPress={() => setShowTimerSettingsModal(true)}
          onRestTimerPress={() => setShowRestTimerControls(true)}
        />

        {/* Exercise List */}
        <FlatList
          data={activeSession?.exercises || []}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Pressable
            onPress={handleAddExercise}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed
            ]}
          >
            <Plus size={20} color={Colors.background} strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </Pressable>

          {activeSession && activeSession.exercises.length > 0 && (
            <Pressable
              onPress={handleFinishWorkout}
              style={({ pressed }) => [
                styles.finishButton,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Modals (placeholders - will be implemented in later phases) */}
      {showCancelModal && (
        <View style={styles.modalPlaceholder}>
          <Text style={styles.modalText}>Cancel Modal - Phase 6</Text>
          <Pressable onPress={() => setShowCancelModal(false)}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Pressable onPress={handleConfirmCancel}>
            <Text style={styles.confirmText}>Confirm Cancel</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120, // Space for bottom actions
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyDescription: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.background,
  },
  finishButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.lg,
  },
  finishButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  // Modal placeholders (temporary)
  modalPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    width: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  modalText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  confirmText: {
    color: Colors.destructive,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
