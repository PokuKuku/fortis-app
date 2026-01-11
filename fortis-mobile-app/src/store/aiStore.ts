/**
 * AI Store (Zustand)
 *
 * Central state management for AI assistant features.
 * Handles conversation history, pending actions, and UI state.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getScopedItem, setScopedItem, removeScopedItem } from '@/src/utils/scopedStorage';
import {
  AIIntent,
  AIImage,
  AIImageMimeType,
  AIError,
  AIResponse,
  AIConversation,
  AIConversationMessage,
  AIRequestContext,
  AIPendingAction,
  AIMutationPlan,
  AIMutationRecord,
  AIRateLimitStatus,
  EditableProgramDraft,
  EditableProgramWorkout,
  EditableProgramExercise,
  AIRateLimitWindow,
  WorkoutDraftV1,
} from '../types/ai';
import * as aiService from '../services/aiService';
import * as ExerciseService from '../services/exerciseService';
import { AI_CONVERSATION_KEY, AI_MUTATION_PLAN_KEY, AI_WORKOUT_DRAFT_KEY } from '../constants/storageKeys';
import { analytics } from '../services/analyticsService';
import { useProgramsStore } from './programsStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { buildProgramDraftFromPlan, buildPlanFromProgramDraft } from '../utils/aiProgramDraft';
import { generateSecureUUID as generateId } from '../utils/uuid';
import type { ExerciseWithSource } from '../types/exercise';
import {
  buildDraftSummaryFallback,
  buildResolutionPrompt,
  resolveWorkoutDraftExercises,
  type DraftResolution,
} from '../utils/workoutDraftResolver';
import { parseDraftReply } from '../utils/workoutDraftIntent';

const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const normalizeExerciseKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const resolveDraftExerciseIds = async (
  draft: EditableProgramDraft
): Promise<EditableProgramDraft> => {
  let exercises: Awaited<ReturnType<typeof ExerciseService.getAllExercises>>;
  try {
    exercises = await ExerciseService.getAllExercises({ includeVariants: true });
  } catch (error) {
    console.warn('Failed to resolve exercise IDs for draft:', error);
    return draft;
  }
  const lookup = new Map<string, { id: string; name: string }>();

  exercises.forEach((exercise) => {
    lookup.set(exercise.id, { id: exercise.id, name: exercise.name });
    if (exercise.slug) {
      lookup.set(exercise.slug, { id: exercise.id, name: exercise.name });
      lookup.set(normalizeExerciseKey(exercise.slug), { id: exercise.id, name: exercise.name });
    }
    lookup.set(normalizeExerciseKey(exercise.name), { id: exercise.id, name: exercise.name });
  });

  const resolvedWorkouts = draft.workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => {
      if (isValidUUID(exercise.exerciseId)) {
        return exercise;
      }

      const candidateKeys = new Set<string>();
      if (exercise.exerciseId) {
        candidateKeys.add(exercise.exerciseId);
        candidateKeys.add(normalizeExerciseKey(exercise.exerciseId));
      }
      if (exercise.exerciseName && exercise.exerciseName !== 'Unknown Exercise') {
        candidateKeys.add(exercise.exerciseName);
        candidateKeys.add(normalizeExerciseKey(exercise.exerciseName));
      }

      for (const key of candidateKeys) {
        const match = lookup.get(key);
        if (match) {
          return {
            ...exercise,
            exerciseId: match.id,
            exerciseName: match.name,
          };
        }
      }

      return exercise;
    }),
  }));

  return {
    ...draft,
    workouts: resolvedWorkouts,
  };
};

const mergeResolvedDraft = (
  current: EditableProgramDraft,
  resolved: EditableProgramDraft
): EditableProgramDraft => {
  const resolvedWorkoutsById = new Map(
    resolved.workouts.map((workout) => [workout.id, workout])
  );

  const workouts = current.workouts.map((workout) => {
    const resolvedWorkout = resolvedWorkoutsById.get(workout.id);
    if (!resolvedWorkout) return workout;
    const resolvedExercisesById = new Map(
      resolvedWorkout.exercises.map((exercise) => [exercise.id, exercise])
    );
    const exercises = workout.exercises.map((exercise) => {
      if (isValidUUID(exercise.exerciseId)) {
        return exercise;
      }
      const resolvedExercise = resolvedExercisesById.get(exercise.id);
      if (resolvedExercise && isValidUUID(resolvedExercise.exerciseId)) {
        return {
          ...exercise,
          exerciseId: resolvedExercise.exerciseId,
          exerciseName: resolvedExercise.exerciseName,
        };
      }
      return exercise;
    });
    return {
      ...workout,
      exercises,
    };
  });

  return {
    ...current,
    workouts,
  };
};

const hasInvalidDraftExercises = (draft: EditableProgramDraft): boolean =>
  draft.workouts.some((workout) =>
    workout.exercises.some((exercise) => !isValidUUID(exercise.exerciseId))
  );

const makeFriendlyClarification = (question: string | undefined, _intent: AIIntent): string => {
  return question || 'Could you share a bit more detail so I can help?';
};

const RATE_LIMIT_LABELS: Record<AIRateLimitWindow, string> = {
  minute: 'per-minute',
  hour: 'hourly',
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
};

const formatRetryAfter = (seconds?: number): string | null => {
  if (!seconds || seconds <= 0) return null;
  const totalSeconds = Math.ceil(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${totalSeconds}s`);
  return parts.join(' ');
};

const makeRateLimitMessage = (error?: AIError): string => {
  const windowLabel = error?.limitWindow ? RATE_LIMIT_LABELS[error.limitWindow] : null;
  const retryAfter = formatRetryAfter(error?.retryAfterSeconds);
  const windowText = windowLabel ? `${windowLabel} ` : '';
  const retryText = retryAfter ? ` Try again in ${retryAfter}.` : ' Try again later.';
  return `Looks like you've hit your ${windowText}AI limit.${retryText}`;
};

const syncWorkoutDraftToSupabase = async (
  pendingDraft: PendingWorkoutDraft,
  unresolved?: DraftResolution[]
) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const unresolvedPayload = unresolved
      ? unresolved.map((entry) => ({
          exerciseIndex: entry.exerciseIndex,
          query: entry.query,
          reason: entry.reason,
          candidateIds: entry.candidates.map((candidate) => candidate.id),
        }))
      : null;

    await supabase
      .from('chat_workout_drafts')
      .upsert({
        id: pendingDraft.id,
        user_id: session.user.id,
        chat_id: pendingDraft.chatId,
        status: pendingDraft.status,
        draft_payload: pendingDraft.draft,
        unresolved: unresolvedPayload,
      }, { onConflict: 'id' });
  } catch (error) {
    console.warn('Failed to sync workout draft:', error);
  }
};

type PendingWorkoutDraftStatus =
  | 'pending'
  | 'awaiting_resolution'
  | 'ready_to_save'
  | 'saved'
  | 'canceled';

type PendingWorkoutDraft = {
  id: string;
  chatId: string;
  status: PendingWorkoutDraftStatus;
  draft: WorkoutDraftV1;
  pendingResolution?: DraftResolution;
  createdAt: string;
  updatedAt: string;
};

interface AIState {
  // Conversation
  conversation: AIConversation | null;
  isConversationOpen: boolean;

  // Loading states
  isLoading: boolean;
  isSendingMessage: boolean;
  isApplyingMutation: boolean;

  // Image attachment for message
  selectedImage: { uri: string; base64: string; mimeType: AIImageMimeType } | null;

  // Pending actions (mutations awaiting confirmation)
  pendingActions: AIPendingAction[];
  currentMutationPlan: AIMutationPlan | null;

  // Mutation history (for undo)
  mutationHistory: AIMutationRecord[];

  // Editable program/template draft (for program/template intents)
  editableProgramDraft: EditableProgramDraft | null;

  // Rate limiting
  rateLimitStatus: AIRateLimitStatus | null;

  // Error state
  error: string | null;

  // Last failed message (for retry)
  lastFailedMessage: {
    intent: AIIntent;
    message: string;
    context?: AIRequestContext;
    image?: { uri: string; base64: string; mimeType: AIImageMimeType };
  } | null;

  // Pending workout draft (chat-only template flow)
  pendingWorkoutDraft: PendingWorkoutDraft | null;

  // Actions - Conversation
  openConversation: () => void;
  closeConversation: () => void;
  clearConversation: () => void;
  sendMessage: (intent: AIIntent, message: string, context?: AIRequestContext) => Promise<AIResponse>;

  // Actions - Pending draft
  loadPendingWorkoutDraft: () => Promise<void>;
  clearPendingWorkoutDraft: () => void;
  processWorkoutDraftReply: (
    intent: AIIntent,
    message: string
  ) => Promise<{ handled: boolean; contextOverride?: AIRequestContext }>;
  initializeWorkoutDraft: (draft: WorkoutDraftV1, responseMessage?: string) => Promise<void>;
  resolvePendingWorkoutDraft: (responseMessage?: string) => Promise<void>;
  savePendingWorkoutDraft: (saveAsTitle?: string) => Promise<{ success: boolean; message: string }>;
  appendAssistantMessage: (content: string) => Promise<void>;

  // Actions - Image attachment
  setSelectedImage: (image: { uri: string; base64: string; mimeType: AIImageMimeType }) => void;
  clearSelectedImage: () => void;

  // Actions - Quick queries (shortcuts for common intents)
  // Note: requestProgram and requestTemplate removed - only FORTIS_ANALYST is active

  // Actions - Pending actions
  loadPendingActions: () => Promise<void>;
  confirmPendingAction: (actionId: string) => Promise<boolean>;
  rejectPendingAction: (actionId: string) => Promise<boolean>;
  setCurrentMutationPlan: (plan: AIMutationPlan | null) => void;
  applyCurrentMutationPlan: () => Promise<boolean>;

  initEditableProgramDraft: (plan: AIMutationPlan) => void;

  // Editable program draft actions
  updateProgramDraft: (updates: Partial<EditableProgramDraft>) => void;
  updateProgramWorkout: (workoutId: string, updates: Partial<EditableProgramWorkout>) => void;
  updateProgramExercise: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<EditableProgramExercise>
  ) => void;
  deleteProgramExercise: (workoutId: string, exerciseId: string) => void;
  applyEditableProgramDraft: () => Promise<boolean>;
  clearEditableProgramDraft: () => void;

  // Actions - Undo
  loadMutationHistory: () => Promise<void>;
  undoMutation: (mutationId: string) => Promise<boolean>;

  // Actions - Rate limits
  checkRateLimits: () => Promise<void>;

  // Actions - Persistence
  loadConversation: () => Promise<void>;
  loadMutationPlan: () => Promise<void>;
  persistConversation: () => Promise<void>;
  resetStore: () => void;

  // Actions - Error handling
  clearError: () => void;

  // Actions - Retry
  retryLastMessage: () => Promise<AIResponse | null>;
  clearLastFailedMessage: () => void;
}

export const useAIStore = create<AIState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    conversation: null,
    isConversationOpen: false,
    isLoading: false,
    isSendingMessage: false,
    isApplyingMutation: false,
    selectedImage: null,
    pendingActions: [],
    currentMutationPlan: null,
    mutationHistory: [],
    editableProgramDraft: null,
    rateLimitStatus: null,
    error: null,
    lastFailedMessage: null,
    pendingWorkoutDraft: null,

    // Conversation actions
    openConversation: () => {
      const {
        conversation,
        loadConversation,
        loadPendingActions,
        loadMutationPlan,
        loadPendingWorkoutDraft,
      } = get();
      if (!conversation) {
        loadConversation();
      }
      loadPendingActions();
      loadMutationPlan();
      loadPendingWorkoutDraft();
      set({ isConversationOpen: true });
    },

    closeConversation: () => {
      set({ isConversationOpen: false, currentMutationPlan: null });
    },

    clearConversation: () => {
      const newConversation: AIConversation = {
        id: generateId(),
        messages: [],
        pendingActions: [],
        createdAt: new Date().toISOString(),
      };
      set({
        conversation: newConversation,
        currentMutationPlan: null,
        error: null,
        pendingWorkoutDraft: null,
      });
      get().persistConversation();
      removeScopedItem(AI_WORKOUT_DRAFT_KEY).catch((err) => {
        console.error('Error clearing workout draft:', err);
      });
      removeScopedItem(AI_MUTATION_PLAN_KEY).catch((err) => {
        console.error('Error clearing mutation plan:', err);
      });
    },

    sendMessage: async (intent, message, context) => {
      const { conversation, persistConversation, selectedImage } = get();

      // Create user message (include image reference if present)
      const userMessage: AIConversationMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        intent,
        createdAt: new Date().toISOString(),
        image: selectedImage ? { uri: selectedImage.uri, mimeType: selectedImage.mimeType } : undefined,
      };

      // Update conversation with user message
      const updatedConversation: AIConversation = conversation
        ? {
            ...conversation,
            messages: [...conversation.messages, userMessage],
          }
        : {
            id: generateId(),
            messages: [userMessage],
            pendingActions: [],
            createdAt: new Date().toISOString(),
          };

      set({
        conversation: updatedConversation,
        isSendingMessage: true,
        error: null,
      });

      // Track AI message sent analytics
      analytics.trackAIMessageSent({
        intent,
        hasImage: !!selectedImage,
      });

      // Prepare image for API if present
      const imageForApi: AIImage | undefined = selectedImage
        ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType }
        : undefined;

      // Store message params for potential retry (before clearing image)
      const messageParams = {
        intent,
        message,
        context,
        image: selectedImage ? { ...selectedImage } : undefined,
      };

      // Clear selected image after capturing for send
      set({ selectedImage: null });

      try {
        // Send to AI service (with image if present)
        const response = await aiService.sendAIMessage(intent, message, context, imageForApi);

        const isRateLimited = response.type === 'error' && response.error?.code === 'RATE_LIMITED';
        const assistantContent =
          response.type === 'answer'
            ? response.answer?.text || ''
            : response.type === 'workout_proposal'
            ? response.workoutProposal?.summary || `Workout proposal: ${response.workoutProposal?.title ?? ''}`
            : response.type === 'workout_draft'
            ? response.message || (response.workoutDraft ? buildDraftSummaryFallback(response.workoutDraft) : '')
            : response.type === 'mutation_plan'
            ? response.mutationPlan?.explanation || ''
            : response.type === 'clarification'
            ? makeFriendlyClarification(response.clarification?.question, intent)
            : isRateLimited
            ? makeRateLimitMessage(response.error)
            : response.error?.message || 'An error occurred';

        // Create assistant message
        const assistantMessage: AIConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content: assistantContent,
          intent,
          mutationPlanId: response.mutationPlan?.requestId,
          createdAt: new Date().toISOString(),
          clarification: response.type === 'clarification' ? response.clarification : undefined,
          workoutProposal: response.type === 'workout_proposal' ? response.workoutProposal : undefined,
          workoutDraft: response.type === 'workout_draft' ? response.workoutDraft : undefined,
        };

        // Update conversation with assistant response
        const finalConversation: AIConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
        };

        // Track workout proposal event
        if (response.type === 'workout_proposal' && response.workoutProposal) {
          analytics.trackAIWorkoutProposed({
            exerciseCount: response.workoutProposal.exercises.length,
            intent,
          });
        }

        if (response.type === 'workout_draft' && response.workoutDraft) {
          await get().initializeWorkoutDraft(response.workoutDraft, assistantContent);
        }

        // Handle mutation plan
        if (response.type === 'mutation_plan' && response.mutationPlan) {
          set({
            conversation: finalConversation,
            currentMutationPlan: response.mutationPlan,
            isSendingMessage: false,
          });
        } else if (response.type === 'error') {
          if (isRateLimited) {
            set({
              conversation: finalConversation,
              error: null,
              lastFailedMessage: null,
              isSendingMessage: false,
            });
          } else {
            set({
              conversation: finalConversation,
              error: response.error?.message || 'An error occurred',
              isSendingMessage: false,
              lastFailedMessage: messageParams,
            });
          }
        } else if (response.type === 'clarification') {
          set({
            conversation: finalConversation,
            isSendingMessage: false,
          });
        } else {
          set({
            conversation: finalConversation,
            isSendingMessage: false,
          });
        }

        persistConversation();
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        set({ error: errorMessage, isSendingMessage: false, lastFailedMessage: messageParams });
        return {
          type: 'error',
          requestId: generateId(),
          error: {
            code: 'INTERNAL_ERROR',
            message: errorMessage,
            retryable: true,
          },
        } as AIResponse;
      }
    },

    initializeWorkoutDraft: async (draft, responseMessage) => {
      const { conversation } = get();
      const chatId = conversation?.id || generateId();
      const timestamp = new Date().toISOString();
      const pendingDraft: PendingWorkoutDraft = {
        id: generateId(),
        chatId,
        status: 'pending',
        draft,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      set({ pendingWorkoutDraft: pendingDraft });
      await setScopedItem(AI_WORKOUT_DRAFT_KEY, JSON.stringify(pendingDraft));
      await syncWorkoutDraftToSupabase(pendingDraft);

      analytics.trackAIWorkoutDraftCreated({
        exerciseCount: draft.exercises.length,
      });

      await get().resolvePendingWorkoutDraft(responseMessage);
    },

    loadPendingWorkoutDraft: async () => {
      try {
        const stored = await getScopedItem(AI_WORKOUT_DRAFT_KEY);
        if (stored) {
          const pending = JSON.parse(stored) as PendingWorkoutDraft;
          set({ pendingWorkoutDraft: pending });
          if (pending.status !== 'ready_to_save' || !pending.pendingResolution) {
            await get().resolvePendingWorkoutDraft();
          }
          return;
        }
        if (!isSupabaseConfigured()) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from('chat_workout_drafts')
          .select('*')
          .in('status', ['pending', 'awaiting_resolution', 'ready_to_save'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error || !data) return;
        const pending: PendingWorkoutDraft = {
          id: data.id,
          chatId: data.chat_id,
          status: data.status,
          draft: data.draft_payload,
          pendingResolution: undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        set({ pendingWorkoutDraft: pending });
        await setScopedItem(AI_WORKOUT_DRAFT_KEY, JSON.stringify(pending));
        if (pending.status !== 'ready_to_save') {
          await get().resolvePendingWorkoutDraft();
        }
      } catch (err) {
        console.error('Error loading workout draft:', err);
      }
    },

    clearPendingWorkoutDraft: () => {
      set({ pendingWorkoutDraft: null });
      removeScopedItem(AI_WORKOUT_DRAFT_KEY).catch((err) => {
        console.error('Error clearing workout draft:', err);
      });
    },

    processWorkoutDraftReply: async (intent, message) => {
      const pending = get().pendingWorkoutDraft;
      if (!pending) {
        return { handled: false };
      }

      const appendMessage = async (newMessage: AIConversationMessage) => {
        const { conversation } = get();
        const nextConversation: AIConversation = conversation
          ? { ...conversation, messages: [...conversation.messages, newMessage] }
          : {
              id: generateId(),
              messages: [newMessage],
              pendingActions: [],
              createdAt: new Date().toISOString(),
            };
        set({ conversation: nextConversation });
        await get().persistConversation();
      };

      const userMessage: AIConversationMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        intent,
        createdAt: new Date().toISOString(),
      };

      const replyIntent = parseDraftReply(message, {
        awaitingResolution: pending.status === 'awaiting_resolution' && !!pending.pendingResolution,
        maxOptions: pending.pendingResolution?.candidates.length ?? 0,
      });

      if (replyIntent.type === 'resolve' && pending.pendingResolution) {
        await appendMessage(userMessage);
        const selected = pending.pendingResolution.candidates[replyIntent.selectionIndex];
        const updatedDraft: WorkoutDraftV1 = {
          ...pending.draft,
          exercises: pending.draft.exercises.map((exercise, index) =>
            index === pending.pendingResolution?.exerciseIndex
              ? { ...exercise, resolved_exercise_id: selected.id, query: selected.name }
              : exercise
          ),
        };
        const updatedPending: PendingWorkoutDraft = {
          ...pending,
          draft: updatedDraft,
          updatedAt: new Date().toISOString(),
        };
        set({ pendingWorkoutDraft: updatedPending });
        await setScopedItem(AI_WORKOUT_DRAFT_KEY, JSON.stringify(updatedPending));
        analytics.trackAIWorkoutResolutionCompleted({
          exerciseIndex: pending.pendingResolution.exerciseIndex,
        });
        await get().resolvePendingWorkoutDraft();
        return { handled: true };
      }

      if (
        pending.status === 'awaiting_resolution'
        && pending.pendingResolution
        && pending.pendingResolution.candidates.length === 0
        && replyIntent.type === 'edit'
      ) {
        const trimmed = message.trim();
        if (trimmed) {
          await appendMessage(userMessage);
          const updatedDraft: WorkoutDraftV1 = {
            ...pending.draft,
            exercises: pending.draft.exercises.map((exercise, index) =>
              index === pending.pendingResolution?.exerciseIndex
                ? { ...exercise, query: trimmed, resolved_exercise_id: null }
                : exercise
            ),
          };
          const updatedPending: PendingWorkoutDraft = {
            ...pending,
            draft: updatedDraft,
            updatedAt: new Date().toISOString(),
          };
          set({ pendingWorkoutDraft: updatedPending });
          await setScopedItem(AI_WORKOUT_DRAFT_KEY, JSON.stringify(updatedPending));
          await get().resolvePendingWorkoutDraft();
          return { handled: true };
        }
      }

      if (replyIntent.type === 'cancel') {
        await appendMessage(userMessage);
        await syncWorkoutDraftToSupabase({ ...pending, status: 'canceled' });
        set({ pendingWorkoutDraft: null });
        await removeScopedItem(AI_WORKOUT_DRAFT_KEY);
        await appendMessage({
          id: generateId(),
          role: 'assistant',
          content: 'Got it. I will not save that draft.',
          createdAt: new Date().toISOString(),
        });
        analytics.trackAIWorkoutCanceled();
        return { handled: true };
      }

      if (replyIntent.type === 'confirm') {
        await appendMessage(userMessage);
        const result = await get().savePendingWorkoutDraft(replyIntent.saveAsTitle);
        if (!result.success) {
          await appendMessage({
            id: generateId(),
            role: 'assistant',
            content: result.message,
            createdAt: new Date().toISOString(),
          });
        }
        return { handled: true };
      }

      if (replyIntent.type === 'edit') {
        await syncWorkoutDraftToSupabase({ ...pending, status: 'canceled' });
        await get().clearPendingWorkoutDraft();
        return {
          handled: false,
          contextOverride: {
            chatMode: 'builder',
            workoutDraft: pending.draft,
          },
        };
      }

      if (pending.status === 'awaiting_resolution') {
        await appendMessage(userMessage);
        await appendMessage({
          id: generateId(),
          role: 'assistant',
          content: 'Reply with a number from the list, or tell me the change you want.',
          createdAt: new Date().toISOString(),
        });
        return { handled: true };
      }

      return { handled: false };
    },

    resolvePendingWorkoutDraft: async (responseMessage) => {
      const { pendingWorkoutDraft } = get();
      if (!pendingWorkoutDraft) return;

      let exerciseLibrary: ExerciseWithSource[] = [];
      try {
        exerciseLibrary = await ExerciseService.getAllExercises({ includeVariants: true });
      } catch (error) {
        console.warn('Failed to load exercise library for draft resolution:', error);
      }
      if (exerciseLibrary.length === 0) {
        await get().appendAssistantMessage(
          'I could not load your exercise library. Please try again in a moment.'
        );
        return;
      }

      const { draft: resolvedDraft, unresolved } = resolveWorkoutDraftExercises(
        pendingWorkoutDraft.draft,
        exerciseLibrary
      );

      const hasUnresolved = unresolved.length > 0;
      const nextResolution = hasUnresolved ? unresolved[0] : undefined;

      const updatedPending: PendingWorkoutDraft = {
        ...pendingWorkoutDraft,
        draft: resolvedDraft,
        pendingResolution: nextResolution,
        status: hasUnresolved ? 'awaiting_resolution' : 'ready_to_save',
        updatedAt: new Date().toISOString(),
      };

      set({ pendingWorkoutDraft: updatedPending });
      await setScopedItem(AI_WORKOUT_DRAFT_KEY, JSON.stringify(updatedPending));
      await syncWorkoutDraftToSupabase(updatedPending, unresolved);

      if (hasUnresolved && nextResolution) {
        analytics.trackAIWorkoutResolutionRequested({
          exerciseIndex: nextResolution.exerciseIndex,
          candidateCount: nextResolution.candidates.length,
          reason: nextResolution.reason,
        });

        const prompt = buildResolutionPrompt(nextResolution);
        await get().appendAssistantMessage(prompt);
        return;
      }

      const needsPrompt = !responseMessage || !/reply\\s+.+save/i.test(responseMessage);
      if (needsPrompt) {
        await get().appendAssistantMessage(
          'All set. Reply yes to save, or tell me changes or cancel.'
        );
      }
    },

    savePendingWorkoutDraft: async (saveAsTitle) => {
      const { pendingWorkoutDraft } = get();
      if (!pendingWorkoutDraft) {
        return { success: false, message: 'No draft to save.' };
      }

      if (pendingWorkoutDraft.status !== 'ready_to_save') {
        return { success: false, message: 'I still need to resolve a few exercises first.' };
      }

      const draft = pendingWorkoutDraft.draft;
      const title = saveAsTitle?.trim() || draft.title;
      if (draft.exercises.length > 12) {
        return { success: false, message: 'That draft has too many exercises to save.' };
      }

      let exerciseLibrary: ExerciseWithSource[] = [];
      try {
        exerciseLibrary = await ExerciseService.getAllExercises({ includeVariants: true });
      } catch (error) {
        console.warn('Failed to load exercise library for draft save:', error);
      }

      const exerciseMap = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise.name]));
      const exercisesToSave = draft.exercises.map((exercise) => {
        if (!exercise.resolved_exercise_id) {
          throw new Error(`Exercise "${exercise.query}" is not resolved`);
        }
        exercise.sets.forEach((set) => {
          if (set.sets <= 0 || set.sets > 10) {
            throw new Error(`Exercise "${exercise.query}" has an invalid set count`);
          }
        });
        const repsValues = exercise.sets.map((set) => set.reps);
        const uniqueReps = new Set(repsValues);
        const repsSummary = uniqueReps.size === 1 ? repsValues[0] : 'varied';
        const totalSets = exercise.sets.reduce((sum, set) => sum + set.sets, 0);
        const restSeconds = exercise.sets.find((set) => set.restSec !== undefined)?.restSec;
        const notes = exercise.exercise_notes?.trim();
        const canBuildSetDetails = repsValues.every((reps) => /^\\d+$/.test(reps.trim()));
        const setDetails = canBuildSetDetails
          ? exercise.sets.flatMap((set) =>
              Array.from({ length: set.sets }).map(() => ({
                weight: null,
                reps: Number(set.reps.trim()),
              }))
            )
          : undefined;

        return {
          exerciseId: exercise.resolved_exercise_id,
          exerciseName: exerciseMap.get(exercise.resolved_exercise_id) || exercise.query,
          sets: totalSets || 1,
          reps: repsSummary,
          restSeconds,
          notes: notes || undefined,
          setDetails,
        };
      });

      try {
        const createdId = await useProgramsStore.getState().createWorkoutTemplate(title, exercisesToSave, {
          description: draft.notes,
          isAiCreated: true,
          aiPayloadVersion: draft.type,
          aiSourceChatId: pendingWorkoutDraft.chatId,
        });

        if (!createdId) {
          return { success: false, message: 'Unable to save that template right now.' };
        }

        analytics.trackAIWorkoutSaved({
          exerciseCount: draft.exercises.length,
          templateId: createdId,
        });

        const savedPending: PendingWorkoutDraft = {
          ...pendingWorkoutDraft,
          status: 'saved',
          updatedAt: new Date().toISOString(),
        };
        await syncWorkoutDraftToSupabase(savedPending);

        set({ pendingWorkoutDraft: null });
        await removeScopedItem(AI_WORKOUT_DRAFT_KEY);

        const createdProgram = useProgramsStore.getState().programs.find(
          (program) => program.id === createdId
        );
        const savedName = createdProgram?.name || title;
        await get().appendAssistantMessage(
          `Saved as ${savedName}. You will find it in Programs -> Workouts.`
        );

        return { success: true, message: 'Saved.' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save that template.';
        return { success: false, message };
      }
    },

    appendAssistantMessage: async (content) => {
      const { conversation } = get();
      const assistantMessage: AIConversationMessage = {
        id: generateId(),
        role: 'assistant',
        content,
        createdAt: new Date().toISOString(),
      };
      const nextConversation: AIConversation = conversation
        ? { ...conversation, messages: [...conversation.messages, assistantMessage] }
        : {
            id: generateId(),
            messages: [assistantMessage],
            pendingActions: [],
            createdAt: new Date().toISOString(),
          };
      set({ conversation: nextConversation });
      await get().persistConversation();
    },

    // Image attachment actions
    setSelectedImage: (image) => {
      set({ selectedImage: image });
    },

    clearSelectedImage: () => {
      set({ selectedImage: null });
    },

    // Pending actions
    loadPendingActions: async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping pending actions load');
        return;
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('User not authenticated, skipping pending actions load');
        set({ pendingActions: [] });
        return;
      }

      set({ isLoading: true });
      try {
        const actions = await aiService.getPendingActions();
        set({ pendingActions: actions, isLoading: false });
      } catch (err) {
        console.error('Error loading pending actions:', err);
        set({ pendingActions: [], isLoading: false });
      }
    },

    confirmPendingAction: async (actionId) => {
      const result = await aiService.confirmPendingAction(actionId);
      if (result.success) {
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== actionId),
        }));
      } else {
        set({ error: result.error || 'Failed to confirm action' });
      }
      return result.success;
    },

    rejectPendingAction: async (actionId) => {
      const result = await aiService.rejectPendingAction(actionId);
      if (result.success) {
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== actionId),
          currentMutationPlan: null,
        }));
      } else {
        set({ error: result.error || 'Failed to reject action' });
      }
      return result.success;
    },

    setCurrentMutationPlan: (plan) => {
      set({ currentMutationPlan: plan });
      if (plan) {
        setScopedItem(AI_MUTATION_PLAN_KEY, JSON.stringify(plan)).catch((err) => {
          console.error('Error persisting mutation plan:', err);
        });
      } else {
        removeScopedItem(AI_MUTATION_PLAN_KEY).catch((err) => {
          console.error('Error clearing mutation plan:', err);
        });
      }
    },

    applyCurrentMutationPlan: async () => {
      const { currentMutationPlan, loadMutationHistory } = get();
      if (!currentMutationPlan) return false;

      set({ isApplyingMutation: true, error: null });
      try {
        const result = await aiService.applyMutationPlan(currentMutationPlan);
        if (result.success) {
          const pendingToConfirm = get().pendingActions.filter(
            (action) => action.requestId === currentMutationPlan.requestId
          );
          await Promise.all(
            pendingToConfirm.map((action) => get().confirmPendingAction(action.id))
          );
          set({
            currentMutationPlan: null,
            isApplyingMutation: false,
          });
          // Refresh mutation history
          loadMutationHistory();

          return true;
        } else {
          set({
            error: result.error || 'Failed to apply changes',
            isApplyingMutation: false,
          });
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to apply changes';
        set({ error: errorMessage, isApplyingMutation: false });
        return false;
      }
    },

    initEditableProgramDraft: (plan: AIMutationPlan) => {
      const draft = buildProgramDraftFromPlan(plan);
      set({ editableProgramDraft: draft });
      if (!hasInvalidDraftExercises(draft)) return;
      resolveDraftExerciseIds(draft).then((resolvedDraft) => {
        set((state) => {
          const currentDraft = state.editableProgramDraft;
          if (!currentDraft) return {};
          if (currentDraft.originalPlan.requestId !== draft.originalPlan.requestId) {
            return {};
          }
          return {
            editableProgramDraft: mergeResolvedDraft(currentDraft, resolvedDraft),
          };
        });
      });
    },

    updateProgramDraft: (updates) => {
      const { editableProgramDraft } = get();
      if (!editableProgramDraft) return;
      set({
        editableProgramDraft: {
          ...editableProgramDraft,
          ...updates,
        },
      });
    },

    updateProgramWorkout: (workoutId, updates) => {
      const { editableProgramDraft } = get();
      if (!editableProgramDraft) return;
      const updatedWorkouts = editableProgramDraft.workouts.map((workout) =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );
      set({
        editableProgramDraft: {
          ...editableProgramDraft,
          workouts: updatedWorkouts,
        },
      });
    },

    updateProgramExercise: (workoutId, exerciseId, updates) => {
      const { editableProgramDraft } = get();
      if (!editableProgramDraft) return;
      const updatedWorkouts = editableProgramDraft.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        const updatedExercises = workout.exercises.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, ...updates } : exercise
        );
        return { ...workout, exercises: updatedExercises };
      });
      set({
        editableProgramDraft: {
          ...editableProgramDraft,
          workouts: updatedWorkouts,
        },
      });
    },

    deleteProgramExercise: (workoutId, exerciseId) => {
      const { editableProgramDraft } = get();
      if (!editableProgramDraft) return;
      const updatedWorkouts = editableProgramDraft.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        const updatedExercises = workout.exercises.filter((exercise) => exercise.id !== exerciseId);
        return { ...workout, exercises: updatedExercises };
      });
      set({
        editableProgramDraft: {
          ...editableProgramDraft,
          workouts: updatedWorkouts,
        },
      });
    },

    applyEditableProgramDraft: async () => {
      const { editableProgramDraft, loadMutationHistory } = get();
      if (!editableProgramDraft) return false;

      set({ isApplyingMutation: true, error: null });

      try {
        // Check authentication before attempting save
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          set({
            error: 'Please sign in to save templates and programs.',
            isApplyingMutation: false,
          });
          return false;
        }

        const resolvedDraft = await resolveDraftExerciseIds(editableProgramDraft);
        set({ editableProgramDraft: resolvedDraft });

        const invalidExercise = resolvedDraft.workouts
          .flatMap((workout) => workout.exercises)
          .find((exercise) => !isValidUUID(exercise.exerciseId));
        if (invalidExercise) {
          set({
            error: 'Select valid exercises before saving this draft.',
            isApplyingMutation: false,
          });
          return false;
        }

        const newPlan = buildPlanFromProgramDraft(resolvedDraft);
        const result = await aiService.applyMutationPlan(newPlan);
        if (result.success) {
          const pendingToConfirm = get().pendingActions.filter(
            (action) => action.requestId === editableProgramDraft.originalPlan.requestId
          );
          await Promise.all(
            pendingToConfirm.map((action) => get().confirmPendingAction(action.id))
          );
          set({
            editableProgramDraft: null,
            currentMutationPlan: null,
            isApplyingMutation: false,
          });
          loadMutationHistory();

          // Refresh programs store to show newly created template/program
          try {
            await useProgramsStore.getState().fetchPrograms({ force: true });
          } catch (refreshErr) {
            // Mutations were applied successfully, but refresh failed
            // User can manually refresh or restart app
            console.warn('Programs refresh failed after save:', refreshErr);
          }

          return true;
        }
        set({
          error: result.error || 'Failed to apply changes',
          isApplyingMutation: false,
        });
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to apply changes';
        set({ error: errorMessage, isApplyingMutation: false });
        return false;
      }
    },

    clearEditableProgramDraft: () => {
      set({ editableProgramDraft: null });
    },

    // Mutation history (undo)
    loadMutationHistory: async () => {
      try {
        const history = await aiService.getMutationHistory();
        set({ mutationHistory: history });
      } catch (err) {
        console.error('Error loading mutation history:', err);
      }
    },

    undoMutation: async (mutationId) => {
      const result = await aiService.undoMutation(mutationId);
      if (result.success) {
        // Refresh history
        get().loadMutationHistory();
      } else {
        set({ error: result.error || 'Failed to undo' });
      }
      return result.success;
    },

    // Rate limits
    checkRateLimits: async () => {
      try {
        const status = await aiService.getRateLimitStatus();
        set({ rateLimitStatus: status });
      } catch (err) {
        console.error('Error checking rate limits:', err);
      }
    },

    // Persistence
    loadConversation: async () => {
      try {
        const stored = await getScopedItem(AI_CONVERSATION_KEY);
        if (stored) {
          const conversation = JSON.parse(stored) as AIConversation;
          set({ conversation });
        } else {
          // Create new conversation
          const newConversation: AIConversation = {
            id: generateId(),
            messages: [],
            pendingActions: [],
            createdAt: new Date().toISOString(),
          };
          set({ conversation: newConversation });
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        // Create new conversation on error
        const newConversation: AIConversation = {
          id: generateId(),
          messages: [],
          pendingActions: [],
          createdAt: new Date().toISOString(),
        };
        set({ conversation: newConversation });
      }
    },

    persistConversation: async () => {
      const { conversation } = get();
      if (conversation) {
        try {
          // Only keep last 50 messages to prevent storage bloat
          const trimmedConversation: AIConversation = {
            ...conversation,
            messages: conversation.messages.slice(-50),
          };
          await setScopedItem(
            AI_CONVERSATION_KEY,
            JSON.stringify(trimmedConversation)
          );
        } catch (err) {
          console.error('Error persisting conversation:', err);
        }
      }
    },

    loadMutationPlan: async () => {
      try {
        const stored = await getScopedItem(AI_MUTATION_PLAN_KEY);
        if (stored) {
          const plan = JSON.parse(stored) as AIMutationPlan;
          set({ currentMutationPlan: plan });
        }
      } catch (err) {
        console.error('Error loading mutation plan:', err);
      }
    },

    // Error handling
    clearError: () => {
      set({ error: null });
    },

    retryLastMessage: async () => {
      const { lastFailedMessage, sendMessage } = get();
      if (!lastFailedMessage) return null;

      // Restore image if it was part of the failed message
      if (lastFailedMessage.image) {
        set({ selectedImage: lastFailedMessage.image });
      }

      // Clear the failed message before retrying
      set({ lastFailedMessage: null, error: null });

      // Retry the message
      return sendMessage(
        lastFailedMessage.intent,
        lastFailedMessage.message,
        lastFailedMessage.context
      );
    },

    clearLastFailedMessage: () => {
      set({ lastFailedMessage: null });
    },

    resetStore: () => {
      set({
        conversation: null,
        isConversationOpen: false,
        isLoading: false,
        isSendingMessage: false,
        isApplyingMutation: false,
        selectedImage: null,
        pendingActions: [],
        currentMutationPlan: null,
        mutationHistory: [],
        editableProgramDraft: null,
        rateLimitStatus: null,
        error: null,
        lastFailedMessage: null,
      });
      removeScopedItem(AI_MUTATION_PLAN_KEY).catch((err) => {
        console.error('Error clearing mutation plan:', err);
      });
    },
  }))
);

// ============================================
// Selectors
// ============================================

/**
 * Select whether user has pending AI actions
 */
export const selectHasPendingActions = (state: AIState) =>
  state.pendingActions.length > 0;

/**
 * Select whether a mutation plan is ready for confirmation
 */
export const selectHasMutationPlan = (state: AIState) =>
  state.currentMutationPlan !== null;

/**
 * Select recent messages from conversation
 */
export const selectRecentMessages = (state: AIState, count = 10) =>
  state.conversation?.messages.slice(-count) || [];

/**
 * Select undoable mutations (not yet undone)
 */
export const selectUndoableMutations = (state: AIState) =>
  state.mutationHistory.filter((m) => !m.isUndone);

/**
 * Select whether user is rate limited
 */
export const selectIsRateLimited = (state: AIState) => {
  const status = state.rateLimitStatus;
  if (!status) return false;
  return !status.allowed;
};
