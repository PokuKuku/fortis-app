import { DeviceEventEmitter } from 'react-native';
import { Exercise, ExerciseWithSource, ExerciseSource } from '@/src/types/exercise';
import { EXERCISE_CONFIG } from '@/src/constants/exerciseConfig';
import {
  CUSTOM_EXERCISES_KEY,
  EXERCISE_CACHE_KEY,
  EXERCISE_CACHE_TIMESTAMP_KEY,
  EXERCISE_LIBRARY_VERSION_KEY,
} from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeMuscleArray } from '@/src/utils/muscleMapping';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { analytics } from '@/src/services/analyticsService';
import { buildExerciseSearchIndex, searchExercises as searchExercisesInIndex } from '@/src/utils/exerciseSearch';

// In-memory cache
let baseExerciseCache: Exercise[] | null = null;
let baseExerciseFullCache: Exercise[] | null = null;
let customExerciseCache: Exercise[] | null = null;
let allExercisesCache: ExerciseWithSource[] | null = null;
let allExercisesPromise: Promise<ExerciseWithSource[]> | null = null;
let exerciseLookupCache: Map<string, ExerciseWithSource> | null = null;

const EXERCISE_LIBRARY_UPDATED_EVENT = 'exerciseLibraryUpdated';
const WIDE_GRIP_LAT_PULLDOWN_ID = 'c56d8350-56c1-4bc4-99e1-4de71e680c21';
const CUSTOM_EXERCISE_PREFIX = 'custom-';

// --- Helpers ---

