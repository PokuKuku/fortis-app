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
import { Plus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useRestTimerTick } from '@/src/hooks/useRestTimerTick';
import { WorkoutHeader } from '@/src/components/workout/WorkoutHeader';
import { ExerciseCard } from '@/src/components/workout/ExerciseCard';
import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';
import { RestTimerControls } from '@/src/components/workout/modals/RestTimerControls';
import { TimerSettingsModal } from '@/src/components/workout/modals/TimerSettingsModal';
import { CancelWorkoutModal } from '@/src/components/workout/modals/CancelWorkoutModal';
import { WorkoutCompleteModal } from '@/src/components/workout/modals/WorkoutCompleteModal';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const cancelWorkout = useWorkoutStore(s => s.cancelWorkout);
  const finishWorkout = useWorkoutStore(s => s.finishWorkout);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);
  const updateRestTimerSettings = useWorkoutStore(s => s.updateRestTimerSettings);

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

  // Handle timer settings save
  const handleSaveTimerSettings = (normal: number, warmup: number, dropset: number) => {
    updateRestTimerSettings({
      normalSeconds: normal,
      warmupSeconds: warmup,
      dropsetSeconds: dropset,
    });
  };

  // Handle confirm finish
  const handleConfirmFinish = async () => {
    await finishWorkout();
    setShowFinishModal(false);
    router.back();
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No exercises added yet</Text>
      <Text style={styles.emptyDescription}>
        Tap the button below to get started
      </Text>
    </View>
  );

  // Exercise card renderer
  const renderExerciseCard = ({ item }: any) => (
    <ExerciseCard exerciseLocalId={item.localId} />
  );

  // Footer with action buttons
  const renderFooter = () => (
    <View style={styles.bottomActions}>
      <Pressable
        onPress={handleAddExercise}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.pressed
        ]}
      >
        <Text style={styles.addButtonText}>+ Add Exercise</Text>
      </Pressable>

      <GlassButton style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </GlassButton>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StainlessSteelPattern />

      {/* Drag Handle Indicator */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

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
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
      />

      {/* Rest Timer Controls */}
      <RestTimerControls
        visible={showRestTimerControls}
        onClose={() => setShowRestTimerControls(false)}
      />

      {/* Timer Settings Modal */}
      <TimerSettingsModal
        visible={showTimerSettingsModal}
        onClose={() => setShowTimerSettingsModal(false)}
        onSave={handleSaveTimerSettings}
        initialNormalDuration={restTimerSettings.normalSeconds}
        initialWarmupDuration={restTimerSettings.warmupSeconds}
        initialDropDuration={restTimerSettings.dropsetSeconds}
      />

      {/* Cancel Workout Modal */}
      <CancelWorkoutModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* Workout Complete Modal */}
      <WorkoutCompleteModal
        visible={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleConfirmFinish}
        session={activeSession}
      />
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
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: 0,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyDescription: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomActions: {
    paddingTop: Spacing.lg,
    paddingBottom: 140,
    gap: Spacing.md,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.success,
  },
  finishButton: {
    height: 40,
    borderRadius: 16,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.7,
  },
});
