import type { Exercise } from '@/src/types/exercise';
import {
  exerciseMatchesMuscleFilters,
  getExerciseMuscleFilterKeys,
} from '@/src/utils/exerciseMuscleFilters';

const exercise = (name: string, primaryMuscles: string[]): Exercise => ({
  id: name,
  name,
  primaryMuscles,
  secondaryMuscles: [],
  equipment: 'dumbbell',
  category: 'strength',
  instructions: [],
  images: [],
});

describe('exercise muscle filters', () => {
  it.each([
    'Dumbbell Front Raise',
    'Dumbbell Seated Shoulder Press',
    'Barbell Standing Military Press',
    'Dumbbell Arnold Press',
    'Pike Push-Up',
  ])('adds front delts to anterior-delt exercise %s', (name) => {
    expect(getExerciseMuscleFilterKeys(exercise(name, ['side_delts']))).toContain('front_delts');
  });

  it('does not classify lateral raises as front-delt exercises', () => {
    expect(getExerciseMuscleFilterKeys(exercise('Dumbbell Lateral Raise', ['side_delts'])))
      .not.toContain('front_delts');
  });

  it.each([
    'Band Reverse Fly',
    'Cable Rear Delt Row',
    'Dumbbell Rear Lateral Raise',
    'Cable Face Pull',
    'Dumbbell Incline Y-Raise',
    'Cable Standing Shoulder External Rotation',
  ])('adds rear delts to posterior-delt exercise %s', (name) => {
    expect(getExerciseMuscleFilterKeys(exercise(name, ['side_delts']))).toContain('rear_delts');
  });

  it('does not classify a standard lateral raise as a rear-delt exercise', () => {
    expect(getExerciseMuscleFilterKeys(exercise('Dumbbell Lateral Raise', ['side_delts'])))
      .not.toContain('rear_delts');
  });

  it('preserves an explicit front-delt classification', () => {
    expect(getExerciseMuscleFilterKeys(exercise('Custom Front Delt Movement', ['front_delts'])))
      .toEqual(['front_delts']);
  });

  it('matches inferred front-delt exercises when the filter is selected', () => {
    const shoulderPress = exercise('Cable Shoulder Press', ['side_delts']);

    expect(exerciseMatchesMuscleFilters(shoulderPress, ['front_delts'])).toBe(true);
    expect(exerciseMatchesMuscleFilters(shoulderPress, ['chest'])).toBe(false);
  });

  it('matches inferred rear-delt exercises when the filter is selected', () => {
    const reverseFly = exercise('Dumbbell Reverse Fly', ['side_delts']);

    expect(exerciseMatchesMuscleFilters(reverseFly, ['rear_delts'])).toBe(true);
    expect(exerciseMatchesMuscleFilters(reverseFly, ['front_delts'])).toBe(false);
  });
});
