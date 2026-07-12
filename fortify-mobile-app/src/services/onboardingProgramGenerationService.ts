import * as ExerciseService from '@/src/services/exerciseService';
import { generateOnboardingProgramWithAI } from '@/src/services/aiService';
import { useProgramsStore } from '@/src/store/programsStore';
import type { AIProgramTemplate } from '@/src/types/ai';
import {
  buildDeterministicOnboardingProgram,
  loadPendingOnboardingProgramSpec,
  resolveOnboardingProgramName,
  updatePendingOnboardingProgramSpec,
  type GeneratedProgramPayload,
  type OnboardingProgramSpec,
} from '@/src/utils/onboardingProgram';

let inFlightGeneration: Promise<string | null> | null = null;

const normalizeAIProgram = (
  template: AIProgramTemplate | undefined,
  spec: OnboardingProgramSpec
): GeneratedProgramPayload | null => {
  if (!template || !Array.isArray(template.workouts) || template.workouts.length === 0) {
    return null;
  }

  const workouts = template.workouts
    .map((workout) => ({
      name: workout.name?.trim() || 'Workout',
      exercises: (workout.exercises ?? [])
        .filter((exercise) => exercise.exerciseId && exercise.exerciseName)
        .map((exercise) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          sets: Math.max(1, Math.min(6, Math.round(exercise.sets || 3))),
          reps: exercise.reps || '8-12',
          restSeconds: exercise.restSeconds ?? 90,
          notes: exercise.notes ?? '',
        })),
    }))
    .filter((workout) => workout.exercises.length > 0);

  if (workouts.length === 0) return null;

  return {
    name: resolveOnboardingProgramName(spec, template.name),
    description: template.description?.trim() || 'A personalized program built from your onboarding setup.',
    difficulty: template.difficulty ?? (spec.liftingExperience === 'advanced' ? 'advanced' : spec.liftingExperience === 'none' ? 'beginner' : 'intermediate'),
    goal: template.goal ?? (spec.fitnessGoal === 'improve_strength' ? 'strength' : spec.fitnessGoal === 'build_muscle' ? 'hypertrophy' : 'general_fitness'),
    durationWeeks: template.durationWeeks ?? spec.durationWeeks,
    workouts,
    sourceSpecId: spec.id,
  };
};

async function generateOnboardingProgram(spec: OnboardingProgramSpec): Promise<string | null> {
  await updatePendingOnboardingProgramSpec({ status: 'generating', error: null });

  try {
    const { fetchPrograms, createGeneratedProgram } = useProgramsStore.getState();
    if (!useProgramsStore.getState().hasFetchedPrograms) {
      await fetchPrograms();
    }

    const onboardingPrograms = useProgramsStore
      .getState()
      .programs
      .filter((program) => program.aiPayloadVersion?.startsWith('onboarding-program:'));
    const exactExisting = onboardingPrograms.find(
      (program) => program.aiPayloadVersion === `onboarding-program:${spec.id}`
    );
    const completeExisting = onboardingPrograms.find((program) => (
      program.workouts.length > 0
      && program.workouts.every((workout) => workout.exercises.length > 0)
    ));
    const existing = (
      exactExisting
      && exactExisting.workouts.length > 0
      && exactExisting.workouts.every((workout) => workout.exercises.length > 0)
        ? exactExisting
        : completeExisting ?? exactExisting
    );
    if (existing) {
      const isComplete = existing.workouts.length > 0
        && existing.workouts.every((workout) => workout.exercises.length > 0);

      if (isComplete) {
        await updatePendingOnboardingProgramSpec({
          status: 'ready',
          generatedProgramId: existing.id,
          error: null,
        });
        return existing.id;
      }

      if (existing === exactExisting) {
        // Older sync behavior could leave the parent program behind after a
        // failed nested insert. Remove that invalid record before regenerating.
        const deleted = await useProgramsStore.getState().deleteProgram(existing.id);
        if (!deleted) {
          throw new Error('Could not replace the incomplete onboarding program.');
        }
      }
    }

    const exercises = await ExerciseService.getAllExercises();
    let payload: GeneratedProgramPayload | null = null;

    try {
      const aiResponse = await generateOnboardingProgramWithAI(spec);
      payload = normalizeAIProgram(aiResponse.answer?.programTemplate, spec);
    } catch (error) {
      console.warn('[OnboardingProgram] AI generation failed, using fallback:', error);
    }

    if (!payload) {
      payload = buildDeterministicOnboardingProgram(spec, exercises);
    }

    if (!payload) {
      await updatePendingOnboardingProgramSpec({
        status: 'failed',
        error: 'Could not build a program from the exercise library.',
      });
      return null;
    }

    const programId = await createGeneratedProgram(payload);
    if (!programId) {
      await updatePendingOnboardingProgramSpec({
        status: 'failed',
        error: useProgramsStore.getState().error ?? 'Could not save generated program.',
      });
      return null;
    }

    await updatePendingOnboardingProgramSpec({
      status: 'ready',
      generatedProgramId: programId,
      error: null,
    });
    return programId;
  } catch (error) {
    await updatePendingOnboardingProgramSpec({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Could not generate program.',
    });
    return null;
  }
}

export async function ensureOnboardingProgramGenerated(
  providedSpec?: OnboardingProgramSpec | null
): Promise<string | null> {
  const spec = providedSpec ?? await loadPendingOnboardingProgramSpec();
  if (!spec || spec.status === 'dismissed') return spec?.generatedProgramId ?? null;
  if (spec.status === 'ready' && spec.generatedProgramId) {
    return spec.generatedProgramId;
  }
  if (inFlightGeneration) return inFlightGeneration;

  const generation = generateOnboardingProgram(spec);
  inFlightGeneration = generation;
  try {
    return await generation;
  } finally {
    if (inFlightGeneration === generation) {
      inFlightGeneration = null;
    }
  }
}
