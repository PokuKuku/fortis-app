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

// In-memory cache
let baseExerciseCache: Exercise[] | null = null;
let customExerciseCache: Exercise[] | null = null;

// --- Data Transformation ---

type SupabaseExerciseRow = {
  id: string;
  name: string;
  equipment: string | null;
  category: string | null;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
  instructions: string[] | null;
  images: string[] | null;
};

function transformSupabaseExerciseToExercise(row: SupabaseExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    primaryMuscles: normalizeMuscleArray(row.primary_muscles ?? []),
    secondaryMuscles: normalizeMuscleArray(row.secondary_muscles ?? []),
    equipment: row.equipment ?? 'body only',
    category: row.category ?? 'strength',
    instructions: row.instructions ?? [],
    images: row.images ?? [],
  };
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

export async function getAllExercises(): Promise<ExerciseWithSource[]> {
  const [baseExercises, customExercises] = await Promise.all([
    getBaseExercises(),
    getCustomExercises(),
  ]);

  // Custom exercises take priority (prepended)
  const customWithSource = customExercises.map(e => ({ ...e, source: 'custom' as ExerciseSource }));
  const baseWithSource = baseExercises.map(e => ({
    ...e,
    source: 'api' as ExerciseSource
  }));

  return [...customWithSource, ...baseWithSource];
}

export async function getExerciseById(id: string): Promise<ExerciseWithSource | null> {
  const exercises = await getAllExercises();
  return exercises.find(e => e.id === id) || null;
}

export async function searchExercises(query: string): Promise<ExerciseWithSource[]> {
  const exercises = await getAllExercises();
  const lowerQuery = query.toLowerCase();
  return exercises.filter(e =>
    e.name.toLowerCase().includes(lowerQuery) ||
    e.primaryMuscles.some(m => m.toLowerCase().includes(lowerQuery)) ||
    e.equipment.toLowerCase().includes(lowerQuery)
  );
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

async function getBaseExercises(): Promise<Exercise[]> {
  // 1. Check in-memory cache
  if (baseExerciseCache && baseExerciseCache.length > 0) {
    return baseExerciseCache;
  }

  // 2. Check persistent cache + server version to avoid stale data
  if (await isCacheValid()) {
    const [cached, cachedVersion, remoteVersion] = await Promise.all([
      loadCachedExercises(),
      loadCachedLibraryVersion(),
      fetchLibraryVersion(),
    ]);
    if (cached && cached.length > 0) {
      if (!remoteVersion || !cachedVersion || cachedVersion === remoteVersion) {
        baseExerciseCache = cached;
        return cached;
      }
    }
  }

  // 3. Fetch from Supabase
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured for exercise loading');
    }

    const [version, { data, error }] = await Promise.all([
      fetchLibraryVersion(),
      supabase
        .from('exercises')
        .select('id, name, equipment, category, primary_muscles, secondary_muscles, instructions, images')
        .eq('is_custom', false)
        .order('name', { ascending: true }),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    const transformed = (data || []).map(transformSupabaseExerciseToExercise);

    baseExerciseCache = transformed;
    await saveCachedExercises(transformed);
    await saveCachedLibraryVersion(version);

    return transformed;
  } catch (error) {
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
    customExerciseCache = raw ? JSON.parse(raw) : [];
    return customExerciseCache!;
  } catch (error) {
    console.warn('Failed to load custom exercises:', error);
    return [];
  }
}

export async function saveCustomExercise(exercise: Exercise): Promise<void> {
  const customs = await getCustomExercises();
  const existingIndex = customs.findIndex(e => e.id === exercise.id);

  if (existingIndex >= 0) {
    customs[existingIndex] = exercise;
  } else {
    customs.unshift(exercise);
  }

  await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customs));
  customExerciseCache = customs;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const customs = await getCustomExercises();
  const filtered = customs.filter(e => e.id !== id);
  await setScopedItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
  customExerciseCache = filtered;
}

// --- Cache Management ---

export function invalidateCache(): void {
  baseExerciseCache = null;
  customExerciseCache = null;
}

export function invalidateCustomCache(): void {
  customExerciseCache = null;
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
