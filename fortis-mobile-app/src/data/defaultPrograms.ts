import { Program, ProgramExercise, ProgramWorkout } from '@/src/types/workout';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';

const EXERCISE_IDS = {
  // Upper workout exercises
  barbellBenchPress: '10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc',
  wideGripLatPulldown: 'c56d8350-56c1-4bc4-99e1-4de71e680c21',
  dumbbellShoulderPress: 'fa6b8c4a-b771-4fbd-8bb4-ce0d86500c52',
  cableSeatedRow: '92d98b61-2fcc-4696-9c60-a038b5bf716e',
  sideLateralRaise: 'a3a93383-4a13-4f37-8fc9-4ec4730fadd9',
  alternateHammerCurl: '3dbc1d69-cfd9-4291-b589-9991144ad564',
  cableOverheadTricepsExtension: '8cccde6a-6d23-4b91-b5be-9988e85c4493',
  // Lower workout exercises
  dumbbellGobletSquat: '2e16763e-3ac9-47d8-aee4-8b9dea0da4ab',
  barbellRomanianDeadlift: '20cb5cbb-91a9-4439-a753-0eb8eea32064',
  dumbbellSingleLegSplitSquat: '8e1fdc30-4f40-405a-a6fc-0c5495c60c96',
  leverLegExtension: 'd93d2328-bdc6-4c90-bb42-146fcbab489e',
  leverSeatedLegCurl: 'b32ea811-01f5-4269-ac23-532c16412939',
  cableCrunch: '87b088d5-a949-42d8-a2a2-1fcc6bca4f0f',
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

const GET_STARTED_TEMPLATE_SEED: TemplateSeed = {
  id: 'default-template-get-started',
  name: 'Get Started',
  exercises: [
    {
      exerciseId: EXERCISE_IDS.dumbbellGobletSquat,
      exerciseName: 'Dumbbell Goblet Squat',
      sets: 2,
      reps: '8-12',
      restSeconds: 90,
    },
    {
      exerciseId: EXERCISE_IDS.barbellBenchPress,
      exerciseName: 'Barbell Bench Press',
      sets: 2,
      reps: '8-12',
      restSeconds: 90,
    },
    {
      exerciseId: EXERCISE_IDS.wideGripLatPulldown,
      exerciseName: 'Wide-Grip Lat Pulldown',
      sets: 2,
      reps: '8-12',
      restSeconds: 90,
    },
  ],
};

const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    id: 'default-template-upper',
    name: 'Upper',
    exercises: [
      {
        exerciseId: EXERCISE_IDS.barbellBenchPress,
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        reps: '8-12',
      },
      {
        exerciseId: EXERCISE_IDS.wideGripLatPulldown,
        exerciseName: 'Wide-Grip Lat Pulldown',
        sets: 3,
        reps: '8-12',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellShoulderPress,
        exerciseName: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '8-12',
      },
      {
        exerciseId: EXERCISE_IDS.cableSeatedRow,
        exerciseName: 'Cable Seated Row',
        sets: 3,
        reps: '10-12',
      },
      {
        exerciseId: EXERCISE_IDS.sideLateralRaise,
        exerciseName: 'Side Lateral Raise',
        sets: 3,
        reps: '12-15',
      },
      {
        exerciseId: EXERCISE_IDS.alternateHammerCurl,
        exerciseName: 'Alternate Hammer Curl',
        sets: 3,
        reps: '10-12',
      },
      {
        exerciseId: EXERCISE_IDS.cableOverheadTricepsExtension,
        exerciseName: 'Cable Rope Overhead Triceps Extension',
        sets: 3,
        reps: '10-12',
      },
    ],
  },
  {
    id: 'default-template-lower',
    name: 'Lower',
    exercises: [
      {
        exerciseId: EXERCISE_IDS.dumbbellGobletSquat,
        exerciseName: 'Dumbbell Goblet Squat',
        sets: 3,
        reps: '8-12',
      },
      {
        exerciseId: EXERCISE_IDS.barbellRomanianDeadlift,
        exerciseName: 'Barbell Romanian Deadlift',
        sets: 3,
        reps: '8-10',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellSingleLegSplitSquat,
        exerciseName: 'Dumbbell Single Leg Split Squat',
        sets: 3,
        reps: '10-12',
      },
      {
        exerciseId: EXERCISE_IDS.leverLegExtension,
        exerciseName: 'Lever Leg Extension',
        sets: 3,
        reps: '12-15',
      },
      {
        exerciseId: EXERCISE_IDS.leverSeatedLegCurl,
        exerciseName: 'Lever Seated Leg Curl',
        sets: 3,
        reps: '12-15',
      },
      {
        exerciseId: EXERCISE_IDS.cableCrunch,
        exerciseName: 'Cable Crunch',
        sets: 3,
        reps: '15-20',
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
  [GET_STARTED_TEMPLATE_SEED, ...TEMPLATE_SEEDS].map(buildTemplateProgram);

export const getDefaultPrograms = (): Program[] => {
  const programId = 'default-program-upper-lower';

  return [
    {
      id: programId,
      name: 'Upper/Lower',
      description:
        'Classic two-day upper/lower split for balanced muscle growth. Compounds first, then isolation work.',
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
