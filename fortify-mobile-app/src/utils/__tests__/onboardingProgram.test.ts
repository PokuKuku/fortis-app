import {
  buildDeterministicOnboardingProgram,
  buildOnboardingProgramBlueprint,
  buildOnboardingProgramSpec,
  formatOnboardingFrequencySummary,
  resolveOnboardingProgramName,
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
  images: [`${id}.gif`],
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
    expect(preview.name).toBe("Kwaku's program");
    expect(preview.environmentLabel).toBe('Hybrid');
    expect(preview.scheduleLabel).toBe('Mon, Tue, Thu, Sat');
    expect(preview.subtitle).toBe('10-week chest, back focus');
    expect(preview.workouts.map((workout) => workout.name)).toEqual([
      'Upper A',
      'Lower A',
      'Upper B',
      'Lower B',
    ]);
  });

  it('uses the custom onboarding program name before generated fallbacks', () => {
    const spec = buildOnboardingProgramSpec({
      full_name: 'Kwaku Bimpong',
      program_name: 'Project Iron',
      workouts_per_week: 3,
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(spec).name).toBe('Project Iron');
    expect(resolveOnboardingProgramName(spec, "Kwaku's Program")).toBe('Project Iron');
  });

  it('falls back to a generic onboarding program name when no first name is available', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
    } as OnboardingState);

    expect(buildOnboardingProgramBlueprint(spec).name).toBe('Your program');
    expect(resolveOnboardingProgramName(spec, 'AI Template Name')).toBe('Your program');
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

    expect(buildOnboardingProgramBlueprint(spec).subtitle).toBe('10-week legs, arms, shoulders, back focus');
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
    expect(payload?.name).toBe("Jason's program");
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

  it('excludes exercises without usable GIF media', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 1,
      training_environment: 'gym',
      muscle_focuses: ['legs'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('no-media-squat', 'Advanced Dumbbell Step Up', ['glutes'], 'Dumbbell', {
        images: [],
      }),
      exercise('static-image-lunge', 'Dumbbell Step-up Lunge', ['quadriceps'], 'Dumbbell', {
        images: ['dumbbell-step-up.png'],
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
    expect(exerciseNames).not.toContain('Dumbbell Step-up Lunge');
    expect(exerciseNames).toEqual(expect.arrayContaining(['Leg Press', 'Romanian Deadlift', 'Seated Leg Curl']));
  });

  it('returns fewer exercises instead of filling with non-GIF exercises', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 1,
      training_environment: 'gym',
      muscle_focuses: ['legs'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine', {
        images: ['leg-press.gif'],
      }),
      exercise('rdl', 'Romanian Deadlift', ['hamstrings'], 'Barbell', {
        images: ['rdl.gif'],
      }),
      exercise('static-calf-raise', 'Standing Calf Raise', ['calves'], 'Machine', {
        images: ['standing-calf-raise.jpg'],
      }),
      exercise('no-media-adduction', 'Cable Hip Adduction', ['adductors'], 'Cable', {
        images: [],
      }),
    ]);

    const exerciseNames = payload?.workouts[0].exercises.map((item) => item.exerciseName) ?? [];
    expect(exerciseNames).toEqual(['Leg Press', 'Romanian Deadlift']);
    expect(exerciseNames).not.toContain('Standing Calf Raise');
    expect(exerciseNames).not.toContain('Cable Hip Adduction');
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

  it('uses verified canonical ids over obscure GIF-backed variants across split days', () => {
    const spec = buildOnboardingProgramSpec({
      workouts_per_week: 3,
      training_environment: 'gym',
      muscle_focuses: ['balanced'],
    } as OnboardingState);
    const payload = buildDeterministicOnboardingProgram(spec, [
      exercise('obscure-bench', 'One Arm Dumbbell Bench Press', ['chest'], 'Dumbbell'),
      exercise('canonical-bench', 'Barbell Bench Press - Medium Grip', ['chest'], 'Barbell', {
        remoteId: 'a46f5273-d6ed-4de8-cfe2-1646dad01bc9',
      }),
      exercise('canonical-shoulder', 'Barbell Shoulder Press', ['shoulders'], 'Barbell', {
        remoteId: '00ce669e-1411-43de-d5a7-b7e85a160e30',
      }),
      exercise('canonical-lateral', 'Side Lateral Raise', ['shoulders'], 'Dumbbell', {
        remoteId: 'e89f2b37-4047-441b-21d4-072c0d03e98e',
      }),
      exercise('obscure-triceps', 'Reverse Grip Triceps Pushdown', ['triceps'], 'Cable'),
      exercise('canonical-triceps', 'Triceps Pushdown', ['triceps'], 'Cable', {
        remoteId: '697409e4-0b0a-464f-8ad1-054aa7b2117d',
      }),
      exercise('bench-pullup', 'Bench Pull-ups', ['lats'], 'Body Weight'),
      exercise('bodyweight-squat-row', 'Bodyweight Squatting Row', ['upper back'], 'Body Weight'),
      exercise('canonical-pulldown', 'Wide-Grip Lat Pulldown', ['lats'], 'Cable', {
        remoteId: '8f4e3f99-cd79-49a9-542c-0238df792506',
      }),
      exercise('canonical-row', 'Seated Cable Rows', ['middle back'], 'Cable', {
        remoteId: 'aec04e6f-add8-4ca0-847e-c7a4e4879a22',
      }),
      exercise('canonical-face-pull', 'Face Pull', ['rear delts'], 'Cable', {
        remoteId: 'cd6e3284-218f-4781-910b-8fe9ecc575aa',
      }),
      exercise('canonical-curl', 'Dumbbell Bicep Curl', ['biceps'], 'Dumbbell', {
        remoteId: '96dd46a4-976c-4c7e-dd21-2225fff1b258',
      }),
      exercise('canonical-squat', 'Barbell Squat', ['quadriceps'], 'Barbell', {
        remoteId: '6bd35c77-0093-4d84-f7fd-7f7a3834f226',
      }),
      exercise('obscure-hinge', 'Advanced Dumbbell Stiff Leg Deadlift', ['hamstrings'], 'Dumbbell'),
      exercise('canonical-rdl', 'Romanian Deadlift', ['hamstrings'], 'Barbell', {
        remoteId: '07bccaa6-d851-4d7d-29b5-f67980133235',
      }),
      exercise('obscure-calf', 'Dumbbell Seated One-Leg Calf Raise', ['calves'], 'Dumbbell'),
      exercise('canonical-calf-press', 'Calf Press On The Leg Press Machine', ['calves'], 'Machine', {
        remoteId: 'dd5de488-04ec-4c8f-8043-3ead36c31017',
      }),
      exercise('canonical-hip-thrust', 'Barbell Hip Thrust', ['glutes'], 'Barbell', {
        remoteId: '750b8c83-2f2c-4634-efc6-581de0628c32',
      }),
    ]);

    const pushNames = payload?.workouts[0].exercises.map((item) => item.exerciseName) ?? [];
    const pullNames = payload?.workouts[1].exercises.map((item) => item.exerciseName) ?? [];
    const legNames = payload?.workouts[2].exercises.map((item) => item.exerciseName) ?? [];

    expect(pushNames).toEqual(expect.arrayContaining([
      'Barbell Bench Press - Medium Grip',
      'Barbell Shoulder Press',
      'Side Lateral Raise',
      'Triceps Pushdown',
    ]));
    expect(pushNames).not.toContain('One Arm Dumbbell Bench Press');
    expect(pushNames).not.toContain('Reverse Grip Triceps Pushdown');
    expect(pullNames).toEqual(expect.arrayContaining([
      'Wide-Grip Lat Pulldown',
      'Seated Cable Rows',
      'Face Pull',
      'Dumbbell Bicep Curl',
    ]));
    expect(pullNames).not.toContain('Bench Pull-ups');
    expect(pullNames).not.toContain('Bodyweight Squatting Row');
    expect(legNames).toEqual(expect.arrayContaining([
      'Barbell Squat',
      'Romanian Deadlift',
      'Calf Press On The Leg Press Machine',
      'Barbell Hip Thrust',
    ]));
    expect(legNames).not.toContain('Advanced Dumbbell Stiff Leg Deadlift');
    expect(legNames).not.toContain('Dumbbell Seated One-Leg Calf Raise');
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
      exercise('bench-pullup', 'Bench Pull-ups', ['lats'], 'Body Weight'),
      exercise('bodyweight-squat-row-a', 'Bodyweight Squatting Row', ['upper back'], 'Body Weight'),
      exercise('bodyweight-squat-row-b', 'Bodyweight Squatting Row Variation', ['upper back'], 'Body Weight'),
      exercise('lat-pulldown', 'Lat Pulldown', ['lats'], 'Cable'),
      exercise('row', 'Seated Cable Row', ['middle back'], 'Cable'),
      exercise('machine-row', 'Machine Row', ['middle back'], 'Machine'),
      exercise('face-pull', 'Face Pull', ['rear delts'], 'Cable'),
      exercise('curl', 'Dumbbell Curl', ['biceps'], 'Dumbbell'),
      exercise('leg-press', 'Leg Press', ['quadriceps'], 'Machine'),
      exercise('rdl', 'Romanian Deadlift', ['hamstrings'], 'Barbell'),
      exercise('calf-raise', 'Standing Calf Raise', ['calves'], 'Machine'),
      exercise('leg-curl', 'Seated Leg Curl', ['hamstrings'], 'Machine'),
    ]);

    expect(payload?.workouts.map((workout) => workout.name)).toEqual(['Push', 'Pull', 'Legs']);
    expect(payload?.workouts[0].exercises.map((item) => item.exerciseName)).toEqual(
      expect.arrayContaining(['Barbell Bench Press', 'Barbell Shoulder Press', 'Cable Triceps Pushdown'])
    );
    const pullNames = payload?.workouts[1].exercises.map((item) => item.exerciseName) ?? [];
    expect(pullNames).toEqual(expect.arrayContaining(['Lat Pulldown', 'Face Pull', 'Dumbbell Curl']));
    expect(pullNames.some((name) => name === 'Seated Cable Row' || name === 'Machine Row')).toBe(true);
    expect(pullNames).not.toContain('Bench Pull-ups');
    expect(pullNames).not.toContain('Bodyweight Squatting Row');
    expect(payload?.workouts[2].exercises.map((item) => item.exerciseName)).toEqual(
      expect.arrayContaining(['Leg Press', 'Romanian Deadlift', 'Standing Calf Raise'])
    );
  });
});
