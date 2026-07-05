import { DeviceEventEmitter } from 'react-native';
import { Exercise, ExerciseWithSource, ExerciseSource } from '@/src/types/exercise';
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

// In-memory cache
let baseExerciseCache: Exercise[] | null = null;
let baseExerciseFullCache: Exercise[] | null = null;
let customExerciseCache: Exercise[] | null = null;
let allExercisesCache: ExerciseWithSource[] | null = null;
let allExercisesPromise: Promise<ExerciseWithSource[]> | null = null;
let exerciseLookupCache: Map<string, ExerciseWithSource> | null = null;
let snapshotExerciseCache: Exercise[] | null = null;
let legacyCompatibilityExerciseCache: Exercise[] | null = null;

const EXERCISE_LIBRARY_UPDATED_EVENT = 'exerciseLibraryUpdated';
const CUSTOM_EXERCISE_PREFIX = 'custom-';
const SUPABASE_EXERCISE_PAGE_SIZE = 1000;
const SUPABASE_EXERCISE_MAX_PAGES = 20;
const MIN_EXPECTED_EXERCISE_COUNT = 1200;
const EXERCISE_CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

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

type SnapshotExerciseRow = {
  id: string;
  slug?: string | null;
  name: string;
  equipment?: string | null;
  category?: string | null;
  primary_muscles?: string[] | null;
  secondary_muscles?: string[] | null;
  instructions?: string[] | null;
  images?: string[] | null;
  aliases?: string[] | null;
  canonical_id?: string | null;
  canonical_key?: string | null;
  based_on_exercise_id?: string | null;
  is_curated?: boolean | null;
  is_hidden?: boolean | null;
  is_custom?: boolean | null;
  normalized_name?: string | null;
  exercise_db_id?: string | null;
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
    exerciseDbId: undefined,
  };
}

function transformSnapshotExerciseToExercise(row: SnapshotExerciseRow): Exercise {
  const exercise = transformSupabaseExerciseToExercise({
    id: row.id,
    slug: row.slug ?? null,
    name: row.name,
    equipment: row.equipment ?? null,
    category: row.category ?? null,
    primary_muscles: row.primary_muscles ?? [],
    secondary_muscles: row.secondary_muscles ?? [],
    instructions: row.instructions ?? [],
    images: row.images ?? [],
    aliases: row.aliases ?? [],
    canonical_id: row.canonical_id ?? null,
    canonical_key: row.canonical_key ?? null,
    based_on_exercise_id: row.based_on_exercise_id ?? null,
    is_curated: row.is_curated ?? false,
    is_hidden: row.is_hidden ?? false,
    is_custom: row.is_custom ?? false,
    normalized_name: row.normalized_name ?? null,
  });

  return {
    ...exercise,
    exerciseDbId: row.exercise_db_id ?? undefined,
  };
}

function addExerciseLookupEntries(
  lookup: Map<string, ExerciseWithSource>,
  exercise: ExerciseWithSource
): void {
  const keys = [
    exercise.id,
    exercise.slug,
    exercise.remoteId,
    exercise.exerciseDbId,
    exercise.normalizedName,
    exercise.name,
    ...(exercise.aliases ?? []),
  ];

  keys.forEach((key) => {
    if (!key) return;
    lookup.set(key, exercise);
    lookup.set(normalizeExerciseKey(key), exercise);
  });
}

function mergeExerciseAliases(primary: Exercise, duplicate: Exercise): string[] {
  const aliases = new Set<string>(primary.aliases ?? []);
  [
    duplicate.id,
    duplicate.slug,
    duplicate.remoteId,
    duplicate.exerciseDbId,
    duplicate.normalizedName,
    duplicate.name,
    ...(duplicate.aliases ?? []),
  ].forEach((alias) => {
    if (alias) aliases.add(alias);
  });

  return Array.from(aliases);
}

function dedupeExercisesById<T extends Exercise>(exercises: T[]): T[] {
  const byId = new Map<string, T>();

  exercises.forEach((exercise) => {
    const existing = byId.get(exercise.id);
    if (!existing) {
      byId.set(exercise.id, exercise);
      return;
    }

    byId.set(exercise.id, {
      ...existing,
      aliases: mergeExerciseAliases(existing, exercise),
    });
  });

  return Array.from(byId.values());
}

function loadSnapshotExercises(): Exercise[] {
  if (snapshotExerciseCache) return snapshotExerciseCache;

  try {
    const raw = require('@/src/data/exerciseLibrarySnapshot.json') as SnapshotExerciseRow[];
    snapshotExerciseCache = dedupeExercisesById(raw.map(transformSnapshotExerciseToExercise));
  } catch (error) {
    console.warn('Failed to load exercise snapshot:', error);
    snapshotExerciseCache = [];
  }

  return snapshotExerciseCache;
}

