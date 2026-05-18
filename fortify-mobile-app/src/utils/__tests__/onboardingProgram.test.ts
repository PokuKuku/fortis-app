import {
  buildDeterministicOnboardingProgram,
  buildOnboardingProgramBlueprint,
  buildOnboardingProgramSpec,
} from '@/src/utils/onboardingProgram';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { OnboardingState } from '@/src/utils/onboardingState';

const exercise = (
  id: string,
  name: string,
  primaryMuscles: string[],
  equipment = 'Dumbbell'
): ExerciseWithSource => ({
  id,
  remoteId: `remote-${id}`,
  name,
  primaryMuscles,
  secondaryMuscles: [],
  equipment,
  category: 'strength',
  instructions: [],
  images: [],
  isCurated: true,
  isHidden: false,
  source: 'api',
});

describe('onboarding program helpers', () => {
  it('builds a preview from onboarding training preferences', () => {
    const state = {
      full_name: 'Kwaku Bimpong',
      workouts_per_week: 4,
      workout_schedule_days: [1, 2, 4, 6],
      training_environment: 'hybrid',
      muscle_focuses: ['chest', 'back'],
      fitness_goal: 'build_muscle',
      lifting_experience: 'intermediate',
    } satisfies Partial<OnboardingState>;

    const spec = buildOnboardingProgramSpec(state as OnboardingState);
    const preview = buildOnboardingProgramBlueprint(spec);

    expect(spec.trainingEnvironment).toBe('hybrid');
    expect(spec.muscleFocuses).toEqual(['chest', 'back']);
    expect(preview.name).toBe("Kwaku's Program");
    expect(preview.environmentLabel).toBe('Hybrid');
    expect(preview.scheduleLabel).toBe('Mon, Tue, Thu, Sat');
    expect(preview.workouts.map((workout) => workout.name)).toEqual([
      'Chest Strength',
      'Back Strength',
      'Chest Volume',
      'Back Volume',
    ]);
  });

  it('keeps full body only for balanced strength plans', () => {
    const balancedSpec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
      muscle_focuses: ['balanced'],
      fitness_goal: 'improve_strength',
    } as OnboardingState);
    const focusedSpec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
      muscle_focuses: ['arms', 'shoulders', 'back'],
      fitness_goal: 'improve_strength',
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(balancedSpec).workouts.map((workout) => workout.name)).toEqual([
      'Upper Strength',
      'Lower Strength',
      'Full Body',
    ]);
    expect(buildOnboardingProgramBlueprint(focusedSpec).workouts.map((workout) => workout.name)).toEqual([
      'Arms Strength',
      'Shoulders Strength',
      'Back Strength',
    ]);
  });

  it('personalizes high-frequency focused splits instead of using generic split names', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 6,
      muscle_focuses: ['arms', 'shoulders', 'back'],
      fitness_goal: 'build_muscle',
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(spec).workouts.map((workout) => workout.name)).toEqual([
      'Arms Strength',
      'Shoulders Strength',
      'Back Strength',
      'Arms Volume',
      'Shoulders Volume',
      'Back Volume',
    ]);
  });

  it('builds a library-backed deterministic program when AI is unavailable', () => {
    const state = {
      full_name: 'Jason',
      workouts_per_week: 2,
      workout_schedule_days: [1, 3],
      training_environment: 'home',
      muscle_focuses: ['balanced'],
      fitness_goal: 'improve_strength',
      lifting_experience: 'beginner',
    } satisfies Partial<OnboardingState>;
    const spec = buildOnboardingProgramSpec(state as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('push-up', 'Push Up', ['chest'], 'Body Weight'),
      exercise('db-row', 'Dumbbell Row', ['middle back']),
      exercise('db-press', 'Dumbbell Shoulder Press', ['shoulders']),
      exercise('db-squat', 'Dumbbell Squat', ['quadriceps']),
      exercise('db-rdl', 'Dumbbell Romanian Deadlift', ['hamstrings']),
      exercise('glute-bridge', 'Glute Bridge', ['glutes'], 'Body Weight'),
      exercise('barbell-bench', 'Barbell Bench Press', ['chest'], 'Barbell'),
    ]);

    expect(payload).not.toBeNull();
    expect(payload?.name).toBe("Jason's Program");
    expect(payload?.workouts).toHaveLength(2);
    expect(payload?.workouts[0].exercises.length).toBeGreaterThanOrEqual(3);
    expect(payload?.workouts[1].exercises.length).toBeGreaterThanOrEqual(3);
    expect(payload?.workouts.flatMap((workout) => workout.exercises).every((item) => item.exerciseId.startsWith('remote-'))).toBe(true);
    expect(payload?.workouts.flatMap((workout) => workout.exercises).some((item) => item.exerciseName === 'Barbell Bench Press')).toBe(false);
  });
});
