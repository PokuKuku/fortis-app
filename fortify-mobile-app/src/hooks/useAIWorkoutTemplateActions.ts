import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import * as Haptics from 'expo-haptics';
import type { AIConversationMessage } from '@/src/types/ai';
import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';
import { normalizeAIWorkoutTemplateMetadata } from '@/src/utils/aiWorkoutTemplateMetadata';
import { PAYWALL_PLACEMENTS, type PaywallPlacement } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import type { Program } from '@/src/types/workout';

interface UseAIWorkoutTemplateActionsOptions {
  messages: AIConversationMessage[];
  conversationId?: string | null;
  markWorkoutTemplateSaved?: (messageId: string, templateId: string) => Promise<void>;
  onWorkoutTemplateSaved?: (messageId: string, templateId: string) => void;
  saveWorkoutPlacement?: PaywallPlacement;
  useProvidedExerciseIds?: (message: AIConversationMessage) => boolean;
  getAiPayloadVersion?: (message: AIConversationMessage) => string | null | undefined;
  getSimulatedTemplateId?: (message: AIConversationMessage) => string | null | undefined;
}

export function useAIWorkoutTemplateActions({
  messages,
  conversationId,
  markWorkoutTemplateSaved,
  onWorkoutTemplateSaved,
  saveWorkoutPlacement = PAYWALL_PLACEMENTS.workoutLimit,
  useProvidedExerciseIds,
  getAiPayloadVersion,
  getSimulatedTemplateId,
}: UseAIWorkoutTemplateActionsOptions) {
  const router = useRouter();
  const posthog = usePostHog();
  const programs = useProgramsStore((state) => state.programs);
  const createWorkoutTemplate = useProgramsStore((state) => state.createWorkoutTemplate);
  const updateWorkoutTemplate = useProgramsStore((state) => state.updateWorkoutTemplate);
  const setPreviewProgram = useProgramsStore((state) => state.setPreviewProgram);
  const startWorkoutFromPlan = useWorkoutStore((state) => state.startWorkoutFromPlan);
  const isWorkoutActive = useWorkoutStore((state) => state.isWorkoutActive);
  const { canCreateWorkoutTemplate, runProFeature } = useProFeatureGate();

  const [savingWorkoutMessageId, setSavingWorkoutMessageId] = useState<string | null>(null);
  const [updatingWorkoutMessageId, setUpdatingWorkoutMessageId] = useState<string | null>(null);
  const [startingWorkoutMessageId, setStartingWorkoutMessageId] = useState<string | null>(null);
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(null);

  const savedWorkoutTemplateCount = useMemo(
    () => programs.filter((program) => program.isTemplate).length,
    [programs],
  );

  const handleViewWorkoutTemplate = useCallback((message: AIConversationMessage) => {
    const template = message.workoutTemplate;
    if (!template || !Array.isArray(template.exercises)) {
      return;
    }

    const now = new Date().toISOString();
    const previewId = `ai-chat-workout-preview-${message.id}`;
    const previewWorkout: Program = {
      id: previewId,
      name: template.name,
      description: template.description,
      difficulty: 'intermediate',
      goal: 'general_fitness',
      isPublic: false,
      isDefault: false,
      isAiCreated: true,
      isTemplate: true,
      aiSourceChatId: conversationId ?? null,
      aiPayloadVersion: 'ai-chat-workout-preview-v1',
      lastPerformedAt: null,
      createdBy: 'ai-chat-preview',
      createdAt: now,
      updatedAt: now,
      workouts: [{
        id: `${previewId}-workout`,
        name: template.name,
        dayNumber: 1,
        exercises: template.exercises.map((exercise, index) => ({
          id: `${previewId}-exercise-${index + 1}`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
          orderIndex: index,
        })),
      }],
    };

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTemplateSaveError(null);
    setPreviewProgram(previewWorkout);
    router.push(`/workouts/${previewId}?preview=ai-chat`);
  }, [conversationId, router, setPreviewProgram]);

  const resolveWorkoutTemplateExercises = useCallback(async (message: AIConversationMessage) => {
    if (!message.workoutTemplate || !Array.isArray(message.workoutTemplate.exercises)) {
      throw new Error('Missing workout template.');
    }

    const validExercises = useProvidedExerciseIds?.(message)
      ? message.workoutTemplate.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        }))
      : (await Promise.all(
          message.workoutTemplate.exercises.map(async (exercise) => {
            const libraryExercise = await getExerciseById(exercise.exerciseId)
              || await getExerciseById(exercise.exerciseName);

            if (!libraryExercise) {
              return null;
            }

            return {
              exerciseId: libraryExercise.id,
              exerciseName: libraryExercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              restSeconds: exercise.restSeconds,
              notes: exercise.notes,
            };
          })
        )).filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise));

    if (validExercises.length !== message.workoutTemplate.exercises.length) {
      throw new Error('This AI workout includes exercises that are not in your app library.');
    }

    return validExercises;
  }, [useProvidedExerciseIds]);

  const ensureWorkoutTemplateSaved = useCallback(async (message: AIConversationMessage) => {
    if (!message.workoutTemplate || !Array.isArray(message.workoutTemplate.exercises)) {
      throw new Error('Missing workout template.');
    }

    if (message.savedWorkoutTemplateId) {
      return message.savedWorkoutTemplateId;
    }

    const simulatedTemplateId = getSimulatedTemplateId?.(message);
    if (simulatedTemplateId) {
      // The in-app tour keeps the normal saved-card appearance, but the template
      // exists only for the current tour render. No store, storage, or server write.
      await markWorkoutTemplateSaved?.(message.id, simulatedTemplateId);
      onWorkoutTemplateSaved?.(message.id, simulatedTemplateId);
      return simulatedTemplateId;
    }

    const normalizedTemplate = normalizeAIWorkoutTemplateMetadata(message.workoutTemplate);
    const validExercises = await resolveWorkoutTemplateExercises({
      ...message,
      workoutTemplate: normalizedTemplate,
    });

    const createdTemplateId = await createWorkoutTemplate(
      normalizedTemplate.name,
      validExercises,
      {
        description: normalizedTemplate.description,
        isAiCreated: true,
        aiSourceChatId: conversationId ?? null,
        aiPayloadVersion: getAiPayloadVersion?.(message) ?? 'ai_workout_template_v1',
      }
    );

    if (!createdTemplateId) {
      throw new Error('Failed to add workout to your templates.');
    }

    await markWorkoutTemplateSaved?.(message.id, createdTemplateId);
    onWorkoutTemplateSaved?.(message.id, createdTemplateId);
    posthog.capture('ai_workout_saved', {
      exercise_count: validExercises.length,
    });
    posthog.capture('workout_created', {
      method: 'ai',
      exercise_count: validExercises.length,
      is_first_workout: savedWorkoutTemplateCount === 0,
    });
    validExercises.forEach(() => posthog.capture('exercise_added', { method: 'ai' }));
    return createdTemplateId;
  }, [conversationId, createWorkoutTemplate, getAiPayloadVersion, getSimulatedTemplateId, markWorkoutTemplateSaved, onWorkoutTemplateSaved, posthog, resolveWorkoutTemplateExercises, savedWorkoutTemplateCount]);

  const handleAddWorkoutTemplate = useCallback(async (message: AIConversationMessage) => {
    if (
      !message.workoutTemplate
      || !Array.isArray(message.workoutTemplate.exercises)
      || message.savedWorkoutTemplateId
      || savingWorkoutMessageId
      || updatingWorkoutMessageId
      || startingWorkoutMessageId
    ) {
      return;
    }

    const saveTemplate = async () => {
      setTemplateSaveError(null);
      setSavingWorkoutMessageId(message.id);

      try {
        await ensureWorkoutTemplateSaved(message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (saveError) {
        console.warn('Failed to save AI workout template:', saveError);
        setTemplateSaveError(
          saveError instanceof Error
            ? saveError.message
            : 'Failed to add workout to your templates.'
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setSavingWorkoutMessageId(null);
      }
    };

    if (!canCreateWorkoutTemplate(savedWorkoutTemplateCount)) {
      await runProFeature(
        {
          placement: saveWorkoutPlacement,
          params: {
            source: 'ai_workout_template',
            action: 'save_workout_template',
            workoutTemplateCount: savedWorkoutTemplateCount,
            messageId: message.id,
          },
        },
        saveTemplate,
      );
      return;
    }

    await saveTemplate();
  }, [
    canCreateWorkoutTemplate,
    ensureWorkoutTemplateSaved,
    runProFeature,
    savedWorkoutTemplateCount,
    saveWorkoutPlacement,
    savingWorkoutMessageId,
    startingWorkoutMessageId,
    updatingWorkoutMessageId,
  ]);

  const handleUpdateWorkoutTemplate = useCallback(async (message: AIConversationMessage) => {
    if (
      !message.workoutTemplate
      || !Array.isArray(message.workoutTemplate.exercises)
      || !message.editableWorkoutTemplateId
      || savingWorkoutMessageId
      || updatingWorkoutMessageId
      || startingWorkoutMessageId
    ) {
      return;
    }

    setTemplateSaveError(null);
    setUpdatingWorkoutMessageId(message.id);

    try {
      const normalizedTemplate = normalizeAIWorkoutTemplateMetadata(message.workoutTemplate);
      const validExercises = await resolveWorkoutTemplateExercises({
        ...message,
        workoutTemplate: normalizedTemplate,
      });
      const updatedTemplateId = await updateWorkoutTemplate(
        message.editableWorkoutTemplateId,
        normalizedTemplate.name,
        validExercises,
      );

      if (!updatedTemplateId) {
        throw new Error('Failed to update this workout.');
      }

      await markWorkoutTemplateSaved?.(message.id, updatedTemplateId);
      onWorkoutTemplateSaved?.(message.id, updatedTemplateId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      posthog.capture('ai_workout_updated', {
        exercise_count: validExercises.length,
      });
    } catch (updateError) {
      console.warn('Failed to update AI workout template:', updateError);
      setTemplateSaveError(
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update this workout.'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUpdatingWorkoutMessageId(null);
    }
  }, [
    markWorkoutTemplateSaved,
    onWorkoutTemplateSaved,
    posthog,
    resolveWorkoutTemplateExercises,
    savingWorkoutMessageId,
    startingWorkoutMessageId,
    updateWorkoutTemplate,
    updatingWorkoutMessageId,
  ]);

  const handleStartWorkoutTemplate = useCallback(async (message: AIConversationMessage) => {
    if (
      !message.workoutTemplate
      || !Array.isArray(message.workoutTemplate.exercises)
      || startingWorkoutMessageId
      || savingWorkoutMessageId
      || updatingWorkoutMessageId
    ) {
      return;
    }

    if (isWorkoutActive) {
      setTemplateSaveError('Finish your current workout before starting another one.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setTemplateSaveError(null);
    setStartingWorkoutMessageId(message.id);

    try {
      const normalizedTemplate = normalizeAIWorkoutTemplateMetadata(message.workoutTemplate);
      const success = await startWorkoutFromPlan(
        normalizedTemplate.name,
        normalizedTemplate.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
        }))
      );

      if (!success) {
        throw new Error('Failed to start workout from this AI workout.');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/workout/active');
    } catch (startError) {
      console.warn('Failed to start AI workout template:', startError);
      setTemplateSaveError(
        startError instanceof Error
          ? startError.message
          : 'Failed to start workout from this AI workout.'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setStartingWorkoutMessageId(null);
    }
  }, [isWorkoutActive, router, savingWorkoutMessageId, startWorkoutFromPlan, startingWorkoutMessageId, updatingWorkoutMessageId]);

  return {
    savingWorkoutMessageId,
    updatingWorkoutMessageId,
    startingWorkoutMessageId,
    templateSaveError,
    setTemplateSaveError,
    isWorkoutActive,
    handleViewWorkoutTemplate,
    handleAddWorkoutTemplate,
    handleUpdateWorkoutTemplate,
    handleStartWorkoutTemplate,
  };
}
