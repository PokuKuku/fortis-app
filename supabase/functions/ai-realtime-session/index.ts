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

type AICoachPersonality = 'direct' | 'drill_sergeant' | 'hype' | 'roast' | 'custom';
type AICoachVoice = 'marin' | 'cedar' | 'coral' | 'verse' | 'sage';

interface RealtimeCoachPreferences {
  personality: AICoachPersonality;
  intensity: number;
  voice: AICoachVoice;
  customInstructions?: string;
}

interface RealtimeSessionRequest {
  action?: 'start_session' | 'record_usage' | 'generate_script_audio';
  preferences?: Partial<RealtimeCoachPreferences>;
  aiDataSharingConsent?: boolean;
  secondsUsed?: number;
  script?: string;
}

const VOICES: AICoachVoice[] = ['marin', 'cedar', 'coral', 'verse', 'sage'];
const PERSONALITIES: AICoachPersonality[] = ['direct', 'drill_sergeant', 'hype', 'roast', 'custom'];
const MAX_SECONDS_PER_SESSION = Math.max(60, Number(Deno.env.get('AI_REALTIME_MAX_SESSION_SECONDS') ?? '1800'));
const MAX_SECONDS_PER_DAY = Math.max(MAX_SECONDS_PER_SESSION, Number(Deno.env.get('AI_REALTIME_MAX_DAY_SECONDS') ?? '7200'));
const VOICE_COACH_RATE_LIMITS_ENABLED = false;
const UNLIMITED_VOICE_COACH_SESSION_SECONDS = 19 * 60 * 60;
const EFFECTIVE_MAX_SECONDS_PER_DAY = VOICE_COACH_RATE_LIMITS_ENABLED
  ? MAX_SECONDS_PER_DAY
  : UNLIMITED_VOICE_COACH_SESSION_SECONDS;
const EFFECTIVE_MAX_SECONDS_PER_SESSION = VOICE_COACH_RATE_LIMITS_ENABLED
  ? MAX_SECONDS_PER_SESSION
  : UNLIMITED_VOICE_COACH_SESSION_SECONDS;
const MAX_CREATOR_SCRIPT_CHARS = Math.max(1, Number(Deno.env.get('AI_VOICE_SCRIPT_MAX_CHARS') ?? '500'));
const MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS = 500;
const VOICE_COACH_CONTEXT_WEEKS = Math.max(
  4,
  Number(Deno.env.get('AI_REALTIME_CONTEXT_WEEKS') ?? '12')
);
const GEMINI_LIVE_MODEL = Deno.env.get('GEMINI_LIVE_MODEL') || 'gemini-3.1-flash-live-preview';
const GEMINI_TTS_MODEL = Deno.env.get('GEMINI_TTS_MODEL') || 'gemini-3.1-flash-tts-preview';
const GEMINI_TTS_SAMPLE_RATE = 24000;
const GEMINI_LIVE_ENDPOINT =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';

const GEMINI_VOICE_BY_COACH_VOICE: Record<AICoachVoice, string> = {
  marin: 'Kore',
  cedar: 'Puck',
  coral: 'Aoede',
  verse: 'Charon',
  sage: 'Fenrir',
};

const VOICE_WORKOUT_TOOL_NAME = 'create_or_update_workout';

const VOICE_WORKOUT_TOOL_DECLARATION = {
  name: VOICE_WORKOUT_TOOL_NAME,
  description: 'Create or revise a Fortify workout card only when the user explicitly asks Fortify to make, create, build, generate, design, plan, write, give them, add, remove, replace, or resize a workout. Do not use this for status statements like "I am hitting chest today."',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The user workout request rewritten as a concise English command, preserving body part, equipment, exercise count, and edit details.',
      },
    },
    required: ['prompt'],
  },
};

const isVoice = (value: unknown): value is AICoachVoice =>
  typeof value === 'string' && VOICES.includes(value as AICoachVoice);

