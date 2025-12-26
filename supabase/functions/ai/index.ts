/**
 * Fortis AI Edge Function
 *
 * Unified AI endpoint for the Fortis workout app.
 * Handles all AI intents through a single entry point.
 *
 * Features:
 * - Rate limiting via ai_rate_limits table
 * - Intent-based context assembly
 * - Claude 3.5 Sonnet integration
 * - Audit logging for mutations
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

// ============================================
// Types (mirrored from mobile app)
// ============================================

type AIIntent =
  | 'QUERY_STATS'
  | 'QUERY_HISTORY'
  | 'ANALYZE_PLATEAU'
  | 'ANALYZE_OVERLOAD'
  | 'ANALYZE_PROGRAM'
  | 'EXPLAIN_EXERCISE'
  | 'CREATE_PROGRAM'
  | 'MODIFY_PROGRAM'
  | 'CREATE_TEMPLATE'
  | 'MODIFY_TEMPLATE'
  | 'LOG_WORKOUT'
  | 'GENERATE_SUMMARY'
  | 'UPDATE_GOALS';

type AIImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

interface AIImage {
  base64: string;
  mimeType: AIImageMimeType;
}

interface AIRequest {
  intent: AIIntent;
  message: string;
  context?: {
    exerciseId?: string;
    programId?: string;
    templateId?: string;
    periodWeeks?: number;
    historyOnly?: boolean;
  };
  image?: AIImage;
}

interface IntentConfig {
  type: 'read' | 'write';
  defaultContextWeeks: number;
  includeHistory: boolean;
  includeNotes: boolean;
  includeProgram: boolean;
  includeExerciseDb: boolean;
  includeAnalytics: boolean;
  exerciseLimit?: number;
}

const INTENT_CONFIG: Record<AIIntent, IntentConfig> = {
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
  ANALYZE_OVERLOAD: {
    type: 'read',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: true,
    includeExerciseDb: false,
    includeAnalytics: true,
  },
  ANALYZE_PROGRAM: {
    type: 'read',
    defaultContextWeeks: 24,
    includeHistory: true,
    includeNotes: true,
    includeProgram: true,
    includeExerciseDb: false,
    includeAnalytics: true,
  },
  EXPLAIN_EXERCISE: {
    type: 'read',
    defaultContextWeeks: 4,
    includeHistory: false,
    includeNotes: true,
    includeProgram: false,
    includeExerciseDb: true,
    includeAnalytics: false,
    exerciseLimit: 1,
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
  MODIFY_PROGRAM: {
    type: 'write',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: true,
    includeExerciseDb: true,
    includeAnalytics: true,
    exerciseLimit: 50,
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
  MODIFY_TEMPLATE: {
    type: 'write',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: true,
    includeProgram: true,
    includeExerciseDb: true,
    includeAnalytics: true,
    exerciseLimit: 50,
  },
  LOG_WORKOUT: {
    type: 'write',
    defaultContextWeeks: 4,
    includeHistory: true,
    includeNotes: false,
    includeProgram: false,
    includeExerciseDb: true,
    includeAnalytics: false,
    exerciseLimit: 100,
  },
  GENERATE_SUMMARY: {
    type: 'write',
    defaultContextWeeks: 12,
    includeHistory: true,
    includeNotes: false,
    includeProgram: false,
    includeExerciseDb: false,
    includeAnalytics: true,
  },
  UPDATE_GOALS: {
    type: 'write',
    defaultContextWeeks: 4,
    includeHistory: false,
    includeNotes: false,
    includeProgram: false,
    includeExerciseDb: false,
    includeAnalytics: false,
  },
};

const ACTION_TYPE_BY_INTENT: Partial<Record<AIIntent, string>> = {
  CREATE_PROGRAM: 'create_program',
  CREATE_TEMPLATE: 'create_template',
  LOG_WORKOUT: 'log_workout',
  UPDATE_GOALS: 'update_goals',
};

const ALLOWED_ENTITY_TYPES = new Set<string>([
  'workout_program',
  'program_workout',
  'program_exercise',
  'workout_session',
  'workout_set',
  'training_summary',
  'user_goal',
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeProposedState(
  entityType: string,
  proposedState: Record<string, unknown> | undefined,
  userId: string,
  intent?: AIIntent
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...(proposedState || {}) };

  if (entityType === 'workout_program') {
    sanitized.created_by = userId;
    sanitized.is_default = false; // Prevent privilege escalation
    sanitized.is_public = false; // Default to private for security
    sanitized.is_ai_created = true;
    if (intent === 'CREATE_TEMPLATE') {
      sanitized.is_template = true;
    }
    if (intent === 'CREATE_PROGRAM') {
      sanitized.is_template = false;
    }
  }

  if (entityType === 'workout_session') {
    sanitized.user_id = userId;
  }

  if (entityType === 'training_summary') {
    sanitized.user_id = userId;
  }

  if (entityType === 'user_goal') {
    sanitized.user_id = userId;
  }

  // Remove any server-controlled fields that shouldn't be set by AI
  delete sanitized.id;
  delete sanitized.created_at;
  delete sanitized.updated_at;

  return sanitized;
}

function isValidUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function extractSearchPhrases(message: string, maxPhrases = 6): string[] {
  const cleaned = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  const words = cleaned.split(' ').filter((word) => word.length >= 3);
  const phrases: string[] = [];
  for (let size = Math.min(3, words.length); size >= 1; size -= 1) {
    for (let i = 0; i <= words.length - size; i += 1) {
      const phrase = words.slice(i, i + size).join(' ');
      if (!phrases.includes(phrase)) {
        phrases.push(phrase);
      }
      if (phrases.length >= maxPhrases) {
        return phrases;
      }
    }
  }
  return phrases;
}

async function resolveExerciseMatches(
  supabase: SupabaseClient,
  userId: string,
  message: string
): Promise<{ ids: string[]; matched: { id: string; name: string; source: 'history' | 'catalog' }[] }> {
  const phrases = extractSearchPhrases(message);
  const matched = new Map<string, { id: string; name: string; source: 'history' | 'catalog' }>();

  for (const phrase of phrases) {
    if (matched.size >= 8) break;

    const { data: historyMatches } = await supabase
      .from('workout_sets')
      .select('exercise_id, exercises(id, name), workout_sessions!inner(user_id)')
      .eq('workout_sessions.user_id', userId)
      .ilike('exercises.name', `%${phrase}%`)
      .limit(8);

    historyMatches?.forEach((row) => {
      if (matched.size >= 8) return;
      const exercise = row.exercises as { id?: string; name?: string } | null;
      if (exercise?.id && exercise.name && !matched.has(exercise.id)) {
        matched.set(exercise.id, { id: exercise.id, name: exercise.name, source: 'history' });
      }
    });

    if (matched.size >= 8) break;

    const { data: catalogMatches } = await supabase
      .from('exercises')
      .select('id, name')
      .ilike('name', `%${phrase}%`)
      .limit(8);

    catalogMatches?.forEach((row) => {
      if (matched.size >= 8) return;
      if (row.id && row.name && !matched.has(row.id)) {
        matched.set(row.id, { id: row.id, name: row.name, source: 'catalog' });
      }
    });
  }

  return {
    ids: Array.from(matched.keys()),
    matched: Array.from(matched.values()),
  };
}

function uniqueExerciseIds(ids: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  ids.forEach((id) => {
    if (id && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  });
  return result;
}

function mergeExerciseIds(primary: string[], secondary: string[]): string[] {
  return uniqueExerciseIds([...primary, ...secondary]);
}

function limitExerciseIds(ids: string[], limit: number): string[] {
  return ids.slice(0, limit);
}

function allowedOperationsForIntent(intent: AIIntent): Set<string> {
  if (intent === 'UPDATE_GOALS') {
    return new Set(['INSERT', 'UPDATE', 'DELETE']);
  }
  return new Set(['INSERT']);
}

function collectExerciseIdsFromPlan(plan: {
  mutations?: Array<{ entityType?: string; proposedState?: Record<string, unknown> }>;
}): string[] {
  const ids: string[] = [];
  for (const mutation of plan.mutations ?? []) {
    if (
      mutation?.entityType === 'program_exercise' ||
      mutation?.entityType === 'workout_set'
    ) {
      const exerciseId = mutation.proposedState?.exercise_id;
      if (typeof exerciseId === 'string') {
        ids.push(exerciseId);
      }
    }
  }
  return ids;
}

function getUnknownExerciseIds(plan: { mutations?: Array<{ entityType?: string; proposedState?: Record<string, unknown> }> }, availableExercises?: unknown[]): string[] {
  if (!Array.isArray(availableExercises) || availableExercises.length === 0) return [];
  const availableIds = new Set(
    availableExercises
      .map((ex) => (ex && typeof ex === 'object' ? (ex as { id?: string }).id : undefined))
      .filter((id): id is string => typeof id === 'string')
  );
  return collectExerciseIdsFromPlan(plan).filter((id) => !availableIds.has(id));
}

async function persistPendingActions(params: {
  adminClient: SupabaseClient;
  userId: string;
  intent: AIIntent;
  requestId: string;
  mutationPlan: {
    mutations: Array<{
      operation?: string;
      entityType: string;
      entityId?: string;
      proposedState?: Record<string, unknown>;
      description?: string;
    }>;
    summary?: string;
    expiresAt?: string;
    conversationId?: string;
  };
}): Promise<void> {
  const actionType = ACTION_TYPE_BY_INTENT[params.intent];
  if (!actionType) {
    return;
  }

  const { data: existing, error: existingError } = await params.adminClient
    .from('ai_pending_actions')
    .select('id')
    .eq('user_id', params.userId)
    .eq('request_id', params.requestId)
    .limit(1);

  if (existingError) {
    console.error('Error checking pending actions:', existingError);
    return;
  }

  if (existing && existing.length > 0) {
    return;
  }

  const expiresAt = params.mutationPlan.expiresAt
    ? params.mutationPlan.expiresAt
    : new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const rows = params.mutationPlan.mutations
    .filter(
      (mutation) =>
        ALLOWED_ENTITY_TYPES.has(mutation.entityType) &&
        allowedOperationsForIntent(params.intent).has(mutation.operation || '')
    )
    .map((mutation) => ({
      user_id: params.userId,
      action_type: actionType,
      entity_type: mutation.entityType,
      target_entity_id: mutation.entityId ?? null,
      proposed_state: sanitizeProposedState(
        mutation.entityType,
        mutation.proposedState,
        params.userId,
        params.intent
      ),
      description: mutation.description || params.mutationPlan.summary || 'Pending AI change',
      expires_at: expiresAt,
      status: 'pending',
      request_id: params.requestId,
      ai_conversation_id: params.mutationPlan.conversationId ?? null,
    }));

  if (rows.length === 0) {
    return;
  }

  const { error: insertError } = await params.adminClient
    .from('ai_pending_actions')
    .insert(rows);

  if (insertError) {
    console.error('Error inserting pending actions:', insertError);
  }
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid authorization', 'UNAUTHORIZED', 401);
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const serviceRoleKey =
      Deno.env.get('SERVICE_ROLE_KEY') ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminClient = serviceRoleKey
      ? createClient(
          Deno.env.get('SUPABASE_URL')!,
          serviceRoleKey
        )
      : null;

    // Parse and validate request body
    const body = await req.json();
    const validationError = validateRequest(body);
    if (validationError) {
      return errorResponse(validationError, 'INVALID_REQUEST', 400);
    }

    const aiRequest = body as AIRequest;
    const config = INTENT_CONFIG[aiRequest.intent];
    const requestId = crypto.randomUUID();

    if (aiRequest.intent === 'MODIFY_PROGRAM' || aiRequest.intent === 'MODIFY_TEMPLATE') {
      return jsonResponse({
        type: 'answer',
        requestId,
        answer: {
          text:
            'Editing existing programs and templates is not enabled yet. I can create a new draft instead. What would you like to build?',
          citations: [],
        },
      });
    }

    // Check rate limits
    const rateLimitResult = await checkRateLimit(supabase, user.id);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        429,
        true,
        rateLimitResult.retryAfterSeconds
      );
    }

    // Assemble context based on intent
    const context = await assembleContext(supabase, user.id, aiRequest, config);

    // Call AI provider
    const response = await callAIProvider(aiRequest, context, config, requestId);

    if (
      response &&
      typeof response === 'object' &&
      'type' in response &&
      (response as { type?: string }).type === 'mutation_plan' &&
      (response as { mutationPlan?: unknown }).mutationPlan
    ) {
      const mutationPlan = (response as { mutationPlan: any }).mutationPlan;
      const unknownExerciseIds = getUnknownExerciseIds(mutationPlan, context.exerciseDb);
      if (unknownExerciseIds.length > 0) {
        return jsonResponse({
          type: 'clarification',
          requestId,
          clarification: {
            question:
              'I couldn’t match a few exercises to your database. Can you pick replacements from your exercise list?',
          },
        });
      }
    }

    if (
      adminClient &&
      response &&
      typeof response === 'object' &&
      'type' in response &&
      (response as { type?: string }).type === 'mutation_plan' &&
      (response as { mutationPlan?: unknown }).mutationPlan
    ) {
      try {
        await persistPendingActions({
          adminClient,
          userId: user.id,
          intent: aiRequest.intent,
          requestId,
          mutationPlan: (response as { mutationPlan: any }).mutationPlan,
        });
      } catch (error) {
        console.error('Failed to persist pending actions:', error);
      }
    }

    return jsonResponse(response);
  } catch (error) {
    console.error('AI endpoint error:', error);
    return errorResponse(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500,
      true
    );
  }
});

// ============================================
// Validation
// ============================================

const VALID_IMAGE_MIME_TYPES: AIImageMimeType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function validateRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object';
  }

  const { intent, message, image } = body as Record<string, unknown>;

  if (!intent || typeof intent !== 'string') {
    return 'Missing or invalid intent';
  }

  if (!(intent in INTENT_CONFIG)) {
    return `Unknown intent: ${intent}`;
  }

  if (!message || typeof message !== 'string') {
    return 'Missing or invalid message';
  }

  if (message.length < 3) {
    return 'Message must be at least 3 characters';
  }

  if (message.length > 2000) {
    return 'Message must be less than 2000 characters';
  }

  // Validate image if present
  if (image) {
    if (typeof image !== 'object') {
      return 'Image must be an object';
    }

    const { base64, mimeType } = image as Record<string, unknown>;

    if (!base64 || typeof base64 !== 'string') {
      return 'Image must have a base64 string';
    }

    if (!mimeType || typeof mimeType !== 'string') {
      return 'Image must have a mimeType';
    }

    if (!VALID_IMAGE_MIME_TYPES.includes(mimeType as AIImageMimeType)) {
      return `Invalid image type. Supported: ${VALID_IMAGE_MIME_TYPES.join(', ')}`;
    }

    // Check base64 size (rough estimate - base64 is ~33% larger than original)
    const estimatedSize = (base64.length * 3) / 4;
    if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
      return `Image too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`;
    }
  }

  return null;
}

// ============================================
// Rate Limiting
// ============================================

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_ai_rate_limit', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Security: Fail CLOSED - block requests if rate limit check fails
    // This prevents bypass attacks if the database is unavailable
    return { allowed: false, retryAfterSeconds: 60 };
  }

  if (!data) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}

// ============================================
// Context Assembly
// ============================================

interface AIContext {
  user: {
    preferredUnits: string;
    timezone: string;
    goals: unknown[];
    latestBodyWeight: {
      weight: number;
      unit: string;
      recordedAt: string;
    } | null;
  };
  exerciseQuery?: {
    query: string;
    matchedExercises: { id: string; name: string; source: 'history' | 'catalog' }[];
  };
  history?: unknown;
  notes?: unknown;
  currentProgram?: unknown;
  exerciseDb?: unknown[];
  analytics?: unknown;
}

async function assembleContext(
  supabase: SupabaseClient,
  userId: string,
  request: AIRequest,
  config: IntentConfig
): Promise<AIContext> {
  const periodWeeks = request.context?.periodWeeks || config.defaultContextWeeks;
  const resolvedFromMessage = request.message
    ? await resolveExerciseMatches(supabase, userId, request.message)
    : { ids: [], matched: [] };
  const resolvedExerciseIds = mergeExerciseIds(
    request.context?.exerciseId ? [request.context.exerciseId] : [],
    resolvedFromMessage.ids
  );

  // Always fetch user preferences (small, fast)
  const { data: userPrefs } = await supabase.rpc('get_user_preferences_for_ai', {
    p_user_id: userId,
  });

  const prefs = userPrefs?.[0] ?? {};
  const latestWeight =
    prefs.latest_body_weight !== undefined && prefs.latest_body_weight !== null
      ? {
          weight: Number(prefs.latest_body_weight),
          unit: String(prefs.latest_body_weight_unit || 'lb'),
          recordedAt: String(prefs.latest_body_weight_at || ''),
        }
      : null;

  const context: AIContext = {
    user: {
      preferredUnits: prefs.preferred_units || 'imperial',
      timezone: prefs.timezone || 'UTC',
      goals: Array.isArray(prefs.goals) ? prefs.goals : [],
      latestBodyWeight: latestWeight,
    },
  };
  if (resolvedFromMessage.matched.length > 0) {
    context.exerciseQuery = {
      query: request.message,
      matchedExercises: resolvedFromMessage.matched,
    };
  }

  // Parallel fetch based on config
  const fetchPromises: Promise<void>[] = [];

  if (config.includeHistory) {
    fetchPromises.push(
      fetchHistorySummary(supabase, userId, periodWeeks).then((data) => {
        context.history = data;
      })
    );
  }

  if (config.includeNotes) {
    fetchPromises.push(
      fetchUserNotes(
        supabase,
        userId,
        resolvedExerciseIds.length > 0 ? limitExerciseIds(resolvedExerciseIds, 5) : undefined
      ).then((data) => {
        context.notes = data;
      })
    );
  }

  if (config.includeProgram && request.context?.programId) {
    fetchPromises.push(
      fetchProgramSummary(supabase, request.context.programId).then((data) => {
        context.currentProgram = data;
      })
    );
  }

  if (config.includeExerciseDb) {
    fetchPromises.push(
      fetchExerciseSubset(
        supabase,
        userId,
        config.exerciseLimit || 50,
        request.context?.historyOnly || false,
        resolvedExerciseIds.length > 0 ? limitExerciseIds(resolvedExerciseIds, 10) : undefined
      ).then((data) => {
        context.exerciseDb = data;
      })
    );
  }

  if (config.includeAnalytics) {
    fetchPromises.push(
      fetchAnalytics(supabase, userId).then((data) => {
        context.analytics = data;
      })
    );
  }

  await Promise.all(fetchPromises);

  return context;
}

async function fetchHistorySummary(
  supabase: SupabaseClient,
  userId: string,
  periodWeeks: number
): Promise<unknown> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodWeeks * 7);

  // Fetch weekly volume from view
  const { data: weeklyVolume } = await supabase
    .from('weekly_workout_volume')
    .select('*')
    .eq('user_id', userId)
    .gte('week_start', startDate.toISOString())
    .order('week_start', { ascending: false });

  // Fetch exercise personal records
  const { data: prs } = await supabase
    .from('exercise_personal_records')
    .select('*')
    .eq('user_id', userId);

  // Fetch recent sessions with exercise summary
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      name,
      started_at,
      completed_at,
      duration_seconds
    `)
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(50);

  // Calculate overview
  const totalWorkouts = sessions?.length || 0;
  const totalVolume = weeklyVolume?.reduce((sum, w) => sum + (w.total_volume || 0), 0) || 0;
  const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
  const recentWeeks = weeklyVolume?.slice(0, 4) || [];
  const previousWeeks = weeklyVolume?.slice(4, 8) || [];
  const avgRecentVolume =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / recentWeeks.length
      : 0;
  const avgPreviousVolume =
    previousWeeks.length > 0
      ? previousWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / previousWeeks.length
      : 0;
  const volumeChangePct =
    avgPreviousVolume > 0 ? ((avgRecentVolume - avgPreviousVolume) / avgPreviousVolume) * 100 : null;
  const avgRecentWorkouts =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + (w.workouts_count || 0), 0) / recentWeeks.length
      : 0;
  const avgPreviousWorkouts =
    previousWeeks.length > 0
      ? previousWeeks.reduce((sum, w) => sum + (w.workouts_count || 0), 0) / previousWeeks.length
      : 0;
  const workoutChangePct =
    avgPreviousWorkouts > 0
      ? ((avgRecentWorkouts - avgPreviousWorkouts) / avgPreviousWorkouts) * 100
      : null;

  return {
    periodWeeks,
    overview: {
      totalWorkouts,
      avgWorkoutsPerWeek: totalWorkouts / Math.max(periodWeeks, 1),
      totalVolume,
      avgDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0,
    },
    weeklyVolume: weeklyVolume?.map((w) => ({
      weekStart: w.week_start,
      workouts: w.workouts_count,
      totalVolume: w.total_volume,
    })),
    trendSignals: {
      avgVolumeRecent4Weeks: Math.round(avgRecentVolume),
      avgVolumePrevious4Weeks: Math.round(avgPreviousVolume),
      volumeChangePct: volumeChangePct !== null ? Math.round(volumeChangePct * 10) / 10 : null,
      avgWorkoutsRecent4Weeks: Math.round(avgRecentWorkouts * 10) / 10,
      avgWorkoutsPrevious4Weeks: Math.round(avgPreviousWorkouts * 10) / 10,
      workoutChangePct: workoutChangePct !== null ? Math.round(workoutChangePct * 10) / 10 : null,
    },
    recentPRs: prs?.slice(0, 10).map((pr) => ({
      exerciseId: pr.exercise_id,
      exerciseName: pr.exercise_name,
      weight: pr.max_weight,
      reps: pr.max_reps,
      estimatedOneRM: pr.estimated_1rm,
      achievedAt: pr.achieved_at,
    })),
  };
}

async function fetchUserNotes(
  supabase: SupabaseClient,
  userId: string,
  exerciseId?: string | string[]
): Promise<unknown> {
  if (Array.isArray(exerciseId) && exerciseId.length > 0) {
    const limitedIds = exerciseId.slice(0, 5);
    const results = await Promise.all(
      limitedIds.map((id) =>
        supabase.rpc('get_exercise_notes_for_ai', {
          p_user_id: userId,
          p_exercise_id: id,
        })
      )
    );
    return {
      exerciseNotes: limitedIds.map((id, index) => ({
        exerciseId: id,
        notes: results[index]?.data ?? [],
      })),
    };
  }

  if (typeof exerciseId === 'string') {
    const { data } = await supabase.rpc('get_exercise_notes_for_ai', {
      p_user_id: userId,
      p_exercise_id: exerciseId,
    });
    return { exerciseNotes: data };
  }

  // Fetch all user notes
  const { data } = await supabase.rpc('get_user_notes_for_ai', {
    p_user_id: userId,
  });

  // Separate sticky notes (high priority) from session notes
  const stickyNotes = data?.filter((n: { note_type: string }) => n.note_type === 'sticky') || [];
  const sessionNotes = data?.filter((n: { note_type: string }) => n.note_type === 'session') || [];

  return {
    stickyNotes: stickyNotes.map((n: { exercise_id: string; exercise_name: string; content: string; set_index: number | null }) => ({
      exerciseId: n.exercise_id,
      exerciseName: n.exercise_name,
      content: n.content,
      setIndex: n.set_index,
    })),
    recentSessionNotes: sessionNotes.slice(0, 20).map((n: { exercise_id: string; exercise_name: string; content: string; session_date: string }) => ({
      exerciseId: n.exercise_id,
      exerciseName: n.exercise_name,
      content: n.content,
      sessionDate: n.session_date,
    })),
  };
}

async function fetchProgramSummary(
  supabase: SupabaseClient,
  programId: string
): Promise<unknown> {
  const { data: program } = await supabase
    .from('workout_programs')
    .select(`
      id,
      name,
      description,
      difficulty,
      goal,
      duration_weeks,
      program_workouts (
        id,
        name,
        day_number,
        program_exercises (
          id,
          exercise_id,
          order_index,
          sets,
          reps,
          rest_seconds,
          notes,
          exercises (
            name
          )
        )
      )
    `)
    .eq('id', programId)
    .single();

  if (!program) return null;

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    difficulty: program.difficulty,
    goal: program.goal,
    durationWeeks: program.duration_weeks,
    workouts: program.program_workouts
      ?.sort((a, b) => a.day_number - b.day_number)
      .map((w) => ({
        id: w.id,
        name: w.name,
        dayNumber: w.day_number,
        exercises: w.program_exercises
          ?.sort((a, b) => a.order_index - b.order_index)
          .map((e) => ({
            exerciseId: e.exercise_id,
            exerciseName: e.exercises?.name,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.rest_seconds,
            notes: e.notes,
          })),
      })),
  };
}

async function fetchExerciseSubset(
  supabase: SupabaseClient,
  userId: string,
  limit: number,
  historyOnly: boolean,
  specificExerciseId?: string | string[]
): Promise<unknown[]> {
  if (Array.isArray(specificExerciseId) && specificExerciseId.length > 0) {
    const { data } = await supabase
      .from('exercises')
      .select('id, name, force, level, mechanic, equipment, category, primary_muscles, secondary_muscles, instructions')
      .in('id', specificExerciseId);
    return data || [];
  }

  if (typeof specificExerciseId === 'string') {
    const { data } = await supabase
      .from('exercises')
      .select('id, name, force, level, mechanic, equipment, category, primary_muscles, secondary_muscles, instructions')
      .eq('id', specificExerciseId)
      .single();
    return data ? [data] : [];
  }

  // Fetch user's historical exercises first (most relevant)
  const { data: userExercises } = await supabase
    .from('workout_sets')
    .select('exercise_id, exercises(id, name, force, level, mechanic, equipment, category, primary_muscles, secondary_muscles, instructions)')
    .eq('session_id', supabase.from('workout_sessions').select('id').eq('user_id', userId))
    .order('created_at', { ascending: false })
    .limit(limit);

  // Dedupe by exercise ID
  const seen = new Set<string>();
  const exercises: unknown[] = [];

  userExercises?.forEach((ws) => {
    if (ws.exercises && !seen.has(ws.exercises.id)) {
      seen.add(ws.exercises.id);
      exercises.push(ws.exercises);
    }
  });

  // If history-only mode or we have enough, return
  if (historyOnly || exercises.length >= limit) {
    return exercises.slice(0, limit);
  }

  // Fill remaining slots with popular exercises
  const remaining = limit - exercises.length;
  if (remaining > 0) {
    const { data: popularExercises } = await supabase
      .from('exercises')
      .select('id, name, force, level, mechanic, equipment, category, primary_muscles, secondary_muscles, instructions')
      .eq('is_custom', false)
      .in('category', ['strength', 'powerlifting'])
      .limit(remaining);

    popularExercises?.forEach((ex) => {
      if (!seen.has(ex.id)) {
        seen.add(ex.id);
        exercises.push(ex);
      }
    });
  }

  return exercises;
}

async function fetchAnalytics(
  supabase: SupabaseClient,
  userId: string
): Promise<unknown> {
  // Fetch user workout stats
  const { data: userStats } = await supabase
    .from('user_workout_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch muscle group frequency
  const { data: muscleFrequency } = await supabase
    .from('muscle_group_frequency')
    .select('*')
    .eq('user_id', userId)
    .order('times_trained', { ascending: false });

  return {
    userStats: userStats
      ? {
          totalWorkouts: userStats.total_workouts,
          totalWorkoutDays: userStats.total_workout_days,
          totalTimeSeconds: userStats.total_time_seconds,
          avgWorkoutDuration: userStats.avg_workout_duration,
          lastWorkoutDate: userStats.last_workout_date,
          uniqueExercisesPerformed: userStats.unique_exercises_performed,
          totalVolume: userStats.total_volume,
        }
      : null,
    muscleGroupFrequency: muscleFrequency?.map((m) => ({
      muscleGroup: m.muscle_group,
      timesTrained: m.times_trained,
      totalVolume: m.total_volume,
      lastTrained: m.last_trained,
    })),
  };
}

// ============================================
// Model Provider Integration
// ============================================

type AIProvider = 'anthropic' | 'openai';

function resolveAIProvider(): AIProvider {
  const configured = Deno.env.get('AI_PROVIDER');
  if (configured === 'openai' || configured === 'anthropic') {
    return configured;
  }

  if (Deno.env.get('ANTHROPIC_API_KEY')) {
    return 'anthropic';
  }

  if (Deno.env.get('OPENAI_API_KEY')) {
    return 'openai';
  }

  return 'anthropic';
}

async function callAIProvider(
  request: AIRequest,
  context: AIContext,
  config: IntentConfig,
  requestId: string
): Promise<unknown> {
  const provider = resolveAIProvider();
  const systemPrompt = buildSystemPrompt(request.intent, config, context);
  const userMessage = buildUserMessage(request, context);

  const responseText =
    provider === 'openai'
      ? await callOpenAIText(request, systemPrompt, userMessage)
      : await callClaudeText(request, systemPrompt, userMessage);

  return parseModelResponse(responseText, request.intent, config, requestId);
}

async function callClaudeText(
  request: AIRequest,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  // Security: Validate API key exists before using
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('AI service configuration error');
  }

  const anthropic = new Anthropic({ apiKey });

  // Build message content - text only or multi-modal with image
  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

  const contentBlocks: ContentBlock[] = [];

  // Add image first if present (Claude processes images better when they come first)
  if (request.image) {
    contentBlocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: request.image.mimeType,
        data: request.image.base64,
      },
    });
  }

  // Add text message
  contentBlocks.push({
    type: 'text',
    text: userMessage,
  });

  try {
    const response = await anthropic.messages.create({
      model: Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to get AI response');
  }
}

async function callOpenAIText(
  request: AIRequest,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('AI service configuration error');
  }

  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: systemPrompt },
  ];

  if (request.image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userMessage },
        {
          type: 'image_url',
          image_url: {
            url: `data:${request.image.mimeType};base64,${request.image.base64}`,
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error('Failed to get AI response');
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Unexpected response from OpenAI');
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part?.type === 'text' ? part.text : ''))
      .join('');
  }

  return String(content);
}

function buildSystemPrompt(
  intent: AIIntent,
  config: IntentConfig,
  context: AIContext
): string {
  const intentGuidance =
    intent === 'ANALYZE_PLATEAU'
      ? '\nPLATEAU ANALYSIS:\n- Explain likely causes using trends in volume, intensity, frequency, and exercise variation.\n- Call out missing data if the evidence is incomplete.'
      : intent === 'ANALYZE_OVERLOAD'
      ? '\nOVERLOAD ANALYSIS:\n- Assess progressive overload using changes in volume, estimated 1RM, or rep PRs over time.\n- If the signal is weak or inconsistent, say so and explain what would improve confidence.'
      : '';

  const basePrompt = `You are Fortis AI, an assistant for a strength training workout app. You help users with their training by providing data-driven insights and creating workout programs.

CORE PRINCIPLES:
- Be a helpful data analyst. Surface patterns, trends, and evidence-backed insights.
- Never invent data. Use only the provided context.
- If evidence is weak or missing, say so explicitly and explain why. Do not hedge when evidence is strong.
- Ask clarifying questions when details are required to create safe drafts.
- When a user asks to create or log a workout/program, respond with a draft (mutation plan) instead of saying you cannot.
- When suggesting exercises the user hasn't done before, explain why and provide brief form cues.
- Be concise but thorough. Prioritize actionable information.
- Never provide medical advice. If injury/pain is mentioned, suggest consulting a healthcare provider.
- If EXERCISE QUERY MATCHES are provided, treat them as the related movements the user is referring to and use them for analysis unless the user asks for a specific variation.

USER PREFERENCES:
- Units: ${context.user.preferredUnits}
- Timezone: ${context.user.timezone}${intentGuidance}`;

  if (config.type === 'read') {
    return `${basePrompt}

RESPONSE FORMAT:
If you need more details to answer safely, respond with:
{
  "type": "clarification",
  "clarification": {
    "question": "Your question here",
    "options": ["optional", "choices"]
  }
}

Otherwise, respond with:
{
  "type": "answer",
  "answer": {
    "text": "Your response here in markdown format",
    "citations": [{ "type": "exercise|session|set", "id": "uuid", "context": "brief context" }]
  }
}

Citations are optional but encouraged when referencing specific data points.`;
  }

  // Write intent system prompt
  return `${basePrompt}

RESPONSE FORMAT:
If you need more details to build a safe draft, respond with:
{
  "type": "clarification",
  "clarification": {
    "question": "Your question here",
    "options": ["optional", "choices"]
  }
}

Otherwise, respond with a JSON object containing a mutation plan:
{
  "type": "mutation_plan",
  "mutationPlan": {
    "summary": "Brief 1-line summary of what will be created",
    "explanation": "2-3 sentence explanation of your approach and reasoning",
    "mutations": [
      {
        "mutationId": "unique-id",
        "order": 1,
        "operation": "INSERT",
        "entityType": "workout_program|program_workout|program_exercise|workout_session|workout_set",
        "proposedState": { /* new values */ },
        "description": "Human-readable description of this change",
        "dependsOn": ["other-mutation-ids"]
      }
    ],
    "exerciseResolution": [
      {
        "exerciseId": "uuid",
        "exerciseName": "Exercise Name",
        "fromHistory": true|false,
        "justification": "Required if fromHistory=false",
        "explanation": "Brief form cue if new to user"
      }
    ]
  }
}

