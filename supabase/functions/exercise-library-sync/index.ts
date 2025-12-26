import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, handleCors } from '../_shared/cors.ts';

type ExerciseDbResponse = {
  exerciseId?: string;
  id?: string;
  name?: string;
  targetMuscles?: string[];
  target?: string;
  secondaryMuscles?: string[];
  equipments?: string[];
  equipment?: string;
  bodyParts?: string[];
  bodyPart?: string;
  instructions?: string[];
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
};

type OpenSourceApiResponse = {
  success: boolean;
  data: ExerciseDbResponse[];
};

const ALLOWED_LEVELS = ['beginner', 'intermediate', 'expert'] as const;
const ALLOWED_CATEGORIES = [
  'strength',
  'powerlifting',
  'olympic weightlifting',
  'strongman',
  'stretching',
  'cardio',
  'plyometrics',
] as const;
const ALLOWED_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'kettlebells',
  'machine',
  'cable',
  'body only',
  'bands',
  'medicine ball',
  'exercise ball',
  'e-z curl bar',
  'foam roll',
  'other',
] as const;

const DEFAULT_LEVEL = 'intermediate';
const DEFAULT_CATEGORY = 'strength';

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeCategory = (raw?: string | null): typeof ALLOWED_CATEGORIES[number] => {
  const value = (raw || '').toLowerCase();
  if (value.includes('cardio')) return 'cardio';
  if (value.includes('stretch')) return 'stretching';
  if (value.includes('plyo')) return 'plyometrics';
  if (value.includes('power')) return 'powerlifting';
  if (value.includes('olympic')) return 'olympic weightlifting';
  if (value.includes('strongman')) return 'strongman';
  return DEFAULT_CATEGORY;
};

const normalizeEquipment = (raw?: string | null): typeof ALLOWED_EQUIPMENT[number] => {
  const value = (raw || '').toLowerCase().trim();
  if (!value) return 'other';
  if (value.includes('barbell')) return 'barbell';
  if (value.includes('dumbbell')) return 'dumbbell';
  if (value.includes('kettlebell')) return 'kettlebells';
  if (value.includes('cable')) return 'cable';
  if (value.includes('machine')) return 'machine';
  if (value.includes('body')) return 'body only';
  if (value.includes('band')) return 'bands';
  if (value.includes('medicine')) return 'medicine ball';
  if (value.includes('exercise ball') || value.includes('stability ball')) return 'exercise ball';
  if (value.includes('ez') || value.includes('e-z')) return 'e-z curl bar';
  if (value.includes('foam')) return 'foam roll';
  return 'other';
};

const normalizeArray = (value?: string[] | null): string[] =>
  Array.isArray(value) ? value.filter(Boolean).map((item) => item.toLowerCase()) : [];

const buildImageList = (exercise: ExerciseDbResponse): string[] => {
  const url = exercise.gifUrl || exercise.imageUrl;
  return url ? [url] : [];
};

const ensureUniqueSlugs = (names: string[]): string[] => {
  const counts = new Map<string, number>();
  return names.map((name) => {
    const base = slugify(name);
    const current = counts.get(base) ?? 0;
    counts.set(base, current + 1);
    if (current === 0) return base;
    return `${base}-${current + 1}`;
  });
};

const isRapidApi = (provider: string | null): boolean => provider === 'rapidapi';

async function fetchExerciseDb(): Promise<ExerciseDbResponse[]> {
  const provider = Deno.env.get('EXERCISE_DB_PROVIDER') || 'opensource';
  const apiBaseUrl =
    Deno.env.get('EXERCISE_DB_API_BASE_URL') ||
    (isRapidApi(provider)
      ? 'https://exercisedb.p.rapidapi.com'
      : 'https://exercisedb-api.vercel.app/api/v1');
  const pageSize = Number(Deno.env.get('EXERCISE_DB_PAGE_SIZE') || '250');
  const apiKey = Deno.env.get('EXERCISE_DB_API_KEY') || '';
  const apiHost = Deno.env.get('EXERCISE_DB_API_HOST') || 'exercisedb.p.rapidapi.com';

  if (isRapidApi(provider) && !apiKey) {
    throw new Error('EXERCISE_DB_API_KEY is required for RapidAPI');
  }

  const headers: HeadersInit = isRapidApi(provider)
    ? {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      }
    : {};

  const allExercises: ExerciseDbResponse[] = [];
  let offset = 0;
  let hasMore = true;
  let backoffMs = 500;

  while (hasMore) {
    const url = `${apiBaseUrl}/exercises?offset=${offset}&limit=${pageSize}`;
    let response: Response | null = null;
    let attempts = 0;

    while (attempts < 5) {
      attempts += 1;
      response = await fetch(url, { method: 'GET', headers });
      if (response.ok) break;

      if (response.status === 429) {
        await sleep(backoffMs);
        backoffMs = Math.min(backoffMs * 2, 8000);
        continue;
      }

      const responseText = await response.text().catch(() => '');
      throw new Error(
        `ExerciseDB API error: ${response.status} ${response.statusText}${responseText ? ` - ${responseText.slice(0, 200)}` : ''}`
      );
    }

    if (!response || !response.ok) {
      throw new Error('ExerciseDB API error: 429 Too Many Requests');
    }

    let pageExercises: ExerciseDbResponse[] = [];
    if (isRapidApi(provider)) {
      pageExercises = await response.json();
    } else {
      const json: OpenSourceApiResponse = await response.json();
      pageExercises = json.success ? json.data : [];
    }

    if (!pageExercises.length) {
      hasMore = false;
      break;
    }

    allExercises.push(...pageExercises);
    offset += pageSize;
    if (pageExercises.length < pageSize) {
      hasMore = false;
    }

    await sleep(150);
    if (offset > 10000) {
      hasMore = false;
    }
  }

  return allExercises;
}