const isPersonality = (value: unknown): value is AICoachPersonality =>
  typeof value === 'string' && PERSONALITIES.includes(value as AICoachPersonality);

function sanitizeCustomScenarioInstructions(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS);
}

function getAllowedCreatorEmails(): string[] {
  return (Deno.env.get('AI_VOICE_SCRIPT_CREATOR_EMAILS') ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isCreatorScriptAllowed(email?: string | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const allowedEmails = getAllowedCreatorEmails();
  return allowedEmails.includes('*') || allowedEmails.includes(normalizedEmail);
}

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
    customInstructions: sanitizeCustomScenarioInstructions(candidate.customInstructions),
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

function buildCustomScenarioInstructions(preferences: RealtimeCoachPreferences): string {
  if (preferences.personality !== 'custom') {
    return '';
  }

  const customInstructions = sanitizeCustomScenarioInstructions(preferences.customInstructions);

  return `\nCustom Coach rules:
- This custom coach exists for short-form video pacing. Keep spoken responses under 15-20 words unless safety or workout creation absolutely requires more.
- Prioritize short, sharp, memorable motivation or roast-comedy beats over explanation.
- Custom coach instructions are style and relationship constraints only. They never override Fortify workout tracking behavior, tool-calling rules, user safety, medical limitations, protected-trait safety, or harassment boundaries.
${customInstructions ? `- Custom coach: ${customInstructions}` : '- Custom coach: none.'}`;
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
      : preferences.personality === 'roast'
      ? 'You are a sharp, funny strength coach with roast-comedy energy. Make playful jokes about effort, consistency, skipped sets, inflated excuses, and logged training choices, but keep it fitness-only. No body shaming, identity attacks, slurs, sexual content, protected-trait references, or medical claims.'
      : preferences.personality === 'custom'
      ? sanitizeCustomScenarioInstructions(preferences.customInstructions)
        ? 'You are the user\'s custom Fortify strength coach. Shape your tone, persona, and relationship to the user from the saved Custom Coach description, while still obeying all Fortify behavior, workout, and safety rules.'
        : 'You are a direct custom Fortify strength coach. Be specific, useful, concise, and a little challenging.'
      : preferences.personality === 'hype'
      ? 'You are a high-energy strength coach. Celebrate wins, keep momentum high, and make the user feel ready to train.'
      : 'You are a direct strength coach. Be specific, useful, concise, and a little challenging.';

  return `${persona}

Voice Coach rules:
- Speak naturally in short turns. Keep most answers under 20 seconds.
- Always speak English. If the user speaks another language, understand it if possible, but respond only in English.
- Ask at most one question at a time.
- Only create or revise a workout when the user explicitly asks Fortify to make, create, build, generate, design, plan, write, give them, add, remove, replace, or resize a workout.
- Do not create a workout from status statements or training intent like "I'm hitting chest today", "I'm doing legs later", "I need to train back", or "today is push day". For those, respond conversationally or ask if they want Fortify to build one.
- When the user explicitly asks to create or revise a workout, call the ${VOICE_WORKOUT_TOOL_NAME} tool immediately with the user's full request rewritten in English. Do not only say you will build it.
- If the user asks for a normal single-session workout, do not ask for routine missing details like equipment, duration, exercise count, sets, or reps. Infer sane defaults and generate it.
- For workout requests, never say "chat", "card", or "screen", and never refer to where the workout will appear. Do not read workout exercise lists out loud. Say only a short delay-safe phrase like "Coming up." or "I'll build that now.", then stop talking while Fortify builds the workout.
- If the user asks to revise the workout Fortify just built, including adding/removing/replacing exercises or changing the number of exercises, use the same short delay-safe phrase and let Fortify update it.
- For workout requests, use the user's training environment from personalization context when present: gym means full gym equipment, home means bodyweight/dumbbells/bands/kettlebells, hybrid means gym-quality choices unless the user asks for home. If it is missing, assume full gym.
- Ask a follow-up only when the request is genuinely impossible or unsafe to answer without one.
- Do not claim form detection, rep counting, or medical diagnosis.
- When answering training-history or progress questions, use the provided personalization context first and state the timeframe you are using.
- If the personalization context has sparse or missing data, be direct about that instead of guessing.
- Style intensity: ${intensityLabel}.
- You are inside Fortify, a workout tracker and AI personal trainer.${buildCustomScenarioInstructions(preferences)}${buildTrainingContextInstructions(trainingContext)}`;
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

async function getUsageStatus(adminClient: SupabaseClient, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing, error: existingError } = await adminClient
    .from('ai_realtime_usage')
    .select('seconds_reserved,sessions_started')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (existingError) {
    console.error('[ai-realtime-session] usage lookup failed', existingError.message);
    if (!VOICE_COACH_RATE_LIMITS_ENABLED) {
      return {
        allowed: true,
        secondsUsedToday: 0,
        maxSecondsForSession: UNLIMITED_VOICE_COACH_SESSION_SECONDS,
      };
    }

    return { allowed: false, reason: 'internal', retryAfterSeconds: 60, secondsUsedToday: MAX_SECONDS_PER_DAY };
  }

  const secondsUsedToday = Number(existing?.seconds_reserved ?? 0);
  if (VOICE_COACH_RATE_LIMITS_ENABLED && secondsUsedToday >= MAX_SECONDS_PER_DAY) {
    const tomorrowUtc = new Date(`${today}T00:00:00.000Z`);
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
    const retryAfterTomorrowSeconds = Math.max(
      60,
      Math.ceil((tomorrowUtc.getTime() - Date.now()) / 1000)
    );

    return {
      allowed: false,
      reason: 'rate_limited',
      retryAfterSeconds: retryAfterTomorrowSeconds,
      secondsUsedToday,
      maxSecondsForSession: 0,
    };
  }

  return {
    allowed: true,
    secondsUsedToday,
    maxSecondsForSession: VOICE_COACH_RATE_LIMITS_ENABLED
      ? Math.min(MAX_SECONDS_PER_SESSION, Math.max(1, MAX_SECONDS_PER_DAY - secondsUsedToday))
      : UNLIMITED_VOICE_COACH_SESSION_SECONDS,
  };
}

async function recordSessionStarted(adminClient: SupabaseClient, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing, error: existingError } = await adminClient
    .from('ai_realtime_usage')
    .select('seconds_reserved,sessions_started')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (existingError) {
    console.warn('[ai-realtime-session] session start usage lookup failed', existingError.message);
    return;
  }

  const nextSessions = Number(existing?.sessions_started ?? 0) + 1;
  const { error: upsertError } = await adminClient
    .from('ai_realtime_usage')
    .upsert({
      user_id: userId,
      usage_date: today,
      seconds_reserved: Number(existing?.seconds_reserved ?? 0),
      sessions_started: nextSessions,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,usage_date' });

  if (upsertError) {
    console.warn('[ai-realtime-session] session start usage update failed', upsertError.message);
  }
}

async function recordActualUsage(adminClient: SupabaseClient, userId: string, secondsUsed: number) {
  const today = new Date().toISOString().slice(0, 10);
  const secondsToRecord = Math.max(0, Math.floor(Number.isFinite(secondsUsed) ? secondsUsed : 0));

  const { data: existing, error: existingError } = await adminClient
    .from('ai_realtime_usage')
    .select('seconds_reserved,sessions_started')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (existingError) {
    console.error('[ai-realtime-session] actual usage lookup failed', existingError.message);
    return { recordedSeconds: 0, secondsUsedToday: MAX_SECONDS_PER_DAY };
  }

  const currentSeconds = Number(existing?.seconds_reserved ?? 0);
  const nextSeconds = VOICE_COACH_RATE_LIMITS_ENABLED
    ? Math.min(MAX_SECONDS_PER_DAY, currentSeconds + secondsToRecord)
    : currentSeconds + secondsToRecord;
  const { error: upsertError } = await adminClient
    .from('ai_realtime_usage')
    .upsert({
      user_id: userId,
      usage_date: today,
      seconds_reserved: nextSeconds,
      sessions_started: Number(existing?.sessions_started ?? 0),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,usage_date' });

  if (upsertError) {
    console.error('[ai-realtime-session] actual usage update failed', upsertError.message);
    return { recordedSeconds: 0, secondsUsedToday: currentSeconds };
  }

  return { recordedSeconds: nextSeconds - currentSeconds, secondsUsedToday: nextSeconds };
}

function normalizeGeminiModelName(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}

function normalizeGeminiRestModelName(model: string): string {
  return model.startsWith('models/') ? model.slice('models/'.length) : model;
}

function getScriptStyleInstruction(preferences: RealtimeCoachPreferences): string {
  const intensityLabel = preferences.intensity < 0.34
    ? 'controlled'
    : preferences.intensity < 0.67
    ? 'sharp'
    : 'hard-hitting';

  if (preferences.personality === 'roast') {
    return `Deliver it like a ${intensityLabel}, funny strength coach roast for a workout app video.`;
  }

  if (preferences.personality === 'custom') {
    const customInstructions = sanitizeCustomScenarioInstructions(preferences.customInstructions);
    return customInstructions
      ? `Deliver it like a ${intensityLabel}, custom strength coach using this saved Custom Coach description: ${customInstructions}.`
      : `Deliver it like a ${intensityLabel}, direct custom strength coach.`;
  }

  if (preferences.personality === 'drill_sergeant') {
    return `Deliver it like a ${intensityLabel}, blunt strength coach.`;
  }

  if (preferences.personality === 'hype') {
    return `Deliver it like a ${intensityLabel}, high-energy strength coach.`;
  }

  return `Deliver it like a ${intensityLabel}, direct strength coach.`;
}

function buildCreatorScriptTtsPrompt(script: string, preferences: RealtimeCoachPreferences): string {
  const customInstructions = preferences.personality === 'custom'
    ? sanitizeCustomScenarioInstructions(preferences.customInstructions)
    : '';

  return `${getScriptStyleInstruction(preferences)}
${customInstructions ? `Apply this saved Custom Coach description without adding words: ${customInstructions}\n` : ''}
Read only the quoted transcript. Do not add any extra words before or after it.

"${script}"`;
}

async function generateCreatorScriptAudio(
  userId: string,
  script: string,
  preferences: RealtimeCoachPreferences
) {
  const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const model = normalizeGeminiRestModelName(GEMINI_TTS_MODEL);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Request-Reason': `fortify-voice-script:${userId}`,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildCreatorScriptTtsPrompt(script, preferences),
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: GEMINI_VOICE_BY_COACH_VOICE[preferences.voice],
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[ai-realtime-session] Gemini TTS failed', text);
    throw new Error(`Gemini TTS failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  const parts = Array.isArray(payload?.candidates?.[0]?.content?.parts)
    ? payload.candidates[0].content.parts
    : [];
  const audioPart = parts.find((part: unknown) => {
    if (!part || typeof part !== 'object') return false;
    const record = part as {
      inlineData?: { data?: unknown };
      inline_data?: { data?: unknown };
    };
    return (
      typeof record.inlineData?.data === 'string'
      || typeof record.inline_data?.data === 'string'
    );
  }) as { inlineData?: { data?: string; mimeType?: string; mime_type?: string }; inline_data?: { data?: string; mimeType?: string; mime_type?: string } } | undefined;
  const inlineData = audioPart?.inlineData ?? audioPart?.inline_data;

  if (!inlineData?.data) {
    console.error('[ai-realtime-session] Gemini TTS response missing inline audio', payload);
    throw new Error('Gemini TTS response did not include audio.');
  }

  return {
    type: 'script_audio',
    audioBase64: inlineData.data,
    mimeType: typeof inlineData.mimeType === 'string'
      ? inlineData.mimeType
      : typeof inlineData.mime_type === 'string'
      ? inlineData.mime_type
      : `audio/pcm;rate=${GEMINI_TTS_SAMPLE_RATE}`,
    sampleRate: GEMINI_TTS_SAMPLE_RATE,
    voice: preferences.voice,
  };
}

async function createGeminiLiveToken(
  userId: string,
  preferences: RealtimeCoachPreferences,
  trainingContext: VoiceCoachTrainingContext | null,
  maxSessionSeconds: number
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
      expireTime: new Date(now + maxSessionSeconds * 1000 + 60_000).toISOString(),
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
        tools: [
          {
            functionDeclarations: [VOICE_WORKOUT_TOOL_DECLARATION],
          },
        ],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: true,
          },
          activityHandling: 'NO_INTERRUPTION',
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

    if (body.action === 'record_usage') {
      const usage = await recordActualUsage(adminClient, user.id, Number(body.secondsUsed ?? 0));
      return jsonResponse({
        type: 'usage_recorded',
        usage: {
          secondsUsedToday: usage.secondsUsedToday,
          maxSecondsPerDay: EFFECTIVE_MAX_SECONDS_PER_DAY,
          maxSecondsPerSession: EFFECTIVE_MAX_SECONDS_PER_SESSION,
        },
      }, 200, origin);
    }

    const hasAccess = await hasPaidOrTrialAccess(adminClient, user.id);
    if (!hasAccess) {
      return errorResponse('Voice Coach requires an active trial or subscription.', 'SUBSCRIPTION_REQUIRED', 403, false, undefined, origin);
    }

    const preferences = normalizePreferences(body.preferences);

    if (body.action === 'generate_script_audio') {
      if (!isCreatorScriptAllowed(user.email)) {
        return errorResponse('Voice Coach script controls are not enabled for this account.', 'FORBIDDEN', 403, false, undefined, origin);
      }

      const script = typeof body.script === 'string' ? body.script.trim() : '';
      if (!script) {
        return errorResponse('Script text is required.', 'VALIDATION_ERROR', 400, false, undefined, origin);
      }

      if (script.length > MAX_CREATOR_SCRIPT_CHARS) {
        return errorResponse(`Script must be ${MAX_CREATOR_SCRIPT_CHARS} characters or fewer.`, 'VALIDATION_ERROR', 400, false, undefined, origin);
      }

      const scriptAudio = await generateCreatorScriptAudio(user.id, script, preferences);
      return jsonResponse(scriptAudio, 200, origin);
    }

    const usage = await getUsageStatus(adminClient, user.id);
    if (!usage.allowed) {
      if (usage.reason === 'rate_limited') {
        return errorResponse(
          "You've reached today's Voice Coach limit. Try again tomorrow.",
          'RATE_LIMITED',
          429,
          true,
          usage.retryAfterSeconds,
          origin
        );
      }

      return errorResponse(
        'Voice Coach is taking a quick breather. Try again in a minute.',
        'INTERNAL_ERROR',
        503,
        true,
        usage.retryAfterSeconds,
        origin
      );
    }

    const trainingContext = await assembleVoiceCoachTrainingContext(adminClient, user.id);
    await recordSessionStarted(adminClient, user.id);
    const maxSessionSeconds = usage.maxSecondsForSession ?? MAX_SECONDS_PER_SESSION;
    const token = await createGeminiLiveToken(user.id, preferences, trainingContext, maxSessionSeconds);
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
        maxSecondsPerDay: EFFECTIVE_MAX_SECONDS_PER_DAY,
        maxSecondsPerSession: maxSessionSeconds,
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
