export interface Exercise {
  id: string;
  slug?: string;
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

// ExerciseDB API response structure
// Note: Field names may vary between API versions
export interface ExerciseDbResponse {
  exerciseId?: string;
  id?: string;
  name: string;
  targetMuscles?: string[];
  target?: string;
  secondaryMuscles?: string[];
  equipments?: string[];
  equipment?: string;
  exerciseType?: string;
  bodyParts?: string[];
  bodyPart?: string;
  instructions?: string[];
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  overview?: string;
}
