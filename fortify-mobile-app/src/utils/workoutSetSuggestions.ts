export interface SetValueSource {
  weight?: number | null;
  reps?: number | null;
  setType?: string | null;
}

export interface SetValueSuggestion {
  weight: number | null;
  reps: number | null;
}

export function mergeSetValueSuggestion(
  previousSet: SetValueSource | null | undefined,
  suggestedSet: SetValueSource | null | undefined,
  currentSetType?: string | null
): SetValueSuggestion | undefined {
  const canUsePreviousSet =
    !currentSetType
    || !previousSet?.setType
    || previousSet.setType === currentSetType;
  const previousSource = canUsePreviousSet ? previousSet : undefined;
  const weight = previousSource?.weight ?? suggestedSet?.weight ?? null;
  const reps = previousSource?.reps ?? suggestedSet?.reps ?? null;

  if (weight == null && reps == null) {
    return undefined;
  }

  return { weight, reps };
}
