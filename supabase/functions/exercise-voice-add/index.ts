import { errorResponse, handleCors, jsonResponse } from '../_shared/cors.ts';

type Confidence = 'high' | 'medium' | 'low';

interface ExerciseVoiceRequest {
  audioBase64: string;
  mimeType: string;
  fileName: string;
}

interface ExerciseVoiceEntry {
  exerciseQuery: string;
  setCount: number | null;
  confidence: Confidence;
}

interface ExerciseVoiceInterpretation {
  transcript: string;
  entries: ExerciseVoiceEntry[];
}

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const TRANSCRIPTION_PROMPT = [
  'A person is naming strength-training exercises and optional set counts.',
  'Common phrases include barbell bench press, incline bench press, Smith machine bench press,',
  'dumbbell press, squat, deadlift, lat pulldown, cable row, and Romanian deadlift.',
].join(' ');
const NUMBER_WORDS: Record<string, string> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
};

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

function toPositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}

function normalizeEntry(value: unknown): ExerciseVoiceEntry | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const exerciseQuery = typeof record.exerciseQuery === 'string' ? record.exerciseQuery.trim() : '';
  if (!exerciseQuery) return null;
  const setCount = toPositiveInt(record.setCount);
  const confidence = record.confidence === 'high' || record.confidence === 'medium' || record.confidence === 'low'
    ? record.confidence
    : setCount
    ? 'high'
    : 'medium';

  return {
    exerciseQuery,
    setCount,
    confidence,
  };
}

function buildInterpretation(
  transcript: string,
  entries: ExerciseVoiceEntry[],
): ExerciseVoiceInterpretation {
  return {
    transcript,
    entries: entries.slice(0, 5),
  };
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

function normalizeNumberWords(value: string): string {
  return value.replace(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi,
    (match) => NUMBER_WORDS[match.toLowerCase()] ?? match,
  );
}

function cleanExerciseQuery(value: string): string {
  return value
    .replace(/\b(add|do|did|and then|then)\b/gi, ' ')
    .replace(/\bfor\s+\d+\s*sets?\b/gi, ' ')
    .replace(/\b\d+\s*sets?\s*of\b/gi, ' ')
    .replace(/\b\d+\s*sets?\b/gi, ' ')
    .replace(/^(?:and|or)\s+/i, '')
    .replace(/^(of|the)\s+/i, '')
    .replace(/^[,;:.\s]+|[,;:.\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitExerciseParts(value: string): string[] {
  return value
    .split(/\s*[,;]\s*|\s+(?:and|plus|as\s+well\s+as)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitExerciseNames(value: string): string[] {
  return splitExerciseParts(value)
    .map((part) => cleanExerciseQuery(part))
    .filter(Boolean);
}

function fallbackInterpretTranscript(transcript: string): ExerciseVoiceInterpretation {
  const normalized = normalizeNumberWords(transcript)
    .toLowerCase()
    .replace(/[×]/g, 'x')
    .replace(/\s+/g, ' ')
    .trim();

  const entries: ExerciseVoiceEntry[] = [];
  const seen = new Set<string>();

  const pushEntry = (exerciseQuery: string, setCount: number | null, confidence: Confidence) => {
    const cleaned = cleanExerciseQuery(exerciseQuery);
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ exerciseQuery: cleaned, setCount, confidence });
  };

  // A set directive applies to the complete exercise list until the next set
  // directive, not merely until the first comma.
  const prefixedMatches = Array.from(normalized.matchAll(/\b(\d+)\s*sets?(?:\s*of)?\s+/gi));
  prefixedMatches.forEach((match, index) => {
    const setCount = toPositiveInt(Number(match[1]));
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = prefixedMatches[index + 1]?.index ?? normalized.length;
    const exerciseList = normalized.slice(contentStart, contentEnd);
    splitExerciseNames(exerciseList).forEach((name) => pushEntry(name, setCount, 'high'));
  });

  if (entries.length === 0) {
    // A suffix at the end applies to every exercise in the preceding list.
    const sharedSuffix = normalized.match(/^(.+?)\s+for\s+(\d+)\s*sets?[.!?]?$/i);
    if (sharedSuffix) {
      const setCount = toPositiveInt(Number(sharedSuffix[2]));
      splitExerciseNames(sharedSuffix[1]).forEach((name) => pushEntry(name, setCount, 'high'));
    }
  }

  if (entries.length === 0) {
    // Otherwise, allow each delimited item to carry its own trailing count.
    splitExerciseParts(normalized).forEach((item) => {
      const trailingCount = item.match(/^(.+?)\s+(\d+)\s*sets?[.!?]?$/i);
      if (!trailingCount) return;
      pushEntry(trailingCount[1], toPositiveInt(Number(trailingCount[2])), 'medium');
    });
  }

  if (entries.length === 0) {
    const setCountMatch = normalized.match(/\b(\d+)\s*sets?\b|\bfor\s+(\d+)\s*sets?\b/);
    const globalSetCount = toPositiveInt(Number(setCountMatch?.[1] ?? setCountMatch?.[2] ?? NaN));
    const remainder = cleanExerciseQuery(normalized);
    splitExerciseNames(remainder).forEach((name) => pushEntry(name, globalSetCount, globalSetCount ? 'medium' : 'low'));
  }

  return buildInterpretation(transcript, entries);
}

async function transcribeAudio(request: ExerciseVoiceRequest): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  const bytes = decodeBase64(request.audioBase64);
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new Error('Recording is too large. Please keep it shorter.');
  }
  const file = new File([bytes], request.fileName, { type: request.mimeType });
  const configuredModel = Deno.env.get('OPENAI_TRANSCRIPTION_MODEL') || 'whisper-1';
  const modelCandidates = Array.from(new Set([configuredModel, 'whisper-1']));
  let lastError: Error | null = null;

  for (const model of modelCandidates) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('language', 'en');
    formData.append('prompt', TRANSCRIPTION_PROMPT);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const details = await response.text();
      lastError = new Error(`Transcription failed for ${model}: ${details}`);
      console.warn('[exercise-voice-add] transcription attempt failed', { model, details });
      continue;
    }

    const payload = await response.json() as { text?: string };
    const transcript = payload.text?.trim();
    if (!transcript) {
      lastError = new Error('No speech was detected.');
      continue;
    }

    return transcript;
  }

  throw lastError ?? new Error('No speech was detected.');
}

