import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { AIConversationMessage } from '@/src/types/ai';
import { useProgramsStore } from '@/src/store/programsStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { getExerciseById } from '@/src/services/exerciseService';

interface UseAIWorkoutTemplateActionsOptions {
  messages: AIConversationMessage[];
  conversationId?: string | null;
  markWorkoutTemplateSaved?: (messageId: string, templateId: string) => Promise<void>;
  onWorkoutTemplateSaved?: (messageId: string, templateId: string) => void;
}

export function useAIWorkoutTemplateActions({
  messages,
  conversationId,
  markWorkoutTemplateSaved,
  onWorkoutTemplateSaved,
}: UseAIWorkoutTemplateActionsOptions) {
  const router = useRouter();
  const createWorkoutTemplate = useProgramsStore((state) => state.createWorkoutTemplate);
  const startWorkoutFromPlan = useWorkoutStore((state) => state.startWorkoutFromPlan);
  const isWorkoutActive = useWorkoutStore((state) => state.isWorkoutActive);

  const [previewMessageId, setPreviewMessageId] = useState<string | null>(null);
  const [savingWorkoutMessageId, setSavingWorkoutMessageId] = useState<string | null>(null);
  const [startingWorkoutMessageId, setStartingWorkoutMessageId] = useState<string | null>(null);
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(null);

  const previewMessage = useMemo(
    () => messages.find((message) => message.id === previewMessageId) ?? null,
    [messages, previewMessageId]
  );

  const handleViewWorkoutTemplate = useCallback((message: AIConversationMessage) => {
    if (!message.workoutTemplate || !Array.isArray(message.workoutTemplate.exercises)) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTemplateSaveError(null);
    setPreviewMessageId(message.id);
  }, []);

  const ensureWorkoutTemplateSaved = useCallback(async (message: AIConversationMessage) => {
    if (!message.workoutTemplate || !Array.isArray(message.workoutTemplate.exercises)) {
      throw new Error('Missing workout template.');
    }

    if (message.savedWorkoutTemplateId) {
      return message.savedWorkoutTemplateId;
    }

    const resolvedExercises = await Promise.all(
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
        };
      })
    );
    const validExercises = resolvedExercises.filter(
      (exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise)
    );

    if (validExercises.length !== message.workoutTemplate.exercises.length) {
      throw new Error('This AI workout includes exercises that are not in your app library.');
    }

    const createdTemplateId = await createWorkoutTemplate(
      message.workoutTemplate.name,
      validExercises,
      {
        description: message.workoutTemplate.description,
        isAiCreated: true,
        aiSourceChatId: conversationId ?? null,
        aiPayloadVersion: 'ai_workout_template_v1',
      }
    );

    if (!createdTemplateId) {
      throw new Error('Failed to add workout to your templates.');
    }

    await markWorkoutTemplateSaved?.(message.id, createdTemplateId);
    onWorkoutTemplateSaved?.(message.id, createdTemplateId);
    return createdTemplateId;
  }, [conversationId, createWorkoutTemplate, markWorkoutTemplateSaved, onWorkoutTemplateSaved]);

  const handleAddWorkoutTemplate = useCallback(async (message: AIConversationMessage) => {
    if (
      !message.workoutTemplate
      || !Array.isArray(message.workoutTemplate.exercises)
      || message.savedWorkoutTemplateId
      || savingWorkoutMessageId
      || startingWorkoutMessageId
    ) {
      return;
    }

    setTemplateSaveError(null);
    setSavingWorkoutMessageId(message.id);

    try {
      await ensureWorkoutTemplateSaved(message);
      setPreviewMessageId(null);
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
  }, [ensureWorkoutTemplateSaved, savingWorkoutMessageId, startingWorkoutMessageId]);

  const handleStartWorkoutTemplate = useCallback(async (message: AIConversationMessage) => {
    if (
      !message.workoutTemplate
      || !Array.isArray(message.workoutTemplate.exercises)
      || startingWorkoutMessageId
      || savingWorkoutMessageId
    ) {
      return;
    }

    if (isWorkoutActive) {
      setTemplateSaveError('Finish your current workout before starting another one.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setTemplateSaveError(null);
    setPreviewMessageId(null);
    setStartingWorkoutMessageId(message.id);

    try {
      const success = await startWorkoutFromPlan(
        message.workoutTemplate.name,
        message.workoutTemplate.exercises.map((exercise) => ({
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
  }, [isWorkoutActive, router, savingWorkoutMessageId, startWorkoutFromPlan, startingWorkoutMessageId]);

  return {
    previewMessage,
    setPreviewMessageId,
    savingWorkoutMessageId,
    startingWorkoutMessageId,
    templateSaveError,
    setTemplateSaveError,
    isWorkoutActive,
    handleViewWorkoutTemplate,
    handleAddWorkoutTemplate,
    handleStartWorkoutTemplate,
  };
}