/**
 * Convert a string to Title Case (e.g., "barbell bench press" → "Barbell Bench Press")
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// --- Data Transformation ---

type SupabaseExerciseRow = {
  id: string;
  slug: string | null;
  name: string;
  equipment: string | null;
  category: string | null;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
  instructions: string[] | null;
  images: string[] | null;
  aliases?: string[] | null;
  canonical_id?: string | null;
  canonical_key?: string | null;
  based_on_exercise_id?: string | null;
  is_curated?: boolean | null;
  is_hidden?: boolean | null;
  is_custom?: boolean | null;
  normalized_name?: string | null;
};

function transformSupabaseExerciseToExercise(row: SupabaseExerciseRow): Exercise {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: toTitleCase(row.name),
    primaryMuscles: normalizeMuscleArray(row.primary_muscles ?? []),
    secondaryMuscles: normalizeMuscleArray(row.secondary_muscles ?? []),
    equipment: row.equipment ?? 'body only',
    category: row.category ?? 'strength',
    instructions: row.instructions ?? [],
    images: row.images ?? [],
    aliases: row.aliases ?? [],
    canonicalId: row.canonical_id ?? null,
    canonicalKey: row.canonical_key ?? null,
    basedOnExerciseId: row.based_on_exercise_id ?? null,
    isCurated: row.is_curated ?? false,
    isHidden: row.is_hidden ?? false,
    isCustom: row.is_custom ?? false,
    normalizedName: row.normalized_name ?? undefined,
  };
}

function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

function normalizeCategoryForDb(category?: string | null): string {
  const normalized = (category ?? '').trim().toLowerCase();
  if (!normalized) return 'strength';

  if (normalized === 'power') return 'powerlifting';
  if (normalized === 'mobility') return 'stretching';

  const allowed = new Set([
    'strength',
    'powerlifting',
    'olympic weightlifting',
    'strongman',
    'stretching',
    'cardio',
    'plyometrics',
  ]);

  return allowed.has(normalized) ? normalized : 'strength';
}

function normalizeEquipmentForDb(equipment?: string | null): string {
  const normalized = (equipment ?? '').trim().toLowerCase();
  if (!normalized) return 'bodyweight';

  const mapping: Record<string, string> = {
    bodyweight: 'bodyweight',
    'body weight': 'body weight',
    'body only': 'body weight',
    bands: 'band',
    band: 'band',
    cable: 'cable',
    machine: 'machine',
    dumbbell: 'dumbbell',
    barbell: 'barbell',
    kettlebell: 'kettlebell',
    kettlebells: 'kettlebell',
    'medicine ball': 'medicine ball',
    'resistance band': 'resistance band',
    suspension: 'suspension',
    assisted: 'assisted',
    rope: 'rope',
  };

  return mapping[normalized] ?? normalized;
}

function normalizeCustomExerciseSlug(exercise: Exercise): string {
  if (exercise.slug) return exercise.slug;
  if (exercise.id?.startsWith(CUSTOM_EXERCISE_PREFIX)) {
    return exercise.id;
  }
  return exercise.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `${CUSTOM_EXERCISE_PREFIX}${exercise.id}`;
}

async function fetchCustomExercisesFromSupabase(): Promise<Exercise[]> {
  if (!isSupabaseConfigured()) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('exercises')
    .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
    .eq('is_custom', true)
    .eq('created_by', user.id)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const exercise = transformSupabaseExerciseToExercise(row);
    const slug = row.slug ?? undefined;
    return {
      ...exercise,
      id: slug ?? exercise.id,
      slug,
      isCustom: true,
    };
  });
}

async function upsertCustomExerciseToSupabase(exercise: Exercise): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const slug = normalizeCustomExerciseSlug(exercise);
  const normalizedName = exercise.normalizedName || normalizeExerciseKey(exercise.name);

  const payload = {
    slug,
    name: exercise.name,
    level: 'intermediate',
    equipment: normalizeEquipmentForDb(exercise.equipment),
    category: normalizeCategoryForDb(exercise.category),
    primary_muscles: exercise.primaryMuscles?.length ? exercise.primaryMuscles : ['unknown'],
    secondary_muscles: exercise.secondaryMuscles ?? [],
    instructions: exercise.instructions ?? [],
    images: exercise.images ?? [],
    normalized_name: normalizedName,
    is_custom: true,
    created_by: user.id,
    based_on_exercise_id: exercise.basedOnExerciseId ?? null,
  };

  const { error } = await supabase
    .from('exercises')
    .upsert(payload, { onConflict: 'created_by,slug' });

  if (error) {
    throw new Error(error.message);
  }
}

function isCuratedCanonical(exercise: ExerciseWithSource): boolean {
  return !!exercise.isCurated && !exercise.canonicalId && !exercise.isHidden;
}

function upsertExerciseCaches(exercise: ExerciseWithSource): void {
  const { source, ...baseExercise } = exercise;

  if (source !== 'custom' && isCuratedCanonical(exercise)) {
    const baseExercises = baseExerciseCache ? [...baseExerciseCache] : [];
    const existingIndex = baseExercises.findIndex(e => e.id === baseExercise.id);
    if (existingIndex >= 0) {
      baseExercises[existingIndex] = baseExercise;
    } else {
      baseExercises.push(baseExercise);
    }
    baseExercises.sort((a, b) => a.name.localeCompare(b.name));
    baseExerciseCache = baseExercises;
  }

  if (allExercisesCache) {
    const customExercises = allExercisesCache.filter(e => e.source === 'custom');
    const baseExercises = allExercisesCache.filter(e => e.source !== 'custom');
    const targetList = source === 'custom' ? customExercises : baseExercises;
    const existingIndex = targetList.findIndex(e => e.id === exercise.id);
    if (existingIndex >= 0) {
      targetList[existingIndex] = exercise;
    } else {
      if (source === 'custom' || isCuratedCanonical(exercise)) {
        targetList.push(exercise);
      }
    }
    if (source !== 'custom') {
      baseExercises.sort((a, b) => a.name.localeCompare(b.name));
    }
    allExercisesCache = [...customExercises, ...baseExercises];
  } else {
    if (source === 'custom' || isCuratedCanonical(exercise)) {
      allExercisesCache = [exercise];
    }
  }

  if (!exerciseLookupCache) {
    exerciseLookupCache = new Map();
  }
  exerciseLookupCache.set(exercise.id, exercise);
  if (exercise.slug) {
    exerciseLookupCache.set(exercise.slug, exercise);
  }
  exerciseLookupCache.set(normalizeExerciseKey(exercise.name), exercise);
}

async function fetchExerciseByIdFromSupabase(id: string): Promise<Exercise | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('exercises')
    .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
    .eq('id', id)
    .eq('is_custom', false)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return transformSupabaseExerciseToExercise(data[0]);
}

// --- Cache Management ---

async function isCacheValid(): Promise<boolean> {
  try {
    const timestamp = await AsyncStorage.getItem(EXERCISE_CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge < EXERCISE_CONFIG.cacheDurationMs;
  } catch {
    return false;
  }
}

async function loadCachedExercises(): Promise<Exercise[] | null> {
  try {
    const cached = await AsyncStorage.getItem(EXERCISE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function loadCachedLibraryVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EXERCISE_LIBRARY_VERSION_KEY);
  } catch {
    return null;
  }
}

async function saveCachedExercises(exercises: Exercise[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(exercises));
    await AsyncStorage.setItem(EXERCISE_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache exercises:', error);
  }
}

async function saveCachedLibraryVersion(version: string | null): Promise<void> {
  if (!version) return;
  try {
    await AsyncStorage.setItem(EXERCISE_LIBRARY_VERSION_KEY, version);
  } catch (error) {
    console.warn('Failed to cache exercise library version:', error);
  }
}

async function fetchLibraryVersion(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('exercise_library_meta')
    .select('version')
    .eq('id', 1)
    .single();

  if (error) {
    return null;
  }

  return data?.version ? String(data.version) : null;
}

// --- Core Functions ---

export async function getAllExercises(options?: { includeVariants?: boolean }): Promise<ExerciseWithSource[]> {
  const includeVariants = options?.includeVariants ?? false;

  if (!includeVariants && allExercisesCache) {
    return allExercisesCache;
  }

  if (!includeVariants && allExercisesPromise) {
    return allExercisesPromise;
  }

  const loadExercises = async () => {
    const [baseExercises, customExercises] = await Promise.all([
      getBaseExercises({ includeVariants }),
      getCustomExercises(),
    ]);

    // Custom exercises take priority (prepended)
    const customWithSource = customExercises.map((e) => ({ ...e, source: 'custom' as ExerciseSource }));
    const baseWithSource = baseExercises.map((e) => ({
      ...e,
      source: 'api' as ExerciseSource,
    }));

    const merged = [...customWithSource, ...baseWithSource];
    if (!includeVariants) {
      allExercisesCache = merged;
      allExercisesPromise = null;
    }
    return merged;
  };

  if (includeVariants) {
    return loadExercises();
  }

  allExercisesPromise = loadExercises();
  return allExercisesPromise;
}

export async function getExerciseById(id: string): Promise<ExerciseWithSource | null> {
  if (!exerciseLookupCache) {
    const exercises = await getAllExercises();
    const lookup = new Map<string, ExerciseWithSource>();
    exercises.forEach((exercise) => {
      lookup.set(exercise.id, exercise);
      if (exercise.slug) {
        lookup.set(exercise.slug, exercise);
      }
      lookup.set(normalizeExerciseKey(exercise.name), exercise);
    });
    exerciseLookupCache = lookup;
  }

  const normalizedId = normalizeExerciseKey(id);
  const cachedExercise =
    exerciseLookupCache.get(id) ||
    exerciseLookupCache.get(normalizedId) ||
    null;

  if (cachedExercise) {
    if (cachedExercise.id === WIDE_GRIP_LAT_PULLDOWN_ID && cachedExercise.images.length > 0) {
      const strippedExercise: ExerciseWithSource = { ...cachedExercise, images: [] };
      upsertExerciseCaches(strippedExercise);
      if (baseExerciseCache) {
        await saveCachedExercises(baseExerciseCache);
      }
      DeviceEventEmitter.emit(EXERCISE_LIBRARY_UPDATED_EVENT);
      return strippedExercise;
    }

    if (cachedExercise.source !== 'custom' && cachedExercise.images.length === 0) {
      const refreshedExercise = await fetchExerciseByIdFromSupabase(cachedExercise.id);
      if (refreshedExercise && refreshedExercise.images.length > 0) {
        const exerciseWithSource: ExerciseWithSource = { ...refreshedExercise, source: 'api' };
        upsertExerciseCaches(exerciseWithSource);
        if (baseExerciseCache) {
          await saveCachedExercises(baseExerciseCache);
        }
        DeviceEventEmitter.emit(EXERCISE_LIBRARY_UPDATED_EVENT);
        return exerciseWithSource;
      }
    }

    return cachedExercise;
  }

  const fetchedExercise = await fetchExerciseByIdFromSupabase(id);
  if (!fetchedExercise) return null;

  const exerciseWithSource: ExerciseWithSource = { ...fetchedExercise, source: 'api' };
  upsertExerciseCaches(exerciseWithSource);
  if (baseExerciseCache) {
    await saveCachedExercises(baseExerciseCache);
  }
  DeviceEventEmitter.emit(EXERCISE_LIBRARY_UPDATED_EVENT);
  return exerciseWithSource;
}

export async function searchExercises(query: string): Promise<ExerciseWithSource[]> {
  const exercises = await getAllExercises();
  const index = buildExerciseSearchIndex(exercises);
  return searchExercisesInIndex(query, index);
}

export async function getExerciseVariants(canonicalId: string): Promise<Exercise[]> {
  if (!canonicalId || !isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('exercises')
    .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
    .eq('is_custom', false)
    .eq('is_hidden', false)
    .eq('canonical_id', canonicalId)
    .order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(transformSupabaseExerciseToExercise);
}

export async function filterExercises(filters: {
  muscles?: string[];
  categories?: string[];
  equipment?: string[];
}): Promise<ExerciseWithSource[]> {
  const exercises = await getAllExercises();
  return exercises.filter(e => {
    if (filters.muscles?.length && !filters.muscles.some(m => e.primaryMuscles.includes(m))) {
      return false;
    }
    if (filters.categories?.length && !filters.categories.includes(e.category)) {
      return false;
    }
    if (filters.equipment?.length && !filters.equipment.includes(e.equipment)) {
      return false;
    }
    return true;
  });
}

// --- Base Exercise Loading (Supabase-backed with caching) ---

async function getBaseExercises(options?: { includeVariants?: boolean }): Promise<Exercise[]> {
  const includeVariants = options?.includeVariants ?? false;

  // 1. Check in-memory cache
  if (!includeVariants && baseExerciseCache && baseExerciseCache.length > 0) {
    return baseExerciseCache;
  }
  if (includeVariants && baseExerciseFullCache && baseExerciseFullCache.length > 0) {
    return baseExerciseFullCache;
  }

  // 2. Check persistent cache + server version to avoid stale data
  if (!includeVariants && await isCacheValid()) {
    const [cached, cachedVersion, remoteVersion] = await Promise.all([
      loadCachedExercises(),
      loadCachedLibraryVersion(),
      fetchLibraryVersion(),
    ]);
    if (cached && cached.length > 0) {
      if (!remoteVersion || !cachedVersion || cachedVersion === remoteVersion) {
        const hasCurationFields = cached.some((exercise) =>
          typeof exercise.isCurated === 'boolean' || exercise.canonicalId !== undefined
        );
        if (hasCurationFields) {
          const curatedOnly = cached.filter((exercise) =>
            exercise.isCurated && !exercise.canonicalId && !exercise.isHidden
          );
          if (curatedOnly.length > 0) {
            baseExerciseCache = curatedOnly;
            return curatedOnly;
          }
        }
      }
    }
  }

  // 3. Fetch from Supabase
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured for exercise loading');
    }

    const baseQuery = supabase
      .from('exercises')
      .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
      .eq('is_custom', false)
      .eq('is_hidden', false);

    const filteredQuery = includeVariants
      ? baseQuery
      : baseQuery.eq('is_curated', true).is('canonical_id', null);

    const [version, { data, error }] = await Promise.all([
      fetchLibraryVersion(),
      filteredQuery.order('name', { ascending: true }),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    const transformed = (data || []).map(transformSupabaseExerciseToExercise);

    if (includeVariants) {
      baseExerciseFullCache = transformed;
    } else {
      baseExerciseCache = transformed;
      await saveCachedExercises(transformed);
      await saveCachedLibraryVersion(version);
    }

    return transformed;
  } catch (error) {
    // Track API error
    analytics.trackApiError({
      service: 'exercises',
      operation: 'fetch_base_exercises',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    // 4. Try to use stale cache if API fails
    const staleCache = await loadCachedExercises();
    if (staleCache && staleCache.length > 0) {
      console.warn('Using stale cache due to API error:', error);
      baseExerciseCache = staleCache;
      return staleCache;
    }

    // 5. No cache available - throw error
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Unable to load exercises: ${message}`);
  }
}

/**
 * Force refresh the exercise cache from Supabase.
 */
