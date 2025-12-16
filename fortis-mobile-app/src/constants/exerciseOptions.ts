export const PRIMARY_MUSCLES = [
  'Chest',
  'Back',
  'Shoulders',
  'Quadriceps',
  'Hamstrings',
  'Calves',
  'Biceps',
  'Triceps',
  'Glutes',
  'Core',
] as const;

export const CATEGORIES = [
  'Strength',
  'Power',
  'Cardio',
  'Mobility',
  'Plyometrics',
] as const;

export const LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export const FORCES = [
  'Push',
  'Pull',
  'Static',
] as const;

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Bands',
] as const;

export const MECHANICS = [
  'Compound',
  'Isolation',
  'Unilateral',
] as const;

// Type helpers
export type PrimaryMuscle = typeof PRIMARY_MUSCLES[number];
export type Category = typeof CATEGORIES[number];
export type Level = typeof LEVELS[number];
export type Force = typeof FORCES[number];
export type EquipmentType = typeof EQUIPMENT_TYPES[number];
export type Mechanic = typeof MECHANICS[number];
