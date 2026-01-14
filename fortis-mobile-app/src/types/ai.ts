/**
 * AI Feature Types
 *
 * TypeScript interfaces for the AI assistant feature.
 */

// ============================================
// Intent Types
// ============================================

export const ALL_INTENTS = ['FORTIS_ANALYST'] as const;
export type AIIntent = typeof ALL_INTENTS[number];

// ============================================
// Request/Response Types
// ============================================

export type AIImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export interface AIImage {
  base64: string;
  mimeType: AIImageMimeType;
}

export interface AIRequestContext {
  insightId?: string;
  periodWeeks?: number;
}

export interface AIRequest {
  intent: AIIntent;
  message: string;
  context?: AIRequestContext;
  image?: AIImage;
}

export interface AIResponse {
  type: 'answer' | 'error' | 'clarification';
  requestId: string;
  answer?: AIAnswer;
  error?: AIError;
  clarification?: AIClarification;
}

export interface AIAnswer {
  text: string;
  citations?: AICitation[];
}

export interface AICitation {
  type: 'exercise' | 'session' | 'set' | 'program';
  id: string;
  context: string;
}

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  retryAfterSeconds?: number;
  limitWindow?: AIRateLimitWindow;
}

export type AIRateLimitWindow = 'minute' | 'hour' | 'day' | 'week' | 'month';

export type AIErrorCode =
  | 'RATE_LIMITED'
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'CONTEXT_TOO_LARGE'
  | 'LLM_ERROR'
  | 'INTERNAL_ERROR'
  | 'ACTIVE_WORKOUT_BLOCKED';

export interface AIClarification {
  question: string;
  options?: string[];
}

// ============================================
// Conversation Types
// ============================================

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: AIIntent;
  createdAt: string;
  clarification?: AIClarification;
  image?: {
    uri: string;
    mimeType: AIImageMimeType;
  };
}

export interface AIConversation {
  id: string;
  messages: AIConversationMessage[];
  createdAt: string;
}

// ============================================
// Rate Limit Types
// ============================================

export interface AIRateLimitStatus {
  allowed: boolean;
  actionsThisMinute: number;
  actionsThisHour: number;
  actionsThisDay: number;
  actionsThisWeek: number;
  actionsThisMonth: number;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;
  maxPerMonth: number;
  retryAfterSeconds?: number;
}