export async function refreshExerciseCache(): Promise<void> {
  baseExerciseCache = null;
  baseExerciseFullCache = null;
  allExercisesCache = null;
  exerciseLookupCache = null;
  await AsyncStorage.removeItem(EXERCISE_CACHE_KEY);
  await AsyncStorage.removeItem(EXERCISE_CACHE_TIMESTAMP_KEY);
  await AsyncStorage.removeItem(EXERCISE_LIBRARY_VERSION_KEY);
  await getBaseExercises();
}

// --- Custom Exercises ---

export async function getCustomExercises(): Promise<Exercise[]> {
  if (customExerciseCache) return customExerciseCache;

  try {
    const raw = await getScopedItem(CUSTOM_EXERCISES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    customExerciseCache = parsed.map((exercise: Exercise) => ({
      ...exercise,
      primaryMuscles: normalizeMuscleArray(exercise.primaryMuscles ?? []),
      secondaryMuscles: normalizeMuscleArray(exercise.secondaryMuscles ?? []),
      isCustom: true,
    }));
    return customExerciseCache!;
  } catch (error) {
    console.warn('Failed to load custom exercises:', error);
    return [];
  }
}

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  const normalizedName = normalizeExerciseKey(exercise.name);
  const exerciseWithMeta: Exercise = {
    ...exercise,
    primaryMuscles: normalizeMuscleArray(exercise.primaryMuscles ?? []),
    secondaryMuscles: normalizeMuscleArray(exercise.secondaryMuscles ?? []),
    normalizedName,
    isCustom: true,
  };
  const customs = await getCustomExercises();
  const existingIndex = customs.findIndex(e => e.id === exercise.id);

  if (existingIndex >= 0) {
    customs[existingIndex] = exerciseWithMeta;
  } else {
    customs.unshift(exerciseWithMeta);
  }

  await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customs));
  customExerciseCache = customs;
  allExercisesCache = null;
  exerciseLookupCache = null;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const customs = await getCustomExercises();
  const filtered = customs.filter(e => e.id !== id);
  await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
  customExerciseCache = filtered;
  allExercisesCache = null;
  exerciseLookupCache = null;
}

// --- Cache Management ---

export function invalidateCache(): void {
  baseExerciseCache = null;
  baseExerciseFullCache = null;
  customExerciseCache = null;
  allExercisesCache = null;
  exerciseLookupCache = null;
}

export function invalidateCustomCache(): void {
  customExerciseCache = null;
  allExercisesCache = null;
  exerciseLookupCache = null;
}

// --- Utilities ---

/**
 * Gets the full URL for an exercise image.
 * Handles both full URLs (from ExerciseDB API) and relative paths.
 */
export function getExerciseImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // For any relative paths (shouldn't happen with API), return as-is
  return imagePath;
}

/**
 * Check if an exercise is a custom exercise (vs from the base database)
 */
export function isCustomExercise(id: string): boolean {
  return id.startsWith('custom-');
}

function normalizeExerciseKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
