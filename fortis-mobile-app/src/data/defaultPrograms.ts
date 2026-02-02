import { Program, ProgramExercise, ProgramWorkout } from '@/src/types/workout';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';

const EXERCISE_IDS = {
  // Upper workout exercises
  barbellBenchPress: '10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc',
  cablePulldown: 'd4e6ab99-5b62-4ff0-9595-0263c247198f',
  dumbbellSeatedShoulderPress: '44321c23-9411-44cf-ada0-b93238d60962',
  cableSeatedRow: '92d98b61-2fcc-4696-9c60-a038b5bf716e',
  cableOneArmLateralRaise: '735338d2-9f6a-458a-9666-ba08d4a87a62',
  dumbbellAlternateSeatedHammerCurl: '3e0b2dc1-5dd4-48f0-a350-641e2688ef4a',
  cableStandingReverseGripOneArmOverheadTricepExtension: '7c8fcadd-61fb-4456-afeb-0f895b4ec716',
  pushUp: 'd6200aac-6593-412e-a394-b9e8810ece66',
  // Lower workout exercises
  hackCalfRaise: 'd346b764-7ef5-4df5-8890-f899904cf7f5',
  barbellRomanianDeadlift: '20cb5cbb-91a9-4439-a753-0eb8eea32064',
  dumbbellSingleLegSplitSquat: '8e1fdc30-4f40-405a-a6fc-0c5495c60c96',
  leverLegExtension: 'd93d2328-bdc6-4c90-bb42-146fcbab489e',
  leverSeatedLegCurl: 'b32ea811-01f5-4269-ac23-532c16412939',
  cableKneelingCrunch: 'c592f0e1-ee8b-4747-a244-446dc2dff472',
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
      exerciseId: EXERCISE_IDS.pushUp,
      exerciseName: 'Push-up',
      sets: 1,
      reps: '3',
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
        exerciseId: EXERCISE_IDS.cablePulldown,
        exerciseName: 'Cable Pulldown',
        sets: 3,
        reps: '8-12',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellSeatedShoulderPress,
        exerciseName: 'Dumbbell Seated Shoulder Press',
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
        exerciseId: EXERCISE_IDS.cableOneArmLateralRaise,
        exerciseName: 'Cable One Arm Lateral Raise',
        sets: 3,
        reps: '12-15',
      },
      {
        exerciseId: EXERCISE_IDS.dumbbellAlternateSeatedHammerCurl,
        exerciseName: 'Dumbbell Alternate Seated Hammer Curl',
        sets: 3,
        reps: '10-12',
      },
      {
        exerciseId: EXERCISE_IDS.cableStandingReverseGripOneArmOverheadTricepExtension,
        exerciseName: 'Cable Standing Reverse Grip One Arm Overhead Tricep Extension',
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
        exerciseId: EXERCISE_IDS.hackCalfRaise,
        exerciseName: 'Hack Calf Raise',
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
        exerciseId: EXERCISE_IDS.cableKneelingCrunch,
        exerciseName: 'Cable Kneeling Crunch',
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
