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
} from '../types/ai';
import * as aiService from '../services/aiService';
import * as ExerciseService from '../services/exerciseService';
import { AI_CONVERSATION_KEY, AI_MUTATION_PLAN_KEY } from '../constants/storageKeys';
import { analytics } from '../services/analyticsService';
import { useProgramsStore } from './programsStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { buildProgramDraftFromPlan, buildPlanFromProgramDraft } from '../utils/aiProgramDraft';
import { generateSecureUUID as generateId } from '../utils/uuid';

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

  // Actions - Conversation
  openConversation: () => void;
  closeConversation: () => void;
  clearConversation: () => void;
  sendMessage: (intent: AIIntent, message: string, context?: AIRequestContext) => Promise<AIResponse>;

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

    // Conversation actions
    openConversation: () => {
      const { conversation, loadConversation, loadPendingActions, loadMutationPlan } = get();
      if (!conversation) {
        loadConversation();
      }
      loadPendingActions();
      loadMutationPlan();
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
      set({ conversation: newConversation, currentMutationPlan: null, error: null });
      get().persistConversation();
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
        };

        // Update conversation with assistant response
        const finalConversation: AIConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
        };

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
