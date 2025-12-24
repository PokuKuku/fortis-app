import { Program, ProgramExercise, ProgramWorkout } from '@/src/types/workout';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';

type TemplateSeedExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds?: number;
};

type TemplateSeed = {
  id: string;
  name: string;
  exercises: TemplateSeedExercise[];
};

const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    id: 'default-template-push-a',
    name: 'Push Day A',
    exercises: [
      {
        exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
        exerciseName: 'Bench Press',
        sets: 4,
        reps: '6-8',
        restSeconds: 180,
      },
      {
        exerciseId: 'Incline_Dumbbell_Press',
        exerciseName: 'Incline Dumbbell Press',
        sets: 3,
        reps: '8-10',
        restSeconds: 120,
      },
      {
        exerciseId: 'Standing_Military_Press',
        exerciseName: 'Overhead Press',
        sets: 4,
        reps: '6-8',
        restSeconds: 150,
      },
      {
        exerciseId: 'Cable_Crossover',
        exerciseName: 'Cable Fly',
        sets: 3,
        reps: '12-15',
        restSeconds: 90,
      },
      {
        exerciseId: 'Side_Lateral_Raise',
        exerciseName: 'Lateral Raise',
        sets: 3,
        reps: '12-15',
        restSeconds: 60,
      },
    ],
  },
  {
    id: 'default-template-pull-a',
    name: 'Pull Day A',
    exercises: [
      {
        exerciseId: 'Barbell_Deadlift',
        exerciseName: 'Deadlift',
        sets: 4,
        reps: '5',
        restSeconds: 180,
      },
      {
        exerciseId: 'Bent_Over_Barbell_Row',
        exerciseName: 'Barbell Row',
        sets: 4,
        reps: '6-8',
        restSeconds: 150,
      },
      {
        exerciseId: 'Wide-Grip_Lat_Pulldown',
        exerciseName: 'Lat Pulldown',
        sets: 3,
        reps: '8-10',
        restSeconds: 120,
      },
      {
        exerciseId: 'Barbell_Curl',
        exerciseName: 'Barbell Curl',
        sets: 3,
        reps: '10-12',
        restSeconds: 90,
      },
    ],
  },
  {
    id: 'default-template-legs-a',
    name: 'Legs Day A',
    exercises: [
      {
        exerciseId: 'Barbell_Squat',
        exerciseName: 'Barbell Squat',
        sets: 4,
        reps: '6-8',
        restSeconds: 180,
      },
      {
        exerciseId: 'Leg_Press',
        exerciseName: 'Leg Press',
        sets: 3,
        reps: '10-12',
        restSeconds: 120,
      },
      {
        exerciseId: 'Leg_Extensions',
        exerciseName: 'Leg Extension',
        sets: 3,
        reps: '12-15',
        restSeconds: 90,
      },
      {
        exerciseId: 'Standing_Calf_Raises',
        exerciseName: 'Standing Calf Raise',
        sets: 4,
        reps: '12-15',
        restSeconds: 60,
      },
    ],
  },
  {
    id: 'default-template-upper-a',
    name: 'Upper A',
    exercises: [
      {
        exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
        exerciseName: 'Bench Press',
        sets: 4,
        reps: '5',
        restSeconds: 180,
      },
      {
        exerciseId: 'Bent_Over_Barbell_Row',
        exerciseName: 'Barbell Row',
        sets: 4,
        reps: '5',
        restSeconds: 180,
      },
      {
        exerciseId: 'Dumbbell_Shoulder_Press',
        exerciseName: 'Dumbbell Press',
        sets: 3,
        reps: '8-10',
        restSeconds: 120,
      },
    ],
  },
  {
    id: 'default-template-lower-a',
    name: 'Lower A',
    exercises: [
      {
        exerciseId: 'Barbell_Squat',
        exerciseName: 'Barbell Squat',
        sets: 4,
        reps: '5',
        restSeconds: 180,
      },
      {
        exerciseId: 'Romanian_Deadlift',
        exerciseName: 'Romanian Deadlift',
        sets: 3,
        reps: '8-10',
        restSeconds: 150,
      },
    ],
  },
];

