import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import {
  AIBaseContext,
  buildCacheKey,
  compactJson,
  fetchAIUserContext,
  fetchAnalytics,
  fetchHistorySummary,
  withContextCache,
} from '../_shared/ai-context.ts';

type AICoachPersonality = 'direct' | 'drill_sergeant' | 'hype';
type AICoachVoice = 'marin' | 'cedar' | 'coral' | 'verse' | 'sage';

interface RealtimeCoachPreferences {
  personality: AICoachPersonality;
  intensity: number;
  voice: AICoachVoice;
}

interface RealtimeSessionRequest {
  preferences?: Partial<RealtimeCoachPreferences>;
  aiDataSharingConsent?: boolean;
}

const VOICES: AICoachVoice[] = ['marin', 'cedar', 'coral', 'verse', 'sage'];
const PERSONALITIES: AICoachPersonality[] = ['direct', 'drill_sergeant', 'hype'];
const MAX_SECONDS_PER_SESSION = Math.max(60, Number(Deno.env.get('AI_REALTIME_MAX_SESSION_SECONDS') ?? '300'));
const MAX_SECONDS_PER_DAY = Math.max(MAX_SECONDS_PER_SESSION, Number(Deno.env.get('AI_REALTIME_MAX_DAY_SECONDS') ?? '1200'));
const MAX_SECONDS_UNLIMITED = 24 * 60 * 60;
const VOICE_COACH_CONTEXT_WEEKS = Math.max(
  4,
  Number(Deno.env.get('AI_REALTIME_CONTEXT_WEEKS') ?? '12')
);
const GEMINI_LIVE_MODEL = Deno.env.get('GEMINI_LIVE_MODEL') || 'gemini-3.1-flash-live-preview';
const GEMINI_LIVE_ENDPOINT =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';

const GEMINI_VOICE_BY_COACH_VOICE: Record<AICoachVoice, string> = {
  marin: 'Kore',
  cedar: 'Puck',
  coral: 'Aoede',
  verse: 'Charon',
  sage: 'Fenrir',
};

const isVoice = (value: unknown): value is AICoachVoice =>
  typeof value === 'string' && VOICES.includes(value as AICoachVoice);

const isPersonality = (value: unknown): value is AICoachPersonality =>
  typeof value === 'string' && PERSONALITIES.includes(value as AICoachPersonality);

function normalizePreferences(value: unknown): RealtimeCoachPreferences {
  const candidate = value && typeof value === 'object'
    ? value as Partial<RealtimeCoachPreferences>
    : {};
  const intensity = typeof candidate.intensity === 'number' && Number.isFinite(candidate.intensity)
    ? Math.min(1, Math.max(0, candidate.intensity))
    : 0.55;

  return {
    personality: isPersonality(candidate.personality) ? candidate.personality : 'direct',
    voice: isVoice(candidate.voice) ? candidate.voice : 'marin',
    intensity,
  };
}

type VoiceCoachTrainingContext = AIBaseContext & {
  contextWeeks: number;
};

function hasRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function buildVoiceCoachContextPayload(context: VoiceCoachTrainingContext): Record<string, unknown> {
  const history = hasRecord(context.history) ? context.history : {};
  const overview = hasRecord(history.overview) ? history.overview : {};
  const trendSignals = hasRecord(history.trendSignals) ? history.trendSignals : {};
  const analytics = hasRecord(context.analytics) ? context.analytics : {};
  const userStats = hasRecord(analytics.userStats) ? analytics.userStats : null;
  const muscleFrequency = Array.isArray(analytics.muscleGroupFrequency)
    ? analytics.muscleGroupFrequency
      .filter(hasRecord)
      .map((entry) => ({
        muscleGroup: stringOrNull(entry.muscleGroup),
        timesTrained: numberOrNull(entry.timesTrained),
        totalVolume: numberOrNull(entry.totalVolume),
        lastTrained: stringOrNull(entry.lastTrained),
      }))
      .filter((entry) => entry.muscleGroup)
    : [];

  return {
    scope: 'voice_coach_session_start',
    recentTrainingWindowWeeks: context.contextWeeks,
    userPreferences: {
      preferredUnits: context.user.preferredUnits,
      timezone: context.user.timezone,
      goals: context.user.goals,
      trainingExperience: context.user.trainingExperience,
      trainingEnvironment: context.user.trainingEnvironment,
      latestBodyWeight: context.user.latestBodyWeight,
    },
    recentTrainingSummary: {
      totalWorkouts: numberOrNull(overview.totalWorkouts),
      avgWorkoutsPerWeek: numberOrNull(overview.avgWorkoutsPerWeek),
      totalVolume: numberOrNull(overview.totalVolume),
      totalDurationMinutes: numberOrNull(overview.totalDurationMinutes),
      avgDurationMinutes: numberOrNull(overview.avgDurationMinutes),
      avgVolumeRecent4Weeks: numberOrNull(trendSignals.avgVolumeRecent4Weeks),
      avgVolumePrevious4Weeks: numberOrNull(trendSignals.avgVolumePrevious4Weeks),
      volumeChangePct: numberOrNull(trendSignals.volumeChangePct),
      avgWorkoutsRecent4Weeks: numberOrNull(trendSignals.avgWorkoutsRecent4Weeks),
      avgWorkoutsPrevious4Weeks: numberOrNull(trendSignals.avgWorkoutsPrevious4Weeks),
      workoutChangePct: numberOrNull(trendSignals.workoutChangePct),
    },
    lifetimeAnalytics: {
      totalWorkouts: userStats ? numberOrNull(userStats.totalWorkouts) : null,
      totalWorkoutDays: userStats ? numberOrNull(userStats.totalWorkoutDays) : null,
      totalTimeSeconds: userStats ? numberOrNull(userStats.totalTimeSeconds) : null,
      avgWorkoutDuration: userStats ? numberOrNull(userStats.avgWorkoutDuration) : null,
      lastWorkoutDate: userStats ? stringOrNull(userStats.lastWorkoutDate) : null,
      uniqueExercisesPerformed: userStats ? numberOrNull(userStats.uniqueExercisesPerformed) : null,
      totalVolume: userStats ? numberOrNull(userStats.totalVolume) : null,
      mostTrainedMuscleGroups: muscleFrequency.slice(0, 6),
      leastTrainedMuscleGroups: muscleFrequency.slice(-6).reverse(),
    },
  };
}

