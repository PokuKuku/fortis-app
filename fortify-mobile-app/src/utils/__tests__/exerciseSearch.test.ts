import {
  buildExerciseSearchIndex,
  getCachedExerciseSearchIndex,
  searchExercises,
} from '@/src/utils/exerciseSearch';
import type { ExerciseWithSource } from '@/src/types/exercise';

const exercise = (id: string, name: string): ExerciseWithSource => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  primaryMuscles: [],
  secondaryMuscles: [],
  equipment: 'cable',
  category: 'strength',
  instructions: [],
  images: [],
  source: 'api',
});

const exerciseWithInstructions = (
  id: string,
  name: string,
  instructions: string[],
): ExerciseWithSource => ({
  ...exercise(id, name),
  instructions,
});

describe('exercise search', () => {
  it('reuses a lean index without processing instruction-only matches', () => {
    const exercises = [
      exercise('sit-up', '3/4 Sit-Up'),
      exerciseWithInstructions('neck-stretch', 'Neck Side Stretch', ['Sit up straight.']),
    ];
    const index = buildExerciseSearchIndex(exercises, { includeInstructions: false });

    expect(getCachedExerciseSearchIndex(exercises, { includeInstructions: false })).toBe(index);
    expect(searchExercises('sit up straight', index, { includeInstructions: false })).toEqual([]);
  });

  it('keeps unrelated fuzzy matches out of multi-word exercise results', () => {
    const index = buildExerciseSearchIndex([
      exercise('rear-delt-fly', 'Cable Rear Delt Fly'),
      exercise('squat', 'Barbell Full Squat'),
      exercise('wide-squat', 'Barbell Wide Squat'),
    ]);

    const matches = searchExercises('Rear Delt Fly', index);

    expect(matches.map((match) => match.name)).toEqual(['Cable Rear Delt Fly']);
  });

  it('ranks the canonical barbell full squat first for a squat query', () => {
    const index = buildExerciseSearchIndex([
      exercise('wide-squat', 'Barbell Wide Squat'),
      exercise('full-squat-back-pov', 'Barbell Full Squat (back Pov)'),
      exercise('full-squat', 'Barbell Full Squat'),
    ]);

    const matches = searchExercises('squat', index);

    expect(matches.map((match) => match.name)).toEqual([
      'Barbell Full Squat',
      'Barbell Full Squat (back Pov)',
      'Barbell Wide Squat',
    ]);
  });

  it('ranks exercise names above matching phrases found only in instructions', () => {
    const index = buildExerciseSearchIndex([
      exercise('sit-up', '3/4 Sit-Up'),
      exercise('assisted-sit-up', 'Assisted Sit-Up'),
      exerciseWithInstructions(
        'neck-stretch',
        'Neck Side Stretch',
        ['Sit up straight with your shoulders relaxed.'],
      ),
      exerciseWithInstructions(
        'butterfly',
        'Butterfly Yoga Pose',
        ['Sit up tall and bring the soles of your feet together.'],
      ),
    ]);

    const matches = searchExercises('sit-ups', index);

    expect(matches.slice(0, 2).map((match) => match.name)).toEqual([
      '3/4 Sit-Up',
      'Assisted Sit-Up',
    ]);
    expect(matches.slice(2).map((match) => match.name)).toEqual([
      'Butterfly Yoga Pose',
      'Neck Side Stretch',
    ]);
  });

  it('returns sit-up exercises for a pluralized query against the bundled library', () => {
    const snapshot = require('@/src/data/exerciseLibrarySnapshot.json') as Array<{
      id: string;
      name: string;
      slug?: string;
      primary_muscles?: string[];
      secondary_muscles?: string[];
      equipment?: string;
      category?: string;
      instructions?: string[];
      images?: string[];
      aliases?: string[];
      is_curated?: boolean;
    }>;
    const bundledExercises: ExerciseWithSource[] = snapshot.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      primaryMuscles: row.primary_muscles ?? [],
      secondaryMuscles: row.secondary_muscles ?? [],
      equipment: row.equipment ?? '',
      category: row.category ?? '',
      instructions: row.instructions ?? [],
      images: row.images ?? [],
      aliases: row.aliases ?? [],
      isCurated: row.is_curated ?? false,
      source: 'api',
    }));

    const matches = searchExercises('sit-ups', buildExerciseSearchIndex(bundledExercises));

    expect(matches.slice(0, 3)).toHaveLength(3);
    expect(matches.slice(0, 3).every((match) => /sit[\s-]?up/i.test(match.name))).toBe(true);
  });
});