const buildExercises = (seedExercises: TemplateSeedExercise[], idPrefix: string): ProgramExercise[] =>
  seedExercises.map((exercise, index) => ({
    id: `${idPrefix}-ex-${index + 1}`,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets,
    reps: exercise.reps,
    restSeconds: exercise.restSeconds,
    orderIndex: index,
  }));

const buildTemplateProgram = (seed: TemplateSeed): Program => {
  const workoutId = `${seed.id}-workout`;
  return {
    id: seed.id,
    name: seed.name,
    description: undefined,
    difficulty: 'intermediate',
    goal: undefined,
    durationWeeks: undefined,
    isPublic: true,
    isDefault: true,
    isAiCreated: false,
    isTemplate: true,
    lastPerformedAt: null,
    createdBy: 'Fortis',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
    workouts: [
      {
        id: workoutId,
        name: seed.name,
        dayNumber: 1,
        exercises: buildExercises(seed.exercises, workoutId),
      },
    ],
  };
};

const buildProgramWorkout = (
  seed: TemplateSeed,
  programId: string,
  dayNumber: number
): ProgramWorkout => {
  const workoutId = `${programId}-day-${dayNumber}`;
  return {
    id: workoutId,
    name: seed.name,
    dayNumber,
    exercises: buildExercises(seed.exercises, workoutId),
  };
};

export const getDefaultTemplates = (): Program[] =>
  TEMPLATE_SEEDS.map(buildTemplateProgram);

export const getDefaultPrograms = (): Program[] => {
  const pplSeeds = [
    TEMPLATE_SEEDS.find(seed => seed.id === 'default-template-push-a'),
    TEMPLATE_SEEDS.find(seed => seed.id === 'default-template-pull-a'),
    TEMPLATE_SEEDS.find(seed => seed.id === 'default-template-legs-a'),
  ].filter((seed): seed is TemplateSeed => !!seed);

  const upperLowerSeeds = [
    TEMPLATE_SEEDS.find(seed => seed.id === 'default-template-upper-a'),
    TEMPLATE_SEEDS.find(seed => seed.id === 'default-template-lower-a'),
  ].filter((seed): seed is TemplateSeed => !!seed);

  const pplProgramId = 'default-program-ppl';
  const upperLowerProgramId = 'default-program-upper-lower';

  return [
    {
      id: pplProgramId,
      name: 'Push Pull Legs',
      description:
        'Classic split optimized for muscle hypertrophy. Each muscle group is trained twice per week with progressive overload.',
      difficulty: 'intermediate',
      goal: 'hypertrophy',
      durationWeeks: 12,
      isPublic: true,
      isDefault: true,
      isAiCreated: false,
      isTemplate: false,
      lastPerformedAt: null,
      createdBy: 'Fortis',
      createdAt: DEFAULT_CREATED_AT,
      updatedAt: DEFAULT_CREATED_AT,
      workouts: pplSeeds.map((seed, index) =>
        buildProgramWorkout(seed, pplProgramId, index + 1)
      ),
    },
    {
      id: upperLowerProgramId,
      name: 'Upper Lower Split',
      description:
        'Efficient split hitting each muscle group twice per week. Great for intermediate lifters with limited time.',
      difficulty: 'intermediate',
      goal: 'strength',
      durationWeeks: 8,
      isPublic: true,
      isDefault: true,
      isAiCreated: false,
      isTemplate: false,
      lastPerformedAt: null,
      createdBy: 'Fortis',
      createdAt: DEFAULT_CREATED_AT,
      updatedAt: DEFAULT_CREATED_AT,
      workouts: upperLowerSeeds.map((seed, index) =>
        buildProgramWorkout(seed, upperLowerProgramId, index + 1)
      ),
    },
  ];
};
