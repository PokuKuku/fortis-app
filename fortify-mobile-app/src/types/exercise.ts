export interface Exercise {
  id: string;
  slug?: string;
  remoteId?: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  instructions: string[];
  images: string[];
  aliases?: string[];
  canonicalId?: string | null;
  canonicalKey?: string | null;
  basedOnExerciseId?: string | null;
  isCurated?: boolean;
  isHidden?: boolean;
  isCustom?: boolean;
  normalizedName?: string;
}

export type ExerciseSource = 'local' | 'api' | 'custom';

export interface ExerciseWithSource extends Exercise {
  source: ExerciseSource;
}
