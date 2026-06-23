import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { XMarkIcon, CheckIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius, Sizes } from '@/constants/Sizes';
import { getModalWidth } from '@/src/utils/responsive';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { GlassButton } from '@/components/GlassButton';
import { WorkoutSession } from '@/src/types/workout';
import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { posthog } from '@/src/config/posthog';

interface SaveAsTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (templateName?: string) => void;
  session: WorkoutSession | null;
}

export function SaveAsTemplateModal({
  visible,
  onClose,
  onSuccess,
  session,
}: SaveAsTemplateModalProps) {
  const { colors, isDark } = useTheme();
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const programs = useProgramsStore(s => s.programs);
  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);
  const setActiveSessionProgramContext = useWorkoutStore(s => s.setActiveSessionProgramContext);
  const { canCreateWorkoutTemplate, runProFeature } = useProFeatureGate();
  const savedWorkoutTemplateCount = programs.filter((program) => program.isTemplate).length;

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: isDark ? '#222222' : '#FFFFFF' },
    title: { color: colors.textPrimary },
    closeButton: { backgroundColor: isDark ? '#2a2a2a' : 'rgba(0, 0, 0, 0.08)' },
    inputLabel: { color: colors.textSecondary },
    textInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: colors.textPrimary,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    summaryLabel: { color: colors.textSecondary },
    exerciseList: { backgroundColor: isDark ? '#1a1a1a' : 'rgba(0, 0, 0, 0.04)' },
    exerciseItem: { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
    exerciseName: { color: colors.textPrimary },
    exerciseSets: { color: colors.textSecondary },
    successIcon: {
      backgroundColor: colors.accentOverlay,
    },
    successText: { color: colors.accent },
  };

  if (!visible || !session) return null;

  // Convert workout exercises to template format (save entire workout state including weight/reps)
  const exercisesForTemplate = session.exercises.map(ex => ({
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    sets: ex.sets.length, // Save all sets, not just completed ones
    reps: ex.targetReps || '8-12',
    restSeconds: 120,
    setDetails: ex.sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
    })),
  }));

  const saveTemplate = async () => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await createWorkoutTemplate(
        templateName.trim(),
        exercisesForTemplate.map(ex => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          setDetails: ex.setDetails,
        })),
        { lastPerformedAt: session.completedAt || session.startedAt }
      );

      if (result) {
        posthog.capture('workout_created', {
          method: 'manual',
          exercise_count: exercisesForTemplate.length,
          is_first_workout: savedWorkoutTemplateCount === 0,
        });
        const createdTemplate = useProgramsStore
          .getState()
          .programs
          .find((program) => program.id === result);
        const createdWorkoutId = createdTemplate?.workouts?.[0]?.id ?? `${result}-workout`;
        setActiveSessionProgramContext(result, createdWorkoutId);
        setShowSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Wait for success animation, then close
        // Pass template name so parent can update completed workout name after finishWorkout()
        setTimeout(() => {
          setShowSuccess(false);
          setTemplateName('');
          onSuccess(templateName.trim());
        }, 1500);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!templateName.trim() || exercisesForTemplate.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!canCreateWorkoutTemplate(savedWorkoutTemplateCount)) {
      await runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.workoutLimit,
          params: {
            source: 'active_workout',
            action: 'save_as_template',
            workoutTemplateCount: savedWorkoutTemplateCount,
          },
        },
        saveTemplate,
      );
      return;
    }

    await saveTemplate();
  };

  const handleClose = () => {
    setTemplateName('');
    setShowSuccess(false);
    onClose();
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <Pressable style={styles.centeredView} onPress={handleClose}>
        <Animated.View entering={ZoomIn.duration(250)} exiting={ZoomOut.duration(200)}>
          <Pressable style={[styles.container, themedStyles.container]} onPress={(e) => e.stopPropagation()}>
            <StainlessSteelPattern />

            {showSuccess ? (
              // Success State
              <View style={styles.successContainer}>
                <View style={[styles.successIcon, themedStyles.successIcon]}>
                  <CheckIcon size={32} color={colors.accent} strokeWidth={3} />
                </View>
                <Text style={[styles.successText, themedStyles.successText]}>Template Saved!</Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={[styles.title, themedStyles.title]}>Save as Template</Text>
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => [
                      styles.closeButton,
                      themedStyles.closeButton,
                      pressed && styles.closeButtonPressed,
                    ]}
                  >
                    <XMarkIcon size={20} color={Colors.error} strokeWidth={2} />
                  </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Template Name</Text>
                    <TextInput
                      style={[styles.textInput, themedStyles.textInput]}
                      value={templateName}
                      onChangeText={setTemplateName}
                      placeholder="e.g., Push Day, Upper Body"
                      placeholderTextColor={colors.textTertiary}
                      autoFocus
                    />
                  </View>

                  {/* Exercise Summary */}
                  <View style={styles.summarySection}>
                    <Text style={[styles.summaryLabel, themedStyles.summaryLabel]}>
                      {exercisesForTemplate.length} Exercise{exercisesForTemplate.length !== 1 ? 's' : ''}
                    </Text>
                    <ScrollView style={[styles.exerciseList, themedStyles.exerciseList]} showsVerticalScrollIndicator={false}>
                      {exercisesForTemplate.map((ex, index) => (
                        <View key={ex.exerciseId + index} style={[styles.exerciseItem, themedStyles.exerciseItem]}>
                          <Text style={[styles.exerciseName, themedStyles.exerciseName]} numberOfLines={1}>
                            {ex.exerciseName}
                          </Text>
                          <Text style={[styles.exerciseSets, themedStyles.exerciseSets]}>{ex.sets} sets</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Save Button */}
                  <GlassButton
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSaving || !templateName.trim()}
                  >
                    <Text style={[styles.saveButtonText, { color: colors.accentForegroundOnFill }]}>
                      {isSaving ? 'Saving...' : 'Save Template'}
                    </Text>
                  </GlassButton>
                </View>
              </>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    width: getModalWidth(340),
    backgroundColor: '#222222',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing['2xl'],
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    zIndex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    height: 50,
    paddingVertical: 0,
    fontSize: 15,
    letterSpacing: 0.6,
    color: Colors.textPrimary,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  summarySection: {
    marginBottom: Spacing.xl,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  exerciseList: {
    maxHeight: 150,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  exerciseName: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    marginRight: Spacing.md,
  },
  exerciseSets: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  saveButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Success State
  successContainer: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    // backgroundColor now applied via themedStyles.successIcon
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    // color now applied via themedStyles.successText
    textAlign: 'center',
  },
});
