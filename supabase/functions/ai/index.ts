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
  | 'ANALYZE_PROGRAM'
  | 'EXPLAIN_EXERCISE'
  | 'CREATE_PROGRAM'
  | 'MODIFY_PROGRAM'
  | 'CREATE_TEMPLATE'
  | 'MODIFY_TEMPLATE'
  | 'LOG_WORKOUT'
  | 'GENERATE_SUMMARY';

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
};

const ACTION_TYPE_BY_INTENT: Partial<Record<AIIntent, string>> = {
  CREATE_PROGRAM: 'create_program',
  MODIFY_PROGRAM: 'modify_program',
  CREATE_TEMPLATE: 'create_template',
  MODIFY_TEMPLATE: 'modify_template',
  LOG_WORKOUT: 'log_workout',
};

const ALLOWED_ENTITY_TYPES = new Set<string>([
  'workout_program',
  'program_workout',
  'program_exercise',
  'workout_session',
  'workout_set',
]);

function sanitizeProposedState(
  entityType: string,
  proposedState: Record<string, unknown> | undefined,
  userId: string
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...(proposedState || {}) };

  if (entityType === 'workout_program') {
    sanitized.created_by = userId;
  }

  if (entityType === 'workout_session') {
    sanitized.user_id = userId;
  }

  return sanitized;
}

async function persistPendingActions(params: {
  adminClient: SupabaseClient;
  userId: string;
  intent: AIIntent;
  requestId: string;
  mutationPlan: {
    mutations: Array<{
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
    .filter((mutation) => ALLOWED_ENTITY_TYPES.has(mutation.entityType))
    .map((mutation) => ({
      user_id: params.userId,
      action_type: actionType,
      entity_type: mutation.entityType,
      target_entity_id: mutation.entityId ?? null,
      proposed_state: sanitizeProposedState(
        mutation.entityType,
        mutation.proposedState,
        params.userId
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

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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

    // Generate request ID for tracking
    const requestId = crypto.randomUUID();

    // Assemble context based on intent
    const context = await assembleContext(supabase, user.id, aiRequest, config);

    // Call Claude API
    const response = await callClaude(aiRequest, context, config, requestId);

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
    // Fail open but log - don't block user due to rate limit errors
    return { allowed: true };
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
  user: { preferredUnits: string; timezone: string };
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

  // Always fetch user preferences (small, fast)
  const { data: userPrefs } = await supabase.rpc('get_user_preferences_for_ai', {
    p_user_id: userId,
  });

  const context: AIContext = {
    user: {
      preferredUnits: userPrefs?.[0]?.preferred_units || 'imperial',
      timezone: userPrefs?.[0]?.timezone || 'UTC',
    },
  };

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
      fetchUserNotes(supabase, userId, request.context?.exerciseId).then((data) => {
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
        request.context?.exerciseId
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
  exerciseId?: string
): Promise<unknown> {
  if (exerciseId) {
    // Fetch notes for specific exercise
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
  specificExerciseId?: string
): Promise<unknown[]> {
  // If specific exercise requested, just fetch that one
  if (specificExerciseId) {
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
// Claude API Integration
// ============================================

async function callClaude(
  request: AIRequest,
  context: AIContext,
  config: IntentConfig,
  requestId: string
): Promise<unknown> {
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
  });

  const systemPrompt = buildSystemPrompt(request.intent, config, context);
  const userMessage = buildUserMessage(request, context);

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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return parseClaudeResponse(content.text, request.intent, config, requestId);
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to get AI response');
  }
}

function buildSystemPrompt(
  intent: AIIntent,
  config: IntentConfig,
  context: AIContext
): string {
  const basePrompt = `You are Fortis AI, an assistant for a strength training workout app. You help users with their training by providing data-driven insights and creating workout programs.

CORE PRINCIPLES:
- You are a tool, not a coach. Provide information and suggestions, don't command.
- Base all recommendations on the user's actual training data.
- When suggesting exercises the user hasn't done before, always explain why and provide form cues.
- Be concise but thorough. Prioritize actionable information.
- Never provide medical advice. If injury/pain is mentioned, suggest consulting a healthcare provider.

USER PREFERENCES:
- Units: ${context.user.preferredUnits}
- Timezone: ${context.user.timezone}`;

  if (config.type === 'read') {
    return `${basePrompt}

RESPONSE FORMAT:
For this read-only query, respond with a JSON object:
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
For this write operation, respond with a JSON object containing a mutation plan:
{
  "type": "mutation_plan",
  "mutationPlan": {
    "summary": "Brief 1-line summary of what will be created/modified",
    "explanation": "2-3 sentence explanation of your approach and reasoning",
    "mutations": [
      {
        "mutationId": "unique-id",
        "order": 1,
        "operation": "INSERT|UPDATE|DELETE",
        "entityType": "workout_program|program_workout|program_exercise|workout_session|workout_set",
        "entityId": "uuid (for UPDATE/DELETE only)",
        "proposedState": { /* new values */ },
        "previousState": { /* old values for UPDATE only */ },
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

EXERCISE SELECTION RULES:
1. Prefer exercises from the user's history when possible
2. If suggesting a new exercise, you MUST provide justification (variation, injury workaround, equipment swap, or stimulus gap)
3. Always explain unfamiliar exercises with brief form cues

ENTITY SCHEMAS:
- workout_program: { name, description, difficulty (beginner|intermediate|advanced), duration_weeks, goal (strength|hypertrophy|powerlifting|general_fitness) }
- program_workout: { name, description, day_number }
- program_exercise: { exercise_id, order_index, sets (number), reps (string like "5-8"), rest_seconds, notes }`;
}

function buildUserMessage(request: AIRequest, context: AIContext): string {
  let message = `Intent: ${request.intent}\n\nUser message: ${request.message}`;

  // Image-to-template extraction instructions
  if (request.image && (request.intent === 'CREATE_TEMPLATE' || request.intent === 'CREATE_PROGRAM')) {
    message += `\n\n--- IMAGE EXTRACTION INSTRUCTIONS ---
You have been provided an image of a workout plan. Extract a workout template from this image:

1. **Exercises**: Identify all exercises shown. Match to exercise names in the AVAILABLE EXERCISES list below.
2. **Sets/Reps**: Extract the prescribed sets and reps for each exercise (use format like "3" for sets, "8-12" for reps).
3. **Order**: Maintain the order of exercises as shown in the image (top to bottom, left to right).
4. **Rest periods**: If shown, include rest times in seconds. Otherwise omit.
5. **Name**: Create a descriptive name for the template based on the content (e.g., "Upper Body Push", "Leg Day").

Create mutations for:
- One workout_program (the template container, set is_ai_created: true)
- One program_workout (the single workout day)
- Multiple program_exercise entries (one per exercise found)

If any exercise names are unclear or abbreviated, make your best interpretation and match to the closest exercise in the database. Note any ambiguities in the exerciseResolution justification.`;
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

function parseClaudeResponse(
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

    // Add requestId to response
    return {
      ...parsed,
      requestId,
      ...(parsed.mutationPlan && {
        mutationPlan: {
          ...parsed.mutationPlan,
          requestId,
          intent,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        },
      }),
    };
  } catch {
    // If JSON parsing fails, wrap as answer
    return {
      type: 'answer',
      requestId,
      answer: {
        text: text,
        citations: [],
      },
    };
  }
}
