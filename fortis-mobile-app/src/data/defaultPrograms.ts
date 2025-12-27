import { Program, ProgramExercise, ProgramWorkout } from '@/src/types/workout';

const DEFAULT_CREATED_AT = '2024-01-01T00:00:00Z';

const EXERCISE_IDS = {
  inclineBenchPress: 'ns0SIbU',
  latPulldown: 'LEprlgG',
  seatedRow: 'fUBheHs',
  lateralRaise: 'goJ6ezq',
  shoulderPress: 'znQUdHY',
  overheadTricepsExtension: '2IxROQ1',
  invertedRow: 'bZGHsAZ',
  singleLegSplitSquat: 'qx4fgX7',
  legExtension: 'my33uHU',
  romanianDeadlift: 'wQ2c4XD',
  legCurl: 'Zg3XY7P',
  legRaise: 'lCKm4Rs',
  hipThrust: 'Pjbc0Kt',
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
        exerciseId: EXERCISE_IDS.inclineBenchPress,
        exerciseName: 'Dumbbell Incline Bench Press',
        sets: 1,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.latPulldown,
        exerciseName: 'Cable Lat Pulldown Full Range Of Motion',
        sets: 1,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.seatedRow,
        exerciseName: 'Cable Seated Row',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.invertedRow,
        exerciseName: 'Inverted Row',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.overheadTricepsExtension,
        exerciseName: 'Cable Overhead Triceps Extension (rope Attachment)',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.lateralRaise,
        exerciseName: 'Cable Lateral Raise',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.shoulderPress,
        exerciseName: 'Dumbbell Seated Shoulder Press',
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
        exerciseId: EXERCISE_IDS.singleLegSplitSquat,
        exerciseName: 'Dumbbell Single Leg Split Squat',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.legExtension,
        exerciseName: 'Lever Leg Extension',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.romanianDeadlift,
        exerciseName: 'Barbell Romanian Deadlift',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.legCurl,
        exerciseName: 'Lever Seated Leg Curl',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.legRaise,
        exerciseName: 'Exercise Ball Prone Leg Raise',
        sets: 2,
        reps: '4-8',
      },
      {
        exerciseId: EXERCISE_IDS.hipThrust,
        exerciseName: 'Resistance Band Hip Thrusts On Knees (female)',
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
