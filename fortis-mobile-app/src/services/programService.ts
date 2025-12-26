import {
  ProgramDetail,
  WorkoutDetail,
  ProgramWorkout,
  ProgramExercise,
  WorkoutExerciseDetail,
  HubStats,
} from '@/src/types/program';
import { PROGRAMS_KEY, WORKOUTS_KEY } from '@/src/constants/storageKeys';
import { MAX_WORKOUTS_PER_PROGRAM } from '@/src/constants/programs';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

// In-memory cache
let programsCache: ProgramDetail[] | null = null;
let workoutsCache: WorkoutDetail[] | null = null;
let storageLoaded = false;
let workoutsStorageLoaded = false;

export function resetProgramServiceCache(): void {
  programsCache = null;
  workoutsCache = null;
  storageLoaded = false;
  workoutsStorageLoaded = false;
}

// --- Mock Data ---

const EMPTY_STATS: HubStats = {
  timesCompleted: 0,
  volumeHistory: [],
  repsHistory: [],
  durationHistory: [],
};

const MOCK_PROGRAMS: ProgramDetail[] = [
  {
    id: '1',
    name: 'Push Pull Legs',
    description: 'Classic 6-day split optimized for muscle hypertrophy. Each muscle group is trained twice per week with progressive overload.',
    difficulty: 'intermediate',
    durationWeeks: 12,
    goal: 'hypertrophy',
    createdBy: 'Fortis',
    isPublic: true,
    lastPerformed: '2 days ago',
    stats: EMPTY_STATS,
    workouts: [
      {
        id: 'ppl-push-a',
        name: 'Push Day A',
        description: 'Chest, shoulders, and triceps focus',
        dayNumber: 1,
        exercises: [
          {
            id: 'ppl-1-1',
            exerciseId: 'barbell-bench-press',
            exerciseName: 'Barbell Bench Press',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 180,
            primaryMuscles: ['chest'],
            images: ['barbell-bench-press/0.jpg'],
          },
          {
            id: 'ppl-1-2',
            exerciseId: 'incline-dumbbell-press',
            exerciseName: 'Incline Dumbbell Press',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['chest'],
            images: ['incline-dumbbell-press/0.jpg'],
          },
          {
            id: 'ppl-1-3',
            exerciseId: 'overhead-press',
            exerciseName: 'Overhead Press',
            orderIndex: 2,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 150,
            primaryMuscles: ['shoulders'],
            images: ['overhead-press/0.jpg'],
          },
          {
            id: 'ppl-1-4',
            exerciseId: 'cable-crossover',
            exerciseName: 'Cable Crossover',
            orderIndex: 3,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 90,
            primaryMuscles: ['chest'],
            images: ['cable-crossover/0.jpg'],
          },
          {
            id: 'ppl-1-5',
            exerciseId: 'lateral-raises',
            exerciseName: 'Lateral Raises',
            orderIndex: 4,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 60,
            primaryMuscles: ['shoulders'],
            images: ['lateral-raises/0.jpg'],
          },
        ],
      },
      {
        id: 'ppl-pull-a',
        name: 'Pull Day A',
        description: 'Back and biceps focus',
        dayNumber: 2,
        exercises: [
          {
            id: 'ppl-2-1',
            exerciseId: 'barbell-deadlift',
            exerciseName: 'Barbell Deadlift',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['lower back'],
            images: ['barbell-deadlift/0.jpg'],
          },
          {
            id: 'ppl-2-2',
            exerciseId: 'barbell-row',
            exerciseName: 'Barbell Row',
            orderIndex: 1,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 150,
            primaryMuscles: ['middle back'],
            images: ['barbell-row/0.jpg'],
          },
          {
            id: 'ppl-2-3',
            exerciseId: 'lat-pulldown',
            exerciseName: 'Lat Pulldown',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['lats'],
            images: ['lat-pulldown/0.jpg'],
          },
          {
            id: 'ppl-2-4',
            exerciseId: 'barbell-curl',
            exerciseName: 'Barbell Curl',
            orderIndex: 3,
            targetSets: 3,
            targetReps: '10-12',
            restSeconds: 90,
            primaryMuscles: ['biceps'],
            images: ['barbell-curl/0.jpg'],
          },
        ],
      },
      {
        id: 'ppl-legs-a',
        name: 'Legs Day A',
        description: 'Quad-dominant leg day',
        dayNumber: 3,
        exercises: [
          {
            id: 'ppl-3-1',
            exerciseId: 'barbell-squat',
            exerciseName: 'Barbell Squat',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 180,
            primaryMuscles: ['quadriceps'],
            images: ['barbell-squat/0.jpg'],
          },
          {
            id: 'ppl-3-2',
            exerciseId: 'leg-press',
            exerciseName: 'Leg Press',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '10-12',
            restSeconds: 120,
            primaryMuscles: ['quadriceps'],
            images: ['leg-press/0.jpg'],
          },
          {
            id: 'ppl-3-3',
            exerciseId: 'leg-extension',
            exerciseName: 'Leg Extension',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 90,
            primaryMuscles: ['quadriceps'],
            images: ['leg-extension/0.jpg'],
          },
          {
            id: 'ppl-3-4',
            exerciseId: 'calf-raises',
            exerciseName: 'Calf Raises',
            orderIndex: 3,
            targetSets: 4,
            targetReps: '12-15',
            restSeconds: 60,
            primaryMuscles: ['calves'],
            images: ['calf-raises/0.jpg'],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Upper Lower Split',
    description: 'Efficient 4-day split hitting each muscle group twice per week. Great for intermediate lifters with limited time.',
    difficulty: 'intermediate',
    durationWeeks: 8,
    goal: 'strength',
    createdBy: 'Fortis',
    isPublic: true,
    lastPerformed: '1 week ago',
    stats: EMPTY_STATS,
    workouts: [
      {
        id: 'ul-upper-a',
        name: 'Upper A',
        description: 'Horizontal push/pull emphasis',
        dayNumber: 1,
        exercises: [
          {
            id: 'ul-1-1',
            exerciseId: 'barbell-bench-press',
            exerciseName: 'Barbell Bench Press',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['chest'],
            images: ['barbell-bench-press/0.jpg'],
          },
          {
            id: 'ul-1-2',
            exerciseId: 'barbell-row',
            exerciseName: 'Barbell Row',
            orderIndex: 1,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['middle back'],
            images: ['barbell-row/0.jpg'],
          },
          {
            id: 'ul-1-3',
            exerciseId: 'dumbbell-shoulder-press',
            exerciseName: 'Dumbbell Shoulder Press',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['shoulders'],
            images: ['dumbbell-shoulder-press/0.jpg'],
          },
        ],
      },
      {
        id: 'ul-lower-a',
        name: 'Lower A',
        description: 'Squat emphasis',
        dayNumber: 2,
        exercises: [
          {
            id: 'ul-2-1',
            exerciseId: 'barbell-squat',
            exerciseName: 'Barbell Squat',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['quadriceps'],
            images: ['barbell-squat/0.jpg'],
          },
          {
            id: 'ul-2-2',
            exerciseId: 'romanian-deadlift',
            exerciseName: 'Romanian Deadlift',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 150,
            primaryMuscles: ['hamstrings'],
            images: ['romanian-deadlift/0.jpg'],
          },
        ],
      },
    ],
  },
];

const MOCK_WORKOUTS: WorkoutDetail[] = [
  {
    id: '1',
    name: 'Push Day A',
    description: 'Chest, shoulders, and triceps with compound movements',
    lastPerformed: '3 days ago',
    stats: EMPTY_STATS,
    exercises: [
      {
        id: 'w1-1',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Bench Press',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['chest'],
        images: ['barbell-bench-press/0.jpg'],
      },
      {
        id: 'w1-2',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['chest'],
        images: ['incline-dumbbell-press/0.jpg'],
      },
      {
        id: 'w1-3',
        exerciseId: 'overhead-press',
        exerciseName: 'Overhead Press',
        orderIndex: 2,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['shoulders'],
        images: ['overhead-press/0.jpg'],
      },
      {
        id: 'w1-4',
        exerciseId: 'cable-crossover',
        exerciseName: 'Cable Crossover',
        orderIndex: 3,
        targetSets: 3,
        targetReps: '12-15',
        primaryMuscles: ['chest'],
        images: ['cable-crossover/0.jpg'],
      },
      {
        id: 'w1-5',
        exerciseId: 'lateral-raises',
        exerciseName: 'Lateral Raises',
        orderIndex: 4,
        targetSets: 3,
        targetReps: '12-15',
        primaryMuscles: ['shoulders'],
        images: ['lateral-raises/0.jpg'],
      },
    ],
  },
  {
    id: '2',
    name: 'Pull Day B',
    description: 'Back and biceps with heavy compounds',
    lastPerformed: '5 days ago',
    stats: EMPTY_STATS,
    exercises: [
      {
        id: 'w2-1',
        exerciseId: 'barbell-deadlift',
        exerciseName: 'Barbell Deadlift',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '5',
        primaryMuscles: ['lower back'],
        images: ['barbell-deadlift/0.jpg'],
      },
      {
        id: 'w2-2',
        exerciseId: 'barbell-row',
        exerciseName: 'Barbell Row',
        orderIndex: 1,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['middle back'],
        images: ['barbell-row/0.jpg'],
      },
      {
        id: 'w2-3',
        exerciseId: 'lat-pulldown',
        exerciseName: 'Lat Pulldown',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['lats'],
        images: ['lat-pulldown/0.jpg'],
      },
      {
        id: 'w2-4',
        exerciseId: 'seated-cable-row',
        exerciseName: 'Seated Cable Row',
        orderIndex: 3,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['middle back'],
        images: ['seated-cable-row/0.jpg'],
      },
      {
        id: 'w2-5',
        exerciseId: 'barbell-curl',
        exerciseName: 'Barbell Curl',
        orderIndex: 4,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['biceps'],
        images: ['barbell-curl/0.jpg'],
      },
      {
        id: 'w2-6',
        exerciseId: 'hammer-curl',
        exerciseName: 'Hammer Curl',
        orderIndex: 5,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['biceps'],
        images: ['hammer-curl/0.jpg'],
      },
    ],
  },
  {
    id: '3',
    name: 'Leg Day',
    description: 'Full leg development - quads, hamstrings, and calves',
    lastPerformed: '1 week ago',
    stats: EMPTY_STATS,
    exercises: [
      {
        id: 'w3-1',
        exerciseId: 'barbell-squat',
        exerciseName: 'Barbell Squat',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['quadriceps'],
        images: ['barbell-squat/0.jpg'],
      },
      {
        id: 'w3-2',
        exerciseId: 'romanian-deadlift',
        exerciseName: 'Romanian Deadlift',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['hamstrings'],
        images: ['romanian-deadlift/0.jpg'],
      },
      {
        id: 'w3-3',
        exerciseId: 'leg-press',
        exerciseName: 'Leg Press',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['quadriceps'],
        images: ['leg-press/0.jpg'],
      },
      {
        id: 'w3-4',
        exerciseId: 'calf-raises',
        exerciseName: 'Calf Raises',
        orderIndex: 3,
        targetSets: 4,
        targetReps: '12-15',
        primaryMuscles: ['calves'],
        images: ['calf-raises/0.jpg'],
      },
    ],
  },
  {
    id: '4',
    name: 'Core & Cardio',
    description: 'Ab circuit with conditioning finisher',
    lastPerformed: '2 weeks ago',
    stats: EMPTY_STATS,
    exercises: [
      {
        id: 'w4-1',
        exerciseId: 'plank',
        exerciseName: 'Plank',
        orderIndex: 0,
        targetSets: 3,
        targetReps: '60s',
        primaryMuscles: ['abdominals'],
        images: ['plank/0.jpg'],
      },
      {
        id: 'w4-2',
        exerciseId: 'cable-crunches',
        exerciseName: 'Cable Crunches',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '15-20',
        primaryMuscles: ['abdominals'],
        images: ['cable-crunches/0.jpg'],
      },
      {
        id: 'w4-3',
        exerciseId: 'hanging-leg-raises',
        exerciseName: 'Hanging Leg Raises',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '10-15',
        primaryMuscles: ['abdominals'],
        images: ['hanging-leg-raises/0.jpg'],
      },
    ],
  },
];

// --- Storage Functions ---

async function loadProgramsFromStorage(): Promise<ProgramDetail[]> {
  try {
    const stored = await getScopedItem(PROGRAMS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load programs from storage:', error);
  }
  return [];
}

async function saveProgramsToStorage(programs: ProgramDetail[]): Promise<void> {
  try {
    await setScopedItem(PROGRAMS_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error('Failed to save programs to storage:', error);
  }
}

async function loadWorkoutsFromStorage(): Promise<WorkoutDetail[]> {
  try {
    const stored = await getScopedItem(WORKOUTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load workouts from storage:', error);
  }
  return [];
}

async function saveWorkoutsToStorage(workouts: WorkoutDetail[]): Promise<void> {
  try {
    await setScopedItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Failed to save workouts to storage:', error);
  }
}

// --- Core Functions ---

export async function getAllPrograms(): Promise<ProgramDetail[]> {
  if (programsCache) return programsCache;

  // Load persisted programs from storage
  if (!storageLoaded) {
    const storedPrograms = await loadProgramsFromStorage();
    storageLoaded = true;

    if (storedPrograms.length > 0) {
      // Use stored programs (they already have modifications applied)
      programsCache = storedPrograms;
      return programsCache;
    }
  }

  // Fall back to mock data if nothing stored
  programsCache = MOCK_PROGRAMS;
  // Save mock data to storage for future modifications
  await saveProgramsToStorage(programsCache);
  return programsCache;
}

export async function getProgramById(id: string): Promise<ProgramDetail | null> {
  const programs = await getAllPrograms();
  return programs.find(p => p.id === id) || null;
}

/**
 * Check if a workout can be added to a program (respects the 7 workout limit).
 */
export async function canAddWorkoutToProgram(programId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
}> {
  const program = await getProgramById(programId);
  if (!program) return { canAdd: false, currentCount: 0 };
  return {
    canAdd: program.workouts.length < MAX_WORKOUTS_PER_PROGRAM,
    currentCount: program.workouts.length,
  };
}

export async function getAllWorkouts(): Promise<WorkoutDetail[]> {
  if (workoutsCache) return workoutsCache;

  // Load persisted workouts from storage
  if (!workoutsStorageLoaded) {
    const storedWorkouts = await loadWorkoutsFromStorage();
    workoutsStorageLoaded = true;

    if (storedWorkouts.length > 0) {
      workoutsCache = storedWorkouts;
      return workoutsCache;
    }
  }

  // Fall back to mock data if nothing stored
  workoutsCache = MOCK_WORKOUTS;
  // Save mock data to storage for future modifications
  await saveWorkoutsToStorage(workoutsCache);
  return workoutsCache;
}

export async function getWorkoutById(id: string): Promise<WorkoutDetail | null> {
  const workouts = await getAllWorkouts();
  return workouts.find(w => w.id === id) || null;
}

// --- Program Modification ---

/**
 * Add a workout to a program at a specific position (day number).
 * The workout will be converted to a ProgramWorkout and inserted at the specified position.
 *
 * @param workoutId - ID of the standalone workout to add
 * @param programId - ID of the program to add the workout to
 * @param dayNumber - Day number to insert the workout at
 * @returns The updated program, or null if either the workout or program was not found
 */
export async function addWorkoutToProgram(
  workoutId: string,
  programId: string,
  dayNumber: number
): Promise<ProgramDetail | null> {
  const workout = await getWorkoutById(workoutId);
  const program = await getProgramById(programId);

  if (!workout || !program) {
    return null;
  }

  // Check if program has reached the workout limit
  if (program.workouts.length >= MAX_WORKOUTS_PER_PROGRAM) {
    throw new Error('PROGRAM_LIMIT_REACHED');
  }

  // Convert WorkoutDetail exercises to ProgramExercise format
  const programExercises: ProgramExercise[] = workout.exercises.map((ex, index) => ({
    id: `${programId}-${dayNumber}-${ex.id}`,
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    orderIndex: index,
    targetSets: ex.targetSets,
    targetReps: ex.targetReps,
    restSeconds: 120, // Default rest time
    primaryMuscles: ex.primaryMuscles,
    images: ex.images,
  }));

  // Create a new ProgramWorkout from the workout
  const newProgramWorkout: ProgramWorkout = {
    id: `${programId}-day-${dayNumber}`,
    name: workout.name,
    description: workout.description,
    dayNumber,
    exercises: programExercises,
  };

  // Update day numbers for existing workouts if inserting before them
  const updatedWorkouts = program.workouts.map((w) => {
    if (w.dayNumber >= dayNumber) {
      return { ...w, dayNumber: w.dayNumber + 1 };
    }
    return w;
  });

  // Insert the new workout and sort by day number
  const finalWorkouts = [...updatedWorkouts, newProgramWorkout].sort(
    (a, b) => a.dayNumber - b.dayNumber
  );

  // Update the program in cache
  const updatedProgram: ProgramDetail = {
    ...program,
    workouts: finalWorkouts,
  };

  // Update the cache
  if (programsCache) {
    programsCache = programsCache.map((p) =>
      p.id === programId ? updatedProgram : p
    );
    // Persist to AsyncStorage
    await saveProgramsToStorage(programsCache);
  }

  return updatedProgram;
}

/**
 * Get the workouts in a program as a simplified list for the position picker modal.
 */
export async function getProgramWorkoutSlots(
  programId: string
): Promise<{ id: string; name: string; dayNumber: number }[]> {
  const program = await getProgramById(programId);
  if (!program) return [];

  return program.workouts.map((w) => ({
    id: w.id,
    name: w.name,
    dayNumber: w.dayNumber,
  }));
}

/**
 * Remove a workout from a program.
 * Renumbers remaining workouts to maintain sequential day numbers.
 */
export async function removeWorkoutFromProgram(
  programId: string,
  workoutId: string
): Promise<ProgramDetail | null> {
  const program = await getProgramById(programId);
  if (!program) return null;

  // Filter out the workout and renumber days
  const updatedWorkouts = program.workouts
    .filter((w) => w.id !== workoutId)
    .map((w, index) => ({ ...w, dayNumber: index + 1 }));

  const updatedProgram: ProgramDetail = {
    ...program,
    workouts: updatedWorkouts,
  };

  // Update cache and persist
  if (programsCache) {
    programsCache = programsCache.map((p) =>
      p.id === programId ? updatedProgram : p
    );
    await saveProgramsToStorage(programsCache);
  }

  return updatedProgram;
}

/**
 * Remove an exercise from a program workout.
 * Renumbers remaining exercises to maintain sequential order indexes.
 */
export async function removeExerciseFromProgramWorkout(
  programId: string,
  workoutId: string,
  exerciseId: string
): Promise<ProgramDetail | null> {
  const program = await getProgramById(programId);
  if (!program) return null;

  // Find and update the workout
  const updatedWorkouts = program.workouts.map((workout) => {
    if (workout.id !== workoutId) return workout;

    // Filter out the exercise and renumber order indexes
    const updatedExercises = workout.exercises
      .filter((e) => e.id !== exerciseId)
      .map((e, index) => ({ ...e, orderIndex: index }));

    return { ...workout, exercises: updatedExercises };
  });

  const updatedProgram: ProgramDetail = {
    ...program,
    workouts: updatedWorkouts,
  };

  // Update cache and persist
  if (programsCache) {
    programsCache = programsCache.map((p) =>
      p.id === programId ? updatedProgram : p
    );
    await saveProgramsToStorage(programsCache);
  }

  return updatedProgram;
}

/**
 * Remove an exercise from a standalone workout.
 * Renumbers remaining exercises to maintain sequential order indexes.
 */
export async function removeExerciseFromWorkout(
  workoutId: string,
  exerciseId: string
): Promise<WorkoutDetail | null> {
  const workouts = await getAllWorkouts();
  const workout = workouts.find((w) => w.id === workoutId);
  if (!workout) return null;

  // Filter out the exercise and renumber order indexes
  const updatedExercises = workout.exercises
    .filter((e) => e.id !== exerciseId)
    .map((e, index) => ({ ...e, orderIndex: index }));

  const updatedWorkout: WorkoutDetail = {
    ...workout,
    exercises: updatedExercises,
  };

  // Update cache and persist
  if (workoutsCache) {
    workoutsCache = workoutsCache.map((w) =>
      w.id === workoutId ? updatedWorkout : w
    );
    await saveWorkoutsToStorage(workoutsCache);
  }

  return updatedWorkout;
}

// --- Delete Functions ---

/**
 * Delete a program entirely.
 */
export async function deleteProgram(programId: string): Promise<boolean> {
  const programs = await getAllPrograms();
  const updatedPrograms = programs.filter(p => p.id !== programId);

  if (updatedPrograms.length === programs.length) {
    return false; // Program not found
  }

  programsCache = updatedPrograms;
  await saveProgramsToStorage(programsCache);
  return true;
}

/**
 * Delete a standalone workout entirely.
 */
export async function deleteWorkout(workoutId: string): Promise<boolean> {
  const workouts = await getAllWorkouts();
  const updatedWorkouts = workouts.filter(w => w.id !== workoutId);

  if (updatedWorkouts.length === workouts.length) {
    return false; // Workout not found
  }

  workoutsCache = updatedWorkouts;
  await saveWorkoutsToStorage(workoutsCache);
  return true;
}

// --- Cache Management ---

export function invalidateProgramCache(): void {
  programsCache = null;
  storageLoaded = false;
}

export function invalidateWorkoutCache(): void {
  workoutsCache = null;
  workoutsStorageLoaded = false;
}

export function invalidateAllCache(): void {
  programsCache = null;
  workoutsCache = null;
}
