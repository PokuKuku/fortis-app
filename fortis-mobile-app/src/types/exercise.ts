export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  level: string;
  force: string;
  mechanic: string | null;
  instructions: string[];
  images: string[];
}

export type ExerciseSource = 'local' | 'api' | 'custom';

export interface ExerciseWithSource extends Exercise {
  source: ExerciseSource;
}
