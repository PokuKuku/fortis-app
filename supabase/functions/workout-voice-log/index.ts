import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, handleCors, jsonResponse } from '../_shared/cors.ts';

type WeightUnit = 'lbs' | 'kg';
type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';
type MissingField = 'sets' | 'weight' | 'reps';
type Confidence = 'high' | 'medium' | 'low';

interface WorkoutVoiceRequest {
  audioBase64: string;
  mimeType: string;
  fileName: string;
  exerciseName: string;
  defaultWeightUnit: WeightUnit;
}

interface WorkoutVoiceInterpretation {
  transcript: string;
  sets: number | null;
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit | null;
  setType: SetType;
  inferredSets: boolean;
  inferredWeightUnit: boolean;
  inferredSetType: boolean;
  missingFields: MissingField[];
  confidence: Confidence;
}

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const UNIT_REGEX = /\b(kg|kgs|kilogram|kilograms|lb|lbs|pound|pounds)\b/i;
const WARMUP_REGEX = /\bwarm(?:[\s-]?up)?\b/i;
const DROPSET_REGEX = /\bdrop(?:[\s-]?set)?\b/i;
const FAILURE_REGEX = /\bto failure\b|\bfaili?ure\b/i;

function validateRequest(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'Request body must be an object.';

  const body = value as Record<string, unknown>;
  if (typeof body.audioBase64 !== 'string' || body.audioBase64.trim().length === 0) {
    return 'audioBase64 is required.';
  }
  if (typeof body.mimeType !== 'string' || body.mimeType.trim().length === 0) {
    return 'mimeType is required.';
  }
  if (typeof body.fileName !== 'string' || body.fileName.trim().length === 0) {
    return 'fileName is required.';
  }
  if (typeof body.exerciseName !== 'string' || body.exerciseName.trim().length === 0) {
    return 'exerciseName is required.';
  }
  if (body.defaultWeightUnit !== 'lbs' && body.defaultWeightUnit !== 'kg') {
    return 'defaultWeightUnit must be "lbs" or "kg".';
  }

  return null;
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/\s/g, '');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function normalizeUnit(value: string | null | undefined): WeightUnit | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === 'kg' || lower === 'kgs' || lower === 'kilogram' || lower === 'kilograms') return 'kg';
  if (lower === 'lb' || lower === 'lbs' || lower === 'pound' || lower === 'pounds') return 'lbs';
  return null;
}

function normalizeSetType(value: string | null | undefined): SetType | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (lower === 'normal') return 'normal';
  if (lower === 'warm' || lower === 'warmup' || lower === 'warm-up' || lower === 'warm up') return 'warmup';
  if (lower === 'drop' || lower === 'dropset' || lower === 'drop-set' || lower === 'drop set') return 'dropset';
  if (lower === 'failure' || lower === 'to failure' || lower === 'failiure') return 'failure';
  return null;
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}

function toWeight(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return Math.round(value * 10) / 10;
}

function buildInterpretation(
  transcript: string,
  candidate: Partial<WorkoutVoiceInterpretation>,
  defaultWeightUnit: WeightUnit
): WorkoutVoiceInterpretation {
  let sets = toPositiveInt(candidate.sets);
  const weight = toWeight(candidate.weight);
  const reps = toPositiveInt(candidate.reps);
  let inferredSets = candidate.inferredSets ?? false;
  const candidateWeightUnit = normalizeUnit(candidate.weightUnit ?? null);
  const candidateSetType = normalizeSetType(candidate.setType ?? null);

  if (sets === null && weight !== null && reps !== null) {
    sets = 1;
    inferredSets = true;
  }

  const inferredWeightUnit = candidate.inferredWeightUnit ?? !candidateWeightUnit;
  const weightUnit = candidateWeightUnit ?? defaultWeightUnit;
  const inferredSetType = candidate.inferredSetType ?? !candidateSetType;
  const setType = candidateSetType ?? 'normal';

  const missingFields: MissingField[] = [];
  if (sets === null) missingFields.push('sets');
  if (weight === null) missingFields.push('weight');
  if (reps === null) missingFields.push('reps');

  const confidence = candidate.confidence === 'high' || candidate.confidence === 'medium' || candidate.confidence === 'low'
    ? candidate.confidence
    : missingFields.length > 0
    ? 'low'
    : inferredSets || inferredWeightUnit || inferredSetType
    ? 'medium'
    : 'high';

  return {
    transcript,
    sets,
    weight,
    reps,
    weightUnit,
    setType,
    inferredSets,
    inferredWeightUnit,
    inferredSetType,
    missingFields,
    confidence,
  };
}

