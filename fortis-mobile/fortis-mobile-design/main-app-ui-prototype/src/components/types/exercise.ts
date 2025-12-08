/**
 * components/types/exercise.ts
 * 
 * Defines the TypeScript interfaces for the Exercise data structure.
 * Ensures type safety for exercise properties like muscles, equipment, and mechanics.
 */
export interface Exercise {
  id: string;
  name: string;
  force?: "static" | "pull" | "push" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic?: "isolation" | "compound" | null;
  equipment?: "medicine ball" | "dumbbell" | "body only" | "bands" | "kettlebells" | "foam roll" | "cable" | "machine" | "barbell" | "exercise ball" | "e-z curl bar" | "other" | null;
  primaryMuscles: Array<"abdominals" | "abductors" | "adductors" | "biceps" | "calves" | "chest" | "forearms" | "glutes" | "hamstrings" | "lats" | "lower back" | "middle back" | "neck" | "quadriceps" | "shoulders" | "traps" | "triceps">;
  secondaryMuscles: Array<"abdominals" | "abductors" | "adductors" | "biceps" | "calves" | "chest" | "forearms" | "glutes" | "hamstrings" | "lats" | "lower back" | "middle back" | "neck" | "quadriceps" | "shoulders" | "traps" | "triceps">;
  instructions: string[];
  category: "powerlifting" | "strength" | "stretching" | "cardio" | "olympic weightlifting" | "strongman" | "plyometrics";
  images: string[];
}
