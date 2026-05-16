import { mergeSetValueSuggestion } from '@/src/utils/workoutSetSuggestions';

describe('mergeSetValueSuggestion', () => {
  it('uses the progression weight when the previous current-workout set has no weight', () => {
    expect(
      mergeSetValueSuggestion(
        { weight: null, reps: 8 },
        { weight: 105, reps: 8 }
      )
    ).toEqual({ weight: 105, reps: 8 });
  });

  it('keeps explicit previous current-workout values before progression suggestions', () => {
    expect(
      mergeSetValueSuggestion(
        { weight: 110, reps: 9, setType: 'normal' },
        { weight: 105, reps: 8 },
        'normal'
      )
    ).toEqual({ weight: 110, reps: 9 });
  });

  it('ignores previous current-workout values when the next set type is different', () => {
    expect(
      mergeSetValueSuggestion(
        { weight: 45, reps: 10, setType: 'warmup' },
        { weight: 105, reps: 8 },
        'normal'
      )
    ).toEqual({ weight: 105, reps: 8 });
  });

  it('does not create a suggestion from a different-type previous set when there is no typed suggestion', () => {
    expect(
      mergeSetValueSuggestion(
        { weight: 45, reps: 10, setType: 'warmup' },
        undefined,
        'normal'
      )
    ).toBeUndefined();
  });

  it('returns undefined when neither source has a weight or reps value', () => {
    expect(mergeSetValueSuggestion(undefined, undefined)).toBeUndefined();
    expect(mergeSetValueSuggestion({ weight: null, reps: null }, { weight: null, reps: null })).toBeUndefined();
  });
});
