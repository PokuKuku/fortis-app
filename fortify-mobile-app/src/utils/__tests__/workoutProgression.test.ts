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

  it('does not suggest progression when one set misses the top of the range', () => {
    expect(buildRepRangeProgressionSuggestion('8-12', 2, [
      { weight: 100, reps: 12, weightUnit: 'lbs', setType: 'normal' },
      { weight: 100, reps: 11, weightUnit: 'lbs', setType: 'normal' },
    ])).toBeNull();
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
});
