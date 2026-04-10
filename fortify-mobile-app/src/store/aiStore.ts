/**
 * AI Store (Zustand)
 *
 * Central state management for AI assistant features.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { setScopedItem, removeScopedItem } from '@/src/utils/scopedStorage';
import {
  AIIntent,
  AIError,
  AIResponse,
  AIConversation,
  AIConversationMessage,
  AIChatMessage,
  AIRequestContext,
  AIRateLimitStatus,
  AIRateLimitWindow,
} from '../types/ai';
import * as aiService from '../services/aiService';
import { AI_CONVERSATION_KEY } from '../constants/storageKeys';
import { generateSecureUUID as generateId } from '../utils/uuid';

const makeFriendlyClarification = (question: string | undefined): string => {
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

const MAX_HISTORY_MESSAGES = 20;

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
}

interface AIState {
  conversation: AIConversation | null;
  isSendingMessage: boolean;
  error: string | null;
  lastFailedMessage: LastFailedMessage | null;
  rateLimitStatus: AIRateLimitStatus | null;

  sendMessage: (intent: AIIntent, message: string, context?: AIRequestContext) => Promise<AIResponse>;
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

    sendMessage: async (intent, message, context) => {
      const { conversation, persistConversation } = get();

      const userMessage: AIConversationMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        intent,
        createdAt: new Date().toISOString(),
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
      };

      try {
        const history = buildConversationHistory(updatedConversation.messages, intent);
        const response = await aiService.sendAIMessage(intent, message, context, history);
        const isRateLimited = response.type === 'error' && response.error?.code === 'RATE_LIMITED';

        const assistantContent =
          response.type === 'answer'
            ? response.answer?.text || ''
            : response.type === 'clarification'
            ? makeFriendlyClarification(response.clarification?.question)
            : isRateLimited
            ? makeRateLimitMessage(response.error)
            : response.error?.message || 'An error occurred';

        const assistantMessage: AIConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content: assistantContent,
          intent,
          createdAt: new Date().toISOString(),
          clarification: response.type === 'clarification' ? response.clarification : undefined,
          workoutTemplate:
            response.type === 'answer'
              ? response.answer?.workoutTemplate
              : response.type === 'clarification'
                ? response.clarification?.workoutTemplate
                : undefined,
          savedWorkoutTemplateId: null,
        };

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
              error: response.error?.message || 'An error occurred',
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

    retryLastMessage: async () => {
      const { lastFailedMessage, sendMessage } = get();
      if (!lastFailedMessage) return null;

      set({ lastFailedMessage: null, error: null });

      return sendMessage(
        lastFailedMessage.intent,
        lastFailedMessage.message,
        lastFailedMessage.context
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
