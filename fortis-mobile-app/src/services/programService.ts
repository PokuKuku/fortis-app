import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProgramDetail,
  WorkoutDetail,
  ProgramWorkout,
  ProgramExercise,
  WorkoutExerciseDetail,
  HubStats,
  ProgramProgress,
} from '@/src/types/program';
import { PROGRAMS_KEY, PROGRAM_PROGRESS_KEY } from '@/src/constants/storageKeys';

// In-memory cache
let programsCache: ProgramDetail[] | null = null;
let workoutsCache: WorkoutDetail[] | null = null;
let progressCache: Record<string, ProgramProgress> | null = null;
let storageLoaded = false;

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
            exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 180,
            primaryMuscles: ['chest'],
            images: ['Barbell_Bench_Press_-_Medium_Grip/0.jpg'],
          },
          {
            id: 'ppl-1-2',
            exerciseId: 'Incline_Dumbbell_Press',
            exerciseName: 'Incline Dumbbell Press',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['chest'],
            images: ['Incline_Dumbbell_Press/0.jpg'],
          },
          {
            id: 'ppl-1-3',
            exerciseId: 'Standing_Military_Press',
            exerciseName: 'Overhead Press',
            orderIndex: 2,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 150,
            primaryMuscles: ['shoulders'],
            images: ['Standing_Military_Press/0.jpg'],
          },
          {
            id: 'ppl-1-4',
            exerciseId: 'Cable_Crossover',
            exerciseName: 'Cable Fly',
            orderIndex: 3,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 90,
            primaryMuscles: ['chest'],
            images: ['Cable_Crossover/0.jpg'],
          },
          {
            id: 'ppl-1-5',
            exerciseId: 'Side_Lateral_Raise',
            exerciseName: 'Lateral Raise',
            orderIndex: 4,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 60,
            primaryMuscles: ['shoulders'],
            images: ['Side_Lateral_Raise/0.jpg'],
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
            exerciseId: 'Barbell_Deadlift',
            exerciseName: 'Deadlift',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['lower back'],
            images: ['Barbell_Deadlift/0.jpg'],
          },
          {
            id: 'ppl-2-2',
            exerciseId: 'Bent_Over_Barbell_Row',
            exerciseName: 'Barbell Row',
            orderIndex: 1,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 150,
            primaryMuscles: ['middle back'],
            images: ['Bent_Over_Barbell_Row/0.jpg'],
          },
          {
            id: 'ppl-2-3',
            exerciseId: 'Wide-Grip_Lat_Pulldown',
            exerciseName: 'Lat Pulldown',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['lats'],
            images: ['Wide-Grip_Lat_Pulldown/0.jpg'],
          },
          {
            id: 'ppl-2-4',
            exerciseId: 'Barbell_Curl',
            exerciseName: 'Barbell Curl',
            orderIndex: 3,
            targetSets: 3,
            targetReps: '10-12',
            restSeconds: 90,
            primaryMuscles: ['biceps'],
            images: ['Barbell_Curl/0.jpg'],
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
            exerciseId: 'Barbell_Squat',
            exerciseName: 'Barbell Squat',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '6-8',
            restSeconds: 180,
            primaryMuscles: ['quadriceps'],
            images: ['Barbell_Squat/0.jpg'],
          },
          {
            id: 'ppl-3-2',
            exerciseId: 'Leg_Press',
            exerciseName: 'Leg Press',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '10-12',
            restSeconds: 120,
            primaryMuscles: ['quadriceps'],
            images: ['Leg_Press/0.jpg'],
          },
          {
            id: 'ppl-3-3',
            exerciseId: 'Leg_Extensions',
            exerciseName: 'Leg Extension',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '12-15',
            restSeconds: 90,
            primaryMuscles: ['quadriceps'],
            images: ['Leg_Extensions/0.jpg'],
          },
          {
            id: 'ppl-3-4',
            exerciseId: 'Standing_Calf_Raises',
            exerciseName: 'Calf Raise',
            orderIndex: 3,
            targetSets: 4,
            targetReps: '12-15',
            restSeconds: 60,
            primaryMuscles: ['calves'],
            images: ['Standing_Calf_Raises/0.jpg'],
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
            exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['chest'],
            images: ['Barbell_Bench_Press_-_Medium_Grip/0.jpg'],
          },
          {
            id: 'ul-1-2',
            exerciseId: 'Bent_Over_Barbell_Row',
            exerciseName: 'Barbell Row',
            orderIndex: 1,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['middle back'],
            images: ['Bent_Over_Barbell_Row/0.jpg'],
          },
          {
            id: 'ul-1-3',
            exerciseId: 'Dumbbell_Shoulder_Press',
            exerciseName: 'Dumbbell Press',
            orderIndex: 2,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 120,
            primaryMuscles: ['shoulders'],
            images: ['Dumbbell_Shoulder_Press/0.jpg'],
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
            exerciseId: 'Barbell_Squat',
            exerciseName: 'Barbell Squat',
            orderIndex: 0,
            targetSets: 4,
            targetReps: '5',
            restSeconds: 180,
            primaryMuscles: ['quadriceps'],
            images: ['Barbell_Squat/0.jpg'],
          },
          {
            id: 'ul-2-2',
            exerciseId: 'Romanian_Deadlift',
            exerciseName: 'Romanian Deadlift',
            orderIndex: 1,
            targetSets: 3,
            targetReps: '8-10',
            restSeconds: 150,
            primaryMuscles: ['hamstrings'],
            images: ['Romanian_Deadlift/0.jpg'],
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
        exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
        exerciseName: 'Bench Press',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['chest'],
        images: ['Barbell_Bench_Press_-_Medium_Grip/0.jpg'],
      },
      {
        id: 'w1-2',
        exerciseId: 'Incline_Dumbbell_Press',
        exerciseName: 'Incline Dumbbell Press',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['chest'],
        images: ['Incline_Dumbbell_Press/0.jpg'],
      },
      {
        id: 'w1-3',
        exerciseId: 'Standing_Military_Press',
        exerciseName: 'Overhead Press',
        orderIndex: 2,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['shoulders'],
        images: ['Standing_Military_Press/0.jpg'],
      },
      {
        id: 'w1-4',
        exerciseId: 'Cable_Crossover',
        exerciseName: 'Cable Fly',
        orderIndex: 3,
        targetSets: 3,
        targetReps: '12-15',
        primaryMuscles: ['chest'],
        images: ['Cable_Crossover/0.jpg'],
      },
      {
        id: 'w1-5',
        exerciseId: 'Side_Lateral_Raise',
        exerciseName: 'Lateral Raise',
        orderIndex: 4,
        targetSets: 3,
        targetReps: '12-15',
        primaryMuscles: ['shoulders'],
        images: ['Side_Lateral_Raise/0.jpg'],
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
        exerciseId: 'Barbell_Deadlift',
        exerciseName: 'Deadlift',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '5',
        primaryMuscles: ['lower back'],
        images: ['Barbell_Deadlift/0.jpg'],
      },
      {
        id: 'w2-2',
        exerciseId: 'Bent_Over_Barbell_Row',
        exerciseName: 'Barbell Row',
        orderIndex: 1,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['middle back'],
        images: ['Bent_Over_Barbell_Row/0.jpg'],
      },
      {
        id: 'w2-3',
        exerciseId: 'Wide-Grip_Lat_Pulldown',
        exerciseName: 'Lat Pulldown',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['lats'],
        images: ['Wide-Grip_Lat_Pulldown/0.jpg'],
      },
      {
        id: 'w2-4',
        exerciseId: 'Seated_Cable_Rows',
        exerciseName: 'Cable Row',
        orderIndex: 3,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['middle back'],
        images: ['Seated_Cable_Rows/0.jpg'],
      },
      {
        id: 'w2-5',
        exerciseId: 'Barbell_Curl',
        exerciseName: 'Barbell Curl',
        orderIndex: 4,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['biceps'],
        images: ['Barbell_Curl/0.jpg'],
      },
      {
        id: 'w2-6',
        exerciseId: 'Hammer_Curls',
        exerciseName: 'Hammer Curl',
        orderIndex: 5,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['biceps'],
        images: ['Hammer_Curls/0.jpg'],
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
        exerciseId: 'Barbell_Squat',
        exerciseName: 'Barbell Squat',
        orderIndex: 0,
        targetSets: 4,
        targetReps: '6-8',
        primaryMuscles: ['quadriceps'],
        images: ['Barbell_Squat/0.jpg'],
      },
      {
        id: 'w3-2',
        exerciseId: 'Romanian_Deadlift',
        exerciseName: 'Romanian Deadlift',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '8-10',
        primaryMuscles: ['hamstrings'],
        images: ['Romanian_Deadlift/0.jpg'],
      },
      {
        id: 'w3-3',
        exerciseId: 'Leg_Press',
        exerciseName: 'Leg Press',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '10-12',
        primaryMuscles: ['quadriceps'],
        images: ['Leg_Press/0.jpg'],
      },
      {
        id: 'w3-4',
        exerciseId: 'Standing_Calf_Raises',
        exerciseName: 'Standing Calf Raise',
        orderIndex: 3,
        targetSets: 4,
        targetReps: '12-15',
        primaryMuscles: ['calves'],
        images: ['Standing_Calf_Raises/0.jpg'],
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
        exerciseId: 'Plank',
        exerciseName: 'Plank',
        orderIndex: 0,
        targetSets: 3,
        targetReps: '60s',
        primaryMuscles: ['abdominals'],
        images: ['Plank/0.jpg'],
      },
      {
        id: 'w4-2',
        exerciseId: 'Cable_Crunch',
        exerciseName: 'Cable Crunch',
        orderIndex: 1,
        targetSets: 3,
        targetReps: '15-20',
        primaryMuscles: ['abdominals'],
        images: ['Cable_Crunch/0.jpg'],
      },
      {
        id: 'w4-3',
        exerciseId: 'Hanging_Leg_Raise',
        exerciseName: 'Hanging Leg Raise',
        orderIndex: 2,
        targetSets: 3,
        targetReps: '10-15',
        primaryMuscles: ['abdominals'],
        images: ['Hanging_Leg_Raise/0.jpg'],
      },
    ],
  },
];

