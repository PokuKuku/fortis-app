import { parseWorkoutCsv } from '@/src/utils/importWorkouts';
import { getAllExercises, saveCustomExercise, isCustomExercise } from '@/src/services/exerciseService';

jest.mock('@/src/services/exerciseService', () => ({
  getAllExercises: jest.fn(),
  saveCustomExercise: jest.fn(),
  isCustomExercise: (id: string) => id.startsWith('custom-'),
}));

const mockExercises = [
  {
    id: 'ex-1',
    name: 'Back Squat',
    primaryMuscles: ['legs'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'strength',
    instructions: [],
    images: [],
  },
  {
    id: 'ex-2',
    name: 'Barbell Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'strength',
    instructions: [],
    images: [],
  },
  {
    id: 'ex-3',
    name: 'Conventional Deadlift',
    primaryMuscles: ['back'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'strength',
    instructions: [],
    images: [],
  },
  {
    id: 'ex-4',
    name: 'Bent-Over Barbell Row',
    primaryMuscles: ['back'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'strength',
    instructions: [],
    images: [],
  },
];

describe('parseWorkoutCsv', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('parses generic CSV into workout sessions', async () => {
    (getAllExercises as jest.Mock).mockResolvedValue(mockExercises);

    const csv = `workoutId,workoutName,workoutFocus,date,startTime,exercise,setNumber,weight,reps,rpe,volume,completed
session-1762716230388,Foundational Strength Session,Full Body,2025-11-09,2025-11-09T19:23:50.388Z,Back Squat,1,2,2,2,4,true
session-1762716230388,Foundational Strength Session,Full Body,2025-11-09,2025-11-09T19:23:50.388Z,Barbell Bench Press,1,2,2,2,4,true
session-1762716230388,Foundational Strength Session,Full Body,2025-11-09,2025-11-09T19:23:50.388Z,Conventional Deadlift,1,2,2,2,4,true
session-1762716230388,Foundational Strength Session,Full Body,2025-11-09,2025-11-09T19:23:50.388Z,Bent-Over Barbell Row,1,2,2,2,4,true`;

    const result = await parseWorkoutCsv(csv, 'generic');

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].exercises).toHaveLength(4);
    expect(result.createdCustomExercises).toHaveLength(0);
  });

  it('creates custom exercises for unknown Strong entries and maps rest timers', async () => {
    (getAllExercises as jest.Mock).mockResolvedValue([]);

    const csv = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-11-07 12:36:25,Leg Day,36m,"Front Squat (Barbell)",W,95,5,0,0,,Great day,7
2025-11-07 12:36:25,Leg Day,36m,"Front Squat (Barbell)",Rest Timer,0,0,0,120,,,`;

    const result = await parseWorkoutCsv(csv, 'strong');

    expect(result.sessions).toHaveLength(1);
    expect(result.createdCustomExercises).toContain('Front Squat');
    expect(saveCustomExercise).toHaveBeenCalled();

    const [exercise] = result.sessions[0].exercises;
    expect(isCustomExercise(exercise.exerciseId)).toBe(true);
    expect(exercise.sets[0].setType).toBe('warmup');
    expect(exercise.sets[0].restSeconds).toBe(120);
  });
});
