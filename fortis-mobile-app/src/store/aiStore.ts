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
  AIResponse,
  AIConversation,
  AIConversationMessage,
  AIPendingAction,
  AIMutationPlan,
  AIMutationRecord,
  AIRateLimitStatus,
  EditableProgramDraft,
  EditableProgramWorkout,
  EditableProgramExercise,
} from '../types/ai';
import * as aiService from '../services/aiService';
import { AI_CONVERSATION_KEY, AI_MUTATION_PLAN_KEY } from '../constants/storageKeys';
import { useProgramsStore } from './programsStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { buildProgramDraftFromPlan, buildPlanFromProgramDraft } from '../utils/aiProgramDraft';
import { isWriteIntent } from '../services/aiService';

// Simple UUID generator
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const makeFriendlyClarification = (question: string | undefined, intent: AIIntent): string => {
  const normalized = (question || '').toLowerCase();
  const looksSystemy =
    normalized.includes('cannot proceed') ||
    normalized.includes('requirements') ||
    normalized.includes('mutation') ||
    normalized.includes('clarif');

  if (!isWriteIntent(intent)) {
    return question || 'Could you share a bit more detail so I can help?';
  }

  if (intent === 'CREATE_TEMPLATE') {
    return looksSystemy || !question
      ? 'Got it — I can build a template. Quick questions: what’s your main goal, how many days per week, and any equipment or preferences?'
      : `Got it — ${question}`;
  }

  if (intent === 'CREATE_PROGRAM') {
    return looksSystemy || !question
      ? 'Awesome — I can draft a program. What’s your goal, how many days per week, and how long should it run?'
      : `Awesome — ${question}`;
  }

  if (intent === 'MODIFY_TEMPLATE') {
    return looksSystemy || !question
      ? 'Got it — what should I change in your template (exercises, sets/reps, or rest)?'
      : `Got it — ${question}`;
  }

  if (intent === 'MODIFY_PROGRAM') {
    return looksSystemy || !question
      ? 'Got it — what should I change in your program (exercises, sets/reps, days, or focus)?'
      : `Got it — ${question}`;
  }

  return looksSystemy || !question
    ? 'I can help with that — what details should I use?'
    : `Quick check — ${question}`;
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
    context?: {
      exerciseId?: string;
      programId?: string;
      templateId?: string;
      periodWeeks?: number;
      historyOnly?: boolean;
    };
    image?: { uri: string; base64: string; mimeType: AIImageMimeType };
  } | null;

  // Actions - Conversation
  openConversation: () => void;
  closeConversation: () => void;
  clearConversation: () => void;
  sendMessage: (intent: AIIntent, message: string, context?: {
    exerciseId?: string;
    programId?: string;
    templateId?: string;
    periodWeeks?: number;
    historyOnly?: boolean;
  }) => Promise<AIResponse>;

  // Actions - Image attachment
  setSelectedImage: (image: { uri: string; base64: string; mimeType: AIImageMimeType }) => void;
  clearSelectedImage: () => void;

  // Actions - Quick queries (shortcuts for common intents)
  askAboutStats: (question: string) => Promise<AIResponse>;
  askAboutPlateau: (question: string, exerciseId?: string) => Promise<AIResponse>;
  requestProgramUpdate: (programId: string, modifications: string, historyOnly?: boolean) => Promise<AIResponse>;
  requestProgram: (description: string, historyOnly?: boolean) => Promise<AIResponse>;
  requestTemplate: (description: string, historyOnly?: boolean) => Promise<AIResponse>;

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

        // Create assistant message
        const assistantMessage: AIConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            response.type === 'answer'
              ? response.answer?.text || ''
              : response.type === 'mutation_plan'
              ? response.mutationPlan?.explanation || ''
              : response.type === 'clarification'
              ? makeFriendlyClarification(response.clarification?.question, intent)
              : response.error?.message || 'An error occurred',
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
          set({
            conversation: finalConversation,
            error: response.error?.message || 'An error occurred',
            isSendingMessage: false,
            lastFailedMessage: messageParams,
          });
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

    // Quick query shortcuts
    askAboutStats: async (question) => {
      return get().sendMessage('QUERY_STATS', question);
    },

    askAboutPlateau: async (question, exerciseId) => {
      return get().sendMessage('ANALYZE_PLATEAU', question, { exerciseId });
    },

    requestProgramUpdate: async (programId, modifications, historyOnly) => {
      return get().sendMessage('MODIFY_PROGRAM', modifications, { programId, historyOnly });
    },

    requestProgram: async (description, historyOnly) => {
      return get().sendMessage('CREATE_PROGRAM', description, { historyOnly });
    },

    requestTemplate: async (description, historyOnly) => {
      return get().sendMessage('CREATE_TEMPLATE', description, { historyOnly });
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

          // Refresh programs store if this was a program/template creation
          const intent = currentMutationPlan.intent;
          if (
            intent === 'CREATE_PROGRAM' ||
            intent === 'MODIFY_PROGRAM' ||
            intent === 'CREATE_TEMPLATE' ||
            intent === 'MODIFY_TEMPLATE'
          ) {
            useProgramsStore.getState().fetchPrograms({ force: true });
          }

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

        const invalidExercise = editableProgramDraft.workouts
          .flatMap((workout) => workout.exercises)
          .find((exercise) => !isValidUUID(exercise.exerciseId));
        if (invalidExercise) {
          set({
            error: 'Select valid exercises before saving this draft.',
            isApplyingMutation: false,
          });
          return false;
        }

        const newPlan = buildPlanFromProgramDraft(editableProgramDraft);
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
