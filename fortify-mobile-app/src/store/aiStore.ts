/**
 * AI Store (Zustand)
 *
 * Central state management for AI assistant features.
 */
import { create } from 'zustand';
import { posthog } from '@/src/config/posthog';
import { subscribeWithSelector } from 'zustand/middleware';
import { setScopedItem, removeScopedItem } from '@/src/utils/scopedStorage';
import {
  AIIntent,
  AIError,
  AIResponse,
  AIClarification,
  AIConversation,
  AIConversationMessage,
  AIChatMessage,
  AIRequestContext,
  AIRateLimitStatus,
  AIRateLimitWindow,
  AIWorkoutTemplate,
  AIWorkoutTemplateExercise,
  AIImage,
  AIAttachmentDisplay,
} from '../types/ai';
import * as aiService from '../services/aiService';
import { AI_CONVERSATION_KEY } from '../constants/storageKeys';
import { generateSecureUUID as generateId } from '../utils/uuid';
import { completeNewUserChecklistTask } from '../utils/newUserChecklist';

const makeFriendlyClarification = (question: string | undefined): string => {
  return question || 'Could you share a bit more detail so I can help?';
};

const CONTEXT_TOO_LARGE_MESSAGE =
  'That edit pulled in too much context. I trimmed it down, please try again.';
const GENERIC_AI_ERROR_MESSAGE = 'Something went wrong on the AI side. Please try again.';

