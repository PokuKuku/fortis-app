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
  voiceWorkoutOnly?: boolean;
  onboardingProgramSpec?: {
    id: string;
    trainingEnvironment: 'gym' | 'home' | 'hybrid';
    muscleFocuses: string[];
    fitnessPriorities?: string[];
    fitnessGoal?: string | null;
    liftingExperience?: string | null;
    sessionDurationMinutes?: number;
    goalPace?: string;
    workoutsPerWeek: number;
    scheduleDays: number[];
    durationWeeks: number;
    userName?: string | null;
    programName?: string | null;
  };
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
  image?: AIImage;
  images?: AIImage[];
}

export type AIImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export interface AIImage {
  base64: string;
  mimeType: AIImageMimeType;
}

export interface AIAttachmentDisplay {
  id: string;
  uri: string;
  kind: 'image' | 'video';
  label?: string;
}

export interface AIPendingMedia {
  id: string;
  uri: string;
  kind: 'image' | 'video';
  label?: string;
  images: AIImage[];
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
  programTemplate?: AIProgramTemplate;
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

export interface AIClarificationOption {
  label: string;
  exerciseId?: string;
}

export interface AIClarification {
  question: string;
  options?: Array<string | AIClarificationOption>;
  workoutTemplate?: AIWorkoutTemplate;
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

export interface AIProgramTemplateExercise extends AIWorkoutTemplateExercise {}

export interface AIProgramTemplateWorkout {
  name: string;
  exercises: AIProgramTemplateExercise[];
}

export interface AIProgramTemplate {
  name: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  goal?: 'strength' | 'hypertrophy' | 'general_fitness';
  durationWeeks?: number;
  workouts: AIProgramTemplateWorkout[];
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
  attachments?: AIAttachmentDisplay[];
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
