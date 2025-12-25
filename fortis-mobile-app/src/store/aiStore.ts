/**
 * AI Store (Zustand)
 *
 * Central state management for AI assistant features.
 * Handles conversation history, pending actions, and UI state.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  AIIntent,
  AIImage,
  AIImageMimeType,
  AIResponse,
  AIConversation,
  AIConversationMessage,
  AIPendingAction,
  AIMutationPlan,
  AIMutation,
  AIMutationRecord,
  AIRateLimitStatus,
  EditableWorkout,
  EditableExercise,
  EditableWorkoutSet,
  EditableProgramDraft,
  EditableProgramWorkout,
  EditableProgramExercise,
} from '../types/ai';
import * as aiService from '../services/aiService';
import { AI_CONVERSATION_KEY } from '../constants/storageKeys';
import { useProgramsStore } from './programsStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { buildProgramDraftFromPlan, buildPlanFromProgramDraft } from '../utils/aiProgramDraft';

// Simple UUID generator
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

  // Editable workout (for editing AI-extracted workouts before saving)
  editableWorkout: EditableWorkout | null;

  // Editable program/template draft (for CREATE_* intents)
  editableProgramDraft: EditableProgramDraft | null;

  // Rate limiting
  rateLimitStatus: AIRateLimitStatus | null;

  // Error state
  error: string | null;

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
  askAboutOverload: (question: string) => Promise<AIResponse>;
  explainExercise: (exerciseId: string) => Promise<AIResponse>;
  requestProgram: (description: string, historyOnly?: boolean) => Promise<AIResponse>;
  requestTemplate: (description: string, historyOnly?: boolean) => Promise<AIResponse>;
  logWorkout: (description: string) => Promise<AIResponse>;

  // Actions - Pending actions
  loadPendingActions: () => Promise<void>;
  confirmPendingAction: (actionId: string) => Promise<boolean>;
  rejectPendingAction: (actionId: string) => Promise<boolean>;
  setCurrentMutationPlan: (plan: AIMutationPlan | null) => void;
  applyCurrentMutationPlan: () => Promise<boolean>;

  // Actions - Editable workout (for LOG_WORKOUT mutations)
  initEditableWorkout: (plan: AIMutationPlan) => void;
  initEditableProgramDraft: (plan: AIMutationPlan) => void;
  updateExerciseName: (localExerciseId: string, newExerciseDbId: string, newName: string) => void;
  deleteExercise: (localExerciseId: string) => void;
  addExercise: (exerciseDbId: string, exerciseName: string) => void;
  updateSet: (localExerciseId: string, setId: string, updates: Partial<EditableWorkoutSet>) => void;
  deleteSet: (localExerciseId: string, setId: string) => void;
  addSet: (localExerciseId: string) => void;
  applyEditableWorkout: () => Promise<boolean>;
  clearEditableWorkout: () => void;

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
  persistConversation: () => Promise<void>;
  resetStore: () => void;

  // Actions - Error handling
  clearError: () => void;
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
    editableWorkout: null,
    editableProgramDraft: null,
    rateLimitStatus: null,
    error: null,

    // Conversation actions
    openConversation: () => {
      const { conversation, loadConversation, loadPendingActions } = get();
      if (!conversation) {
        loadConversation();
      }
      loadPendingActions();
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
              ? response.clarification?.question || ''
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
        set({ error: errorMessage, isSendingMessage: false });
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

    askAboutOverload: async (question) => {
      return get().sendMessage('ANALYZE_OVERLOAD', question);
    },

    explainExercise: async (exerciseId) => {
      return get().sendMessage(
        'EXPLAIN_EXERCISE',
        'Explain this exercise with proper form and common mistakes.',
        { exerciseId }
      );
    },

    requestProgram: async (description, historyOnly) => {
      return get().sendMessage('CREATE_PROGRAM', description, { historyOnly });
    },

    requestTemplate: async (description, historyOnly) => {
      return get().sendMessage('CREATE_TEMPLATE', description, { historyOnly });
    },

    logWorkout: async (description) => {
      // Uses selectedImage if set, sendMessage will handle it
      return get().sendMessage('LOG_WORKOUT', description);
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
    },

    applyCurrentMutationPlan: async () => {
      const { currentMutationPlan, loadMutationHistory } = get();
      if (!currentMutationPlan) return false;

      set({ isApplyingMutation: true, error: null });
      try {
        const result = await aiService.applyMutationPlan(currentMutationPlan);
        if (result.success) {
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
            intent === 'CREATE_TEMPLATE' ||
            intent === 'MODIFY_PROGRAM' ||
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

    // Editable workout actions (for LOG_WORKOUT mutations)
    initEditableWorkout: (plan: AIMutationPlan) => {
      // Parse mutation plan into editable workout structure
      // Group workout_set mutations by exercise_id
      const setMutations = plan.mutations.filter(
        (m) => m.entityType === 'workout_set' && m.operation === 'INSERT'
      );

      // Group by exercise_id
      const exerciseMap = new Map<string, { exerciseName: string; sets: EditableWorkoutSet[] }>();

      for (const mutation of setMutations) {
        const state = mutation.proposedState as Record<string, unknown>;
        const exerciseId = state.exercise_id as string;

        // Find exercise name from resolution or proposed state
        const resolution = plan.exerciseResolution.find((r) => r.exerciseId === exerciseId);
        const exerciseName = resolution?.exerciseName || (state.exercise_name as string) || 'Unknown Exercise';

        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, { exerciseName, sets: [] });
        }

        const setData: EditableWorkoutSet = {
          id: generateId(),
          reps: (state.reps as number) || 0,
          weight: (state.weight as number) || 0,
          rpe: state.rpe as number | undefined,
        };

        exerciseMap.get(exerciseId)!.sets.push(setData);
      }

      // Convert to EditableExercise array
      const exercises: EditableExercise[] = [];
      exerciseMap.forEach((data, exerciseId) => {
        exercises.push({
          id: generateId(),
          exerciseId,
          exerciseName: data.exerciseName,
          sets: data.sets,
        });
      });

      set({
        editableWorkout: {
          exercises,
          originalPlan: plan,
        },
      });
    },

    initEditableProgramDraft: (plan: AIMutationPlan) => {
      const draft = buildProgramDraftFromPlan(plan);
      set({ editableProgramDraft: draft });
    },

    updateExerciseName: (localExerciseId: string, newExerciseDbId: string, newName: string) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const updatedExercises = editableWorkout.exercises.map((exercise) =>
        exercise.id === localExerciseId
          ? { ...exercise, exerciseId: newExerciseDbId, exerciseName: newName }
          : exercise
      );

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: updatedExercises,
        },
      });
    },

    deleteExercise: (localExerciseId: string) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const updatedExercises = editableWorkout.exercises.filter(
        (exercise) => exercise.id !== localExerciseId
      );

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: updatedExercises,
        },
      });
    },

    addExercise: (exerciseDbId: string, exerciseName: string) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const newExercise: EditableExercise = {
        id: generateId(),
        exerciseId: exerciseDbId,
        exerciseName,
        sets: [{ id: generateId(), reps: 0, weight: 0 }],
      };

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: [...editableWorkout.exercises, newExercise],
        },
      });
    },

    updateSet: (localExerciseId: string, setId: string, updates: Partial<EditableWorkoutSet>) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const updatedExercises = editableWorkout.exercises.map((exercise) => {
        if (exercise.id !== localExerciseId) return exercise;

        const updatedSets = exercise.sets.map((s) =>
          s.id === setId ? { ...s, ...updates } : s
        );

        return { ...exercise, sets: updatedSets };
      });

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: updatedExercises,
        },
      });
    },

    deleteSet: (localExerciseId: string, setId: string) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const updatedExercises = editableWorkout.exercises.map((exercise) => {
        if (exercise.id !== localExerciseId) return exercise;

        const updatedSets = exercise.sets.filter((s) => s.id !== setId);
        return { ...exercise, sets: updatedSets };
      });

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: updatedExercises,
        },
      });
    },

    addSet: (localExerciseId: string) => {
      const { editableWorkout } = get();
      if (!editableWorkout) return;

      const updatedExercises = editableWorkout.exercises.map((exercise) => {
        if (exercise.id !== localExerciseId) return exercise;

        // Copy values from last set as defaults
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: EditableWorkoutSet = {
          id: generateId(),
          reps: lastSet?.reps || 0,
          weight: lastSet?.weight || 0,
          rpe: lastSet?.rpe,
        };

        return { ...exercise, sets: [...exercise.sets, newSet] };
      });

      set({
        editableWorkout: {
          ...editableWorkout,
          exercises: updatedExercises,
        },
      });
    },

    applyEditableWorkout: async () => {
      const { editableWorkout, loadMutationHistory } = get();
      if (!editableWorkout) return false;

      set({ isApplyingMutation: true, error: null });

      try {
        // Build new mutation plan from edited workout
        const mutations: AIMutation[] = [];
        let order = 0;

        // First, create the workout_session mutation
        const sessionId = generateId();
        const sessionMutation: AIMutation = {
          mutationId: generateId(),
          order: order++,
          operation: 'INSERT',
          entityType: 'workout_session',
          proposedState: {
            id: sessionId,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            status: 'completed',
          },
          description: 'Create workout session from AI extraction',
        };
        mutations.push(sessionMutation);

        // Then, create workout_set mutations for each exercise and set
        for (const exercise of editableWorkout.exercises) {
          // Skip exercises with no sets
          if (exercise.sets.length === 0) continue;

          for (let i = 0; i < exercise.sets.length; i++) {
            const setData = exercise.sets[i];
            const setMutation: AIMutation = {
              mutationId: generateId(),
              order: order++,
              operation: 'INSERT',
              entityType: 'workout_set',
              proposedState: {
                session_id: `ref:${sessionMutation.mutationId}`,
                exercise_id: exercise.exerciseId,
                set_number: i + 1,
                reps: setData.reps,
                weight: setData.weight,
                rpe: setData.rpe,
                set_type: 'working',
              },
              description: `${exercise.exerciseName}: ${setData.reps} reps @ ${setData.weight} lbs`,
              dependsOn: [sessionMutation.mutationId],
            };
            mutations.push(setMutation);
          }
        }

        // Build new plan
        const newPlan: AIMutationPlan = {
          ...editableWorkout.originalPlan,
          mutations,
          exerciseResolution: editableWorkout.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            exerciseName: e.exerciseName,
            fromHistory: true, // Assume user-edited exercises are valid
          })),
        };

        // Apply the plan
        const result = await aiService.applyMutationPlan(newPlan);
        if (result.success) {
          set({
            editableWorkout: null,
            currentMutationPlan: null,
            isApplyingMutation: false,
          });
          loadMutationHistory();
          return true;
        } else {
          set({
            error: result.error || 'Failed to save workout',
            isApplyingMutation: false,
          });
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save workout';
        set({ error: errorMessage, isApplyingMutation: false });
        return false;
      }
    },

    clearEditableWorkout: () => {
      set({ editableWorkout: null });
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
        const newPlan = buildPlanFromProgramDraft(editableProgramDraft);
        const result = await aiService.applyMutationPlan(newPlan);
        if (result.success) {
          set({
            editableProgramDraft: null,
            currentMutationPlan: null,
            isApplyingMutation: false,
          });
          loadMutationHistory();
          useProgramsStore.getState().fetchPrograms();
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

    // Error handling
    clearError: () => {
      set({ error: null });
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
        editableWorkout: null,
        editableProgramDraft: null,
        rateLimitStatus: null,
        error: null,
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