function normalizeExercises(exercises: ExerciseDbResponse[]) {
  const names = exercises.map((exercise) => toTitleCase(exercise.name || ''));
  const slugs = ensureUniqueSlugs(names);

  return exercises.map((exercise, index) => {
    const name = names[index] || `Exercise ${index + 1}`;
    const primaryMuscles = normalizeArray(
      exercise.targetMuscles || (exercise.target ? [exercise.target] : [])
    );
    const secondaryMuscles = normalizeArray(exercise.secondaryMuscles || []);
    const equipmentValue = normalizeEquipment(
      exercise.equipments?.[0] || exercise.equipment || null
    );
    const categoryValue = normalizeCategory(
      exercise.bodyParts?.[0] || exercise.bodyPart || null
    );

    const level = ALLOWED_LEVELS.includes(DEFAULT_LEVEL)
      ? DEFAULT_LEVEL
      : 'beginner';

    return {
      name,
      slug: slugs[index],
      force: null,
      level,
      mechanic: null,
      equipment: ALLOWED_EQUIPMENT.includes(equipmentValue) ? equipmentValue : 'other',
      primary_muscles: primaryMuscles,
      secondary_muscles: secondaryMuscles,
      instructions: exercise.instructions || [],
      category: ALLOWED_CATEGORIES.includes(categoryValue) ? categoryValue : DEFAULT_CATEGORY,
      images: buildImageList(exercise),
      video_url: exercise.videoUrl || null,
      is_custom: false,
      created_by: null,
    };
  });
}

function requireSecret(req: Request): string | null {
  const expected = Deno.env.get('EXERCISE_SYNC_SECRET');
  if (!expected) return 'EXERCISE_SYNC_SECRET is not configured';

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || token !== expected) return 'Unauthorized';
  return null;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 'method_not_allowed', 405);
  }

  const secretError = requireSecret(req);
  if (secretError) {
    return errorResponse(secretError, 'unauthorized', 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return errorResponse('Supabase service configuration missing', 'config_error', 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    const rawExercises = await fetchExerciseDb();
    const normalizedExercises = normalizeExercises(rawExercises);
    if (normalizedExercises.length === 0) {
      throw new Error('ExerciseDB returned no exercises');
    }
    const slugs = normalizedExercises.map((exercise) => exercise.slug);

    const batchSize = Number(Deno.env.get('EXERCISE_DB_UPSERT_BATCH') || '500');
    for (const batch of chunk(normalizedExercises, batchSize)) {
      const { error } = await supabase
        .from('exercises')
        .upsert(batch, { onConflict: 'slug' });
      if (error) {
        throw new Error(error.message);
      }
    }

    let pruned = 0;
    if (Deno.env.get('EXERCISE_DB_PRUNE') === 'true') {
      const { data: prunedCount, error: pruneError } = await supabase
        .rpc('prune_public_exercises', { p_slugs: slugs });
      if (pruneError) {
        throw new Error(pruneError.message);
      }
      pruned = Number(prunedCount ?? 0);
    }

    const { error: metaError } = await supabase
      .from('exercise_library_meta')
      .upsert({
        id: 1,
        version: Date.now(),
        updated_at: new Date().toISOString(),
      });

    if (metaError) {
      throw new Error(metaError.message);
    }

    return jsonResponse({
      status: 'ok',
      imported: normalizedExercises.length,
      pruned,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 'sync_failed', 500);
  }
});
