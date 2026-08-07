import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import * as Haptics from 'expo-haptics';
import type { AIConversationMessage } from '@/src/types/ai';
import { getExerciseById } from '@/src/services/exerciseService';
import { useProgramsStore } from '@/src/store/programsStore';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import type { GeneratedProgramPayload } from '@/src/utils/onboardingProgram';
import type { Program } from '@/src/types/workout';

interface Options {
  conversationId?: string | null;
  markProgramSaved?: (messageId: string, programId: string) => Promise<void>;
}

export function useAIProgramTemplateActions({ conversationId, markProgramSaved }: Options) {
  const router = useRouter();
  const posthog = usePostHog();
  const programs = useProgramsStore((state) => state.programs);
  const createGeneratedProgram = useProgramsStore((state) => state.createGeneratedProgram);
  const setPreviewProgram = useProgramsStore((state) => state.setPreviewProgram);
  const { canCreateProgram, runProFeature } = useProFeatureGate();
  const [savingProgramMessageId, setSavingProgramMessageId] = useState<string | null>(null);
  const [programSaveError, setProgramSaveError] = useState<string | null>(null);

  const handleAddProgram = useCallback(async (message: AIConversationMessage) => {
    const template = message.programTemplate;
    if (!template || message.savedProgramId || savingProgramMessageId) return;

    const save = async () => {
      setSavingProgramMessageId(message.id);
      setProgramSaveError(null);
      try {
        const workouts = await Promise.all(template.workouts.map(async (workout) => ({
          name: workout.name,
          exercises: (await Promise.all(workout.exercises.map(async (exercise) => {
            const libraryExercise = await getExerciseById(exercise.exerciseId)
              || await getExerciseById(exercise.exerciseName);
            if (!libraryExercise) return null;
            return {
              exerciseId: libraryExercise.id,
              exerciseName: libraryExercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              restSeconds: exercise.restSeconds ?? 90,
              notes: exercise.notes ?? '',
            };
          }))).filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise)),
        })));

        if (workouts.some((workout, index) => (
          workout.exercises.length !== template.workouts[index]?.exercises.length
        ))) {
          throw new Error('This program contains an exercise that is not in your app library.');
        }

        const payload: GeneratedProgramPayload = {
          name: template.name,
          description: template.description?.trim() || 'A personalized program built with Fortis AI.',
          difficulty: template.difficulty ?? 'intermediate',
          goal: template.goal ?? 'general_fitness',
          durationWeeks: template.durationWeeks ?? 8,
          workouts,
          sourceSpecId: `${conversationId ?? 'chat'}:${message.id}`,
          sourceType: 'chat',
          sourceChatId: conversationId ?? null,
        };
        const programId = await createGeneratedProgram(payload);
        if (!programId) {
          throw new Error(useProgramsStore.getState().error ?? 'Failed to add the program.');
        }
        await markProgramSaved?.(message.id, programId);
        posthog.capture('ai_program_saved', {
          workout_count: workouts.length,
          exercise_count: workouts.reduce((sum, workout) => sum + workout.exercises.length, 0),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        setProgramSaveError(error instanceof Error ? error.message : 'Failed to add the program.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setSavingProgramMessageId(null);
      }
    };

    if (!canCreateProgram(programs.filter((program) => !program.isTemplate).length)) {
      await runProFeature({
        placement: PAYWALL_PLACEMENTS.programLimit,
        params: { source: 'ai_chat', action: 'save_program' },
      }, save);
      return;
    }
    await save();
  }, [canCreateProgram, conversationId, createGeneratedProgram, markProgramSaved, posthog, programs, runProFeature, savingProgramMessageId]);

  const handleOpenProgram = useCallback((message: AIConversationMessage) => {
    if (!message.savedProgramId) return;
    const sourceSpecId = `${conversationId ?? 'chat'}:${message.id}`;
    const savedProgram = programs.find((program) => (
      program.id === message.savedProgramId
      || program.aiPayloadVersion === `chat-program:${sourceSpecId}`
    ));
    if (!savedProgram) {
      setProgramSaveError('That saved program could not be found.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (savedProgram.id !== message.savedProgramId) {
      void markProgramSaved?.(message.id, savedProgram.id);
    }
    router.push(`/programs/${savedProgram.id}`);
  }, [conversationId, markProgramSaved, programs, router]);

  const handlePreviewProgram = useCallback((message: AIConversationMessage) => {
    const template = message.programTemplate;
    if (!template) return;
    const now = new Date().toISOString();
    const previewId = `ai-chat-program-preview-${message.id}`;
    const previewProgram: Program = {
      id: previewId,
      name: template.name,
      description: template.description,
      difficulty: template.difficulty ?? 'intermediate',
      goal: template.goal ?? 'general_fitness',
      durationWeeks: template.durationWeeks ?? 8,
      isPublic: false,
      isDefault: false,
      isAiCreated: true,
      isTemplate: false,
      aiSourceChatId: conversationId ?? null,
      aiPayloadVersion: `chat-program-preview:${message.id}`,
      lastPerformedAt: null,
      createdBy: 'preview',
      createdAt: now,
      updatedAt: now,
      workouts: template.workouts.map((workout, workoutIndex) => {
        const workoutId = `${previewId}-workout-${workoutIndex + 1}`;
        return {
          id: workoutId,
          name: workout.name,
          dayNumber: workoutIndex + 1,
          exercises: workout.exercises.map((exercise, exerciseIndex) => ({
            id: `${workoutId}-exercise-${exerciseIndex + 1}`,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds ?? 90,
            notes: exercise.notes ?? '',
            orderIndex: exerciseIndex,
          })),
        };
      }),
    };
    setPreviewProgram(previewProgram);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/${previewId}?preview=ai-chat`);
  }, [conversationId, router, setPreviewProgram]);

  return {
    savingProgramMessageId,
    programSaveError,
    setProgramSaveError,
    handleAddProgram,
    handleOpenProgram,
    handlePreviewProgram,
  };
}
