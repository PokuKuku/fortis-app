import { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useProgramsStore } from '@/src/store/programsStore';
import * as ExerciseService from '@/src/services/exerciseService';
import { generateOnboardingProgramWithAI } from '@/src/services/aiService';
import type { AIProgramTemplate } from '@/src/types/ai';
import {
  buildDeterministicOnboardingProgram,
  loadPendingOnboardingProgramSpec,
  ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
  resolveOnboardingProgramName,
  updatePendingOnboardingProgramSpec,
  type GeneratedProgramPayload,
  type OnboardingProgramSpec,
} from '@/src/utils/onboardingProgram';

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

export function OnboardingProgramCoordinator() {
  const { isAuthenticated, profile, profileResolved } = useAuth();
  const programs = useProgramsStore((s) => s.programs);
  const hasFetchedPrograms = useProgramsStore((s) => s.hasFetchedPrograms);
  const fetchPrograms = useProgramsStore((s) => s.fetchPrograms);
  const createGeneratedProgram = useProgramsStore((s) => s.createGeneratedProgram);
  const inFlightSpecRef = useRef<string | null>(null);
  const [specRevision, setSpecRevision] = useState(0);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
      () => setSpecRevision((revision) => revision + 1)
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !profileResolved || !profile?.onboarding_completed) return;

    let cancelled = false;

    const run = async () => {
      const spec = await loadPendingOnboardingProgramSpec();
      if (!spec || cancelled) return;
      if (spec.status === 'ready' || spec.status === 'dismissed') return;
      if (inFlightSpecRef.current === spec.id) return;

      if (!hasFetchedPrograms) {
        await fetchPrograms();
      }

      const existing = useProgramsStore
        .getState()
        .programs
        .find((program) => program.aiPayloadVersion === `onboarding-program:${spec.id}`);
      if (existing) {
        await updatePendingOnboardingProgramSpec({
          status: 'ready',
          generatedProgramId: existing.id,
          error: null,
        });
        return;
      }

      inFlightSpecRef.current = spec.id;
      await updatePendingOnboardingProgramSpec({ status: 'generating', error: null });

      try {
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
          return;
        }

        const programId = await createGeneratedProgram(payload);
        if (!programId) {
          await updatePendingOnboardingProgramSpec({
            status: 'failed',
            error: useProgramsStore.getState().error ?? 'Could not save generated program.',
          });
          return;
        }

        await updatePendingOnboardingProgramSpec({
          status: 'ready',
          generatedProgramId: programId,
          error: null,
        });
      } catch (error) {
        await updatePendingOnboardingProgramSpec({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Could not generate program.',
        });
      } finally {
        inFlightSpecRef.current = null;
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    createGeneratedProgram,
    fetchPrograms,
    hasFetchedPrograms,
    isAuthenticated,
    profile?.onboarding_completed,
    profileResolved,
    programs.length,
    specRevision,
  ]);

  return null;
}
