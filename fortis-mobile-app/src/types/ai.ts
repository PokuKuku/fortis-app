/**
 * AI Feature Types
 *
 * TypeScript interfaces for the AI assistant feature.
 * Matches the Supabase schema and Claude API patterns.
 */

// ============================================
// Intent Types
// ============================================

/**
 * All supported AI intents
 * Read-only intents return answers directly
 * Write intents return mutation plans requiring confirmation
 */
export type AIIntent =
  // Read-only intents
  | 'QUERY_STATS'
  | 'QUERY_HISTORY'
  | 'ANALYZE_PLATEAU'
  // Write intents (require confirmation)
  | 'CREATE_PROGRAM'
  | 'CREATE_TEMPLATE';

/**
 * Intent metadata for context assembly
 */
export const INTENT_CONFIG: Record<AIIntent, {
  type: 'read' | 'write';
  defaultContextWeeks: 4 | 12 | 24;
  includeHistory: boolean;
  includeNotes: boolean;
  includeProgram: boolean;
  includeExerciseDb: boolean;
  includeAnalytics: boolean;
  exerciseLimit?: number;
}> = {
  QUERY_STATS: {
    type: 'read',
    defaultContextWeeks: 4,
    includeHistory: true,
    includeNotes: false,
    includeProgram: false,
    includeExerciseDb: false,
    includeAnalytics: true,
  },
  QUERY_HISTORY: {
    type: 'read',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: false,
    includeExerciseDb: false,
    includeAnalytics: false,
  },
  ANALYZE_PLATEAU: {
    type: 'read',
    defaultContextWeeks: 24,
    includeHistory: true,
    includeNotes: true,
    includeProgram: true,
    includeExerciseDb: true,
    includeAnalytics: true,
    exerciseLimit: 50,
  },
  CREATE_PROGRAM: {
    type: 'write',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: false,
    includeExerciseDb: true,
    includeAnalytics: true,
    exerciseLimit: 100,
  },
  CREATE_TEMPLATE: {
    type: 'write',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: false,
    includeExerciseDb: true,
    includeAnalytics: true,
    exerciseLimit: 50,
  },
};

// ============================================
// Request/Response Types
// ============================================

/**
 * Supported image MIME types for AI vision
 */
export type AIImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Image attachment for AI request
 */
export interface AIImage {
  base64: string;
  mimeType: AIImageMimeType;
}

/**
 * AI request from client to Edge Function
 */
export interface AIRequest {
  intent: AIIntent;
  message: string;
  context?: AIRequestContext;
  image?: AIImage;
}

/**
 * Optional context overrides for AI request
 */
export interface AIRequestContext {
  exerciseId?: string;       // For exercise-specific queries
  programId?: string;        // For program-specific queries
  templateId?: string;       // For template-specific queries
  periodWeeks?: number;      // Override default context window
  historyOnly?: boolean;     // Restrict exercises to user's history only
}

/**
 * AI response union type
 */
export interface AIResponse {
  type: 'answer' | 'mutation_plan' | 'error' | 'clarification';
  requestId: string;

  // For type === 'answer' (read-only queries)
  answer?: AIAnswer;

  // For type === 'mutation_plan' (write operations)
  mutationPlan?: AIMutationPlan;

  // For type === 'error'
  error?: AIError;

  // For type === 'clarification'
  clarification?: AIClarification;
}

/**
 * Read-only answer response
 */
export interface AIAnswer {
  text: string;
  citations?: AICitation[];
}

/**
 * Citation reference in answer
 */
export interface AICitation {
  type: 'exercise' | 'session' | 'set' | 'program';
  id: string;
  context: string;
}

/**
 * Error response
 */
export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  retryAfterSeconds?: number;
}

export type AIErrorCode =
  | 'RATE_LIMITED'
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'CONTEXT_TOO_LARGE'
  | 'LLM_ERROR'
  | 'INTERNAL_ERROR'
  | 'ACTIVE_WORKOUT_BLOCKED';

/**
 * Clarification request from AI
 */
