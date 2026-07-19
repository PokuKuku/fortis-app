import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(() => false),
  supabase: {
    auth: {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    },
  },
}));

import { getAllExercises, getExerciseById } from '@/src/services/exerciseService';
import { getCachedExerciseImageSource } from '@/src/utils/exerciseImageCache';
import {
  EXERCISE_GIF_ASSET_COUNT,
  getExerciseGifAsset,
} from '@/src/utils/exerciseGifAssets';

describe('exerciseService image hydration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads the bundled v8 exercise library with local GIF tokens when offline', async () => {
    const exercises = await getAllExercises();
    const ids = exercises.map((exercise) => exercise.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(exercises.filter((exercise) => exercise.source === 'api')).toHaveLength(1381);
    expect(EXERCISE_GIF_ASSET_COUNT).toBe(1394);
    expect(exercises.every((exercise) => exercise.images[0]?.startsWith('exercise-gif://'))).toBe(true);
  });

  it('preserves existing UUID lookup while resolving local bundled GIF assets', async () => {
    const exercise = await getExerciseById('10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc');

    expect(exercise?.name).toBe('Barbell Bench Press');
    expect(exercise?.slug).toBe('0025');
    expect(exercise?.exerciseDbId).toBe('0025');
    expect(exercise?.images[0]).toBe('exercise-gif://0025');
    expect(getCachedExerciseImageSource(exercise?.images[0])).toBeTruthy();
  });

  it('resolves only requested bundled assets and safely rejects unknown ids', () => {
    const firstSource = getCachedExerciseImageSource('exercise-gif://0025');
    const cachedSource = getCachedExerciseImageSource('exercise-gif://0025');

    expect(firstSource).toBeTruthy();
    expect(cachedSource).toBe(firstSource);
    expect(getExerciseGifAsset('missing')).toBeNull();
    expect(getCachedExerciseImageSource('exercise-gif://missing')).toBeNull();
  });

  it('resolves new ExerciseDB ids through the same bundled exercise', async () => {
    const exercise = await getExerciseById('0025');

    expect(exercise?.id).toBe('10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc');
    expect(exercise?.name).toBe('Barbell Bench Press');
    expect(exercise?.images[0]).toBe('exercise-gif://0025');
  });

  it('keeps alternate duplicate snapshot slugs resolvable after service-level dedupe', async () => {
    const primarySlug = await getExerciseById('2798');
    const duplicateSlug = await getExerciseById('2797');

    expect(primarySlug?.id).toBe('2b0655a3-e23d-4b55-8dd8-047037083781');
    expect(duplicateSlug?.id).toBe(primarySlug?.id);
    expect(duplicateSlug?.name).toBe('Barbell Squat Jump Step Rear Lunge');
  });

  it('keeps legacy-only UUID exercises resolvable for saved history', async () => {
    const exercise = await getExerciseById('b6520dc0-90b1-4870-86bb-df610f351345');

    expect(exercise?.name).toBe('Active Style Cable Pushdown');
    expect(exercise?.images).toEqual([]);
  });
});