function getBaseExercisesSync(options?: { includeVariants?: boolean }): Exercise[] {
  const includeVariants = options?.includeVariants ?? false;

  if (!includeVariants && baseExerciseCache && baseExerciseCache.length > 0) {
    return baseExerciseCache;
  }
  if (includeVariants && baseExerciseFullCache && baseExerciseFullCache.length > 0) {
    return baseExerciseFullCache;
  }

  const snapshotExercises = loadSnapshotExercises();
  if (includeVariants) {
    baseExerciseFullCache = snapshotExercises;
  } else {
    baseExerciseCache = snapshotExercises;
  }

  return snapshotExercises;
}

export function getInitialExercisesSync(): ExerciseWithSource[] {
  const customExercises = customExerciseCache ?? [];
  const customWithSource = customExercises.map((exercise) => ({
    ...exercise,
    source: 'custom' as ExerciseSource,
  }));
  const baseWithSource = getBaseExercisesSync().map((exercise) => ({
    ...exercise,
    source: 'api' as ExerciseSource,
  }));

  return dedupeExercisesById([...customWithSource, ...baseWithSource]);
}

function loadLegacyCompatibilityExercises(): Exercise[] {
  if (legacyCompatibilityExerciseCache) return legacyCompatibilityExerciseCache;

  try {
    const raw = require('@/src/data/exerciseLegacyCompatibility.json') as SnapshotExerciseRow[];
    legacyCompatibilityExerciseCache = raw.map(transformSnapshotExerciseToExercise);
  } catch (error) {
    console.warn('Failed to load legacy exercise compatibility snapshot:', error);
    legacyCompatibilityExerciseCache = [];
  }

  return legacyCompatibilityExerciseCache;
}

function mergeExercises(primary: Exercise[], fallback: Exercise[]): Exercise[] {
  if (fallback.length === 0) return primary;

  const byId = new Map<string, Exercise>();
  fallback.forEach((exercise) => {
    byId.set(exercise.id, exercise);
  });
  primary.forEach((exercise) => {
    byId.set(exercise.id, exercise);
  });

  return Array.from(byId.values());
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
      remoteId: exercise.id,
      isCustom: true,
    };
  });
}

async function upsertCustomExerciseToSupabase(
  exercise: Exercise
): Promise<{ remoteId: string; slug: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sign in required to save custom exercises');
  }

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

  const { data, error } = await supabase
    .from('exercises')
    .upsert(payload, { onConflict: 'created_by,slug' })
    .select('id, slug')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    remoteId: data?.id ?? exercise.remoteId ?? slug,
    slug: data?.slug ?? slug,
  };
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
  addExerciseLookupEntries(exerciseLookupCache, exercise);
}

async function fetchExerciseByIdFromSupabase(id: string): Promise<Exercise | null> {
  if (!isSupabaseConfigured()) return null;

  const { data: { user } } = await supabase.auth.getUser();
  const query = supabase
    .from('exercises')
    .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
    .eq('id', id);

  const { data, error } = user
    ? await query.or(`is_custom.eq.false,created_by.eq.${user.id}`).limit(1)
    : await query.eq('is_custom', false).limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  const exercise = transformSupabaseExerciseToExercise(data[0]);
  if (!exercise.isCustom) {
    return exercise;
  }

  const slug = exercise.slug ?? undefined;
  return {
    ...exercise,
    id: slug ?? exercise.id,
    slug,
    remoteId: exercise.id,
    isCustom: true,
  };
}

// --- Cache Management ---