function fallbackInterpretTranscript(
  transcript: string,
  defaultWeightUnit: WeightUnit
): WorkoutVoiceInterpretation {
  const normalized = transcript.toLowerCase().replace(/[×]/g, 'x');
  const explicitUnit = normalizeUnit(normalized.match(UNIT_REGEX)?.[0] ?? null);
  const explicitSetType = normalizeSetType(
    normalized.match(FAILURE_REGEX)?.[0]
    ?? normalized.match(DROPSET_REGEX)?.[0]
    ?? normalized.match(WARMUP_REGEX)?.[0]
    ?? null
  );

  let sets: number | null = null;
  let reps: number | null = null;
  let weight: number | null = null;

  const triplePattern = normalized.match(/\b(\d+)\s*(?:x|by)\s*(\d+)\s*(?:at|@)\s*(\d+(?:\.\d+)?)\b/);
  if (triplePattern) {
    sets = Number(triplePattern[1]);
    reps = Number(triplePattern[2]);
    weight = Number(triplePattern[3]);
  }

  if (sets === null) {
    const setsMatch = normalized.match(/\b(\d+)\s*sets?\b/);
    if (setsMatch) {
      sets = Number(setsMatch[1]);
    }
  }

  if (reps === null) {
    const repsMatch = normalized.match(/\bfor\s+(\d+)\s*reps?\b|\b(\d+)\s*reps?\b/);
    if (repsMatch) {
      reps = Number(repsMatch[1] ?? repsMatch[2]);
    }
  }

  if (weight === null) {
    const weightBeforeReps = normalized.match(/\b(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram|kilograms|lb|lbs|pound|pounds)?\s*(?:for|x)\s+\d+\b/);
    if (weightBeforeReps) {
      weight = Number(weightBeforeReps[1]);
    }
  }

  if (weight === null) {
    const afterSets = normalized.match(/\b\d+\s*sets?\s*(?:of|at)?\s*(\d+(?:\.\d+)?)\b/);
    if (afterSets) {
      weight = Number(afterSets[1]);
    }
  }

  return buildInterpretation(
    transcript,
    {
      sets,
      weight,
      reps,
      weightUnit: explicitUnit ?? defaultWeightUnit,
      setType: explicitSetType ?? 'normal',
      inferredWeightUnit: !explicitUnit,
      inferredSetType: !explicitSetType,
    },
    defaultWeightUnit
  );
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function transcribeAudio(request: WorkoutVoiceRequest): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  const bytes = decodeBase64(request.audioBase64);
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new Error('Recording is too large. Please keep it shorter.');
  }
  const file = new Blob([bytes], { type: request.mimeType });
  const formData = new FormData();
  formData.append('file', file, request.fileName);
  formData.append(
    'model',
    Deno.env.get('OPENAI_TRANSCRIPTION_MODEL') || 'gpt-4o-mini-transcribe'
  );

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[workout-voice-log] transcription failed', errorText);
    throw new Error('Unable to transcribe that recording right now.');
  }

  const data = await response.json();
  const text = typeof data?.text === 'string' ? data.text.trim() : '';
  if (!text) {
    throw new Error('The recording did not contain a usable workout entry.');
  }

  return text;
}