export interface AIClarification {
  question: string;
  options?: string[];
}

// ============================================
// Mutation Plan Types
// ============================================

/**
 * Complete mutation plan for write operations
 */
export interface AIMutationPlan {
  requestId: string;
  intent: AIIntent;
  conversationId?: string;

  // Human-readable summary
  summary: string;
  explanation: string;

  // Mutations to apply
  mutations: AIMutation[];

  // Exercise resolution details
  exerciseResolution: AIExerciseResolution[];

  // Expiration
  expiresAt: string;  // ISO timestamp
}

/**
 * Single mutation within a plan
 */
export interface AIMutation {
  mutationId: string;
  order: number;

  operation: 'INSERT' | 'UPDATE' | 'DELETE';

  entityType: AIEntityType;
  entityId?: string;              // For UPDATE/DELETE

  proposedState?: Record<string, unknown>;
  previousState?: Record<string, unknown>;

  description: string;            // Human-readable
  dependsOn?: string[];           // Mutation IDs this depends on
}

export type AIEntityType =
  | 'workout_program'
  | 'program_workout'
  | 'program_exercise'
  | 'workout_session'
  | 'workout_set'
  | 'training_summary'
  | 'user_goal';

/**
 * Exercise resolution showing how AI mapped exercises
 */
export interface AIExerciseResolution {
  exerciseId: string;
  exerciseName: string;
  fromHistory: boolean;
  justification?: string;   // Required if fromHistory=false
  explanation?: string;     // Brief exercise explanation
}

// ============================================
// Pending Action Types (matches Supabase schema)
// ============================================

/**
 * Pending action status
 */
export type AIPendingStatus = 'pending' | 'confirmed' | 'rejected' | 'expired';

/**
 * Pending action from ai_pending_actions table
 */
export interface AIPendingAction {
  id: string;
  userId: string;
  actionType: string;
  entityType: AIEntityType;
  targetEntityId?: string;
  proposedState: Record<string, unknown>;
  description: string;
  expiresAt: string;
  status: AIPendingStatus;
  resolvedAt?: string;
  requestId: string;
  aiConversationId?: string;
  createdAt: string;
}

/**
 * Pending action DTO (snake_case for Supabase)
 */
export interface AIPendingActionDTO {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  target_entity_id?: string;
  proposed_state: Record<string, unknown>;
  description: string;
  expires_at: string;
  status: AIPendingStatus;
  resolved_at?: string;
  request_id: string;
  ai_conversation_id?: string;
  created_at: string;
}

// ============================================
// Mutation Audit Types (matches Supabase schema)
// ============================================

/**
 * Mutation audit record from ai_mutations table
 */
export interface AIMutationRecord {
  id: string;
  userId: string;
  pendingActionId?: string;
  actionType: string;
  entityType: AIEntityType;
  entityId: string;
  previousState?: Record<string, unknown>;
  newState: Record<string, unknown>;
  isUndone: boolean;
  undoneAt?: string;
  undoneBy?: 'user' | 'system' | 'admin';
  requestId: string;
  aiConversationId?: string;
  aiActionSummary?: string;
  createdAt: string;
}

/**
 * Mutation audit DTO (snake_case for Supabase)
 */
export interface AIMutationRecordDTO {
  id: string;
  user_id: string;
  pending_action_id?: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  previous_state?: Record<string, unknown>;
  new_state: Record<string, unknown>;
  is_undone: boolean;
  undone_at?: string;
  undone_by?: string;
  request_id: string;
  ai_conversation_id?: string;
  ai_action_summary?: string;
  created_at: string;
}

// ============================================
// Context Assembly Types
// ============================================

/**
 * User preferences for AI context
 */
export interface AIUserPreferences {
  preferredUnits: 'imperial' | 'metric';
  timezone: string;
}

/**
 * Workout history summary for AI context
 */
export interface AIHistorySummary {
  periodWeeks: number;

  overview: {
    totalWorkouts: number;
    avgWorkoutsPerWeek: number;
    totalVolume: number;
    avgDurationMinutes: number;
  };

