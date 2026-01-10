import {
  resolveExerciseQuery,
  buildTemplateExercisesFromProposal,
} from '../workoutProposal';
import type { ExerciseWithSource } from '@/src/types/exercise';
import type { WorkoutProposalV1 } from '@/src/types/ai';

const buildExercise = (overrides: Partial<ExerciseWithSource>): ExerciseWithSource => ({
  id: overrides.id || 'ex-1',
  name: overrides.name || 'Incline Dumbbell Press',
  primaryMuscles: overrides.primaryMuscles || ['Chest'],
  secondaryMuscles: overrides.secondaryMuscles || [],
  equipment: overrides.equipment || 'Dumbbell',
  category: overrides.category || 'Strength',
  instructions: overrides.instructions || [],
  images: overrides.images || [],
  aliases: overrides.aliases,
  canonicalKey: overrides.canonicalKey,
  normalizedName: overrides.normalizedName,
  source: overrides.source || 'api',
});

describe('resolveExerciseQuery', () => {
  const exercises: ExerciseWithSource[] = [
    buildExercise({
      id: 'ex-1',
      name: 'Incline Dumbbell Press',
      canonicalKey: 'incline-dumbbell-press',
      aliases: ['incline db press'],
    }),
    buildExercise({
      id: 'ex-2',
      name: 'Chest Supported Row',
      canonicalKey: 'chest-supported-row',
    }),
    buildExercise({
      id: 'ex-3',
      name: 'Chest Supported Row (Machine)',
      canonicalKey: 'chest-supported-row',
    }),
  ];

  it('resolves by canonical key', () => {
    const result = resolveExerciseQuery('incline dumbbell press', exercises);
    expect(result.status).toBe('resolved');
    expect(result.exercise?.id).toBe('ex-1');
  });

  it('resolves by alias', () => {
    const result = resolveExerciseQuery('incline db press', exercises);
    expect(result.status).toBe('resolved');
    expect(result.exercise?.name).toBe('Incline Dumbbell Press');
  });

  it('returns ambiguous when multiple matches exist', () => {
    const result = resolveExerciseQuery('chest supported row', exercises);
    expect(result.status).toBe('ambiguous');
    expect(result.candidates?.length).toBeGreaterThan(1);
  });

  it('returns missing when no matches exist', () => {
    const result = resolveExerciseQuery('made up lift', exercises);
    expect(result.status).toBe('missing');
  });
});

describe('buildTemplateExercisesFromProposal', () => {
  it('builds template exercises with notes and set summary', () => {
    const proposal: WorkoutProposalV1 = {
      type: 'WORKOUT_PROPOSAL_V1',
      title: 'Upper',
      exercises: [
        {
          exercise_query: 'Incline Dumbbell Press',
          sets: [
            { sets: 3, reps_min: 8, reps_max: 12, rest_sec: 120 },
            { sets: 1, reps_min: 6, reps_max: 8 },
          ],
          notes: 'Controlled eccentric.',
        },
      ],
    };

    const resolutions = [
      {
        query: 'Incline Dumbbell Press',
        status: 'resolved' as const,
        exercise: buildExercise({ id: 'ex-1', name: 'Incline Dumbbell Press' }),
      },
    ];

    const result = buildTemplateExercisesFromProposal(proposal, resolutions);
    expect(result).toHaveLength(1);
    expect(result[0].sets).toBe(4);
    expect(result[0].reps).toBe('8-12');
    expect(result[0].notes).toMatch('Controlled eccentric.');
    expect(result[0].notes).toMatch('Prescription:');
  });
});