async function interpretTranscriptWithModel(
  transcript: string,
  request: WorkoutVoiceRequest
): Promise<WorkoutVoiceInterpretation | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_VOICE_PARSE_MODEL') || 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: [
            'You extract a single exercise workout log from a speech transcript.',
            'Return JSON only. No markdown, no prose.',
            'Use this shape exactly:',
            '{"sets":number|null,"weight":number|null,"reps":number|null,"weightUnit":"lbs"|"kg"|null,"setType":"normal"|"warmup"|"dropset"|"failure","inferredSets":boolean,"inferredWeightUnit":boolean,"inferredSetType":boolean,"confidence":"high"|"medium"|"low"}',
            'Rules:',
            '- If the set count is omitted but weight and reps are present, infer sets=1 and inferredSets=true.',
            '- If weight unit is omitted, use the provided default weight unit and inferredWeightUnit=true.',
            '- If set type is omitted, use setType="normal" and inferredSetType=true.',
            '- Map "warm", "warm up", and "warmup" to setType="warmup".',
            '- Map "drop", "drop set", and "dropset" to setType="dropset".',
            '- Map "failure", "to failure", and close misspellings like "failiure" to setType="failure".',
            '- If the transcript is ambiguous, leave uncertain numeric fields null and set confidence="low".',
            '- Do not invent values for missing reps or missing weight.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            `Exercise: ${request.exerciseName}`,
            `Default weight unit: ${request.defaultWeightUnit}`,
            `Transcript: ${transcript}`,
          ].join('\n'),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[workout-voice-log] parse model failed', errorText);
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part: { type?: string; text?: string }) => (part?.type === 'text' ? part.text ?? '' : '')).join('')
    : typeof content === 'string'
    ? content
    : '';

  const parsed = extractJsonObject(text);
  if (!parsed) return null;

  return buildInterpretation(
    transcript,
    {
      sets: typeof parsed.sets === 'number' ? parsed.sets : null,
      weight: typeof parsed.weight === 'number' ? parsed.weight : null,
      reps: typeof parsed.reps === 'number' ? parsed.reps : null,
      weightUnit: normalizeUnit(typeof parsed.weightUnit === 'string' ? parsed.weightUnit : null),
      setType: normalizeSetType(typeof parsed.setType === 'string' ? parsed.setType : null) ?? 'normal',
      inferredSets: parsed.inferredSets === true,
      inferredWeightUnit: parsed.inferredWeightUnit === true,
      inferredSetType: parsed.inferredSetType === true,
      confidence:
        parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
          ? parsed.confidence
          : undefined,
    },
    request.defaultWeightUnit
  );
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');

  try {
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed.', 'METHOD_NOT_ALLOWED', 405, false, undefined, origin);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid authorization.', 'UNAUTHORIZED', 401, false, undefined, origin);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('Supabase configuration missing.', 'CONFIG_ERROR', 500, false, undefined, origin);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return errorResponse('Unauthorized.', 'UNAUTHORIZED', 401, false, undefined, origin);
    }

    const body = await req.json();
    const validationError = validateRequest(body);
    if (validationError) {
      return errorResponse(validationError, 'INVALID_REQUEST', 400, false, undefined, origin);
    }

    const requestBody = body as WorkoutVoiceRequest;
    const transcript = await transcribeAudio(requestBody);
    const interpretation = await interpretTranscriptWithModel(transcript, requestBody)
      ?? fallbackInterpretTranscript(transcript, requestBody.defaultWeightUnit);

    return jsonResponse({
      type: 'success',
      interpretation,
    }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected voice logging error.';
    console.error('[workout-voice-log] request failed', message);
    return jsonResponse({
      type: 'error',
      error: {
        code: 'VOICE_LOG_ERROR',
        message,
        retryable: true,
      },
    }, 500, origin);
  }
});