WRITE RULES:
- If intent is UPDATE_GOALS, you may use INSERT, UPDATE, or DELETE mutations on user_goal only.
- Otherwise, create-only. Do not include UPDATE or DELETE mutations.
- If the user asks to edit or delete existing programs or workouts, respond with a clarification or explain that editing is not available yet.
GOAL UPDATE NOTES (UPDATE_GOALS):
- Use the USER GOALS list in context to find existing goal ids.
- For updates or deletes, include entityId for the goal being changed.

EXERCISE SELECTION RULES:
1. Prefer exercises from the user's history when possible
2. If suggesting a new exercise, you MUST provide justification (variation, injury workaround, equipment swap, or stimulus gap)
3. Always explain unfamiliar exercises with brief form cues
4. Use ONLY exercises from the AVAILABLE EXERCISES list. Copy the exercise_id exactly; do not invent new exercises or ids.

ENTITY SCHEMAS:
- workout_program: { name, description, difficulty (beginner|intermediate|advanced), duration_weeks, goal (strength|hypertrophy|powerlifting|general_fitness), is_template (boolean), is_ai_created (boolean) }
- program_workout: { name, description, day_number }
- program_exercise: { exercise_id, order_index, sets (number), reps (string like "5-8"), rest_seconds, notes }
- workout_session: { started_at, completed_at }
- workout_set: { session_id, exercise_id, set_number, order_index, reps, weight, rpe, set_type }
- training_summary: { period_start, period_end, title, summary_text, metrics }
- user_goal: { goal_name, goal_type, description, target_metrics, target_date, priority, is_active }`;
}

function buildUserMessage(request: AIRequest, context: AIContext): string {
  let message = `Intent: ${request.intent}\n\nUser message: ${request.message}`;

  if (request.image && request.intent === 'CREATE_TEMPLATE') {
    message += `\n\n--- IMAGE EXTRACTION INSTRUCTIONS (TEMPLATE) ---
