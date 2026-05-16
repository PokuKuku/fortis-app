import {
  buildRepRangeProgressionSuggestion,
  formatRepRange,
  parseRepRange,
} from '@/src/utils/workoutProgression';

describe('workoutProgression', () => {
  it('parses rep ranges and exact reps', () => {
    expect(parseRepRange('8-12')).toEqual({ min: 8, max: 12 });
    expect(parseRepRange('12 - 8')).toEqual({ min: 8, max: 12 });
    expect(parseRepRange('5')).toEqual({ min: 5, max: 5 });
    expect(parseRepRange('AMRAP')).toBeNull();
  });

  it('formats rep ranges', () => {
    expect(formatRepRange(8, 12)).toBe('8-12');
    expect(formatRepRange(5, 5)).toBe('5');
  });

  it('suggests progression when every prescribed set hits the top of the range', () => {
    const suggestion = buildRepRangeProgressionSuggestion('8-12', 3, [
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 13, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
    ]);

    expect(suggestion?.sets).toEqual([
      { weight: 105, reps: 8, weightUnit: 'lbs', setType: 'normal' },
      { weight: 105, reps: 8, weightUnit: 'lbs', setType: 'normal' },
      { weight: 105, reps: 8, weightUnit: 'lbs', setType: 'normal' },
    ]);
  });

  it('only suggests the first set when the top of the range was not reached', () => {
    const suggestion = buildRepRangeProgressionSuggestion('8-12', 2, [
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 11, weightUnit: 'lbs', setType: 'normal' },
    ]);

    expect(suggestion?.sets).toEqual([
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
    ]);
  });

  it('adds one rep only to the first set when the first set is still below the top of the range', () => {
    const suggestion = buildRepRangeProgressionSuggestion('8-12', 3, [
      { weight: 100, reps: 10, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 9, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 8, weightUnit: 'lbs', setType: 'normal' },
    ]);

    expect(suggestion?.sets).toEqual([
      { weight: 100, reps: 11, weightUnit: 'lbs', setType: 'normal' },
    ]);
  });

  it('uses kg increments when previous sets were logged in kg', () => {
    const suggestion = buildRepRangeProgressionSuggestion('6-8', 1, [
      { weight: 40, reps: 8, weightUnit: 'kg', setType: 'normal' },
    ]);

    expect(suggestion?.sets[0]).toEqual({
      weight: 42.5,
      reps: 6,
      weightUnit: 'kg',
      setType: 'normal',
    });
  });

  it('suggests progressions for matching non-normal set types', () => {
    const suggestion = buildRepRangeProgressionSuggestion('8-12', [
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'warmup' },
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'normal' },
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'dropset' },
    ], [
      { weight: 50, reps: 12, weightUnit: 'lbs', setType: 'warmup' },
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
      { weight: 80, reps: 12, weightUnit: 'lbs', setType: 'dropset' },
    ]);

    expect(suggestion?.sets).toEqual([
      { weight: 55, reps: 8, weightUnit: 'lbs', setType: 'warmup' },
      { weight: 105, reps: 8, weightUnit: 'lbs', setType: 'normal' },
      { weight: 85, reps: 8, weightUnit: 'lbs', setType: 'dropset' },
    ]);
  });

  it('only suggests the first set of each type when that type has not reached the top of the range', () => {
    const suggestion = buildRepRangeProgressionSuggestion('8-12', [
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'warmup' },
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'warmup' },
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'failure' },
      { weight: null, reps: null, weightUnit: 'lbs', setType: 'failure' },
    ], [
      { weight: 50, reps: 10, weightUnit: 'lbs', setType: 'warmup' },
      { weight: 55, reps: 9, weightUnit: 'lbs', setType: 'warmup' },
      { weight: 75, reps: 11, weightUnit: 'lbs', setType: 'failure' },
      { weight: 70, reps: 10, weightUnit: 'lbs', setType: 'failure' },
    ]);

    expect(suggestion?.sets).toEqual([
      { weight: 50, reps: 11, weightUnit: 'lbs', setType: 'warmup' },
      { weight: 75, reps: 12, weightUnit: 'lbs', setType: 'failure' },
    ]);
  });
});
