import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';
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

describe('exercise search', () => {
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
});