function buildTrainingContextInstructions(context: VoiceCoachTrainingContext | null): string {
  if (!context) {
    return `\nPersonalization context: unavailable for this voice session.
- Do not claim access to the user's training history, preferences, goals, or analytics unless the user states them in the conversation.`;
  }

  return `\nPersonalization context:
The following JSON is trusted Fortify app context for this user. Use it when relevant, but never imply data that is not present. If the user asks for a detail not included here, say you do not have enough detail and ask one short follow-up only if needed.
${compactJson(buildVoiceCoachContextPayload(context))}`;
}

function buildInstructions(
  preferences: RealtimeCoachPreferences,
  trainingContext: VoiceCoachTrainingContext | null = null
): string {
  const intensityLabel = preferences.intensity < 0.34
    ? 'calm'
    : preferences.intensity < 0.67
    ? 'sharp'
    : 'hard-edged';
  const persona =
    preferences.personality === 'drill_sergeant'
      ? 'You are a blunt strength coach. Be demanding and confront weak training decisions, but only critique behavior, effort, and logged training choices. No body shaming, identity attacks, slurs, sexual content, protected-trait references, or medical claims.'
      : preferences.personality === 'hype'
      ? 'You are a high-energy strength coach. Celebrate wins, keep momentum high, and make the user feel ready to train.'
      : 'You are a direct strength coach. Be specific, useful, concise, and a little challenging.';

  return `${persona}

Voice Coach rules:
- Speak naturally in short turns. Keep most answers under 20 seconds.
- Ask at most one question at a time.
- If the user asks for a normal single-session workout, do not ask for routine missing details like equipment, duration, exercise count, sets, or reps. Infer sane defaults and generate it.
- Do not read workout exercise lists out loud. Say you will build it and drop the workout card in the chat.
- For workout requests, use the user's training environment from personalization context when present: gym means full gym equipment, home means bodyweight/dumbbells/bands/kettlebells, hybrid means gym-quality choices unless the user asks for home. If it is missing, assume full gym.
- Ask a follow-up only when the request is genuinely impossible or unsafe to answer without one.
- Do not claim form detection, rep counting, or medical diagnosis.
- When answering training-history or progress questions, use the provided personalization context first and state the timeframe you are using.
- If the personalization context has sparse or missing data, be direct about that instead of guessing.
- Style intensity: ${intensityLabel}.
- You are inside Fortify, a workout tracker and AI personal trainer.${buildTrainingContextInstructions(trainingContext)}`;
}

async function assembleVoiceCoachTrainingContext(
  adminClient: SupabaseClient,
  userId: string
): Promise<VoiceCoachTrainingContext | null> {
  try {
    const [user, history, analytics] = await Promise.all([
      withContextCache(
        buildCacheKey('voice-prefs', userId),
        () => fetchAIUserContext(adminClient, userId)
      ),
      withContextCache(
        buildCacheKey('voice-history', userId, VOICE_COACH_CONTEXT_WEEKS),
        () => fetchHistorySummary(adminClient, userId, VOICE_COACH_CONTEXT_WEEKS)
      ),
      withContextCache(
        buildCacheKey('voice-analytics', userId),
        () => fetchAnalytics(adminClient, userId)
      ),
    ]);

    return {
      user,
      history,
      analytics,
      contextWeeks: VOICE_COACH_CONTEXT_WEEKS,
    };
  } catch (error) {
    console.warn('[ai-realtime-session] failed to assemble voice coach training context', error);
    return null;
  }
}