async function isCacheValid(): Promise<boolean> {
  try {
    const timestamp = await AsyncStorage.getItem(EXERCISE_CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge < EXERCISE_CACHE_DURATION_MS;
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

async function fetchAllBaseExercisesFromSupabase(): Promise<Exercise[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for exercise loading');
  }

  const exercises: Exercise[] = [];

  for (let page = 0; page < SUPABASE_EXERCISE_MAX_PAGES; page += 1) {
    const from = page * SUPABASE_EXERCISE_PAGE_SIZE;
    const to = from + SUPABASE_EXERCISE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('exercises')
      .select('id, slug, name, equipment, category, primary_muscles, secondary_muscles, instructions, images, aliases, canonical_id, canonical_key, based_on_exercise_id, is_curated, is_hidden, is_custom, normalized_name')
      .eq('is_custom', false)
      .eq('is_hidden', false)
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      break;
    }

    exercises.push(...data.map(transformSupabaseExerciseToExercise));

    if (data.length < SUPABASE_EXERCISE_PAGE_SIZE) {
      break;
    }
  }

  return exercises;
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

    const merged = dedupeExercisesById([...customWithSource, ...baseWithSource]);
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
      addExerciseLookupEntries(lookup, exercise);
    });
    exerciseLookupCache = lookup;
  }

  const normalizedId = normalizeExerciseKey(id);
  const cachedExercise =
    exerciseLookupCache.get(id) ||
    exerciseLookupCache.get(normalizedId) ||
    null;

  if (cachedExercise) {
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

  const legacyExercise = loadLegacyCompatibilityExercises()
    .map((exercise) => ({ ...exercise, source: 'api' as ExerciseSource }))
    .find((exercise) => {
      const keys = [
        exercise.id,
        exercise.slug,
        exercise.exerciseDbId,
        exercise.normalizedName,
        exercise.name,
        ...(exercise.aliases ?? []),
      ].filter((key): key is string => Boolean(key));

      return keys.some((key) => key === id || normalizeExerciseKey(key) === normalizedId);
    });

  if (legacyExercise) {
    upsertExerciseCaches(legacyExercise);
    return legacyExercise;
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

// --- Base Exercise Loading (Supabase-backed with caching) ---

async function getBaseExercises(options?: { includeVariants?: boolean }): Promise<Exercise[]> {
  return getBaseExercisesSync(options);
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
    // Load from local storage
    const raw = await getScopedItem(CUSTOM_EXERCISES_KEY);
    const localExercises: Exercise[] = raw ? JSON.parse(raw) : [];
    const normalizedLocal = localExercises.map((exercise: Exercise) => ({
      ...exercise,
      primaryMuscles: normalizeMuscleArray(exercise.primaryMuscles ?? []),
      secondaryMuscles: normalizeMuscleArray(exercise.secondaryMuscles ?? []),
      isCustom: true,
    }));

    // Fetch from Supabase and merge (for cross-device sync)
    const remoteExercises = await fetchCustomExercisesFromSupabase();

    if (remoteExercises.length > 0) {
      const remoteBySlug = new Map<string, Exercise>();
      remoteExercises.forEach((remote) => {
        const remoteSlug = remote.slug ?? normalizeCustomExerciseSlug(remote);
        remoteBySlug.set(remoteSlug, remote);
      });

      const mergedLocal = normalizedLocal.map((local) => {
        const localSlug = local.slug ?? normalizeCustomExerciseSlug(local);
        const remote = remoteBySlug.get(localSlug);
        if (!remote) {
          return {
            ...local,
            slug: local.slug ?? localSlug,
          };
        }

        return {
          ...remote,
          ...local,
          id: local.id,
          slug: local.slug ?? remote.slug ?? localSlug,
          remoteId: remote.remoteId,
          isCustom: true,
          primaryMuscles: normalizeMuscleArray(local.primaryMuscles ?? remote.primaryMuscles ?? []),
          secondaryMuscles: normalizeMuscleArray(local.secondaryMuscles ?? remote.secondaryMuscles ?? []),
        };
      });

      const localIds = new Set(mergedLocal.map(e => e.id));
      const localSlugs = new Set(mergedLocal.map(e => e.slug ?? normalizeCustomExerciseSlug(e)));
      const remoteOnly = remoteExercises.filter((remote) => {
        const remoteSlug = remote.slug ?? normalizeCustomExerciseSlug(remote);
        return !localIds.has(remote.id) && !localSlugs.has(remoteSlug);
      });

      const merged = [...mergedLocal, ...remoteOnly];
      await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(merged));
      customExerciseCache = merged;
      return customExerciseCache;
    }

    customExerciseCache = normalizedLocal;
    return customExerciseCache;
  } catch (error) {
    console.warn('Failed to load custom exercises:', error);
    return [];
  }
}

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sign in required to save custom exercises');
  }

  const slug = normalizeCustomExerciseSlug(exercise);
  const normalizedName = normalizeExerciseKey(exercise.name);
  const exerciseWithMeta: Exercise = {
    ...exercise,
    slug,
    primaryMuscles: normalizeMuscleArray(exercise.primaryMuscles ?? []),
    secondaryMuscles: normalizeMuscleArray(exercise.secondaryMuscles ?? []),
    normalizedName,
    isCustom: true,
  };

  // Server-first: ensure the exercise is persisted remotely before saving locally.
  const remote = await upsertCustomExerciseToSupabase(exerciseWithMeta);
  const customs = await getCustomExercises();
  const existingIndex = customs.findIndex(e => e.id === exercise.id);
  const nextExercise: Exercise = {
    ...exerciseWithMeta,
    slug: remote.slug,
    remoteId: existingIndex >= 0 ? (customs[existingIndex].remoteId ?? remote.remoteId) : remote.remoteId,
  };

  if (existingIndex >= 0) {
    customs[existingIndex] = nextExercise;
  } else {
    customs.unshift(nextExercise);
  }

  // Save to local storage after a successful server upsert.
  await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customs));
  customExerciseCache = customs;
  allExercisesCache = null;
  exerciseLookupCache = null;
}

// --- Cache Management ---

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