const looksLikeRawProviderPayload = (message: string): boolean => {
  const normalized = message.trim();
  if (!normalized) return false;

  return (
    /OpenAI API error/i.test(normalized)
    || /context_length_exceeded/i.test(normalized)
    || /invalid_request_error/i.test(normalized)
    || /maximum context length/i.test(normalized)
    || /"error"\s*:\s*\{/i.test(normalized)
    || /"message"\s*:\s*"/i.test(normalized)
    || /```/.test(normalized)
    || /^\s*\{[\s\S]*\}\s*$/.test(normalized)
  );
};

const makeFriendlyAIErrorMessage = (error?: AIError): string => {
  const message = error?.message?.trim() || '';
  const code = error?.code?.trim() || '';

  if (
    /CONTEXT_TOO_LARGE/i.test(code)
    || /context_length_exceeded/i.test(code)
    || /context_length_exceeded/i.test(message)
    || /maximum context length/i.test(message)
  ) {
    return CONTEXT_TOO_LARGE_MESSAGE;
  }

  if (!message || looksLikeRawProviderPayload(message)) {
    return GENERIC_AI_ERROR_MESSAGE;
  }

  return message;
};

const makeSafeAssistantText = (message: string | undefined): string => {
  const text = message?.trim() || '';
  if (!text) return '';
  return looksLikeRawProviderPayload(text) ? GENERIC_AI_ERROR_MESSAGE : text;
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

const MAX_HISTORY_MESSAGES = 20;

const WORKOUT_FOCUS_LABELS = [
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push',
  'Pull',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Abs',
  'Glutes',
  'Legs',
  'Quads',
  'Hamstrings',
  'Calves',
  'Lats',
  'Traps',
] as const;

const WORKOUT_FOCUS_DISPLAY_LABELS: Record<string, string> = {
  upper_back: 'upper back',
  lower_back: 'lower back',
  upper_body: 'upper body',
  lower_body: 'lower body',
  full_body: 'full body',
  hip_flexors: 'hip flexors',
  adductors: 'adductors',
  abductors: 'abductors',
  forearms: 'forearms',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  calves: 'calves',
  quads: 'quads',
  quadriceps: 'quadriceps',
  lats: 'lats',
  traps: 'traps',
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  arms: 'arms',
  biceps: 'biceps',
  triceps: 'triceps',
  core: 'core',
  abs: 'abs',
};

const WORKOUT_FOCUS_NAME_PATTERN = new RegExp(
  `\\b(${WORKOUT_FOCUS_LABELS.map((label) => label.replace(/\s+/g, '[\\s_-]+')).join('|')})\\b`,
  'i'
);

const normalizeWorkoutDisplayText = (text: string | undefined): string | undefined => {
  if (!text) return undefined;

  return text
    .replace(/\b[a-z]+(?:_[a-z]+)+\b/gi, (match) => {
      const normalizedKey = match.toLowerCase();
      return WORKOUT_FOCUS_DISPLAY_LABELS[normalizedKey] ?? match.replace(/_/g, ' ');
    })
    .replace(/\s+/g, ' ')
    .trim();
};

const stripGeneratedWorkoutDuplicateSuffix = (name: string): string => {
  return name.replace(/\s+\(\d+\)\s*$/, '').trim();
};

const inferWorkoutFocusLabel = (message: string): string | null => {
  const normalized = message.toLowerCase();
  const checks: Array<[RegExp, string]> = [
    [/\bupper\s+body\b/, 'Upper Body'],
    [/\blower\s+body\b/, 'Lower Body'],
    [/\bfull\s+body\b/, 'Full Body'],
    [/\bpush\b/, 'Push'],
    [/\bpull\b/, 'Pull'],
    [/\bchest|pecs?\b/, 'Chest'],
    [/\bback|latissimus|rows?\b/, 'Back'],
    [/\blats?\b/, 'Lats'],
    [/\btraps?|trapezius\b/, 'Traps'],
    [/\bshoulders?|delts?\b/, 'Shoulders'],
    [/\bbiceps?\b/, 'Biceps'],
    [/\btriceps?\b/, 'Triceps'],
    [/\bforearms?\b/, 'Forearms'],
    [/\barms?|biceps?|triceps?\b/, 'Arms'],
    [/\bcore|abs?\b/, 'Core'],
    [/\bglutes?\b/, 'Glutes'],
    [/\bquads?|quadriceps\b/, 'Quads'],
    [/\bhamstrings?\b/, 'Hamstrings'],
    [/\bcal(f|ves)\b/, 'Calves'],
    [/\blegs?\b/, 'Legs'],
  ];

  return checks.find(([pattern]) => pattern.test(normalized))?.[1] ?? null;
};

const isExplicitNewWorkoutRequest = (message: string): boolean => {
  const normalized = message.toLowerCase();
  const asksForWorkout =
    /\b(workout|routine|session|plan|training\s+day|lift)\b/.test(normalized);
  const hasCreationVerb =
    /\b(make|create|build|generate|design|craft|write|plan|give|need|want)\b/.test(normalized);
  const hasEditIntent =
    /\b(edit|update|change|modify|replace|rename|add|remove|swap|turn\s+it|make\s+it)\b/.test(normalized);

  return asksForWorkout && hasCreationVerb && !hasEditIntent;
};

const workoutNameMatchesFocus = (name: string, focus: string): boolean => {
  const focusPattern = new RegExp(`\\b${focus.replace(/\s+/g, '[\\s_-]+')}\\b`, 'i');
  return focusPattern.test(name);
};

const makeWorkoutNameForFocus = (name: string, focus: string): string => {
  const cleanedName = stripGeneratedWorkoutDuplicateSuffix(name);
  const modifier = /\bstrength\b/i.test(cleanedName)
    ? 'Strength '
    : /\bhypertrophy\b/i.test(cleanedName)
      ? 'Hypertrophy '
      : /\bconditioning\b/i.test(cleanedName)
        ? 'Conditioning '
        : '';

  return `${focus} ${modifier}Workout`.replace(/\s+/g, ' ').trim();
};

const normalizeWorkoutTemplateForRequest = (
  template: AIWorkoutTemplate,
  message: string,
  responseType: AIResponse['type']
): AIWorkoutTemplate => {
  const requestedFocus = inferWorkoutFocusLabel(message);
  const shouldTreatAsNewWorkout = responseType === 'answer' && isExplicitNewWorkoutRequest(message);
  const normalizedName = stripGeneratedWorkoutDuplicateSuffix(
    normalizeWorkoutDisplayText(template.name) ?? template.name
  );
  const normalizedDescription = normalizeWorkoutDisplayText(template.description);
  const normalizedFocus = normalizeWorkoutDisplayText(template.focus);

  if (!shouldTreatAsNewWorkout || !requestedFocus) {
    return {
      ...template,
      name: normalizedName,
      description: normalizedDescription,
      focus: normalizedFocus,
    };
  }

  const containsDifferentWorkoutFocus =
    WORKOUT_FOCUS_NAME_PATTERN.test(normalizedName)
    && !workoutNameMatchesFocus(normalizedName, requestedFocus);
  const name = containsDifferentWorkoutFocus
    ? makeWorkoutNameForFocus(normalizedName, requestedFocus)
    : normalizedName;

  return {
    ...template,
    name,
    description: normalizedDescription,
    focus: requestedFocus,
  };
};

const normalizeWorkoutTemplateExercise = (
  exercise: unknown
): AIWorkoutTemplateExercise | null => {
  if (!exercise || typeof exercise !== 'object') {
    return null;
  }

  const candidate = exercise as Partial<AIWorkoutTemplateExercise>;
  const exerciseId = typeof candidate.exerciseId === 'string' ? candidate.exerciseId.trim() : '';
  const exerciseName = typeof candidate.exerciseName === 'string' ? candidate.exerciseName.trim() : '';
  const sets = typeof candidate.sets === 'number'
    ? candidate.sets
    : typeof candidate.sets === 'string'
      ? Number.parseInt(candidate.sets, 10)
      : Number.NaN;
  const reps = typeof candidate.reps === 'string' ? candidate.reps.trim() : String(candidate.reps ?? '').trim();

  if (!exerciseId || !exerciseName || !Number.isFinite(sets) || sets <= 0 || !reps) {
    return null;
  }

  return {
    exerciseId,
    exerciseName,
    sets: Math.max(1, Math.round(sets)),
    reps,
    restSeconds: typeof candidate.restSeconds === 'number'
      ? Math.max(0, Math.round(candidate.restSeconds))
      : undefined,
    notes: typeof candidate.notes === 'string' ? candidate.notes : undefined,
  };
};

const normalizeWorkoutTemplate = (template: unknown): AIWorkoutTemplate | undefined => {
  if (!template || typeof template !== 'object') {
    return undefined;
  }

  const candidate = template as Partial<AIWorkoutTemplate>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const exercises = Array.isArray(candidate.exercises)
    ? candidate.exercises
        .map(normalizeWorkoutTemplateExercise)
        .filter((exercise): exercise is AIWorkoutTemplateExercise => Boolean(exercise))
    : [];

  if (!name || exercises.length === 0) {
    return undefined;
  }

  return {
    name,
    description: typeof candidate.description === 'string' ? candidate.description.trim() : undefined,
    focus: typeof candidate.focus === 'string' ? candidate.focus.trim() : undefined,
    estimatedDurationMinutes: typeof candidate.estimatedDurationMinutes === 'number'
      ? candidate.estimatedDurationMinutes
      : undefined,
    exercises,
  };
};

const makeRateLimitMessage = (error?: AIError): string => {
  const windowLabel = error?.limitWindow ? RATE_LIMIT_LABELS[error.limitWindow] : null;
  const retryAfter = formatRetryAfter(error?.retryAfterSeconds);
  const windowText = windowLabel ? `${windowLabel} ` : '';
  const retryText = retryAfter ? ` Try again in ${retryAfter}.` : ' Try again later.';
  return `Looks like you've hit your ${windowText}AI limit.${retryText}`;
};

const buildConversationHistory = (
  messages: AIConversationMessage[],
  intent: AIIntent
): AIChatMessage[] => {
  const filtered = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .filter((message) => !message.intent || message.intent === intent)
    .filter((message) => message.content.trim().length > 0);
  const trimmed = filtered.slice(0, -1).slice(-MAX_HISTORY_MESSAGES);
  return trimmed.map((message) => ({ role: message.role, content: message.content }));
};

interface LastFailedMessage {
  intent: AIIntent;
  message: string;
  context?: AIRequestContext;
  images?: AIImage[];
  attachments?: AIAttachmentDisplay[];
}

interface AIState {
  conversation: AIConversation | null;
  isSendingMessage: boolean;
  error: string | null;
  lastFailedMessage: LastFailedMessage | null;
  rateLimitStatus: AIRateLimitStatus | null;

  sendMessage: (
    intent: AIIntent,
    message: string,
    context?: AIRequestContext,
    images?: AIImage[],
    attachments?: AIAttachmentDisplay[]
  ) => Promise<AIResponse>;
  addLocalClarification: (
    intent: AIIntent,
    message: string,
    clarification: AIClarification,
    attachments?: AIAttachmentDisplay[]
  ) => Promise<AIResponse>;
  retryLastMessage: () => Promise<AIResponse | null>;
  checkRateLimits: () => Promise<void>;
  loadConversation: () => Promise<void>;
  persistConversation: () => Promise<void>;
  markWorkoutTemplateSaved: (messageId: string, templateId: string) => Promise<void>;
  clearConversation: () => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useAIStore = create<AIState>()(
  subscribeWithSelector((set, get) => ({
    conversation: null,
    isSendingMessage: false,
    error: null,
    lastFailedMessage: null,
    rateLimitStatus: null,

    sendMessage: async (intent, message, context, images, attachments) => {
      if (get().isSendingMessage) {
        return {
          type: 'error',
          requestId: generateId(),
          error: {
            code: 'INVALID_REQUEST',
            message: 'An AI response is already in progress.',
            retryable: false,
          },
        };
      }

      const { conversation, persistConversation } = get();

      const userMessage: AIConversationMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        intent,
        createdAt: new Date().toISOString(),
        attachments,
      };

      const updatedConversation: AIConversation = conversation
        ? {
            ...conversation,
            messages: [...conversation.messages, userMessage],
          }
        : {
            id: generateId(),
            messages: [userMessage],
            createdAt: new Date().toISOString(),
          };

      set({
        conversation: updatedConversation,
        isSendingMessage: true,
        error: null,
      });

      const messageParams: LastFailedMessage = {
        intent,
        message,
        context,
        images,
        attachments,
      };

      try {
        const history = buildConversationHistory(updatedConversation.messages, intent);
        const response = await aiService.sendAIMessage(intent, message, context, history, images);
        const isRateLimited = response.type === 'error' && response.error?.code === 'RATE_LIMITED';
        const friendlyErrorMessage = response.type === 'error'
          ? makeFriendlyAIErrorMessage(response.error)
          : null;

        const assistantContent =
          response.type === 'answer'
            ? makeSafeAssistantText(response.answer?.text)
            : response.type === 'clarification'
            ? makeFriendlyClarification(response.clarification?.question)
            : isRateLimited
            ? makeRateLimitMessage(response.error)
            : friendlyErrorMessage || GENERIC_AI_ERROR_MESSAGE;

        const rawWorkoutTemplate =
          response.type === 'answer'
            ? normalizeWorkoutTemplate(response.answer?.workoutTemplate)
            : response.type === 'clarification'
              ? normalizeWorkoutTemplate(response.clarification?.workoutTemplate)
              : undefined;
        const workoutTemplate = rawWorkoutTemplate
          ? normalizeWorkoutTemplateForRequest(rawWorkoutTemplate, message, response.type)
          : undefined;

        const assistantMessage: AIConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content: assistantContent,
          intent,
          createdAt: new Date().toISOString(),
          clarification: response.type === 'clarification' ? response.clarification : undefined,
          workoutTemplate,
          savedWorkoutTemplateId: null,
          editableWorkoutTemplateId: null,
          editableWorkoutTemplateName: null,
        };

        if (workoutTemplate) {
          posthog.capture('ai_workout_generated', {
            exercise_count: workoutTemplate.exercises.length,
          });
          void completeNewUserChecklistTask('ask_ai_for_workout');
        }

        const finalConversation: AIConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
        };

        if (response.type === 'error') {
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
              error: friendlyErrorMessage || GENERIC_AI_ERROR_MESSAGE,
              lastFailedMessage: messageParams,
              isSendingMessage: false,
            });
          }
        } else {
          set({
            conversation: finalConversation,
            isSendingMessage: false,
          });
        }

        persistConversation();
        return response;
      } catch (err) {
        const errorMessage = makeFriendlyAIErrorMessage({
          code: 'INTERNAL_ERROR',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          retryable: true,
        });
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

    addLocalClarification: async (intent, message, clarification, attachments) => {
      const { conversation, persistConversation } = get();
      const now = new Date().toISOString();
      const userMessage: AIConversationMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        intent,
        createdAt: now,
        attachments,
      };
      const assistantMessage: AIConversationMessage = {
        id: generateId(),
        role: 'assistant',
        content: makeFriendlyClarification(clarification.question),
        intent,
        createdAt: now,
        clarification,
        savedWorkoutTemplateId: null,
        editableWorkoutTemplateId: null,
        editableWorkoutTemplateName: null,
      };
      const updatedConversation: AIConversation = conversation
        ? {
            ...conversation,
            messages: [...conversation.messages, userMessage, assistantMessage],
          }
        : {
            id: generateId(),
            messages: [userMessage, assistantMessage],
            createdAt: now,
          };

      set({
        conversation: updatedConversation,
        isSendingMessage: false,
        error: null,
        lastFailedMessage: null,
      });
      await persistConversation();

      return {
        type: 'clarification',
        requestId: assistantMessage.id,
        clarification,
      };
    },

    retryLastMessage: async () => {
      const { lastFailedMessage, sendMessage } = get();
      if (!lastFailedMessage) return null;

      set({ lastFailedMessage: null, error: null });

      return sendMessage(
        lastFailedMessage.intent,
        lastFailedMessage.message,
        lastFailedMessage.context,
        lastFailedMessage.images,
        lastFailedMessage.attachments
      );
    },

    checkRateLimits: async () => {
      try {
        const status = await aiService.getRateLimitStatus();
        set({ rateLimitStatus: status });
      } catch (err) {
        console.error('Error checking rate limits:', err);
      }
    },

    loadConversation: async () => {
      const { conversation, isSendingMessage } = get();
      if (isSendingMessage) {
        return;
      }
      if (conversation) {
        return;
      }
      try {
        await removeScopedItem(AI_CONVERSATION_KEY);
        const newConversation: AIConversation = {
          id: generateId(),
          messages: [],
          createdAt: new Date().toISOString(),
        };
        set({ conversation: newConversation });
      } catch (err) {
        console.error('Error loading conversation:', err);
        const newConversation: AIConversation = {
          id: generateId(),
          messages: [],
          createdAt: new Date().toISOString(),
        };
        set({ conversation: newConversation });
      }
    },

    persistConversation: async () => {
      const { conversation } = get();
      if (conversation) {
        try {
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

    markWorkoutTemplateSaved: async (messageId, templateId) => {
      const { conversation, persistConversation } = get();
      if (!conversation) {
        return;
      }

      const nextConversation: AIConversation = {
        ...conversation,
        messages: conversation.messages.map((message) => (
          message.id === messageId
            ? { ...message, savedWorkoutTemplateId: templateId }
            : message
        )),
      };

      set({ conversation: nextConversation });
      await persistConversation();
    },

    clearConversation: () => {
      const newConversation: AIConversation = {
        id: generateId(),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      set({
        conversation: newConversation,
        error: null,
        lastFailedMessage: null,
      });
      get().persistConversation();
      removeScopedItem(AI_CONVERSATION_KEY).catch((err) => {
        console.error('Error clearing conversation:', err);
      });
    },

    clearError: () => {
      set({ error: null });
    },

    resetStore: () => {
      set({
        conversation: null,
        isSendingMessage: false,
        error: null,
        lastFailedMessage: null,
        rateLimitStatus: null,
      });
      removeScopedItem(AI_CONVERSATION_KEY).catch((err) => {
        console.error('Error clearing conversation:', err);
      });
    },
  }))
);