  exerciseFrequency: AIExerciseFrequency[];
  weeklyVolume: AIWeeklyVolume[];
  muscleGroupWork: AIMuscleGroupWork[];
  recentPRs: AIPR[];
}

export interface AIExerciseFrequency {
  exerciseId: string;
  exerciseName: string;
  timesTrained: number;
  lastWeight: number | null;
  lastReps: number | null;
  maxWeight: number | null;
  maxReps: number | null;
  avgRpe: number | null;
}

export interface AIWeeklyVolume {
  weekStart: string;
  workouts: number;
  totalVolume: number;
}

export interface AIMuscleGroupWork {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;
  avgSetsPerWeek: number;
}

export interface AIPR {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  achievedAt: string;
}

/**
 * User notes for AI context
 */
export interface AIUserNotes {
  stickyNotes: AIStickyNote[];
  recentSessionNotes: AISessionNote[];
}

export interface AIStickyNote {
  exerciseId: string;
  exerciseName: string;
  content: string;
  setIndex: number | null;
}

export interface AISessionNote {
  exerciseId: string;
  exerciseName: string;
  content: string;
  sessionDate: string;
}

/**
 * Exercise for AI context (subset of full exercise)
 */
export interface AIExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

/**
 * Program summary for AI context
 */
export interface AIProgramSummary {
  id: string;
  name: string;
  description?: string;
  difficulty: string;
  goal: string;
  durationWeeks: number;
  workouts: AIProgramWorkoutSummary[];
}

export interface AIProgramWorkoutSummary {
  id: string;
  name: string;
  dayNumber: number;
  exercises: AIProgramExerciseSummary[];
}

export interface AIProgramExerciseSummary {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

/**
 * Complete AI context for LLM
 */
export interface AIContext {
  user: AIUserPreferences;
  history?: AIHistorySummary;
  notes?: AIUserNotes;
  currentProgram?: AIProgramSummary;
  exerciseDb?: AIExercise[];
  analytics?: AIAnalyticsSummary;
}

export interface AIAnalyticsSummary {
  userStats: {
    totalWorkouts: number;
    totalWorkoutDays: number;
    totalTimeSeconds: number;
    avgWorkoutDuration: number;
    lastWorkoutDate: string | null;
    uniqueExercisesPerformed: number;
    totalVolume: number;
  };
  muscleGroupFrequency: {
    muscleGroup: string;
    timesTrained: number;
    totalVolume: number;
    lastTrained: string | null;
  }[];
}

// ============================================
// Conversation Types
// ============================================

/**
 * AI conversation message
 */
export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: AIIntent;
  mutationPlanId?: string;
  createdAt: string;
  clarification?: AIClarification;
  /** Image attachment (for user messages with photos) */
  image?: {
    uri: string;
    mimeType: AIImageMimeType;
  };
}

/**
 * AI conversation state
 */
export interface AIConversation {
  id: string;
  messages: AIConversationMessage[];
  pendingActions: AIPendingAction[];
  createdAt: string;
}

// ============================================
// Rate Limit Types
// ============================================

/**
 * Rate limit status
 */
export interface AIRateLimitStatus {
  allowed: boolean;
  actionsThisMinute: number;
  actionsThisHour: number;
  actionsThisDay: number;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  retryAfterSeconds?: number;
}

// ============================================
// Editable Program Draft Types (for templates/programs)
// ============================================

export interface EditableProgramExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  sets: number;
  reps?: string;
  restSeconds?: number;
  notes?: string;
}

export interface EditableProgramWorkout {
  id: string;
  name: string;
  dayNumber: number;
  description?: string;
  exercises: EditableProgramExercise[];
}

export interface EditableProgramDraft {
  name: string;
  description?: string;
  difficulty: string;
  goal?: string;
  durationWeeks?: number;
  isTemplate: boolean;
  workouts: EditableProgramWorkout[];
  originalPlan: AIMutationPlan;
}
