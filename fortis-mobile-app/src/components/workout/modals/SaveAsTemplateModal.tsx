import { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { XMarkIcon, CheckIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { WorkoutSession } from '@/src/types/workout';
import { useProgramsStore } from '@/src/store/programsStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

interface SaveAsTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: WorkoutSession | null;
}

export function SaveAsTemplateModal({
  visible,
  onClose,
  onSuccess,
  session,
}: SaveAsTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const createWorkoutTemplate = useProgramsStore(s => s.createWorkoutTemplate);

  if (!visible || !session) return null;

  // Convert workout exercises to template format
  const exercisesForTemplate = session.exercises
    .filter(ex => ex.sets.some(s => s.isCompleted))
    .map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets.filter(s => s.isCompleted).length,
      reps: '8-12', // Default rep range
      restSeconds: 120,
    }));

  const handleSave = async () => {
    if (!templateName.trim() || exercisesForTemplate.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

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
        }))
      );

      if (result) {
        setShowSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Wait for success animation, then close
        setTimeout(() => {
          setShowSuccess(false);
          setTemplateName('');
          onSuccess();
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

  const handleClose = () => {
    setTemplateName('');
    setShowSuccess(false);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={styles.centeredView} onPress={handleClose} activeOpacity={1}>
          <Animated.View entering={ZoomIn.duration(250)} exiting={ZoomOut.duration(200)}>
            <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
              <StainlessSteelPattern />

              {showSuccess ? (
                // Success State
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <CheckIcon size={32} color={Colors.success} strokeWidth={3} />
                  </View>
                  <Text style={styles.successText}>Template Saved!</Text>
                </View>
              ) : (
                <>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.title}>Save as Template</Text>
                    <Pressable
                      onPress={handleClose}
                      style={({ pressed }) => [
                        styles.closeButton,
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
                      <Text style={styles.inputLabel}>Template Name</Text>
                      <TextInput
                        style={styles.textInput}
                        value={templateName}
                        onChangeText={setTemplateName}
                        placeholder="e.g., Push Day, Upper Body"
                        placeholderTextColor={Colors.textTertiary}
                        autoFocus
                      />
                    </View>

                    {/* Exercise Summary */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summaryLabel}>
                        {exercisesForTemplate.length} Exercise{exercisesForTemplate.length !== 1 ? 's' : ''}
                      </Text>
                      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
                        {exercisesForTemplate.map((ex, index) => (
                          <View key={ex.exerciseId + index} style={styles.exerciseItem}>
                            <Text style={styles.exerciseName} numberOfLines={1}>
                              {ex.exerciseName}
                            </Text>
                            <Text style={styles.exerciseSets}>{ex.sets} sets</Text>
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
                      <Text style={styles.saveButtonText}>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    width: 340,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
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
    color: '#fff',
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
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
    textAlign: 'center',
  },
});
