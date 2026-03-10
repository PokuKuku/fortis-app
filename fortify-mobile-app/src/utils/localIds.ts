const LOCAL_PREFIXES = ['local-', 'default-'] as const;

export const isLocalId = (value?: string | null): boolean =>
  !!value && LOCAL_PREFIXES.some(prefix => value.startsWith(prefix));

export const isLocalProgramId = isLocalId;
export const isLocalProgramWorkoutId = isLocalId;