You have been provided an image of a workout plan. Extract a single workout template:

1. **Exercises**: Identify all exercises shown. Match to exercise names in the AVAILABLE EXERCISES list below.
2. **Sets/Reps**: Extract the prescribed sets and reps for each exercise (use format like "3" for sets, "8-12" for reps).
3. **Order**: Maintain the order of exercises as shown in the image (top to bottom, left to right).
4. **Rest periods**: If shown, include rest times in seconds. Otherwise omit.
5. **Name**: Create a descriptive name for the template (e.g., "Upper Body Push", "Leg Day").

Create mutations for:
- One workout_program (set is_template: true, is_ai_created: true)
- One program_workout (the single workout day)
- Multiple program_exercise entries (one per exercise found)

If key details are missing, return a clarification question instead of guessing.`;
  }

  if (request.image && request.intent === 'CREATE_PROGRAM') {
    message += `\n\n--- IMAGE EXTRACTION INSTRUCTIONS (PROGRAM) ---
You have been provided an image of a multi-day program. Extract the full program:

1. **Days**: Identify each training day or workout shown.
2. **Exercises**: For each day, list exercises and match names to the AVAILABLE EXERCISES list below.
3. **Sets/Reps**: Extract prescribed sets and reps for each exercise.
4. **Order**: Preserve exercise order for each day.
5. **Name**: Create a descriptive program name and a short description.