async function parseExerciseTranscript(transcript: string): Promise<ExerciseVoiceInterpretation> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return fallbackInterpretTranscript(transcript);
  }

  const model = Deno.env.get('OPENAI_EXERCISE_VOICE_PARSE_MODEL') || 'gpt-5-nano';
  const prompt = [
    'You extract exercise add requests from a workout transcript.',
    'Return strict JSON with shape: {"entries":[{"exerciseQuery":"barbell bench press","setCount":3,"confidence":"high"}]}.',
    'Rules:',
    '- Parse one or more exercise names from the transcript.',
    '- If one set count applies to multiple exercises, copy that setCount onto each entry.',
    '- Return one entry for every exercise named; never drop later comma-separated items.',
    '- If no set count is spoken for an exercise, use null.',
    '- Keep exerciseQuery concise and clean for exercise search.',
    '- Recover an obvious exercise name when transcription contains a close phonetic error.',
    '- Prefer standard strength-training exercise names over nonsensical literal wording.',
    '- Ignore filler words.',
    '- Max 5 entries.',
    '- Confidence must be high, medium, or low.',
    '- Examples:',
    '- "3 sets of barbell bench press" => {"entries":[{"exerciseQuery":"barbell bench press","setCount":3,"confidence":"high"}]}',
    '- "barbell bench press 3 sets" => {"entries":[{"exerciseQuery":"barbell bench press","setCount":3,"confidence":"high"}]}',
    '- "squats for 3 sets" => {"entries":[{"exerciseQuery":"squats","setCount":3,"confidence":"high"}]}',
    '- "3 sets of barbell bench press and squats" => {"entries":[{"exerciseQuery":"barbell bench press","setCount":3,"confidence":"high"},{"exerciseQuery":"squats","setCount":3,"confidence":"high"}]}',
    '- "three sets of smith\'s machine bent cross" => {"entries":[{"exerciseQuery":"smith machine bench press","setCount":3,"confidence":"medium"}]}',
    '- "bench press, lat pulldown, and squats for 3 sets" => {"entries":[{"exerciseQuery":"bench press","setCount":3,"confidence":"high"},{"exerciseQuery":"lat pulldown","setCount":3,"confidence":"high"},{"exerciseQuery":"squats","setCount":3,"confidence":"high"}]}',
    '',
    `Transcript: """${transcript}"""`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: 'Return only valid JSON. No markdown, no prose.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return fallbackInterpretTranscript(transcript);
  }

  const payload = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
  const content = payload?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => (part?.type === 'text' ? part.text ?? '' : '')).join('')
    : typeof content === 'string'
    ? content
    : '';

  const parsed = extractJsonObject(text);
  const entries = Array.isArray(parsed?.entries)
    ? parsed.entries.map(normalizeEntry).filter((entry): entry is ExerciseVoiceEntry => entry !== null)
    : [];

  const fallback = fallbackInterpretTranscript(transcript);
  const hasUnambiguousListSeparator = /[,;]|\bplus\b|\bas\s+well\s+as\b/i.test(transcript);
  if (
    entries.length === 0
    || (hasUnambiguousListSeparator && fallback.entries.length > entries.length)
  ) {
    return fallback;
  }

  return buildInterpretation(transcript, entries);
}

Deno.serve(async (request) => {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  if (request.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed.', 405, false);
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('UNAUTHORIZED', 'Missing authorization header.', 401, false);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('SERVER_MISCONFIGURED', 'Supabase configuration missing.', 500, false);
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('UNAUTHORIZED', 'Unauthorized.', 401, false);
    }

    const body = await request.json();
    const validationError = validateRequest(body);
    if (validationError) {
      return errorResponse('INVALID_REQUEST', validationError, 400, false);
    }

    const voiceRequest = body as ExerciseVoiceRequest;
    const transcript = await transcribeAudio(voiceRequest);
    const interpretation = await parseExerciseTranscript(transcript);

    if (interpretation.entries.length === 0) {
      return errorResponse(
        'NO_EXERCISES_FOUND',
        'The recording did not contain a usable exercise request.',
        422,
        true,
      );
    }

    return jsonResponse({
      type: 'success',
      interpretation,
    });
  } catch (error) {
    console.error('[exercise-voice-add] failure', error);
    return errorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unexpected exercise voice error.',
      500,
      true,
    );
  }
});
