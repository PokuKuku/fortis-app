/**
 * AI Service
 *
 * Client-side service for interacting with the Fortis AI Edge Function.
 * Handles request/response formatting, error handling, and conversation state.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AIIntent,
  AIImage,
  AIRequest,
  AIRequestContext,
  AIResponse,
  AIMutationPlan,
  AIPendingAction,
  AIPendingActionDTO,
  AIMutationRecord,
  AIMutationRecordDTO,
  AIRateLimitStatus,
  INTENT_CONFIG,
} from '../types/ai';

// ============================================
// Main AI Service Functions
// ============================================

/**
 * Send a message to the AI assistant
 * @param intent - The AI intent type
 * @param message - The user's message
 * @param context - Optional context overrides
 * @param image - Optional image attachment for vision-based queries
 */
export async function sendAIMessage(
  intent: AIIntent,
  message: string,
  context?: AIRequestContext,
  image?: AIImage
): Promise<AIResponse> {
  if (!isSupabaseConfigured()) {
    return {
      type: 'error',
      requestId: crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Supabase is not configured. Please check your environment variables.',
        retryable: false,
      },
    };
  }

  // Get current session for auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      type: 'error',
      requestId: crypto.randomUUID(),
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please sign in to use AI features.',
        retryable: false,
      },
    };
  }

  const request: AIRequest = {
    intent,
    message,
    context,
    image,
  };

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: request,
    });

    if (error) {
      console.error('AI function error:', error);
      return {
        type: 'error',
        requestId: crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to get AI response',
          retryable: true,
        },
      };
    }

    return data as AIResponse;
  } catch (err) {
    console.error('AI service error:', err);
    return {
      type: 'error',
      requestId: crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        retryable: true,
      },
    };
  }
}

// ============================================
// Intent-Specific Helpers
// ============================================

/**
 * Query user stats (PRs, volume, etc.)
 */
export async function queryStats(question: string): Promise<AIResponse> {
  return sendAIMessage('QUERY_STATS', question);
}

/**
 * Query workout history
 */
export async function queryHistory(
  question: string,
  periodWeeks?: number
): Promise<AIResponse> {
  return sendAIMessage('QUERY_HISTORY', question, { periodWeeks });
}

/**
 * Analyze a training plateau
 */
export async function analyzePlateau(
  question: string,
  exerciseId?: string
): Promise<AIResponse> {
  return sendAIMessage('ANALYZE_PLATEAU', question, { exerciseId });
}

/**
 * Analyze current program effectiveness
 */
export async function analyzeProgram(
  question: string,
  programId: string
): Promise<AIResponse> {
  return sendAIMessage('ANALYZE_PROGRAM', question, { programId });
}

/**
 * Explain an exercise
 */
export async function explainExercise(
  exerciseId: string,
  question?: string
): Promise<AIResponse> {
  return sendAIMessage(
    'EXPLAIN_EXERCISE',
    question || 'Explain this exercise, including proper form and common mistakes.',
    { exerciseId }
  );
}

/**
 * Create a new workout program
 */
export async function createProgram(
  description: string,
  historyOnly?: boolean
): Promise<AIResponse> {
  return sendAIMessage('CREATE_PROGRAM', description, { historyOnly });
}

/**
 * Modify an existing program
 */
export async function modifyProgram(
  programId: string,
  modifications: string,
  historyOnly?: boolean
): Promise<AIResponse> {
  return sendAIMessage('MODIFY_PROGRAM', modifications, { programId, historyOnly });
}

/**
 * Create a single workout template
 */
export async function createTemplate(
  description: string,
  historyOnly?: boolean
): Promise<AIResponse> {
  return sendAIMessage('CREATE_TEMPLATE', description, { historyOnly });
}

/**
 * Modify an existing template
 */
export async function modifyTemplate(
  templateId: string,
  modifications: string,
  historyOnly?: boolean
): Promise<AIResponse> {
  return sendAIMessage('MODIFY_TEMPLATE', modifications, { templateId, historyOnly });
}

/**
 * Log a workout from natural language or image
 * @param description - Text description of the workout (can be minimal if image provided)
 * @param image - Optional image of workout (whiteboard, screenshot, notes)
 */
export async function logWorkout(
  description: string,
  image?: AIImage
): Promise<AIResponse> {
  return sendAIMessage('LOG_WORKOUT', description, undefined, image);
}

/**
 * Generate a shareable training summary
 */