Create mutations for:
- One workout_program (set is_template: false, is_ai_created: true)
- One program_workout per day (with day_number)
- Multiple program_exercise entries per workout

If the image only shows one day or lacks program schedule (days per week, duration), return a clarification question before creating a program.`;
  }

  if (request.image && request.intent === 'LOG_WORKOUT') {
    message += `\n\n--- IMAGE EXTRACTION INSTRUCTIONS (LOG WORKOUT) ---
You have been provided an image of a completed workout (whiteboard, notes, or screenshot). Extract:

1. **Exercises**: Identify exercises and match names to the AVAILABLE EXERCISES list below.
2. **Sets/Reps/Weight**: Extract as precisely as possible.
3. **Order**: Keep the order shown in the image.

Create mutations for:
- One workout_session
- Multiple workout_set entries

If key details are unclear, return a clarification question instead of guessing.`;
  }

  if (context.user.goals && context.user.goals.length > 0) {
    message += `\n\n--- USER GOALS ---\n${JSON.stringify(context.user.goals, null, 2)}`;
  }

  if (context.user.latestBodyWeight) {
    message += `\n\n--- LATEST BODY WEIGHT ---\n${JSON.stringify(context.user.latestBodyWeight, null, 2)}`;
  }

  if (context.exerciseQuery) {
    message += `\n\n--- EXERCISE QUERY MATCHES ---\n${JSON.stringify(context.exerciseQuery, null, 2)}`;
  }

  if (context.history) {
    message += `\n\n--- TRAINING HISTORY ---\n${JSON.stringify(context.history, null, 2)}`;
  }

  if (context.notes) {
    message += `\n\n--- USER NOTES ---\n${JSON.stringify(context.notes, null, 2)}`;
  }

  if (context.currentProgram) {
    message += `\n\n--- CURRENT PROGRAM ---\n${JSON.stringify(context.currentProgram, null, 2)}`;
  }

  if (context.exerciseDb && context.exerciseDb.length > 0) {
    message += `\n\n--- AVAILABLE EXERCISES ---\n${JSON.stringify(context.exerciseDb, null, 2)}`;
  }

  if (context.analytics) {
    message += `\n\n--- ANALYTICS ---\n${JSON.stringify(context.analytics, null, 2)}`;
  }

  return message;
}

function parseModelResponse(
  text: string,
  intent: AIIntent,
  config: IntentConfig,
  requestId: string
): unknown {
  try {
    // Try to extract JSON from response (Claude sometimes wraps in markdown)
    let jsonStr = text;
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed || typeof parsed !== 'object') {
      return buildModelError(requestId, 'Invalid AI response format');
    }

    if (parsed.type === 'clarification') {
      return { ...parsed, requestId };
    }

    if (parsed.type === 'answer') {
      if (config.type === 'write') {
        return buildWriteClarification(intent, requestId);
      }
      return { ...parsed, requestId };
    }

    if (parsed.type === 'mutation_plan') {
      if (config.type !== 'write') {
        return buildModelError(requestId, 'Mutation plan not allowed for read intent');
      }

      const validationError = validateMutationPlan(intent, parsed.mutationPlan);
      if (validationError) {
        return buildModelError(requestId, validationError);
      }

      return {
        ...parsed,
        requestId,
        mutationPlan: {
          ...parsed.mutationPlan,
          requestId,
          intent,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        },
      };
    }

    return buildModelError(requestId, 'Unsupported AI response type');
  } catch {
    if (config.type === 'read') {
      return {
        type: 'answer',
        requestId,
        answer: {
          text: text,
          citations: [],
        },
      };
    }

    return buildModelError(requestId, 'Failed to parse AI response');
  }
}

function buildModelError(requestId: string, message: string) {
  return {
    type: 'error',
    requestId,
    error: {
      code: 'LLM_ERROR',
      message,
      retryable: false,
    },
  };
}

function buildWriteClarification(intent: AIIntent, requestId: string) {
  const base = {
    type: 'clarification',
    requestId,
    clarification: {
      question: '',
      options: [] as string[],
    },
  };

  if (intent === 'CREATE_PROGRAM') {
    return {
      ...base,
      clarification: {
        question:
          'I can draft a program, but need a few details: days per week, duration in weeks, and your main goal. What should I use?',
        options: ['3 days/week • 8 weeks • strength', '4 days/week • 8 weeks • hypertrophy'],
      },
    };
  }

  if (intent === 'CREATE_TEMPLATE') {
    return {
      ...base,
      clarification: {
        question:
          'I can draft a workout template. What focus and equipment should I use?',
        options: ['Push day • full gym', 'Upper body • dumbbells only'],
      },
    };
  }

  if (intent === 'LOG_WORKOUT') {
    return {
      ...base,
      clarification: {
        question:
          'I can log this workout, but I need the exercises and sets/reps/weight. Can you list them?',
      },
    };
  }

  if (intent === 'UPDATE_GOALS') {
    return {
      ...base,
      clarification: {
        question:
          'I can update your goals. What should I add, change, or remove?',
      },
    };
  }

  return {
    ...base,
    clarification: {
      question: 'I need a bit more detail to create a draft. What should I use?',
    },
  };
}

function validateMutationPlan(intent: AIIntent, plan: any): string | null {
  if (!plan || typeof plan !== 'object') {
    return 'Missing mutation plan';
  }

  if (!Array.isArray(plan.mutations) || plan.mutations.length === 0) {
    return 'Mutation plan must include at least one mutation';
  }

  const allowedOperations = allowedOperationsForIntent(intent);
  const hasProgram = plan.mutations.some(
    (mutation: any) => mutation?.entityType === 'workout_program'
  );

  if ((intent === 'CREATE_TEMPLATE' || intent === 'CREATE_PROGRAM') && !hasProgram) {
    return 'Workout program mutation is required';
  }

  for (const mutation of plan.mutations) {
    if (!mutation || typeof mutation !== 'object') {
      return 'Invalid mutation format';
    }

    if (!allowedOperations.has(mutation.operation)) {
      return intent === 'UPDATE_GOALS'
        ? 'Goal updates must use INSERT, UPDATE, or DELETE operations'
        : 'Only INSERT operations are allowed';
    }

    if (!ALLOWED_ENTITY_TYPES.has(mutation.entityType)) {
      return `Unsupported entity type: ${String(mutation.entityType)}`;
    }

    if (mutation.operation !== 'DELETE' && (!mutation.proposedState || typeof mutation.proposedState !== 'object')) {
      return 'Missing proposedState for mutation';
    }

    if (mutation.operation !== 'INSERT' && !mutation.entityId) {
      return 'Update and delete mutations require entityId';
    }

    if (intent === 'UPDATE_GOALS' && mutation.entityType !== 'user_goal') {
      return 'Goal updates can only modify user_goal entities';
    }

    if (intent !== 'UPDATE_GOALS' && mutation.entityType === 'user_goal') {
      return 'User goals can only be modified via UPDATE_GOALS intent';
    }

    if (mutation.entityType === 'workout_program') {
      if (!mutation.proposedState.name || !mutation.proposedState.difficulty) {
        return 'Workout program requires name and difficulty';
      }
    }

    if (mutation.entityType === 'program_workout') {
      if (!mutation.proposedState.name || mutation.proposedState.day_number === undefined) {
        return 'Program workout requires name and day_number';
      }
    }

    if (mutation.entityType === 'program_exercise') {
      if (!mutation.proposedState.exercise_id || mutation.proposedState.order_index === undefined) {
        return 'Program exercise requires exercise_id and order_index';
      }
      if (!isValidUuid(mutation.proposedState.exercise_id)) {
        return 'Program exercise requires a valid exercise_id';
      }
      if (mutation.proposedState.sets === undefined) {
        return 'Program exercise requires sets';
      }
    }

    if (mutation.entityType === 'workout_session') {
      if (!mutation.proposedState.started_at) {
        return 'Workout session requires started_at';
      }
    }

    if (mutation.entityType === 'workout_set') {
      if (!mutation.proposedState.session_id) {
        return 'Workout set requires session_id';
      }
      if (!mutation.proposedState.exercise_id) {
        return 'Workout set requires exercise_id';
      }
      if (!isValidUuid(mutation.proposedState.exercise_id)) {
        return 'Workout set requires a valid exercise_id';
      }
      if (mutation.proposedState.set_number === undefined) {
        return 'Workout set requires set_number';
      }
      if (mutation.proposedState.order_index === undefined) {
        return 'Workout set requires order_index';
      }
    }

    if (mutation.entityType === 'user_goal' && mutation.operation === 'INSERT') {
      if (!mutation.proposedState.goal_name) {
        return 'User goal requires goal_name';
      }
    }

    if (mutation.entityType === 'training_summary') {
      if (!mutation.proposedState.period_start || !mutation.proposedState.period_end) {
        return 'Training summary requires period_start and period_end';
      }
      if (!mutation.proposedState.title || !mutation.proposedState.summary_text) {
        return 'Training summary requires title and summary_text';
      }
      if (!mutation.proposedState.metrics) {
        return 'Training summary requires metrics';
      }
    }
  }

  return null;
}
