import {
  buildDeterministicOnboardingProgram,
  buildOnboardingProgramBlueprint,
  buildOnboardingProgramSpec,
  formatOnboardingFrequencySummary,
} from '@/src/utils/onboardingProgram';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { OnboardingState } from '@/src/utils/onboardingState';

const exercise = (
  id: string,
  name: string,
  primaryMuscles: string[],
  equipment = 'Dumbbell',
  overrides: Partial<ExerciseWithSource> = {}
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
  ...overrides,
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
    expect(preview.subtitle).toBe('8-week chest, back focus');
    expect(preview.workouts.map((workout) => workout.name)).toEqual([
      'Upper A',
      'Lower A',
      'Upper B',
      'Lower B',
    ]);
  });

  it('uses standard split names for balanced and focused strength plans', () => {
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
      'Push',
      'Pull',
      'Legs',
    ]);
    expect(buildOnboardingProgramBlueprint(focusedSpec).workouts.map((workout) => workout.name)).toEqual([
      'Push',
      'Pull',
      'Legs',
    ]);
  });

  it('keeps standard split names for high-frequency focused plans', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 6,
      muscle_focuses: ['arms', 'shoulders', 'back'],
      fitness_goal: 'build_muscle',
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(spec).workouts.map((workout) => workout.name)).toEqual([
      'Push A',
      'Pull A',
      'Legs A',
      'Push B',
      'Pull B',
      'Legs B',
    ]);
  });

  it('formats selected muscle subtitles as a focus', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
      muscle_focuses: ['legs', 'arms', 'shoulders', 'back'],
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(spec).subtitle).toBe('8-week legs, arms, shoulders, back focus');
  });

  it('formats exact onboarding workout frequency for the preview summary', () => {
    expect(formatOnboardingFrequencySummary(3)).toBe('3 times a week');
    expect(formatOnboardingFrequencySummary(null)).toBeNull();
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

  it('prioritizes canonical equipment-based exercises for gym and hybrid plans', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 1,
      training_environment: 'gym',
      muscle_focuses: ['legs'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('body-squat', 'Bodyweight Squat', ['quadriceps'], 'Body Weight', {
        isCurated: true,
        canonicalId: null,
      }),
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine', {
        isCurated: true,
        canonicalId: null,
      }),
      exercise('barbell-squat', 'Barbell Squat', ['quadriceps'], 'Barbell', {
        isCurated: true,
        canonicalId: null,
      }),
      exercise('leg-extension-variant', 'Leg Extension Beginner', ['quadriceps'], 'Machine', {
        isCurated: false,
        canonicalId: 'leg-extension',
      }),
    ]);

    expect(payload?.workouts[0].exercises[0].exerciseName).toBe('Barbell Squat');
    expect(payload?.workouts[0].exercises.map((item) => item.exerciseName)).toContain('Leg Press');
  });

  it('prefers exercises with available media over similar exercises without media', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 1,
      training_environment: 'gym',
      muscle_focuses: ['legs'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('no-media-squat', 'Advanced Dumbbell Step Up', ['glutes'], 'Dumbbell', {
        images: [],
      }),
      exercise('squat', 'Barbell Squat', ['quadriceps'], 'Barbell', {
        images: ['barbell-squat.gif'],
      }),
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine', {
        images: ['leg-press.gif'],
      }),
      exercise('rdl', 'Romanian Deadlift', ['hamstrings'], 'Barbell', {
        images: ['rdl.gif'],
      }),
      exercise('calf-raise', 'Standing Calf Raise', ['calves'], 'Machine', {
        images: ['calf-raise.gif'],
      }),
      exercise('leg-curl', 'Seated Leg Curl', ['hamstrings'], 'Machine', {
        images: ['leg-curl.gif'],
      }),
    ]);

    const exerciseNames = payload?.workouts[0].exercises.map((item) => item.exerciseName) ?? [];
    expect(exerciseNames).toContain('Barbell Squat');
    expect(exerciseNames).not.toContain('Advanced Dumbbell Step Up');
  });

  it('excludes gym equipment from home generated programs', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 1,
      training_environment: 'home',
      muscle_focuses: ['legs'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('body-squat', 'Bodyweight Squat', ['quadriceps'], 'Body Weight'),
      exercise('db-lunge', 'Dumbbell Lunge', ['quadriceps'], 'Dumbbell'),
      exercise('band-leg-curl', 'Band Leg Curl', ['hamstrings'], 'Band'),
      exercise('kb-swing', 'Kettlebell Swing', ['glutes'], 'Kettlebell'),
      exercise('barbell-squat', 'Barbell Squat', ['quadriceps'], 'Barbell'),
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine'),
    ]);

    const exerciseNames = payload?.workouts.flatMap((workout) => workout.exercises.map((item) => item.exerciseName)) ?? [];
    expect(exerciseNames).toContain('Bodyweight Squat');
    expect(exerciseNames).toContain('Dumbbell Lunge');
    expect(exerciseNames).not.toContain('Barbell Squat');
    expect(exerciseNames).not.toContain('Leg Press');
  });

  it('uses selected muscles to bias standard split exercise selection', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
      training_environment: 'gym',
      muscle_focuses: ['arms', 'shoulders', 'back'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('barbell-bench', 'Barbell Bench Press', ['chest'], 'Barbell'),
      exercise('shoulder-press', 'Barbell Shoulder Press', ['shoulders'], 'Barbell'),
      exercise('lateral-raise', 'Cable Lateral Raise', ['shoulders'], 'Cable'),
      exercise('triceps-pushdown', 'Cable Triceps Pushdown', ['triceps'], 'Cable'),
      exercise('lat-pulldown', 'Lat Pulldown', ['lats'], 'Cable'),
      exercise('row', 'Seated Cable Row', ['middle back'], 'Cable'),
      exercise('curl', 'Dumbbell Curl', ['biceps'], 'Dumbbell'),
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine'),
      exercise('rdl', 'Romanian Deadlift', ['hamstrings'], 'Barbell'),
      exercise('calf-raise', 'Standing Calf Raise', ['calves'], 'Machine'),
    ]);

    expect(payload?.workouts.map((workout) => workout.name)).toEqual(['Push', 'Pull', 'Legs']);
    expect(payload?.workouts[0].exercises.map((item) => item.exerciseName)).toEqual(
      expect.arrayContaining(['Barbell Shoulder Press', 'Cable Triceps Pushdown'])
    );
    expect(payload?.workouts[0].exercises.slice(0, 3).map((item) => item.exerciseName)).not.toContain('Barbell Bench Press');
  });
});
