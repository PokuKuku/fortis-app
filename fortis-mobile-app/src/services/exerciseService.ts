import { Exercise, ExerciseWithSource, ExerciseSource } from '@/src/types/exercise';
import { EXERCISE_CONFIG } from '@/src/constants/exerciseConfig';
import { CUSTOM_EXERCISES_KEY } from '@/src/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache
let baseExerciseCache: Exercise[] | null = null;
let customExerciseCache: Exercise[] | null = null;

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
    source: (EXERCISE_CONFIG.source === 'local' ? 'local' : 'api') as ExerciseSource
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

// --- Base Exercise Loading (swappable) ---

async function getBaseExercises(): Promise<Exercise[]> {
  if (baseExerciseCache) return baseExerciseCache;

  if (EXERCISE_CONFIG.source === 'local') {
    return loadLocalExercises();
  } else {
    return fetchApiExercises();
  }
}

function loadLocalExercises(): Exercise[] {
  // Synchronous require for bundled JSON
  const data = require('@/assets/exercises.json');
  baseExerciseCache = data;
  return data;
}

async function fetchApiExercises(): Promise<Exercise[]> {
  // Future: API implementation
  // Add error handling, retry logic, etc. as needed
  try {
    const response = await fetch(`${EXERCISE_CONFIG.apiBaseUrl}/exercises`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    baseExerciseCache = data;
    return data;
  } catch (error) {
    console.error('Failed to fetch exercises from API:', error);
    // Fallback to local if API fails
    return loadLocalExercises();
  }
}

// --- Custom Exercises ---

export async function getCustomExercises(): Promise<Exercise[]> {
  if (customExerciseCache) return customExerciseCache;

  try {
    const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
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

  await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customs));
  customExerciseCache = customs;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const customs = await getCustomExercises();
  const filtered = customs.filter(e => e.id !== id);
  await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(filtered));
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

export function getExerciseImageUrl(imagePath: string): string {
  return `${EXERCISE_CONFIG.imageBaseUrl}${imagePath}`;
}

/**
 * Check if an exercise is a custom exercise (vs from the base database)
 */
export function isCustomExercise(id: string): boolean {
  return id.startsWith('custom-');
}
