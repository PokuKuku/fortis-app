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
 * Write intents return mutation plans requiring confirmation
 * Read intents return answers without mutations
 */
export const ALL_INTENTS = ['FORTIS_ANALYST'] as const;
export type AIIntent = typeof ALL_INTENTS[number];

/**
 * Intent configuration type
 */
export interface IntentConfigEntry {
  type: 'write' | 'read';
  defaultContextWeeks: number;
  includeHistory: boolean;
  includeNotes: boolean;
  includeProgram: boolean;
  includeExerciseDb: boolean;
  includeAnalytics: boolean;
  exerciseLimit?: number;
}

/**
 * Intent metadata for context assembly
 */
export const INTENT_CONFIG: Record<AIIntent, IntentConfigEntry> = {
  FORTIS_ANALYST: {
    type: 'read',
    defaultContextWeeks: 52,
    includeHistory: true,
    includeNotes: true,
    includeProgram: false,
    includeExerciseDb: false,
    includeAnalytics: true,
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
  insightId?: string;        // For insight-specific queries
  periodWeeks?: number;      // Override default context window
  historyOnly?: boolean;     // Restrict exercises to user's history only
  chatMode?: 'coach' | 'builder';
  workoutDraft?: WorkoutDraftV1;
  intentClassification?: WorkoutDraftIntentClassificationContext;
}

/**
 * AI response union type
 */
export interface AIResponse {
  type:
    | 'answer'
    | 'mutation_plan'
    | 'error'
    | 'clarification'
    | 'workout_proposal'
    | 'workout_draft'
    | 'intent_classification';
  requestId: string;
  message?: string;

  // For type === 'answer' (read-only queries)
  answer?: AIAnswer;

  // For type === 'mutation_plan' (write operations)
  mutationPlan?: AIMutationPlan;

  // For type === 'error'
  error?: AIError;

  // For type === 'clarification'
  clarification?: AIClarification;

  // For type === 'workout_proposal'
  workoutProposal?: WorkoutProposalV1;

  // For type === 'workout_draft'
  workoutDraft?: WorkoutDraftV1;

  // For type === 'intent_classification'
  intentClassification?: AIIntentClassification;
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

/**
 * Clarification request from AI
 */
export interface AIClarification {
  question: string;
  options?: string[];
  purpose?: 'draft_intake' | 'general';
}

// ============================================
// Workout Proposal Types
// ============================================

export type WorkoutProposalType = 'WORKOUT_PROPOSAL_V1';

export type WorkoutProposalSetKind = 'working' | 'warmup' | 'backoff' | 'finisher' | 'accessory' | 'other';

export interface WorkoutProposalSet {
  kind?: WorkoutProposalSetKind;
  sets: number;
  reps_min?: number;
  reps_max?: number;
  rir?: number;
  rest_sec?: number;
}

export interface WorkoutProposalExercise {
  exercise_query: string;
  target_muscles?: string[];
  sets: WorkoutProposalSet[];
  notes?: string;
}

export interface WorkoutProposalV1 {
  type: WorkoutProposalType;
  title: string;
  summary?: string;
  goal_tags?: string[];
  duration_minutes?: number;
  days_per_week?: number;
  exercises: WorkoutProposalExercise[];
  progression_rule?: string;
  safety_notes?: string;
}

// ============================================
// Workout Draft Reply Intent Classification
// ============================================

export type WorkoutDraftReplyIntent = 'confirm' | 'cancel' | 'edit' | 'resolve' | 'unknown';

export interface WorkoutDraftIntentClassificationContext {
  type: 'workout_draft_reply';
  draftStatus: 'pending' | 'awaiting_resolution' | 'ready_to_save';
  pendingQuery?: string;
  pendingOptions?: string[];
}

export interface AIIntentClassification {
  intent: WorkoutDraftReplyIntent;
  confidence: number;
  optionIndex?: number;
  saveAsTitle?: string;
  reason?: string;
}

// ============================================
// Workout Draft Types (Chat-only Flow)
// ============================================

export type WorkoutDraftType = 'WORKOUT_DRAFT_V1';

export interface WorkoutDraftSet {
  sets: number;
  reps: string;
  weight?: number;
  rpe?: number;
  restSec?: number;
}

export interface WorkoutDraftExercise {
  query: string;
  resolved_exercise_id: string | null;
  sets: WorkoutDraftSet[];
  exercise_notes?: string;
  tempo?: string;
  warmup?: boolean;
}

export interface WorkoutDraftV1 {
  type: WorkoutDraftType;
  title: string;
  notes?: string;
  exercises: WorkoutDraftExercise[];
  source_text?: string;
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
  workoutProposal?: WorkoutProposalV1;
  workoutDraft?: WorkoutDraftV1;
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
  actionsThisWeek: number;
  actionsThisMonth: number;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;
  maxPerMonth: number;
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
