/**
 * AI Mutation Preview Modal
 *
 * Shows a preview of AI-proposed changes and allows user to confirm or reject.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { X, Check } from 'lucide-react-native';
import { SparklesIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { IconSizes } from '../../../constants/Sizes';
import { StainlessSteelPattern } from '../../../components/StainlessSteelPattern';
import { GlassButton } from '../../../components/GlassButton';
import { useAIStore } from '../../store/aiStore';
import { AIMutationPlan, EditableProgramDraft } from '../../types/ai';
import { buildProgramDraftFromPlan } from '../../utils/aiProgramDraft';
import { AIMutationProgramDraftEditor } from './AIMutationProgramDraftEditor';
import { AIMutationSummaryList } from './AIMutationSummaryList';
import { AIMutationExercisePickerModal } from './AIMutationExercisePickerModal';
import { styles, getThemedStyles } from './AIMutationPreviewModal.styles';

interface AIMutationPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

type ProgramDraft = EditableProgramDraft | null;

export function AIMutationPreviewModal({
  visible,
  onClose,
  onConfirm,
}: AIMutationPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const themedStyles = getThemedStyles(colors, isDark);
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const isApplyingMutation = useAIStore((state) => state.isApplyingMutation);
  const applyCurrentMutationPlan = useAIStore((state) => state.applyCurrentMutationPlan);
  const setCurrentMutationPlan = useAIStore((state) => state.setCurrentMutationPlan);

  // Editable program draft state and actions
  const editableProgramDraft = useAIStore((state) => state.editableProgramDraft);
  const initEditableProgramDraft = useAIStore((state) => state.initEditableProgramDraft);
  const updateProgramDraft = useAIStore((state) => state.updateProgramDraft);
  const updateProgramWorkout = useAIStore((state) => state.updateProgramWorkout);
  const updateProgramExercise = useAIStore((state) => state.updateProgramExercise);
  const deleteProgramExercise = useAIStore((state) => state.deleteProgramExercise);
  const applyEditableProgramDraft = useAIStore((state) => state.applyEditableProgramDraft);
  const clearEditableProgramDraft = useAIStore((state) => state.clearEditableProgramDraft);
  const error = useAIStore((state) => state.error);
  const clearError = useAIStore((state) => state.clearError);

  // Exercise picker state
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [selectedProgramExercise, setSelectedProgramExercise] = useState<{
    workoutId: string;
    exerciseId: string;
  } | null>(null);

  const isProgramDraft =
    currentMutationPlan?.intent === 'CREATE_PROGRAM' ||
    currentMutationPlan?.intent === 'CREATE_TEMPLATE';

  useEffect(() => {
    if (visible && currentMutationPlan && isProgramDraft && !editableProgramDraft) {
      initEditableProgramDraft(currentMutationPlan);
    }
  }, [visible, currentMutationPlan, isProgramDraft, editableProgramDraft, initEditableProgramDraft]);

  const originalProgramDraft: ProgramDraft = useMemo(() => {
    if (!currentMutationPlan || !isProgramDraft) return null;
    return buildProgramDraftFromPlan(currentMutationPlan);
  }, [currentMutationPlan, isProgramDraft]);

  if (!currentMutationPlan) return null;

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    let success: boolean;
    if (isProgramDraft && editableProgramDraft) {
      // Use edited draft for CREATE_PROGRAM / CREATE_TEMPLATE
      success = await applyEditableProgramDraft();
    } else {
      // Use original plan for other intents
      success = await applyCurrentMutationPlan();
    }

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      onConfirm();
    } else {
      // Keep modal open on failure - error will be shown in error banner
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      // Error is already set in store, user can tap to retry
    }
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    clearEditableProgramDraft();
    clearError();
    setCurrentMutationPlan(null);
    onClose();
  };

  const handleClose = () => {
    clearEditableProgramDraft();
    clearError();
    onClose();
  };

  const handleOpenProgramExercisePicker = (workoutId: string, exerciseId: string) => {
    setSelectedProgramExercise({ workoutId, exerciseId });
    setExercisePickerVisible(true);
  };

  const newExercises = currentMutationPlan.exerciseResolution.filter(
    (e) => !e.fromHistory
  );

  const formatDiffValue = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' && value.trim().length === 0) return '—';
    return String(value);
  };

  const isValidUUID = (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };


  const totalExercises = editableProgramDraft?.workouts.reduce(
    (sum, workout) => sum + workout.exercises.length,
    0
  ) ??
    currentMutationPlan.mutations.filter((m) => m.entityType === 'program_exercise').length;

  const totalWorkouts = editableProgramDraft?.workouts.length ?? 0;
  const draftLabel = editableProgramDraft?.isTemplate ? 'Template' : 'Program';
  const confirmLabel = isProgramDraft ? `Create ${draftLabel}` : 'Apply Changes';

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
          <Animated.View
            entering={ZoomIn.duration(250)}
            exiting={ZoomOut.duration(200)}
            style={[styles.modalContainer, themedStyles.modalContainer]}
          >
            <StainlessSteelPattern />

            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, themedStyles.dragHandle]} />
            </View>

            {/* Header */}
            <View style={[styles.header, themedStyles.header]}>
              <View style={[styles.headerIcon, { backgroundColor: colors.accentOverlay }]}>
                <SparklesIcon color={colors.accent} size={IconSizes.lg} strokeWidth={2} />
              </View>
              <Text style={[styles.headerTitle, themedStyles.headerTitle]}>
                {isProgramDraft ? `Review ${draftLabel}` : 'Review Changes'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X color={colors.textSecondary} size={IconSizes.md} />
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={[styles.summary, themedStyles.summary]}>
              <Text style={[styles.summaryTitle, themedStyles.summaryTitle]}>
                {isProgramDraft
                  ? `${totalWorkouts || 1} workouts • ${totalExercises} exercises`
                  : currentMutationPlan.summary}
              </Text>
              <Text style={[styles.summaryExplanation, themedStyles.summaryExplanation]}>
                {isProgramDraft
                  ? 'Review and edit the draft before saving'
                  : currentMutationPlan.explanation}
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isProgramDraft ? (
                <AIMutationProgramDraftEditor
                  editableProgramDraft={editableProgramDraft}
                  originalProgramDraft={originalProgramDraft}
                  mutationPlan={currentMutationPlan as AIMutationPlan}
                  onUpdateProgramDraft={updateProgramDraft}
                  onUpdateProgramWorkout={updateProgramWorkout}
                  onUpdateProgramExercise={updateProgramExercise}
                  onDeleteProgramExercise={deleteProgramExercise}
                  onOpenExercisePicker={handleOpenProgramExercisePicker}
                />
              ) : (
                <AIMutationSummaryList
                  newExercises={newExercises}
                  exerciseResolution={currentMutationPlan.exerciseResolution}
                  mutations={currentMutationPlan.mutations}
                />
              )}
            </ScrollView>

            {error && (
              <TouchableOpacity
                style={styles.errorBanner}
                onPress={() => {
                  clearError();
                  handleConfirm();
                }}
                disabled={isApplyingMutation}
              >
                <Text style={styles.errorBannerText}>{error}</Text>
                <Text style={styles.errorBannerHint}>
                  {isApplyingMutation ? 'Retrying...' : 'Tap to retry'}
                </Text>
              </TouchableOpacity>
            )}

            {isProgramDraft && (
              <View style={styles.confirmPrompt}>
                <Text style={[styles.confirmPromptTitle, themedStyles.confirmPromptTitle]}>
                  Add this {draftLabel.toLowerCase()} to your {draftLabel.toLowerCase()} cards?
                </Text>
                <Text style={[styles.confirmPromptBody, themedStyles.confirmPromptBody]}>
                  Tap Create to add it, or Cancel to discard.
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={[styles.actions, themedStyles.actions]}>
              <TouchableOpacity
                style={[styles.rejectButton, themedStyles.rejectButton]}
                onPress={handleReject}
                disabled={isApplyingMutation}
              >
                <X color={colors.textSecondary} size={IconSizes.md} />
                <Text style={[styles.rejectButtonText, themedStyles.rejectButtonText]}>Cancel</Text>
              </TouchableOpacity>

              <GlassButton
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={isApplyingMutation}
              >
                {isApplyingMutation ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Check color={Colors.white} size={IconSizes.md} />
                    <Text style={styles.confirmButtonText}>
                      {confirmLabel}
                    </Text>
                  </>
                )}
              </GlassButton>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Exercise Picker Modal */}
      <AIMutationExercisePickerModal
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onSelect={(exerciseId, exerciseName) => {
          if (!selectedProgramExercise) {
            setExercisePickerVisible(false);
            return;
          }
          updateProgramExercise(selectedProgramExercise.workoutId, selectedProgramExercise.exerciseId, {
            exerciseId,
            exerciseName,
          });
          setSelectedProgramExercise(null);
          setExercisePickerVisible(false);
        }}
      />
    </Modal>
  );
}


export default AIMutationPreviewModal;
