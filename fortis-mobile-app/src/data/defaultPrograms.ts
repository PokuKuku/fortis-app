import { Program, ProgramExercise, ProgramWorkout } from '@/src/types/workout';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';

const EXERCISE_IDS = {
  inclineDumbbellPress: 'd36f3ccd-de7c-43ba-a780-043bdc0e0b37',
  latPulldown: '7d6c217e-766f-4db0-b828-56fff447c05b',
  seatedCableRow: '7104f0f6-5b36-462e-bfc9-68a4090e201e',
  dumbbellCurl: 'ce22ba14-303d-450f-9125-a6ae66557fe4',
  overheadTricepsExtension: '4cc0b407-cca2-4ed7-954f-c29a5cc0fe7b',
  lateralRaises: '18d654bb-e732-4f48-a402-ac0477920fc1',
  dumbbellShoulderPress: '61792bdb-aaba-43c8-96cf-b039c1bd9b95',
  bulgarianSplitSquat: '3611ff7b-1745-485d-b344-ab1009661816',
  legExtension: '69126ffd-b3e5-4333-ba39-c84fdfaaf4bc',
  romanianDeadlift: '201f53ed-d0d7-4e4b-97ef-498f96acd3b1',
  legCurl: 'dae998d9-3882-4eb2-bf2b-6d7f207459ba',
  hangingLegRaises: '288aaa4c-cfcc-4f0d-87bc-6abab8a89479',
  hipThrust: '7ff3e1a1-fda8-4800-9063-aee09358e6ce',
} as const;

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
    id: 'default-template-upper-1',
    name: 'Upper 1',
    exercises: [
      {
        exerciseId: EXERCISE_IDS.inclineDumbbellPress,
        exerciseName: 'Incline Dumbbell Press',
        sets: 1,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.latPulldown,
        exerciseName: 'Lat Pulldown',
        sets: 1,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.seatedCableRow,
        exerciseName: 'Seated Cable Row',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellCurl,
        exerciseName: 'Dumbbell Curl',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.overheadTricepsExtension,
        exerciseName: 'Overhead Triceps Extension',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.lateralRaises,
        exerciseName: 'Lateral Raises',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellShoulderPress,
        exerciseName: 'Dumbbell Shoulder Press',
        sets: 2,
        reps: '4-8',
      },
    ],
  },
  {
    id: 'default-template-lower-1',
    name: 'Lower 1',
    exercises: [
      {
        exerciseId: EXERCISE_IDS.bulgarianSplitSquat,
        exerciseName: 'Bulgarian Split Squat',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.legExtension,
        exerciseName: 'Leg Extension',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.romanianDeadlift,
        exerciseName: 'Romanian Deadlift',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.legCurl,
        exerciseName: 'Leg Curl',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.hangingLegRaises,
        exerciseName: 'Hanging Leg Raises',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.hipThrust,
        exerciseName: 'Hip Thrust',
        sets: 2,
        reps: '4-8',
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
    goal: 'strength',
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
  const programId = 'default-program-upper-lower-1';

  return [
    {
      id: programId,
      name: 'Upper / Lower 1',
      description:
        'Two-day upper/lower split focused on controlled strength work in the 4-8 rep range.',
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
      workouts: TEMPLATE_SEEDS.map((seed, index) =>
        buildProgramWorkout(seed, programId, index + 1)
      ),
    },
  ];
};