async function hasPaidOrTrialAccess(adminClient: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[ai-realtime-session] subscription lookup failed', error.message);
    return false;
  }

  return data?.status === 'active' || data?.status === 'trialing';
}

async function reserveUsage(adminClient: SupabaseClient, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing, error: existingError } = await adminClient
    .from('ai_realtime_usage')
    .select('seconds_reserved,sessions_started')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (existingError) {
    console.error('[ai-realtime-session] usage lookup failed', existingError.message);
    return { allowed: false, retryAfterSeconds: 60, secondsUsedToday: MAX_SECONDS_PER_DAY };
  }

  const secondsUsedToday = Number(existing?.seconds_reserved ?? 0);
  if (secondsUsedToday + MAX_SECONDS_PER_SESSION > MAX_SECONDS_PER_DAY) {
    return {
      allowed: false,
      retryAfterSeconds: 60 * 60,
      secondsUsedToday,
    };
  }

  const nextSeconds = secondsUsedToday + MAX_SECONDS_PER_SESSION;
  const nextSessions = Number(existing?.sessions_started ?? 0) + 1;
  const { error: upsertError } = await adminClient
    .from('ai_realtime_usage')
    .upsert({
      user_id: userId,
      usage_date: today,
      seconds_reserved: nextSeconds,
      sessions_started: nextSessions,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,usage_date' });

  if (upsertError) {
    console.error('[ai-realtime-session] usage reserve failed', upsertError.message);
    return { allowed: false, retryAfterSeconds: 60, secondsUsedToday };
  }

  return { allowed: true, secondsUsedToday: nextSeconds };
}

function normalizeGeminiModelName(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}

async function createGeminiLiveToken(
  userId: string,
  preferences: RealtimeCoachPreferences,
  trainingContext: VoiceCoachTrainingContext | null
) {
  const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const now = Date.now();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Request-Reason': `fortify-voice-coach:${userId}`,
    },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + MAX_SECONDS_PER_SESSION * 1000 + 60_000).toISOString(),
      newSessionExpireTime: new Date(now + 60_000).toISOString(),
      bidiGenerateContentSetup: {
        model: normalizeGeminiModelName(GEMINI_LIVE_MODEL),
        generationConfig: {
          responseModalities: ['AUDIO'],
          temperature: 0.7,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: GEMINI_VOICE_BY_COACH_VOICE[preferences.voice],
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: buildInstructions(preferences, trainingContext) }],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            prefixPaddingMs: 300,
            silenceDurationMs: 650,
          },
          activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[ai-realtime-session] Gemini token failed', text);
    throw new Error(`Gemini token failed (${response.status}): ${text}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid authorization', 'UNAUTHORIZED', 401, false, undefined, origin);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401, false, undefined, origin);
    }

    const body = await req.json() as RealtimeSessionRequest;
    if (body.aiDataSharingConsent !== true) {
      return errorResponse('AI data sharing consent is required.', 'CONSENT_REQUIRED', 403, false, undefined, origin);
    }

    const hasAccess = await hasPaidOrTrialAccess(adminClient, user.id);
    if (!hasAccess) {
      return errorResponse('Voice Coach requires an active trial or subscription.', 'SUBSCRIPTION_REQUIRED', 403, false, undefined, origin);
    }

    const usage = await reserveUsage(adminClient, user.id);
    if (!usage.allowed) {
      console.warn('[ai-realtime-session] usage reservation failed; continuing while realtime limits are disabled');
    }

    const preferences = normalizePreferences(body.preferences);
    const trainingContext = await assembleVoiceCoachTrainingContext(adminClient, user.id);
    const token = await createGeminiLiveToken(user.id, preferences, trainingContext);
    const accessToken = token?.name;

    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Gemini Live token response was invalid.');
    }

    return jsonResponse({
      provider: 'gemini',
      accessToken,
      liveEndpoint: GEMINI_LIVE_ENDPOINT,
      expiresAt: token?.expireTime,
      model: GEMINI_LIVE_MODEL,
      voice: preferences.voice,
      usage: {
        secondsUsedToday: usage.secondsUsedToday ?? 0,
        maxSecondsPerDay: MAX_SECONDS_UNLIMITED,
        maxSecondsPerSession: MAX_SECONDS_UNLIMITED,
      },
    }, 200, origin);
  } catch (error) {
    console.error('[ai-realtime-session] request failed', error);
    const message = error instanceof Error
      ? error.message
      : 'Unable to start Voice Coach right now.';
    return errorResponse(
      message,
      'INTERNAL_ERROR',
      500,
      true,
      undefined,
      origin
    );
  }
});
