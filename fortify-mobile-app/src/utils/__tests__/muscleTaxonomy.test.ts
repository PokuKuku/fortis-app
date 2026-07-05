import {
  attributeExercisesToMuscles,
  attributeSessionToMuscles,
  attributeSessionSetsToMuscles,
  bucketIntensity,
  bucketWeeklyTierIntensity,
  normalizeMuscleArray,
} from '@/src/utils/muscleTaxonomy';
import type { Exercise } from '@/src/types/exercise';
import type { WorkoutSession } from '@/src/types/workout';

describe('muscleTaxonomy attribution', () => {
  it('attributes volume to muscles and buckets intensity levels', () => {
    const benchPress: Exercise = {
      id: 'ex-bench',
      name: 'Bench Press',
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps'],
      equipment: 'barbell',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const pullUp: Exercise = {
      id: 'ex-pullup',
      name: 'Pull-Up',
      primaryMuscles: ['lats'],
      secondaryMuscles: [],
      equipment: 'bodyweight',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const session: WorkoutSession = {
      localId: 'session-1',
      name: 'Sample Session',
      notes: '',
      startedAt: new Date('2025-01-01T10:00:00Z'),
      completedAt: new Date('2025-01-01T11:00:00Z'),
      exercises: [
        {
          localId: 'we-1',
          exerciseId: benchPress.id,
          exerciseName: benchPress.name,
          notes: '',
          orderIndex: 0,
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 100,
              weightUnit: 'lbs',
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
            {
              localId: 'set-2',
              setNumber: 2,
              setType: 'normal',
              weight: 100,
              weightUnit: 'lbs',
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 1,
            },
          ],
        },
        {
          localId: 'we-2',
          exerciseId: pullUp.id,
          exerciseName: pullUp.name,
          notes: '',
          orderIndex: 1,
          sets: [
            {
              localId: 'set-3',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              weightUnit: null,
              reps: 6,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
          ],
        },
      ],
      isSynced: false,
    };

    const exercisesById = new Map<string, Exercise>([
      [benchPress.id, benchPress],
      [pullUp.id, pullUp],
    ]);

    const scores = attributeSessionToMuscles(session, exercisesById, {
      bodyweightKg: 80,
      weightUnitByExercise: { [benchPress.id]: 'lbs' },
    });

    const levels = bucketIntensity(scores);

    expect(scores.chest).toBeGreaterThan(scores.lats ?? 0);
    expect(scores.lats ?? 0).toBeGreaterThan(scores.triceps ?? 0);
    expect(levels.chest).toBe(5);
    expect(levels.lats).toBe(3);
    expect(levels.triceps).toBe(3);
  });

  it('attributes weighted working sets into weekly tiers and ignores warmups', () => {
    const benchPress: Exercise = {
      id: 'ex-bench',
      name: 'Bench Press',
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps', 'front delts'],
      equipment: 'barbell',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const row: Exercise = {
      id: 'ex-row',
      name: 'Seated Cable Row',
      primaryMuscles: ['lats', 'upper back'],
      secondaryMuscles: ['biceps'],
      equipment: 'cable',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const session: WorkoutSession = {
      localId: 'session-2',
      name: 'Tier Session',
      notes: '',
      startedAt: new Date('2025-01-08T10:00:00Z'),
      completedAt: new Date('2025-01-08T11:00:00Z'),
      exercises: [
        {
          localId: 'we-bench',
          exerciseId: benchPress.id,
          exerciseName: benchPress.name,
          notes: '',
          orderIndex: 0,
          sets: [
            {
              localId: 'warmup',
              setNumber: 1,
              setType: 'warmup',
              weight: 95,
              weightUnit: 'lbs',
              reps: 10,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
            ...Array.from({ length: 13 }, (_, index) => ({
              localId: `bench-${index + 1}`,
              setNumber: index + 2,
              setType: 'normal' as const,
              weight: 135,
              weightUnit: 'lbs' as const,
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: index + 1,
            })),
          ],
        },
        {
          localId: 'we-row',
          exerciseId: row.id,
          exerciseName: row.name,
          notes: '',
          orderIndex: 1,
          sets: Array.from({ length: 8 }, (_, index) => ({
            localId: `row-${index + 1}`,
            setNumber: index + 1,
            setType: 'normal' as const,
            weight: 120,
            weightUnit: 'lbs' as const,
            reps: 10,
            rpe: null,
            restSeconds: null,
            notes: '',
            isCompleted: true,
            orderIndex: index,
          })),
        },
      ],
      isSynced: false,
    };

    const exercisesById = new Map<string, Exercise>([
      [benchPress.id, benchPress],
      [row.id, row],
    ]);

    const scores = attributeSessionSetsToMuscles(session, exercisesById);
    const levels = bucketWeeklyTierIntensity(scores);

    expect(scores.chest).toBe(13);
    expect(scores.triceps).toBe(3.25);
    expect(scores.front_delts).toBe(3.25);
    expect(scores.lats).toBe(4);
    expect(scores.upper_back).toBe(4);
    expect(scores.biceps).toBe(4);
    expect(levels.chest).toBe(5);
    expect(levels.lats).toBe(2);
    expect(levels.upper_back).toBe(2);
    expect(levels.biceps).toBe(2);
  });

  it('keeps adductors active for adduction exercises and heatmap scoring', () => {
    const adduction: Exercise = {
      id: 'ex-adduction',
      name: 'Lever Seated Hip Adduction',
      primaryMuscles: ['adductors'],
      secondaryMuscles: ['hamstrings', 'glutes'],
      equipment: 'machine',
      category: 'strength',
      instructions: [],
      images: [],
    };

    expect(normalizeMuscleArray(['adductors'])).toEqual(['adductors']);

    const scores = attributeExercisesToMuscles([adduction]);
    const levels = bucketIntensity(scores);

    expect(scores.adductors).toBe(1);
    expect(levels.adductors).toBe(5);
  });

  it('keeps abductors active for abduction exercises and heatmap scoring', () => {
    const abduction: Exercise = {
      id: 'ex-abduction',
      name: 'Lever Seated Hip Abduction',
      primaryMuscles: ['abductors'],
      secondaryMuscles: ['hamstrings', 'glutes'],
      equipment: 'machine',
      category: 'strength',
      instructions: [],
      images: [],
    };

    expect(normalizeMuscleArray(['abductors'])).toEqual(['abductors']);

    const scores = attributeExercisesToMuscles([abduction]);
    const levels = bucketIntensity(scores);

    expect(scores.abductors).toBe(1);
    expect(levels.abductors).toBe(5);
  });

  it('keeps hip flexors distinct from abs when normalizing core exercises', () => {
    const declineCrunch: Exercise = {
      id: 'ex-decline-crunch',
      name: 'Decline Crunch',
      primaryMuscles: ['abs'],
      secondaryMuscles: ['hip flexors'],
      equipment: 'body weight',
      category: 'strength',
      instructions: [],
      images: [],
    };

    expect(normalizeMuscleArray(['abs', 'hip flexors'])).toEqual(['abs', 'hip_flexors']);

    const scores = attributeExercisesToMuscles([declineCrunch]);

    expect(scores.abs).toBe(1);
    expect(scores.hip_flexors).toBe(0.5);
  });
});
