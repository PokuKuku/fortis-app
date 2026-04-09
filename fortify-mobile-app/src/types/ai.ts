/**
 * AI Feature Types
 *
 * TypeScript interfaces for the AI assistant feature.
 */

// ============================================
// Intent Types
// ============================================

export const ALL_INTENTS = ['FORTIS_ANALYST', 'GENERAL_CHAT'] as const;
export type AIIntent = typeof ALL_INTENTS[number];

// ============================================
// Request/Response Types
// ============================================

export interface AIRequestContext {
  insightId?: string;
  periodWeeks?: number;
  currentWorkoutTemplateDraft?: AIWorkoutTemplate;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  intent: AIIntent;
  message: string;
  context?: AIRequestContext;
  history?: AIChatMessage[];
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
  workoutTemplate?: AIWorkoutTemplate;
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
  | 'CONSENT_REQUIRED'
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

export interface AIWorkoutTemplateExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface AIWorkoutTemplate {
  name: string;
  description?: string;
  focus?: string;
  estimatedDurationMinutes?: number;
  exercises: AIWorkoutTemplateExercise[];
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
  workoutTemplate?: AIWorkoutTemplate;
  savedWorkoutTemplateId?: string | null;
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
