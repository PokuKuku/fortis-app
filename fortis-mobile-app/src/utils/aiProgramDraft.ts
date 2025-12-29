import {
  AIMutationPlan,
  EditableProgramDraft,
  EditableProgramWorkout,
  EditableProgramExercise,
  AIExerciseResolution,
} from '@/src/types/ai';
import { generateSecureUUID as generateId } from './uuid';

const parseNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const parseString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export function buildProgramDraftFromPlan(
  plan: AIMutationPlan
): EditableProgramDraft {
  const programMutation = plan.mutations.find((m) => m.entityType === 'workout_program');
  const programState = (programMutation?.proposedState ?? {}) as Record<string, unknown>;
  const isTemplate =
    plan.intent === 'CREATE_TEMPLATE' ||
    Boolean(programState.is_template);

  const workoutsById = new Map<string, EditableProgramWorkout>();

  plan.mutations
    .filter((m) => m.entityType === 'program_workout')
    .forEach((mutation, index) => {
      const state = (mutation.proposedState ?? {}) as Record<string, unknown>;
      workoutsById.set(mutation.mutationId, {
        id: mutation.mutationId,
        name: parseString(state.name, `Workout ${index + 1}`),
        dayNumber: parseNumber(state.day_number, index + 1),
        description: parseString(state.description, ''),
        exercises: [],
      });
    });

  if (workoutsById.size === 0) {
    const fallbackId = generateId();
    workoutsById.set(fallbackId, {
      id: fallbackId,
      name: 'Workout 1',
      dayNumber: 1,
      description: '',
      exercises: [],
    });
  }

  const workoutList = Array.from(workoutsById.values());
  const fallbackWorkoutId = workoutList[0]?.id;

  const resolutionByExerciseId = new Map<string, AIExerciseResolution>();
  plan.exerciseResolution.forEach((resolution) => {
    resolutionByExerciseId.set(resolution.exerciseId, resolution);
  });

  plan.mutations
    .filter((m) => m.entityType === 'program_exercise')
    .forEach((mutation) => {
      const state = (mutation.proposedState ?? {}) as Record<string, unknown>;
      const workoutRef = state.program_workout_id;
      const workoutKey =
        typeof workoutRef === 'string' && workoutRef.startsWith('ref:')
          ? workoutRef.slice(4)
          : parseString(workoutRef, fallbackWorkoutId || '');
      const workout = workoutsById.get(workoutKey) || (fallbackWorkoutId ? workoutsById.get(fallbackWorkoutId) : undefined);
      if (!workout) return;

      const exerciseId = parseString(state.exercise_id, '');
      const resolution = resolutionByExerciseId.get(exerciseId);
      const exerciseName = resolution?.exerciseName || parseString(state.exercise_name, 'Unknown Exercise');

      // Only include values that were explicitly set by the AI
      // Leave unspecified fields empty/undefined so user sees they weren't set
      const exercise: EditableProgramExercise = {
        id: mutation.mutationId,
        exerciseId,
        exerciseName,
        orderIndex: parseNumber(state.order_index, workout.exercises.length + 1),
        sets: state.sets !== null && state.sets !== undefined
          ? parseNumber(state.sets, 0)
          : 0,
        reps: state.reps !== null && state.reps !== undefined
          ? parseString(state.reps, '')
          : '',
        restSeconds: state.rest_seconds !== null && state.rest_seconds !== undefined
          ? parseNumber(state.rest_seconds, 0)
          : undefined,
        notes: state.notes !== null && state.notes !== undefined
          ? parseString(state.notes, '')
          : undefined,
      };

      workout.exercises.push(exercise);
    });

  const workouts = Array.from(workoutsById.values())
    .map((workout) => ({
      ...workout,
      exercises: workout.exercises.sort((a, b) => a.orderIndex - b.orderIndex),
    }))
    .sort((a, b) => a.dayNumber - b.dayNumber);

  // Only include values that were explicitly set - leave unspecified fields empty
  return {
    name: parseString(programState.name, isTemplate ? 'New Template' : 'New Program'),
    description: programState.description ? parseString(programState.description, '') : '',
    difficulty: programState.difficulty ? parseString(programState.difficulty, '') : '',
    goal: programState.goal ? parseString(programState.goal, '') : '',
    durationWeeks:
      programState.duration_weeks === null || programState.duration_weeks === undefined
        ? undefined
        : parseNumber(programState.duration_weeks, 0),
    isTemplate,
    workouts,
    originalPlan: plan,
  };
}

export function buildPlanFromProgramDraft(
  draft: EditableProgramDraft
): AIMutationPlan {
  const mutations = [];
  let order = 0;

  const programMutationId = generateId();
  mutations.push({
    mutationId: programMutationId,
    order: order++,
    operation: 'INSERT',
    entityType: 'workout_program',
    proposedState: {
      name: draft.name.trim() || (draft.isTemplate ? 'New Template' : 'New Program'),
      description: draft.description || null,
      difficulty: draft.difficulty || 'intermediate',
      duration_weeks: draft.durationWeeks ?? null,
      goal: draft.goal || null,
      is_template: draft.isTemplate,
    },
    description: `Create ${draft.isTemplate ? 'template' : 'program'}: ${draft.name}`,
  });

  const workoutIdMap = new Map<string, string>();
  const exerciseIds = new Map<string, string>();

  draft.workouts.forEach((workout) => {
    const workoutMutationId = generateId();
    workoutIdMap.set(workout.id, workoutMutationId);
    mutations.push({
      mutationId: workoutMutationId,
      order: order++,
      operation: 'INSERT',
      entityType: 'program_workout',
      proposedState: {
        program_id: `ref:${programMutationId}`,
        name: workout.name.trim() || 'Workout',
        description: workout.description || null,
        day_number: workout.dayNumber,
      },
      description: `Create workout: ${workout.name}`,
      dependsOn: [programMutationId],
    });

    workout.exercises.forEach((exercise, index) => {
      if (!exercise.exerciseId) return;
      exerciseIds.set(exercise.exerciseId, exercise.exerciseName);
      mutations.push({
        mutationId: generateId(),
        order: order++,
        operation: 'INSERT',
        entityType: 'program_exercise',
        proposedState: {
          program_workout_id: `ref:${workoutMutationId}`,
          exercise_id: exercise.exerciseId,
          order_index: index + 1,
          sets: exercise.sets,
          reps: exercise.reps || null,
          rest_seconds: exercise.restSeconds ?? null,
          notes: exercise.notes || null,
        },
        description: `${exercise.exerciseName}: ${exercise.sets} sets`,
        dependsOn: [workoutMutationId],
      });
    });
  });

  const resolutionByExerciseId = new Map<string, AIExerciseResolution>();
  draft.originalPlan.exerciseResolution.forEach((resolution) => {
    resolutionByExerciseId.set(resolution.exerciseId, resolution);
  });

  const exerciseResolution: AIExerciseResolution[] = Array.from(exerciseIds.entries()).map(
    ([exerciseId, exerciseName]) =>
      resolutionByExerciseId.get(exerciseId) || {
        exerciseId,
        exerciseName,
        fromHistory: true,
      }
  );

  return {
    ...draft.originalPlan,
    summary: `Create ${draft.isTemplate ? 'template' : 'program'}: ${draft.name}`,
    mutations,
    exerciseResolution,
  };
}
