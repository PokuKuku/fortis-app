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
import { exerciseGifAssets } from '@/src/utils/exerciseGifAssets';

describe('exerciseService image hydration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads the bundled v8 exercise library with local GIF tokens when offline', async () => {
    const exercises = await getAllExercises();

    expect(exercises.filter((exercise) => exercise.source === 'api')).toHaveLength(1394);
    expect(Object.keys(exerciseGifAssets)).toHaveLength(1394);
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

  it('resolves new ExerciseDB ids through the same bundled exercise', async () => {
    const exercise = await getExerciseById('0025');

    expect(exercise?.id).toBe('10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc');
    expect(exercise?.name).toBe('Barbell Bench Press');
    expect(exercise?.images[0]).toBe('exercise-gif://0025');
  });

  it('keeps legacy-only UUID exercises resolvable for saved history', async () => {
    const exercise = await getExerciseById('b6520dc0-90b1-4870-86bb-df610f351345');

    expect(exercise?.name).toBe('Active Style Cable Pushdown');
    expect(exercise?.images).toEqual([]);
  });
});