// --- Storage Functions ---

async function loadProgramsFromStorage(): Promise<ProgramDetail[]> {
  try {
    const stored = await AsyncStorage.getItem(PROGRAMS_KEY);
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
    await AsyncStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error('Failed to save programs to storage:', error);
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

export async function getAllWorkouts(): Promise<WorkoutDetail[]> {
  if (workoutsCache) return workoutsCache;

  // TODO: Replace with Supabase fetch when ready
  workoutsCache = MOCK_WORKOUTS;
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

// --- Cache Management ---

export function invalidateProgramCache(): void {
  programsCache = null;
  storageLoaded = false;
}

export function invalidateWorkoutCache(): void {
  workoutsCache = null;
}

export function invalidateAllCache(): void {
  programsCache = null;
  workoutsCache = null;
  progressCache = null;
}

// --- Program Progress Tracking ---

/**
 * Load all program progress from AsyncStorage
 */
async function loadProgressFromStorage(): Promise<Record<string, ProgramProgress>> {
  try {
    const stored = await AsyncStorage.getItem(PROGRAM_PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load program progress:', error);
  }
  return {};
}

/**
 * Save all program progress to AsyncStorage
 */
async function saveProgressToStorage(progress: Record<string, ProgramProgress>): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRAM_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save program progress:', error);
  }
}

/**
 * Get all program progress (for listing screens)
 */
export async function getAllProgramProgress(): Promise<Record<string, ProgramProgress>> {
  if (progressCache) return progressCache;

  progressCache = await loadProgressFromStorage();
  return progressCache;
}

/**
 * Get progress for a specific program
 */
export async function getProgramProgress(programId: string): Promise<ProgramProgress | null> {
  const allProgress = await getAllProgramProgress();
  return allProgress[programId] || null;
}

/**
 * Mark a workout as completed within a program
 */
export async function markWorkoutCompleted(
  programId: string,
  workoutId: string
): Promise<ProgramProgress> {
  const allProgress = await getAllProgramProgress();
  const program = await getProgramById(programId);

  // Get or create progress for this program
  const existing = allProgress[programId] || {
    programId,
    completedWorkoutIds: [],
    currentDayNumber: 1,
  };

  // Add workout to completed if not already there
  if (!existing.completedWorkoutIds.includes(workoutId)) {
    existing.completedWorkoutIds.push(workoutId);
    existing.lastCompletedAt = new Date().toISOString();

    // Find the workout to get its day number and advance to next day
    if (program) {
      const completedWorkout = program.workouts.find(w => w.id === workoutId);
      if (completedWorkout) {
        // Move to the next day (or stay at last day if completed all)
        const nextDay = completedWorkout.dayNumber + 1;
        const maxDay = Math.max(...program.workouts.map(w => w.dayNumber));
        existing.currentDayNumber = Math.min(nextDay, maxDay);
      }
    }
  }

  // Update cache and persist
  allProgress[programId] = existing;
  progressCache = allProgress;
  await saveProgressToStorage(allProgress);

  return existing;
}

/**
 * Reset progress for a program (start over)
 */
export async function resetProgramProgress(programId: string): Promise<void> {
  const allProgress = await getAllProgramProgress();

  // Remove progress for this program
  delete allProgress[programId];

  // Update cache and persist
  progressCache = allProgress;
  await saveProgressToStorage(allProgress);
}

/**
 * Invalidate progress cache (forces reload from storage)
 */
export function invalidateProgressCache(): void {
  progressCache = null;
}