export async function generateSummary(
  periodWeeks: number,
  customPrompt?: string
): Promise<AIResponse> {
  return sendAIMessage(
    'GENERATE_SUMMARY',
    customPrompt || `Generate a training summary for the last ${periodWeeks} weeks.`,
    { periodWeeks }
  );
}

// ============================================
// Pending Actions Management
// ============================================

/**
 * Get all pending AI actions for current user
 */
export async function getPendingActions(): Promise<AIPendingAction[]> {
  const { data, error } = await supabase
    .from('ai_pending_actions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending actions:', error);
    return [];
  }

  return (data as AIPendingActionDTO[]).map(mapPendingActionFromDTO);
}

/**
 * Confirm a pending AI action
 */
export async function confirmPendingAction(
  actionId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('ai_pending_actions')
    .update({ status: 'confirmed', resolved_at: new Date().toISOString() })
    .eq('id', actionId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error confirming action:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reject a pending AI action
 */
export async function rejectPendingAction(
  actionId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('ai_pending_actions')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', actionId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error rejecting action:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Apply a confirmed mutation plan
 * This executes the mutations and creates audit records
 */
export async function applyMutationPlan(
  plan: AIMutationPlan
): Promise<{ success: boolean; error?: string; appliedMutations?: string[] }> {
  const appliedMutations: string[] = [];

  try {
    // Sort mutations by order and process dependencies
    const sortedMutations = [...plan.mutations].sort((a, b) => a.order - b.order);

    // Track created entity IDs for dependent mutations
    const createdEntities: Record<string, string> = {};

    for (const mutation of sortedMutations) {
      // Check dependencies are met
      if (mutation.dependsOn?.length) {
        const unmetDeps = mutation.dependsOn.filter((dep) => !appliedMutations.includes(dep));
        if (unmetDeps.length > 0) {
          throw new Error(`Unmet dependencies for mutation ${mutation.mutationId}: ${unmetDeps.join(', ')}`);
        }
      }

      // Apply the mutation
      const result = await applyMutation(mutation, createdEntities);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Track created entity ID
      if (mutation.operation === 'INSERT' && result.entityId) {
        createdEntities[mutation.mutationId] = result.entityId;
      }

      appliedMutations.push(mutation.mutationId);
    }

    return { success: true, appliedMutations };
  } catch (err) {
    console.error('Error applying mutation plan:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to apply mutation plan',
      appliedMutations,
    };
  }
}

async function applyMutation(
  mutation: AIMutationPlan['mutations'][0],
  createdEntities: Record<string, string>
): Promise<{ success: boolean; error?: string; entityId?: string }> {
  const tableName = entityTypeToTable(mutation.entityType);

  // Replace placeholder references with actual created IDs
  let proposedState = mutation.proposedState;
  if (proposedState && mutation.dependsOn?.length) {
    proposedState = { ...proposedState };
    for (const [key, value] of Object.entries(proposedState)) {
      if (typeof value === 'string' && value.startsWith('ref:')) {
        const refMutationId = value.slice(4);
        if (createdEntities[refMutationId]) {
          proposedState[key] = createdEntities[refMutationId];
        }
      }
    }
  }

  switch (mutation.operation) {
    case 'INSERT': {
      const { data, error } = await supabase
        .from(tableName)
        .insert(proposedState)
        .select('id')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, entityId: data.id };
    }

    case 'UPDATE': {
      const { error } = await supabase
        .from(tableName)
        .update(proposedState)
        .eq('id', mutation.entityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    case 'DELETE': {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', mutation.entityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    default:
      return { success: false, error: `Unknown operation: ${mutation.operation}` };
  }
}

function entityTypeToTable(entityType: string): string {
  const mapping: Record<string, string> = {
    workout_program: 'workout_programs',
    program_workout: 'program_workouts',
    program_exercise: 'program_exercises',
    workout_session: 'workout_sessions',
    workout_set: 'workout_sets',
    training_summary: 'training_summaries',
  };
  return mapping[entityType] || entityType;
}

// ============================================
// Mutation History (Undo Support)
// ============================================

/**
 * Get AI mutation history for current user
 */
export async function getMutationHistory(
  limit = 50
): Promise<AIMutationRecord[]> {
  const { data, error } = await supabase
    .from('ai_mutations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching mutation history:', error);
    return [];
  }

  return (data as AIMutationRecordDTO[]).map(mapMutationRecordFromDTO);
}

/**
 * Undo an AI mutation
 */
export async function undoMutation(
  mutationId: string
): Promise<{ success: boolean; error?: string }> {
  // Get the mutation record
  const { data: mutation, error: fetchError } = await supabase
    .from('ai_mutations')
    .select('*')
    .eq('id', mutationId)
    .eq('is_undone', false)
    .single();

  if (fetchError || !mutation) {
    return { success: false, error: 'Mutation not found or already undone' };
  }

  const record = mapMutationRecordFromDTO(mutation as AIMutationRecordDTO);

  try {
    // Reverse the mutation based on action type
    if (record.actionType.startsWith('create')) {
      // Delete the created entity
      await supabase
        .from(entityTypeToTable(record.entityType))
        .delete()
        .eq('id', record.entityId);
    } else if (record.actionType.startsWith('modify') && record.previousState) {
      // Restore previous state
      await supabase
        .from(entityTypeToTable(record.entityType))
        .update(record.previousState)
        .eq('id', record.entityId);
    } else if (record.actionType.startsWith('delete') && record.previousState) {
      // Re-insert deleted entity
      await supabase
        .from(entityTypeToTable(record.entityType))
        .insert({ ...record.previousState, id: record.entityId });
    }

    // Mark as undone
    const { error: updateError } = await supabase
      .from('ai_mutations')
      .update({
        is_undone: true,
        undone_at: new Date().toISOString(),
        undone_by: 'user',
      })
      .eq('id', mutationId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error undoing mutation:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to undo mutation',
    };
  }
}

// ============================================
// Rate Limit Status
// ============================================

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(): Promise<AIRateLimitStatus | null> {
  const { data, error } = await supabase
    .from('ai_rate_limits')
    .select('*')
    .single();

  if (error) {
    // No rate limit record means user hasn't hit any limits yet
    return null;
  }

  return {
    allowed: true, // If we can read, we're not blocked
    actionsThisMinute: data.actions_this_minute,
    actionsThisHour: data.actions_this_hour,
    actionsThisDay: data.actions_this_day,
    maxPerMinute: data.max_per_minute,
    maxPerHour: data.max_per_hour,
    maxPerDay: data.max_per_day,
  };
}

// ============================================
// DTO Mappers
// ============================================

function mapPendingActionFromDTO(dto: AIPendingActionDTO): AIPendingAction {
  return {
    id: dto.id,
    userId: dto.user_id,
    actionType: dto.action_type,
    entityType: dto.entity_type as AIPendingAction['entityType'],
    targetEntityId: dto.target_entity_id,
    proposedState: dto.proposed_state,
    description: dto.description,
    expiresAt: dto.expires_at,
    status: dto.status,
    resolvedAt: dto.resolved_at,
    requestId: dto.request_id,
    aiConversationId: dto.ai_conversation_id,
    createdAt: dto.created_at,
  };
}

function mapMutationRecordFromDTO(dto: AIMutationRecordDTO): AIMutationRecord {
  return {
    id: dto.id,
    userId: dto.user_id,
    pendingActionId: dto.pending_action_id,
    actionType: dto.action_type,
    entityType: dto.entity_type as AIMutationRecord['entityType'],
    entityId: dto.entity_id,
    previousState: dto.previous_state,
    newState: dto.new_state,
    isUndone: dto.is_undone,
    undoneAt: dto.undone_at,
    undoneBy: dto.undone_by as AIMutationRecord['undoneBy'],
    requestId: dto.request_id,
    aiConversationId: dto.ai_conversation_id,
    aiActionSummary: dto.ai_action_summary,
    createdAt: dto.created_at,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if an intent is a write operation
 */
export function isWriteIntent(intent: AIIntent): boolean {
  return INTENT_CONFIG[intent].type === 'write';
}

/**
 * Get display label for an intent
 */
export function getIntentLabel(intent: AIIntent): string {
  const labels: Record<AIIntent, string> = {
    QUERY_STATS: 'Query Stats',
    QUERY_HISTORY: 'Query History',
    ANALYZE_PLATEAU: 'Analyze Plateau',
    ANALYZE_PROGRAM: 'Analyze Program',
    EXPLAIN_EXERCISE: 'Explain Exercise',
    CREATE_PROGRAM: 'Create Program',
    MODIFY_PROGRAM: 'Modify Program',
    CREATE_TEMPLATE: 'Create Template',
    MODIFY_TEMPLATE: 'Modify Template',
    LOG_WORKOUT: 'Log Workout',
    GENERATE_SUMMARY: 'Generate Summary',
  };
  return labels[intent];
}
