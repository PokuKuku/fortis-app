import {
  buildExerciseSearchIndex,
  getCachedExerciseSearchIndex,
  searchExercises,
} from '@/src/utils/exerciseSearch';
import type { ExerciseWithSource } from '@/src/types/exercise';
import {
  EXERCISE_COLLOQUIAL_ALIASES,
  mergeExerciseColloquialAliases,
} from '@/src/data/exerciseColloquialAliases';

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

const loadBundledExercises = (): ExerciseWithSource[] => {
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

  return snapshot.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    primaryMuscles: row.primary_muscles ?? [],
    secondaryMuscles: row.secondary_muscles ?? [],
    equipment: row.equipment ?? '',
    category: row.category ?? '',
    instructions: row.instructions ?? [],
    images: row.images ?? [],
    aliases: mergeExerciseColloquialAliases(row.id, row.aliases ?? []),
    isCurated: row.is_curated ?? false,
    source: 'api',
  }));
};

const colloquialTargetNames: Record<string, string> = {
  '8e1fdc30-4f40-405a-a6fc-0c5495c60c96': 'dumbbell single leg split squat',
  '20cb5cbb-91a9-4439-a753-0eb8eea32064': 'barbell romanian deadlift',
  'bc35b061-6583-4bd0-b887-244d294fa6f8': 'glute-ham raise',
  'ea36a978-30fd-4f7c-8f70-76e6c50e6a4a': 'dumbbell bench press',
  '44321c23-9411-44cf-ada0-b93238d60962': 'dumbbell seated shoulder press',
  'db9e1cea-33df-425f-9b83-86371f230cd8': 'dumbbell one arm bent-over row',
  'a6779992-cb5e-402c-a13e-205aa9b4e39e': 'dumbbell biceps curl',
  '2c41e7d9-5b54-4e49-a65f-194f2d1a03af': 'trap bar deadlift',
  '437918b1-0d1d-4e81-bc60-3d368f1de96c': 'lever t bar row',
  '28c301f4-24dc-47b9-9c1a-a7cf13096f5c': 'inverted row with straps',
  '5b0c0d37-52e3-4c8d-a9bf-10bf13250b2d': 'lever seated row',
  '05d5b3fb-4210-4017-9546-9cd444fca834': 'pull-up',
  '2c0b5821-950f-46e0-9b1f-532cc51bf9ce': 'chin-up',
  '3fd7ec63-a2d7-4435-a968-d0faae015ab3': 'assisted pull-up',
  'b32ea811-01f5-4269-ac23-532c16412939': 'lever seated leg curl',
  '2eb5a4c6-492a-450f-bb4d-243204c79816': 'cable triceps pushdown (v-bar)',
  '5b3404e7-21b3-42c0-8e84-fd222a0f6ae1': 'lever seated hip abduction',
  '7fedcec8-76de-4f7d-9d8e-46dfbae34cd7': 'lever seated hip adduction',
  '8b508e92-5739-4038-8c1b-9e6d33ede67a': '3/4 sit-up',
  'b650b2e1-62c5-5252-bde9-6ea8d460b6a3': 'wheel rollout',
  '93f87d0f-842f-4c76-abbb-d2b94167d058': 'farmers walk',
  '22c8551d-891b-5fc2-865d-6a7aac7ff8bf': 'stationary bike run v. 3',
};

const colloquialAliasCases = Object.entries(EXERCISE_COLLOQUIAL_ALIASES).flatMap(
  ([exerciseId, aliases]) => aliases.map(
    (alias): [string, string] => [alias, colloquialTargetNames[exerciseId]],
  ),
);

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
    const bundledExercises = loadBundledExercises();

    const matches = searchExercises('sit-ups', buildExerciseSearchIndex(bundledExercises));

    expect(matches.slice(0, 3)).toHaveLength(3);
    expect(matches.slice(0, 3).every((match) => /sit[\s-]?up/i.test(match.name))).toBe(true);
  });

  it.each(['pec deck', 'pec deck fly', 'machine fly', 'chest fly machine'])(
    'finds Lever Seated Fly by the colloquial alias "%s"',
    (query) => {
      const matches = searchExercises(query, buildExerciseSearchIndex(loadBundledExercises()));

      expect(matches[0]?.name).toBe('lever seated fly');
    },
  );

  it.each(colloquialAliasCases)('maps the colloquial query "%s" to %s', (query, expectedName) => {
    const matches = searchExercises(query, buildExerciseSearchIndex(loadBundledExercises()));

    expect(matches[0]?.name).toBe(expectedName);
  });
});
