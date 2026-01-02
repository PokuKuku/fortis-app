/**
 * AI Service
 *
 * Client-side service for interacting with the Fortis AI Edge Function.
 * Handles request/response formatting, error handling, and conversation state.
 */

import * as Crypto from 'expo-crypto';
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

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Mapping removed - no write intents currently active
const ACTION_TYPE_BY_INTENT: Partial<Record<AIIntent, string>> = {};

const LOGGABLE_ENTITY_TYPES = new Set<string>([
  'workout_program',
  'program_workout',
  'program_exercise',
]);

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
      requestId: Crypto.randomUUID(),
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
      requestId: Crypto.randomUUID(),
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
    const { data, error, response } = await supabase.functions.invoke('ai', {
      body: request,
    });

    if (error) {
      if (response) {
        try {
          const parsed = await response.json();
          if (parsed && parsed.type === 'error' && parsed.error) {
            return {
              type: 'error',
              requestId: parsed.requestId || Crypto.randomUUID(),
              error: parsed.error,
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse AI error response:', parseError);
        }
      }
      console.error('AI function error:', error);
      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
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
      requestId: Crypto.randomUUID(),
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
 * Analyze user's lifting history
 */
export async function analyzeHistory(
  query: string
): Promise<AIResponse> {
  return sendAIMessage('ANALYZE_HISTORY', query);
}
// ============================================
// Pending Actions Management
// ============================================

/**
 * Get all pending AI actions for current user
 */
export async function getPendingActions(): Promise<AIPendingAction[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('ai_pending_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString()) // Exclude expired actions
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending actions:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
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
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('ai_pending_actions')
    .update({ status: 'confirmed', resolved_at: new Date().toISOString() })
    .eq('id', actionId)
    .eq('user_id', userId)
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
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('ai_pending_actions')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', actionId)
    .eq('user_id', userId)
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
  // Check if mutation plan has expired
  if (plan.expiresAt) {
    const expirationDate = new Date(plan.expiresAt);
    if (expirationDate <= new Date()) {
      return {
        success: false,
        error: 'This mutation plan has expired. Please generate a new one.',
      };
    }
  }

  const appliedMutations: string[] = [];
  const userId = await getAuthenticatedUserId();
  const actionType = ACTION_TYPE_BY_INTENT[plan.intent];
  const canLog = Boolean(userId && actionType);

  const allowedOperations = new Set(['INSERT']);
  const invalidOperation = plan.mutations.find((mutation) => !allowedOperations.has(mutation.operation));
  if (invalidOperation) {
    return { success: false, error: 'This request includes unsupported actions.' };
  }

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
      const result = await applyMutation(mutation, createdEntities, userId, plan.intent);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Track created entity ID
      if (mutation.operation === 'INSERT' && result.entityId) {
        createdEntities[mutation.mutationId] = result.entityId;
      }

      if (
        canLog &&
        actionType &&
        LOGGABLE_ENTITY_TYPES.has(mutation.entityType)
      ) {
        const resolvedEntityId =
          mutation.operation === 'INSERT' ? result.entityId : mutation.entityId;
        if (resolvedEntityId) {
          const newState =
            mutation.operation === 'DELETE'
              ? {}
              : result.appliedState || mutation.proposedState || {};

          try {
            await supabase.rpc('log_ai_mutation', {
              p_action_type: actionType,
              p_entity_type: mutation.entityType,
              p_entity_id: resolvedEntityId,
              p_previous_state: mutation.previousState ?? null,
              p_new_state: newState,
              p_pending_action_id: null,
              p_request_id: plan.requestId,
              p_ai_conversation_id: plan.conversationId ?? null,
              p_ai_action_summary: plan.summary,
            });
          } catch (logError) {
            console.warn('Failed to log AI mutation:', logError);
          }
        }
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
  createdEntities: Record<string, string>,
  userId: string | null,
  intent: AIIntent
): Promise<{
  success: boolean;
  error?: string;
  entityId?: string;
  appliedState?: Record<string, unknown>;
}> {
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
      if (!proposedState) {
        return { success: false, error: 'Missing proposed state for insert' };
      }
      if (mutation.entityType === 'workout_program') {
        if (!userId) {
          return { success: false, error: 'Not authenticated' };
        }
        proposedState = {
          ...proposedState,
          created_by: proposedState.created_by ?? userId,
          is_ai_created: true,
          is_template:
            proposedState.is_template ??
            (intent === 'CREATE_TEMPLATE' ? true : intent === 'CREATE_PROGRAM' ? false : undefined),
        };
      }
      if (mutation.entityType === 'workout_session') {
        if (!userId) {
          return { success: false, error: 'Not authenticated' };
        }
        proposedState = {
          ...proposedState,
          user_id: proposedState.user_id ?? userId,
        };
      }
      if (mutation.entityType === 'training_summary') {
        if (!userId) {
          return { success: false, error: 'Not authenticated' };
        }
        proposedState = {
          ...proposedState,
          user_id: proposedState.user_id ?? userId,
        };
      }
      const { data, error } = await supabase
        .from(tableName)
        .insert(proposedState)
        .select('id')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        entityId: data.id,
        appliedState: proposedState,
      };
    }

    case 'UPDATE': {
      if (!proposedState) {
        return { success: false, error: 'Missing proposed state for update' };
      }

      // Build query with ownership check for entities with direct ownership
      const ownershipColumn = getOwnershipColumn(mutation.entityType);
      let query = supabase
        .from(tableName)
        .update(proposedState)
        .eq('id', mutation.entityId);

      if (ownershipColumn && userId) {
        query = query.eq(ownershipColumn, userId);
      }

      const { error } = await query;

      if (error) return { success: false, error: error.message };
      return { success: true, appliedState: proposedState };
    }

    case 'DELETE': {
      // Build query with ownership check for entities with direct ownership
      const ownershipCol = getOwnershipColumn(mutation.entityType);
      let deleteQuery = supabase
        .from(tableName)
        .delete()
        .eq('id', mutation.entityId);

      if (ownershipCol && userId) {
        deleteQuery = deleteQuery.eq(ownershipCol, userId);
      }

      const { error } = await deleteQuery;

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
    user_goal: 'user_goals',
  };
  return mapping[entityType] || entityType;
}

/**
 * Returns the ownership column for entities with direct user ownership.
 * Child entities (program_workout, program_exercise, workout_set) inherit
 * ownership through their parent and rely on RLS policies for protection.
 */
function getOwnershipColumn(entityType: string): string | null {
  const mapping: Record<string, string | null> = {
    workout_program: 'created_by',
    workout_session: 'user_id',
    training_summary: 'user_id',
    user_goal: 'user_id',
    // Child entities - ownership verified through RLS on parent chain
    program_workout: null,
    program_exercise: null,
    workout_set: null,
  };
  return mapping[entityType] ?? null;
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
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('ai_mutations')
    .select('*')
    .eq('user_id', userId)
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
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the mutation record
  const { data: mutation, error: fetchError } = await supabase
    .from('ai_mutations')
    .select('*')
    .eq('id', mutationId)
    .eq('user_id', userId)
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
      .eq('id', mutationId)
      .eq('user_id', userId);

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
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('ai_rate_limits')
    .select('*')
    .eq('user_id', userId)
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
    actionsThisWeek: data.actions_this_week ?? 0,
    actionsThisMonth: data.actions_this_month ?? 0,
    maxPerMinute: data.max_per_minute,
    maxPerHour: data.max_per_hour,
    maxPerDay: data.max_per_day,
    maxPerWeek: data.max_per_week ?? 75,
    maxPerMonth: data.max_per_month ?? 150,
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
    ANALYZE_HISTORY: 'Analyze History',
  };
  return labels[intent];
}
