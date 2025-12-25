import { Exercise, ExerciseWithSource, ExerciseSource, ExerciseDbResponse } from '@/src/types/exercise';
import { EXERCISE_CONFIG } from '@/src/constants/exerciseConfig';
import { CUSTOM_EXERCISES_KEY, EXERCISE_CACHE_KEY, EXERCISE_CACHE_TIMESTAMP_KEY } from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exerciseDbClient } from './exerciseDbClient';
import { normalizeMuscleArray } from '@/src/utils/muscleMapping';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

// In-memory cache
let baseExerciseCache: Exercise[] | null = null;
let customExerciseCache: Exercise[] | null = null;

// --- Helpers ---

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// --- Data Transformation ---

function transformExerciseDbToExercise(apiExercise: ExerciseDbResponse): Exercise {
  const isOpenSource = EXERCISE_CONFIG.activeApi === 'opensource';

  if (isOpenSource) {
    // Open source API: exerciseId, targetMuscles[], bodyParts[], equipments[], gifUrl
    return {
      id: apiExercise.exerciseId || '',
      name: toTitleCase(apiExercise.name || ''),
      primaryMuscles: normalizeMuscleArray(apiExercise.targetMuscles || []),
      secondaryMuscles: normalizeMuscleArray(apiExercise.secondaryMuscles || []),
      equipment: apiExercise.equipments?.[0] || 'body only',
      category: apiExercise.bodyParts?.[0] || 'strength',
      instructions: apiExercise.instructions || [],
      images: apiExercise.gifUrl ? [apiExercise.gifUrl] : [],
    };
  } else {
    // RapidAPI: id, target (string), bodyPart (string), equipment (string)
    const exerciseId = apiExercise.id || '';
    const apiKey = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || '';
    const resolution = (EXERCISE_CONFIG as any).imageResolution || 360;
    const gifUrl = exerciseId
      ? `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=${resolution}&rapidapi-key=${apiKey}`
      : '';

    const primaryMuscles = apiExercise.target ? [apiExercise.target] : [];

    return {
      id: exerciseId,
      name: toTitleCase(apiExercise.name || ''),
      primaryMuscles: normalizeMuscleArray(primaryMuscles),
      secondaryMuscles: normalizeMuscleArray(apiExercise.secondaryMuscles || []),
      equipment: apiExercise.equipment || 'body only',
      category: apiExercise.bodyPart || 'strength',
      instructions: apiExercise.instructions || [],
      images: gifUrl ? [gifUrl] : [],
    };
  }
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

async function saveCachedExercises(exercises: Exercise[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(exercises));
    await AsyncStorage.setItem(EXERCISE_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache exercises:', error);
  }
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

// --- Base Exercise Loading (API-only with caching) ---

async function getBaseExercises(): Promise<Exercise[]> {
  // 1. Check in-memory cache
  if (baseExerciseCache && baseExerciseCache.length > 0) {
    return baseExerciseCache;
  }

  // 2. Check persistent cache
  if (await isCacheValid()) {
    const cached = await loadCachedExercises();
    if (cached && cached.length > 0) {
      baseExerciseCache = cached;
      return cached;
    }
  }

  // 3. Fetch from API
  try {
    const apiExercises = await exerciseDbClient.fetchAllExercises();
    const transformed = apiExercises.map(transformExerciseDbToExercise);

    baseExerciseCache = transformed;
    await saveCachedExercises(transformed);

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
 * Force refresh the exercise cache from API.
 */
export async function refreshExerciseCache(): Promise<void> {
  baseExerciseCache = null;
  await AsyncStorage.removeItem(EXERCISE_CACHE_KEY);
  await AsyncStorage.removeItem(EXERCISE_CACHE_TIMESTAMP_KEY);
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
